// src/controllers/problemController.js
const { Problem, Employee, TempProblemGraph, User } = require('../models');
const fs = require('fs');
const path = require('path');
const multer = require('multer');

// Configurarea multer pentru încărcarea fișierelor
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    const uploadDir = path.join(__dirname, '../uploads/problems');
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

// Obține toate problemele
exports.getAllProblems = async (req, res) => {
  try {
    const problems = await Problem.findAll({
      include: [{ model: Employee }],
      order: [['created_at', 'DESC']]
    });
    res.json(problems);
  } catch (error) {
    res.status(500).json({ message: 'Error retrieving problems', error: error.message });
  }
};

// Obține o problemă după ID
exports.getProblemById = async (req, res) => {
  try {
    const problem = await Problem.findByPk(req.params.id, {
      include: [{ model: Employee }, { model: User }]
    });
    
    if (!problem) {
      return res.status(404).json({ message: 'Problem not found' });
    }
    
    res.json(problem);
  } catch (error) {
    res.status(500).json({ message: 'Error retrieving problem', error: error.message });
  }
};

// Creează o problemă nouă
exports.createProblem = async (req, res) => {
  try {
    // Verifică dacă avem un ID de utilizator valid
    if (!req.body.user_id) {
      req.body.user_id = req.user ? req.user.id : 1; // Folosește utilizatorul autentificat sau un ID implicit
    }
    
    const newProblem = await Problem.create(req.body);
    res.status(201).json(newProblem);
  } catch (error) {
    res.status(400).json({ message: 'Error creating problem', error: error.message });
  }
};

// Creează o problemă cu imagine/video
exports.createProblemWithMedia = async (req, res) => {
  // Middleware pentru încărcare unică
  const singleUpload = upload.single('image');
  
  singleUpload(req, res, async function(err) {
    if (err) {
      return res.status(400).json({ message: 'Media upload error', error: err.message });
    }
    
    try {
      // Analizează datele problemei din JSON string
      const problemData = JSON.parse(req.body.problemData);
      
      // Verifică dacă avem un ID de utilizator valid
      if (!problemData.user_id) {
        problemData.user_id = req.user ? req.user.id : 1; // Folosește utilizatorul autentificat sau un ID implicit
      }
      
      // Adaugă calea fișierului încărcat dacă există
      if (req.file) {
        problemData.image_path = `/uploads/problems/${req.file.filename}`;
      }
      
      const newProblem = await Problem.create(problemData);
      res.status(201).json(newProblem);
    } catch (error) {
      // Șterge fișierul încărcat în caz de eroare
      if (req.file) {
        fs.unlinkSync(req.file.path);
      }
      res.status(400).json({ message: 'Error creating problem', error: error.message });
    }
  });
};

// Actualizează o problemă
exports.updateProblem = async (req, res) => {
  try {
    const updated = await Problem.update(req.body, {
      where: { id: req.params.id }
    });
    
    if (updated[0] === 0) {
      return res.status(404).json({ message: 'Problem not found' });
    }
    
    const updatedProblem = await Problem.findByPk(req.params.id);
    res.json(updatedProblem);
  } catch (error) {
    res.status(400).json({ message: 'Error updating problem', error: error.message });
  }
};

// Șterge o problemă
exports.deleteProblem = async (req, res) => {
  try {
    // Verifică întâi dacă problema are o imagine
    const problem = await Problem.findByPk(req.params.id);
    
    if (!problem) {
      return res.status(404).json({ message: 'Problem not found' });
    }
    
    // Șterge imaginea dacă există
    if (problem.image_path) {
      const imagePath = path.join(__dirname, '..', problem.image_path);
      if (fs.existsSync(imagePath)) {
        fs.unlinkSync(imagePath);
      }
    }
    
    // Șterge problema din baza de date
    await problem.destroy();
    
    res.status(204).send();
  } catch (error) {
    res.status(500).json({ message: 'Error deleting problem', error: error.message });
  }
};

// Asignează o problemă unui angajat
exports.assignProblemToEmployee = async (req, res) => {
  try {
    const { problem_id, employee_id, gravitate } = req.body;
    
    const problem = await Problem.findByPk(problem_id);
    const employee = await Employee.findByPk(employee_id);
    
    if (!problem || !employee) {
      return res.status(404).json({ message: 'Problem or employee not found' });
    }
    
    const assignment = await TempProblemGraph.create({
      problem_id,
      employee_id,
      gravitate,
      long: problem.long,
      lat: problem.lat
    });
    
    // Actualizează statusul problemei la 'asignat'
    await Problem.update({ status: 'asignat' }, {
      where: { id: problem_id }
    });
    
    res.status(201).json(assignment);
  } catch (error) {
    res.status(400).json({ message: 'Error assigning problem', error: error.message });
  }
};