import pickle
import numpy as np
from flask import Flask, request, jsonify
import random

app = Flask(__name__)

# Load trained a Decision Tree model
try:
    model = pickle.load(open("triage_model.pkl", "rb"))
    print("✅ ML model loaded successfully")
except FileNotFoundError:
    print("⚠️  Model file not found, using fallback rules")
    model = None

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
# Dummy No-Show Predictor
# -------------------------
@app.route("/noshow", methods=["POST"])
def noshow():
    data = request.json
    risk = round(random.uniform(0, 1), 2)  # probability 0.0 – 1.0
    return jsonify({"no_show_risk": risk})

if __name__ == "__main__":
    app.run(port=6000, debug=True)
