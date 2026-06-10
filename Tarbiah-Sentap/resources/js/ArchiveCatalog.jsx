import React, { useEffect, useState, useMemo } from 'react';

export default function ArchiveCatalog({ setView, books = [], addToCart }) {
    useEffect(() => {
        const handleScroll = () => {
            const scrollPos = window.pageYOffset;
            document.querySelectorAll('.book-container img').forEach((img, index) => {
                const speed = 0.02 + (index * 0.005);
                img.style.transform = `translateY(${(scrollPos * speed) % 8}px)`;
            });
        };
        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    const [sortBy, setSortBy] = useState('Newest Arrivals');

    const sortedBooks = useMemo(() => {
        let result = [...books];
        if (sortBy === 'Price: High to Low') {
            result.sort((a, b) => Number(b.price) - Number(a.price));
        } else if (sortBy === 'Price: Low to High') {
            result.sort((a, b) => Number(a.price) - Number(b.price));
        } else if (sortBy === 'Alphabetical') {
            result.sort((a, b) => a.title.localeCompare(b.title));
        } else {
            result.sort((a, b) => b.id - a.id);
        }
        return result;
    }, [books, sortBy]);

    return (
        <div className="font-body-md text-body-md overflow-x-hidden bg-[#f9f9f9] text-[#1a1c1c] antialiased">
            {/* TopNavBar */}
            {/* Nav removed in favor of global UnifiedHeader */}
            <main className="pt-32 pb-section-gap max-w-container-max mx-auto px-margin-mobile md:px-margin-desktop">
                {/* Hero Section */}
                <header className="mb-16 max-w-2xl">
                    <h1 className="font-headline-lg text-headline-lg text-primary mb-4">The Complete Archive</h1>
                    <p className="font-body-lg text-body-lg text-on-surface-variant italic leading-relaxed">
                        A curated repository of humanity's most profound thoughts, preserved in exquisite bindings. Explore our definitive collection of rare editions, from foundational philosophy to timeless poetry.
                    </p>
                </header>
                <div className="flex flex-col lg:flex-row gap-gutter">
                    {/* Sidebar Filtering */}
                    <aside className="w-full lg:w-64 flex-shrink-0 space-y-10 border-r border-outline-variant/20 pr-gutter">
                        <div>
                            <h3 className="font-label-md text-label-md uppercase tracking-widest text-primary mb-6">Genre</h3>
                            <ul className="space-y-3">
                                <li><label className="flex items-center gap-3 cursor-pointer group"><input className="rounded-none border-outline text-primary focus:ring-primary" type="checkbox"/><span className="font-body-md text-on-surface-variant group-hover:text-primary transition-colors">Poetry</span></label></li>
                                <li><label className="flex items-center gap-3 cursor-pointer group"><input defaultChecked className="rounded-none border-outline text-primary focus:ring-primary" type="checkbox"/><span className="font-body-md text-primary">Philosophy</span></label></li>
                                <li><label className="flex items-center gap-3 cursor-pointer group"><input className="rounded-none border-outline text-primary focus:ring-primary" type="checkbox"/><span className="font-body-md text-on-surface-variant group-hover:text-primary transition-colors">Fiction</span></label></li>
                                <li><label className="flex items-center gap-3 cursor-pointer group"><input className="rounded-none border-outline text-primary focus:ring-primary" type="checkbox"/><span className="font-body-md text-on-surface-variant group-hover:text-primary transition-colors">Rare Classics</span></label></li>
                            </ul>
                        </div>
                        <div>
                            <h3 className="font-label-md text-label-md uppercase tracking-widest text-primary mb-6">Binding</h3>
                            <ul className="space-y-3">
                                <li><label className="flex items-center gap-3 cursor-pointer group"><input className="border-outline text-primary focus:ring-primary" name="binding" type="radio"/><span className="font-body-md text-on-surface-variant group-hover:text-primary transition-colors">Fine Leather</span></label></li>
                                <li><label className="flex items-center gap-3 cursor-pointer group"><input className="border-outline text-primary focus:ring-primary" name="binding" type="radio"/><span className="font-body-md text-on-surface-variant group-hover:text-primary transition-colors">Premium Cloth</span></label></li>
                                <li><label className="flex items-center gap-3 cursor-pointer group"><input className="border-outline text-primary focus:ring-primary" name="binding" type="radio"/><span className="font-body-md text-on-surface-variant group-hover:text-primary transition-colors">Vellum</span></label></li>
                            </ul>
                        </div>
                        <div>
                            <h3 className="font-label-md text-label-md uppercase tracking-widest text-primary mb-6">Sort By</h3>
                            <select 
                                className="w-full bg-transparent border-b border-on-surface/20 border-t-0 border-l-0 border-r-0 rounded-none py-2 px-0 focus:ring-0 focus:border-primary font-body-md text-on-surface-variant outline-none"
                                value={sortBy}
                                onChange={(e) => setSortBy(e.target.value)}
                            >
                                <option value="Newest Arrivals">Newest Arrivals</option>
                                <option value="Price: High to Low">Price: High to Low</option>
                                <option value="Price: Low to High">Price: Low to High</option>
                                <option value="Alphabetical">Alphabetical</option>
                            </select>
                        </div>
                    </aside>
                    {/* Product Grid */}
                    <section className="flex-grow">
                        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 2xl:grid-cols-6 gap-x-gutter gap-y-16">
                            {sortedBooks.map(book => (
                                <div key={book.id} className="book-container group relative flex flex-col h-full">
                                    <div className="aspect-[2/3] overflow-hidden bg-surface-container-high transition-all duration-500 border border-transparent group-hover:shadow-2xl">
                                        <img alt={book.title} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105" src={book.cover || book.image}/>
                                    </div>
                                    <div className="mt-6 flex flex-col flex-grow">
                                        <h2 className="font-headline-sm text-headline-sm text-on-surface line-clamp-2 leading-tight">{book.title}</h2>
                                        <p className="font-label-sm text-label-sm uppercase tracking-widest text-on-surface-variant mt-1 mb-4">{book.author} • RM {Number(book.price).toFixed(2)}</p>
                                        <button 
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                if(addToCart) addToCart(book);
                                                else alert('Added to cart');
                                            }}
                                            className="mt-auto bg-[#8b0000] text-white py-3 px-4 font-label-md text-label-md uppercase tracking-widest hover:bg-black transition-colors cursor-pointer w-full text-center border-0 shadow-md"
                                        >
                                            Add to Cart
                                        </button>
                                    </div>
                                    {/* Interaction Detail Panel */}
                                    <div className="book-details absolute top-0 left-[105%] w-[320px] bg-white shadow-2xl p-8 border border-outline-variant/10 hidden xl:block z-50">
                                        <div className="flex justify-between items-start mb-6">
                                            <span className="font-label-sm text-label-sm uppercase tracking-widest text-secondary">{book.genre}</span>
                                            <span className="font-label-md text-label-md text-primary">RM {Number(book.price).toFixed(2)}</span>
                                        </div>
                                        <h3 className="font-headline-md text-headline-md text-primary mb-2 leading-tight">{book.title}</h3>
                                        <p className="font-label-md text-label-md text-on-surface-variant mb-6 italic">{book.author}</p>
                                        <p className="font-body-md text-on-surface-variant leading-relaxed mb-8 line-clamp-4">
                                            A cornerstone of modern literature. This edition features premium craftsmanship and timeless knowledge.
                                        </p>
                                        <div className="space-y-3">
                                            <button 
                                                className="w-full bg-[#8b0000] text-white py-3 font-label-md text-label-md uppercase tracking-widest hover:bg-black transition-colors cursor-pointer border-0" 
                                                onClick={() => {
                                                    if(addToCart) addToCart(book);
                                                    else alert('Added to cart');
                                                }}
                                            >
                                                Add to Cart
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                        {/* Pagination/Load More */}
                        <div className="mt-24 flex flex-col items-center">
                            <button className="px-12 py-4 border border-on-surface text-on-surface font-label-md text-label-md uppercase tracking-widest hover:bg-on-surface hover:text-white transition-all duration-300">
                                Show More Editions
                            </button>
                            <p className="mt-6 font-label-sm text-label-sm text-on-surface-variant italic">Displaying 6 of 142 archival titles</p>
                        </div>
                    </section>
                </div>
            </main>
            {/* Footer */}
            <footer className="w-full py-section-gap px-margin-desktop flex flex-col items-center border-t border-outline-variant/20 bg-surface-container-lowest">
                <div className="w-full max-w-container-max grid grid-cols-1 md:grid-cols-4 gap-12 mb-16 text-center md:text-left">
                    <div className="md:col-span-1">
                        <span className="font-display-lg text-headline-sm italic mb-6 block" style={{ color: '#c5a059' }}>Tarbiah Sentap</span>
                        <p className="font-body-md text-on-surface-variant leading-relaxed">Memastikan warisan seni penulisan terpelihara melalui hasil pertukangan dan susun atur koleksi yang tiada tandingannya.</p>
                    </div>
                    <div>
                        <h4 className="font-label-md text-label-md uppercase tracking-widest text-primary mb-6">Koleksi</h4>
                        <ul className="space-y-3 font-body-md text-on-surface-variant">
                            <li><a className="hover:text-secondary transition-colors" href="#">Membership</a></li>
                            <li><a className="hover:text-secondary transition-colors" href="#">Provenance</a></li>
                            <li><a className="hover:text-secondary transition-colors" href="#">Acquisitions</a></li>
                        </ul>
                    </div>
                    <div>
                        <h4 className="font-label-md text-label-md uppercase tracking-widest text-primary mb-6">Private Sale</h4>
                        <ul className="space-y-3 font-body-md text-on-surface-variant">
                            <li><a className="hover:text-secondary transition-colors" href="#">Private Collection</a></li>
                            <li><a className="hover:text-secondary transition-colors" href="#">Terms of Sale</a></li>
                            <li><a className="hover:text-secondary transition-colors" href="#">Shipping &amp; Care</a></li>
                        </ul>
                    </div>
                    <div>
                        <h4 className="font-label-md text-label-md uppercase tracking-widest text-primary mb-6">Contact</h4>
                        <ul className="space-y-3 font-body-md text-on-surface-variant">
                            <li><a className="hover:text-secondary transition-colors" href="#">Concierge</a></li>
                            <li><a className="hover:text-secondary transition-colors" href="#">The Atelier</a></li>
                            <li><a className="hover:text-secondary transition-colors" href="#">Journal</a></li>
                        </ul>
                    </div>
                </div>
                <div className="pt-8 border-t border-outline-variant/20 w-full flex flex-col md:flex-row justify-between items-center gap-6">
                    <span className="font-body-md text-on-surface-variant opacity-60">© 2024 Tarbiah Sentap. All rights reserved.</span>
                    <div className="flex gap-8">
                        <a className="material-symbols-outlined text-primary hover:text-secondary-fixed transition-colors" href="#">public</a>
                        <a className="material-symbols-outlined text-primary hover:text-secondary-fixed transition-colors" href="#">mail</a>
                        <a className="material-symbols-outlined text-primary hover:text-secondary-fixed transition-colors" href="#">auto_stories</a>
                    </div>
                </div>
            </footer>
        </div>
    );
}
