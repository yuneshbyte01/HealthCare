import pandas as pd
import numpy as np
from sklearn.ensemble import RandomForestClassifier, GradientBoostingClassifier
from sklearn.linear_model import LogisticRegression
from sklearn.svm import SVC
from sklearn.neural_network import MLPClassifier
from sklearn.model_selection import train_test_split, cross_val_score, GridSearchCV
from sklearn.preprocessing import StandardScaler, LabelEncoder
from sklearn.metrics import classification_report, confusion_matrix, accuracy_score
import pickle
import joblib
from datetime import datetime, timedelta
import random

class EnhancedAITrainer:
    def __init__(self):
        self.scaler = StandardScaler()
        self.label_encoders = {}
        
    def generate_comprehensive_triage_data(self, n_samples=1000):
        """Generate comprehensive synthetic data for triage model"""
        np.random.seed(42)
        data = []
        
        # Define symptom patterns and their urgency levels
        symptom_patterns = {
            'urgent': [
                {'symptoms': ['chest pain', 'heart attack', 'stroke', 'severe bleeding', 'unconscious'],
                 'age_factor': 0.3, 'base_prob': 0.8},
                {'symptoms': ['difficulty breathing', 'severe headache', 'high fever', 'severe pain'],
                 'age_factor': 0.2, 'base_prob': 0.7},
                {'symptoms': ['allergic reaction', 'severe injury', 'poisoning'],
                 'age_factor': 0.1, 'base_prob': 0.9}
            ],
            'moderate': [
                {'symptoms': ['fever', 'cough', 'headache', 'nausea', 'vomiting'],
                 'age_factor': 0.15, 'base_prob': 0.4},
                {'symptoms': ['abdominal pain', 'back pain', 'joint pain'],
                 'age_factor': 0.1, 'base_prob': 0.3},
                {'symptoms': ['dizziness', 'fatigue', 'weakness'],
                 'age_factor': 0.2, 'base_prob': 0.35}
            ],
            'routine': [
                {'symptoms': ['cold', 'mild headache', 'minor injury', 'checkup'],
                 'age_factor': 0.05, 'base_prob': 0.1},
                {'symptoms': ['skin rash', 'mild pain', 'consultation'],
                 'age_factor': 0.02, 'base_prob': 0.05}
            ]
        }
        
        for _ in range(n_samples):
            age = np.random.randint(18, 85)
            gender = np.random.choice(['male', 'female'])
            
            # Select urgency level and symptoms
            urgency_level = np.random.choice(['urgent', 'moderate', 'routine'], 
                                           p=[0.15, 0.35, 0.5])
            
            pattern = np.random.choice(symptom_patterns[urgency_level])
            symptoms = np.random.choice(pattern['symptoms'])
            
            # Calculate urgency probability based on age and pattern
            age_factor = pattern['age_factor'] * (age / 80)
            urgency_prob = min(0.95, pattern['base_prob'] + age_factor)
            
            # Add some noise and create features
            fever = 1 if 'fever' in symptoms.lower() or np.random.random() < 0.3 else 0
            chest_pain = 1 if 'chest' in symptoms.lower() or 'heart' in symptoms.lower() else 0
            breathing_difficulty = 1 if 'breathing' in symptoms.lower() or 'breath' in symptoms.lower() else 0
            severe_pain = 1 if 'severe' in symptoms.lower() or 'pain' in symptoms.lower() else 0
            bleeding = 1 if 'bleeding' in symptoms.lower() or 'blood' in symptoms.lower() else 0
            
            # Determine final urgency
            if urgency_prob > 0.7:
                urgency = 'urgent'
            elif urgency_prob > 0.4:
                urgency = 'moderate'
            else:
                urgency = 'routine'
            
            data.append({
                'age': age,
                'gender': gender,
                'fever': fever,
                'chest_pain': chest_pain,
                'breathing_difficulty': breathing_difficulty,
                'severe_pain': severe_pain,
                'bleeding': bleeding,
                'symptoms_text': symptoms,
                'urgency': urgency,
                'urgency_score': urgency_prob
            })
        
        return pd.DataFrame(data)
    
    def generate_comprehensive_noshow_data(self, n_samples=2000):
        """Generate comprehensive synthetic data for no-show prediction"""
        np.random.seed(42)
        data = []
        
        for _ in range(n_samples):
            age = np.random.randint(18, 85)
            gender = np.random.choice(['male', 'female'])
            
            # Distance from clinic (km)
            distance = np.random.exponential(8)  # Most people live within 8km
            
            # History of missed appointments
            history_missed = np.random.poisson(1.5)  # Average 1.5 missed appointments
            
            # Weather conditions (0 = good, 1 = bad)
            weather_bad = np.random.choice([0, 1], p=[0.8, 0.2])
            
            # Day of week (0 = Monday, 6 = Sunday)
            day_of_week = np.random.randint(0, 7)
            
            # Time of day (0 = morning, 1 = afternoon, 2 = evening)
            time_of_day = np.random.randint(0, 3)
            
            # Appointment type
            appointment_type = np.random.choice(['routine', 'follow_up', 'urgent'], 
                                              p=[0.6, 0.3, 0.1])
            
            # Patient reliability score (based on history)
            reliability_score = max(0, 1 - (history_missed * 0.2))
            
            # Calculate no-show probability
            base_prob = 0.15  # Base 15% no-show rate
            
            # Factors that increase no-show probability
            if distance > 15:
                base_prob += 0.1
            if history_missed > 3:
                base_prob += 0.2
            if weather_bad:
                base_prob += 0.1
            if day_of_week == 6:  # Sunday
                base_prob += 0.05
            if time_of_day == 2:  # Evening
                base_prob += 0.05
            if age > 70:
                base_prob += 0.05
            
            # Factors that decrease no-show probability
            if appointment_type == 'urgent':
                base_prob -= 0.1
            if reliability_score > 0.8:
                base_prob -= 0.05
            
            # Ensure probability is between 0 and 1
            no_show_prob = max(0, min(1, base_prob))
            
            # Determine if patient will show up
            no_show = 1 if np.random.random() < no_show_prob else 0
            
            data.append({
                'age': age,
                'gender': gender,
                'distance': distance,
                'history_missed': history_missed,
                'weather_bad': weather_bad,
                'day_of_week': day_of_week,
                'time_of_day': time_of_day,
                'appointment_type': appointment_type,
                'reliability_score': reliability_score,
                'no_show': no_show,
                'no_show_probability': no_show_prob
            })
        
        return pd.DataFrame(data)
    
    def train_enhanced_triage_model(self):
        """Train enhanced triage model with multiple algorithms"""
        print("🏥 Training Enhanced Triage Model...")
        
        # Generate comprehensive data
        df = self.generate_comprehensive_triage_data(1000)
        
        # Prepare features
        feature_columns = ['age', 'fever', 'chest_pain', 'breathing_difficulty', 
                          'severe_pain', 'bleeding']
        X = df[feature_columns]
        y = df['urgency']
        
        # Encode target variable
        le = LabelEncoder()
        y_encoded = le.fit_transform(y)
        self.label_encoders['urgency'] = le
        
        # Split data
        X_train, X_test, y_train, y_test = train_test_split(X, y_encoded, 
                                                          test_size=0.2, 
                                                          random_state=42)
        
        # Scale features
        X_train_scaled = self.scaler.fit_transform(X_train)
        X_test_scaled = self.scaler.transform(X_test)
        
        # Define models to test
        models = {
            'Random Forest': RandomForestClassifier(n_estimators=100, random_state=42),
            'Gradient Boosting': GradientBoostingClassifier(random_state=42),
            'SVM': SVC(probability=True, random_state=42),
            'Neural Network': MLPClassifier(hidden_layer_sizes=(100, 50), 
                                          max_iter=1000, random_state=42),
            'Logistic Regression': LogisticRegression(random_state=42)
        }
        
        best_model = None
        best_score = 0
        best_name = ""
        
        # Train and evaluate models
        for name, model in models.items():
            print(f"Training {name}...")
            
            if name in ['SVM', 'Neural Network', 'Logistic Regression']:
                model.fit(X_train_scaled, y_train)
                y_pred = model.predict(X_test_scaled)
                score = accuracy_score(y_test, y_pred)
            else:
                model.fit(X_train, y_train)
                y_pred = model.predict(X_test)
                score = accuracy_score(y_test, y_pred)
            
            print(f"{name} Accuracy: {score:.4f}")
            
            if score > best_score:
                best_score = score
                best_model = model
                best_name = name
        
        print(f"\n🏆 Best Model: {best_name} with accuracy: {best_score:.4f}")
        
        # Save best model
        if best_name in ['SVM', 'Neural Network', 'Logistic Regression']:
            joblib.dump(best_model, 'enhanced_triage_model.pkl')
            joblib.dump(self.scaler, 'triage_scaler.pkl')
        else:
            joblib.dump(best_model, 'enhanced_triage_model.pkl')
        
        joblib.dump(self.label_encoders['urgency'], 'triage_label_encoder.pkl')
        
        # Save feature names
        with open('triage_features.pkl', 'wb') as f:
            pickle.dump(feature_columns, f)
        
        print("✅ Enhanced triage model saved!")
        return best_model, best_score
    
    def train_enhanced_noshow_model(self):
        """Train enhanced no-show prediction model"""
        print("📅 Training Enhanced No-Show Model...")
        
        # Generate comprehensive data
        df = self.generate_comprehensive_noshow_data(2000)
        
        # Prepare features
        feature_columns = ['age', 'distance', 'history_missed', 'weather_bad', 
                          'day_of_week', 'time_of_day', 'reliability_score']
        X = df[feature_columns]
        y = df['no_show']
        
        # Split data
        X_train, X_test, y_train, y_test = train_test_split(X, y, 
                                                          test_size=0.2, 
                                                          random_state=42)
        
        # Scale features
        X_train_scaled = self.scaler.fit_transform(X_train)
        X_test_scaled = self.scaler.transform(X_test)
        
        # Define models to test
        models = {
            'Random Forest': RandomForestClassifier(n_estimators=200, random_state=42),
            'Gradient Boosting': GradientBoostingClassifier(n_estimators=200, random_state=42),
            'Logistic Regression': LogisticRegression(random_state=42),
            'Neural Network': MLPClassifier(hidden_layer_sizes=(100, 50), 
                                          max_iter=1000, random_state=42)
        }
        
        best_model = None
        best_score = 0
        best_name = ""
        
        # Train and evaluate models
        for name, model in models.items():
            print(f"Training {name}...")
            
            if name in ['Logistic Regression', 'Neural Network']:
                model.fit(X_train_scaled, y_train)
                y_pred = model.predict(X_test_scaled)
                y_pred_proba = model.predict_proba(X_test_scaled)[:, 1]
            else:
                model.fit(X_train, y_train)
                y_pred = model.predict(X_test)
                y_pred_proba = model.predict_proba(X_test)[:, 1]
            
            score = accuracy_score(y_test, y_pred)
            print(f"{name} Accuracy: {score:.4f}")
            
            if score > best_score:
                best_score = score
                best_model = model
                best_name = name
        
        print(f"\n🏆 Best Model: {best_name} with accuracy: {best_score:.4f}")
        
        # Save best model
        if best_name in ['Logistic Regression', 'Neural Network']:
            joblib.dump(best_model, 'enhanced_noshow_model.pkl')
            joblib.dump(self.scaler, 'noshow_scaler.pkl')
        else:
            joblib.dump(best_model, 'enhanced_noshow_model.pkl')
        
        # Save feature names
        with open('noshow_features.pkl', 'wb') as f:
            pickle.dump(feature_columns, f)
        
        print("✅ Enhanced no-show model saved!")
        return best_model, best_score

if __name__ == "__main__":
    trainer = EnhancedAITrainer()
    
    print("🚀 Starting Enhanced AI Model Training...")
    print("=" * 50)
    
    # Train triage model
    triage_model, triage_score = trainer.train_enhanced_triage_model()
    
    print("\n" + "=" * 50)
    
    # Train no-show model
    noshow_model, noshow_score = trainer.train_enhanced_noshow_model()
    
    print("\n" + "=" * 50)
    print("🎉 Training Complete!")
    print(f"Triage Model Accuracy: {triage_score:.4f}")
    print(f"No-Show Model Accuracy: {noshow_score:.4f}")
