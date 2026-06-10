require('dotenv').config();
const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_KEY);

async function fixCovers() {
  const { data: books, error } = await supabase.from('books').select('id, cover');
  if (error) {
    console.error(error);
    return;
  }

  for (const book of books) {
    // Remove newlines and tabs
    let cleanCover = book.cover.replace(/[\r\n\t]/g, '');
    
    // The chat UI might have inserted random spaces inside the domain name, like:
    // "https://...supabase.              co/storage..."
    // Let's remove multiple spaces
    cleanCover = cleanCover.replace(/  +/g, '');
    
    // Specifically fix the broken domain part
    cleanCover = cleanCover.replace('. co/storage', '.co/storage');
    cleanCover = cleanCover.replace('.co/storage', '.co/storage'); // in case there was a space
    
    // Just to be absolutely safe, let's reconstruct it cleanly
    const filename = cleanCover.split('/').pop().trim();
    const finalCover = `https://iuyqnqwvpsrzsrdcccoh.supabase.co/storage/v1/object/public/image/books/${filename}`;

    await supabase.from('books').update({ cover: finalCover }).eq('id', book.id);
    console.log(`Fixed book ${book.id}: ${finalCover}`);
  }
  console.log('✅ All book covers fixed!');
}

fixCovers();
