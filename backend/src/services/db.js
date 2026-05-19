// backend/src/services/db.js
const { v4: uuidv4 } = require('uuid');

const mockData = {
  users: [
    { id: '1', email: 'admin@tarbiahsentap.com', password: 'password123', role: 'admin', twofa_enabled: true },
    { id: '2', email: 'customer@example.com', password: 'password123', role: 'customer', twofa_enabled: false },
  ],
  books: [
    { id: '1', title: 'The Quantum Age', author: 'Dr. Aris Thorne', price: 29.99, stock: 50, genre: 'Science', rating: 4.8, cover: 'https://images.unsplash.com/photo-1614729939124-032f0b56c9ce?auto=format&fit=crop&q=80&w=400&h=600' },
    { id: '2', title: 'Echoes of Eternity', author: 'Lyra Vance', price: 19.50, stock: 30, genre: 'Sci-Fi', rating: 4.5, cover: 'https://images.unsplash.com/photo-1618553676231-50e560fcc4cb?auto=format&fit=crop&q=80&w=400&h=600' },
    { id: '3', title: 'Minimalist Living', author: 'Jane Doe', price: 24.00, stock: 20, genre: 'Lifestyle', rating: 4.9, cover: 'https://images.unsplash.com/photo-1494438639946-1ebd1d20bf85?auto=format&fit=crop&q=80&w=400&h=600' },
    { id: '4', title: 'Deep Work', author: 'Cal Newport', price: 22.90, stock: 15, genre: 'Productivity', rating: 4.7, cover: 'https://images.unsplash.com/photo-1589829085413-56de8ae18c73?auto=format&fit=crop&q=80&w=400&h=600' },
    { id: '5', title: 'The Silent Patient', author: 'Alex Michaelides', price: 18.99, stock: 10, genre: 'Thriller', rating: 4.6, cover: 'https://images.unsplash.com/photo-1587876931567-564ce588bfbd?auto=format&fit=crop&q=80&w=400&h=600' },
    { id: '6', title: 'Dune', author: 'Frank Herbert', price: 25.00, stock: 40, genre: 'Sci-Fi', rating: 4.9, cover: 'https://images.unsplash.com/photo-1541963463532-d68292c34b19?auto=format&fit=crop&q=80&w=400&h=600' },
  ],
  orders: [],
  reports: [],
};

const db = {
  users: {
    find: (predicate) => mockData.users.find(predicate),
    findAll: () => mockData.users,
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
