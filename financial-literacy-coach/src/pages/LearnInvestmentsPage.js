import React, { useState, useEffect, useCallback } from 'react';
import './lip.css';

const LearnInvestmentsPage = () => {
  const [step, setStep] = useState(0);
  const [investment, setInvestment] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchInvestment = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await fetch(`http://localhost:5000/api/get-investment?step=${step}`);
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const data = await response.json();
      if (data.finished) {
        setInvestment(null);
      } else {
        setInvestment(data);
      }
    } catch (err) {
      setError('Error fetching investment option');
      console.error('Error details:', err);
    } finally {
      setIsLoading(false);
    }
  }, [step]);

  const handleOkClick = () => {
    setStep((prevStep) => prevStep + 1);
  };

  useEffect(() => {
    fetchInvestment();
  }, [step, fetchInvestment]);

  return (
    <div className="investment-page">
      <h1>Learn Various Investment Options</h1>

      {isLoading && <div className="spinner">Loading...</div>} 

      {error && <p className="error">{error}</p>}

      {investment && (
        <div className="investment-display">
          <h3>{investment.term}</h3>
          <p>{investment.definition}</p>
          <p><strong>Example:</strong> {investment.example}</p>
          <img src={investment.image} alt={investment.term} />
          <button onClick={handleOkClick}>Next Investment Option</button>
        </div>
      )}

      {investment === null && step > 0 && (
        <div className="end-message">
          <p>You've reached the end of the investment options list!</p>
        </div>
      )}
    </div>
  );
};

export default LearnInvestmentsPage;
