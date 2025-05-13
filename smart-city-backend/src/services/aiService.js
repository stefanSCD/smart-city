// src/services/aiService.js
const axios = require('axios');
const fs = require('fs').promises;
const path = require('path');

class AIService {
  constructor() {
    this.aiEndpoint = process.env.AI_SERVICE_URL || 'http://localhost:8000';
  }

  async processProblemImage(problemId, media_url) {
    try {
      // Verifică formatul căii media_url
      console.log('Media URL primit:', media_url);
      
      // Ajustăm calea în funcție de formatarea primită
      let cleanPath;
      
      // Eliminăm orice prefix 'uploads' sau '/uploads'
      if (media_url.startsWith('/uploads/')) {
        cleanPath = media_url.substring('/uploads/'.length);
      } else if (media_url.startsWith('uploads/')) {
        cleanPath = media_url.substring('uploads/'.length);
      } else if (media_url.startsWith('/')) {
        cleanPath = media_url.substring(1); // Eliminăm doar slash-ul de la început
      } else {
        cleanPath = media_url;
      }
      
      // Construiește calea completă către fișier
      const fullPath = path.join(__dirname, '../../uploads', cleanPath);
      
      console.log('Încercăm să accesăm imaginea la calea:', fullPath);
      
      // Verifică fișierul
      try {
        await fs.access(fullPath);
      } catch (e) {
        // Încearcă o cale alternativă dacă prima nu funcționează
        const altPath = path.join(__dirname, '../..', media_url);
        console.log('Prima cale nu a funcționat, încercăm calea alternativă:', altPath);
        await fs.access(altPath);
        // Dacă ajungem aici, folosim calea alternativă
        return await this.processImageFromPath(problemId, altPath);
      }
      
      // Dacă prima cale a funcționat, continuăm cu ea
      return await this.processImageFromPath(problemId, fullPath);
      
    } catch (error) {
      if (error.code === 'ENOENT') {
        console.error(`Fișierul imagine nu a fost găsit: ${error.path}`);
        throw new Error(`Imaginea nu a fost găsită. Verificați dacă fișierul există.`);
      } else {
        console.error('Error processing image with AI:', error);
        throw new Error(`Failed to process image: ${error.message}`);
      }
    }
  }

  // Metodă separată pentru procesarea unei imagini de la o cale
  async processImageFromPath(problemId, imagePath) {
    try {
      // Citește imaginea și convertește în base64
      const imageBuffer = await fs.readFile(imagePath);
      const base64Image = imageBuffer.toString('base64');
      
      console.log(`Imagine citită cu succes: ${imagePath} (${imageBuffer.length} bytes)`);
      
      // Trimite imaginea către serviciul AI
      const response = await axios.post(`${this.aiEndpoint}/process-base64`, {
        problemId,
        image: base64Image
      });
      
      console.log(`Răspuns primit de la serviciul AI pentru problema ${problemId}`);
      return response.data;
    } catch (error) {
      console.error(`Eroare la procesarea imaginii de la calea ${imagePath}:`, error);
      throw error;
    }
  }
}

module.exports = new AIService();