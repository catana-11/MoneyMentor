from flask import Flask, request, jsonify
from flask_cors import CORS

import pandas as pd
import random  
import requests
import json
import csv

from dotenv import load_dotenv
import os

load_dotenv()

url = "https://api.worqhat.com/api/ai/content/v4"
api_key = os.getenv('API_KEY')

app = Flask(__name__)
CORS(app)  

#----------------THIS IS THE CODE FOR FINANCIAL TERMS-LEARNING AND QUIZ--------------#
def load_terms(difficulty):
    if difficulty == 'easy':
        return pd.read_csv('FT_easy.csv')
    elif difficulty == 'medium':
        return pd.read_csv('FT_medium.csv') 
    elif difficulty == 'advanced':
        return pd.read_csv('FT_advanced.csv') 
    else:
        return pd.read_csv('FT_easy.csv')  


def generate_quiz_question(term, financial_terms):
    payload = json.dumps({
        "question": f"Generate a question about {term}.",
        "model": "aicon-v4-nano-160824",
        "randomness": 0.5,
        "stream_data": False,
        "training_data": "You are a finance teacher teaching beginner financial terms. The answers are going to be in a single word MCQ format so adapt the questions ideally so. DO NOT include options in the question. Just frame a question. Do not reply anything other than the question.",
        "response_type": "text"
    })

    headers = {
        'Content-Type': 'application/json',
        'Authorization': f'Bearer {api_key}'
    }

    response = requests.request("POST", url, headers=headers, data=payload)
    print(response)  
    question_req = response.text
    print(question_req)

    try:
      
        json_response = json.loads(question_req)
        message = json_response.get("content", "No message found") # Final cleanedup text

        print(message)  # for debugging only, remove this if not needed
    except json.JSONDecodeError as e:
        print(f"Error parsing JSON: {e}")

    question = message
    correct_answer = term['Term'] 
    options = [correct_answer]

    # Add random incorrect answers for options:
    incorrect_answers = random.sample([t['Term'] for t in financial_terms if t['Term'] != correct_answer], 3)
    options.extend(incorrect_answers)

    random.shuffle(options) # just for fun lol

    return {
        'question': question,
        'correctAnswer': correct_answer, 
        'options': [{'text': option, 'isCorrect': option == correct_answer} for option in options]
    }

# Route to get the financial term for the current step:
@app.route('/api/get-term', methods=['GET'])
def get_term():
    step = int(request.args.get('step', 0))
    difficulty = request.args.get('difficulty', 'easy')

    df = load_terms(difficulty)
    financial_terms = df.to_dict(orient='records')

    if step >= len(financial_terms):
        return jsonify({"finished": True}), 200

    term = financial_terms[step]
    return jsonify(term)


@app.route('/api/start-quiz', methods=['GET'])
def start_quiz():
    difficulty = request.args.get('difficulty', 'easy') # if anything goes wrong, uses 'easy' csv data

    df = load_terms(difficulty)
    financial_terms = df.to_dict(orient='records')

   
    selected_terms = random.sample(financial_terms, 10) # 10 questions 

    
    quiz_questions = [generate_quiz_question(term, financial_terms) for term in selected_terms]
    return jsonify({'questions': quiz_questions})



#----------THIS IS FOR THE FINANCIAL ADVICE CHAT BOT-----------------#

