import pickle
import numpy as np
from flask import Flask, request, jsonify
import random

app = Flask(__name__)

# Load trained Decision Tree model for triage
try:
    model = pickle.load(open("triage_model.pkl", "rb"))
    print("✅ Triage ML model loaded successfully")
except FileNotFoundError:
    print("⚠️  Triage model file not found, using fallback rules")
    model = None

# Load trained Logistic Regression model for no-show prediction
try:
    noshow_model = pickle.load(open("noshow_model.pkl", "rb"))
    print("✅ No-show ML model loaded successfully")
except FileNotFoundError:
    print("⚠️  No-show model file not found, using fallback rules")
    noshow_model = None

# -------------------------
# ML-based Triage Classifier
# -------------------------
@app.route("/ml-triage", methods=["POST"])
def ml_triage():
    data = request.json
    age = data.get("age", 30)
    fever = 1 if data.get("fever", False) else 0
    chestpain = 1 if data.get("chestpain", False) else 0

    if model is not None:
        features = np.array([[age, fever, chestpain]])
        pred = model.predict(features)[0]
        urgency = "urgent" if pred == 1 else "routine"
    else:
        # Fallback to simple rules if model not available
        if chestpain:
            urgency = "urgent"
        elif fever:
            urgency = "moderate"
        else:
            urgency = "routine"

    return jsonify({"urgency": urgency})

# -------------------------
# NLP Triage with Simple Multilingual Support (No Translation Library)
# -------------------------
@app.route("/nlp-triage", methods=["POST"])
def nlp_triage():
    data = request.json
    symptoms = data.get("symptoms", "")
    age = data.get("age", 30)
    
    # Simple keyword detection for common symptoms in English and Nepali
    symptoms_lower = symptoms.lower()
    
    # Detect language based on character set
    has_nepali_chars = any('\u0900' <= char <= '\u097F' for char in symptoms)
    detected_language = "ne" if has_nepali_chars else "en"
    
    # Simple translation mapping for common symptoms
    nepali_to_english = {
        "छाती": "chest",
        "दुख्छ": "pain",
        "ज्वरो": "fever",
        "टाउको": "head",
        "सास": "breath",
        "गाह्रो": "difficult"
    }
    
    # Convert Nepali keywords to English for processing
    translated_symptoms = symptoms_lower
    if has_nepali_chars:
        for nepali, english in nepali_to_english.items():
            translated_symptoms = translated_symptoms.replace(nepali, english)
    
    print(f"🌐 Original: {symptoms} (Language: {detected_language})")
    print(f"🔄 Processed: {translated_symptoms}")
    
    # Extract features for ML model
    fever = 1 if "fever" in translated_symptoms or "ज्वरो" in symptoms else 0
    chestpain = 1 if ("chest" in translated_symptoms and "pain" in translated_symptoms) or "छाती" in symptoms else 0
    
    # Use ML model for triage
    if model is not None:
        features = np.array([[age, fever, chestpain]])
        pred = model.predict(features)[0]
        urgency = "urgent" if pred == 1 else "routine"
    else:
        # Fallback to simple rules if model not available
        if chestpain:
            urgency = "urgent"
        elif fever:
            urgency = "moderate"
        else:
            urgency = "routine"
    
    return jsonify({
        "original": symptoms,
        "translated": translated_symptoms,
        "detected_language": detected_language,
        "urgency": urgency,
        "features": {
            "age": age,
            "fever": bool(fever),
            "chest_pain": bool(chestpain)
        }
    })

# -------------------------
# ML-based No-Show Predictor
# -------------------------
@app.route("/noshow-ml", methods=["POST"])
def noshow_ml():
    data = request.json
    age = data.get("age", 30)
    distance = data.get("distance", 5)
    history_missed = data.get("history_missed", 0)
    weather_bad = data.get("weather_bad", 0)

    if noshow_model is not None:
        features = [[age, distance, history_missed, weather_bad]]
        prob = noshow_model.predict_proba(features)[0][1]  # probability of no-show
        risk = round(float(prob), 2)
    else:
        # Fallback to random if model not available
        risk = round(random.uniform(0, 1), 2)

    return jsonify({"no_show_risk": risk})

if __name__ == "__main__":
    app.run(port=6000, debug=True)
