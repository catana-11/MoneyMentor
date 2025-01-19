import React, { useState, useEffect } from 'react';
import './FinancialPersonaPage.css';

const FinancialPersonaPage = () => {
  const [questions, setQuestions] = useState([]); // Store questions
  const [answers, setAnswers] = useState([]); // Store answers
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0); // Track current question index
  const [result, setResult] = useState(''); // Store result
  const [definition, setDefinition] = useState(''); // Store definition
  const [image, setImage] = useState(''); // Store image URL
  const [isLoading, setIsLoading] = useState(false); // Track if the result is being calculated
  const [isQuestionAnswered, setIsQuestionAnswered] = useState(false);  // Track if a question is answered

  // Fetch questions from the backend when the component mounts
  useEffect(() => {
    const fetchQuestions = async () => {
      try {
        const response = await fetch('http://localhost:5000/api/get-questions');
        if (response.ok) {
          const data = await response.json();
          setQuestions(data);  // Set the questions once they are fetched
        } else {
          console.error('Failed to fetch questions');
        }
      } catch (error) {
        console.error('Error fetching questions:', error);
      }
    };
    fetchQuestions();
  }, []); 

  const handleAnswer = (points) => {
    setAnswers([...answers, points]);  // Add points of the selected answer
    setIsQuestionAnswered(true); // Mark the question as answered
    setTimeout(() => {
      setCurrentQuestionIndex(currentQuestionIndex + 1);  // Move to the next question after animation!
      setIsQuestionAnswered(false);  // Reset for the next question
    }, 1000);  // 1-second for animation
  };

  
  const calculateResult = async () => {
    setIsLoading(true);
    try {
      const response = await fetch('http://localhost:5000/api/calculate-personality', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ answers }), // Send the answers to Python
      });
      if (response.ok) {
        const data = await response.json();
        setResult(data.result);  // Set the result returned
        setDefinition(data.definition); // Set the definition
        setImage(data.image); // Set the image URL
      } else {
        console.error('Failed to calculate result');
      }
    } catch (error) {
      console.error('Error calculating result:', error);
    }
    setIsLoading(false);
  };

  // Trigger result calculation when all questions are answered
  useEffect(() => {
    if (currentQuestionIndex === questions.length && answers.length === questions.length) {
      calculateResult();
    }
  }, [currentQuestionIndex, answers, questions.length]);

  return (
    <div className="financial-persona-page">
      <h1>Financial Persona Quiz</h1>

      {isLoading && <div className="loading-message">Calculating your result...</div>}

      {/* Display questions and options */}
      {!isLoading && currentQuestionIndex < questions.length && (
        <div className={`question ${isQuestionAnswered ? 'question-answered' : ''}`}>
          <h2>{questions[currentQuestionIndex].question}</h2>
          <div className="options">
            {questions[currentQuestionIndex].options.map((option, index) => (
              <button
                key={index}
                onClick={() => handleAnswer(option.points)} 
                className="option-button"
                disabled={isQuestionAnswered}  // Disable the buttons after answer 
              >
                {option.text}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Display the result after all questions are answered */}
      {!isLoading && currentQuestionIndex === questions.length && (
        <div className="result">
          <h2>Your result is:</h2>
          <p>{result}</p>
          <p>{definition}</p>
          {image && <img src={image} alt={result} className="persona-image" />}
        </div>
      )}
    </div>
  );
};

export default FinancialPersonaPage;
