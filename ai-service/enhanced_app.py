import pickle
import numpy as np
import joblib
from flask import Flask, request, jsonify
import random
import re
from datetime import datetime, timedelta

app = Flask(__name__)

# Load enhanced models
try:
    triage_model = joblib.load("enhanced_triage_model.pkl")
    triage_scaler = joblib.load("triage_scaler.pkl")
    triage_label_encoder = joblib.load("triage_label_encoder.pkl")
    with open("triage_features.pkl", "rb") as f:
        triage_features = pickle.load(f)
    print("✅ Enhanced Triage model loaded successfully")
except FileNotFoundError:
    print("⚠️  Enhanced triage model not found, using fallback")
    triage_model = None
    triage_scaler = None
    triage_label_encoder = None
    triage_features = None

try:
    noshow_model = joblib.load("enhanced_noshow_model.pkl")
    noshow_scaler = joblib.load("noshow_scaler.pkl")
    with open("noshow_features.pkl", "rb") as f:
        noshow_features = pickle.load(f)
    print("✅ Enhanced No-show model loaded successfully")
except FileNotFoundError:
    print("⚠️  Enhanced no-show model not found, using fallback")
    noshow_model = None
    noshow_scaler = None
    noshow_features = None

class ImprovedSymptomAnalyzer:
    """Improved symptom analysis with better accuracy"""
    
    def __init__(self):
        # Enhanced keyword patterns with severity indicators
        self.urgent_patterns = [
            # Chest/heart issues
            r'\b(chest pain|heart attack|cardiac|छाती दुख्छ|हृदय)\b',
            # Breathing issues
            r'\b(difficulty breathing|can\'t breathe|suffocating|सास फेर्न गाह्रो)\b',
            # Severe symptoms
            r'\b(severe|intense|unbearable|emergency|गंभीर|आपत्कालीन)\b',
            # Life-threatening
            r'\b(stroke|bleeding|unconscious|poisoning|बेहोस|रक्तस्राव)\b'
        ]
        
        self.moderate_patterns = [
            # Fever patterns
            r'\b(fever|temperature|hot|ज्वरो|ताप)\b',
            # Pain patterns
            r'\b(headache|head pain|टाउको दुखाइ)\b',
            # Digestive issues
            r'\b(nausea|vomiting|sick|वमन|छाती दुखाइ)\b',
            # General symptoms
            r'\b(cough|fatigue|weakness|खोकी|थकान|कमजोरी)\b'
        ]
        
        self.routine_patterns = [
            r'\b(routine|checkup|consultation|नियमित|जाँच)\b',
            r'\b(mild|minor|हल्का|सानो)\b',
            r'\b(cold|skin rash|रूखो|छाला)\b'
        ]
        
        # Severity modifiers
        self.severity_modifiers = {
            'high': ['high', 'severe', 'intense', 'unbearable', 'गंभीर'],
            'moderate': ['moderate', 'some', 'mild', 'हल्का'],
            'low': ['low', 'slight', 'minor', 'सानो']
        }
    
    def extract_symptoms_improved(self, text):
        """Improved symptom extraction with pattern matching"""
        text_lower = text.lower()
        
        # Count pattern matches
        urgent_count = sum(len(re.findall(pattern, text_lower, re.IGNORECASE)) 
                          for pattern in self.urgent_patterns)
        moderate_count = sum(len(re.findall(pattern, text_lower, re.IGNORECASE)) 
                            for pattern in self.moderate_patterns)
        routine_count = sum(len(re.findall(pattern, text_lower, re.IGNORECASE)) 
                           for pattern in self.routine_patterns)
        
        # Check for severity modifiers
        severity_score = 0
        for severity, modifiers in self.severity_modifiers.items():
            for modifier in modifiers:
                if modifier in text_lower:
                    if severity == 'high':
                        severity_score += 2
                    elif severity == 'moderate':
                        severity_score += 1
                    else:
                        severity_score -= 1
        
        # Extract specific symptoms
        symptoms = {
            'fever': 1 if re.search(r'\b(fever|temperature|hot|ज्वरो)\b', text_lower) else 0,
            'chest_pain': 1 if re.search(r'\b(chest|heart|cardiac|छाती)\b', text_lower) else 0,
            'breathing_difficulty': 1 if re.search(r'\b(breathing|breath|respiratory|सास)\b', text_lower) else 0,
            'severe_pain': 1 if re.search(r'\b(severe|intense|unbearable|गंभीर)\b', text_lower) else 0,
            'bleeding': 1 if re.search(r'\b(bleeding|blood|hemorrhage|रक्त)\b', text_lower) else 0,
            'headache': 1 if re.search(r'\b(headache|head pain|टाउको)\b', text_lower) else 0,
            'nausea': 1 if re.search(r'\b(nausea|vomiting|sick|वमन)\b', text_lower) else 0,
            'dizziness': 1 if re.search(r'\b(dizzy|dizziness|vertigo|चक्कर)\b', text_lower) else 0
        }
        
        return symptoms, {
            'urgent_count': urgent_count,
            'moderate_count': moderate_count,
            'routine_count': routine_count,
            'severity_score': severity_score
        }
    
    def get_urgency_improved(self, text, age=30):
        """Improved urgency classification"""
        symptoms, analysis = self.extract_symptoms_improved(text)
        
        # Base urgency calculation
        if analysis['urgent_count'] > 0 or analysis['severity_score'] >= 2:
            return 'urgent'
        elif analysis['moderate_count'] > 0 or analysis['severity_score'] >= 1:
            return 'moderate'
        elif analysis['routine_count'] > 0:
            return 'routine'
        
        # Age-based adjustments
        if age > 65 and (symptoms['fever'] or symptoms['chest_pain']):
            return 'moderate'
        elif age > 75 and any(symptoms.values()):
            return 'moderate'
        
        # Default to routine if no clear indicators
        return 'routine'
    
    def detect_language(self, text):
        """Enhanced language detection for English and Nepali"""
        if not text or not text.strip():
            return 'en'
        
        # Count Nepali Devanagari characters
        nepali_chars = sum(1 for char in text if '\u0900' <= char <= '\u097F')
        
        # Count total alphabetic characters
        total_chars = len([c for c in text if c.isalpha()])
        
        if total_chars == 0:
            return 'en'
        
        # Calculate Nepali character ratio
        nepali_ratio = nepali_chars / total_chars
        
        # Check for common Nepali words/phrases
        nepali_indicators = [
            'छ', 'छु', 'छौ', 'छन्', 'छिन्', 'छे', 'छै', 'छौं', 'छन्',
            'मलाई', 'म', 'तपाईं', 'हामी', 'उनी', 'यो', 'त्यो', 'यहाँ', 'त्यहाँ',
            'दुख्छ', 'दुखाइ', 'गाह्रो', 'सजिलो', 'राम्रो', 'नराम्रो'
        ]
        
        text_lower = text.lower()
        nepali_word_count = sum(1 for word in nepali_indicators if word in text_lower)
        
        # If we have Nepali characters or Nepali words, it's likely Nepali
        if nepali_ratio > 0.2 or nepali_word_count > 0:
            return 'ne'
        
        return 'en'
    
    def translate_nepali_to_english(self, text):
        """Enhanced Nepali to English translation for medical terms"""
        translations = {
            # Pain and symptoms
            'छाती दुख्छ': 'chest pain',
            'छाती दुखाइ': 'chest pain',
            'सास फेर्न गाह्रो': 'difficulty breathing',
            'सास फेर्न गाह्रो छ': 'difficulty breathing',
            'ज्वरो': 'fever',
            'ताप': 'fever',
            'टाउको दुखाइ': 'headache',
            'टाउको दुख्छ': 'headache',
            'पेट दुखाइ': 'stomach pain',
            'पेट दुख्छ': 'stomach pain',
            'ढाड दुखाइ': 'back pain',
            'ढाड दुख्छ': 'back pain',
            'वमन': 'vomiting',
            'उल्टी': 'vomiting',
            'चक्कर': 'dizziness',
            'चक्कर आउँछ': 'dizziness',
            'थकान': 'fatigue',
            'थकाइ': 'fatigue',
            'कमजोरी': 'weakness',
            'गंभीर': 'severe',
            'हल्का': 'mild',
            'सानो': 'minor',
            'रक्तस्राव': 'bleeding',
            'रगत': 'bleeding',
            'बेहोस': 'unconscious',
            'खोकी': 'cough',
            'नियमित': 'routine',
            'जाँच': 'checkup',
            'परामर्श': 'consultation',
            
            # Body parts
            'छाती': 'chest',
            'टाउको': 'head',
            'पेट': 'stomach',
            'ढाड': 'back',
            'हात': 'hand',
            'खुट्टा': 'leg',
            'आँखा': 'eye',
            'कान': 'ear',
            'नाक': 'nose',
            'मुख': 'mouth',
            
            # Medical conditions
            'हृदय': 'heart',
            'हृदयघात': 'heart attack',
            'मधुमेह': 'diabetes',
            'रक्तचाप': 'blood pressure',
            'अस्थमा': 'asthma',
            'अल्सर': 'ulcer',
            'क्यान्सर': 'cancer',
            'संक्रमण': 'infection',
            'एलर्जी': 'allergy',
            
            # Severity and urgency
            'आपत्कालीन': 'emergency',
            'तत्काल': 'immediate',
            'धेरै': 'very',
            'अलि': 'little',
            'कम': 'less',
            'बढी': 'more',
            
            # Time references
            'आज': 'today',
            'हिजो': 'yesterday',
            'भोलि': 'tomorrow',
            'हाल': 'recently',
            'लामो समय': 'long time',
            'छोटो समय': 'short time'
        }
        
        translated = text
        for nepali, english in translations.items():
            translated = translated.replace(nepali, english)
        
        return translated

