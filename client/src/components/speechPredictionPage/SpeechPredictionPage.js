import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Mic, Loader2, X, Plus } from 'lucide-react';
import axios from 'axios';
import './PredictionPage.css'; // Reusing the same CSS
import { marked } from 'marked';
import DOMPurify from 'dompurify';



const SpeechPredictionPage = () => {
  const [step, setStep] = useState('language-selection');
  const [selectedLanguage, setSelectedLanguage] = useState('en-US');
  const [userInfo, setUserInfo] = useState({ name: '', age: '', weight: '', gender: 'male' });
  const [symptoms, setSymptoms] = useState([]);
  const [isListening, setIsListening] = useState(false);
  const [messages, setMessages] = useState([]);
  const [recognizedText, setRecognizedText] = useState('');
  const [manualInputText, setManualInputText] = useState('');
  const chatRef = useRef(null);
  const recognitionRef = useRef(null);
  const navigate = useNavigate();
  const [showNotification, setShowNotification] = useState(false);
  const [notificationText, setNotificationText] = useState('');
  const [translating, setTranslating] = useState(false);
  const [showManualInput, setShowManualInput] = useState(false);
  const [diseaseInfo, setDiseaseInfo] = useState('');
  const [loadingInfo, setLoadingInfo] = useState(false);

  const createMarkup = (html) => {
    return { __html: DOMPurify.sanitize(html, { ADD_ATTR: ['style'] }) };
  };


  // Language options with their codes for speech recognition
  const languages = [
    { code: 'en-US', name: 'English (US)', apiCode: 'en' },
    { code: 'hi-IN', name: 'Hindi', apiCode: 'hi' },
    { code: 'es-ES', name: 'Spanish', apiCode: 'es' },
    { code: 'fr-FR', name: 'French', apiCode: 'fr' },
    { code: 'de-DE', name: 'German', apiCode: 'de' },
    { code: 'zh-CN', name: 'Chinese (Simplified)', apiCode: 'zh' },
    { code: 'ja-JP', name: 'Japanese', apiCode: 'ja' },
    { code: 'ar-SA', name: 'Arabic', apiCode: 'ar' },
    { code: 'ru-RU', name: 'Russian', apiCode: 'ru' },
    { code: 'pt-BR', name: 'Portuguese (Brazil)', apiCode: 'pt' },
    { code: 'it-IT', name: 'Italian', apiCode: 'it' },
    { code: 'ko-KR', name: 'Korean', apiCode: 'ko' },
    { code: 'nl-NL', name: 'Dutch', apiCode: 'nl' },
    { code: 'tr-TR', name: 'Turkish', apiCode: 'tr' },
    { code: 'pl-PL', name: 'Polish', apiCode: 'pl' }
  ];

  // Predefined translations for common messages
  const translations = {
    'en': {
      greeting: (name) => `Hello${name ? ' ' + name : ''}! You've selected English. Please enter your symptoms one by one.`,
      enterSymptom: 'Please enter your symptom one by one',
      speakSymptom: 'Please speak your symptom clearly',
      translating: 'Translating your symptom...',
      addSymptomPlaceholder: 'Type your symptom here',
      addSymptomButton: 'Add',
      analyzeButton: 'Analyze Symptoms',
      atLeastOneSymptom: 'Please add at least one symptom',
      translationError: 'Translation error. Using original text.',
      recognitionError: 'Speech recognition error',
      recognitionNotSupported: 'Speech recognition not supported',
      confirmTranscription: 'Is this correct? Click ✓ to confirm or ✗ to try again.'
    },
    'es': {
      greeting: (name) => `¡Hola${name ? ' ' + name : ''}! Has seleccionado Español. Por favor, introduzca sus síntomas uno por uno.`,
      enterSymptom: 'Por favor ingrese sus síntomas uno por uno',
      speakSymptom: 'Por favor, indique su síntoma claramente',
      translating: 'Traduciendo su síntoma...',
      addSymptomPlaceholder: 'Escriba su síntoma aquí',
      addSymptomButton: 'Añadir',
      analyzeButton: 'Analizar Síntomas',
      atLeastOneSymptom: 'Por favor añada al menos un síntoma',
      translationError: 'Error de traducción. Usando texto original.',
      recognitionError: 'Error de reconocimiento de voz',
      recognitionNotSupported: 'Reconocimiento de voz no soportado'
    },
    'fr': {
      greeting: (name) => `Bonjour${name ? ' ' + name : ''}! Vous avez sélectionné le Français. Veuillez entrer vos symptômes un par un.`,
      enterSymptom: 'Veuillez entrer vos symptômes un par un',
      speakSymptom: 'Veuillez indiquer clairement votre symptôme',
      translating: 'Traduction de votre symptôme...',
      addSymptomPlaceholder: 'Tapez votre symptôme ici',
      addSymptomButton: 'Ajouter',
      analyzeButton: 'Analyser les Symptômes',
      atLeastOneSymptom: 'Veuillez ajouter au moins un symptôme',
      translationError: 'Erreur de traduction. Utilisation du texte original.',
      recognitionError: 'Erreur de reconnaissance vocale',
      recognitionNotSupported: 'Reconnaissance vocale non prise en charge'
    },
    'de': {
      greeting: (name) => `Hallo${name ? ' ' + name : ''}! Sie haben Deutsch ausgewählt. Bitte geben Sie Ihre Symptome einzeln ein.`,
      enterSymptom: 'Bitte geben Sie Ihre Symptome einzeln ein',
      speakSymptom: 'Bitte sprechen Sie Ihr Symptom deutlich aus',
      translating: 'Übersetzung Ihres Symptoms...',
      addSymptomPlaceholder: 'Geben Sie hier Ihr Symptom ein',
      addSymptomButton: 'Hinzufügen',
      analyzeButton: 'Symptome Analysieren',
      atLeastOneSymptom: 'Bitte fügen Sie mindestens ein Symptom hinzu',
      translationError: 'Übersetzungsfehler. Originaltext wird verwendet.',
      recognitionError: 'Spracherkennungsfehler',
      recognitionNotSupported: 'Spracherkennung nicht unterstützt'
    },
    'hi': {
      greeting: (name) => `नमस्ते${name ? ' ' + name : ''}! आपने हिंदी चुनी है। कृपया अपने लक्षण एक-एक करके दर्ज करें।`,
      enterSymptom: 'कृपया अपने लक्षणों को एक-एक करके दर्ज करें',
      speakSymptom: 'कृपया अपना लक्षण स्पष्ट रूप से बोलें',
      translating: 'आपके लक्षण का अनुवाद किया जा रहा है...',
      addSymptomPlaceholder: 'अपना लक्षण यहां लिखें',
      addSymptomButton: 'जोड़ें',
      analyzeButton: 'लक्षणों का विश्लेषण करें',
      atLeastOneSymptom: 'कृपया कम से कम एक लक्षण जोड़ें',
      translationError: 'अनुवाद त्रुटि। मूल पाठ का उपयोग किया जा रहा है।',
      recognitionError: 'भाषण पहचान त्रुटि',
      recognitionNotSupported: 'भाषण पहचान समर्थित नहीं है'
    },
    'zh': {
      greeting: (name) => `你好${name ? ' ' + name : ''}! 你已选择中文。请逐个输入您的症状。`,
      enterSymptom: '请逐个输入您的症状',
      speakSymptom: '请清晰地说出您的症状',
      translating: '正在翻译您的症状...',
      addSymptomPlaceholder: '在此输入您的症状',
      addSymptomButton: '添加',
      analyzeButton: '分析症状',
      atLeastOneSymptom: '请至少添加一个症状',
      translationError: '翻译错误。使用原始文本。',
      recognitionError: '语音识别错误',
      recognitionNotSupported: '不支持语音识别'
    }
  };

  // Default to English translations if language not found
  const getTranslation = (key, param) => {
    const langCode = selectedLanguage.split('-')[0]; // Extract language code without region
    const langTranslations = translations[langCode] || translations['en'];
    const translation = langTranslations[key] || translations['en'][key];

    return typeof translation === 'function' ? translation(param) : translation;
  };

  useEffect(() => {
    // Initialize notification toast CSS
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
    .manual-input-container {
      display: flex;
      width: 100%;
      margin-bottom: 10px;
    }
    .manual-input-container input {
      flex-grow: 1;
      padding: 10px;
      border-radius: 4px;
      border: 1px solid #ccc;
      margin-right: 5px;
    }
    .manual-input-container button {
      padding: 10px;
      background-color: #007bff;
      color: white;
      border: none;
      border-radius: 4px;
      cursor: pointer;
    }
    .input-actions {
      display: flex;
      gap: 10px;
    }
    .plus-button {
      background-color: #28a745;
      color: white;
      border: none;
      border-radius: 50%;
      width: 40px;
      height: 40px;
      display: flex;
      justify-content: center;
      align-items: center;
      cursor: pointer;
      transition: background-color 0.3s;
    }
    .plus-button:hover {
      background-color: #218838;
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
    // Retrieve user info from localStorage if available
    const savedUserInfo = localStorage.getItem('userInfo');
    if (savedUserInfo) {
      try {
        const parsedInfo = JSON.parse(savedUserInfo);
        setUserInfo(parsedInfo);
      } catch (error) {
        console.error("Error parsing user info from localStorage:", error);
      }
    }
  }, []);

  useEffect(() => {
    // Initialize speech recognition
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (SpeechRecognition) {
      const recognition = new SpeechRecognition();
      recognition.continuous = false;
      recognition.interimResults = true;
      recognition.lang = selectedLanguage;
      recognition.maxAlternatives = 1;

      recognition.onresult = (event) => {
        const lastResultIndex = event.results.length - 1;
        const transcript = event.results[lastResultIndex][0].transcript;
        setRecognizedText(transcript.trim());
        if (event.results[lastResultIndex].isFinal) {
          console.log("Final transcript:", transcript.trim());
          showToast(getTranslation('confirmTranscription'));
        }
      };

      recognition.onend = () => {
        console.log("Speech recognition ended");
        setIsListening(false);

        // Don't automatically add the symptom, wait for user confirmation
      };

      recognition.onerror = (event) => {
        console.error('Speech recognition error', event.error);
        setIsListening(false);
        showToast(`${getTranslation('recognitionError')}: ${event.error}`);
      };

      recognitionRef.current = recognition;
    }
  }, [selectedLanguage]); // Reinitialize when language changes

  const handleLanguageSelect = async () => {
    localStorage.setItem('selectedLanguage', selectedLanguage);
    setStep('symptoms');
    const greeting = getTranslation('greeting', userInfo.name);

    // Add greeting message in the selected language
    setMessages([{ type: 'system', text: greeting }]);

    // Show toast message in selected language
    showToast(getTranslation('enterSymptom'));
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
      showToast(getTranslation('recognitionNotSupported'));
      return;
    }

    if (isListening) {
      recognition.stop();
      setIsListening(false);
    } else {
      showToast(getTranslation('speakSymptom'));
      setRecognizedText('');
      setTimeout(() => {
        try {
          recognition.lang = selectedLanguage;
          recognition.start();
          setIsListening(true);
          console.log("Speech recognition started");
        } catch (error) {
          console.error("Speech recognition error on start:", error);
          showToast(getTranslation('recognitionError'));
        }
      }, 100);
    }
  };

  const toggleManualInput = () => {
    setShowManualInput(!showManualInput);
    if (!showManualInput) {
      setTimeout(() => {
        document.getElementById('symptom-input').focus();
      }, 10);
    }
  };

  const handleManualInputChange = (e) => {
    setManualInputText(e.target.value);
  };

  const handleManualInputSubmit = (e) => {
    e.preventDefault();
    if (manualInputText.trim()) {
      addSymptom(manualInputText.trim());
      setManualInputText('');
    }
  };

  // Translate text to English using our backend API
  const translateToEnglish = async (text, sourceLang) => {
    if (!text.trim()) return '';

    // Get the language code for API (without region)
    const selectedLang = languages.find(lang => lang.code === sourceLang);
    const apiLangCode = selectedLang ? selectedLang.apiCode : sourceLang.split('-')[0];

    // Skip translation if already English
    if (apiLangCode === 'en') return text;

    try {
      setTranslating(true);
      const response = await axios.post("http://127.0.0.1:8000/translate", {
        text: text,
        source_language: apiLangCode,
        target_language: "en"
      });

      return response.data.translated_text;
    } catch (error) {
      console.error("Translation error:", error);
      showToast(getTranslation('translationError'));
      return text;
    } finally {
      setTranslating(false);
    }
  };

  const addSymptom = async (text) => {
    if (!text.trim()) return;

    // Check if we need to translate
    let translatedText = text;
    const isEnglish = selectedLanguage.startsWith('en');

    if (!isEnglish) {
      showToast(getTranslation('translating'));
      translatedText = await translateToEnglish(text, selectedLanguage);
    }

    setSymptoms([...symptoms, translatedText]);
    setMessages([
      ...messages,
      {
        type: 'user',
        text: translatedText,
        originalText: !isEnglish ? text : null
      }
    ]);
    setRecognizedText('');
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
    if (symptoms.length === 0) {
      showToast(getTranslation('atLeastOneSymptom'));
      return;
    }

    // setStep('results');
    const submissionMessage = `I've recorded your symptoms: ${symptoms.join(', ')}. Analyzing your condition...`;
    setMessages([...messages, { type: 'system', text: submissionMessage }]);

    try {
      const response = await axios.post("http://127.0.0.1:8000/predict", {
        symptoms: symptoms,
      });

      const predictedDisease = response.data.predicted_disease;
      setMessages((prev) => [...prev, {
        type: 'system',
        text: `Based on your symptoms, you may have: ${predictedDisease}`,
        disease: predictedDisease
      }]);
          } catch (error) {
      console.error("Prediction error:", error);
      setMessages((prev) => [...prev, { type: 'system', text: "Sorry, we couldn't predict your condition. Please try again later." }]);
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
  useEffect(() => {
    if (chatRef.current) {
      chatRef.current.scrollTop = chatRef.current.scrollHeight;
    }
  }, [messages]);

  return (
    <div className="chat-container">
      {showNotification && (
        <div className="toast-notification">
          {notificationText}
        </div>
      )}

      <div className="sidebar">
        <button
          onClick={() => navigate('/predict')}
          className="home-button"
          title="Go Back"
        >
          <ArrowLeft />
        </button>
      </div>

      <div className="chat-main">
        <div ref={chatRef} className="chat-messages">
          {step === 'language-selection' ? (
            <div className="user-info-form">
              <h2>Select Your Preferred Language</h2>
              <div className="form-group">
                <div className="form-field">
                  <label>Language</label>
                  <select
                    value={selectedLanguage}
                    onChange={(e) => setSelectedLanguage(e.target.value)}
                    className="language-select"
                  >
                    {languages.map((lang) => (
                      <option key={lang.code} value={lang.code}>
                        {lang.name}
                      </option>
                    ))}
                  </select>
                </div>
                <button onClick={handleLanguageSelect}>Continue</button>
              </div>
            </div>
          ) : (
            <>
              {messages.map((message, index) => (
                <div key={index} className={`message ${message.type}`}>
                  <div className="message-content">
                    {message.text}
                    {message.disease && (
                      <button
                        onClick={() => fetchDiseaseInfo(message.disease)}
                        className="get-info-button"
                      >
                        Get More Info
                      </button>
                    )}
                    {message.originalText && (
                      <div className="original-text">
                        <small>(Original: {message.originalText})</small>
                      </div>
                    )}
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
              {loadingInfo && (
                <div className="spinner-container">
                  <div className="loader"></div>
                  <p>Fetching disease information...</p>
                </div>
              )}

              {diseaseInfo && !loadingInfo && (
                <div className="disease-info-display" dangerouslySetInnerHTML={createMarkup(diseaseInfo)} />
              )}
            </>
          )}
        </div>
        

        {step === 'symptoms' && (
          <div className="chat-input">
            {showManualInput && (
              <form onSubmit={handleManualInputSubmit} className="manual-input-container">
                <input
                  id="symptom-input"
                  type="text"
                  value={manualInputText}
                  onChange={handleManualInputChange}
                  placeholder={getTranslation('addSymptomPlaceholder')}
                  disabled={translating}
                />
                <button
                  type="submit"
                  disabled={!manualInputText.trim() || translating}
                >
                  {getTranslation('addSymptomButton')}
                </button>
              </form>
            )}

            {recognizedText && (
              <div className="recognized-text">
                <p>{recognizedText}</p>
                <div className="transcription-actions">
                  <button
                    onClick={() => {
                      addSymptom(recognizedText);
                      setRecognizedText('');
                    }}
                    className="confirm-button"
                    title="Confirm"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <polyline points="20 6 9 17 4 12"></polyline>
                    </svg>
                  </button>
                  <button
                    onClick={() => {
                      setRecognizedText('');
                      showToast(getTranslation('speakSymptom'));
                      setTimeout(() => toggleListening(), 500);
                    }}
                    className="reject-button"
                    title="Try again"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <line x1="18" y1="6" x2="6" y2="18"></line>
                      <line x1="6" y1="6" x2="18" y2="18"></line>
                    </svg>
                  </button>
                </div>
              </div>
            )}

            <div className="input-actions">
              <button
                onClick={toggleManualInput}
                className="plus-button"
                title="Add symptom manually"
                disabled={translating}
              >
                <Plus size={24} />
              </button>

              <button
                onClick={toggleListening}
                className={`mic-button ${isListening ? 'active' : ''}`}
                disabled={translating}
              >
                {isListening ? (
                  <Loader2 className="spin" size={24} />
                ) : (
                  <Mic size={24} />
                )}
              </button>

              <button
                onClick={handleSubmit}
                className="submit-button"
                disabled={symptoms.length === 0 || isListening || translating}
              >
                {translating ? (
                  <Loader2 className="spin" size={18} />
                ) : (
                  getTranslation('analyzeButton')
                )}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default SpeechPredictionPage;