FROM python:3.10-slim

WORKDIR /app

# Copierea fișierelor necesare
COPY requirements.txt .
COPY app.py .
COPY .env .

# Instalarea dependențelor
RUN pip install --no-cache-dir -r requirements.txt

# Expune portul pe care rulează aplicația
EXPOSE 8000

# Rulează aplicația
CMD ["uvicorn", "app:app", "--host", "0.0.0.0", "--port", "8000"]