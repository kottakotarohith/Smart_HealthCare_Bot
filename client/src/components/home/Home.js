// src/components/Home.js
import React, { useState, useEffect, useContext } from "react";
import './Home.css';
import {useNavigate}  from 'react-router-dom';

import img1 from '../../images/img1.png';
import LanguageContext from "../../LanguageContext";
import translations from "../../translations";
import Header from '../header/Header';

const rotatingWords = ["men", "women", "adults", "parents", "seniors", "children", "you"];

const Home = () => {
  const { language } = useContext(LanguageContext);
  const t = translations[language];
  const navigate = useNavigate();
  const [text, setText] = useState('');
  const [index, setIndex] = useState(0);
  const [typing, setTyping] = useState(true);


  const goToPrediction = () => {
    navigate('/predict');
  };

  useEffect(() => {
    const currentWord = rotatingWords[index % rotatingWords.length];

    let timeout;
    if (typing) {
      if (text.length < currentWord.length) {
        timeout = setTimeout(() => {
          setText(currentWord.slice(0, text.length + 1));
        }, 150);
      } else {
        timeout = setTimeout(() => setTyping(false), 1000);
      }
    } else {
      timeout = setTimeout(() => {
        setText('');
        setTyping(true);
        setIndex((prev) => (prev + 1) % rotatingWords.length);
      }, 300);
    }

    return () => clearTimeout(timeout);
  }, [text, typing, index]);

  return (
   <div>
     <Header/>
    <div className="symptom-container">
      <div className="symptom-text">
        <h1 className="symptom-heading">
          {t.headline} <span className="highlight typewriter">{text}</span>
        </h1>
        <ul className="symptom-list">
          {t.list.map((line, i) => <li key={i}>{line}</li>)}
        </ul>
        <div className="symptom-buttons">
          <button className="btn-secondary"   onClick={() => goToPrediction()}>{t.chatbotButton}</button>
        </div>
      </div>
      <div className="symptom-image">
        <img src={img1} style={{ height: '400px' }} alt="Symptom Checker" />
      </div>
    </div>
   </div>
  );
};

export default Home;
