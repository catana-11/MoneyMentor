
import React from 'react';
import { Link } from 'react-router-dom';
import './Home.css';

const Home = () => {
  return (
    <div className="home-container">
      <h1>Welcome to MoneyMentor</h1>
      <p>Start your learning journey to finance!</p>
      
      <Link to="/dashboard">
        <button className="start-button">Start Learning</button>
      </Link>
      
      <Link to="/financial-advice">
        <button className="start-button">Get Financial Advice</button>
      </Link>

      <Link to="/financial-persona">
        <button className="start-button">Find Your Financial Persona</button>
      </Link>
    </div>
  );
};

export default Home;
