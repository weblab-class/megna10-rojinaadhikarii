import React, { useState, useEffect, useContext, useRef } from "react";
import confetti from "canvas-confetti"; 
import "./StudyCorner.css";
import { UserContext } from "../App"; 
import { get, post } from "../../utilities";

const StudyCorner = () => {
  const { userId, setUserId } = useContext(UserContext); 

  // --- Pomodoro State ---
  const [minutes, setMinutes] = useState(25);
  const [seconds, setSeconds] = useState(0);
  const [isActive, setIsActive] = useState(false);
  const [mode, setMode] = useState("session"); 
  const [breakLength, setBreakLength] = useState(5); 
  const [sessionLength, setSessionLength] = useState(25); 
  const [sessionsCompleted, setSessionsCompleted] = useState(0);
  const dailyGoal = 4; 

  // --- Audio State ---
  const [currentSound, setCurrentSound] = useState(null); 
  const audioRef = useRef(null);

  // Define sounds matching your public/sounds folder
  const soundLibrary = [
    { id: 'rain', label: 'Rain', icon: '🌧️', file: 'rain' },
    { id: 'lofi', label: 'Lo-Fi', icon: '🎧', file: 'lofi' },
    { id: 'cafe lofi', label: 'Cafe', icon: '🍵', file: 'cafe lofi' },
    { id: 'rain lofi', label: 'Rain Lofi', icon: '💧', file: 'rain lofi' },
    { id: 'library', label: 'Library', icon: '📚', file: 'library' }
  ];

  // --- Focus List State ---
  const [tasks, setTasks] = useState([]);
  const [inputValue, setInputValue] = useState("");
  const [estPomodoros, setEstPomodoros] = useState(1);

  // Sync tasks from database on load
  useEffect(() => {
    if (userId && userId.tasks) {
      setTasks(userId.tasks);
    }
  }, [userId]); 

  // --- Updated Sound Logic ---
  const handleSoundToggle = (soundId, fileName) => {
    if (currentSound === soundId) {
      audioRef.current.pause();
      setCurrentSound(null);
    } else {
      setCurrentSound(soundId);
      if (audioRef.current) {
        audioRef.current.pause();
      }
      // Accessing files from the public/sounds/ directory
      const audioPath = `/sounds/${fileName}.mp3`;
      audioRef.current = new Audio(audioPath);
      audioRef.current.loop = true;
      audioRef.current.play().catch(e => console.log("Audio blocked", e));
    }
  };

  useEffect(() => {
    return () => {
      if (audioRef.current) audioRef.current.pause();
    };
  }, []);

  // --- Timer & Confetti ---
  const triggerConfetti = () => {
    confetti({
      particleCount: 100,
      spread: 70,
      origin: { y: 0.6 },
      colors: ['#A1B3A8', '#FDFBF9', '#000000'] 
    });
  };

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

  // --- Task Persistence ---
  const updateAndSaveTasks = (newTasks) => {
    setTasks(newTasks);
    post("/api/tasks", { tasks: newTasks }).then((updatedUser) => {
      setUserId(updatedUser);
    }).catch((err) => console.error("Failed to save tasks:", err));
  };

  const addTask = () => {
    if (inputValue.trim()) {
      const newTask = { 
        id: Date.now().toString(),
        text: inputValue, 
        completed: false,
        estimate: estPomodoros 
      };
      updateAndSaveTasks([...tasks, newTask]);
      setInputValue("");
      setEstPomodoros(1); 
    }
  };

  const deleteTask = (taskId) => {
    updateAndSaveTasks(tasks.filter(t => t.id !== taskId));
  };

  const toggleComplete = (taskId) => {
    updateAndSaveTasks(tasks.map(t => t.id === taskId ? { ...t, completed: !t.completed } : t));
  };

  return (
    <div className="study-corner-container">
      <h1 className="corner-title">Study Corner</h1>
      
      <div className="corner-layout-vertical">
        <div className="top-content-row">
          
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
                <div className="setting-block">
                  <div className="setting-controls">
                    <button onClick={() => setBreakLength(Math.max(1, Number(breakLength) - 1))}>-</button>
                    <input type="number" className="setting-input" value={breakLength} readOnly />
                    <button onClick={() => setBreakLength(Number(breakLength) + 1)}>+</button>
                  </div>
                  <div className="setting-label">Break Length</div>
                </div>

                <div className="setting-block">
                  <div className="setting-controls">
                    <button onClick={() => {
                      const newVal = Math.max(1, Number(sessionLength) - 1);
                      setSessionLength(newVal);
                      if(!isActive && mode === 'session') setMinutes(newVal);
                    }}>-</button>
                    <input type="number" className="setting-input" value={sessionLength} readOnly />
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
                    <div key={i} className={`session-dot ${i < sessionsCompleted ? "filled" : ""}`} />
                  ))}
                </div>
              </div>
            </div>

            <div className="atmosphere-card">
              <h3 className="atmosphere-title">Atmosphere</h3>
              <div className="sound-controls-row">
                {/* Dynamically rendering all sounds from your folder */}
                {soundLibrary.map((sound) => (
                  <button 
                    key={sound.id}
                    className={`sound-btn ${currentSound === sound.id ? 'active' : ''}`}
                    onClick={() => handleSoundToggle(sound.id, sound.file)}
                  >
                    {sound.icon} {sound.label}
                  </button>
                ))}
              </div>
            </div>
          </div> 
          
          {/* RIGHT COLUMN: FOCUS LIST */}
          <div className="todo-card">
            <h2>Focus List</h2>
            <div className="todo-input-row">
              <input 
                type="text" 
                value={inputValue} 
                onChange={(e) => setInputValue(e.target.value)}
                placeholder="Enter the flow..."
              />
              <select className="est-select" value={estPomodoros} onChange={(e) => setEstPomodoros(Number(e.target.value))}>
                <option value="1">1 🍅</option>
                <option value="2">2 🍅</option>
                <option value="3">3 🍅</option>
                <option value="4">4 🍅</option>
              </select>
              <button onClick={addTask}>Add</button>
            </div>

            <ul className="task-list">
              {tasks.map(task => (
                <li key={task.id} className={`task-item ${task.completed ? "completed" : ""}`}>
                  <input type="checkbox" checked={task.completed} onChange={() => toggleComplete(task.id)} />
                  <div className="task-content">
                    <span>{task.text}</span>
                    <span className="tomato-count">{"🍅".repeat(task.estimate)}</span>
                  </div>
                  <button className="delete-task-btn" onClick={() => deleteTask(task.id)}>×</button>
                </li>
              ))}
            </ul>
          </div>

        </div>
      </div>
    </div>
  );
};

export default StudyCorner;