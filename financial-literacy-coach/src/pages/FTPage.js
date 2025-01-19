import React, { useState, useEffect, useCallback } from 'react';
import './CoursePage.css';


const FTPage = () => {
  const [difficulty, setDifficulty] = useState(null);
  const [step, setStep] = useState(0);
  const [term, setTerm] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [isQuizStarted, setIsQuizStarted] = useState(false);
  const [questions, setQuestions] = useState([]);
  const [score, setScore] = useState(0);
  const [allAnswers, setAllAnswers] = useState([]);
  const [showResults, setShowResults] = useState(false);

  const handleDifficultySelection = (selectedDifficulty) => {
    setDifficulty(selectedDifficulty);
    setError(null);
    setStep(0);
    setIsQuizStarted(false);
    setScore(0);
    setAllAnswers([]);
    setShowResults(false);
  };

  const fetchTerm = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await fetch(`http://localhost:5000/api/get-term?step=${step}&difficulty=${difficulty}`);
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const data = await response.json();
      if (data.finished) {
        setTerm(null);
      } else {
        setTerm(data);
      }
    } catch (err) {
      setError('Error fetching financial term');
      console.error('Error details:', err);
    } finally {
      setIsLoading(false);
    }
  }, [step, difficulty]);

  const handleOkClick = () => {
    setStep((prevStep) => prevStep + 1);
  };

  const handleStartQuiz = async () => {
    setIsQuizStarted(true);
    setStep(0);
    setQuestions([]);
    setScore(0);
    setAllAnswers([]);
    setShowResults(false);
    setIsLoading(true); 

    try {
      const response = await fetch(`http://localhost:5000/api/start-quiz?difficulty=${difficulty}`);
      if (!response.ok) {
        throw new Error('Failed to fetch quiz questions');
      }
      const quizData = await response.json();
      setQuestions(quizData.questions);
    } catch (err) {
      setError('Error starting the quiz');
      console.error('Error details:', err);
    } finally {
      setIsLoading(false); 
    }
  };

  const handleAnswerSelection = (isCorrect, selectedOption, question) => {
    const newAnswer = {
      question: question.question,
      userChoice: selectedOption,
      correctChoice: question.correctAnswer, 
      isCorrect: isCorrect,
    };
    setAllAnswers((prevAnswers) => [...prevAnswers, newAnswer]);
    if (isCorrect) {
      setScore((prevScore) => prevScore + 1);
    }
  
    if (step < questions.length - 1) {
      setStep((prevStep) => prevStep + 1);
    } else {
      setShowResults(true);
    }
  };

  const ResultsPage = () => (
    <div className="results-page">
      <h3>Your Final Score: {score}/{questions.length}</h3>
      <table className="results-table">
        <thead>
          <tr>
            <th>Question</th>
            <th>Your Answer</th>
            <th>Correct Answer</th>
            <th>Result</th>
          </tr>
        </thead>
        <tbody>
          {allAnswers.map((answer, index) => (
            <tr key={index}>
              <td>{answer.question}</td>
              <td>{answer.userChoice}</td>
              <td>{answer.correctChoice}</td>
              <td>{answer.isCorrect ? 'Correct' : 'Incorrect'}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );

  useEffect(() => {
    if (difficulty && !isQuizStarted) {
      fetchTerm();
    }
  }, [difficulty, step, isQuizStarted, fetchTerm]);

  return (
    <div className="course-page">
      <h1>Financial Terms for Beginners</h1>
      {!difficulty ? (
        <div>
          <h2>Select your difficulty level:</h2>
          <button onClick={() => handleDifficultySelection('easy')}>Easy</button>
          <button onClick={() => handleDifficultySelection('medium')}>Medium</button>
          <button onClick={() => handleDifficultySelection('advanced')}>Advanced</button>
        </div>
      ) : (
        <div>
          <p>Great, let's proceed with {difficulty} level!</p>
        </div>
      )}

      {isLoading && <div className="spinner">Loading...</div>} 

      {error && <p className="error">{error}</p>}

      {term && !isQuizStarted && (
        <div className="term-display">
          <h3>{term.Term}</h3>
          <p>{term.Definition}</p>
          {term.Example && <p className="example"><strong>Example: </strong>{term.Example}</p>}
          <img src={term.Image} alt="Financial term" />
          <button onClick={handleOkClick}>OK</button>
        </div>
      )}

      {term === null && step > 0 && !isQuizStarted && (
        <div className="quiz-button">
          <button onClick={handleStartQuiz}>Start Quiz</button>
        </div>
      )}

      {isQuizStarted && questions.length > 0 && !showResults && (
        <div className="quiz-container">
          <div className="quiz-question">
            <h3>Quiz Question: {questions[step].question}</h3>
          </div>
          <div className="quiz-options">
            {questions[step].options.map((option, index) => (
              <button
                key={index}
                onClick={() => handleAnswerSelection(option.isCorrect, option.text, questions[step])}
              >
                {option.text}
              </button>
            ))}
          </div>
        </div>
      )}

      {showResults && <ResultsPage />}
    </div>
  );
};

export default FTPage;
