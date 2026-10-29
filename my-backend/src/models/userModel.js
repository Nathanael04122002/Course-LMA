const { db } = require('../config/db');

const usersCollection = () => db.collection('users');

const UserModel = {
  async findByEmail(email) {
    if (!email) return null;
    return usersCollection().findOne(u => u.email.toLowerCase() === email.toLowerCase());
  },

  async findById(id) {
    const user = await usersCollection().findById(id);
    if (user) {
      const { password, ...safeUser } = user;
      return safeUser;
    }
    return null;
  },

  async findByIdWithPassword(id) {
    return usersCollection().findById(id);
  },

  async getAll() {
    const list = await usersCollection().find();
    return list.map(({ password, ...u }) => u);
  },

  async create(userData) {
    return usersCollection().insert(userData);
  },

  async update(id, updates) {
    return usersCollection().updateById(id, updates);
  },

  async delete(id) {
    return usersCollection().deleteById(id);
  }
};

module.exports = UserModel;
