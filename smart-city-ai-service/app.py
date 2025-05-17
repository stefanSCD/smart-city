"""
Smart City AI Service - API pentru detectarea problemelor urbane
"""
import os
import base64
import json
import logging
from fastapi import FastAPI, UploadFile, File, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from azure.ai.inference import ChatCompletionsClient
from azure.ai.inference.models import SystemMessage, UserMessage
from azure.core.credentials import AzureKeyCredential
from dotenv import load_dotenv
from datetime import datetime
import uvicorn
import tempfile

# Încărcăm variabilele de mediu
load_dotenv()

# Configurare logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

# Configurare Azure AI
token = os.environ.get("AZURE_API_KEY", "")
endpoint = os.environ.get("AZURE_ENDPOINT", "https://models.inference.ai.azure.com")
model_name = os.environ.get("AZURE_MODEL_NAME", "gpt-4o")

# Inițializare client Azure AI
client = ChatCompletionsClient(
    endpoint=endpoint,
    credential=AzureKeyCredential(token),
)

# Creează aplicația FastAPI
app = FastAPI(title="Smart City AI Service",
              description="API pentru detectarea problemelor urbane din imagini",
              version="1.0.0")

# Configurare CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # În producție, specificați originile exacte
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Prompt-uri pentru Azure AI
system_prompt = (
    "Ești un asistent inteligent pentru Smart City specializat în identificarea problemelor urbane și atribuirea lor departamentului potrivit pentru rezolvare. "
    "Analizează imaginile pentru a detecta și raporta următoarele tipuri de probleme, asociate cu departamentele responsabile: "

    "1. SALUBRIZARE - responsabil pentru: coșuri de gunoi pline/deteriorate, containere de reciclare supraaglomerate, "
    " nereguli în centrele de reciclare, curățarea străzilor, a parcurilor și a zonelor publice. "

    "2. POLIȚIE - responsabil pentru: graffiti ilegal, parcări ilegale, activități comerciale ilegale pe trotuar, "
    "biciclete sau trotinete lăsate haotic pe trotuar, acte de vandalism, persoane suspecte, încălcări ale legii. "

    "3. PRIMĂRIE - responsabil pentru: clădiri în stare de degradare, grafitti ilegal"

    "4. SPAȚII VERZI - responsabil pentru: iarbă netunsă, copaci căzuți sau crengi rupte periculoase, "
    "întreținerea parcurilor, plantarea și îngrijirea arborilor și arbuștilor, amenajarea spațiilor verzi. "

    "5. ILUMINAT PUBLIC - responsabil pentru: stâlpi de iluminat nefuncționali, "
    "zone cu iluminat public aprins ziua, întreținerea sistemului de iluminat public. "

    "6. DRUMURI PUBLICE - responsabil pentru: gropi în șosea, semne de circulație lipsă sau deteriorate, "
    "repararea drumurilor, trotuarelor și aleilor, întreținerea infrastructurii rutiere. Consideră aceste probleme ca fiind în responsabilitatea departamentului PRIMĂRIE. "

    "Pentru fiecare imagine, identifică exact UN SINGUR departament responsabil principal (cel mai potrivit) dintre: salubrizare, politie, primarie, iluminat_public, spatii_verzi. "
    "Chiar dacă vezi mai multe probleme, alege departamentul cel mai potrivit pentru problema principală sau cea mai gravă. "
    "În câmpul detected_category din JSON, pune DOAR numele departamentului responsabil, nu alte informații.  "
    "și oferă o evaluare a urgenței intervenției necesare (un numar de la 1 la 10, 1 insemnand minim si 10 maxim). "
)

