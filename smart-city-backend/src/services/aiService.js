// src/services/aiService.js
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
 * @returns {Promise<Object>} - Rezultatele analizei
 */
exports.processProblemImage = async (problemId, imagePath) => {
  try {
    console.log(`Procesare imagine pentru problema #${problemId}: ${imagePath}`);
    
    const fullPath = path.join(__dirname, '../..', imagePath); 
    
    if (!fs.existsSync(fullPath)) {
      throw new Error(`Fișierul imagine nu există la calea: ${fullPath}`);
    }
    
    const formData = new FormData();
    formData.append('file', fs.createReadStream(fullPath));
    
    console.log(`Trimitere imagine către serviciul AI: ${AI_SERVICE_URL}`);
    const aiResponse = await axios.post(AI_SERVICE_URL, formData, {
      headers: {
        ...formData.getHeaders(),
      },
      timeout: 30000, // 30 secunde timeout
    });
    
    const results = aiResponse.data;
    console.log(`Rezultate AI primite pentru problema #${problemId}`);
    
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