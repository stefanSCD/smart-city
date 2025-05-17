// src/controllers/aiController.js
const { Problem, TempProblemGraph } = require('../models');
const aiService = require('../services/aiService');
const path = require('path');
const fs = require('fs');
const multer = require('multer');
const { v4: uuidv4 } = require('uuid');

// Configurare pentru încărcarea fișierelor
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    const uploadDir = path.join(__dirname, '../uploads');
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }
    cb(null, uploadDir);
  },
  filename: function (req, file, cb) {
    const uniqueFilename = `${Date.now()}-${uuidv4()}${path.extname(file.originalname)}`;
    cb(null, uniqueFilename);
  }
});

const upload = multer({ 
  storage: storage,
  limits: { fileSize: 10 * 1024 * 1024 }, // Limită de 10MB
  fileFilter: function (req, file, cb) {
    // Permite doar imagini
    if (!file.mimetype.startsWith('image/')) {
      return cb(new Error('Doar fișierele imagine sunt permise!'), false);
    }
    cb(null, true);
  }
}).single('image');

// Procesează o imagine de problemă specifică
exports.processProblemImage = async (req, res) => {
  try {
    const { problemId } = req.params;
    
    // Verifică dacă problema există
    const problem = await Problem.findByPk(problemId);
    if (!problem) {
      return res.status(404).json({
        success: false,
        message: 'Problem not found'
      });
    }
    
    // Verifică dacă problema are imagine
    if (!problem.media_url) {
      return res.status(400).json({
        success: false,
        message: 'Problem does not have an associated image'
      });
    }
    
    console.log(`Procesare imagine pentru problema #${problemId}: ${problem.media_url}`);
    
    // Procesează imaginea cu AI
    const aiResults = await aiService.processProblemImage(
      problem.id,
      problem.media_url
    );
    
    // Salvează rezultatele în baza de date
    const graphData = await TempProblemGraph.create({
      problem_id: problem.id,
      latitude: problem.latitude,
      longitude: problem.longitude,
      ai_confidence: aiResults.results.confidence,
      detected_category: aiResults.results.detectedCategory,
      severity_score: aiResults.results.severityScore,
      estimated_fix_time: aiResults.results.estimatedFixTime,
      detected_objects: aiResults.results.detectedObjects,
      processed_at: new Date()
    });
    
    res.status(200).json({
      success: true,
      data: {
        problemId: problem.id,
        analysis: aiResults.results,
        graphId: graphData.id
      }
    });
  } catch (error) {
    console.error('AI processing error:', error);
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// Încarcă și procesează o imagine nouă
exports.uploadAndProcessImage = async (req, res) => {
  upload(req, res, async function (err) {
    if (err) {
      console.error(`Eroare la încărcarea imaginii: ${err.message}`);
      return res.status(400).json({ 
        success: false, 
        message: err.message 
      });
    }
    
    try {
      if (!req.file) {
        return res.status(400).json({ 
          success: false, 
          message: 'Nicio imagine nu a fost încărcată' 
        });
      }
      
      // Calea către fișierul imagine
      const imagePath = req.file.path;
      
      console.log(`Imagine încărcată la: ${imagePath}`);
      
      // Procesează imaginea cu AI
      const aiResults = await aiService.processProblemImage(
        'temp', // folosim un ID temporar
        imagePath
      );
      
      // Calculăm calea relativă pentru a o stoca în baza de date
      const relativePath = path.relative(path.join(__dirname, '..'), imagePath);
      const mediaUrl = '/' + relativePath.replace(/\\/g, '/');
      
      res.status(200).json({
        success: true,
        data: {
          analysis: aiResults.results,
          media_url: mediaUrl
        }
      });
    } catch (error) {
      console.error(`Eroare la procesarea imaginii: ${error.message}`);
      
      // Ștergem fișierul în caz de eroare
      if (req.file && req.file.path) {
        try {
          fs.unlinkSync(req.file.path);
        } catch (unlinkError) {
          console.error(`Eroare la ștergerea fișierului: ${unlinkError.message}`);
        }
      }
      
      res.status(500).json({
        success: false,
        message: error.message
      });
    }
  });
};

// Procesează o problemă nouă cu imagine
exports.processNewProblemWithImage = async (req, res) => {
  upload(req, res, async function (err) {
    if (err) {
      console.error(`Eroare la încărcarea imaginii: ${err.message}`);
      return res.status(400).json({ 
        success: false, 
        message: err.message 
      });
    }
    
    try {
      if (!req.file) {
        return res.status(400).json({ 
          success: false, 
          message: 'Nicio imagine nu a fost încărcată' 
        });
      }
      
      const { title, description, category, latitude, longitude, reported_by } = req.body;
      
      if (!title || !description || !category) {
        return res.status(400).json({
          success: false,
          message: 'Titlul, descrierea și categoria sunt obligatorii'
        });
      }
      
      // Calea către fișierul imagine
      const imagePath = req.file.path;
      const relativePath = path.relative(path.join(__dirname, '..'), imagePath);
      const mediaUrl = '/' + relativePath.replace(/\\/g, '/');
      
      console.log(`Imagine pentru problema nouă încărcată la: ${imagePath}`);
      
      // Creează problema
      const problem = await Problem.create({
        title,
        description,
        category,
        status: 'pending',
        latitude: latitude || null,
        longitude: longitude || null,
        media_url: mediaUrl,
        reported_by: reported_by || null
      });
      
      // Procesează imaginea cu AI
      const aiResults = await aiService.processProblemImage(
        problem.id,
        imagePath // Folosim calea completă pentru procesare
      );
      
      // Salvează rezultatele în baza de date
      const graphData = await TempProblemGraph.create({
        problem_id: problem.id,
        latitude: problem.latitude,
        longitude: problem.longitude,
        ai_confidence: aiResults.results.confidence,
        detected_category: aiResults.results.detectedCategory,
        severity_score: aiResults.results.severityScore,
        estimated_fix_time: aiResults.results.estimatedFixTime,
        detected_objects: aiResults.results.detectedObjects,
        processed_at: new Date()
      });
      
      res.status(201).json({
        success: true,
        data: {
          problem,
          analysis: aiResults.results,
          graphId: graphData.id
        }
      });
    } catch (error) {
      console.error(`Eroare la procesarea problemei noi: ${error.message}`);
      
      // Ștergem fișierul în caz de eroare
      if (req.file && req.file.path) {
        try {
          fs.unlinkSync(req.file.path);
        } catch (unlinkError) {
          console.error(`Eroare la ștergerea fișierului: ${unlinkError.message}`);
        }
      }
      
      res.status(500).json({
        success: false,
        message: error.message
      });
    }
  });
};