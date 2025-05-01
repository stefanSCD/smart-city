const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  class TempProblemGraph extends Model {
    static associate(models) {
      // Relații cu utilizatorul care a raportat problema
      TempProblemGraph.belongsTo(models.User, {
        foreignKey: 'user_id',
        as: 'user'
      });

      // Relații cu problema (dacă există)
      if (models.Problem) {
        TempProblemGraph.belongsTo(models.Problem, {
          foreignKey: 'problem_id',
          as: 'problem'
        });
      }

      // Relații cu alte modele (dacă există)
      // Adăugați aici orice alte relații necesare
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
      allowNull: true,
      references: {
        model: 'Problems',
        key: 'id'
      }
    },
    user_id: {
      type: DataTypes.UUID,
      allowNull: false,
      references: {
        model: 'Users',
        key: 'id'
      }
    },
    date: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: DataTypes.NOW
    },
    data: {
      type: DataTypes.JSONB,
      allowNull: false,
      defaultValue: {}
    }
  }, {
    sequelize,
    modelName: 'TempProblemGraph',
    tableName: 'TempProblemGraphs',
    underscored: true,
    timestamps: true
  });

  return TempProblemGraph;
};