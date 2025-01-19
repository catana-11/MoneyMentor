import React, { useState, useEffect } from 'react';
import './ESGPage.css';

const ESGPage = () => {
  const [esgData, setEsgData] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchEsgData = async () => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch('http://127.0.0.1:5000/api/get-esg-info', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ userMessage: "Tell me about ESG investing" }),
      });

      const data = await response.json();

      if (response.ok) {
      
        let cleanedData = data.advice.replace(/(<br\s*\/?>)+/g, '<br>'); // Data was being provided in a confusing way. This helps clearning it out!
        setEsgData(cleanedData);
      } else {
        setError('Failed to fetch ESG data.');
      }
    } catch (err) {
      setError('Error fetching ESG data.');
    } finally {
      setIsLoading(false);
    }
  };


  useEffect(() => {
    fetchEsgData();
  }, []); 

  return (
    <div className="esg-page">
      <h1>Learn About ESG Investing</h1>

      {isLoading && <div className="loading-message">Getting recent ESG data for you...</div>}

      {error && <p className="error">{error}</p>}

      {esgData && (
        <div className="esg-content" dangerouslySetInnerHTML={{ __html: esgData }} />
      )}
    </div>
  );
};

export default ESGPage;
