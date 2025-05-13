// src/models/TempProblemGraph.js
const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  class TempProblemGraph extends Model {
    static associate(models) {
      // Relații cu problema
      if (models.Problem) {
        TempProblemGraph.belongsTo(models.Problem, {
          foreignKey: 'problem_id',
          as: 'problem'
        });
      }
    }
  }

  TempProblemGraph.init({
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true
    },
    problem_id: {
      type: DataTypes.UUID,
      allowNull: false,
      references: {
        model: 'Problems',
        key: 'id'
      }
    },
    latitude: {
      type: DataTypes.FLOAT,
      allowNull: true
    },
    longitude: {
      type: DataTypes.FLOAT,
      allowNull: true
    },
    ai_confidence: {
      type: DataTypes.FLOAT,
      allowNull: true
    },
    detected_category: {
      type: DataTypes.STRING,
      allowNull: true
    },
    severity_score: {
      type: DataTypes.INTEGER,
      allowNull: true
    },
    media_url: {    
      type: DataTypes.STRING,
      allowNull: true
    },
    estimated_fix_time: {
      type: DataTypes.STRING,
      allowNull: true
    },
    detected_objects: {
      type: DataTypes.JSONB,
      allowNull: true,
      defaultValue: {}
    },
    processed_at: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: DataTypes.NOW
    }
  }, {
    sequelize,
    modelName: 'TempProblemGraph',
    tableName: 'temp_problem_graphs',
    underscored: true,
    timestamps: false
  });

  return TempProblemGraph;
};