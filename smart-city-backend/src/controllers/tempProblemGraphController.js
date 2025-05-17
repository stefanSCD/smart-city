const { sequelize, TempProblemGraph, Problem } = require('../models');
const db = require('../models');

const getAllTempProblemGraphs = async (req, res) => {
  try {
    const tempProblems = await TempProblemGraph.findAll({
      include: [
        {
          model: Problem,
          as: 'problem'
        }
      ],
      order: [['id', 'DESC']]
    });
        
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
  const { sequelize, TempProblemGraph, Problem } = require('../models');
  const transaction = await sequelize.transaction();
  
  try {
    const problemId = req.params.id; // Acest ID este de fapt problem_id
    
    // Modificăm query-ul pentru a căuta după problem_id
    const tempProblemGraph = await TempProblemGraph.findOne({ 
      where: { problem_id: problemId },
      transaction 
    });
    
    if (!tempProblemGraph) {
      await transaction.rollback();
      return res.status(404).json({ message: 'Problema temporară nu a fost găsită' });
    }
    
    // Restul codului tău...
    console.log('ID-ul problemei asociate:', problemId);
    
    await tempProblemGraph.destroy({ transaction });
    
    if (problemId) {
      const problem = await Problem.findByPk(problemId, { transaction });
      
      if (problem) {
        await problem.destroy({ transaction });
      } else {
        console.log('Problema asociată nu a fost găsită în baza de date:', problemId);
      }
    }
    
    await transaction.commit();
    
    return res.status(200).json({ 
      message: 'Problema a fost rezolvată și ștearsă complet din baza de date',
      success: true
    });
  } catch (error) {
    await transaction.rollback();
    console.error('Eroare completă la rezolvarea problemei temporare:', error);
    return res.status(500).json({ message: 'Eroare la rezolvarea problemei', error: error.message });
  }
};

module.exports = {
  getAllTempProblemGraphs,
  resolveTempProblem
};