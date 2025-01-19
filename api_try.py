#------------ NO NEED TO USE THIS, JUST FOR MY TRIAL REFERENCE---------#


import requests
import json

url = "https://api.worqhat.com/api/ai/content/v4"
api_key = "xyz"

payload = json.dumps({
   "question": "Generate a question about stocks. The answer should be stocks.",
   "model": "aicon-v4-nano-160824",
   "randomness": 0.5,
   "stream_data": False,
   "training_data": "You are a finance teacher teaching beginner financial terms. Do not reply anything other than the question.",
   "response_type": "text"
})
headers = {
   'Content-Type': 'application/json',
   'Authorization': f'Bearer {api_key}'
}

response = requests.request("POST", url, headers=headers, data=payload)
question_req = response.text

print(response.text)