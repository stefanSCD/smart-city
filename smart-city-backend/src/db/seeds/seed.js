// src/db/seeds/seed.js
const { User, Employee, Problem } = require('../../models');
const bcrypt = require('bcryptjs');

async function seedDatabase() {
  try {
    // Create admin user
    const hashedPassword = await bcrypt.hash('admin123', 10);
    await User.create({
      email: 'admin@example.com',
      password: hashedPassword,
      nume: 'Admin',
      prenume: 'User',
      location: 'Central',
      department: 'Admin'
    });

    // Create test employee
    await Employee.create({
      username: 'employee1',
      password: hashedPassword,
      nume: 'John',
      prenume: 'Doe',
      department: 'Salubritate',
      role: 'Operator',
      firma: 'Clean City'
    });

    console.log('Seed completed successfully');
  } catch (error) {
    console.error('Error seeding database:', error);
  }
}

seedDatabase();