import requests
import random
import os

API_BASE = "http://localhost:8000/api"

def main():
    print("=" * 60)
    print("  Testing DentalAI Pro HTTP API Endpoints")
    print("=" * 60)

    # 1. Register a new patient
    email = f"test_patient_{random.randint(1000, 9999)}@example.com"
    register_payload = {
        "name": "Test User",
        "email": email,
        "password": "Password123!",
        "role": "patient"
    }
    
    print(f"\n[1] Registering user: {email}...")
    reg_resp = requests.post(f"{API_BASE}/auth/register", json=register_payload)
    print(f"    Status Code: {reg_resp.status_code}")
    if reg_resp.status_code != 200:
        print("    Error:", reg_resp.json())
        return
    print("    Registered successfully!")

    # 2. Login user
    print(f"\n[2] Logging in user...")
    login_payload = {
        "username": email,
        "password": "Password123!"
    }
    log_resp = requests.post(f"{API_BASE}/auth/login", data=login_payload)
    print(f"    Status Code: {log_resp.status_code}")
    if log_resp.status_code != 200:
        print("    Error:", log_resp.json())
        return
    
    token_data = log_resp.json()
    token = token_data["access_token"]
    headers = {"Authorization": f"Bearer {token}"}
    print("    Logged in successfully! Token received.")

    # 3. Test Caries Upload
    caries_img = r"c:\Users\HP\OneDrive\Desktop\DentalPro\datasets\caries_prepared\Caries\1.jpg"
    print(f"\n[3] Testing Caries Upload from path: {caries_img}")
    with open(caries_img, "rb") as f:
        files = {"file": f}
        c_resp = requests.post(f"{API_BASE}/predict/caries", files=files, headers=headers)
        print(f"    Status Code: {c_resp.status_code}")
        if c_resp.status_code == 200:
            res_json = c_resp.json()
            pred = res_json["prediction_result"]
            print(f"    Prediction Label: {pred['label']}")
            print(f"    Confidence: {pred['confidence']}%")
            print(f"    Severity: {pred['severity']}")
        else:
            print("    Error:", c_resp.text)

    # 4. Test Orthodontic Upload
    ortho_img = r"c:\Users\HP\OneDrive\Desktop\DentalPro\datasets\orthodontics\Cephalometric Profile Dataset\Concave\001.jpg"
    print(f"\n[4] Testing Orthodontic Upload from path: {ortho_img}")
    with open(ortho_img, "rb") as f:
        files = {"file": f}
        o_resp = requests.post(f"{API_BASE}/predict/orthodontic", files=files, headers=headers)
        print(f"    Status Code: {o_resp.status_code}")
        if o_resp.status_code == 200:
            res_json = o_resp.json()
            pred = res_json["prediction_result"]
            print(f"    Prediction Label: {pred['label']}")
            print(f"    Confidence: {pred['confidence']}%")
            print(f"    Severity: {pred['severity']}")
        else:
            print("    Error:", o_resp.text)

    # 5. Test Oral Cancer Upload
    cancer_img = r"c:\Users\HP\OneDrive\Desktop\DentalPro\datasets\oral_cancer\dataset\Oral Cancer photos\001.jpeg"
    print(f"\n[5] Testing Oral Cancer Upload from path: {cancer_img}")
    with open(cancer_img, "rb") as f:
        files = {"file": f}
        ca_resp = requests.post(f"{API_BASE}/predict/oral_cancer", files=files, headers=headers)
        print(f"    Status Code: {ca_resp.status_code}")
        if ca_resp.status_code == 200:
            res_json = ca_resp.json()
            pred = res_json["prediction_result"]
            print(f"    Prediction Label: {pred['label']}")
            print(f"    Confidence: {pred['confidence']}%")
            print(f"    Severity: {pred['severity']}")
        else:
            print("    Error:", ca_resp.text)

    # 6. Test Health Index recalculation
    print(f"\n[6] Testing composite health index recalculation...")
    h_resp = requests.post(f"{API_BASE}/predict/generate-health-index", headers=headers)
    print(f"    Status Code: {h_resp.status_code}")
    if h_resp.status_code == 200:
        res_json = h_resp.json()
        print(f"    Total Health Score: {res_json['total_score']}/100")
        print(f"    Caries Score Component: {res_json['caries_score']} pts")
        print(f"    Ortho Score Component: {res_json['orthodontic_score']} pts")
        print(f"    Cancer Score Component: {res_json['cancer_score']} pts")
        print(f"    General Status: {res_json['status']}")
    else:
        print("    Error:", h_resp.text)

if __name__ == "__main__":
    main()
