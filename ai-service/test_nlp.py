#!/usr/bin/env python3
"""
Test script for NLP triage endpoint
Tests multilingual symptom input and translation
"""

import requests
import json

def test_nlp_triage():
    """Test the NLP triage endpoint with various inputs"""
    
    base_url = "http://localhost:6000"
    
    # Test cases with different languages
    test_cases = [
        {
            "name": "English - Chest Pain",
            "data": {"age": 45, "symptoms": "I have chest pain and difficulty breathing"},
            "expected_urgency": "urgent"
        },
        {
            "name": "English - Fever",
            "data": {"age": 30, "symptoms": "I have a high fever and headache"},
            "expected_urgency": "moderate"
        },
        {
            "name": "Nepali - Chest Pain (मेरो छाती दुख्छ)",
            "data": {"age": 50, "symptoms": "मेरो छाती दुख्छ र सास फेर्न गाह्रो छ"},
            "expected_urgency": "urgent"
        },
        {
            "name": "Nepali - Fever (ज्वरो)",
            "data": {"age": 25, "symptoms": "मलाई ज्वरो लागेको छ र टाउको दुख्छ"},
            "expected_urgency": "moderate"
        },
        {
            "name": "Routine Symptoms",
            "data": {"age": 35, "symptoms": "I have a mild headache"},
            "expected_urgency": "routine"
        }
    ]
    
    print("🧪 Testing NLP Triage Endpoint")
    print("=" * 50)
    
    for test_case in test_cases:
        print(f"\n📋 Test: {test_case['name']}")
        print(f"Input: {test_case['data']['symptoms']}")
        
        try:
            response = requests.post(
                f"{base_url}/nlp-triage",
                json=test_case['data'],
                headers={"Content-Type": "application/json"},
                timeout=10
            )
            
            if response.status_code == 200:
                result = response.json()
                print(f"✅ Status: {response.status_code}")
                print(f"🌐 Original: {result.get('original', 'N/A')}")
                print(f"🔄 Translated: {result.get('translated', 'N/A')}")
                print(f"🗣️ Language: {result.get('detected_language', 'N/A')}")
                print(f"⚡ Urgency: {result.get('urgency', 'N/A')}")
                print(f"🔍 Features: {result.get('features', {})}")
                
                # Check if urgency matches expectation
                if result.get('urgency') == test_case['expected_urgency']:
                    print(f"✅ Expected urgency: {test_case['expected_urgency']} ✓")
                else:
                    print(f"⚠️ Expected: {test_case['expected_urgency']}, Got: {result.get('urgency')}")
                    
            else:
                print(f"❌ Error: {response.status_code}")
                print(f"Response: {response.text}")
                
        except requests.exceptions.ConnectionError:
            print("❌ Connection Error: AI service not running on port 6000")
            print("💡 Start the AI service with: python app.py")
            break
        except Exception as e:
            print(f"❌ Error: {e}")
    
    print("\n" + "=" * 50)
    print("🏁 NLP Triage Testing Complete")

if __name__ == "__main__":
    test_nlp_triage()
