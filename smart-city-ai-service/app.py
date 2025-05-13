from fastapi import FastAPI, File, UploadFile, Form, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import HTMLResponse
from utils.model_loader import ProblemDetectionModel
from PIL import Image
import io
import os
import json
import base64
import traceback

# Initializare FastAPI
app = FastAPI(title="Smart City AI Service")

# CORS pentru a permite cereri de la frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Inițializare model AI
MODEL_PATH = os.getenv("MODEL_PATH", "./models/final_best.pt")
problem_detector = ProblemDetectionModel(MODEL_PATH)


# Endpoint pentru ruta principală
@app.get("/")
async def root():
    """Endpoint principal pentru API-ul Smart City AI"""
    return {
        "name": "Smart City AI Service",
        "version": "1.0.0",
        "status": "running",
        "endpoints": [
            {"path": "/", "method": "GET", "description": "Această pagină"},
            {"path": "/docs", "method": "GET", "description": "Documentația API (Swagger)"},
            {"path": "/process", "method": "POST", "description": "Procesează o imagine încărcată"},
            {"path": "/process-base64", "method": "POST", "description": "Procesează o imagine în format base64"},
            {"path": "/test-ui", "method": "GET", "description": "Interfață simplă pentru testare"}
        ]
    }


@app.post("/process")
async def process_image(
        problem_id: int = Form(...),
        image: UploadFile = File(...)
):
    try:
        # Citim conținutul imaginii
        contents = await image.read()
        pil_image = Image.open(io.BytesIO(contents))

        # Procesăm imaginea cu modelul
        results = problem_detector.predict(pil_image)

        # Returnăm rezultatele fără a salva în baza de date
        return {
            "problemId": problem_id,
            "results": results
        }
    except Exception as e:
        # Adăugăm traceback pentru debugging
        error_traceback = traceback.format_exc()
        print(f"Error processing image: {str(e)}\n{error_traceback}")
        raise HTTPException(status_code=500, detail=f"Error processing image: {str(e)}")


@app.post("/process-base64")
async def process_base64_image(data: dict):
    try:
        # Extragem datele
        problem_id = data.get("problemId")
        base64_image = data.get("image")

        if not problem_id or not base64_image:
            raise HTTPException(status_code=400, detail="Missing problemId or image data")

        # Decodăm imaginea din base64
        try:
            image_data = base64.b64decode(base64_image)
            pil_image = Image.open(io.BytesIO(image_data))
        except Exception as e:
            raise HTTPException(status_code=400, detail=f"Error decoding image: {str(e)}")

        # Procesăm imaginea cu modelul
        results = problem_detector.predict(pil_image)

        # Returnăm rezultatele fără a salva în baza de date
        return {
            "problemId": problem_id,
            "results": results
        }
    except HTTPException:
        raise
    except Exception as e:
        # Adăugăm traceback pentru debugging
        error_traceback = traceback.format_exc()
        print(f"Error processing base64 image: {str(e)}\n{error_traceback}")
        raise HTTPException(status_code=500, detail=f"Error processing image: {str(e)}")


# Endpoint pentru interfața de testare
@app.get("/test-ui", response_class=HTMLResponse)
async def test_ui():
    """Interfață simplă pentru testarea modelului"""
    html_content = """
    <!DOCTYPE html>
    <html>
    <head>
        <title>Smart City AI - Test</title>
        <style>
            body { font-family: Arial, sans-serif; max-width: 800px; margin: 0 auto; padding: 20px; }
            .container { display: flex; gap: 20px; }
            .left, .right { flex: 1; }
            img { max-width: 100%; }
            textarea { width: 100%; height: 300px; }
            .button { background: #0066cc; color: white; border: none; padding: 10px 15px; cursor: pointer; }
        </style>
    </head>
    <body>
        <h1>Smart City AI - Testare model</h1>
        <div class="container">
            <div class="left">
                <h2>Încarcă o imagine</h2>
                <form id="uploadForm">
                    <input type="number" id="problemId" placeholder="ID problemă" value="123" required><br><br>
                    <input type="file" id="imageFile" accept="image/*"><br><br>
                    <button type="submit" class="button">Procesează imaginea</button>
                </form>
                <div id="imagePreview" style="margin-top: 20px;"></div>
            </div>
            <div class="right">
                <h2>Rezultate</h2>
                <textarea id="results" readonly></textarea>
            </div>
        </div>

        <script>
            document.getElementById('uploadForm').addEventListener('submit', async function(e) {
                e.preventDefault();

                const fileInput = document.getElementById('imageFile');
                const problemId = document.getElementById('problemId').value;
                const resultsArea = document.getElementById('results');

                if (!fileInput.files[0]) {
                    alert('Te rog selectează o imagine');
                    return;
                }

                // Afișează previzualizarea imaginii
                const preview = document.getElementById('imagePreview');
                const reader = new FileReader();
                reader.onload = function(e) {
                    preview.innerHTML = `<img src="${e.target.result}" alt="Preview">`;
                };
                reader.readAsDataURL(fileInput.files[0]);

                // Convertește imaginea în base64
                const file = fileInput.files[0];
                const base64 = await convertToBase64(file);
                const base64Data = base64.split(',')[1];

                // Trimite cererea
                resultsArea.value = 'Se procesează...';

                try {
                    const response = await fetch('/process-base64', {
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/json',
                        },
                        body: JSON.stringify({
                            problemId: parseInt(problemId),
                            image: base64Data
                        })
                    });

                    const data = await response.json();
                    resultsArea.value = JSON.stringify(data, null, 2);
                } catch (error) {
                    resultsArea.value = `Eroare: ${error.message}`;
                }
            });

            function convertToBase64(file) {
                return new Promise((resolve, reject) => {
                    const reader = new FileReader();
                    reader.onload = () => resolve(reader.result);
                    reader.onerror = error => reject(error);
                    reader.readAsDataURL(file);
                });
            }
        </script>
    </body>
    </html>
    """
    return HTMLResponse(content=html_content)


if __name__ == "__main__":
    import uvicorn

    uvicorn.run(app, host="0.0.0.0", port=8000)