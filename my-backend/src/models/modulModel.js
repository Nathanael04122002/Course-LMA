const { db } = require('../config/db');

const modulCollection = () => db.collection('modul');

const ModulModel = {
  async getAll(kategori = null) {
    if (kategori) {
      return modulCollection().find(m => m.kategori.toLowerCase() === kategori.toLowerCase());
    }
    return modulCollection().find();
  },

  async getById(id) {
    return modulCollection().findById(id);
  },

  async create(modulData) {
    return modulCollection().insert(modulData);
  },

  async update(id, updates) {
    return modulCollection().updateById(id, updates);
  },

  async delete(id) {
    return modulCollection().deleteById(id);
  }
};

module.exports = ModulModel;
