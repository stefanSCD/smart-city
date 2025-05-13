// src/jobs/aiProcessingJob.js
const schedule = require('node-schedule');
const { Op } = require('sequelize');
const Problem = require('../models/Problem');
const TempProblemGraph = require('../models/TempProblemGraph');
const aiService = require('../services/aiService');

// Funcția de procesare a problemelor neanalizate
const processPendingProblems = async (limit = 10) => {
  try {
    console.log(`[AI Job] Starting automatic processing of up to ${limit} problems`);
    
    // Găsim probleme cu imagini care nu au fost analizate de AI
    const problems = await Problem.findAll({
      where: {
        image_path: { [Op.not]: null }
      },
      include: [{
        model: TempProblemGraph,
        as: 'aiAnalysis',
        required: false
      }],
      limit
    });
    
    // Filtrăm pentru a lua doar problemele fără analiză AI
    const problemsToProcess = problems.filter(problem => !problem.aiAnalysis);
    
    if (problemsToProcess.length === 0) {
      console.log('[AI Job] No new problems to process');
      return [];
    }
    
    console.log(`[AI Job] Processing ${problemsToProcess.length} problems`);
    
    // Procesăm fiecare problemă
    const results = [];
    for (const problem of problemsToProcess) {
      try {
        const aiResult = await aiService.processProblemImage(
          problem.id,
          problem.image_path
        );
        
        // Salvăm rezultatele
        await TempProblemGraph.create({
          problem_id: problem.id,
          ai_confidence: aiResult.results.confidence,
          detected_category: aiResult.results.detectedCategory,
          severity_score: aiResult.results.severityScore,
          estimated_fix_time: aiResult.results.estimatedFixTime,
          detected_objects: aiResult.results.detectedObjects,
          processed_at: new Date()
        });
        
        results.push({
          problemId: problem.id,
          category: aiResult.results.detectedCategory
        });
        
        console.log(`[AI Job] Processed problem ${problem.id}: ${aiResult.results.detectedCategory}`);
      } catch (error) {
        console.error(`[AI Job] Error processing problem ${problem.id}:`, error);
      }
    }
    
    console.log(`[AI Job] Completed processing ${results.length} problems`);
    return results;
  } catch (error) {
    console.error('[AI Job] Error in batch processing:', error);
    return [];
  }
};

// Rulează job-ul la fiecare 10 minute
const job = schedule.scheduleJob('*/10 * * * *', async () => {
  try {
    await processPendingProblems(5); // Procesează maximum 5 probleme la fiecare rulare
  } catch (error) {
    console.error('[AI Job] Scheduled job error:', error);
  }
});

console.log('[AI Job] Scheduled AI processing job every 10 minutes');

module.exports = {
  job,
  processPendingProblems
};