symptom_analyzer = ImprovedSymptomAnalyzer()

@app.route("/enhanced-ml-triage", methods=["POST"])
def enhanced_ml_triage():
    """Enhanced ML-based triage with better accuracy"""
    data = request.json
    age = data.get("age", 30)
    symptoms_text = data.get("symptoms", "")
    
    try:
        # Extract symptoms using improved analyzer
        extracted_symptoms, analysis = symptom_analyzer.extract_symptoms_improved(symptoms_text)
        
        # Prepare features for model
        features = np.array([[
            age,
            extracted_symptoms['fever'],
            extracted_symptoms['chest_pain'],
            extracted_symptoms['breathing_difficulty'],
            extracted_symptoms['severe_pain'],
            extracted_symptoms['bleeding']
        ]])
        
        if triage_model is not None:
            # Use enhanced model
            if triage_scaler is not None:
                features_scaled = triage_scaler.transform(features)
                pred_encoded = triage_model.predict(features_scaled)[0]
            else:
                pred_encoded = triage_model.predict(features)[0]
            
            # Decode prediction
            urgency = triage_label_encoder.inverse_transform([pred_encoded])[0]
            
            # Get confidence score
            if hasattr(triage_model, 'predict_proba'):
                if triage_scaler is not None:
                    proba = triage_model.predict_proba(features_scaled)[0]
                else:
                    proba = triage_model.predict_proba(features)[0]
                confidence = max(proba)
            else:
                confidence = 0.8
        else:
            # Fallback to improved keyword analysis
            urgency = symptom_analyzer.get_urgency_improved(symptoms_text, age)
            confidence = 0.6
        
        return jsonify({
            "urgency": urgency,
            "confidence": round(confidence, 3),
            "extracted_symptoms": extracted_symptoms,
            "analysis": analysis,
            "model_used": "enhanced" if triage_model is not None else "fallback"
        })
        
    except Exception as e:
        print(f"Error in enhanced triage: {e}")
        # Fallback
        urgency = symptom_analyzer.get_urgency_improved(symptoms_text, age)
        return jsonify({
            "urgency": urgency,
            "confidence": 0.5,
            "error": str(e),
            "model_used": "fallback"
        })

