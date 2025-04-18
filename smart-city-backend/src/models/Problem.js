module.exports = (sequelize, DataTypes) => {
    const Problem = sequelize.define('Problem', {
      id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
      },
      title: {
        type: DataTypes.STRING,
        allowNull: false
      },
      description: {
        type: DataTypes.TEXT
      },
      user_id: {
        type: DataTypes.INTEGER,
        allowNull: false
      },
      status: {
        type: DataTypes.STRING,
        defaultValue: 'nou'
      },
      created_at: {
        type: DataTypes.DATE,
        defaultValue: DataTypes.NOW
      },
      department: {
        type: DataTypes.STRING
      },
      long: {
        type: DataTypes.DECIMAL(9, 6)
      },
      lat: {
        type: DataTypes.DECIMAL(9, 6)
      }
    }, {
      tableName: 'problem',
      timestamps: false
    });
  
    Problem.associate = (models) => {
      Problem.belongsTo(models.User, { foreignKey: 'user_id' });
      Problem.belongsToMany(models.Employee, { 
        through: models.TempProblemGraph,
        foreignKey: 'problem_id',
        otherKey: 'employee_id'
      });
    };

  
    return Problem;
  };