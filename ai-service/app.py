import pickle
import numpy as np
from flask import Flask, request, jsonify
import random
from googletrans import Translator

app = Flask(__name__)

# Initialize translator for multilingual support
translator = Translator()

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
# Legacy Triage Endpoint (for backward compatibility)
# -------------------------
@app.route("/triage", methods=["POST"])
def triage():
    data = request.json
    symptoms = data.get("symptoms", "").lower()

    # Simple rules (to be replaced by ML model later)
    if "chest pain" in symptoms:
        urgency = "urgent"
    elif "fever" in symptoms:
        urgency = "moderate"
    else:
        urgency = "routine"

    return jsonify({"urgency": urgency})

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

# -------------------------
# Legacy Dummy No-Show Predictor (for backward compatibility)
# -------------------------
@app.route("/noshow", methods=["POST"])
def noshow():
    data = request.json
    risk = round(random.uniform(0, 1), 2)  # probability 0.0 – 1.0
    return jsonify({"no_show_risk": risk})

# -------------------------
# NLP Triage with Multilingual Support
# -------------------------
@app.route("/nlp-triage", methods=["POST"])
def nlp_triage():
    data = request.json
    symptoms = data.get("symptoms", "")
    age = data.get("age", 30)
    
    try:
        # Step 1: Auto-detect language and translate to English
        detected = translator.detect(symptoms)
        if detected.lang != 'en':
            translated = translator.translate(symptoms, src=detected.lang, dest="en").text
        else:
            translated = symptoms
            
        print(f"🌐 Original: {symptoms} (Language: {detected.lang})")
        print(f"🔄 Translated: {translated}")
        
        # Step 2: Extract features for ML model
        fever = 1 if "fever" in translated.lower() else 0
        chestpain = 1 if "chest pain" in translated.lower() or "chest hurts" in translated.lower() else 0
        
        # Step 3: Use ML model for triage
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
            "translated": translated,
            "detected_language": detected.lang,
            "urgency": urgency,
            "features": {
                "age": age,
                "fever": bool(fever),
                "chest_pain": bool(chestpain)
            }
        })
        
    except Exception as e:
        print(f"❌ Translation error: {e}")
        # Fallback to simple English processing
        fever = 1 if "fever" in symptoms.lower() else 0
        chestpain = 1 if "chest pain" in symptoms.lower() else 0
        
        if chestpain:
            urgency = "urgent"
        elif fever:
            urgency = "moderate"
        else:
            urgency = "routine"
            
        return jsonify({
            "original": symptoms,
            "translated": symptoms,
            "detected_language": "en",
            "urgency": urgency,
            "error": "Translation failed, using fallback"
        })

if __name__ == "__main__":
    app.run(port=6000, debug=True)
