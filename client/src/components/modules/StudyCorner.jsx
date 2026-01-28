import React, { useState, useEffect, useContext, useRef } from "react";
import confetti from "canvas-confetti";
import "./StudyCorner.css";
import { UserContext } from "../App";
import { get, post } from "../../utilities";

const StudyCorner = () => {
  const { userId, setUserId } = useContext(UserContext);

  // timer settings
  const [breakLength, setBreakLength] = useState(Number(localStorage.getItem("breakLength")) || 5);
  const [sessionLength, setSessionLength] = useState(
    Number(localStorage.getItem("sessionLength")) || 25
  );

  // clock state
  const [minutes, setMinutes] = useState(() => {
    const savedMins = localStorage.getItem("activeMinutes");
    return savedMins !== null
      ? Number(savedMins)
      : Number(localStorage.getItem("sessionLength")) || 25;
  });
  const [seconds, setSeconds] = useState(() => {
    const savedSecs = localStorage.getItem("activeSeconds");
    return savedSecs !== null ? Number(savedSecs) : 0;
  });

  const [isActive, setIsActive] = useState(false);
  const [mode, setMode] = useState("session");
  const [sessionsCompleted, setSessionsCompleted] = useState(0);
  const dailyGoal = 6;

  // audio handling
  const [currentSound, setCurrentSound] = useState(null);
  const audioRef = useRef(null);

  const soundLibrary = [
    { id: "rain", label: "rain", icon: "🌧️", file: "rain" },
    { id: "lofi", label: "lo-fi", icon: "🎧", file: "lofi" },
    { id: "cafe lofi", label: "cafe", icon: "🍵", file: "cafe lofi" },
    { id: "rain lofi", label: "rain lofi", icon: "💧", file: "rain lofi" },
    { id: "library", label: "library", icon: "📚", file: "library" },
  ];

  // task list state
  const [tasks, setTasks] = useState([]);
  const [inputValue, setInputValue] = useState("");
  const [estPomodoros, setEstPomodoros] = useState(1);

  // fetch user tasks on load
  useEffect(() => {
    if (userId && userId.tasks) {
      setTasks(userId.tasks);
    }
  }, [userId]);

  // persist settings to local storage
  useEffect(() => {
    localStorage.setItem("breakLength", breakLength);
    localStorage.setItem("sessionLength", sessionLength);
    localStorage.setItem("activeMinutes", minutes);
    localStorage.setItem("activeSeconds", seconds);
  }, [breakLength, sessionLength, minutes, seconds]);

  const handleSoundToggle = (soundId, fileName) => {
    if (currentSound === soundId) {
      audioRef.current.pause();
      setCurrentSound(null);
    } else {
      setCurrentSound(soundId);
      if (audioRef.current) audioRef.current.pause();
      audioRef.current = new Audio(`/sounds/${fileName}.mp3`);
      audioRef.current.loop = true;
      audioRef.current.play().catch((e) => console.log("Audio blocked", e));
    }
  };

  useEffect(() => {
    return () => {
      if (audioRef.current) audioRef.current.pause();
    };
  }, []);

  const triggerConfetti = () => {
    confetti({
      particleCount: 100,
      spread: 70,
      origin: { y: 0.6 },
      colors: ["#A1B3A8", "#FDFBF9", "#000000"],
    });
  };

  // timer logic
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
          localStorage.removeItem("activeMinutes");
          localStorage.removeItem("activeSeconds");
          if (mode === "session") {
            triggerConfetti();
            setSessionsCompleted((prev) => prev + 1);
            setMode("break");
            setMinutes(breakLength);
          } else {
            setMode("session");
            setMinutes(sessionLength);
          }
          setIsActive(false);
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
    localStorage.removeItem("activeMinutes");
    localStorage.removeItem("activeSeconds");
  };

  const updateAndSaveTasks = (newTasks) => {
    setTasks(newTasks);
    post("/api/tasks", { tasks: newTasks })
      .then((updatedUser) => setUserId(updatedUser))
      .catch((err) => console.error("Failed to save tasks:", err));
  };

  const addTask = () => {
    if (inputValue.trim()) {
      const newTask = {
        id: Date.now().toString(),
        text: inputValue,
        completed: false,
        estimate: estPomodoros,
      };
      updateAndSaveTasks([...tasks, newTask]);
      setInputValue("");
      setEstPomodoros(1);
    }
  };

  const deleteTask = (taskId) => updateAndSaveTasks(tasks.filter((t) => t.id !== taskId));
  const toggleComplete = (taskId) =>
    updateAndSaveTasks(tasks.map((t) => (t.id === taskId ? { ...t, completed: !t.completed } : t)));

  return (
    <div className="study-corner-container">
      <h1 className="corner-title">study corner</h1>

      <div className="corner-layout-vertical">
        <div className="top-content-row">
          {/* LEFT COLUMN: Instructions + Goal + Timer */}
          <div className="left-column">
            <div className="map-instruction-box">
              <div className="instruction-text">
                <p>
                  <strong>1. set the vibe</strong>
                  <br />
                  pick an ambient soundscape from the atmosphere panel
                </p>
                <p>
                  <strong>2. plan your flow</strong>
                  <br />
                  add a task and use the 🍅 dropdown to estimate sessions.
                </p>
                <p>
                  <strong>3. manage the clock</strong>
                  <br />
                  customize work/break intervals to match your energy.
                </p>
                <p>
                  <strong>4. hit your daily goals</strong>
                  <br />
                  complete sessions to fill your tracker. aim for 6 dots!
                </p>
              </div>
            </div>

            <div className="goal-card">
              <div className="session-tracker">
                <span className="tracker-label">daily goal:</span>
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

            <div className="pomodoro-card">
              <div className="timer-display-box">
                <div className="timer-label">{mode === "session" ? "SESSION" : "ON BREAK"}</div>
                <div className="timer-time">
                  {String(minutes).padStart(2, "0")}:{String(seconds).padStart(2, "0")}
                </div>
                <div className="timer-main-controls">
                  <button className="timer-btn-simple" onClick={toggleTimer}>
                    {isActive ? "pause" : "start"}
                  </button>
                  <button className="timer-btn-simple" onClick={resetTimer}>
                    reset
                  </button>
                </div>
              </div>

              <div className="timer-settings-row">
                <div className="setting-block">
                  <div className="setting-controls">
                    <button
                      onClick={() => {
                        const v = Math.max(1, breakLength - 1);
                        setBreakLength(v);
                        if (!isActive && mode === "break") setMinutes(v);
                      }}
                    >
                      -
                    </button>
                    <input
                      type="number"
                      className="setting-input"
                      value={breakLength}
                      onChange={(e) => setBreakLength(parseInt(e.target.value) || "")}
                    />
                    <button
                      onClick={() => {
                        const v = breakLength + 1;
                        setBreakLength(v);
                        if (!isActive && mode === "break") setMinutes(v);
                      }}
                    >
                      +
                    </button>
                  </div>
                  <div className="setting-label">break length</div>
                </div>

                <div className="setting-block">
                  <div className="setting-controls">
                    <button
                      onClick={() => {
                        const v = Math.max(1, sessionLength - 1);
                        setSessionLength(v);
                        if (!isActive && mode === "session") setMinutes(v);
                      }}
                    >
                      -
                    </button>
                    <input
                      type="number"
                      className="setting-input"
                      value={sessionLength}
                      onChange={(e) => setSessionLength(parseInt(e.target.value) || "")}
                    />
                    <button
                      onClick={() => {
                        const v = sessionLength + 1;
                        setSessionLength(v);
                        if (!isActive && mode === "session") setMinutes(v);
                      }}
                    >
                      +
                    </button>
                  </div>
                  <div className="setting-label">session length</div>
                </div>
              </div>
            </div>
          </div>

          {/* RIGHT COLUMN: Atmosphere + Focus List */}
          <div className="right-column">
            <div className="atmosphere-card">
              <h3 className="atmosphere-title">atmosphere</h3>
              <div className="sound-controls-row">
                {soundLibrary.map((sound) => (
                  <button
                    key={sound.id}
                    className={`sound-btn ${currentSound === sound.id ? "active" : ""}`}
                    onClick={() => handleSoundToggle(sound.id, sound.file)}
                  >
                    {sound.icon} {sound.label}
                  </button>
                ))}
              </div>
            </div>

            <div className="todo-card">
              <h2>focus list</h2>
              <div className="todo-input-row">
                <input
                  type="text"
                  value={inputValue}
                  onChange={(e) => setInputValue(e.target.value)}
                  placeholder="enter the flow..."
                />
                <select
                  className="est-select"
                  value={estPomodoros}
                  onChange={(e) => setEstPomodoros(Number(e.target.value))}
                >
                  {[1, 2, 3, 4, 5, 6].map((n) => (
                    <option key={n} value={n}>
                      {n} 🍅
                    </option>
                  ))}
                </select>
                <button onClick={addTask}>Add</button>
              </div>
              <ul className="task-list">
                {tasks.map((task) => (
                  <li key={task.id} className={`task-item ${task.completed ? "completed" : ""}`}>
                    <input
                      type="checkbox"
                      checked={task.completed}
                      onChange={() => toggleComplete(task.id)}
                    />
                    <div className="task-content">
                      <span>{task.text}</span>
                      <span className="tomato-count">{"🍅".repeat(task.estimate)}</span>
                    </div>
                    <button className="delete-task-btn" onClick={() => deleteTask(task.id)}>
                      ×
                    </button>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default StudyCorner;
