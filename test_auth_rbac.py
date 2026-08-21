import requests
import json
import base64
import hmac
import hashlib
import os

BASE_URL = "http://127.0.0.1:5000/api"

def make_jwt(payload, secret=None):
    """Generates a valid JWT token string using Python standard library."""
    if not secret:
        secret = os.environ.get('JWT_SECRET', 'super_secret_jwt_key_change_in_production')
    header = {"alg": "HS256", "typ": "JWT"}
    
    def b64url(data):
        return base64.urlsafe_b64encode(json.dumps(data).encode()).rstrip(b'=').decode()

    h_b64 = b64url(header)
    p_b64 = b64url(payload)
    sig_input = f"{h_b64}.{p_b64}".encode()
    
    sig = hmac.new(secret.encode(), sig_input, hashlib.sha256).digest()
    sig_b64 = base64.urlsafe_b64encode(sig).rstrip(b'=').decode()
    return f"{h_b64}.{p_b64}.{sig_b64}"

def run_tests():
    print("============================================================")
    print("RUNNING AUTHENTICATION, AUTHORIZATION & RBAC SECURITY TESTS")
    print("============================================================")

    # 1. Unauthenticated Video Analysis Request -> Must return 401 "Authentication required."
    res = requests.post(f"{BASE_URL}/analysis/analyze", json={"videoUrl": "https://res.cloudinary.com/demo/video/upload/dog.mp4"})
    print(f"\n1. Unauthenticated Analysis Request Status: {res.status_code}")
    print(f"   Response JSON: {res.json()}")
    assert res.status_code == 401, "Expected 401 for unauthenticated request"
    assert "Authentication required" in res.json().get("message", "")

    # 2. Registration with client trying to forge role="admin"
    reg_payload = {
        "name": "Test Athlete User",
        "email": "testathlete@gmail.com",
        "password": "password123",
        "role": "admin"  # Client trying to forge admin role
    }
    res = requests.post(f"{BASE_URL}/auth/register", json=reg_payload)
    if res.status_code == 400: # Already exists, login instead
        res = requests.post(f"{BASE_URL}/auth/login", json={"email": "testathlete@gmail.com", "password": "password123"})
    
    print(f"\n2. Registration/Login Status: {res.status_code}")
    athlete_data = res.json()
    athlete_token = athlete_data.get("token")
    athlete_role = athlete_data.get("user", {}).get("role")
    print(f"   Assigned Role by Backend: '{athlete_role}' (Client sent 'admin')")
    assert athlete_role == "athlete", "Backend MUST enforce role='athlete' on public registration!"

    # 3. Authenticated Athlete Video Analysis Request -> Allowed (200 OK)
    headers_athlete = {"Authorization": f"Bearer {athlete_token}"}
    res = requests.post(f"{BASE_URL}/analysis/analyze", json={"videoUrl": "https://res.cloudinary.com/demo/video/upload/dog.mp4"}, headers=headers_athlete)
    print(f"\n3. Authenticated Athlete Video Analysis Status: {res.status_code}")
    assert res.status_code == 200, f"Expected 200 for athlete video analysis, got {res.status_code}"
    analysis_id = res.json().get("analysisId")
    print(f"   Analysis Completed! Stroke: {res.json().get('data', {}).get('prediction', {}).get('stroke')}")

    # 4. Admin Restriction Testing
    # First try logging in as seeded admin
    admin_email = os.environ.get("ADMIN_EMAIL", "admin@gmail.com")
    admin_password = os.environ.get("ADMIN_PASSWORD", "admin123")
    res_admin = requests.post(f"{BASE_URL}/auth/login", json={"email": admin_email, "password": admin_password})
    
    if res_admin.status_code == 200:
        admin_token = res_admin.json().get("token")
    else:
        # Fallback JWT with admin role
        admin_token = make_jwt({"id": "60d5ecb8b5c9c22b00000099", "name": "Admin User", "role": "admin"})

    headers_admin = {"Authorization": f"Bearer {admin_token}"}
    
    # Admin attempting Video Analysis -> Must return 403 Forbidden "Video analysis is available only to athletes."
    res = requests.post(f"{BASE_URL}/analysis/analyze", json={"videoUrl": "https://res.cloudinary.com/demo/video/upload/dog.mp4"}, headers=headers_admin)
    print(f"\n4. Admin Attempting Video Analysis Status: {res.status_code}")
    print(f"   Response JSON: {res.json()}")
    assert res.status_code == 403, "Expected 403 Forbidden when Admin attempts video analysis!"
    assert "Video analysis is available only to athletes" in res.json().get("message", "")

    # Admin attempting Video Upload -> Must return 403 Forbidden
    res = requests.post(f"{BASE_URL}/upload/video", headers=headers_admin)
    print(f"\n5. Admin Attempting Video Upload Status: {res.status_code}")
    print(f"   Response JSON: {res.json()}")
    assert res.status_code == 403, "Expected 403 Forbidden when Admin attempts video upload!"

    # Admin accessing Admin Stats -> Allowed 200
    res = requests.get(f"{BASE_URL}/admin/stats", headers=headers_admin)
    print(f"\n6. Admin Accessing Admin Stats Status: {res.status_code}")
    print(f"   Response JSON Keys: {list(res.json().get('stats', {}).keys())}")
    assert res.status_code == 200, "Expected 200 for Admin accessing admin stats"

    # 5. Ownership Isolation Testing: Create 2nd athlete and try reading 1st athlete's analysis
    reg_payload2 = {
        "name": "Second Athlete",
        "email": "athlete2@gmail.com",
        "password": "password123"
    }
    res = requests.post(f"{BASE_URL}/auth/register", json=reg_payload2)
    if res.status_code == 400:
        res = requests.post(f"{BASE_URL}/auth/login", json={"email": "athlete2@gmail.com", "password": "password123"})
    
    athlete2_token = res.json().get("token")
    headers_athlete2 = {"Authorization": f"Bearer {athlete2_token}"}

    if analysis_id:
        res = requests.get(f"{BASE_URL}/analysis/{analysis_id}", headers=headers_athlete2)
        print(f"\n7. Athlete #2 Attempting Access to Athlete #1's Analysis ({analysis_id}) Status: {res.status_code}")
        print(f"   Response JSON: {res.json()}")
        assert res.status_code in [403, 404], "Expected 403/404 Access Denied for accessing another athlete's record!"

    print("\n============================================================")
    print("ALL AUTHENTICATION, AUTHORIZATION & SECURITY TESTS PASSED 100%!")
    print("============================================================")

if __name__ == "__main__":
    run_tests()
