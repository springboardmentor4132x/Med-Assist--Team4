"""Symptoms the app accepts.

PLACEHOLDER LIST: replace with the real symptom names once the team confirms
which dataset columns are used. This is not medical data.
Names use snake_case (e.g. body_pain), as in the project document.
"""

SYMPTOMS = [
    "fever", "headache", "cough", "sore_throat", "runny_nose",
    "body_pain", "fatigue", "nausea", "vomiting", "diarrhea",
    "chills", "shortness_of_breath", "chest_pain", "dizziness",
    "loss_of_appetite", "abdominal_pain", "muscle_pain", "joint_pain",
    "skin_rash", "itching", "sneezing", "loss_of_smell", "loss_of_taste",
    "back_pain", "swollen_glands", "sweating", "weight_loss",
    "blurred_vision", "ear_pain", "constipation",
]

# A "frozenset" is a fixed collection that can be checked very quickly.
SYMPTOM_SET = frozenset(SYMPTOMS)


def label(name: str) -> str:
    """'body_pain' -> 'Body pain' (the friendly text shown on screen)."""
    return name.replace("_", " ").capitalize()