import React, { useState } from 'react';

export default function StitchDesign({ setView, books = [] }) {
    const mockBooks = [
        { id: '1', title: 'Izinkan Aku Mencintai-Mu', author: 'Ustaz Adnin Roslan', price: 25.00, genre: 'Spiritual', cover: '/images/books/1-Izinkan-Aku-Mencintai-Mu.jpg' },
        { id: '2', title: 'Diantara Berjuta Engkaulah Yang Jelita', author: 'Ustaz Adnin Roslan', price: 28.00, genre: 'Novel', cover: '/images/books/2-Diantara-Berjuta-Engkaulah-Yang-Jelita.jpg' },
        { id: '3', title: 'Tarbiah Kampus 2', author: 'Ustaz Adnin Roslan', price: 20.00, genre: 'Tarbiah', cover: '/images/books/3-Tarbiah-Kampus-2.jpg' },
        { id: '4', title: 'Surat Cinta Dari Tuhan', author: 'Tarbiah Sentap', price: 35.00, genre: 'Spiritual', cover: '/images/books/4-Surat-Cinta-Dari-Tuhan-Sinopsis-30-Juz-Quran.jpg' },
        { id: '5', title: 'Surat Cinta Untuk Pendosa', author: 'Ustaz Adnin Roslan', price: 22.00, genre: 'Tarbiah', cover: '/images/books/5-Surat-Cinta-Untuk-Pendosa.jpg' },
        { id: '6', title: '100 Doa Taubat', author: 'Tarbiah Sentap', price: 15.00, genre: 'Spiritual', cover: '/images/books/6-100-Doa-Taubat Dari-Al-Quran-dan-Hadith-Nabi-Muhammad-SAW.jpg' },
        { id: '7', title: 'Tuhan Aku Ingin Sembuh', author: 'Ustaz Adnin Roslan', price: 24.00, genre: 'Self-Help', cover: '/images/books/7-Tuhan-Aku-Ingin-Sembuh.jpg' },
        { id: '8', title: 'Parenting Akhir Zaman', author: 'Tarbiah Sentap', price: 26.00, genre: 'Self-Help', cover: '/images/books/8-Parenting-Akhir-Zaman.jpg' }
    ];

    const sourceBooks = books && books.length > 0 ? books : mockBooks;
    const displayBooks = sourceBooks.slice(0, 4);

    return (
        <div className="bg-surface text-on-surface font-body-md overflow-x-hidden paper-texture">
            {/* TopNavBar Removed to avoid duplication with global Header */}

            {/* Carousel Hero Banner */}
            <section className="relative h-[819px] w-full overflow-hidden bg-on-surface">
                <div className="relative h-full w-full" id="hero-carousel">
                    <div className="absolute inset-0 transition-opacity duration-1000 opacity-100">
                        <img 
                            className="w-full h-full object-cover opacity-60" 
                            alt="A cinematic, low-angle shot of a grand private library at twilight." 
                            src="https://lh3.googleusercontent.com/aida-public/AB6AXuD0N2HBaF6DJd6InxUzvsDwfY9pYuhMs2avVx5mu0vNs_OJMmCqDM6xVgxiXWP3VLX5is0YeHayI3G5zUZmB94Auv-mo8Kho3B2EUgqPLaN1vZ7JjmU4ODrfSGgcykN46g1o2TXL1dzBxJemKSAXc7IXXNtKU2UYor3eWO6D0ikl-AXGbUNpM95nBTUjirWdfx7N5f6kIym5lsJYhM1Pc_7oTO40ur5Rg3rVf4lD5lGh8rMOSveTpL9K6EiEsq_pp1bgjbTLpibft8"
                        />
                        <div className="absolute inset-0 flex flex-col justify-center items-center text-center px-6">
                            <span className="text-secondary-fixed font-label-md tracking-[0.2em] uppercase mb-4">The Curated Legacy</span>
                            <h1 className="text-surface font-display-lg text-display-lg max-w-4xl mb-8">Rare Editions for the Discerning Collector</h1>
                            <button className="bg-primary-container text-surface px-10 py-4 font-label-md text-label-md tracking-widest uppercase hover:bg-primary transition-colors border border-primary-container shadow-xl cursor-pointer">
                                Reserve Now
                            </button>
                        </div>
                    </div>
                </div>
            </section>

            {/* Product Catalog (Essential Series) */}
            <section className="max-w-container-max mx-auto px-margin-desktop py-section-gap">
                <div className="flex justify-between items-end mb-12">
                    <div>
                        <h2 className="font-headline-lg text-headline-lg mb-2">Essential Series</h2>
                        <p className="font-body-lg text-body-lg text-on-surface-variant italic">The foundational pillars of the literary canon.</p>
                    </div>
                    <div className="hidden md:block h-[1px] bg-outline-variant flex-grow mx-12 opacity-30"></div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-gutter" id="product-grid">
                    {displayBooks.map(book => (
                        <div key={book.id} className="group cursor-pointer book-card-hover">
                            <div className="aspect-[2/3] overflow-hidden relative border border-outline-variant/20 transition-all duration-500 group-hover:border-secondary bg-surface">
                                <img 
                                    className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105" 
                                    alt={book.title} 
                                    src={book.cover || book.image}
                                />
                                <div className="quick-view absolute bottom-0 left-0 right-0 bg-surface/90 py-3 text-center opacity-0 translate-y-4 transition-all duration-300">
                                    <span className="font-label-md text-label-md uppercase tracking-widest text-on-surface">Quick View</span>
                                </div>
                            </div>
                            <div className="mt-4 flex flex-col h-full">
                                <h3 className="font-headline-sm text-headline-sm line-clamp-2 leading-tight">{book.title}</h3>
                                <p className="font-label-sm text-label-sm text-on-surface-variant uppercase tracking-tighter mt-1">{book.author}</p>
                                <p className="mt-2 font-label-md text-label-md text-primary">RM {Number(book.price).toFixed(2)}</p>
                            </div>
                        </div>
                    ))}
                </div>
                <div className="mt-16 flex justify-center">
                    <button 
                        className="border border-secondary px-12 py-4 font-label-md text-label-md tracking-[0.2em] uppercase text-on-surface hover:bg-on-surface hover:text-surface transition-all duration-500 cursor-pointer"
                        onClick={() => setView('archive')}
                    >
                        Show Full Catalogue
                    </button>
                </div>
            </section>

            {/* The Best Books (Featured Showcase) */}
            <section className="bg-on-surface text-surface py-section-gap">
                <div className="max-w-container-max mx-auto px-margin-desktop">
                    <div className="editorial-split items-center gap-16">
                        <div className="relative order-2 md:order-1">
                            <div className="aspect-[3/4] w-full bg-tertiary-container relative z-10">
                                <img 
                                    className="w-full h-full object-cover grayscale hover:grayscale-0 transition-all duration-1000" 
                                    alt="A museum-grade display" 
                                    src="https://lh3.googleusercontent.com/aida-public/AB6AXuCOwyfC6Wn9MYwOYHURfhOHWNlFcC0Ju7b1N7lw6ZXDBH-Kwc3XSJYPrgpmwtiqJKWJljpgrD22hDbwy72Yc5A3QbFINJuDVXcdfYT7Az1sZXIa9lU6Tz_YuGDCX153kd2RsK0P_y1-S8acDtSwEPDffeGmkL79FciAbCvqp2lBB-gJR0HVTYAboRN43L5nUVpKQebCsrly3dIvIGXlRUHjcBUYStA3qKtA003lmqyWZS5wZe_vYcTVrrhvLhXfMgNM77nL2_E_q04"
                                />
                            </div>
                            <div className="absolute -top-10 -left-10 w-full h-full border border-secondary/30 -z-10"></div>
                        </div>
                        <div className="order-1 md:order-2">
                            <span className="text-secondary font-label-md uppercase tracking-widest mb-6 block">Editorial Choice</span>
                            <h2 className="font-display-lg text-display-lg-mobile md:text-display-lg mb-8 leading-tight">The Heritage Collection: Vol. I</h2>
                            <p className="font-body-lg text-body-lg mb-8 leading-relaxed text-on-tertiary-container">
                                An unprecedented gathering of foundational texts, bound in ethically sourced calfskin and embossed with 24-karat gold. Each volume in the Heritage Collection represents a year of meticulous restoration and artisanal printing on archival-grade vellum. This is more than a library; it is a repository of human thought.
                            </p>
                            <div className="flex flex-col gap-4">
                                <div className="flex items-center gap-4 py-4 border-b border-outline/20">
                                    <span className="material-symbols-outlined text-secondary">verified</span>
                                    <span className="font-label-md text-label-md">Certified Provenance Documentation</span>
                                </div>
                                <div className="flex items-center gap-4 py-4 border-b border-outline/20">
                                    <span className="material-symbols-outlined text-secondary">auto_stories</span>
                                    <span className="font-label-md text-label-md">Limited to 50 Numbered Editions</span>
                                </div>
                            </div>
                            <button className="mt-12 group flex items-center gap-4 font-label-md text-label-md tracking-widest uppercase cursor-pointer border-0 bg-transparent text-surface hover:text-secondary transition-colors">
                                Explore the Collection 
                                <span className="material-symbols-outlined group-hover:translate-x-2 transition-transform">arrow_forward</span>
                            </button>
                        </div>
                    </div>
                </div>
            </section>

            {/* About the Writers (Carlos Ruiz Zafón) */}
            <section className="py-section-gap bg-surface-container relative overflow-hidden">
                <div className="absolute top-0 right-0 w-1/3 h-full bg-primary/5 -skew-x-12 translate-x-1/2"></div>
                <div className="max-w-container-max mx-auto px-margin-desktop relative z-10">
                    <div className="text-center mb-16">
                        <h2 className="font-headline-lg text-headline-lg">Masters of the Craft</h2>
                        <div className="w-24 h-1 bg-primary mx-auto mt-4"></div>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
                        {/* Writer 1 */}
                        <div className="group">
                            <div className="relative mb-6 overflow-hidden">
                                <img 
                                    className="w-full aspect-square object-cover grayscale filter transition-all duration-700 group-hover:grayscale-0 group-hover:scale-110" 
                                    alt="Author Portrait 1" 
                                    src="https://lh3.googleusercontent.com/aida-public/AB6AXuAfFsHAyVbn4XH5_I-Ll5tOgJ33tZdlEjIMQ4ioVUmTRwgIi2qt7YIaVGDT5qGryLavgRlPHaZKvztgQUdczqZas__6r5oeTFidIFbxAye-YUXteoKT5VJvWXrCaC-B_OAvi_rkW5KTP-6BXlojJWgbtgILbgr2Wi5mXkjzLt3343nADEgOm53OxjyH4dFNa7tPVn1jeCqTPY8BvJTST6BedY7Pgmy9zTUZOj839FCV_7RYr9CcmrKCZBQmwO2foFqcOewPEDvdYvg"
                                />
                            </div>
                            <h3 className="font-headline-sm text-headline-sm mb-2">Ustaz Adnin Roslan</h3>
                            <p className="font-body-md text-body-md text-on-surface-variant line-clamp-3">The architect of Tarbiah Sentap, his prose captures the misty, spiritual heart of the soul like no other.</p>
                        </div>
                        {/* Writer 2 */}
                        <div className="group">
                            <div className="relative mb-6 overflow-hidden">
                                <img 
                                    className="w-full aspect-square object-cover grayscale filter transition-all duration-700 group-hover:grayscale-0 group-hover:scale-110" 
                                    alt="Author Portrait 2" 
                                    src="https://lh3.googleusercontent.com/aida-public/AB6AXuCL2hgoOrgraSMrIzDLmQamPXGrWINnHyhcPh5JbBH7tbl0qJ50gDDRAOZpttWljYcRKB1YAF-mWdNVeBhCZ4UfaKfZ31MLnpLa65lRu0l8ycFvguEDG5cmuPzD7reE_6IU98i7l6vvBV3UTbdnAR20dusjCiaIIahVl9bEPa5r3jQ1JEUaJLl4YZWjGPXGLCg76wB8VQShF5pshdCcDYoBxDDBUkFW5FkSShNj_1wETVP_ymGer4qEuCUD4O63uVH66iGY3nRw3FI"
                                />
                            </div>
                            <h3 className="font-headline-sm text-headline-sm mb-2">Ustazah Asma</h3>
                            <p className="font-body-md text-body-md text-on-surface-variant line-clamp-3">A guiding light in the modern world, her writings have redefined contemporary faith through raw, piercing emotional honesty.</p>
                        </div>
                        {/* Writer 3 */}
                        <div className="group">
                            <div className="relative mb-6 overflow-hidden">
                                <img 
                                    className="w-full aspect-square object-cover grayscale filter transition-all duration-700 group-hover:grayscale-0 group-hover:scale-110" 
                                    alt="Author Portrait 3" 
                                    src="https://lh3.googleusercontent.com/aida-public/AB6AXuDMOYH8fyNJ6UMFA10VijztNaovvuBZoJXMQU2AERlyA6HcPnalockuL7E1S8VXE71Vh5TWgS6qhnZID6WG_JsxLJkC6T9uSF8m3GWvCDN2oLHdAhrJ77nEVSa2J6otOfe-r2V9qvwyVJj9U9xuJ8rv9iGVf-FWcXIiITDF20WcSNzyr08kld4CtRkAax4Q3A0IU71wOBmozmRZD0r_J8oqPpzYtN6ggdHfIcIQBd6UJG5P8k6Y7y1rWNZJRMpjGiESSFe4lvFAW00"
                                />
                            </div>
                            <h3 className="font-headline-sm text-headline-sm mb-2">Aizuddin Hamid</h3>
                            <p className="font-body-md text-body-md text-on-surface-variant line-clamp-3">The master of heartfelt narratives, blending the mundane with the profound in a rhythmic, poetry-infused literary dance.</p>
                        </div>
                    </div>
                </div>
            </section>

            {/* Membership/Newsletter */}
            <section className="py-section-gap">
                <div className="max-w-[800px] mx-auto px-margin-mobile text-center border border-secondary/20 p-12 md:p-20 relative">
                    <div className="absolute -top-4 left-1/2 -translate-x-1/2 bg-surface px-4">
                        <span className="material-symbols-outlined text-secondary scale-150" style={{ fontVariationSettings: "'FILL' 1" }}>mail</span>
                    </div>
                    <h2 className="font-headline-lg text-headline-lg mb-6">Join The Literary Circle</h2>
                    <p className="font-body-lg text-body-lg text-on-surface-variant mb-10">
                        Receive exclusive invitations to private launches, early access to new releases, and editorial insights from our team.
                    </p>
                    <form className="flex flex-col md:flex-row gap-4" onSubmit={(e) => e.preventDefault()}>
                        <input 
                            className="flex-grow bg-transparent border-0 border-b border-on-surface py-4 focus:ring-0 focus:border-primary font-label-md text-label-md placeholder:text-on-tertiary-container outline-none" 
                            placeholder="Your primary email address" 
                            type="email" 
                        />
                        <button className="bg-on-surface text-surface px-12 py-4 font-label-md text-label-md uppercase tracking-widest hover:bg-primary transition-colors border-0 cursor-pointer" type="submit">Join Now</button>
                    </form>
                    <p className="mt-6 font-label-sm text-label-sm text-on-tertiary-container">Respecting your privacy is a core tenet of our provenance.</p>
                </div>
            </section>

            {/* Footer */}
            <footer className="bg-surface border-t border-outline-variant">
                <div className="flex flex-col md:flex-row justify-between items-center w-full px-margin-desktop py-12 gap-gutter max-w-container-max mx-auto">
                    <div className="flex flex-col gap-4 items-center md:items-start">
                        <div className="font-headline-sm text-headline-sm text-primary">Tarbiah Sentap</div>
                        <p className="font-label-sm text-label-sm text-on-surface-variant">© 2026 Tarbiah Sentap. All Rights Reserved.</p>
                    </div>
                    <div className="flex gap-8">
                        <a className="font-label-sm text-label-sm text-on-surface-variant hover:text-primary transition-colors" href="#">Privacy Policy</a>
                        <a className="font-label-sm text-label-sm text-on-surface-variant hover:text-primary transition-colors" href="#">Terms of Service</a>
                        <a className="font-label-sm text-label-sm text-on-surface-variant hover:text-primary transition-colors" href="#">Provenance</a>
                        <a className="font-label-sm text-label-sm text-on-surface-variant hover:text-primary transition-colors" href="#">Contact</a>
                    </div>
                    <div className="flex gap-6">
                        <a className="text-on-surface-variant hover:text-primary transition-colors" href="#"><span className="material-symbols-outlined">share</span></a>
                        <a className="text-on-surface-variant hover:text-primary transition-colors" href="#"><span className="material-symbols-outlined">public</span></a>
                    </div>
                </div>
            </footer>
        </div>
    );
}
