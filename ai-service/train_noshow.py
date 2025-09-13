import pandas as pd
from sklearn.linear_model import LogisticRegression
import pickle

# Synthetic dataset
data = pd.DataFrame({
    "age": [25, 40, 60, 35, 70],
    "distance": [2, 15, 5, 8, 20],
    "history_missed": [0, 2, 5, 1, 7],
    "weather_bad": [0, 1, 0, 0, 1],
    "no_show": [0, 1, 1, 0, 1]
})

X = data[["age", "distance", "history_missed", "weather_bad"]]
y = data["no_show"]

model = LogisticRegression()
model.fit(X, y)

pickle.dump(model, open("noshow_model.pkl", "wb"))
print("✅ No-show model trained and saved as noshow_model.pkl")
