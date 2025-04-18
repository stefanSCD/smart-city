module.exports = (sequelize, DataTypes) => {
    const TempProblemGraph = sequelize.define('TempProblemGraph', {
      id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
      },
      problem_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
          model: 'problem',
          key: 'id'
        }
      },
      employee_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
          model: 'employees',
          key: 'id'
        }
      },
      gravitate: {
        type: DataTypes.STRING
      },
      long: {
        type: DataTypes.DECIMAL(9, 6)
      },
      lat: {
        type: DataTypes.DECIMAL(9, 6)
      }
    }, {
      tableName: 'tempProblemGraph',
      timestamps: false
    });
  
    TempProblemGraph.associate = (models) => {
      TempProblemGraph.belongsTo(models.Problem, { foreignKey: 'problem_id' });
      TempProblemGraph.belongsTo(models.Employee, { foreignKey: 'employee_id' });
    };
  
    return TempProblemGraph;
  };