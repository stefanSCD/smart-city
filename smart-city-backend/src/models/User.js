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

      // Relația cu departamentul
      User.belongsTo(models.Department, {
        foreignKey: 'department_id',
        as: 'departmentDetails'
      });
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
      type: DataTypes.STRING,
      allowNull: false,
      defaultValue: 'user',
      validate: {
        isIn: [['user', 'employee', 'admin']]
      },
      field: 'user_type' // Mapare explicită la coloana din baza de date
    },
    department: {
      type: DataTypes.STRING,
      allowNull: true
    },
    department_id: {
      type: DataTypes.INTEGER,
      allowNull: true,
      references: {
        model: 'departments',
        key: 'id'
      }
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
      defaultValue: true,
      field: 'active' // Mapare explicită la coloana din baza de date
    },
    lastLogin: {
      type: DataTypes.DATE,
      allowNull: true,
      field: 'last_login' // Mapare explicită la coloana din baza de date
    }
  }, {
    sequelize,
    modelName: 'User',
    tableName: 'users', // Folosește nume de tabel lowercase pentru consistență
    timestamps: true,
    underscored: true, // Utilizează snake_case pentru numele coloanelor
    paranoid: false, // Activează soft delete (adaugă un câmp deleted_at în loc să șteargă efectiv)
    // Maparea explicită a coloanelor timestamps
    createdAt: 'created_at',
    updatedAt: 'updated_at',
    //deletedAt: 'deleted_at'
  });

  // Hook pentru a gestiona duplicate keys în cazul utilizării UUID
  User.beforeCreate(async (user) => {
    const existingUser = await User.findOne({ where: { email: user.email } });
    if (existingUser) {
      throw new Error('User with this email already exists');
    }
  });

  // Metode de instanță utile
  User.prototype.toJSON = function() {
    const values = { ...this.get() };
    delete values.password; // Nu expune niciodată parola în răspunsuri
    return values;
  };

  return User;
};