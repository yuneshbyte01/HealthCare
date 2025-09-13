import pandas as pd
from sklearn.tree import DecisionTreeClassifier
import pickle

# --- Step 1: Build synthetic dataset (can be replaced later with real data) ---
data = pd.DataFrame({
    "age": [25, 60, 45, 30, 70],
    "symptom_fever": [1, 0, 1, 1, 0],
    "symptom_chestpain": [0, 1, 0, 0, 1],
    "urgent": [0, 1, 0, 0, 1]  # target (1 = urgent, 0 = routine)
})

X = data[["age", "symptom_fever", "symptom_chestpain"]]
y = data["urgent"]

# --- Step 2: Train model ---
model = DecisionTreeClassifier()
model.fit(X, y)

# --- Step 3: Save model ---
pickle.dump(model, open("triage_model.pkl", "wb"))

print("✅ Triage model trained and saved as triage_model.pkl")