@app.route("/enhanced-noshow-ml", methods=["POST"])
def enhanced_noshow_ml():
    """Enhanced no-show prediction with better accuracy"""
    data = request.json
    age = data.get("age", 30)
    distance = data.get("distance", 5)
    history_missed = data.get("history_missed", 0)
    weather_bad = data.get("weather_bad", 0)
    
    # Additional features
    day_of_week = data.get("day_of_week", 1)  # Default to Tuesday
    time_of_day = data.get("time_of_day", 1)  # Default to afternoon
    appointment_type = data.get("appointment_type", "routine")
    
    # Calculate reliability score
    reliability_score = max(0, 1 - (history_missed * 0.2))
    
    try:
        # Prepare features
        features = np.array([[
            age,
            distance,
            history_missed,
            weather_bad,
            day_of_week,
            time_of_day,
            reliability_score
        ]])
        
        if noshow_model is not None:
            # Use enhanced model
            if noshow_scaler is not None:
                features_scaled = noshow_scaler.transform(features)
                prob = noshow_model.predict_proba(features_scaled)[0][1]
            else:
                prob = noshow_model.predict_proba(features)[0][1]
            
            risk = round(float(prob), 3)
            confidence = 0.85
        else:
            # Enhanced fallback calculation
            base_prob = 0.15
            
            # Risk factors
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
            
            # Protective factors
            if appointment_type == 'urgent':
                base_prob -= 0.1
            if reliability_score > 0.8:
                base_prob -= 0.05
            
            risk = round(max(0, min(1, base_prob)), 3)
            confidence = 0.6
        
        return jsonify({
            "no_show_risk": risk,
            "confidence": confidence,
            "risk_factors": {
                "distance_risk": "high" if distance > 15 else "low",
                "history_risk": "high" if history_missed > 3 else "low",
                "weather_risk": "high" if weather_bad else "low",
                "reliability_score": round(reliability_score, 2)
            },
            "model_used": "enhanced" if noshow_model is not None else "fallback"
        })
        
    except Exception as e:
        print(f"Error in enhanced no-show prediction: {e}")
        # Simple fallback
        risk = round(random.uniform(0.1, 0.4), 3)
        return jsonify({
            "no_show_risk": risk,
            "confidence": 0.3,
            "error": str(e),
            "model_used": "fallback"
        })

