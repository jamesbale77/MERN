import re
import config

DANGER_PHRASES = ["suicide", "end my life", "kill myself", "want to die"]
DEPRESSION_PHRASES = ["feeling down", "lost interest", "depressed", "hopeless"]

def simple_similarity(text, phrases):
    text_lower = text.lower()
    max_score = 0.0
    for phrase in phrases:
        if phrase.lower() in text_lower:
            # Simple scoring: 1.0 if exact match, 0.8 if partial
            score = 1.0 if phrase.lower() == text_lower else 0.8
            max_score = max(max_score, score)
    return max_score

def check_message(text: str):
    danger_score = simple_similarity(text, DANGER_PHRASES)
    depression_score = simple_similarity(text, DEPRESSION_PHRASES)

    if danger_score >= config.DANGER_SIM_THRESHOLD:
        return "danger", danger_score
    elif depression_score >= config.DEPRESSION_SIM_THRESHOLD:
        return "depression", depression_score
    return "normal", max(danger_score, depression_score)