const fs = require('fs');
const path = require('path');

const directoryPath = path.join(__dirname, 'resources', 'js');

const dictionary = [
    { regex: />Curations</g, replacement: ">Koleksi<" },
    { regex: />Editions</g, replacement: ">Edisi<" },
    { regex: />Archives</g, replacement: ">Arkib<" },
    { regex: />About</g, replacement: ">Tentang Kami<" },
    { regex: /Search volumes\.\.\./g, replacement: "Cari naskhah..." },
    { regex: />Add to Private Library</g, replacement: ">Masuk Troli<" },
    { regex: />Enter the Sanctum</g, replacement: ">Masuk ke Portal<" },
    { regex: />Pre-order Signed Edition</g, replacement: ">Prapesan Edisi Istimewa<" },
    { regex: />Book Details</g, replacement: ">Butiran Buku<" },
    { regex: />Format</g, replacement: ">Format<" },
    { regex: />Pages</g, replacement: ">Muka Surat<" },
    { regex: />Dimensions</g, replacement: ">Dimensi<" },
    { regex: />Shipping & Returns</g, replacement: ">Penghantaran & Pemulangan<" },
    { regex: />Checkout</g, replacement: ">Pembayaran<" },
    { regex: />Shopping Cart</g, replacement: ">Troli Membeli-belah<" },
    { regex: />Continue Shopping</g, replacement: ">Teruskan Membeli<" },
    { regex: />Your Cart</g, replacement: ">Troli Anda<" },
    { regex: />Subtotal</g, replacement: ">Subjumlah<" },
    { regex: />Total</g, replacement: ">Jumlah<" },
    { regex: />Log Out</g, replacement: ">Log Keluar<" },
    { regex: />Profile</g, replacement: ">Profil<" },
    { regex: />My Orders</g, replacement: ">Pesanan Saya<" },
    { regex: />Email Address</g, replacement: ">Alamat Emel<" },
    { regex: />Password</g, replacement: ">Kata Laluan<" },
    { regex: />Sign In</g, replacement: ">Log Masuk<" },
    { regex: />Sign Up</g, replacement: ">Daftar<" },
    { regex: />Login</g, replacement: ">Log Masuk<" },
    { regex: />Register</g, replacement: ">Daftar<" },
    { regex: />Dashboard</g, replacement: ">Papan Pemuka<" },
    { regex: />Author</g, replacement: ">Penulis<" },
    { regex: />Publisher</g, replacement: ">Penerbit<" },
    { regex: />Language</g, replacement: ">Bahasa<" },
    { regex: />Synopsis \/ Overview</g, replacement: ">Sinopsis / Ringkasan<" },
    { regex: />Price</g, replacement: ">Harga<" },
    { regex: />Add to Cart</g, replacement: ">Masuk Troli<" },
    { regex: />Secure Checkout</g, replacement: ">Pembayaran Selamat<" },
    { regex: />Remove</g, replacement: ">Buang<" },
    { regex: />Order History</g, replacement: ">Sejarah Pesanan<" }
];

function translateFile(filePath) {
    if (!filePath.endsWith('.jsx')) return;
    let content = fs.readFileSync(filePath, 'utf8');
    let original = content;
    
    dictionary.forEach(({ regex, replacement }) => {
        content = content.replace(regex, replacement);
    });

    if (content !== original) {
        fs.writeFileSync(filePath, content, 'utf8');
        console.log(`Translated UI in: ${path.basename(filePath)}`);
    }
}

fs.readdirSync(directoryPath).forEach(file => {
    translateFile(path.join(directoryPath, file));
});
console.log('Translation complete.');
