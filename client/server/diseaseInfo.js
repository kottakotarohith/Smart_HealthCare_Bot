const { API_KEY } = require('../src/components/config');
const { GoogleGenerativeAI } = require('@google/generative-ai');
const genAI = new GoogleGenerativeAI(API_KEY);

async function getDiseaseInfo(disease) {
  const model = genAI.getGenerativeModel({ model: 'gemini-2.0-flash' });

  // Read selected language from localStorage (or default to English)
  const language = typeof window !== 'undefined' && localStorage.getItem('selectedLanguage')
    ? localStorage.getItem('selectedLanguage')
    : 'English';

  const prompt = `
Respond in ${language}. Provide a structured HTML-formatted overview of "${disease}" with the following sections:

<h1 style="color:blue;">1. Brief Description</h1>
<h3 style="color:blue;">Overview</h3>
<i>[Sentence 1]</i><br>
<i>[Sentence 2]</i><br>
<i>[Max 5 sentences total]</i><br>

<h1 style="color:blue;">2. Common Symptoms</h1>
<h3 style="color:blue;">Symptoms</h3>
<i>[Symptom 1]</i><br>
<i>[Symptom 2]</i><br>
<i>[Max 5 symptoms]</i><br>

<h1 style="color:blue;">3. Precautions</h1>
<h3 style="color:blue;">What to Do</h3>
<i>[Precaution 1]</i><br>
<i>[Precaution 2]</i><br>
<i>[Max 5 precautions]</i><br>

<h1 style="color:blue;">4. Food Recommendations</h1>
<h3 style="color:blue;">What to Eat</h3>
<i>[Food 1]</i><br>
<i>[Food 2]</i><br>
<i>[Max 5 foods]</i><br>

<h1 style="color:blue;">5. Foods to Avoid</h1>
<h3 style="color:blue;">What Not to Eat</h3>
<i>[Food 1]</i><br>
<i>[Food 2]</i><br>
<i>[Max 5 foods]</i><br>

Rules:
- Use only HTML formatting as shown above
- Use <br> at the end of each line of content
- Do not add any extra sections or bullet points
- Keep sentences short and simple
- No introductions or conclusions
- Keep the text informative and easy to understand
- Skip rare or complicated cases
`;

  const result = await model.generateContent(prompt);
  const response = await result.response;
  return response.text();
}

module.exports = { getDiseaseInfo };
