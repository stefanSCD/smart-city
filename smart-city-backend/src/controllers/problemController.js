// src/controllers/problemController.js
const { Problem, User } = require('../models');
const fs = require('fs');
const path = require('path');
const multer = require('multer');
const { v4: uuidv4 } = require('uuid');

// Configurarea multer pentru încărcarea fișierelor
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    const uploadDir = path.join(__dirname, '../../uploads/problems');
    // Asigură-te că directorul există
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }
    cb(null, uploadDir);
  },
  filename: function (req, file, cb) {
    // Generează un nume de fișier unic bazat pe timestamp și numele original
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    const ext = path.extname(file.originalname);
    cb(null, `problem-${uniqueSuffix}${ext}`);
  }
});

const upload = multer({ 
  storage: storage,
  limits: {
    fileSize: 10 * 1024 * 1024, // Limită de 10MB
  },
  fileFilter: function (req, file, cb) {
    // Acceptă doar imagini și video
    if (file.mimetype.startsWith('image/') || file.mimetype.startsWith('video/')) {
      cb(null, true);
    } else {
      cb(new Error('Doar fișierele imagini și video sunt acceptate!'), false);
    }
  }
});

// Middleware pentru încărcare fișiere
const uploadMiddleware = upload.single('media');

// Obține toate problemele - versiune simplificată fără relații
const getProblems = async (req, res) => {
  try {
    console.log('Getting all problems');
    
    // Folosim o versiune simplificată fără relații pentru a evita erori
    const problems = await Problem.findAll({
      order: [['id', 'DESC']]
    });
    
    console.log(`Found ${problems.length} problems`);
    res.json(problems);
  } catch (error) {
    console.error('Error retrieving problems:', error);
    res.status(500).json({ 
      message: 'Error retrieving problems', 
      error: error.message,
      stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
    });
  }
};

// Obține o problemă după ID - versiune simplificată
const getProblemById = async (req, res) => {
  try {
    const problem = await Problem.findByPk(req.params.id);
    
    if (!problem) {
      return res.status(404).json({ message: 'Problem not found' });
    }
    
    res.json(problem);
  } catch (error) {
    console.error('Error retrieving problem by ID:', error);
    res.status(500).json({ message: 'Error retrieving problem', error: error.message });
  }
};

