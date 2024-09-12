import requests
import time


start_time = time.time()
duration = 10
requests_count = 0
response_time = []


def send_request():
    global requests_count
    global response_time
    url = "http://127.0.0.1:8000/"

    payload = {}
    headers = {
        'User-Agent': f'Apidog/{requests_count}.0.0 (https://apidog.com)',
        'Accept': '*/*',
        'Host': '127.0.0.1:8000',
        'Connection': 'keep-alive'
    }

    response = requests.request("GET", url, headers=headers, data=payload)
    response_time.append(response.elapsed)
    requests_count += 1

while time.time() - start_time < duration:
    send_request()

print(f"requests: {requests_count}")  