@app.route('/api/get-financial-advice', methods=['POST'])
def get_financial_advice():
    try:
        data = request.json
        income = data.get("income")
        investment = data.get("investment")
        risk_tolerance = data.get("riskTolerance")
        preferred_investment = data.get("preferredInvestment")
        time_horizon = data.get("timeHorizon")
        investment_experience = data.get("investmentExperience")
        diversification = data.get("diversification")
        currency = data.get("currency")
        previous_message = data.get("previousMessage", "")
        goal = data.get("goal", "general investment advice")
        user_message = data.get("userMessage", "")

        
        if user_message.lower() in ["thank you", "thanks"]:
            # Handle case where the context changes
            advice_topic = "acknowledgment response"
        else:
            advice_topic = "general finance"  # Default topic if no special case detected

        # If the message is a thank you or a shift in topic, skip giving prior advice again
        if "thank you" in user_message.lower() or "thanks" in user_message.lower():
            prompt = f"""
            User has acknowledged the advice. Provide a polite response without repeating the initial advice.
            Respond to user in a conversational, helpful manner.
            """
        else:
            
            prompt = f"""
                You are an expert financial advisor. Based on the user's details, provide personalized financial advice in simple terms, formatted for easy reading on a website (HTML). Include line breaks, bullet points, and other relevant formatting for clarity. ONLY include the HTML part ONCE, or else things will get double printed.

                Key Details:
                - **Income**: {income} {currency}
                - **Preferred investment**: {preferred_investment}
                - **Risk tolerance**: {risk_tolerance}
                - **Willing to invest**: {investment} {currency}
                - **Time horizon**: {time_horizon}
                - **Investment experience**: {investment_experience}
                - **Diversification interest**: {diversification}
                - **Goal**: {goal}

                Previous conversation history:
                {previous_message}

                User is seeking advice on: {advice_topic}.
                - Respond with new, updated advice based on the user's inputs.
                - Provide advice in a user-friendly, HTML formatted response with bullet points, numbered lists, and appropriate line breaks.
                - Include a couple of possible real-life investment split-up scenarios based on current investment rates.
                - Evaluate and recommend a good plan based on the above details.
                - Refer various economic and finanicial sources from TRSUTED available sites online to base the content off of.
                - Include detail information about stocks and funds if user asks for so. Use real time data to get it off of trusted sites.
                - DO NOT include any python calculations in output. Output should be purely result text. Peform any and every calculation server side only.

                Please ensure that the response directly addresses the user’s situation without formalities like “Sure, I will include this feature”. Provide concise and actionable advice.
                """

        
        payload = json.dumps({
            "question": prompt,
            "model": "aicon-v4-nano-160824",
            "randomness": 0.5,
            "response_type": "text"
        })

        headers = {
            'Content-Type': 'application/json',
            'Authorization': f'Bearer {api_key}'
        }

        
        response = requests.post(url, headers=headers, data=payload)
        
        if response.status_code == 200:
            json_response = response.json()
            message = json_response.get("content", "No advice available.")
            
            # cleaning up for better rendering
            cleaned_message = message.replace("```html", "").replace("```", "")
            formatted_message = f"Word of Advice:<br><br>{cleaned_message}<br><br>Please make sure to review the advice carefully before making any decisions."
            return jsonify({"advice": formatted_message}), 200
        else:
            return jsonify({"error": "Failed to get advice from the AI API."}), 500

    except Exception as e:
        return jsonify({"error": str(e)}), 500
    


#--------------THIS IS LIP CSV CODE---------------#


CSV_FILE_PATH = 'lip.csv'

def load_investments_from_csv():
    """Load investment options from the CSV file."""
    investments = []
    with open(CSV_FILE_PATH, mode='r', newline='', encoding='utf-8') as csvfile:
        reader = csv.DictReader(csvfile)
        for row in reader:
            investment = {
                "term": row["term"],
                "definition": row["definition"],
                "example": row["example"],
                "image": row["image"]
            }
            investments.append(investment)
    return investments


@app.route('/api/get-investment', methods=['GET'])
def get_investment():
    """Get an investment option based on the current step."""
   
    step = int(request.args.get('step', 0))  
    investments = load_investments_from_csv()

    
    if step >= len(investments):
        return jsonify({"finished": True})

    investment = investments[step]

   
    return jsonify({
        "term": investment["term"],
        "definition": investment["definition"],
        "example": investment["example"],
        "image": investment["image"]
    })



#--------------THIS IS FOR ESG------------#

@app.route('/api/get-esg-info', methods=['POST'])
def get_esg_info():
    try:

        prompt = f"""
        You are an expert financial advisor with a specialization in ESG (Environmental, Social, and Governance) investing.
        Provide a comprehensive, easy-to-understand explanation of ESG investing, formatted with HTML for a website.
        The explanation should include:
        
        1. A detailed definition of ESG investing.
        2. How ESG is used in finance and its significance in portfolio building.
        3. A discussion of recent ESG stocks and businesses that have been performing well, and why they are considered ESG-compliant.
        4. Real-life examples of ESG businesses and how they are contributing to the economy and society.
        5. A summary of the growing trend of ESG investments in the market and why investors are focusing on sustainability.
        
        Ensure the content is based on trusted, verified sources online. Structure the response with:
        - Bullet points, numbered lists, and other relevant formatting.
        - Make sure the response is user-friendly and informative with a focus on clarity.
        - DO NOT put developer formalities like "ok i will do this here" or "here is the explanation". This data will be directly shown to external user so keep it in mind.

        Please format the response in HTML and return the advice with proper line breaks, bold text, and headings for better readability.
        """
        
   
        payload = json.dumps({
            "question": prompt,
            "model": "aicon-v4-nano-160824",
            "randomness": 0.5,
            "response_type": "text"
        })

        headers = {
            'Content-Type': 'application/json',
            'Authorization': f'Bearer {api_key}'
        }

    
        response = requests.post(url, headers=headers, data=payload)

        if response.status_code == 200:
            json_response = response.json()
            message = json_response.get("content", "No advice available.")
            
            # clean up for better rendering
            cleaned_message = message.replace("```html", "").replace("```", "")
            formatted_message = f"ESG Insights:<br><br>{cleaned_message}<br><br>Please review the information before making any investment decisions."
            return jsonify({"advice": formatted_message}), 200
        else:
            return jsonify({"error": "Failed to get ESG information from the AI API."}), 500

    except Exception as e:
        return jsonify({"error": str(e)}), 500



