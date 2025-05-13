// src/controllers/tempProblemGraphController.js

const { sequelize, TempProblemGraph, Problem } = require('../models');
const db = require('../models');
/**
 * Obține toate înregistrările din tabela temp_problem_graphs
 * @param {object} req - Obiectul request Express
 * @param {object} res - Obiectul response Express
 */
const getAllTempProblemGraphs = async (req, res) => {
  try {
    console.log("Încercăm să obținem TempProblemGraphs...");
    
    const tempProblems = await TempProblemGraph.findAll({
      include: [
        {
          model: Problem,
          as: 'problem'
        }
      ],
      order: [['id', 'DESC']]
    });
    
    console.log(`S-au găsit ${tempProblems.length} înregistrări TempProblemGraph.`);
    
    res.status(200).json(tempProblems);
  } catch (error) {
    console.error('Error retrieving temp problem graphs:', error);
    res.status(500).json({ 
      message: 'Server error', 
      error: error.message
    });
  }
};

const resolveTempProblem = async (req, res) => {
  // Obținem instanța tranzacției
  const { sequelize, TempProblemGraph, Problem } = require('../models');
  const transaction = await sequelize.transaction();
  
  try {
    const { id } = req.params;
    console.log('Începerea procesului de rezolvare pentru problema:', id);
    
    // Găsim înregistrarea pentru a vedea dacă există
    const tempProblemGraph = await TempProblemGraph.findByPk(id, { transaction });
    
    if (!tempProblemGraph) {
      await transaction.rollback();
      return res.status(404).json({ message: 'Problema temporară nu a fost găsită' });
    }
    
    // Salvăm problem_id pentru a putea șterge problema asociată
    const problemId = tempProblemGraph.problem_id;
    console.log('ID-ul problemei asociate:', problemId);
    
    // 1. Ștergem înregistrarea din temp_problem_graphs
    await tempProblemGraph.destroy({ transaction });
    console.log('Înregistrarea din temp_problem_graphs a fost ștearsă');
    
    // 2. Dacă există o problemă asociată, o ștergem și pe aceasta
    if (problemId) {
      const problem = await Problem.findByPk(problemId, { transaction });
      
      if (problem) {
        await problem.destroy({ transaction });
        console.log('Problema asociată a fost ștearsă:', problemId);
      } else {
        console.log('Problema asociată nu a fost găsită în baza de date:', problemId);
      }
    }
    
    // Comitem tranzacția pentru a aplica schimbările
    await transaction.commit();
    console.log('Tranzacția a fost comisă cu succes');
    
    return res.status(200).json({ 
      message: 'Problema a fost rezolvată și ștearsă complet din baza de date',
      success: true
    });
  } catch (error) {
    // Rollback în caz de eroare
    await transaction.rollback();
    console.error('Eroare completă la rezolvarea problemei temporare:', error);
    return res.status(500).json({ message: 'Eroare la rezolvarea problemei', error: error.message });
  }
};

module.exports = {
  getAllTempProblemGraphs,
  resolveTempProblem
};