// Creează o problemă nouă - versiune simplificată
const createProblem = async (req, res) => {
  try {
    console.log('Creating new problem with body:', req.body);
    console.log('File in request:', req.file);
    
    // Inițializăm reported_by ca null
    let reported_by = null;
    
    // Verifică dacă avem un ID de utilizator
    if (req.body.reported_by) {
      // Verifică dacă este deja un UUID valid
      const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
      if (uuidRegex.test(req.body.reported_by)) {
        reported_by = req.body.reported_by;
      } else {
        // Dacă nu este UUID, încearcă să găsești utilizatorul după ID-ul numeric
        try {
          const user = await User.findByPk(req.body.reported_by);
          if (user) {
            reported_by = user.uuid || user.id; // Folosește uuid dacă există, altfel id
          }
        } catch (userError) {
          console.error('Error finding user:', userError);
        }
      }
    }
    
    // Pregătim datele pentru a crea problema
    const problemData = {
      title: req.body.title || "Problemă necunoscută",
      description: req.body.description || "Fără descriere",
      location: req.body.location || null,
      latitude: parseFloat(req.body.latitude) || null,
      longitude: parseFloat(req.body.longitude) || null,
      category: req.body.category || 'general',
      status: 'reported',
      reported_by // Poate fi null sau UUID valid
    };
    
    // Adăugăm calea media dacă există fișier
    if (req.file) {
      problemData.media_url = `/uploads/problems/${req.file.filename}`;
    }
    
    console.log('Creating problem with data:', problemData);
    
    // Creăm problema în baza de date
    const newProblem = await Problem.create(problemData);
    
    console.log('Problem created successfully:', newProblem.id);
    
    // Adăugăm procesarea AI dacă există o imagine
    if (newProblem.media_url) {
      try {
        // Import aiService și TempProblemGraph
        const aiService = require('../services/aiService');
        const { TempProblemGraph } = require('../models');
        
        // Procesăm imaginea asincron (fără await pentru a nu bloca răspunsul)
        aiService.processProblemImage(newProblem.id, newProblem.media_url)
          .then(aiResults => {
            // Salvăm rezultatele în baza de date
            return TempProblemGraph.create({
              problem_id: newProblem.id,
              latitude: newProblem.latitude,
              longitude: newProblem.longitude,
              ai_confidence: aiResults.results.confidence,
              detected_category: aiResults.results.detectedCategory,
              severity_score: aiResults.results.severityScore,
              estimated_fix_time: aiResults.results.estimatedFixTime,
              media_url: newProblem.media_url,
              detected_objects: aiResults.results.detectedObjects,
              processed_at: new Date()
            });
          })
          .then(() => {
            console.log(`AI processing completed for problem ${newProblem.id}`);
          })
          .catch(error => {
            console.error(`Error in AI processing for problem ${newProblem.id}:`, error);
            // Nu blocăm fluxul principal chiar dacă procesarea AI eșuează
          });
          
        console.log(`AI processing initiated for problem ${newProblem.id}`);
      } catch (aiError) {
        console.error('Error initiating AI processing:', aiError);
        // Nu blocăm crearea problemei dacă procesarea AI eșuează
      }
    }
    
    res.status(201).json(newProblem);
  } catch (error) {
    console.error('Error creating problem:', error);
    
    // Șterge fișierul încărcat în caz de eroare
    if (req.file) {
      try {
        fs.unlinkSync(req.file.path);
      } catch (unlinkError) {
        console.error('Error deleting uploaded file:', unlinkError);
      }
    }
    
    res.status(400).json({ 
      message: 'Error creating problem', 
      error: error.message,
      stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
    });
  }
};

// Actualizează o problemă - versiune simplificată
const updateProblem = async (req, res) => {
  try {
    const { id } = req.params;
    
    // Verifică dacă problema există
    const problem = await Problem.findByPk(id);
    if (!problem) {
      return res.status(404).json({ message: 'Problem not found' });
    }
    
    // Actualizează problema
    await problem.update(req.body);
    
    // Returnează problema actualizată
    const updatedProblem = await Problem.findByPk(id);
    res.json(updatedProblem);
  } catch (error) {
    console.error('Error updating problem:', error);
    res.status(400).json({ message: 'Error updating problem', error: error.message });
  }
};

// Actualizează statusul unei probleme
const updateProblemStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;
    
    if (!status) {
      return res.status(400).json({ message: 'Status is required' });
    }
    
    // Verifică dacă problema există
    const problem = await Problem.findByPk(id);
    if (!problem) {
      return res.status(404).json({ message: 'Problem not found' });
    }
    
    // Validează statusul (folosește valorile permise în model)
    const validStatuses = ['reported', 'in_progress', 'completed', 'cancelled'];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({ 
        message: 'Invalid status', 
        validValues: validStatuses 
      });
    }
    
    // Actualizează statusul
    await problem.update({ status });
    
    res.json({ message: 'Problem status updated successfully', status });
  } catch (error) {
    console.error('Error updating problem status:', error);
    res.status(400).json({ message: 'Error updating problem status', error: error.message });
  }
};

// Șterge o problemă
const deleteProblem = async (req, res) => {
  try {
    const { id } = req.params;
    
    // Verifică dacă problema există
    const problem = await Problem.findByPk(id);
    if (!problem) {
      return res.status(404).json({ message: 'Problem not found' });
    }
    
    // Șterge fișierul media dacă există
    if (problem.media_url) {
      const mediaPath = path.join(__dirname, '../..', problem.media_url);
      if (fs.existsSync(mediaPath)) {
        fs.unlinkSync(mediaPath);
      }
    }
    
    // Șterge problema
    await problem.destroy();
    
    res.status(204).send();
  } catch (error) {
    console.error('Error deleting problem:', error);
    res.status(500).json({ message: 'Error deleting problem', error: error.message });
  }
};

