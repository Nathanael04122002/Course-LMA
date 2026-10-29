const { db } = require('../config/db');

const meetCollection = () => db.collection('meet_schedules');

const MeetModel = {
  async getAll() {
    const list = await meetCollection().find();
    // Urutkan berdasarkan waktu mulai terdekat
    return list.sort((a, b) => new Date(a.start_time) - new Date(b.start_time));
  },

  async getById(id) {
    return meetCollection().findById(id);
  },

  async getActiveOrUpcoming() {
    return meetCollection().find(m => m.status === 'live' || m.status === 'upcoming');
  },

  async create(meetData) {
    return meetCollection().insert(meetData);
  },

  async update(id, updates) {
    return meetCollection().updateById(id, updates);
  },

  async delete(id) {
    return meetCollection().deleteById(id);
  }
};

module.exports = MeetModel;
