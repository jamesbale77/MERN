import os

# Ollama / Chat model
OLLAMA_URL = os.getenv("OLLAMA_URL", "http://127.0.0.1:11434/api/generate")
OLLAMA_MODEL = os.getenv("OLLAMA_MODEL", "llama3.2-vision")

# Similarity thresholds
DANGER_SIM_THRESHOLD = float(os.getenv("DANGER_SIM_THRESHOLD", 0.55))
DEPRESSION_SIM_THRESHOLD = float(os.getenv("DEPRESSION_SIM_THRESHOLD", 0.45))

# SMS settings (Twilio or any API)
EMERGENCY_SMS_ENABLED = os.getenv("EMERGENCY_SMS_ENABLED", "false").lower() == "true"
TWILIO_ACCOUNT_SID = os.getenv("TWILIO_ACCOUNT_SID", "")
TWILIO_AUTH_TOKEN = os.getenv("TWILIO_AUTH_TOKEN", "")
TWILIO_FROM = os.getenv("TWILIO_FROM", "")
OWNER_PHONE = os.getenv("OWNER_PHONE", "")
