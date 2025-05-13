aveti nevoie de postgreSQL : https://www.enterprisedb.com/downloads/postgres-postgresql-downloads
deschideti psql dupa instalare din start si introduceti:
``bash
CREATE DATABASE smart_city_db;
CREATE USER postgre WITH ENCRYPTED PASSWORD 'parola_ta';
GRANT ALL PRIVILEGES ON DATABASE smart_city_db TO postgre;
\q


 
Setup steps:
clone the repository

deschide 3 command prompturi

cd smartcity/smart-city
cd smartcity/smart-city-ai-service
cd smartcity/smart-city-backend

in smartcity/smart-city
      prima utilizare : npm install
      dupa : npm start ( fara npm install daca l-ati instalat deja)

in smartcity/smart-city-backend