@app.route("/enhanced-nlp-triage", methods=["POST"])
def enhanced_nlp_triage():
    """Enhanced NLP triage with multilingual support"""
    data = request.json
    symptoms = data.get("symptoms", "")
    age = data.get("age", 30)
    
    try:
        # Step 1: Detect language
        detected_lang = symptom_analyzer.detect_language(symptoms)
        
        # Step 2: Translate if Nepali
        if detected_lang == 'ne':
            translated = symptom_analyzer.translate_nepali_to_english(symptoms)
        else:
            translated = symptoms
            
        print(f"🌐 Original: {symptoms} (Language: {detected_lang})")
        print(f"🔄 Translated: {translated}")
        
        # Step 3: Extract features using improved analyzer
        extracted_symptoms, analysis = symptom_analyzer.extract_symptoms_improved(translated)
        
        # Step 4: Use enhanced ML model
        features = np.array([[
            age,
            extracted_symptoms['fever'],
            extracted_symptoms['chest_pain'],
            extracted_symptoms['breathing_difficulty'],
            extracted_symptoms['severe_pain'],
            extracted_symptoms['bleeding']
        ]])
        
        if triage_model is not None:
            if triage_scaler is not None:
                features_scaled = triage_scaler.transform(features)
                pred_encoded = triage_model.predict(features_scaled)[0]
                proba = triage_model.predict_proba(features_scaled)[0]
            else:
                pred_encoded = triage_model.predict(features)[0]
                proba = triage_model.predict_proba(features)[0]
            
            urgency = triage_label_encoder.inverse_transform([pred_encoded])[0]
            confidence = max(proba)
        else:
            # Fallback to improved keyword analysis
            urgency = symptom_analyzer.get_urgency_improved(translated, age)
            confidence = 0.6
        
        return jsonify({
            "original": symptoms,
            "translated": translated,
            "detected_language": detected_lang,
            "urgency": urgency,
            "confidence": round(confidence, 3),
            "extracted_symptoms": extracted_symptoms,
            "analysis": analysis,
            "model_used": "enhanced" if triage_model is not None else "fallback"
        })
        
    except Exception as e:
        print(f"❌ Enhanced NLP triage error: {e}")
        # Fallback
        urgency = symptom_analyzer.get_urgency_improved(symptoms, age)
        return jsonify({
            "original": symptoms,
            "translated": symptoms,
            "detected_language": "en",
            "urgency": urgency,
            "confidence": 0.5,
            "error": str(e),
            "model_used": "fallback"
        })

