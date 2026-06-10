import React, { useState } from 'react';

export default function StitchDesign({ setView, books = [] }) {
    const mockBooks = [
        { id: '1', title: 'Izinkan Aku Mencintai-Mu', author: 'Ustaz Adnin Roslan', price: 25.00, cover: '/images/books/1-Izinkan-Aku-Mencintai-Mu.jpg' },
        { id: '2', title: 'Diantara Berjuta Engkaulah Yang Jelita', author: 'Ustaz Adnin Roslan', price: 28.00, cover: '/images/books/2-Diantara-Berjuta-Engkaulah-Yang-Jelita.jpg' },
        { id: '3', title: 'Tarbiah Kampus 2', author: 'Ustaz Adnin Roslan', price: 20.00, cover: '/images/books/3-Tarbiah-Kampus-2.jpg' },
        { id: '4', title: 'Surat Cinta Dari Tuhan', author: 'Tarbiah Sentap', price: 35.00, cover: '/images/books/4-Surat-Cinta-Dari-Tuhan-Sinopsis-30-Juz-Quran.jpg' },
        { id: '5', title: 'Surat Cinta Untuk Pendosa', author: 'Ustaz Adnin Roslan', price: 22.00, cover: '/images/books/5-Surat-Cinta-Untuk-Pendosa.jpg' },
        { id: '6', title: '100 Doa Taubat', author: 'Tarbiah Sentap', price: 15.00, cover: '/images/books/6-100-Doa-Taubat Dari-Al-Quran-dan-Hadith-Nabi-Muhammad-SAW.jpg' },
        { id: '7', title: 'Tuhan Aku Ingin Sembuh', author: 'Ustaz Adnin Roslan', price: 24.00, cover: '/images/books/7-Tuhan-Aku-Ingin-Sembuh.jpg' },
        { id: '8', title: 'Parenting Akhir Zaman', author: 'Tarbiah Sentap', price: 26.00, cover: '/images/books/8-Parenting-Akhir-Zaman.jpg' },
        { id: '9', title: 'Aku Juga Punya Hati', author: 'Ustaz Adnin Roslan', price: 23.00, cover: '/images/books/9-Aku-Juga-Punya-Hati.jpg' },
        { id: '11', title: 'Tuhan Aku Ingin Cahaya', author: 'Ustaz Adnin Roslan', price: 22.00, cover: '/images/books/11-Tuhan-Aku-Ingin-Cahaya.jpg' },
        { id: '13', title: 'Surat Cinta Dari Tuhan', author: 'Ustaz Adnin Roslan', price: 30.00, cover: '/images/books/13-Surat-Cinta-Dari-Tuhan-Edisi-Istimewa.jpg' },
        { id: '14', title: 'Teruntuk Jiwa Yang Terluka', author: 'Tarbiah Sentap', price: 25.00, cover: '/images/books/14-Teruntuk-Jiwa-Yang-Terluka.jpg' },
        { id: '15', title: '40 Pesan Akhir Zaman', author: 'Ustaz Adnin Roslan', price: 18.00, cover: '/images/books/15-40-Pesan-Akhir-Zaman.jpg' },
        { id: '16', title: 'Tarbiah Kampus', author: 'Ustaz Adnin Roslan', price: 20.00, cover: '/images/books/16-Tarbiah-Kampus.jpg' },
        { id: '17', title: 'Tuhan Aku Ingin Jumpa Nabi', author: 'Ustaz Adnin Roslan', price: 24.00, cover: '/images/books/17-Tuhan-Aku-Ingin-Jumpa-Nabi.jpg' },
        { id: '18', title: 'Menjadi Bidadari Syurga', author: 'Tarbiah Sentap', price: 22.00, cover: '/images/books/18-Menjadi-Bidadari-Syurga.jpg' },
        { id: '19', title: 'Healing Dengan Doa', author: 'Ustaz Adnin Roslan', price: 25.00, cover: '/images/books/19-Healing-Dengan-Doa.jpg' },
        { id: '20', title: 'Menggapai Cinta Dengan Doa', author: 'Ustaz Adnin Roslan', price: 23.00, cover: '/images/books/20-Menggapai-Cinta-Dengan-Doa.jpg' },
        { id: '21', title: 'Aku Bukan Ustaz', author: 'Ustaz Adnin Roslan', price: 20.00, cover: '/images/books/21-Aku-Bukan-Ustaz.jpg' },
        { id: '22', title: 'Patahnya Sayap Harapan', author: 'Tarbiah Sentap', price: 24.00, cover: '/images/books/22-Patahnya-Sayap-Harapan.jpg' },
        { id: '23', title: 'Novel Mangkat', author: 'Tarbiah Sentap', price: 28.00, cover: '/images/books/23-Novel-Mangkat.jpg' },
        { id: '24', title: 'Noktah Dari Palestin', author: 'Tarbiah Sentap', price: 18.00, cover: '/images/books/24-Noktah-Dari-Palestin.jpg' },
        { id: '25', title: 'Khabar Murka Dari Tuhan', author: 'Ustaz Adnin Roslan', price: 22.00, cover: '/images/books/25-Khabar-Murka-Dari-Tuhan.jpg' },
        { id: '26', title: 'Novel Ajari Aku Tentang Cinta', author: 'Tarbiah Sentap', price: 26.00, cover: '/images/books/26-Novel-Ajari-Aku-Tentang-Cinta.jpg' },
        { id: '27', title: 'Khabar Gembira Dari Tuhan', author: 'Ustaz Adnin Roslan', price: 22.00, cover: '/images/books/27-Khabar-Gembira-Dari-Tuhan.jpg' },
        { id: '29', title: 'Retaknya Sebuah Percaya', author: 'Tarbiah Sentap', price: 24.00, cover: '/images/books/29-Retaknya-Sebuah-Percaya.jpg' },
        { id: '30', title: 'Novel Izinkan Aku Mencari Tuhan', author: 'Tarbiah Sentap', price: 27.00, cover: '/images/books/30-Novel-Izinkan-Aku-Menacari-Tuhan.jpg' },
        { id: '33', title: 'Novel Selindung', author: 'Tarbiah Sentap', price: 25.00, cover: '/images/books/33-Novel-Selindung.jpg' },
        { id: '38', title: 'Ini Semua Mitos', author: 'Ustaz Adnin Roslan', price: 21.00, cover: '/images/books/38-Ini-Semua-Mitos.jpg' },
        { id: '39', title: 'Maksiat Akhir Zaman', author: 'Ustaz Adnin Roslan', price: 20.00, cover: '/images/books/39-Maksiat-Akhir-Zaman.jpg' },
        { id: '40', title: 'Saat Kiamat Menghampiri', author: 'Tarbiah Sentap', price: 26.00, cover: '/images/books/40-Saat-Kiamat-Menghampiri.jpg' },
        { id: '41', title: 'Surat Untuk Orang Yang Putus Asa', author: 'Ustaz Adnin Roslan', price: 23.00, cover: '/images/books/41-Surat-Untuk-Orang-Yang-Putus-Asa.jpg' },
        { id: '42', title: 'Ajari Aku Tentang Rindu', author: 'Tarbiah Sentap', price: 25.00, cover: '/images/books/42-Ajari-Aku-Tentang-Rindu.jpg' },
        { id: '43', title: 'Manga Tarbiah', author: 'Tarbiah Sentap', price: 19.00, cover: '/images/books/43-Manga-Tarbiah-Analogi-Kehidupan.jpg' },
        { id: '44', title: 'Tuhan Aku Ingin Hijrah', author: 'Ustaz Adnin Roslan', price: 22.00, cover: '/images/books/44-Tuhan-Aku-Ingin-Hijrah.jpg' }
    ];

    const displayBooks = books && books.length > 0 ? books : mockBooks;

    return (
        <div className="bg-background min-h-screen text-tertiary font-body-md overflow-x-hidden selection:bg-secondary selection:text-tertiary">
            {/* Top Navigation */}
            <header className="w-full flex justify-between items-center py-6 px-margin-desktop bg-surface border-b border-outline shadow-sm sticky top-0 z-50">
                <div className="flex-1 cursor-pointer flex items-center" onClick={() => setView('catalog')}>
                    <span className="font-headline-lg font-semibold tracking-wider text-[32px] text-primary">TARBIAH SENTAP</span>
                </div>
                <nav className="flex-1 hidden md:flex justify-center gap-12">
                    <a href="#" className="font-label-md tracking-[0.2em] text-on-surface-variant hover:text-primary transition-colors uppercase text-xs">Catalogue</a>
                    <a href="#" className="font-label-md tracking-[0.2em] text-secondary border-b border-secondary pb-1 uppercase text-xs">Collections</a>
                    <a href="#" className="font-label-md tracking-[0.2em] text-on-surface-variant hover:text-primary transition-colors uppercase text-xs">Journal</a>
                </nav>
                <div className="flex-1 flex justify-end items-center gap-8">
                    <span className="material-symbols-outlined cursor-pointer text-tertiary hover:text-secondary transition-colors" onClick={() => setView('search')}>search</span>
                    <span className="material-symbols-outlined cursor-pointer text-tertiary hover:text-secondary transition-colors" onClick={() => setView('login')}>person</span>
                    <span className="material-symbols-outlined cursor-pointer text-tertiary hover:text-secondary transition-colors relative" onClick={() => setView('cart')}>
                        shopping_bag
                        <span className="absolute -top-1 -right-2 bg-primary text-neutral text-[9px] w-4 h-4 flex items-center justify-center rounded-full">0</span>
                    </span>
                </div>
            </header>

            {/* Hero Section */}
            <section className="w-full bg-surface relative border-b border-outline pt-16 pb-24 px-margin-desktop overflow-hidden">
                <div className="max-w-container-max mx-auto flex flex-col md:flex-row items-center justify-between gap-16 relative z-10">
                    <div className="flex-1 max-w-2xl">
                        <div className="flex items-center gap-4 mb-6">
                            <div className="w-12 h-[1px] bg-secondary"></div>
                            <span className="font-label-md tracking-[0.3em] uppercase text-secondary text-sm">Exclusive Editions</span>
                        </div>
                        <h1 className="font-headline-lg text-[56px] md:text-[72px] leading-[1.1] text-tertiary mb-8">
                            Awaken Your <span className="italic text-primary">Soul</span><br/> Through Words.
                        </h1>
                        <p className="font-body-lg text-on-surface-variant text-lg md:text-xl leading-relaxed mb-12 max-w-xl">
                            Discover our curated collection of spiritual literature, meticulously crafted to inspire, heal, and guide your journey towards divine love.
                        </p>
                        <button className="bg-primary text-neutral font-label-md tracking-[0.2em] uppercase px-10 py-5 text-sm hover:bg-tertiary transition-colors duration-500 shadow-xl">
                            Explore Collection
                        </button>
                    </div>
                    <div className="flex-1 relative w-full flex justify-center md:justify-end">
                        <div className="relative w-64 md:w-80 aspect-[2/3] z-10 book-shadow transform rotate-3 hover:rotate-0 transition-transform duration-700 cursor-pointer group">
                            <img src={displayBooks[0]?.cover || displayBooks[0]?.image} alt="Featured Book" className="w-full h-full object-cover" />
                            <div className="absolute inset-0 border border-secondary/0 group-hover:border-secondary/100 transition-colors duration-500 m-2"></div>
                        </div>
                        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[120%] h-[120%] bg-secondary/5 rounded-full blur-3xl -z-10"></div>
                    </div>
                </div>
            </section>

            <main className="max-w-container-max mx-auto px-margin-desktop py-24">
                <div className="flex flex-col md:flex-row gap-16">
                    {/* Filters Sidebar */}
                    <aside className="w-64 flex-shrink-0">
                        <div className="sticky top-32">
                            <h3 className="font-headline-md text-2xl text-tertiary mb-10 pb-4 border-b border-outline">Refine Library</h3>
                            
                            {/* Categories */}
                            <div className="mb-10">
                                <h4 className="font-label-md tracking-[0.2em] uppercase text-on-surface-variant text-xs mb-6">By Genre</h4>
                                <ul className="space-y-4">
                                    {['Spiritual', 'Tarbiah', 'Novel', 'Self-Help', 'Manga'].map((genre, idx) => (
                                        <li key={idx} className="flex items-center gap-4 cursor-pointer group">
                                            <div className={`w-3 h-3 border ${idx === 0 ? 'bg-secondary border-secondary' : 'border-outline group-hover:border-secondary transition-colors'}`}></div>
                                            <span className={`font-label-md text-sm ${idx === 0 ? 'text-primary' : 'text-on-surface-variant group-hover:text-tertiary transition-colors'}`}>{genre}</span>
                                        </li>
                                    ))}
                                </ul>
                            </div>

                            {/* Price Range */}
                            <div>
                                <h4 className="font-label-md tracking-[0.2em] uppercase text-on-surface-variant text-xs mb-6">Price Range</h4>
                                <ul className="space-y-4">
                                    {['Under RM 20', 'RM 20 - RM 30', 'Over RM 30'].map((range, idx) => (
                                        <li key={idx} className="flex items-center gap-4 cursor-pointer group">
                                            <div className="w-3 h-3 border border-outline group-hover:border-secondary transition-colors"></div>
                                            <span className="font-label-md text-sm text-on-surface-variant group-hover:text-tertiary transition-colors">{range}</span>
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        </div>
                    </aside>

                    {/* Book Grid */}
                    <div className="flex-1">
                        <div className="flex justify-between items-center mb-12 pb-6 border-b border-outline">
                            <span className="font-label-md text-on-surface-variant text-sm">Showing {displayBooks.length} Editions</span>
                            <div className="flex items-center gap-3 cursor-pointer group">
                                <span className="font-label-md text-tertiary text-sm tracking-widest uppercase">Sort: Featured</span>
                                <span className="material-symbols-outlined text-secondary text-[18px] group-hover:translate-y-1 transition-transform">expand_more</span>
                            </div>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-x-12 gap-y-20">
                            {displayBooks.map((book, index) => (
                                <div key={book.id || index} className="group cursor-pointer flex flex-col">
                                    <div className="aspect-[2/3] mb-6 bg-surface border border-outline relative overflow-hidden shadow-sm group-hover:shadow-2xl transition-all duration-700">
                                        <img 
                                            src={book.cover || book.image} 
                                            alt={book.title} 
                                            className="w-full h-full object-cover transform scale-100 group-hover:scale-105 transition-transform duration-1000 ease-out" 
                                        />
                                        
                                        {/* Luxury Hover Overlay */}
                                        <div className="absolute inset-0 bg-tertiary/60 opacity-0 group-hover:opacity-100 transition-opacity duration-500 flex flex-col items-center justify-center gap-6">
                                            <button className="bg-primary text-neutral font-label-md tracking-[0.1em] uppercase px-8 py-3 text-xs hover:bg-neutral hover:text-primary transition-colors duration-300">
                                                Add to Cart
                                            </button>
                                            <button className="bg-transparent border border-neutral text-neutral font-label-md tracking-[0.1em] uppercase px-8 py-3 text-xs hover:bg-neutral hover:text-tertiary transition-colors duration-300">
                                                Quick View
                                            </button>
                                        </div>
                                    </div>
                                    <div className="flex flex-col flex-1">
                                        <h2 className="font-headline-md text-2xl text-tertiary mb-2 leading-snug group-hover:text-primary transition-colors duration-300">{book.title}</h2>
                                        <p className="font-label-md text-on-surface-variant text-sm mb-4">{book.author}</p>
                                        <p className="font-headline-sm text-secondary text-xl mt-auto">RM {Number(book.price).toFixed(2)}</p>
                                    </div>
                                </div>
                            ))}
                        </div>

                        {/* Pagination / Load More */}
                        <div className="mt-32 flex justify-center border-t border-outline pt-16">
                            <button className="border border-tertiary text-tertiary font-label-md tracking-[0.2em] uppercase px-12 py-4 text-sm hover:bg-secondary hover:border-secondary hover:text-neutral transition-all duration-500">
                                Load More Editions
                            </button>
                        </div>
                    </div>
                </div>
            </main>

            {/* Premium Footer */}
            <footer className="w-full bg-tertiary text-neutral pt-24 pb-12 px-margin-desktop">
                <div className="max-w-container-max mx-auto flex flex-col md:flex-row justify-between items-start gap-16 border-b border-neutral/20 pb-16">
                    <div className="flex flex-col gap-6 max-w-sm">
                        <span className="font-headline-lg tracking-wider text-[28px] text-secondary">TARBIAH SENTAP</span>
                        <p className="font-body-md text-neutral/70 leading-relaxed">
                            Curating transformative spiritual literature designed to elevate the mind and purify the soul.
                        </p>
                    </div>
                    
                    <div className="flex flex-wrap gap-x-24 gap-y-12">
                        <div className="flex flex-col gap-6">
                            <h4 className="font-label-md tracking-[0.2em] uppercase text-secondary text-xs">Explore</h4>
                            <a href="#" className="font-label-md text-neutral/70 hover:text-neutral transition-colors">Our Story</a>
                            <a href="#" className="font-label-md text-neutral/70 hover:text-neutral transition-colors">The Catalogue</a>
                            <a href="#" className="font-label-md text-neutral/70 hover:text-neutral transition-colors">Authors</a>
                        </div>
                        <div className="flex flex-col gap-6">
                            <h4 className="font-label-md tracking-[0.2em] uppercase text-secondary text-xs">Assistance</h4>
                            <a href="#" className="font-label-md text-neutral/70 hover:text-neutral transition-colors">Shipping Returns</a>
                            <a href="#" className="font-label-md text-neutral/70 hover:text-neutral transition-colors">Contact Concierge</a>
                            <a href="#" className="font-label-md text-neutral/70 hover:text-neutral transition-colors">FAQ</a>
                        </div>
                        <div className="flex flex-col gap-6">
                            <h4 className="font-label-md tracking-[0.2em] uppercase text-secondary text-xs">Newsletter</h4>
                            <p className="font-label-md text-neutral/70 max-w-xs">Subscribe to receive exclusive insights and new arrivals.</p>
                            <div className="flex border-b border-neutral/30 pb-2 mt-2 group">
                                <input type="email" placeholder="Email Address" className="bg-transparent text-neutral outline-none font-label-md w-full placeholder-neutral/40" />
                                <span className="material-symbols-outlined text-secondary cursor-pointer group-hover:translate-x-1 transition-transform">arrow_forward</span>
                            </div>
                        </div>
                    </div>
                </div>
                <div className="max-w-container-max mx-auto pt-8 flex flex-col md:flex-row justify-between items-center gap-6">
                    <p className="font-label-md text-neutral/50 text-xs tracking-widest uppercase">© 2026 Tarbiah Sentap. All rights reserved.</p>
                    <div className="flex gap-8">
                        <a href="#" className="font-label-md text-neutral/50 text-xs hover:text-secondary transition-colors uppercase tracking-widest">Privacy Policy</a>
                        <a href="#" className="font-label-md text-neutral/50 text-xs hover:text-secondary transition-colors uppercase tracking-widest">Terms of Service</a>
                    </div>
                </div>
            </footer>
        </div>
    );
}
