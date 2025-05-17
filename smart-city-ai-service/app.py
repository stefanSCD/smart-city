"""
Smart City AI Service - API pentru detectarea problemelor urbane cu informații contextuale
"""
import os
import base64
import json
import logging
from fastapi import FastAPI, UploadFile, File, HTTPException, Form, Body
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import Optional
from azure.ai.inference import ChatCompletionsClient
from azure.ai.inference.models import SystemMessage, UserMessage
from azure.core.credentials import AzureKeyCredential
from dotenv import load_dotenv
from datetime import datetime
import uvicorn

# Încărcăm variabilele de mediu
load_dotenv()

# Configurare logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

# Model pentru informațiile introduse de utilizator
class ProblemInfo(BaseModel):
    category: Optional[str] = None
    description: Optional[str] = None

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
def get_system_prompt():
    return (
        "Ești un asistent inteligent pentru Smart City specializat în identificarea problemelor urbane și atribuirea lor departamentului potrivit pentru rezolvare. "
        "Analizează imaginile pentru a detecta și raporta următoarele tipuri de probleme, asociate cu departamentele responsabile: "

        "1. PRIMĂRIE - responsabil pentru: clădiri în stare de degradare, toalete publice insalubre, "
        "ziduri sau fațade cu risc de prăbușire, nereguli în magazine alimentare, capace de canal lipsă/afundate, probleme administrative cum"
        "ar fi mobilier local stricat spre exemplu banci rupte, leagane publice rupte "

        "2. POLIȚIE - responsabil pentru: graffiti ilegal, parcări ilegale, activități comerciale ilegale pe trotuar, "
        "biciclete sau trotinete lăsate haotic pe trotuar, acte de vandalism, persoane suspecte, încălcări ale legii, accidente de circulatie. "

        "3. SALUBRIZARE - responsabil pentru: coșuri de gunoi pline/deteriorate, containere de reciclare supraaglomerate, "
        "zone cu deșeuri aruncate ilegal (moloz, gunoi menajer, electronice), nereguli în centrele de reciclare, curățarea străzilor, a parcurilor și a zonelor publice. "

        "4. ILUMINAT_PUBLIC - responsabil pentru: stâlpi de iluminat nefuncționali, "
        "zone cu iluminat public aprins ziua, întreținerea sistemului de iluminat public. "

        "5. SPAȚII_VERZI - responsabil pentru: iarbă netunsă, copaci căzuți sau crengi rupte periculoase, "
        "întreținerea parcurilor, plantarea și îngrijirea arborilor și arbuștilor, amenajarea spațiilor verzi. "

        "6. DRUMURI_PUBLICE - responsabil pentru: construcția, repararea și întreținerea drumurilor, gropi în șosea (potholes)"
        "trotuarelor, podurilor și viaductelor, semnalizarea rutieră, marcaje rutiere. "
        
        "7. OK - ATENTIE! SE POATE SA NU FIE NICIO PROBLEMA IN IMAGINE!"

        "Pentru fiecare imagine, identifică exact UN SINGUR departament responsabil principal (cel mai potrivit)"
        " dintre: primarie, politie, salubrizare, iluminat_public, spatii_verzi, drumuri_publice. "
        "Chiar dacă vezi mai multe probleme, alege departamentul cel mai potrivit pentru problema principală sau cea mai gravă. "
        "În câmpul detected_category din JSON, pune DOAR numele departamentului responsabil (exact unul din cele 6 menționate), nu alte informații. "
        "Detected objects sa fie o scurta descriere a problemei ce se gaseste in imagine, maxim 10 cuvinte"
        "și oferă o evaluare a urgenței intervenției necesare (redusă, medie, ridicată). "
    )

