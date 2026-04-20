import requests
import json
import time

url = "http://localhost:5000/predict"
payload = {
    "description": "The street lights are not working and it is very dark."
}
headers = {
    "Content-Type": "application/json"
}

print("Testing /predict endpoint...")
try:
    response = requests.post(url, data=json.dumps(payload), headers=headers)
    print(f"Status Code: {response.status_code}")
    print("Response JSON:")
    print(json.dumps(response.json(), indent=2))
except Exception as e:
    print(f"Error: {e}")
