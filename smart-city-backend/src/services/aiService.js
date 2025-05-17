// Modificare aiService.js pentru a accepta date suplimentare despre problemă
const axios = require('axios');
const fs = require('fs');
const path = require('path');
const FormData = require('form-data');

// URL-ul serviciului AI
const AI_SERVICE_URL = process.env.AI_SERVICE_URL || 'http://localhost:8000/analyze';

/**
 * Procesează o imagine de problemă folosind serviciul Azure AI
 * @param {string} problemId - ID-ul problemei
 * @param {string} imagePath - Calea către imagine (relativă la rădăcina proiectului)
 * @param {Object} additionalData - Date suplimentare despre problemă (categoria, descrierea etc.)
 * @returns {Promise<Object>} - Rezultatele analizei
 */
exports.processProblemImage = async (problemId, imagePath, additionalData = {}) => {
  try {
    console.log(`Procesare imagine pentru problema #${problemId}: ${imagePath}`);
    console.log('Date suplimentare:', additionalData);
    
    // Construiește calea completă către imagine
    const fullPath = path.join(__dirname, '../..', imagePath); // Ajustează calea în funcție de structura proiectului
    
    if (!fs.existsSync(fullPath)) {
      throw new Error(`Fișierul imagine nu există la calea: ${fullPath}`);
    }
    
    // Pregătește formData pentru a trimite imaginea
    const formData = new FormData();
    formData.append('file', fs.createReadStream(fullPath));
    
    // Adaugă informațiile suplimentare despre problemă
    if (additionalData.category) {
      formData.append('category', additionalData.category);
    }
    
    if (additionalData.description) {
      formData.append('description', additionalData.description);
    }
    
    // Trimite imaginea către serviciul AI
    console.log(`Trimitere imagine către serviciul AI: ${AI_SERVICE_URL}`);
    const aiResponse = await axios.post(AI_SERVICE_URL, formData, {
      headers: {
        ...formData.getHeaders(),
      },
      timeout: 30000, // 30 secunde timeout
    });
    
    // Procesează răspunsul
    const results = aiResponse.data;
    console.log(`Rezultate AI primite pentru problema #${problemId}`);
    
    // Structurează rezultatele pentru a fi compatibile cu baza de date
    return {
      success: true,
      results: {
        confidence: 0.9, // Valoare implicită
        detectedCategory: Array.isArray(results.detected_category) 
          ? results.detected_category.join(',') 
          : results.detected_category,
        severityScore: results.severity_score,
        estimatedFixTime: results.estimated_fix_time,
        detectedObjects: results.detected_objects,
        processedAt: new Date()
      }
    };
  } catch (error) {
    console.error(`Eroare la procesarea imaginii pentru problema #${problemId}: ${error.message}`);
    throw new Error(`Eroare procesare imagine: ${error.message}`);
  }
};