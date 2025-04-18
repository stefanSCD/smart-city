const { query } = require('../config/db');

class User {
  static async findByEmail(email) {
    try {
      const results = await query('SELECT * FROM users WHERE email = ?', [email]);
      return results[0];
    } catch (error) {
      console.error('Error finding user by email:', error);
      throw error;
    }
  }
  
}