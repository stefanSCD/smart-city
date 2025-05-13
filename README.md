# 🌆 Smart City Platform

Acest proiect reprezintă o platformă Smart City ce include un frontend, un backend și un serviciu AI. Backend-ul este construit în Node.js și utilizează PostgreSQL pentru stocarea datelor.

---

## 📁 Structura proiectului

```
smart-city/               # Frontend (React)
smart-city-backend/       # Backend (Node.js + PostgreSQL)
smart-city-ai-service/    # Serviciu AI (Python)
```

---

## 🧑‍💻 Cum rulezi proiectul local (Windows)

### 1. Clonează repository-ul

```bash
git clone https://github.com/stefanSCD/smart-city.git
cd smart-city
```

---

## 🔧 Configurare backend (`smart-city-backend`)

### 2. Instalează PostgreSQL

* Descarcă de pe: [https://www.postgresql.org/download/windows/](https://www.postgresql.org/download/windows/)
* În timpul instalării:

  * Reține parola setată pentru utilizatorul `postgres`
  * Lasă portul implicit: `5432`

### 3. Creează baza de date

1. Deschide aplicația `SQL Shell (psql)`
2. Conectează-te cu utilizatorul `postgres`
3. Rulează următoarele comenzi:

```sql
CREATE DATABASE smart_city_db;
CREATE USER smart_user WITH ENCRYPTED PASSWORD 'parola_ta';
GRANT ALL PRIVILEGES ON DATABASE smart_city_db TO smart_user;
```

> Înlocuiește `parola_ta` cu o parolă sigură și salveaz-o pentru pasul următor.

---

### 4. Instalează Node.js

* Descarcă de la: [https://nodejs.org](https://nodejs.org)

Verificare:

```bash
node -v
npm -v
```

---

### 5. Instalează dependențele backend-ului

```bash
cd smart-city-backend
npm install
```

---

### 6. Modifică fișierul `.env`

În directorul `smart-city-backend`, modifică un fișierul `.env` cu următorul conținut:

```
DB_HOST=localhost
DB_PORT=5432
DB_NAME=smart_city_db
DB_USER=smart_user
DB_PASSWORD=parola_ta
```

---

### 9. Rulează backend-ul

```bash
npm start
```


## 🧠 Serviciul AI (`smart-city-ai-service`)

```bash
cd smart-city-ai-service
python -m venv venv
venv\Scripts\activate
pip install -r requirements.txt
uvicorn app:app --reload
```

---

## 🌐 Frontend (`smart-city`)


```bash
cd smart-city
npm install
npm start
```

Aplicația se va deschide la `http://localhost:3000`.

---
