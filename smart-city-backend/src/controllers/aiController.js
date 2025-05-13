// src/controllers/aiController.js
const db = require('../models');
const Problem = db.Problem;
const TempProblemGraph = db.TempProblemGraph;
const aiService = require('../services/aiService');

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