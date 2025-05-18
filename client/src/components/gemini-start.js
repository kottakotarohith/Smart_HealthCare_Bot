// gemini-start.js (CommonJS)

const {API_KEY} = require('./config')
const { GoogleGenerativeAI } = require('@google/generative-ai');
const genAI = new GoogleGenerativeAI(API_KEY);

async function run() {
  const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });
  const prompt = "Write a sonnet about a programmer's life but also make it rhyme";
  const res = await model.generateContent(prompt);
  const response = await res.response;
  const text = response.text();
  console.log(text);
}

run();