
module.exports = (sequelize, DataTypes) => {
    const User = sequelize.define('User', {
      id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
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
      location: {
        type: DataTypes.STRING
      },
      created_at: {
        type: DataTypes.DATE,
        defaultValue: DataTypes.NOW
      },
      avatar: {
        type: DataTypes.STRING,
        defaultValue: "/images/default-avatar.jpg"
      },
      phone: {
        type: DataTypes.STRING,
        allowNull: true
      }
    }, {
      tableName: 'users',
      timestamps: false
    });
  
    User.associate = (models) => {
      User.hasMany(models.Problem, { foreignKey: 'user_id' });
    };
  
    return User;
  };