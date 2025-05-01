// SymptomInputArea.js
import React from 'react';
import { Send, Mic, Plus } from 'lucide-react';
import './SymptomInputArea.css';

const SymptomInputArea = ({
  currentSymptom,
  onSymptomChange,
  addSymptom,
  toggleListening,
  handleSubmit,
  isListening,
  recognitionAvailable,
  symptoms,
  disabled,
  onKeyPress,
}) => {
  return (
    <div className="chat-input-area">
      <div className="input-wrapper">
        <input
          type="text"
          value={currentSymptom}
          onChange={onSymptomChange}
          onKeyPress={onKeyPress}
          placeholder="Enter a symptom..."
          disabled={isListening || disabled}
        />
        <div className="input-buttons">
          <button
            onClick={addSymptom}
            disabled={!currentSymptom.trim() || isListening || disabled}
            title="Add Symptom"
          >
            <Plus size={20} />
          </button>
          <button
            onClick={toggleListening}
            disabled={!recognitionAvailable || disabled}
            title="Toggle Listening"
            className={isListening ? 'listening' : ''}
          >
            <Mic size={20} />
          </button>
          <button
            onClick={handleSubmit}
            disabled={symptoms.length === 0 || disabled}
            title="Submit Symptoms"
          >
            <Send size={20} />
          </button>
        </div>
      </div>
      {symptoms.length > 0 && (
        <div className="symptom-count">
          {symptoms.length} symptom{symptoms.length !== 1 ? 's' : ''} added.
        </div>
      )}
      {!recognitionAvailable && (
        <div className="no-speech-support">
          Speech recognition is not supported in your browser.
        </div>
      )}
    </div>
  );
};

export default SymptomInputArea;
