from flask import Flask, request, render_template, jsonify
import requests
import time
import base64
import sqlite3
import config
from semantic_check import check_message
from sms_alert import send_alert

app = Flask(__name__)

# Initialize DB
def init_db():
    conn = sqlite3.connect('users.db')
    c = conn.cursor()
    c.execute('''CREATE TABLE IF NOT EXISTS users
                 (username TEXT PRIMARY KEY, password TEXT)''')
    conn.commit()
    conn.close()

init_db()

# Store flagged users in memory (replace with DB later)
flagged_users = {}

def forward_to_ollama(msg: str, images=None, model=None):
    if model is None:
        model = config.OLLAMA_MODEL
    
    payload = {"model": model, "prompt": msg, "stream": False}
    if images:
        payload["images"] = images

    try:
        res = requests.post(
            config.OLLAMA_URL,
            json=payload,
            timeout=600
        )
        if res.status_code == 404:
            return "(Ollama error: The vision model 'llama3.2-vision' is currently downloading. Please wait a bit before sending images!)"
        res.raise_for_status()
        return res.json().get("response", "").strip()
    except Exception as e:
        return f"(Ollama error: {e})"

# ---------- ROUTES ----------
@app.route("/")
def index():
    # Main landing page
    return render_template("index.html")

@app.route("/register", methods=["POST"])
def register():
    data = request.json if request.is_json else request.form
    username = data.get("username", "").strip()
    password = data.get("password", "").strip()

    if not username or not password:
        return jsonify({"error": "Username and password required"}), 400

    try:
        conn = sqlite3.connect('users.db')
        c = conn.cursor()
        c.execute("INSERT INTO users (username, password) VALUES (?, ?)", (username, password))
        conn.commit()
    except sqlite3.IntegrityError:
        return jsonify({"error": "Username already exists"}), 409
    finally:
        conn.close()
    
    return jsonify({"success": True})

@app.route("/login", methods=["POST"])
def login():
    data = request.json if request.is_json else request.form
    username = data.get("username", "").strip()
    password = data.get("password", "").strip()

    conn = sqlite3.connect('users.db')
    c = conn.cursor()
    c.execute("SELECT password FROM users WHERE username=?", (username,))
    row = c.fetchone()
    conn.close()

    if row and row[0] == password:
        return jsonify({"success": True, "username": username})
    return jsonify({"error": "Invalid username or password"}), 401

@app.route("/warning")
def warning_page():
    # Educational purpose warning page
    return render_template("warning.html")

@app.route("/chat")
def chat_page():
    # The actual chatbot interface page
    return render_template("chat.html")


@app.route("/chat", methods=["POST"])
def chat():
    # Handle both JSON and FormData
    if request.is_json:
        user = request.json.get("user", "anon")
        msg = request.json.get("msg", "")
        file = None
    else:
        user = request.form.get("user", "anon")
        msg = request.form.get("msg", "")
        file = request.files.get("file")

    images = None
    model_override = None

    if file:
        filename = file.filename.lower()
        if filename.endswith(".txt"):
            try:
                text_content = file.read().decode("utf-8")
                msg += f"\n\n[File Content: {filename}]\n{text_content}"
            except Exception as e:
                pass
        elif filename.endswith((".png", ".jpg", ".jpeg")):
            try:
                img_bytes = file.read()
                b64_img = base64.b64encode(img_bytes).decode("utf-8")
                images = [b64_img]
                model_override = "llama3.2-vision" # Force vision model
            except Exception as e:
                pass

    # Semantic risk check
    risk, score = check_message(msg)

    if risk == "danger":
        flagged_users[user] = {"msg": msg, "risk": "danger", "time": time.ctime()}
        send_alert(msg)
        return jsonify(reply="🚨 I'm worried about your safety. Please call a helpline or emergency services right now.")

    elif risk == "depression":
        flagged_users[user] = {"msg": msg, "risk": "depression", "time": time.ctime()}
        hidden_prompt = (
            "Ask the user subtle mood-check questions inspired by the PHQ-9 depression scale. "
            "Do not say it's a test. Be conversational and empathetic."
        )
        reply = forward_to_ollama(hidden_prompt + "\nUser: " + msg, images=images, model=model_override)
        return jsonify(reply=reply)

    else:
        reply = forward_to_ollama(msg, images=images, model=model_override)
        return jsonify(reply=reply)

if __name__ == "__main__":
    app.run(debug=True)
