// backend/src/services/db.js
const { supabase } = require('./supabase');

const db = {
  users: {
    find: async (predicate) => {
      // NOTE: `users` are handled by Supabase Auth (auth.users), 
      // direct finds might require Admin API. For most queries, prefer auth endpoints.
      return null;
    },
    findAll: async () => {
      if (supabase.auth.admin) {
        const { data, error } = await supabase.auth.admin.listUsers();
        if (error) throw error;
        return data.users;
      }
      return [];
    },
    create: async (data) => {
       // Handled by Auth routes directly via supabase.auth.signUp
       throw new Error('Use auth API to create users');
    },
  },
  books: {
    findAll: async () => {
      const { data, error } = await supabase.from('books').select('*').order('id');
      if (error) throw error;
      return data;
    },
    findById: async (id) => {
      const { data, error } = await supabase.from('books').select('*').eq('id', id).single();
      if (error) throw error;
      return data;
    },
    create: async (data) => {
      const { data: newBook, error } = await supabase.from('books').insert([data]).select().single();
      if (error) throw error;
      return newBook;
    },
    update: async (id, data) => {
      const { data: updated, error } = await supabase.from('books').update(data).eq('id', id).select().single();
      if (error) throw error;
      return updated;
    },
    delete: async (id) => {
      const { error } = await supabase.from('books').delete().eq('id', id);
      if (error) throw error;
      return true;
    },
  },
  orders: {
    create: async (data) => {
      const { data: newOrder, error } = await supabase.from('orders').insert([data]).select().single();
      if (error) throw error;
      return newOrder;
    },
    findByUser: async (userId) => {
      const { data, error } = await supabase.from('orders').select('*').eq('user_id', userId).order('created_at', { ascending: false });
      if (error) throw error;
      return data;
    },
    findAll: async () => {
      const { data, error } = await supabase.from('orders').select('*').order('created_at', { ascending: false });
      if (error) throw error;
      return data;
    },
  },
};

module.exports = db;
