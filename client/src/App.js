// src/App.js
import React, { useState } from 'react';
import { createBrowserRouter, RouterProvider } from 'react-router-dom';
import RootLayout from './RootLayout';
import Home from './components/home/Home';
import LanguageContext from './LanguageContext';
import PredictionPage from './components/predictionPage/PredictionPage'
import SpeechPredictionPage from './components/speechPredictionPage/SpeechPredictionPage';
import DiseaseInfoPage from './components/diseaseInfoPage/DiseaseInfoPage';
function App() {
  const [language, setLanguage] = useState('English');
  const router = createBrowserRouter([
    {
      path: '/',
      element: <RootLayout />,
      children: [
        {
          path: "",
          element: <Home />
        },
        {
          path: "/predict",
          element: <PredictionPage />
        },
        {
          path: "/predict-speech",
          element:<SpeechPredictionPage/>
        },
        {
          path:"/disease-info/:diseaseName",
          element:<DiseaseInfoPage />
        }
      ],
    },
  ]);

  return (
    <LanguageContext.Provider value={{ language, setLanguage }}>
      <RouterProvider router={router} />
    </LanguageContext.Provider>
  );
}

export default App;
