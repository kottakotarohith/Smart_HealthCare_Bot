import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Send, Mic, X, Plus, Loader2 } from 'lucide-react';
import axios from 'axios';
import SymptomInputArea from '../symptomInputArea/SymptomInputArea';
import './PredictionPage.css';

const PredictionPage = () => {
  const [step, setStep] = useState('user-info');
  const [userInfo, setUserInfo] = useState({ name: '', age: '', weight: '', gender: 'male' });
  const [currentSymptom, setCurrentSymptom] = useState('');
  const [symptoms, setSymptoms] = useState([]);
  const [isListening, setIsListening] = useState(false);
  const [messages, setMessages] = useState([]);
  const chatRef = useRef(null);
  const recognitionRef = useRef(null);
  const navigate = useNavigate();
  const [showNotification, setShowNotification] = useState(false);
  const [notificationText, setNotificationText] = useState('');

  useEffect(() => {
    const toastCSS = `
    .toast-notification {
      position: fixed;
      top: 20px;
      left: 50%;
      transform: translateX(-50%);
      background-color: rgba(0, 0, 0, 0.7);
      color: white;
      padding: 10px 20px;
      border-radius: 5px;
      z-index: 1000;
      animation: fadeInOut 3s ease;
    }
    @keyframes fadeInOut {
      0% { opacity: 0; }
      10% { opacity: 1; }
      90% { opacity: 1; }
      100% { opacity: 0; }
    }
    `;
    const styleTag = document.createElement('style');
    styleTag.innerHTML = toastCSS;
    document.head.appendChild(styleTag);

    return () => {
      document.head.removeChild(styleTag);
    };
  }, []);

  useEffect(() => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (SpeechRecognition) {
      const recognition = new SpeechRecognition();
      recognition.continuous = false;
      recognition.interimResults = true;
      recognition.lang = 'en-US';
      recognition.maxAlternatives = 1;

      recognition.onresult = (event) => {
        const lastResultIndex = event.results.length - 1;
        const transcript = event.results[lastResultIndex][0].transcript;
        setCurrentSymptom(transcript.trim());
        if (event.results[lastResultIndex].isFinal) {
          console.log("Final transcript:", transcript.trim());
        }
      };

      recognition.onend = () => {
        console.log("Speech recognition ended");
        setIsListening(false);
      };

      recognition.onerror = (event) => {
        console.error('Speech recognition error', event.error);
        setIsListening(false);
      };

      recognitionRef.current = recognition;
    }
  }, []);

  const handleUserInfoSubmit = (e) => {
    if (e) e.preventDefault();
    if (!userInfo.name || !userInfo.age || !userInfo.weight) return;
    setStep('symptoms');
    const greeting = `Hello ${userInfo.name}! I see you're ${userInfo.age} years old, weighing ${userInfo.weight} kg, and you identify as ${userInfo.gender}. What symptoms are you experiencing today?`;
    setMessages([...messages, { type: 'system', text: greeting }]);
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setUserInfo({ ...userInfo, [name]: value });
  };

  const handleSymptomInputChange = (e) => {
    setCurrentSymptom(e.target.value);
  };

  const addSymptom = () => {
    if (currentSymptom.trim()) {
      const newSymptom = currentSymptom.trim();
      setSymptoms([...symptoms, newSymptom]);
      setMessages([...messages, { type: 'user', text: newSymptom }]);
      setCurrentSymptom('');
    }
  };

  const removeSymptom = (index) => {
    const newSymptoms = [...symptoms];
    newSymptoms.splice(index, 1);
    setSymptoms(newSymptoms);

    const newMessages = [...messages];
    let userMessageCount = 0;
    let messageIndex = -1;
    for (let i = 0; i < newMessages.length; i++) {
      if (newMessages[i].type === 'user') {
        if (userMessageCount === index) {
          messageIndex = i;
          break;
        }
        userMessageCount++;
      }
    }
    if (messageIndex !== -1) {
      newMessages.splice(messageIndex, 1);
      setMessages(newMessages);
    }
  };

  const handleSubmit = async () => {
    setStep('results');
    const submissionMessage = `I've recorded your symptoms: ${symptoms.join(', ')}. Analyzing your condition...`;
    setMessages([...messages, { type: 'system', text: submissionMessage }]);

    try {
      const response = await axios.post("http://127.0.0.1:8000/predict", {
        symptoms: symptoms,
      });

      const predictedDisease = response.data.predicted_disease;
      setMessages((prev) => [...prev, { type: 'system', text: `Based on your symptoms, you may have: ${predictedDisease}` }]);
    } catch (error) {
      console.error("Prediction error:", error);
      setMessages((prev) => [...prev, { type: 'system', text: "Sorry, we couldn't predict your condition. Please try again later." }]);
    }
  };

  const showToast = (message) => {
    setNotificationText(message);
    setShowNotification(true);
    setTimeout(() => {
      setShowNotification(false);
    }, 3000);
  };

  const toggleListening = () => {
    const recognition = recognitionRef.current;
    if (!recognition) {
      showToast("Speech recognition not supported");
      return;
    }

    if (isListening) {
      recognition.stop();
      setIsListening(false);
    } else {
      showToast("Please speak your complete symptom (e.g. 'rapid heartbeat')");
      setCurrentSymptom('');
      setTimeout(() => {
        try {
          recognition.start();
          setIsListening(true);
          console.log("Speech recognition started");
        } catch (error) {
          console.error("Speech recognition error on start:", error);
          showToast("Error starting speech recognition");
        }
      }, 100);
    }
  };

  useEffect(() => {
    if (chatRef.current) {
      chatRef.current.scrollTop = chatRef.current.scrollHeight;
    }
  }, [messages]);

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      if (step === 'symptoms') {
        addSymptom();
      } else if (step === 'user-info') {
        handleUserInfoSubmit();
      }
    }
  };

  return (
    <div className="chat-container">
      {showNotification && (
        <div className="toast-notification">
          {notificationText}
        </div>
      )}
      <div className="sidebar">
        <button
          onClick={() => window.location.href = '/'}
          className="home-button"
          title="Go to Home"
        >
          🏠
        </button>
      </div>
      <div className="chat-main">
        <div ref={chatRef} className="chat-messages">
          {step === 'user-info' ? (
            <div className="user-info-form">
              <h2>Welcome to Symptom Checker</h2>
              <div className="form-group">
                {['name', 'age', 'weight'].map((field) => (
                  <div key={field} className="form-field">
                    <label>{field.charAt(0).toUpperCase() + field.slice(1)}</label>
                    <input
                      type={field === 'name' ? 'text' : 'number'}
                      name={field}
                      value={userInfo[field]}
                      onChange={handleInputChange}
                      onKeyPress={handleKeyPress}
                    />
                  </div>
                ))}
                <div className="form-field">
                  <label>Gender</label>
                  <select
                    name="gender"
                    value={userInfo.gender}
                    onChange={handleInputChange}
                  >
                    <option value="male">Male</option>
                    <option value="female">Female</option>
                    <option value="other">Other</option>
                  </select>
                </div>
                <button onClick={handleUserInfoSubmit}>Continue</button>
              </div>
            </div>
          ) : (
            <>
              <div
                className="language-banner"
                onClick={() => navigate('/predict-speech')}
              >
                If you wish to express your symptoms in your preferred language click here
              </div>
              {messages.map((message, index) => (
                <div key={index} className={`message ${message.type}`}>
                  <div className="message-content">
                    {message.text}
                    {message.type === 'user' && (
                      <button
                        onClick={() => {
                          const symptomIndex = symptoms.indexOf(message.text);
                          if (symptomIndex !== -1) removeSymptom(symptomIndex);
                        }}
                        className="remove-button"
                      >
                        <X size={16} />
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </>
          )}
        </div>

        {step === 'symptoms' && (
          <>
            <SymptomInputArea
              currentSymptom={currentSymptom}
              onSymptomChange={handleSymptomInputChange}
              addSymptom={addSymptom}
              toggleListening={toggleListening}
              handleSubmit={handleSubmit}
              isListening={isListening}
              recognitionAvailable={!!recognitionRef.current}
              symptoms={symptoms}
              disabled={step === 'results'}
              onKeyPress={handleKeyPress}
            />
          </>
        )}

      </div>
    </div>
  );
};

export default PredictionPage;




// imports
// import { useState, useEffect, useRef } from 'react';
// import { useNavigate } from 'react-router-dom';
// import { Send, Mic, X, Plus, Loader2 } from 'lucide-react';
// import axios from 'axios';
// import SymptomInputArea from '../symptomInputArea/SymptomInputArea';
// import './PredictionPage.css';

// const PredictionPage = () => {
//   const [step, setStep] = useState('user-info');
//   const [userInfo, setUserInfo] = useState({ name: '', age: '', weight: '', gender: 'male' });
//   const [currentSymptom, setCurrentSymptom] = useState('');
//   const [symptoms, setSymptoms] = useState([]);
//   const [isListening, setIsListening] = useState(false);
//   const [messages, setMessages] = useState([]);
//   const chatRef = useRef(null);
//   const recognitionRef = useRef(null);
//   const navigate = useNavigate();
//   const [showNotification, setShowNotification] = useState(false);
//   const [notificationText, setNotificationText] = useState('');

//   // toast setup
//   useEffect(() => {
//     const toastCSS = `
//       .toast-notification {
//         position: fixed;
//         top: 20px;
//         left: 50%;
//         transform: translateX(-50%);
//         background-color: rgba(0, 0, 0, 0.7);
//         color: white;
//         padding: 10px 20px;
//         border-radius: 5px;
//         z-index: 1000;
//         animation: fadeInOut 3s ease;
//       }
//       @keyframes fadeInOut {
//         0% { opacity: 0; }
//         10% { opacity: 1; }
//         90% { opacity: 1; }
//         100% { opacity: 0; }
//       }
//     `;
//     const styleTag = document.createElement('style');
//     styleTag.innerHTML = toastCSS;
//     document.head.appendChild(styleTag);

//     return () => {
//       document.head.removeChild(styleTag);
//     };
//   }, []);

//   // speech recognition
//   useEffect(() => {
//     const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
//     if (SpeechRecognition) {
//       const recognition = new SpeechRecognition();
//       recognition.continuous = false;
//       recognition.interimResults = true;
//       recognition.lang = 'en-US';
//       recognition.maxAlternatives = 1;

//       recognition.onresult = (event) => {
//         const transcript = event.results[event.results.length - 1][0].transcript;
//         setCurrentSymptom(transcript.trim());
//       };

//       recognition.onend = () => setIsListening(false);
//       recognition.onerror = () => setIsListening(false);

//       recognitionRef.current = recognition;
//     }
//   }, []);

//   const handleUserInfoSubmit = (e) => {
//     if (e) e.preventDefault();
//     if (!userInfo.name || !userInfo.age || !userInfo.weight) return;
//     setStep('symptoms');
//     const greeting = `Hello ${userInfo.name}! I see you're ${userInfo.age} years old, weighing ${userInfo.weight} kg, and you identify as ${userInfo.gender}. What symptoms are you experiencing today?`;
//     setMessages([...messages, { type: 'system', text: greeting }]);
//   };

//   const handleInputChange = (e) => {
//     const { name, value } = e.target;
//     setUserInfo({ ...userInfo, [name]: value });
//   };

//   const handleSymptomInputChange = (e) => setCurrentSymptom(e.target.value);

//   const addSymptom = () => {
//     if (currentSymptom.trim()) {
//       const newSymptom = currentSymptom.trim();
//       setSymptoms([...symptoms, newSymptom]);
//       setMessages([...messages, { type: 'user', text: newSymptom }]);
//       setCurrentSymptom('');
//     }
//   };

//   const removeSymptom = (index) => {
//     const newSymptoms = [...symptoms];
//     newSymptoms.splice(index, 1);
//     setSymptoms(newSymptoms);

//     const newMessages = [...messages];
//     let userMessageCount = 0;
//     let messageIndex = -1;
//     for (let i = 0; i < newMessages.length; i++) {
//       if (newMessages[i].type === 'user') {
//         if (userMessageCount === index) {
//           messageIndex = i;
//           break;
//         }
//         userMessageCount++;
//       }
//     }
//     if (messageIndex !== -1) {
//       newMessages.splice(messageIndex, 1);
//       setMessages(newMessages);
//     }
//   };

//   const handleSubmit = async () => {
//     setStep('results');
//     const submissionMessage = `I've recorded your symptoms: ${symptoms.join(', ')}. Analyzing your condition...`;
//     setMessages([...messages, { type: 'system', text: submissionMessage }]);

//     try {
//       const response = await axios.post("http://127.0.0.1:8000/predict", { symptoms });
//       const predictedDisease = response.data.predicted_disease;
//       setMessages((prev) => [...prev, {
//         type: 'system',
//         text: `Based on your symptoms, you may have: ${predictedDisease}`,
//         disease: predictedDisease
//       }]);
//     } catch {
//       setMessages((prev) => [...prev, { type: 'system', text: "Sorry, we couldn't predict your condition. Please try again later." }]);
//     }
//   };

//   const toggleListening = () => {
//     const recognition = recognitionRef.current;
//     if (!recognition) return;
//     if (isListening) {
//       recognition.stop();
//       setIsListening(false);
//     } else {
//       recognition.start();
//       setIsListening(true);
//     }
//   };

//   const handleKeyPress = (e) => {
//     if (e.key === 'Enter' && !e.shiftKey) {
//       e.preventDefault();
//       step === 'symptoms' ? addSymptom() : handleUserInfoSubmit();
//     }
//   };

//   return (
//     <div className="chat-container">
//       {showNotification && <div className="toast-notification">{notificationText}</div>}

//       <div className="sidebar">
//         <button onClick={() => window.location.href = '/'} className="home-button">🏠</button>
//       </div>

//       <div className="chat-main">
//         <div ref={chatRef} className="chat-messages">
//           {step === 'user-info' ? (
//             <div className="user-info-form">
//               <h2>Welcome to Symptom Checker</h2>
//               <div className="form-group">
//                 {['name', 'age', 'weight'].map((field) => (
//                   <div key={field} className="form-field">
//                     <label>{field.charAt(0).toUpperCase() + field.slice(1)}</label>
//                     <input
//                       type={field === 'name' ? 'text' : 'number'}
//                       name={field}
//                       value={userInfo[field]}
//                       onChange={handleInputChange}
//                       onKeyPress={handleKeyPress}
//                     />
//                   </div>
//                 ))}
//                 <div className="form-field">
//                   <label>Gender</label>
//                   <select name="gender" value={userInfo.gender} onChange={handleInputChange}>
//                     <option value="male">Male</option>
//                     <option value="female">Female</option>
//                     <option value="other">Other</option>
//                   </select>
//                 </div>
//                 <button onClick={handleUserInfoSubmit}>Continue</button>
//               </div>
//             </div>
//           ) : (
//             <>
//               {messages.map((message, index) => (
//                 <div key={index} className={`message ${message.type}`}>
//                   <div className="message-content">
//                     {message.text}
//                     {message.disease && (
//                       <button
//                         onClick={() => navigate(`/disease-info/${encodeURIComponent(message.disease)}`)}
//                         className="get-info-button"
//                       >
//                         Get More Info
//                       </button>
//                     )}
//                     {message.type === 'user' && (
//                       <button
//                         onClick={() => {
//                           const i = symptoms.indexOf(message.text);
//                           if (i !== -1) removeSymptom(i);
//                         }}
//                         className="remove-button"
//                       >
//                         <X size={16} />
//                       </button>
//                     )}
//                   </div>
//                 </div>
//               ))}
//             </>
//           )}
//         </div>

//         {step === 'symptoms' && (
//           <SymptomInputArea
//             currentSymptom={currentSymptom}
//             onSymptomChange={handleSymptomInputChange}
//             addSymptom={addSymptom}
//             toggleListening={toggleListening}
//             handleSubmit={handleSubmit}
//             isListening={isListening}
//             recognitionAvailable={!!recognitionRef.current}
//             symptoms={symptoms}
//             disabled={step === 'results'}
//             onKeyPress={handleKeyPress}
//           />
//         )}
//       </div>
//     </div>
//   );
// };

// export default PredictionPage;
