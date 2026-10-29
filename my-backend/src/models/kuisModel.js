const { db } = require('../config/db');

const quizCollection = () => db.collection('quizzes');
const resultsCollection = () => db.collection('quiz_results');

const KuisModel = {
  async getAll(kategori = null) {
    if (kategori) {
      return quizCollection().find(q => q.kategori.toLowerCase() === kategori.toLowerCase());
    }
    return quizCollection().find();
  },

  async getById(id) {
    return quizCollection().findById(id);
  },

  async create(quizData) {
    return quizCollection().insert(quizData);
  },

  async update(id, updates) {
    return quizCollection().updateById(id, updates);
  },

  async delete(id) {
    return quizCollection().deleteById(id);
  },

  // Simpan hasil kuis siswa
  async saveResult(resultData) {
    return resultsCollection().insert(resultData);
  },

  // Ambil riwayat nilai siswa
  async getResultsByUserId(userId) {
    const results = await resultsCollection().find(r => Number(r.user_id) === Number(userId));
    const allQuizzes = await quizCollection().find();
    
    // Gabungkan dengan info judul kuis
    return results.map(res => {
      const quiz = allQuizzes.find(q => Number(q.id) === Number(res.quiz_id));
      return {
        ...res,
        quiz_title: quiz ? quiz.title : 'Kuis LMA',
        quiz_kategori: quiz ? quiz.kategori : 'umum'
      };
    }).sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
  },

  // Ambil semua hasil kuis (untuk guru / admin)
  async getAllResults() {
    const results = await resultsCollection().find();
    const allUsers = await db.collection('users').find();
    const allQuizzes = await quizCollection().find();

    return results.map(res => {
      const user = allUsers.find(u => Number(u.id) === Number(res.user_id));
      const quiz = allQuizzes.find(q => Number(q.id) === Number(res.quiz_id));
      return {
        ...res,
        user_name: user ? user.name : 'Siswa LMA',
        user_email: user ? user.email : '',
        quiz_title: quiz ? quiz.title : 'Kuis LMA'
      };
    }).sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
  }
};

module.exports = KuisModel;