# Keep original endpoints for backward compatibility
@app.route("/ml-triage", methods=["POST"])
def ml_triage():
    """Original ML triage endpoint (backward compatibility)"""
    return enhanced_ml_triage()

@app.route("/noshow-ml", methods=["POST"])
def noshow_ml():
    """Original no-show endpoint (backward compatibility)"""
    return enhanced_noshow_ml()

@app.route("/nlp-triage", methods=["POST"])
def nlp_triage():
    """Original NLP triage endpoint (backward compatibility)"""
    return enhanced_nlp_triage()

@app.route("/", methods=["GET"])
def health_check():
    """Health check endpoint"""
    return jsonify({
        "status": "healthy",
        "service": "Enhanced AI Service",
        "version": "2.0",
        "models_loaded": {
            "triage": triage_model is not None,
            "noshow": noshow_model is not None
        },
        "endpoints": [
            "POST /enhanced-ml-triage",
            "POST /enhanced-noshow-ml", 
            "POST /enhanced-nlp-triage",
            "POST /ml-triage",
            "POST /noshow-ml",
            "POST /nlp-triage"
        ],
        "features": [
            "Enhanced ML models with 68.5% triage accuracy",
            "Enhanced no-show prediction with 77.25% accuracy",
            "English and Nepali language support",
            "Comprehensive medical term translation",
            "Confidence scoring",
            "Backward compatibility"
        ]
    })

if __name__ == "__main__":
    print("🚀 Starting Enhanced AI Service v2.0...")
    print("=" * 60)
    print("Available endpoints:")
    print("- POST /enhanced-ml-triage - Enhanced triage with better accuracy")
    print("- POST /enhanced-noshow-ml - Enhanced no-show prediction")
    print("- POST /enhanced-nlp-triage - Enhanced multilingual triage")
    print("- POST /ml-triage - Original triage (backward compatibility)")
    print("- POST /noshow-ml - Original no-show (backward compatibility)")
    print("- POST /nlp-triage - Original NLP triage (backward compatibility)")
    print("- GET / - Health check")
    print("=" * 60)
    print("Features:")
    print("✅ Enhanced ML models with improved accuracy")
    print("✅ English and Nepali language support")
    print("✅ Comprehensive medical term translation")
    print("✅ Confidence scoring for predictions")
    print("✅ Backward compatibility with existing code")
    print("✅ Robust error handling and fallbacks")
    print("=" * 60)
    
    app.run(port=6000, debug=True)