#----------------THIS IS THE PERSONA CODE---------#

def load_personas():
    personas = {}
    with open('persona.csv', mode='r') as file:
        csv_reader = csv.DictReader(file)
        for row in csv_reader:
            personas[row['title']] = {
                'definition': row['definition'],
                'image': row['image']
            }
    return personas

personas = load_personas()

def load_questions():
    questions = []
    with open('questions.csv', mode='r') as file:
        csv_reader = csv.DictReader(file)
        for row in csv_reader:
            questions.append({
                'question': row['question'],
                'options': [
                    {'text': row['option_1'], 'points': int(row['points_1'])},
                    {'text': row['option_2'], 'points': int(row['points_2'])},
                    {'text': row['option_3'], 'points': int(row['points_3'])},
                ]
            })
    return questions

@app.route('/api/get-questions', methods=['GET'])
def get_questions():
    questions = load_questions()
    return jsonify(questions), 200


@app.route('/api/calculate-personality', methods=['POST'])
def calculate_personality():
    answers = request.json.get('answers') 
    score = sum(answers)

    # Adjust the logic based on your scoring ranges
    if score <= 15:
        personality = "Conservative Investor"
        definition = "A person who prioritizes stability and low risk, preferring safer investments like bonds and savings accounts."
        image = "/images/conservative.png"
    elif 16 <= score <= 25:
        personality = "Cautious Investor"
        definition = "A person who is somewhat risk-averse, preferring to focus on steady but lower returns, avoiding high volatility."
        image = "/images/cautious.png"
    elif 26 <= score <= 40:
        personality = "Balanced Investor"
        definition = "A person who seeks a balance between risk and reward, typically investing in a mix of stocks and bonds."
        image = "/images/balanced.png"
    elif 41 <= score <= 55:
        personality = "Opportunistic Investor"
        definition = "A person who focuses on high-reward, short-term investments, often taking advantage of market trends."
        image = "/images/opportunistic.png"
    elif 56 <= score <= 70:
        personality = "Aggressive Investor"
        definition = "A person willing to take on high risk to achieve high returns, often investing in speculative stocks."
        image = "/images/aggressive.png"
    elif 71 <= score <= 85:
        personality = "Risk-Tolerant Investor"
        definition = "An individual who is comfortable with risk and actively seeks out higher-risk investment opportunities."
        image = "/images/risk_tolerant.png"
    elif 86 <= score <= 100:
        personality = "Value Investor"
        definition = "A person who seeks undervalued stocks or assets, with the intention to buy and hold until the market recognizes their true worth."
        image = "/images/value.png"
    elif 101 <= score <= 115:
        personality = "Growth Investor"
        definition = "A person who focuses on companies with high growth potential, typically in emerging industries."
        image = "/images/growth.png"
    elif 116 <= score <= 130:
        personality = "Income-Focused Investor"
        definition = "An investor who seeks steady income from investments, such as dividends or interest."
        image = "/images/income_focused.png"
    elif 131 <= score <= 145:
        personality = "Speculative Investor"
        definition = "An individual who looks for high-risk, high-reward opportunities, including speculative ventures."
        image = "/images/speculative.png"
    else:
        personality = "Ethical Investor"
        definition = "An investor who prioritizes companies that adhere to strong ethical, environmental, and social standards."
        image = "/images/ethical.png"
    
    return jsonify({
        'result': personality,
        'definition': definition,
        'image': image
    }), 200


if __name__ == '__main__':
    app.run(debug=True)