// Asignează o problemă unui angajat - versiune simplificată
const assignProblemToEmployee = async (req, res) => {
  try {
    const { id } = req.params;
    const { user_id } = req.body;
    
    if (!user_id) {
      return res.status(400).json({ message: 'Employee ID (user_id) is required' });
    }
    
    // Verifică dacă problema există
    const problem = await Problem.findByPk(id);
    if (!problem) {
      return res.status(404).json({ message: 'Problem not found' });
    }
    
    // Actualizează problema cu ID-ul angajatului și statusul
    await problem.update({ 
      assigned_to: user_id,
      status: 'in_progress'
    });
    
    // Returnează problema actualizată
    const updatedProblem = await Problem.findByPk(id);
    res.json(updatedProblem);
  } catch (error) {
    console.error('Error assigning problem:', error);
    res.status(400).json({ message: 'Error assigning problem', error: error.message });
  }
};

// Placeholder pentru metoda de adăugare comentarii - implementează când ai modelul Comment
const addProblemComment = async (req, res) => {
  try {
    // Implementare simplificată
    res.json({ message: "Comment functionality not yet implemented" });
  } catch (error) {
    console.error('Error adding comment:', error);
    res.status(400).json({ message: 'Error adding comment', error: error.message });
  }
};

// Obține probleme după status
const getProblemsByStatus = async (req, res) => {
  try {
    const { status } = req.params;
    
    const problems = await Problem.findAll({
      where: { status },
      order: [['id', 'DESC']]
    });
    
    res.json(problems);
  } catch (error) {
    console.error('Error retrieving problems by status:', error);
    res.status(500).json({ message: 'Error retrieving problems', error: error.message });
  }
};

// Obține probleme după utilizator
const getProblemsByUser = async (req, res) => {
  try {
    const { user_id } = req.params;
    
    // Verifică formatul ID-ului
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
    
    if (uuidRegex.test(user_id)) {
      // ID-ul este deja un UUID valid, caută direct
      const problems = await Problem.findAll({
        where: { reported_by: user_id },
        order: [['id', 'DESC']]
      });
      
      return res.json(problems);
    } else {
      // ID-ul este numeric, încearcă să găsești utilizatorul
      try {
        const user = await User.findByPk(user_id);
        if (user) {
          // Găsește problemele utilizând uuid sau id
          const userUuid = user.uuid || user.id;
          const problems = await Problem.findAll({
            where: { reported_by: userUuid },
            order: [['id', 'DESC']]
          });
          
          return res.json(problems);
        } else {
          // Utilizatorul nu a fost găsit
          return res.json([]);
        }
      } catch (userError) {
        console.error('Error finding user:', userError);
        return res.status(500).json({ 
          message: 'Error finding user', 
          error: userError.message 
        });
      }
    }
  } catch (error) {
    console.error('Error retrieving problems by user:', error);
    res.status(500).json({ 
      message: 'Error retrieving problems', 
      error: error.message 
    });
  }
};

// Obține probleme asignate unui angajat
const getAssignedProblems = async (req, res) => {
  try {
    const { user_id } = req.params;
    
    const problems = await Problem.findAll({
      where: { assigned_to: user_id },
      order: [['id', 'DESC']]
    });
    
    res.json(problems);
  } catch (error) {
    console.error('Error retrieving assigned problems:', error);
    res.status(500).json({ message: 'Error retrieving assigned problems', error: error.message });
  }
};



module.exports = {
  
  uploadMiddleware,
  getProblems,
  getProblemById,
  createProblem,
  updateProblem,
  updateProblemStatus,
  deleteProblem,
  assignProblemToEmployee,
  getProblemsByStatus,
  getProblemsByUser,
  getAssignedProblems,
  addProblemComment
};