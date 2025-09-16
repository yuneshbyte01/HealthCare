import pandas as pd
import numpy as np
from sklearn.tree import DecisionTreeClassifier
from sklearn.linear_model import LogisticRegression
from sklearn.model_selection import train_test_split
from sklearn.metrics import accuracy_score, classification_report
import pickle
import pymongo
from datetime import datetime, timedelta
import os
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

def connect_to_mongodb():
    """Connect to MongoDB and return the logs collection"""
    try:
        client = pymongo.MongoClient(os.getenv('MONGO_URL', 'mongodb://localhost:27017/healthcare'))
        db = client.healthcare
        logs_collection = db.logs
        # Test the connection by trying to count documents
        logs_collection.count_documents({})
        print("✅ Connected to MongoDB")
        return logs_collection
    except Exception as e:
        print(f"❌ MongoDB connection failed: {e}")
        return None

def extract_features_from_logs(logs_collection):
    """Extract training features from MongoDB logs"""
    print("📊 Extracting features from logs...")
    
    # Get logs from the last 30 days
    thirty_days_ago = datetime.now() - timedelta(days=30)
    
    # Query logs for appointment bookings
    appointment_logs = logs_collection.find({
        "action": "BOOKED",
        "timestamp": {"$gte": thirty_days_ago}
    })
    
    triage_data = []
    noshow_data = []
    
    for log in appointment_logs:
        try:
            details = log.get('details', {})
            ai_results = details.get('ai_results', {})
            appointment = details.get('appointment', {})
            
            # Extract triage training data
            if 'urgency' in ai_results and appointment:
                # Simulate age and symptoms from appointment data
                # In production, you'd get this from patient profiles
                age = np.random.randint(20, 80)  # Simulated age
                fever = 1 if 'fever' in str(appointment).lower() else 0
                chestpain = 1 if 'chest' in str(appointment).lower() else 0
                
                urgency_label = 1 if ai_results['urgency'] == 'urgent' else 0
                
                triage_data.append({
                    'age': age,
                    'symptom_fever': fever,
                    'symptom_chestpain': chestpain,
                    'urgent': urgency_label
                })
            
            # Extract no-show training data
            if 'no_show_risk' in ai_results and appointment:
                # Simulate additional features
                age = np.random.randint(20, 80)
                distance = np.random.randint(1, 25)
                history_missed = np.random.randint(0, 5)
                weather_bad = np.random.randint(0, 2)
                
                # Use actual no-show risk as training target
                no_show_label = 1 if float(ai_results['no_show_risk']) > 0.5 else 0
                
                noshow_data.append({
                    'age': age,
                    'distance': distance,
                    'history_missed': history_missed,
                    'weather_bad': weather_bad,
                    'no_show': no_show_label
                })
                
        except Exception as e:
            print(f"⚠️  Error processing log: {e}")
            continue
    
    print(f"📈 Extracted {len(triage_data)} triage samples and {len(noshow_data)} no-show samples")
    return triage_data, noshow_data

def retrain_triage_model(triage_data):
    """Retrain the triage Decision Tree model"""
    if len(triage_data) < 5:
        print("⚠️  Insufficient triage data for retraining, using original model")
        return None
    
    print("🔄 Retraining triage model...")
    
    # Convert to DataFrame
    df = pd.DataFrame(triage_data)
    X = df[['age', 'symptom_fever', 'symptom_chestpain']]
    y = df['urgent']
    
    # Split data
    X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.2, random_state=42)
    
    # Train model
    model = DecisionTreeClassifier(random_state=42)
    model.fit(X_train, y_train)
    
    # Evaluate
    y_pred = model.predict(X_test)
    accuracy = accuracy_score(y_test, y_pred)
    print(f"📊 Triage model accuracy: {accuracy:.3f}")
    
    # Save model
    pickle.dump(model, open("triage_model.pkl", "wb"))
    print("✅ Triage model retrained and saved")
    
    return model

def retrain_noshow_model(noshow_data):
    """Retrain the no-show Logistic Regression model"""
    if len(noshow_data) < 5:
        print("⚠️  Insufficient no-show data for retraining, using original model")
        return None
    
    print("🔄 Retraining no-show model...")
    
    # Convert to DataFrame
    df = pd.DataFrame(noshow_data)
    X = df[['age', 'distance', 'history_missed', 'weather_bad']]
    y = df['no_show']
    
    # Split data
    X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.2, random_state=42)
    
    # Train model
    model = LogisticRegression(random_state=42)
    model.fit(X_train, y_train)
    
    # Evaluate
    y_pred = model.predict(X_test)
    accuracy = accuracy_score(y_test, y_pred)
    print(f"📊 No-show model accuracy: {accuracy:.3f}")
    
    # Save model
    pickle.dump(model, open("noshow_model.pkl", "wb"))
    print("✅ No-show model retrained and saved")
    
    return model
