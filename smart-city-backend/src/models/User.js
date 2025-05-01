const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  class User extends Model {
    static associate(models) {
      // Probleme raportate de utilizator
      User.hasMany(models.Problem, {
        foreignKey: 'reported_by',
        as: 'reportedProblems'
      });

      // Notificări
      User.hasMany(models.Notification, {
        foreignKey: 'user_id',
        as: 'notifications'
      });

      // Probleme asignate (doar pentru angajați)
      User.belongsToMany(models.Problem, {
        through: 'ProblemEmployees',
        foreignKey: 'user_id',
        otherKey: 'problem_id',
        as: 'assignedProblems'
      });

      // Alte asocieri specifice proiectului
    }
  }

  User.init({
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true
    },
    email: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true,
      validate: {
        isEmail: true
      }
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
    userType: {
      type: DataTypes.STRING, // Folosim STRING în loc de ENUM
      allowNull: false,
      defaultValue: 'user',
      validate: {
        isIn: [['user', 'employee', 'admin']] // Restricționăm valorile permise
      }
    },
    department: {
      type: DataTypes.STRING,
      allowNull: true
    },
    position: {
      type: DataTypes.STRING,
      allowNull: true
    },
    phone: {
      type: DataTypes.STRING,
      allowNull: true
    },
    address: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    avatar: {
      type: DataTypes.STRING,
      allowNull: true
    },
    isActive: {
      type: DataTypes.BOOLEAN,
      defaultValue: true
    },
    lastLogin: {
      type: DataTypes.DATE,
      allowNull: true
    }
  }, {
    sequelize,
    modelName: 'User',
    tableName: 'Users',
    timestamps: true
  });

  return User;
};