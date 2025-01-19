import React, { useState } from 'react';
import './FinancialAdvicePage.css';
import { useNavigate } from 'react-router-dom'; 

const FinancialAdvicePage = () => {
  const [step, setStep] = useState(0); 
  const [userData, setUserData] = useState({
    income: '',
    investment: '',
    riskTolerance: '',
    preferredInvestment: '',
    timeHorizon: '',
    investmentExperience: '',
    diversification: '',
    currency: '',
    goal: '', 
  });
  const [conversation, setConversation] = useState([]); 
  const [loading, setLoading] = useState(false);

  const navigate = useNavigate(); 

  const handleInputChange = (e, field) => {
    setUserData({ ...userData, [field]: e.target.value });
  };

  const handleSubmitInitialData = () => {
    setStep(1); // This will take the user from initial inputs to the conversation part!
    setConversation([
      { sender: 'User', message: 'I have provided the required information. Let’s start the conversation!' },
    ]);
    fetchAdvice('I have provided the required information. Let’s start the conversation!');
  };

  const fetchAdvice = async (userMessage, conversationHistory = '') => {
    setLoading(true);

    // Will add the new message to convo history
    const conversationContext = conversationHistory + `\nUser: ${userMessage}`;

    const response = await fetch('http://localhost:5000/api/get-financial-advice', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        ...userData,
        previousMessage: conversationContext, // Will pass the full context to Python
        userMessage, // Will pass current user message
      }),
    });

    const data = await response.json();
    setLoading(false);

    if (data.advice) {
      setConversation((prev) => [
        ...prev,
        { sender: 'User', message: userMessage },
        { sender: 'AI', message: data.advice }, // Shows the advice!
      ]);
    } else {
      setConversation((prev) => [
        ...prev,
        { sender: 'AI', message: 'Sorry, there was an error processing your request.' },
      ]);
    }
  };

  const handleContinueConversation = async (userMessage) => {
    // Loading ~
    setConversation((prev) => [
      ...prev,
      { sender: 'User', message: userMessage },
      { sender: 'AI', message: 'Loading...' },
    ]);

    // Builds conversation history 
    const conversationHistory = conversation
      .map((chat) => `${chat.sender}: ${chat.message}`)
      .join("\n");

    // Sends the entire conversation history
    await fetchAdvice(userMessage, conversationHistory);
  };

  // Exit the conversation and go back to home
  const handleExitConversation = () => {
    navigate('/'); 
  };

  return (
    <div className="financial-advice-container">
      <h1>Welcome to Our Financial Chatbot!</h1>

      {step === 0 && (
        <>
          <p>Let's begin the conversation by providing some basic details.</p>
          <form>
            <label>Income:</label>
            <input
              type="text"
              value={userData.income}
              onChange={(e) => handleInputChange(e, 'income')}
              placeholder="e.g., ₹36 Lakhs, USD 50k"
            />
            <label>Preferred Investment:</label>
            <input
              type="text"
              value={userData.preferredInvestment}
              onChange={(e) => handleInputChange(e, 'preferredInvestment')}
              placeholder="e.g., stocks, mutual funds"
            />
            <label>Risk Tolerance:</label>
            <input
              type="text"
              value={userData.riskTolerance}
              onChange={(e) => handleInputChange(e, 'riskTolerance')}
              placeholder="e.g., low, medium, high"
            />
            <label>Willing to Invest:</label>
            <input
              type="text"
              value={userData.investment}
              onChange={(e) => handleInputChange(e, 'investment')}
              placeholder="How much are you willing to invest?"
            />
            <label>Time Horizon:</label>
            <input
              type="text"
              value={userData.timeHorizon}
              onChange={(e) => handleInputChange(e, 'timeHorizon')}
              placeholder="e.g., short-term, medium-term"
            />
            <label>Investment Experience:</label>
            <input
              type="text"
              value={userData.investmentExperience}
              onChange={(e) => handleInputChange(e, 'investmentExperience')}
              placeholder="e.g., beginner, intermediate"
            />
            <label>Diversification Interest:</label>
            <input
              type="text"
              value={userData.diversification}
              onChange={(e) => handleInputChange(e, 'diversification')}
              placeholder="e.g., yes, no"
            />
            <label>Currency:</label>
            <input
              type="text"
              value={userData.currency}
              onChange={(e) => handleInputChange(e, 'currency')}
              placeholder="e.g., INR, USD"
            />
            <label>Goal (e.g., buying a house):</label>
            <input
              type="text"
              value={userData.goal}
              onChange={(e) => handleInputChange(e, 'goal')}
              placeholder="e.g., I want to buy a house"
            />

            <button type="button" onClick={handleSubmitInitialData}>
              Begin Conversation
            </button>
          </form>
        </>
      )}

      {step === 1 && (
        <>
          <div className="chat-box">
            {conversation.map((chat, index) => (
              <div key={index} className={chat.sender === 'AI' ? 'ai-message' : 'user-message'}>
                <p dangerouslySetInnerHTML={{ __html: chat.message }} /> {/* Render HTML content */}
              </div>
            ))}
          </div>

          {/* Show loading spinner */}
          {loading && <div className="spinner">Loading...</div>}

          
          <input
            type="text"
            placeholder="Type your message here..."
            onKeyDown={(e) => {
              if (e.key === 'Enter' && e.target.value.trim() !== '') {
                handleContinueConversation(e.target.value);
                e.target.value = ''; // Clear input after sending
              }
            }}
          />

          {/* Exit button to go back to home */}
          <button className="exit-button" onClick={handleExitConversation}>
            Exit Conversation
          </button>
        </>
      )}
    </div>
  );
};

export default FinancialAdvicePage;