async def analyze_image(image_data, problem_info=None):
    """
    Analizează o imagine pentru a detecta probleme urbane.

    Args:
        image_data (bytes): Datele imaginii în format binar
        problem_info (ProblemInfo, optional): Informații suplimentare despre problemă

    Returns:
        dict: Rezultatul analizei în format JSON
    """
    try:
        # Convertim imaginea în base64
        base64_image = base64.b64encode(image_data).decode('utf-8')

        # Construim prompt-ul cu informații suplimentare dacă există
        prompt_text = "Analizează această imagine și identifică orice problemă urbană prezentă."

        if problem_info:
            if problem_info.category:
                prompt_text += f" Utilizatorul a indicat că problema este legată de: {problem_info.category}."

            if problem_info.description:
                prompt_text += f" Utilizatorul a furnizat următoarea descriere: \"{problem_info.description}\". Folosește această descriere pentru a ghida analiza ta."

        prompt_text += " Returnează răspunsul DOAR în format JSON cu următoarea structură exactă:"
        prompt_text += " {\"detected_category\": \"[departamentul responsabil (exact unul din: primarie, politie, salubrizare, iluminat_public, spatii_verzi, drumuri_publice, ok)]\", \"detected_objects\": \"[o scurta descriere a problemei gasite in imagine]\" , \"severity_score\": [număr între 1-10, unde 1 este minim și 10 este maxim], \"estimated_fix_time\": \"[timpul estimat pentru remediere: un numar de zile sau ore estimat ex: 2 zile , 3 ore, etc]}. Nu include text suplimentar, doar răspunsul JSON."

        vision_prompt = {
            "role": "user",
            "content": [
                {
                    "type": "text",
                    "text": prompt_text
                },
                {
                    "type": "image_url",
                    "image_url": {
                        "url": f"data:image/jpeg;base64,{base64_image}"
                    }
                }
            ]
        }

        messages = [SystemMessage(get_system_prompt()), UserMessage(vision_prompt)]

        logger.info("Trimit imagine pentru analiză cu informații suplimentare")
        if problem_info:
            logger.info(f"Categoria indicată: {problem_info.category}")
            logger.info(f"Descriere: {problem_info.description}")

        response = client.complete(
            messages=messages,
            temperature=0.7,
            top_p=0.95,
            max_tokens=500,
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
                "detected_category": "error",
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
            "detected_category": "error",
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
async def analyze_problem_image(
    file: UploadFile = File(...),
    category: Optional[str] = Form(None),
    description: Optional[str] = Form(None)
):
    """
    Endpoint pentru analiza imaginilor cu probleme urbane.
    Primește o imagine și informații opționale despre problemă și o analizează pentru a detecta probleme urbane.
    """
    try:
        # Verificăm dacă fișierul este o imagine
        if not file.content_type.startswith("image/"):
            raise HTTPException(status_code=400, detail="Fișierul trimis nu este o imagine")

        # Citim conținutul fișierului
        contents = await file.read()

        # Creăm obiectul cu informații despre problemă
        problem_info = ProblemInfo(
            category=category,
            description=description
        )

        # Analizăm imaginea cu informațiile suplimentare
        result = await analyze_image(contents, problem_info)

        # Adăugăm timestamp pentru procesare
        result["processed_at"] = datetime.now().isoformat()

        # Adăugăm informațiile introduse de utilizator la rezultat
        if category:
            result["user_category"] = category
        if description:
            result["user_description"] = description

        return result

    except Exception as e:
        logger.error(f"Eroare la procesarea imaginii: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Eroare la procesarea imaginii: {str(e)}")

@app.post("/analyze/json")
async def analyze_problem_image_json(
    file: UploadFile = File(...),
    problem_info: ProblemInfo = Body(...)
):
    """
    Endpoint alternativ pentru analiza imaginilor, folosind JSON pentru informațiile despre problemă.
    """
    try:
        # Verificăm dacă fișierul este o imagine
        if not file.content_type.startswith("image/"):
            raise HTTPException(status_code=400, detail="Fișierul trimis nu este o imagine")

        # Citim conținutul fișierului
        contents = await file.read()

        # Analizăm imaginea cu informațiile suplimentare
        result = await analyze_image(contents, problem_info)

        # Adăugăm timestamp pentru procesare
        result["processed_at"] = datetime.now().isoformat()

        # Adăugăm informațiile introduse de utilizator la rezultat
        if problem_info.category:
            result["user_category"] = problem_info.category
        if problem_info.description:
            result["user_description"] = problem_info.description

        return result

    except Exception as e:
        logger.error(f"Eroare la procesarea imaginii: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Eroare la procesarea imaginii: {str(e)}")

if __name__ == "__main__":
    # Rulează aplicația cu Uvicorn când este executată direct
    uvicorn.run("app:app", host="0.0.0.0", port=8000, reload=True)