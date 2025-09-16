import requests
import json

def test_quick():
    """Quick test of the enhanced AI models"""
    base_url = "http://localhost:6000"
    
    print("�� Quick Test of Enhanced AI Models")
    print("=" * 50)
    
    # Test 1: Enhanced Triage
    print("1. Testing Enhanced Triage...")
    try:
        response = requests.post(f"{base_url}/enhanced-ml-triage", json={
            "age": 65,
            "symptoms": "severe chest pain and difficulty breathing"
        })
        
        if response.status_code == 200:
            result = response.json()
            print(f"   ✅ Urgency: {result['urgency']}")
            print(f"   ✅ Confidence: {result['confidence']}")
            print(f"   ✅ Model: {result['model_used']}")
        else:
            print(f"   ❌ HTTP {response.status_code}")
    except Exception as e:
        print(f"   ❌ Error: {e}")
    
    # Test 2: Enhanced No-Show
    print("\n2. Testing Enhanced No-Show...")
    try:
        response = requests.post(f"{base_url}/enhanced-noshow-ml", json={
            "age": 35,
            "distance": 5,
            "history_missed": 0,
            "weather_bad": 0,
            "day_of_week": 2,
            "time_of_day": 1,
            "appointment_type": "routine"
        })
        
        if response.status_code == 200:
            result = response.json()
            print(f"   ✅ No-Show Risk: {result['no_show_risk']}")
            print(f"   ✅ Confidence: {result['confidence']}")
            print(f"   ✅ Model: {result['model_used']}")
        else:
            print(f"   ❌ HTTP {response.status_code}")
    except Exception as e:
        print(f"   ❌ Error: {e}")
    
    # Test 3: NLP Triage
    print("\n3. Testing NLP Triage...")
    try:
        response = requests.post(f"{base_url}/enhanced-nlp-triage", json={
            "age": 50,
            "symptoms": "मलाई छाती दुख्छ र सास फेर्न गाह्रो छ"
        })
        
        if response.status_code == 200:
            result = response.json()
            print(f"   ✅ Original: {result['original']}")
            print(f"   ✅ Translated: {result['translated']}")
            print(f"   ✅ Language: {result['detected_language']}")
            print(f"   ✅ Urgency: {result['urgency']}")
            print(f"   ✅ Confidence: {result['confidence']}")
        else:
            print(f"   ❌ HTTP {response.status_code}")
    except Exception as e:
        print(f"   ❌ Error: {e}")
    
    print("\n" + "=" * 50)
    print("✅ Quick test completed!")

if __name__ == "__main__":
    test_quick()
