// src/models/Problem.js

const { Model, DataTypes } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  class Problem extends Model {
    static associate(models) {
      // Asociere cu utilizatorul care a raportat problema
      Problem.belongsTo(models.User, {
        foreignKey: 'reported_by',
        as: 'reporter',
        onDelete: 'SET NULL'
      });
      
      // Asociere opțională cu utilizatorul (angajat) asignat la problemă
      Problem.belongsTo(models.User, {
        foreignKey: 'assigned_to',
        as: 'assignedTo',
        onDelete: 'SET NULL'
      });
    }
  }

  Problem.init({
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true
    },
    title: {
      type: DataTypes.STRING,
      allowNull: false
    },
    description: {
      type: DataTypes.TEXT,
      allowNull: false
    },
    location: {
      type: DataTypes.STRING,
      allowNull: true
    },
    latitude: {
      type: DataTypes.FLOAT,
      allowNull: true
    },
    longitude: {
      type: DataTypes.FLOAT,
      allowNull: true
    },
    category: {
      type: DataTypes.STRING,
      allowNull: false,
      defaultValue: 'general'
    },
    status: {
      type: DataTypes.STRING,  // Folosim STRING în loc de ENUM
      allowNull: false,
      defaultValue: 'reported',
      validate: {
        isIn: [['reported', 'in_progress', 'completed', 'cancelled']]
      }
    },
    reported_by: {
      type: DataTypes.UUID,
      allowNull: true,
      references: {
        model: 'Users',
        key: 'id'
      }
    },
    assigned_to: {
      type: DataTypes.UUID,
      allowNull: true,
      references: {
        model: 'Users',
        key: 'id'
      }
    },
    media_url: {
      type: DataTypes.STRING,
      allowNull: true
    }
  }, {
    sequelize,
    modelName: 'Problem',
    tableName: 'problems',
    timestamps: false,
    paranoid: true  // Soft delete
  });

  return Problem;
};