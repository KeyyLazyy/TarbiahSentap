const fs = require('fs');
const path = require('path');

const directoryPath = path.join(__dirname, 'resources', 'js');

const dictionary = [
    // BookstoreApp / General
    { regex: />The Shadow of the Wind</g, replacement: ">Bayangan Angin<" },
    { regex: />A stunning masterpiece set in post-war Barcelona, this edition features a hand-bound crimson linen cover, gold-leaf edges, and exclusive illustrations by the author. A story about a secret library of forgotten books and a boy’s obsession with a mysterious novelist\.</g, replacement: ">Karya agung berlatarkan Barcelona pasca perang, menampilkan ilustrasi eksklusif. Sebuah kisah mengenai perpustakaan rahsia buku-buku yang dilupakan dan obsesi seorang budak lelaki terhadap seorang novelis misteri.<" },
    { regex: />Shipping &amp; Returns</g, replacement: ">Penghantaran &amp; Pemulangan<" },

    // CartDrawer.jsx & DetailedCartView.jsx
    { regex: />Your library is currently empty\.</g, replacement: ">Perpustakaan anda kini kosong.<" },
    { regex: />Authenticated Provenance</g, replacement: ">Keaslian Disahkan<" },
    { regex: />Remove</g, replacement: ">Buang<" },
    { regex: />Insured Shipping</g, replacement: ">Penghantaran Berinsurans<" },
    { regex: />Complimentary</g, replacement: ">Percuma<" },
    { regex: />Total Investment</g, replacement: ">Jumlah Pelaburan<" },
    { regex: />Proceed to Checkout</g, replacement: ">Teruskan ke Pembayaran<" },
    { regex: />View Cart Details</g, replacement: ">Lihat Butiran Troli<" },
    { regex: />Continue Browsing</g, replacement: ">Teruskan Melayari<" },
    { regex: />Secure White-Glove Logistics Guaranteed</g, replacement: ">Logistik Selamat Terjamin<" },
    { regex: />An exquisite collection curated for the discerning bibliophile\. Review your acquisitions before they are secured for transit\.</g, replacement: ">Koleksi indah yang disusun rapi. Semak pembelian anda sebelum dihantar.<" },
    { regex: />Return to Catalogue</g, replacement: ">Kembali ke Katalog<" },
    { regex: />Provenance & Authentication</g, replacement: ">Asal-Usul & Pengesahan<" },
    { regex: />Remove Item</g, replacement: ">Buang Barang<" },
    { regex: />Insured Int'l Shipping</g, replacement: ">Penghantaran Antarabangsa Berinsurans<" },
    { regex: />Calculated at Checkout</g, replacement: ">Dikira Semasa Pembayaran<" },
    { regex: />Secure Escrow Protection</g, replacement: ">Perlindungan Pembayaran Selamat<" },
    { regex: />Your investment is held in secure custody until the delivery is verified\.</g, replacement: ">Pembayaran anda disimpan dengan selamat sehingga penghantaran disahkan.<" },
    { regex: />Private Concierge Service Available</g, replacement: ">Perkhidmatan Konsierj Peribadi Tersedia<" },
    { regex: />Sotheby's Verified Partner</g, replacement: ">Rakan Kongsi Sah Sotheby's<" },
    { regex: />RBDA Certified</g, replacement: ">Disahkan RBDA<" },
    { regex: />Global Heritage Trust</g, replacement: ">Amanah Warisan Global<" },
    { regex: />Acquisition Summary</g, replacement: ">Ringkasan Pembelian<" },
    { regex: />Tax \/ Duties</g, replacement: ">Cukai / Duti<" },

    // PortalView.jsx
    { regex: />Explore the Vault</g, replacement: ">Terokai Ruang Simpanan<" },
    { regex: />The Portal</g, replacement: ">Portal Rasmi<" },
    { regex: />Navigating the</g, replacement: ">Menelusuri<" },
    { regex: />Written Word\.</g, replacement: ">Dunia Penulisan.<" },
    { regex: />Catalogue</g, replacement: ">Katalog<" },
    { regex: />Our complete registry of contemporary and classic literature across all genres\.</g, replacement: ">Daftar lengkap kesusasteraan kontemporari dan klasik di semua genre.<" },
    { regex: />Thematic cycles curated by our editors, exploring intersections of philosophy and prose\.</g, replacement: ">Kitaran bertema yang disusun oleh editor kami, meneroka persimpangan falsafah dan prosa.<" },
    { regex: />A chronologically preserved vault of literary history, from enlightenment to avant-garde\.</g, replacement: ">Ruang sejarah sastera yang dipelihara, dari pencerahan ke avant-garde.<" },
    { regex: />The Member Circle</g, replacement: ">Kelab Ahli<" },
    { regex: />Join our private community for exclusive previews and editorial insights\.</g, replacement: ">Sertai komuniti peribadi kami untuk pratonton eksklusif dan pandangan editorial.<" },
    { regex: />Discover</g, replacement: ">Temui Sesuatu<" },
    { regex: />VOLUMES</g, replacement: ">NASKHAH<" },
    { regex: />RARE FINDS</g, replacement: ">BUKU NADIR<" },

    // StitchDesign.jsx
    { regex: />Show Full Catalogue</g, replacement: ">Lihat Katalog Penuh<" },
    { regex: />A guiding light in the modern world, her writings have redefined contemporary faith through raw, piercing emotional honesty\.</g, replacement: ">Sinar panduan di dunia moden, penulisannya telah mentakrifkan semula kepercayaan kontemporari melalui kejujuran emosi.<" },
    { regex: />The master of heartfelt narratives, blending the mundane with the profound in a rhythmic, poetry-infused literary dance\.</g, replacement: ">Pakar naratif tulus ikhlas, menggabungkan perkara biasa dengan mendalam dalam tarian sastera yang diselit puisi.<" },
    { regex: />Join The Literary Circle</g, replacement: ">Sertai Kelab Sastera<" },
    { regex: />Receive exclusive invitations to private launches, early access to new releases, and editorial insights from our team\.</g, replacement: ">Terima jemputan eksklusif ke pelancaran peribadi, akses awal keluaran baharu, dan wawasan editorial daripada pasukan kami.<" },
    { regex: />Join Now</g, replacement: ">Sertai Sekarang<" },
    { regex: />Respecting your privacy is a core tenet of our provenance\.</g, replacement: ">Menghormati privasi anda adalah prinsip utama kami.<" },

    // UnifiedHeader.jsx
    { regex: />Main Menu</g, replacement: ">Menu Utama<" },
    { regex: />Sign In</g, replacement: ">Log Masuk<" },
    { regex: />Order</g, replacement: ">Pesanan<" }
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
        console.log(`Translated remaining UI in: ${path.basename(filePath)}`);
    }
}

fs.readdirSync(directoryPath).forEach(file => {
    translateFile(path.join(directoryPath, file));
});
console.log('Final translation pass complete.');
