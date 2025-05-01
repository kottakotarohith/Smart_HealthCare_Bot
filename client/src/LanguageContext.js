// src/LanguageContext.js
import { createContext } from "react";

const LanguageContext = createContext({
  language: "English",
  setLanguage: () => {}
});

export default LanguageContext;
