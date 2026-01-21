import React, { useState, useEffect } from "react";
import "./StudyCorner.css";

const StudyCorner = () => {
  // Pomodoro State
  const [minutes, setMinutes] = useState(25);
  const [seconds, setSeconds] = useState(0);
  const [isActive, setIsActive] = useState(false);

  // To-Do State
  const [tasks, setTasks] = useState([]);
  const [inputValue, setInputValue] = useState("");

  // Timer Logic
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
          setIsActive(false);
          alert("Time's up! Take a break.");
        }
      }, 1000);
    } else {
      clearInterval(interval);
    }
    return () => clearInterval(interval);
  }, [isActive, minutes, seconds]);

  const toggleTimer = () => setIsActive(!isActive);
  const resetTimer = () => {
    setIsActive(false);
    setMinutes(25);
    setSeconds(0);
  };

  // To-Do Logic
  const addTask = () => {
    if (inputValue.trim()) {
      setTasks([...tasks, { id: Date.now(), text: inputValue, completed: false }]);
      setInputValue("");
    }
  };

  return (
    <div className="study-corner-container">
      <h1 className="corner-title">Study Corner</h1>
      
      <div className="corner-layout">
        {/* TIMER BLOCK */}
        <div className="timer-card">
          <h2>Pomodoro Timer</h2>
          <div className="timer-display">
            {String(minutes).padStart(2, '0')}:{String(seconds).padStart(2, '0')}
          </div>
          <div className="timer-controls">
            <button className="timer-btn primary" onClick={toggleTimer}>
              {isActive ? "Pause" : "Start"}
            </button>
            <button className="timer-btn secondary" onClick={resetTimer}>Reset</button>
          </div>
        </div>

        {/* TO-DO BLOCK */}
        <div className="todo-card">
          <h2>Focus List</h2>
          <div className="todo-input-row">
            <input 
              type="text" 
              value={inputValue} 
              onChange={(e) => setInputValue(e.target.value)}
              placeholder="Enter the flow..."
            />
            <button onClick={addTask}>Add</button>
          </div>
          <ul className="task-list">
            {tasks.map(task => (
              <li key={task.id} className="task-item">
                <input type="checkbox" />
                <span>{task.text}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
};

export default StudyCorner;