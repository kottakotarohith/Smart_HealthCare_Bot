from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import FileResponse
from fastapi.staticfiles import StaticFiles
from pydantic import BaseModel
import pickle
import numpy as np
import uvicorn
import nest_asyncio

# Initialize FastAPI app
app = FastAPI()

# Allow CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Mount the static folder to serve files (like favicon)
app.mount("/static", StaticFiles(directory="static"), name="static")

# Serve the favicon.ico file
@app.get("/favicon.ico")
def get_favicon():
    return FileResponse("static/favicon.ico")

# Root endpoint
@app.get("/")
def read_root():
    return {"message": "Welcome to the Disease Prediction API"}

# Load your model and symptom columns
model = pickle.load(open('model_1.pkl', 'rb'))  # RandomForest model
print(type(model))
symptom_columns = pickle.load(open('symptom_columns.pkl', 'rb'))  # List of symptoms

# Define the request body
class SymptomInput(BaseModel):
    symptoms: list

# Define prediction endpoint
@app.post("/predict")
async def predict_disease(data: SymptomInput):
    input_symptoms = data.symptoms
    
    # Create a binary vector
    input_vector = np.zeros(len(symptom_columns))
    for symptom in input_symptoms:
        if symptom in symptom_columns:
            idx = symptom_columns.index(symptom)
            input_vector[idx] = 1

    # Predict
    prediction = model.predict([input_vector])[0]  # Directly gives disease name (string)

    return {"predicted_disease": prediction}

# Start Uvicorn server with ngrok
nest_asyncio.apply()

# Expose with ngrok (if necessary, else you can use the regular localhost URL)
# public_url = ngrok.connect(8000)
# print(f"🌍 Public API URL: {public_url}")

uvicorn.run(app, host="127.0.0.1", port=8000)

