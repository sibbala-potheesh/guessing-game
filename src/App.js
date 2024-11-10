import React, { useState, useEffect } from 'react';
import { QRCodeCanvas } from 'qrcode.react';
import './App.css';

const allQuestions = [
  {
    question: "Which fruit has the highest vitamin C content?",
    options: ["A. Orange", "B. Kiwi", "C. Guava", "D. Lemon"],
    answer: "C"
  },
  {
    question: "Which animated movie features a character named 'Woody'?",
    options: ["A. *Frozen*", "B. *Toy Story*", "C. *Finding Nemo*", "D. *Shrek*"],
    answer: "B"
  },
  {
    question: "What is the national flower of India?",
    options: ["A. Rose", "B. Lotus", "C. Sunflower", "D. Tulip"],
    answer: "B"
  },
  {
    question: "Which planet is known as the 'Morning Star' or 'Evening Star'?",
    options: ["A. Mars", "B. Venus", "C. Jupiter", "D. Saturn"],
    answer: "B"
  },
  {
    question: "What is the name of Mickey Mouse’s dog?",
    options: ["A. Goofy", "B. Pluto", "C. Scooby", "D. Snoopy"],
    answer: "B"
  },
  {
    question: "In the cartoon *Tom and Jerry*, who is the cat?",
    options: ["A. Jerry", "B. Spike", "C. Tom", "D. Butch"],
    answer: "C"
  }
];

const App = () => {
  const [questions, setQuestions] = useState([]);
  const [playerName, setPlayerName] = useState("");
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [isGameStarted, setIsGameStarted] = useState(false);
  const [feedback, setFeedback] = useState("");
  const [score, setScore] = useState(0);
  const [timeLeft, setTimeLeft] = useState(120);
  const [error, setError] = useState(""); 
  const [isGameOver, setIsGameOver] = useState(false);
  const [selectedOption, setSelectedOption] = useState(""); 
  const [completed, setCompleted] = useState(false); 
  const [participants, setParticipants] = useState([]); 

  useEffect(() => {
    if (isGameStarted) {
      const shuffled = allQuestions.sort(() => 0.5 - Math.random());
      setQuestions(shuffled.slice(0, 5));
      setCurrentQuestion(0);
      setScore(0);
      setTimeLeft(60); 
      
      Notification.requestPermission();
    }
  }, [isGameStarted]);

  useEffect(() => {
    if (timeLeft > 0 && isGameStarted) {
      const timerId = setTimeout(() => setTimeLeft(timeLeft - 1), 1000);
      return () => clearTimeout(timerId);
    } else if (timeLeft === 0) {
      setFeedback("Time's up! Game Over.");
      setIsGameStarted(false);
      setIsGameOver(true);
    }
  }, [timeLeft, isGameStarted]);

  const startGame = () => {
    if (playerName) {
      setIsGameStarted(true);
      setFeedback("");
      setError(""); 
    } else {
      setError("Please enter your name to start!");
    }
  };

  const handleAnswer = () => {
    if (selectedOption) {
      if (questions[currentQuestion]?.answer === selectedOption) {
        setFeedback(`Congratulations, ${playerName}! Correct Answer!`);
        setScore(score + 1);
        
        setTimeout(() => {
          handleNextQuestion();
        }, 2000);
      } else {
        setFeedback("Wrong Answer!");        
        
        if (Notification.permission === "granted") {
          new Notification("Wrong Answer!", {
            body: "The correct answer was: " + questions[currentQuestion].answer,
          });
        }
      }
    }
  };

  const handleNextQuestion = () => {
    setFeedback(""); 
    setSelectedOption(""); 

    if (currentQuestion < questions.length - 1) {
      setCurrentQuestion(currentQuestion + 1);
    } else {
      
      setCompleted(true);
      setIsGameStarted(false);
      setIsGameOver(true);

      
      setParticipants((prev) => [...prev, { name: playerName, score }]);
    }
  };

  const handleSkipQuestion = () => {
    setFeedback(""); 
    setSelectedOption(""); 

    setQuestions((prevQuestions) => [
      ...prevQuestions.slice(0, currentQuestion),
      ...prevQuestions.slice(currentQuestion + 1),
      prevQuestions[currentQuestion],
    ]);

    if (currentQuestion < questions.length - 1) {
      setCurrentQuestion(currentQuestion + 1);
    } else {
      
      setCompleted(true);
      setIsGameStarted(false);
      setIsGameOver(true);

      
      setParticipants((prev) => [...prev, { name: playerName, score }]);
    }
  };

  const restartGame = () => {
    setIsGameOver(false);
    setPlayerName("");
    setIsGameStarted(false);
    setScore(0);
    setCurrentQuestion(0);
    setTimeLeft(60);
    setCompleted(false);
  };

  return (
    <div className="app">
      <h1>Quiz Game (KBC Style)</h1>

      {!isGameStarted && !isGameOver ? (
        <div className="join-section">
          <h2>Join the Game</h2>
          <QRCodeCanvas value="https://majestic-biscuit-f19509.netlify.app/" size={128} />
          <input
            type="text"
            placeholder="Enter your name"
            value={playerName}
            onChange={(e) => setPlayerName(e.target.value)}
          />
          <button onClick={startGame}>Start Game</button>
          <p className="error-message">{error}</p>
        </div>
      ) : isGameStarted ? (
        <div className="question-section">
          <h2>Time Left: {timeLeft} seconds</h2>
          {questions[currentQuestion] ? (
            <>
              <h2>{questions[currentQuestion].question}</h2>
              <div className="options">
                {questions[currentQuestion].options.map((option, index) => (
                  <button
                    key={index}
                    onClick={() => setSelectedOption(option[0])}
                    className={selectedOption === option[0] ? "selected" : ""}
                  >
                    {option}
                  </button>
                ))}
              </div>
              <button
                    className={`submit-btn ${selectedOption ? '' : 'disabled'}`}
                    onClick={handleAnswer}
                   disabled={!selectedOption}
              >
               Submit
               </button>
             <button className="skip-btn" onClick={handleSkipQuestion}>
                Skip
                </button>

              {feedback && <p>{feedback}</p>}
              {feedback && (
                <button onClick={handleNextQuestion}>Next Question</button>
              )}
            </>
          ) : (
            <p>No more questions available.</p>
          )}
        </div>
      ) : (
        isGameOver && (
          <div className="result-section">
            <h2 className="congrats-message">Congratulations, {playerName}!</h2>
            <p>You scored {score} out of {questions.length}.</p>
            {completed && (
              <div>
                <h3>Completion Summary</h3>
                <p>Thank you for participating!</p>
                {participants.length > 0 && (
                  <div>
                    <h4>Participants:</h4>
                    <ul>
                      {participants.map((participant, index) => (
                        <li key={index}>
                          {participant.name}: {participant.score} correct answers
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            )}
            <button onClick={restartGame}>Retake the Test</button>
          </div>
        )
      )}
    </div>
  );
};

export default App;
