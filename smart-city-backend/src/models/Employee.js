module.exports = (sequelize, DataTypes) => {
  const Employee = sequelize.define('Employee', {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },
    username: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true
    },
    password: {
      type: DataTypes.STRING,
      allowNull: false
    },
    nume: {
      type: DataTypes.STRING,
      allowNull: false
    },
    prenume: {
      type: DataTypes.STRING,
      allowNull: false
    },
    department: {
      type: DataTypes.STRING,
      allowNull: false
    },
    firma: {
      type: DataTypes.STRING
    },
    role: {
      type: DataTypes.STRING
    }
  }, {
    tableName: 'employees',
    timestamps: false
  });

  Employee.associate = (models) => {
    Employee.belongsToMany(models.Problem, {
      through: models.TempProblemGraph, 
      foreignKey: 'employee_id',
      otherKey: 'problem_id'
    });
  };

  return Employee;
};