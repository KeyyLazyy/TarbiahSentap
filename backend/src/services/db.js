// backend/src/services/db.js
const { v4: uuidv4 } = require('uuid');

const mockData = {
  users: [
    { id: '1', email: 'admin@tarbiahsentap.com', password: 'password123', role: 'admin', twofa_enabled: true },
    { id: '2', email: 'customer@example.com', password: 'password123', role: 'customer', twofa_enabled: false },
  ],
  books: [
    { id: '1', title: 'Izinkan Aku Mencintai-Mu', author: 'Ustaz Adnin Roslan', price: 25.00, stock: 45, genre: 'Spiritual', rating: 4.8, cover: '/images/books/1-Izinkan-Aku-Mencintai-Mu.jpg' },
    { id: '2', title: 'Diantara Berjuta Engkaulah Yang Jelita', author: 'Ustaz Adnin Roslan', price: 28.00, stock: 35, genre: 'Novel', rating: 4.7, cover: '/images/books/2-Diantara-Berjuta-Engkaulah-Yang-Jelita.jpg' },
    { id: '3', title: 'Tarbiah Kampus 2', author: 'Ustaz Adnin Roslan', price: 20.00, stock: 50, genre: 'Tarbiah', rating: 4.9, cover: '/images/books/3-Tarbiah-Kampus-2.jpg' },
    { id: '4', title: 'Surat Cinta Dari Tuhan: Sinopsis 30 Juz', author: 'Tarbiah Sentap', price: 35.00, stock: 60, genre: 'Spiritual', rating: 5.0, cover: '/images/books/4-Surat-Cinta-Dari-Tuhan-Sinopsis-30-Juz-Quran.jpg' },
    { id: '5', title: 'Surat Cinta Untuk Pendosa', author: 'Ustaz Adnin Roslan', price: 22.00, stock: 40, genre: 'Tarbiah', rating: 4.6, cover: '/images/books/5-Surat-Cinta-Untuk-Pendosa.jpg' },
    { id: '6', title: '100 Doa Taubat Dari Al-Quran & Hadith', author: 'Tarbiah Sentap', price: 15.00, stock: 75, genre: 'Spiritual', rating: 4.9, cover: '/images/books/6-100-Doa-Taubat Dari-Al-Quran-dan-Hadith-Nabi-Muhammad-SAW.jpg' },
    { id: '7', title: 'Tuhan Aku Ingin Sembuh', author: 'Ustaz Adnin Roslan', price: 24.00, stock: 55, genre: 'Self-Help', rating: 4.8, cover: '/images/books/7-Tuhan-Aku-Ingin-Sembuh.jpg' },
    { id: '8', title: 'Parenting Akhir Zaman', author: 'Tarbiah Sentap', price: 26.00, stock: 30, genre: 'Self-Help', rating: 4.5, cover: '/images/books/8-Parenting-Akhir-Zaman.jpg' },
    { id: '9', title: 'Aku Juga Punya Hati', author: 'Ustaz Adnin Roslan', price: 23.00, stock: 25, genre: 'Tarbiah', rating: 4.7, cover: '/images/books/9-Aku-Juga-Punya-Hati.jpg' },
    { id: '11', title: 'Tuhan Aku Ingin Cahaya', author: 'Ustaz Adnin Roslan', price: 22.00, stock: 48, genre: 'Spiritual', rating: 4.8, cover: '/images/books/11-Tuhan-Aku-Ingin-Cahaya.jpg' },
    { id: '13', title: 'Surat Cinta Dari Tuhan (Edisi Istimewa)', author: 'Ustaz Adnin Roslan', price: 30.00, stock: 40, genre: 'Spiritual', rating: 4.9, cover: '/images/books/13-Surat-Cinta-Dari-Tuhan-Edisi-Istimewa.jpg' },
    { id: '14', title: 'Teruntuk Jiwa Yang Terluka', author: 'Tarbiah Sentap', price: 25.00, stock: 38, genre: 'Self-Help', rating: 4.6, cover: '/images/books/14-Teruntuk-Jiwa-Yang-Terluka.jpg' },
    { id: '15', title: '40 Pesan Akhir Zaman', author: 'Ustaz Adnin Roslan', price: 18.00, stock: 65, genre: 'Tarbiah', rating: 4.7, cover: '/images/books/15-40-Pesan-Akhir-Zaman.jpg' },
    { id: '16', title: 'Tarbiah Kampus', author: 'Ustaz Adnin Roslan', price: 20.00, stock: 80, genre: 'Tarbiah', rating: 4.8, cover: '/images/books/16-Tarbiah-Kampus.jpg' },
    { id: '17', title: 'Tuhan Aku Ingin Jumpa Nabi', author: 'Ustaz Adnin Roslan', price: 24.00, stock: 42, genre: 'Spiritual', rating: 4.9, cover: '/images/books/17-Tuhan-Aku-Ingin-Jumpa-Nabi.jpg' },
    { id: '18', title: 'Menjadi Bidadari Syurga', author: 'Tarbiah Sentap', price: 22.00, stock: 50, genre: 'Spiritual', rating: 4.8, cover: '/images/books/18-Menjadi-Bidadari-Syurga.jpg' },
    { id: '19', title: 'Healing Dengan Doa', author: 'Ustaz Adnin Roslan', price: 25.00, stock: 35, genre: 'Self-Help', rating: 4.9, cover: '/images/books/19-Healing-Dengan-Doa.jpg' },
    { id: '20', title: 'Menggapai Cinta Dengan Doa', author: 'Ustaz Adnin Roslan', price: 23.00, stock: 28, genre: 'Self-Help', rating: 4.7, cover: '/images/books/20-Menggapai-Cinta-Dengan-Doa.jpg' },
    { id: '21', title: 'Aku Bukan Ustaz', author: 'Ustaz Adnin Roslan', price: 20.00, stock: 60, genre: 'Novel', rating: 4.6, cover: '/images/books/21-Aku-Bukan-Ustaz.jpg' },
    { id: '22', title: 'Patahnya Sayap Harapan', author: 'Tarbiah Sentap', price: 24.00, stock: 40, genre: 'Novel', rating: 4.5, cover: '/images/books/22-Patahnya-Sayap-Harapan.jpg' },
    { id: '23', title: 'Novel Mangkat', author: 'Tarbiah Sentap', price: 28.00, stock: 15, genre: 'Novel', rating: 4.6, cover: '/images/books/23-Novel-Mangkat.jpg' },
    { id: '24', title: 'Noktah Dari Palestin', author: 'Tarbiah Sentap', price: 18.00, stock: 70, genre: 'Spiritual', rating: 4.9, cover: '/images/books/24-Noktah-Dari-Palestin.jpg' },
    { id: '25', title: 'Khabar Murka Dari Tuhan', author: 'Ustaz Adnin Roslan', price: 22.00, stock: 32, genre: 'Tarbiah', rating: 4.7, cover: '/images/books/25-Khabar-Murka-Dari-Tuhan.jpg' },
    { id: '26', title: 'Novel Ajari Aku Tentang Cinta', author: 'Tarbiah Sentap', price: 26.00, stock: 24, genre: 'Novel', rating: 4.8, cover: '/images/books/26-Novel-Ajari-Aku-Tentang-Cinta.jpg' },
    { id: '27', title: 'Khabar Gembira Dari Tuhan', author: 'Ustaz Adnin Roslan', price: 22.00, stock: 36, genre: 'Tarbiah', rating: 4.7, cover: '/images/books/27-Khabar-Gembira-Dari-Tuhan.jpg' },
    { id: '29', title: 'Retaknya Sebuah Percaya', author: 'Tarbiah Sentap', price: 24.00, stock: 30, genre: 'Self-Help', rating: 4.6, cover: '/images/books/29-Retaknya-Sebuah-Percaya.jpg' },
    { id: '30', title: 'Novel Izinkan Aku Mencari Tuhan', author: 'Tarbiah Sentap', price: 27.00, stock: 18, genre: 'Novel', rating: 4.8, cover: '/images/books/30-Novel-Izinkan-Aku-Menacari-Tuhan.jpg' },
    { id: '33', title: 'Novel Selindung', author: 'Tarbiah Sentap', price: 25.00, stock: 22, genre: 'Novel', rating: 4.7, cover: '/images/books/33-Novel-Selindung.jpg' },
    { id: '38', title: 'Ini Semua Mitos', author: 'Ustaz Adnin Roslan', price: 21.00, stock: 58, genre: 'Tarbiah', rating: 4.7, cover: '/images/books/38-Ini-Semua-Mitos.jpg' },
    { id: '39', title: 'Maksiat Akhir Zaman', author: 'Ustaz Adnin Roslan', price: 20.00, stock: 62, genre: 'Tarbiah', rating: 4.8, cover: '/images/books/39-Maksiat-Akhir-Zaman.jpg' },
    { id: '40', title: 'Saat Kiamat Menghampiri', author: 'Tarbiah Sentap', price: 26.00, stock: 45, genre: 'Spiritual', rating: 4.9, cover: '/images/books/40-Saat-Kiamat-Menghampiri.jpg' },
    { id: '41', title: 'Surat Untuk Orang Yang Putus Asa', author: 'Ustaz Adnin Roslan', price: 23.00, stock: 50, genre: 'Self-Help', rating: 4.9, cover: '/images/books/41-Surat-Untuk-Orang-Yang-Putus-Asa.jpg' },
    { id: '42', title: 'Ajari Aku Tentang Rindu', author: 'Tarbiah Sentap', price: 25.00, stock: 28, genre: 'Novel', rating: 4.6, cover: '/images/books/42-Ajari-Aku-Tentang-Rindu.jpg' },
    { id: '43', title: 'Manga Tarbiah: Analogi Kehidupan', author: 'Tarbiah Sentap', price: 19.00, stock: 40, genre: 'Manga', rating: 4.8, cover: '/images/books/43-Manga-Tarbiah-Analogi-Kehidupan.jpg' },
    { id: '44', title: 'Tuhan Aku Ingin Hijrah', author: 'Ustaz Adnin Roslan', price: 22.00, stock: 52, genre: 'Self-Help', rating: 4.8, cover: '/images/books/44-Tuhan-Aku-Ingin-Hijrah.jpg' }
  ],
  orders: [],
  reports: [],
};

const db = {
  users: {
    find: (predicate) => mockData.users.find(predicate),
    findAll: () => mockData.users,
    create: (data) => {
      const newUser = { id: uuidv4(), ...data };
      mockData.users.push(newUser);
      return newUser;
    },
  },
  books: {
    findAll: () => mockData.books,
    findById: (id) => mockData.books.find(b => b.id === id),
    create: (data) => {
      const newBook = { id: uuidv4(), ...data };
      mockData.books.push(newBook);
      return newBook;
    },
    update: (id, data) => {
      const index = mockData.books.findIndex(b => b.id === id);
      if (index === -1) return null;
      mockData.books[index] = { ...mockData.books[index], ...data };
      return mockData.books[index];
    },
    delete: (id) => {
      const index = mockData.books.findIndex(b => b.id === id);
      if (index === -1) return false;
      mockData.books.splice(index, 1);
      return true;
    },
  },
  orders: {
    create: (data) => {
      const newOrder = { id: uuidv4(), status: 'pending', created_at: new Date(), ...data };
      mockData.orders.push(newOrder);
      return newOrder;
    },
    findByUser: (userId) => mockData.orders.filter(o => o.user_id === userId),
    findAll: () => mockData.orders,
  },
};

module.exports = db;
