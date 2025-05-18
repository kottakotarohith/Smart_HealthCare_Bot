// src/components/Header.js
import './Header.css';
import React, { useContext } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { FaBars, FaTimes } from 'react-icons/fa';
import logo from '../../images/logo.png';
import LanguageContext from '../../LanguageContext';


const Header = () => {
  const [menuOpen, setMenuOpen] = React.useState(false);
  const { language, setLanguage } = useContext(LanguageContext);
  const navigate = useNavigate();

  const toggleMenu = () => {
    setMenuOpen(!menuOpen);
  };

  const goToPrediction = () => {
    navigate('/predict');
  };

  return (
    <header className="header">
      <div className="left-section">
        <FaBars className="icon menu-icon" onClick={toggleMenu} />
        <img src={logo} alt="Logo" className="logo-img" />
        <h3 style={{ color: '#3498db' }}> SympTrack</h3>
      </div>

      {menuOpen && (
        <nav className="nav-small">
          <FaTimes className="icon close-icon" onClick={toggleMenu} />
          <NavLink to="/" className="nav-link  home px-3">Home</NavLink>
          {/* <NavLink to="/about" className="nav-link" onClick={toggleMenu}>About Us</NavLink> */}
          <select className="language-select" value={language} onChange={(e) => setLanguage(e.target.value)}>
            <option value="English">English</option>
            <option value="Spanish">Spanish</option>
            <option value="Hindi">Hindi</option>
            <option value="Telugu">Telugu</option>
          </select>
          <button className="predict-btn" onClick={() => { toggleMenu(); goToPrediction(); }}>
            Try Chatbot
          </button>
        </nav>
      )}

      <div className="center-section">
        <nav className="nav-large">
          <NavLink to="/" className="nav-link  home px-3">Home</NavLink>
          {/* <NavLink to="/about" className="nav-link px-3">About Us</NavLink> */}
          <select className="language-select" value={language} onChange={(e) => setLanguage(e.target.value)}>
            <option value="English">English</option>
            <option value="Spanish">Spanish</option>
            <option value="Hindi">Hindi</option>
            <option value="Telugu">Telugu</option>
          </select>
          
          <button className="predict-btn" onClick={goToPrediction}>
            Try Chatbot
          </button>
        </nav>
      </div>
    </header>
  );
};

export default Header;
