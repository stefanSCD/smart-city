const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  class Camera extends Model {
    static associate(models) {
      // Definim asocierile aici dacă este necesar
    }
  }

  Camera.init({
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },
    name: {
      type: DataTypes.STRING,
      allowNull: false
    },
    location: {
      type: DataTypes.STRING,
      allowNull: false
    },
    status: {
      type: DataTypes.ENUM('active', 'maintenance', 'inactive'),
      defaultValue: 'active'
    },
    type: {
      type: DataTypes.STRING,
      allowNull: false
    },
    streamUrl: {
      type: DataTypes.STRING,
      allowNull: false,
      field: 'stream_url'
    },
    aiEnabled: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
      field: 'ai_enabled'
    },
    thumbnail: {
      type: DataTypes.STRING,
      defaultValue: '/api/placeholder/320/180'
    },
    detections: {
      type: DataTypes.INTEGER,
      defaultValue: 0
    }
  }, {
    sequelize,
    modelName: 'Camera',
    tableName: 'cameras',
    timestamps: true,
    underscored: true,
    paranoid: true,
    createdAt: 'created_at',
    updatedAt: 'updated_at',
    deletedAt: 'deleted_at'
  });

  return Camera;
};