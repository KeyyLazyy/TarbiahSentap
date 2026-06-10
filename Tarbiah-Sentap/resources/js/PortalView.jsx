import React, { useState, useEffect, useRef } from 'react';

const PortalView = ({ setView, books = [] }) => {
    // Current Slide State
    const [currentSlide, setCurrentSlide] = useState(0);
    const [isHovered, setIsHovered] = useState(false);

    // Carousel slides data
    const slides = [
        {
            img: "/assets/banner/1.png",
            title: "",
            subtitle: ""
        },
        {
            img: "/assets/banner/2.png",
            title: "",
            subtitle: ""
        },
        {
            img: "/assets/banner/3.png",
            title: "",
            subtitle: ""
        }
    ];


    // Handle AutoPlay Carousel
    useEffect(() => {
        let interval;
        const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
        
        if (!isHovered && !prefersReducedMotion) {
            interval = setInterval(() => {
                setCurrentSlide(prev => (prev + 1) % slides.length);
            }, 5000);
        }

        return () => {
            if (interval) clearInterval(interval);
        };
    }, [isHovered, slides.length]);

    const nextSlide = () => setCurrentSlide(prev => (prev + 1) % slides.length);
    const prevSlide = () => setCurrentSlide(prev => (prev - 1 + slides.length) % slides.length);

    // Assuming the first book is the featured/best seller
    const featuredBook = books[0] || {
        title: "Echoes of the Infinite",
        author: "A.G. STERLING",
        cover: "https://lh3.googleusercontent.com/aida-public/AB6AXuACDwDahyCTPRc9d-3FiK7tyy8UGiB5V9SbZNS6qriHUH2AWs9AcOmiof5_gUQLx53vzvsU6ZTW8yrKOHf3jSbPMdPG0qxnOH17_ffHIqZHZEeU6FjgqhWMYWGeJlyMwFLqJ6RLgoPiG2x7px9-Ibj3F2Z89Pap7vg_RSSaSfa2h6SF-xNFI4DEnNEJePyaoT7VKAjyK595hYrD7ihcqPUWRUite925Ta9s1YAkVLIepaTSjgsv7K2pUjyw-zTtbSEP5n8xLxzgrLo",
        description: "A masterful exploration of time and memory, bound in a volume as beautiful as the prose within."
    };

    return (
        <div className="bg-background text-[#1A1A1A] font-body-md antialiased min-h-screen">
            <style>{`
                .carousel-slide {
                    opacity: 0;
                    transition: opacity 1.2s ease-in-out;
                    position: absolute;
                    inset: 0;
                }
                .carousel-slide.active {
                    opacity: 1;
                    z-index: 10;
                }
                .carousel-dot.active {
                    background-color: #8B0000;
                    width: 24px;
                }
                @media (prefers-reduced-motion: reduce) {
                    .carousel-slide {
                        transition: none;
                    }
                }
            `}</style>


            {/* Hero Carousel */}
            <section 
                className="relative w-full overflow-hidden group bg-[#1a1a1a]" 
                id="hero-carousel"
                onMouseEnter={() => setIsHovered(true)}
                onMouseLeave={() => setIsHovered(false)}
            >
                {/* Carousel Slides Container */}
                <div className="relative w-full">
                    {/* Invisible placeholder to force container height to match image aspect ratio */}
                    <img src={slides[0].img} className="w-full h-auto opacity-0 pointer-events-none block" alt="" />
                    
                    {slides.map((slide, i) => (
                        <div key={i} className={`carousel-slide ${i === currentSlide ? 'active' : ''}`}>
                            <img alt={slide.title || `Slide ${i+1}`} className="absolute inset-0 w-full h-full object-contain" src={slide.img} />
                            {/* <div className="absolute inset-0 bg-black/40"></div> */}
                            <div className="relative z-10 h-full flex flex-col items-center justify-center text-center px-margin-mobile md:px-margin-desktop">
                                {slide.subtitle && <span className="font-label-md text-label-md text-[#ffb4a8] uppercase tracking-[0.4em] mb-4">{slide.subtitle}</span>}
                                {slide.title && <h2 className="font-display-lg text-display-lg text-white mb-8">{slide.title}</h2>}
                                {slide.title && (
                                    <button onClick={() => setView('archive')} className="bg-[#8B0000] hover:bg-black text-white px-10 py-4 font-label-md text-label-md uppercase tracking-widest transition-all cursor-pointer border-0">
                                        Explore the Vault
                                    </button>
                                )}
                            </div>
                        </div>
                    ))}
                </div>
                {/* Navigation Arrows */}
                <button onClick={prevSlide} className="absolute left-8 top-1/2 -translate-y-1/2 z-20 text-white/50 hover:text-white transition-colors opacity-0 group-hover:opacity-100 hidden md:block cursor-pointer bg-transparent border-0 outline-none">
                    <span className="material-symbols-outlined text-4xl">chevron_left</span>
                </button>
                <button onClick={nextSlide} className="absolute right-8 top-1/2 -translate-y-1/2 z-20 text-white/50 hover:text-white transition-colors opacity-0 group-hover:opacity-100 hidden md:block cursor-pointer bg-transparent border-0 outline-none">
                    <span className="material-symbols-outlined text-4xl">chevron_right</span>
                </button>
                {/* Pagination Dots */}
                <div className="absolute bottom-8 left-1/2 -translate-x-1/2 z-20 flex gap-3">
                    {slides.map((_, i) => (
                        <button 
                            key={i} 
                            onClick={() => setCurrentSlide(i)}
                            aria-label={`Slide ${i+1}`} 
                            className={`carousel-dot h-2 rounded-full transition-all cursor-pointer border-0 p-0 ${i === currentSlide ? 'active bg-[#8B0000] w-[24px]' : 'bg-white/40 hover:bg-white/60 w-2'}`}
                        ></button>
                    ))}
                </div>
            </section>

            <main className="max-w-container-max mx-auto px-margin-desktop py-12 md:py-24">
                {/* Hero Section / Portal Layout */}
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-gutter items-start">
                    {/* Left: Main Categories */}
                    <div className="lg:col-span-7 flex flex-col gap-12">
                        <header className="mb-4">
                            <span className="font-label-md text-label-md text-[#8B0000] uppercase tracking-[0.2em] mb-4 block">Portal Rasmi</span>
                            <h1 className="font-display-lg text-display-lg text-on-surface leading-tight">Navigating the <br />Dunia Penulisan.</h1>
                            <div className="h-px w-3/4 mt-8" style={{ background: 'linear-gradient(to right, rgba(139, 0, 0, 0.4), transparent)' }}></div>
                        </header>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                            {/* Catalogue */}
                            <button onClick={() => setView('archive')} className="text-left category-card group block p-8 border border-outline-variant/20 hover:border-[#8B0000]/30 transition-all bg-white cursor-pointer outline-none">
                                <div className="flex justify-between items-start mb-12">
                                    <span className="material-symbols-outlined card-icon text-on-surface-variant text-4xl group-hover:text-[#8B0000] transition-colors">menu_book</span>
                                    <span className="material-symbols-outlined arrow-icon text-on-surface-variant group-hover:text-[#8B0000] transition-transform group-hover:translate-x-2">arrow_forward</span>
                                </div>
                                <h3 className="font-headline-sm text-headline-sm mb-3">Katalog</h3>
                                <p className="font-body-md text-body-md text-on-surface-variant leading-relaxed">Daftar lengkap kesusasteraan kontemporari dan klasik di semua genre.</p>
                            </button>
                            {/* Orders */}
                            <button onClick={() => setView('orders')} className="text-left category-card group block p-8 border border-outline-variant/20 hover:border-[#8B0000]/30 transition-all bg-white cursor-pointer outline-none">
                                <div className="flex justify-between items-start mb-12">
                                    <span className="material-symbols-outlined card-icon text-on-surface-variant text-4xl group-hover:text-[#8B0000] transition-colors">auto_stories</span>
                                    <span className="material-symbols-outlined arrow-icon text-on-surface-variant group-hover:text-[#8B0000] transition-transform group-hover:translate-x-2">arrow_forward</span>
                                </div>
                                <h3 className="font-headline-sm text-headline-sm mb-3">Orders</h3>
                                <p className="font-body-md text-body-md text-on-surface-variant leading-relaxed">Kitaran bertema yang disusun oleh editor kami, meneroka persimpangan falsafah dan prosa.</p>
                            </button>
                            {/* Cart */}
                            <button onClick={() => setView('cart')} className="text-left category-card group block p-8 border border-outline-variant/20 hover:border-[#8B0000]/30 transition-all bg-white cursor-pointer outline-none">
                                <div className="flex justify-between items-start mb-12">
                                    <span className="material-symbols-outlined card-icon text-on-surface-variant text-4xl group-hover:text-[#8B0000] transition-colors">inventory_2</span>
                                    <span className="material-symbols-outlined arrow-icon text-on-surface-variant group-hover:text-[#8B0000] transition-transform group-hover:translate-x-2">arrow_forward</span>
                                </div>
                                <h3 className="font-headline-sm text-headline-sm mb-3">Cart</h3>
                                <p className="font-body-md text-body-md text-on-surface-variant leading-relaxed">Ruang sejarah sastera yang dipelihara, dari pencerahan ke avant-garde.</p>
                            </button>
                        </div>

                        {/* Member Circle */}
                        <div className="mt-4">
                            <button onClick={() => setView('login')} className="w-full text-left category-card group block p-8 bg-[#1A1A1A] text-white hover:bg-black transition-all cursor-pointer outline-none border-0">
                                <div className="flex justify-between items-center w-full">
                                    <div className="flex items-center gap-6">
                                        <span className="material-symbols-outlined text-[#ffb4a8] text-4xl">verified_user</span>
                                        <div>
                                            <h3 className="font-headline-sm text-headline-sm mb-1">Kelab Ahli</h3>
                                            <p className="font-body-md text-body-md text-[#b1aeae]">Sertai komuniti peribadi kami untuk pratonton eksklusif dan pandangan editorial.</p>
                                        </div>
                                    </div>
                                    <span className="material-symbols-outlined arrow-icon text-[#ffb4a8] group-hover:translate-x-2 transition-transform">arrow_forward</span>
                                </div>
                            </button>
                        </div>
                    </div>

                    {/* Right: Editor's Choice Section */}
                    <div className="lg:col-span-5 lg:sticky lg:top-32 mt-16 lg:mt-0">
                        <section className="bg-surface-container p-8 md:p-12 border border-outline-variant/10 shadow-sm">
                            <div className="flex items-center gap-4 mb-8">
                                <div className="h-[1px] flex-grow bg-[#8B0000]/20"></div>
                                <span className="font-label-md text-label-md text-[#8B0000] uppercase tracking-widest">Editor's Choice</span>
                                <div className="h-[1px] flex-grow bg-[#8B0000]/20"></div>
                            </div>
                            <div className="flex flex-col items-center">
                                <div className="book-hover-effect hover:-translate-y-2 hover:scale-[1.02] transition-transform duration-500 mb-8 shadow-2xl relative">
                                    {/* High-contrast, moody image */}
                                    <img alt={featuredBook.title} className="w-full max-w-[320px] aspect-[2/3] object-cover border-4 border-white" src={featuredBook.cover} />
                                    <div className="absolute -bottom-4 -right-4 bg-[#8B0000] text-white px-6 py-2 font-label-md text-label-md shadow-lg">
                                        BEST SELLER
                                    </div>
                                </div>
                                <div className="text-center">
                                    <h2 className="font-headline-md text-headline-md mb-2">{featuredBook.title}</h2>
                                    <p className="font-label-md text-label-md text-on-surface-variant mb-6 uppercase tracking-wider">{featuredBook.author} | LITERARY FICTION</p>
                                    <p className="font-body-md text-body-md text-on-surface-variant mb-10 italic max-w-sm mx-auto line-clamp-3">
                                        "{featuredBook.description || 'A masterful exploration of knowledge and wisdom, bound in a volume as beautiful as the prose within.'}"
                                    </p>
                                    <button onClick={() => setView('archive')} className="bg-[#8B0000] text-white px-12 py-4 font-label-md text-label-md uppercase tracking-widest hover:bg-black transition-all flex items-center justify-center gap-2 mx-auto cursor-pointer border-0">
                                        Discover
                                        <span className="material-symbols-outlined text-[18px]">auto_fix_high</span>
                                    </button>
                                </div>
                            </div>
                        </section>
                        {/* Statistics / Social Proof */}
                        <div className="grid grid-cols-3 gap-4 mt-8">
                            <div className="text-center py-4 border-r border-outline-variant/30">
                                <div className="font-headline-sm text-headline-sm text-[#8B0000]">12k+</div>
                                <div className="font-label-sm text-label-sm text-on-surface-variant">NASKHAH</div>
                            </div>
                            <div className="text-center py-4 border-r border-outline-variant/30">
                                <div className="font-headline-sm text-headline-sm text-[#8B0000]">450</div>
                                <div className="font-label-sm text-label-sm text-on-surface-variant">BUKU NADIR</div>
                            </div>
                            <div className="text-center py-4">
                                <div className="font-headline-sm text-headline-sm text-[#8B0000]">82</div>
                                <div className="font-label-sm text-label-sm text-on-surface-variant">AUTHORS</div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Asymmetric Detail Section */}
                <section className="mt-section-gap grid grid-cols-1 md:grid-cols-2 gap-16 items-center">
                    <div className="order-2 md:order-1 relative">
                        <img alt="Close up of manuscript" className="w-full aspect-[4/3] object-cover" src="https://lh3.googleusercontent.com/aida-public/AB6AXuDgxubidEv597UZfwbWELDnJquMboJ3xHId0Uf6fYmHNNk-SNy5hRMqh-A6W48XAcsoo2KYeofoo7qw3OVPoxqMx1bokNIgFvFVHdXKhGzv0RUGyK_ds7fXD1Lr5cT2pCi8f4wDrHMpGvSpIBGvpX6ovI7YNWEs3O6YHb3LfFHTdIfAbnpJnBMeEK4rX9mwUL4lALOj2GzJljnx8Npy3T-37v1A9luDSey4Pn4Dvi38I73U0RKJBS0Me3oAMnhpZ3Zmmwh52P_GsRI" />
                        <div className="absolute -bottom-8 -left-8 bg-white p-8 border border-outline-variant/20 hidden lg:block shadow-sm">
                            <p className="font-headline-sm text-headline-sm text-[#8B0000] max-w-[200px]">The physical form is a sanctuary.</p>
                        </div>
                    </div>
                    <div className="order-1 md:order-2">
                        <span className="font-label-md text-label-md text-[#8B0000] uppercase tracking-[0.2em] mb-6 block">Our Philosophy</span>
                        <h2 className="font-headline-lg text-headline-lg mb-8 leading-tight">The preservation of thought in a digital age.</h2>
                        <p className="font-body-lg text-body-lg text-on-surface-variant leading-relaxed mb-8">
                            In an era of fleeting bytes and temporary pixels, we stand as a bastion for the tangible. Every volume in our collection is curated not just for its content, but for its physical soul—the weight of the paper, the scent of the binding, and the history etched into every margin.
                        </p>
                    </div>
                </section>
            </main>

            {/* Footer */}
            <footer className="w-full mt-section-gap bg-[#1A1A1A] text-white">
                <div className="flex flex-col md:flex-row justify-between items-center py-12 px-margin-desktop max-w-container-max mx-auto">
                    {/* Brand Logo */}
                    <div className="font-headline-sm text-headline-sm mb-8 md:mb-0" style={{ color: '#c5a059' }}>
                        Tarbiah Sentap
                    </div>
                    {/* Links */}
                    <div className="flex flex-wrap justify-center gap-gutter mb-8 md:mb-0">
                        <a className="font-label-sm text-label-sm text-white/70 hover:text-white transition-colors" href="#">Privacy Policy</a>
                        <a className="font-label-sm text-label-sm text-white/70 hover:text-white transition-colors" href="#">Terms of Service</a>
                        <a className="font-label-sm text-label-sm text-white/70 hover:text-white transition-colors" href="#">Penghantaran & Pemulangan</a>
                        <a className="font-label-sm text-label-sm text-white/70 hover:text-white transition-colors" href="#">Contact Us</a>
                    </div>
                    {/* Copyright */}
                    <div className="font-label-sm text-label-sm text-white/50">
                        © 2024 Tarbiah Sentap. All Rights Reserved.
                    </div>
                </div>
            </footer>
        </div>
    );
};

export default PortalView;
