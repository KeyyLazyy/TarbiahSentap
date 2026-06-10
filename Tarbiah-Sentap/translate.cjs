const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, 'resources', 'js', 'BookstoreApp.jsx');

const dictionary = [
    { regex: />Active Acquisitions</g, replacement: ">Pesanan Aktif<" },
    { regex: />([0-9]+) Items in Progress</g, replacement: ">$1 Barang Sedang Diproses<" },
    { regex: />No active acquisitions at the moment\.</g, replacement: ">Tiada pesanan aktif pada masa ini.<" },
    { regex: />Acquired /g, replacement: ">Dipesan " },
    { regex: />Track Progress</g, replacement: ">Jejak Pesanan<" },
    { regex: />Past Ledger</g, replacement: ">Rekod Lepas<" },
    { regex: />Export PDF</g, replacement: ">Eksport PDF<" },
    { regex: />Filter</g, replacement: ">Tapis<" },
    { regex: />Order ID</g, replacement: ">ID Pesanan<" },
    { regex: />Date</g, replacement: ">Tarikh<" },
    { regex: />Cover</g, replacement: ">Kulit Buku<" },
    { regex: />Acquisition</g, replacement: ">Pembelian<" },
    { regex: />Status</g, replacement: ">Status<" },
    { regex: />Value</g, replacement: ">Nilai<" },
    { regex: />No past acquisitions found\.</g, replacement: ">Tiada rekod pembelian lepas.<" },
    { regex: /'pending'/g, replacement: "'pending'" } 
];

let content = fs.readFileSync(filePath, 'utf8');
let original = content;

dictionary.forEach(({ regex, replacement }) => {
    content = content.replace(regex, replacement);
});

// Fix hardcoded "Items in Progress" if regex didn't catch {activeOrders.length}
content = content.replace(/Items in Progress/g, "Pesanan Sedang Diproses");

if (content !== original) {
    fs.writeFileSync(filePath, content, 'utf8');
    console.log(`Translated OrdersView in: ${path.basename(filePath)}`);
} else {
    console.log('No OrdersView changes made.');
}
