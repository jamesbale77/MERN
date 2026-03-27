from twilio.rest import Client
import config

def send_alert(user_msg):
    if not config.EMERGENCY_SMS_ENABLED:
        print("⚠️ SMS disabled. Would send:", user_msg)
        return

    try:
        client = Client(config.TWILIO_ACCOUNT_SID, config.TWILIO_AUTH_TOKEN)
        client.messages.create(
            body=f"🚨 Crisis Alert: User said -> {user_msg}",
            from_=config.TWILIO_FROM,
            to=config.OWNER_PHONE
        )
        print("✅ SMS alert sent.")
    except Exception as e:
        print("❌ SMS error:", e)
