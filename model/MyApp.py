from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import FileResponse
from fastapi.staticfiles import StaticFiles
from pydantic import BaseModel
import pickle
import numpy as np
import uvicorn
import nest_asyncio
import translators as ts

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
print("Model loaded successfully:", type(model))
symptom_columns = pickle.load(open('symptom_columns.pkl', 'rb'))  # List of symptoms
print(f"Loaded {len(symptom_columns)} symptoms")

# Define the request bodies
class SymptomInput(BaseModel):
    symptoms: list

class TranslationRequest(BaseModel):
    text: str
    source_language: str
    target_language: str = "en"

# Match a translated symptom to the closest one in our database
def match_symptom_to_database(translated_text):
    # Convert to lowercase for better matching
    translated_text = translated_text.lower().strip()
    
    # Direct match
    for symptom in symptom_columns:
        if translated_text == symptom.lower():
            return symptom
            
    # Partial match
    for symptom in symptom_columns:
        if translated_text in symptom.lower() or symptom.lower() in translated_text:
            return symptom
            
    # If no match found, return the original (translation will be used as-is)
    return translated_text

# Define translation endpoint
@app.post("/translate")
async def translate_text(request: TranslationRequest):
    try:
        print(f"Translating from {request.source_language} to {request.target_language}: {request.text}")
        
        # Use translators library to translate the text
        translated = ts.translate_text(
            query_text=request.text,
            from_language=request.source_language,
            to_language=request.target_language,
            translator='google'  # You can use 'bing', 'google', etc.
        )
        
        # Match to existing symptoms if possible
        matched_symptom = match_symptom_to_database(translated)
        
        print(f"Translation result: '{request.text}' → '{translated}' → '{matched_symptom}'")
        
        return {
            "original_text": request.text,
            "translated_text": matched_symptom,
            "raw_translation": translated,
            "source_language": request.source_language,
            "target_language": request.target_language
        }
    except Exception as e:
        print(f"Translation error: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Translation error: {str(e)}")

# Define prediction endpoint
@app.post("/predict")
async def predict_disease(data: SymptomInput):
    try:
        input_symptoms = data.symptoms
        print(f"Received symptoms for prediction: {input_symptoms}")
        
        # Create a binary vector
        input_vector = np.zeros(len(symptom_columns))
        for symptom in input_symptoms:
            if symptom in symptom_columns:
                idx = symptom_columns.index(symptom)
                input_vector[idx] = 1
            else:
                print(f"Warning: Symptom '{symptom}' not found in database")

        # Predict
        prediction = model.predict([input_vector])[0]  # Directly gives disease name (string)
        print(f"Prediction result: {prediction}")

        return {"predicted_disease": prediction}
    except Exception as e:
        print(f"Prediction error: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Prediction error: {str(e)}")

# Start Uvicorn server
if __name__ == "__main__":
    print("Starting Disease Prediction API with Translation support...")
    
    # Apply nest_asyncio for Jupyter compatibility if needed
    nest_asyncio.apply()
    
    # Start the server
    uvicorn.run(app, host="127.0.0.1", port=8000)