async def analyze_image(image_data):
    """
    Analizează o imagine pentru a detecta probleme urbane.

    Args:
        image_data (bytes): Datele imaginii în format binar

    Returns:
        dict: Rezultatul analizei în format JSON
    """
    try:
        # Convertim imaginea în base64
        base64_image = base64.b64encode(image_data).decode('utf-8')

        vision_prompt = {
            "role": "user",
            "content": [
                {
                    "type": "text",
                    "text": "Analizează această imagine și identifică orice problemă urbană prezentă."
                            "Returnează răspunsul DOAR în format JSON cu următoarea structură exactă:"
                            " {\"detected_category\": \"[departamentul responsabil (alege exact unul): salubrizare, politie, primarie, iluminat_public, spatii_verzi, drumuri_publice]\", \"severity_score\": [număr între 1-10, unde 1 este minim și 10 este maxim], \"estimated_fix_time\": \"[timpul estimat pentru remediere: un numar de zile sau ore estimat de exemplu : 2 ore, 1 zi , etc ]\"}. Nu include text suplimentar, doar răspunsul JSON."
                },
                {
                    "type": "image_url",
                    "image_url": {
                        "url": f"data:image/jpeg;base64,{base64_image}"
                    }
                }
            ]
        }

        messages = [SystemMessage(system_prompt), UserMessage(vision_prompt)]

        logger.info("Trimit imagine pentru analiză")

        response = client.complete(
            messages=messages,
            temperature=0.7,
            top_p=0.95,
            max_tokens=300,
            model=model_name
        )

        answer = response.choices[0].message.content
        logger.info("Am primit răspuns pentru analiza imaginii")

        # Asigură-te că răspunsul este JSON valid
        try:
            result = json.loads(answer)
            return result
        except json.JSONDecodeError:
            logger.error(f"Răspunsul nu este un JSON valid: {answer}")
            # Încercăm să extragem doar partea JSON din răspuns
            import re
            json_match = re.search(r'{.*}', answer, re.DOTALL)
            if json_match:
                try:
                    result = json.loads(json_match.group(0))
                    return result
                except:
                    pass

            # Returnăm un JSON standard de eroare dacă nu putem parsa răspunsul
            return {
                "detected_category": ["error"],
                "severity_score": 0,
                "estimated_fix_time": "0",
                "detected_objects": {
                    "error": {
                        "descriere": "Nu s-a putut analiza imaginea",
                        "problema": "Eroare la procesarea răspunsului AI"
                    }
                }
            }

    except Exception as e:
        logger.error(f"Eroare la analiza imaginii: {str(e)}")
        return {
            "detected_category": ["error"],
            "severity_score": 0,
            "estimated_fix_time": "0",
            "detected_objects": {
                "error": {
                    "descriere": f"Eroare: {str(e)}",
                    "problema": "Eroare la comunicarea cu serviciul AI"
                }
            }
        }

@app.get("/")
async def root():
    return {"message": "Smart City AI Service API", "status": "active"}

@app.post("/analyze")
async def analyze_problem_image(file: UploadFile = File(...)):
    """
    Endpoint pentru analiza imaginilor cu probleme urbane.
    Primește o imagine și o analizează pentru a detecta probleme urbane.
    """
    try:
        # Verificăm dacă fișierul este o imagine
        if not file.content_type.startswith("image/"):
            raise HTTPException(status_code=400, detail="Fișierul trimis nu este o imagine")

        # Citim conținutul fișierului
        contents = await file.read()

        # Analizăm imaginea
        result = await analyze_image(contents)

        # Adăugăm timestamp pentru procesare
        result["processed_at"] = datetime.now().isoformat()

        return result

    except Exception as e:
        logger.error(f"Eroare la procesarea imaginii: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Eroare la procesarea imaginii: {str(e)}")

@app.post("/analyze/file_path")
async def analyze_problem_image_from_path(file_path: str):
    """
    Endpoint pentru testare - analizează o imagine folosind calea locală.
    IMPORTANT: Doar pentru testare, nu utilizați în producție.
    """
    try:
        if not os.path.exists(file_path):
            raise HTTPException(status_code=404, detail=f"Fișierul {file_path} nu a fost găsit")

        with open(file_path, "rb") as image_file:
            contents = image_file.read()

        result = await analyze_image(contents)
        result["processed_at"] = datetime.now().isoformat()

        return result

    except Exception as e:
        logger.error(f"Eroare la procesarea imaginii locale: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Eroare la procesarea imaginii: {str(e)}")

if __name__ == "__main__":
    # Rulează aplicația cu Uvicorn când este executată direct
    uvicorn.run("app:app", host="0.0.0.0", port=8000, reload=True)