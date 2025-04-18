// src/controllers/problemController.js
const { Problem, Employee, TempProblemGraph } = require('../models');

// Obține toate problemele
exports.getAllProblems = async (req, res) => {
  try {
    const problems = await Problem.findAll({
      include: [{ model: Employee }]
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
      include: [{ model: Employee }]
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
    const newProblem = await Problem.create(req.body);
    res.status(201).json(newProblem);
  } catch (error) {
    res.status(400).json({ message: 'Error creating problem', error: error.message });
  }
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
    const deleted = await Problem.destroy({
      where: { id: req.params.id }
    });
    
    if (deleted === 0) {
      return res.status(404).json({ message: 'Problem not found' });
    }
    
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
    
    res.status(201).json(assignment);
  } catch (error) {
    res.status(400).json({ message: 'Error assigning problem', error: error.message });
  }
};