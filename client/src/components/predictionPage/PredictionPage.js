// src/components/predictionPage/PredictionPage.js
import axios from 'axios';
import { X } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import SymptomInputArea from '../symptomInputArea/SymptomInputArea';
import './PredictionPage.css';
import { predict_path } from '../config';
import { marked } from 'marked';
import DOMPurify from 'dompurify';


const PredictionPage = () => {
  const [step, setStep] = useState('user-info');
  const [userInfo, setUserInfo] = useState({ name: '', age: '', weight: '', gender: 'male' });
  const [currentSymptom, setCurrentSymptom] = useState('');
  const [symptoms, setSymptoms] = useState([]);
  const [isListening, setIsListening] = useState(false);
  const [messages, setMessages] = useState([]);
  const [diseaseInfo, setDiseaseInfo] = useState('');
  const chatRef = useRef(null);
  const recognitionRef = useRef(null);
  const navigate = useNavigate();
  const [showNotification, setShowNotification] = useState(false);
  const [notificationText, setNotificationText] = useState('');
  const [errors, setErrors] = useState({});
  const [loadingInfo, setLoadingInfo] = useState(false);


  // const createMarkup = (markdown) => {
  //   const cleanMarkdown = markdown.replace(/\*/g, ''); // remove asterisks
  //   const html = marked(cleanMarkdown);
  //   return { __html: DOMPurify.sanitize(html) };
  // };
  const createMarkup = (html) => {
    return { __html: DOMPurify.sanitize(html, { ADD_ATTR: ['style'] }) };
  };

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
    return () => document.head.removeChild(styleTag);
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
      };
      recognition.onend = () => setIsListening(false);
      recognition.onerror = (event) => {
        console.error('Speech recognition error', event.error);
        setIsListening(false);
      };
      recognitionRef.current = recognition;
    }
  }, []);

  const handleUserInfoSubmit = (e) => {
    if (e) e.preventDefault();
    const newErrors = {};
    if (!/^[a-zA-Z\s]+$/.test(userInfo.name.trim())) newErrors.name = 'Name should contain only alphabets.';
    const age = parseInt(userInfo.age);
    if (isNaN(age) || age < 1 || age > 149) newErrors.age = 'Age must be between 2 and 149.';
    const weight = parseFloat(userInfo.weight);
    if (isNaN(weight) || weight <= 3) newErrors.weight = 'Weight must be more than 3 kg.';
    setErrors(newErrors);
    if (Object.keys(newErrors).length > 0) return;

    localStorage.setItem('userInfo', JSON.stringify(userInfo));
    setStep('symptoms');
    const greeting = `Hello ${userInfo.name}! I see you're ${userInfo.age} years old, weighing ${userInfo.weight} kg, and you identify as ${userInfo.gender}. What symptoms are you experiencing today?`;
    setMessages([...messages, { type: 'system', text: greeting }]);
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setUserInfo({ ...userInfo, [name]: value });
  };

  const handleSymptomInputChange = (e) => setCurrentSymptom(e.target.value);

  const addSymptom = () => {
    if (!currentSymptom.trim()) return;
    const updatedSymptoms = [...symptoms, currentSymptom.trim()];
    setSymptoms(updatedSymptoms);
    localStorage.setItem('symptoms', JSON.stringify(updatedSymptoms));
    setMessages([...messages, { type: 'user', text: currentSymptom.trim() }]);
    setCurrentSymptom('');
  };

  const removeSymptom = (index) => {
    const newSymptoms = [...symptoms];
    newSymptoms.splice(index, 1);
    setSymptoms(newSymptoms);
    localStorage.setItem('symptoms', JSON.stringify(newSymptoms));
    const newMessages = [...messages];
    let userMsgCount = 0, removeIndex = -1;
    for (let i = 0; i < newMessages.length; i++) {
      if (newMessages[i].type === 'user') {
        if (userMsgCount === index) {
          removeIndex = i;
          break;
        }
        userMsgCount++;
      }
    }
    if (removeIndex !== -1) {
      newMessages.splice(removeIndex, 1);
      setMessages(newMessages);
    }
  };

  const handleSubmit = async () => {
    if (symptoms.length === 0) return showToast('Please enter at least one symptom.');
    setMessages([...messages, { type: 'system', text: `Analyzing your symptoms: ${symptoms.join(', ')}...` }]);
    try {
      const response = await axios.post(`${predict_path}/predict`, { symptoms });
      const predictedDisease = response.data.predicted_disease;
      localStorage.setItem('predictedDisease', predictedDisease);
      setMessages((prev) => [...prev, {
        type: 'system',
        text: `Based on your symptoms, you may have: ${predictedDisease}`,
        disease: predictedDisease,
      }]);
    } catch (error) {
      console.error("Prediction error:", error);
      setMessages((prev) => [...prev, { type: 'system', text: "Sorry, we couldn't predict your condition at this time." }]);
    }
  };

  const fetchDiseaseInfo = async (disease) => {
    setLoadingInfo(true);
    setDiseaseInfo('');
    try {
      const response = await axios.post('http://localhost:5000/get-disease-info', { disease });
      setDiseaseInfo(response.data.info);
    } catch (error) {
      showToast('Failed to fetch disease info');
      console.error(error);
    } finally {
      setLoadingInfo(false);
    }
  };

  const showToast = (message) => {
    setNotificationText(message);
    setShowNotification(true);
    setTimeout(() => setShowNotification(false), 3000);
  };

  const toggleListening = () => {
    const recognition = recognitionRef.current;
    if (!recognition) return showToast("Speech recognition not supported");
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
        } catch (error) {
          console.error("Speech recognition error on start:", error);
          showToast("Error starting speech recognition");
        }
      }, 100);
    }
  };

  useEffect(() => {
    if (chatRef.current) chatRef.current.scrollTop = chatRef.current.scrollHeight;
  }, [messages]);

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      step === 'symptoms' ? addSymptom() : handleUserInfoSubmit();
    }
  };

  return (
    <div className="chat-container">
      {showNotification && <div className="toast-notification">{notificationText}</div>}
      <div className="sidebar">
        <button onClick={() => window.location.href = '/'} className="home-button" title="Go to Home">🏠</button>
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
                    {errors[field] && <p className="error-text">{errors[field]}</p>}
                  </div>
                ))}
                <div className="form-field">
                  <label>Gender</label>
                  <select name="gender" value={userInfo.gender} onChange={handleInputChange}>
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
              <div className="language-banner" onClick={() => navigate('/predict-speech')}>
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
                    {message.disease && (
                      <button onClick={() => fetchDiseaseInfo(message.disease)} className="get-info-button">
                        Get Info
                      </button>
                    )}
                  </div>
                </div>
              ))}

              {loadingInfo && (
                <div className="spinner-container">
                  <div className="loader"></div>
                  <p>Fetching disease information...</p>
                </div>
              )}

              {diseaseInfo && !loadingInfo && (
                <div
                  className="disease-info-display"
                  dangerouslySetInnerHTML={createMarkup(diseaseInfo)}
                />
              )}
            </>
          )}
        </div>
        {step !== 'user-info' && (
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
        )}
      </div>
    </div>
  );
};

export default PredictionPage;
