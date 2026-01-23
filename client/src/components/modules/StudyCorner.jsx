import React, { useState, useEffect } from "react";
import confetti from "canvas-confetti"; 
import "./StudyCorner.css";

const StudyCorner = () => {
  // pomodoro   
  const [minutes, setMinutes] = useState(25);
  const [seconds, setSeconds] = useState(0);
  const [isActive, setIsActive] = useState(false);
  const [mode, setMode] = useState("session"); 
  
  const [breakLength, setBreakLength] = useState(5); 
  const [sessionLength, setSessionLength] = useState(25); 

  const [sessionsCompleted, setSessionsCompleted] = useState(0);
  const dailyGoal = 4; 

  const [tasks, setTasks] = useState([]);
  const [inputValue, setInputValue] = useState("");
  const [estPomodoros, setEstPomodoros] = useState(1);

  // confetti 
  const triggerConfetti = () => {
    confetti({
      particleCount: 100,
      spread: 70,
      origin: { y: 0.6 },
      colors: ['#A1B3A8', '#FDFBF9', '#000000'] 
    });
  };

  //  timer  
  useEffect(() => {
    let interval = null;
    if (isActive) {
      interval = setInterval(() => {
        if (seconds > 0) {
          setSeconds(seconds - 1);
        } else if (minutes > 0) {
          setMinutes(minutes - 1);
          setSeconds(59);
        } else {
          if (mode === "session") {
            triggerConfetti(); 
            setSessionsCompleted(prev => prev + 1);
            setMode("break");
            setMinutes(breakLength);
            setIsActive(false);
          } else {
            setMode("session");
            setMinutes(sessionLength);
            setIsActive(false);
            alert("Break over! Time to focus.");
          }
        }
      }, 1000);
    } else {
      clearInterval(interval);
    }
    return () => clearInterval(interval);
  }, [isActive, minutes, seconds, mode, breakLength, sessionLength]);

  const toggleTimer = () => setIsActive(!isActive);
  
  const resetTimer = () => {
    setIsActive(false);
    setMode("session");
    setMinutes(sessionLength);
    setSeconds(0);
  };

  const addTask = () => {
    if (inputValue.trim()) {
      setTasks([...tasks, { 
        id: Date.now(), 
        text: inputValue, 
        completed: false,
        estimate: estPomodoros 
      }]);
      setInputValue("");
      setEstPomodoros(1); 
    }
  };

  return (
    <div className="study-corner-container">
      <h1 className="corner-title">Study Corner</h1>
      
      <div className="corner-layout">
        
        <div className="left-column">
          
          <div className="pomodoro-card">
            <div className="timer-display-box">
              <div className="timer-label">{mode === "session" ? "SESSION" : "ON BREAK"}</div>
              <div className="timer-time">
                {String(minutes).padStart(2, '0')}:{String(seconds).padStart(2, '0')}
              </div>
              <div className="timer-main-controls">
                <button className="timer-btn-simple" onClick={toggleTimer}>
                  {isActive ? "Pause" : "Start"}
                </button>
                <button className="timer-btn-simple" onClick={resetTimer}>Reset</button>
              </div>
            </div>

            <div className="timer-settings-row">
              {/* BREAK LENGTH CONTROL */}
              <div className="setting-block">
                <div className="setting-controls">
                  <button onClick={() => setBreakLength(Math.max(1, Number(breakLength) - 1))}>-</button>
                  <input 
                    type="number" 
                    className="setting-input"
                    value={breakLength} 
                    onChange={(e) => setBreakLength(e.target.value)}
                    onBlur={(e) => { if(!e.target.value) setBreakLength(5); }} 
                  />
                  <button onClick={() => setBreakLength(Number(breakLength) + 1)}>+</button>
                </div>
                <div className="setting-label">Break Length</div>
              </div>

              {/* SESSION LENGTH CONTROL */}
              <div className="setting-block">
                <div className="setting-controls">
                  <button onClick={() => {
                    const newVal = Math.max(1, Number(sessionLength) - 1);
                    setSessionLength(newVal);
                    if(!isActive && mode === 'session') setMinutes(newVal);
                  }}>-</button>
                  
                  <input 
                    type="number" 
                    className="setting-input"
                    value={sessionLength} 
                    onChange={(e) => {
                      const val = e.target.value;
                      setSessionLength(val);
                      if(!isActive && mode === 'session' && val) setMinutes(val);
                    }}
                    onBlur={(e) => { if(!e.target.value) setSessionLength(25); }} 
                  />

                  <button onClick={() => {
                    const newVal = Number(sessionLength) + 1;
                    setSessionLength(newVal);
                    if(!isActive && mode === 'session') setMinutes(newVal);
                  }}>+</button>
                </div>
                <div className="setting-label">Session Length</div>
              </div>
            </div>
          </div>

          <div className="goal-card">
            <div className="session-tracker">
              <span className="tracker-label">Daily Goal:</span>
              <div className="dots-container">
                {[...Array(dailyGoal)].map((_, i) => (
                  <div 
                    key={i} 
                    className={`session-dot ${i < sessionsCompleted ? "filled" : ""}`} 
                  />
                ))}
              </div>
            </div>
          </div>

        </div> 
        
        <div className="todo-card">
          <h2>Focus List</h2>
          <div className="todo-input-row">
            <input 
              type="text" 
              value={inputValue} 
              onChange={(e) => setInputValue(e.target.value)}
              placeholder="Enter the flow..."
            />
            
            <select 
              className="est-select"
              value={estPomodoros}
              onChange={(e) => setEstPomodoros(Number(e.target.value))}
            >
              <option value="1">1 🍅</option>
              <option value="2">2 🍅</option>
              <option value="3">3 🍅</option>
              <option value="4">4 🍅</option>
            </select>

            <button onClick={addTask}>Add</button>
          </div>

          <ul className="task-list">
            {tasks.map(task => (
              <li key={task.id} className="task-item">
                <input type="checkbox" />
                <div className="task-content">
                  <span>{task.text}</span>
                  <span className="tomato-count">
                    {"🍅".repeat(task.estimate)}
                  </span>
                </div>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
};

export default StudyCorner;