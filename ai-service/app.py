from flask import Flask, request, jsonify
import random

app = Flask(__name__)

# -------------------------
# Dummy Triage Classifier
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
