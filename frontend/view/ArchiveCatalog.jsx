import React, { useEffect } from 'react';

export default function ArchiveCatalog({ setView }) {
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

    return (
        <div className="font-body-md text-body-md overflow-x-hidden bg-[#f9f9f9] text-[#1a1c1c] antialiased">
            {/* TopNavBar Removed to avoid duplication with global Header */}
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
                            <select className="w-full bg-transparent border-b border-on-surface/20 border-t-0 border-l-0 border-r-0 rounded-none py-2 px-0 focus:ring-0 focus:border-primary font-body-md text-on-surface-variant outline-none">
                                <option>Newest Arrivals</option>
                                <option>Price: High to Low</option>
                                <option>Price: Low to High</option>
                                <option>Alphabetical</option>
                            </select>
                        </div>
                    </aside>
                    {/* Product Grid */}
                    <section className="flex-grow">
                        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-x-gutter gap-y-16">
                            {/* Book Card 1 */}
                            <div className="book-container group relative">
                                <div className="aspect-[2/3] overflow-hidden bg-surface-container-high transition-all duration-500 border border-transparent group-hover:shadow-2xl">
                                    <img alt="The Divine Comedy" className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105" src="https://lh3.googleusercontent.com/aida-public/AB6AXuBgIJnqVy6Gx9HAxy4WhRT6iNdwa0wwYs1R5ZvrrMjBZPKlrDXvv3d0Q9PhmrZIKILYFSZOFumlt2_VPTyUOabeg2JBrclyTQ5IE8p0uRXdrw0nMi7n40ri0gN22IT1jO32T6AHQgfrPPPAv_nVfc9MdhRkYBz6qXMnW5hM-yi2l_7ryF9HZZDdDx0KFB8-ZakvnGMzMYjLg-xj5g_OoU6QEvvk8jt6ngZADIoLGXhtE_QMqr7jAT05HD05K9IB2gFtLTRA1qW0Vts"/>
                                </div>
                                <div className="mt-6">
                                    <h2 className="font-headline-sm text-headline-sm text-on-surface">The Divine Comedy</h2>
                                    <p className="font-label-sm text-label-sm uppercase tracking-widest text-on-surface-variant mt-1">Dante Alighieri • $240</p>
                                </div>
                                {/* Interaction Detail Panel */}
                                <div className="book-details absolute top-0 left-[105%] w-[320px] bg-white shadow-2xl p-8 border border-outline-variant/10 hidden xl:block">
                                    <div className="flex justify-between items-start mb-6">
                                        <span className="font-label-sm text-label-sm uppercase tracking-widest text-secondary">Philosophy</span>
                                        <span className="font-label-md text-label-md text-primary">$240</span>
                                    </div>
                                    <h3 className="font-headline-md text-headline-md text-primary mb-2">The Divine Comedy</h3>
                                    <p className="font-label-md text-label-md text-on-surface-variant mb-6 italic">Dante Alighieri</p>
                                    <p className="font-body-md text-on-surface-variant leading-relaxed mb-8">
                                        A cornerstone of Italian literature, this edition features handcrafted leather binding, gilded edges, and archival parchment.
                                    </p>
                                    <div className="space-y-3">
                                        <button className="w-full bg-primary text-white py-3 font-label-md text-label-md uppercase tracking-widest hover:bg-black transition-colors" onClick={() => setView('cart')}>Add to Cart</button>
                                        <button className="w-full border border-primary text-primary py-3 font-label-md text-label-md uppercase tracking-widest hover:bg-primary-fixed transition-colors">Provenance</button>
                                    </div>
                                </div>
                            </div>
                            {/* Book Card 2 */}
                            <div className="book-container group relative">
                                <div className="aspect-[2/3] overflow-hidden bg-surface-container-high transition-all duration-500 border border-transparent group-hover:shadow-2xl">
                                    <img alt="Meditations" className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105" src="https://lh3.googleusercontent.com/aida-public/AB6AXuDMsaEUzqtFngqSaYchR4vmTub1kM4KvNNhN02ZRuXicRFISnR_NdbQYMIFxe60bY08uhgewIKen9OgNV4_X1MUjeyTRx6D2gzhGpS-KabxkbBhHbQozjgXfd1PBQr2VpwfHz-XKYROruQJQp8vqwMm0urpDrQVHacG5j66HMzKa8h4PR65RrQ1AOxCQ4k-0IQ0wWc62RnfjLE29LgXCqiWtXWkh93UNFsFJ3i4XiiV2xq9RkmQOl0E6kyxnP2AJv6yTc4W__K1wg0"/>
                                </div>
                                <div className="mt-6">
                                    <h2 className="font-headline-sm text-headline-sm text-on-surface">Meditations</h2>
                                    <p className="font-label-sm text-label-sm uppercase tracking-widest text-on-surface-variant mt-1">Marcus Aurelius • $185</p>
                                </div>
                                <div className="book-details absolute top-0 left-[105%] w-[320px] bg-white shadow-2xl p-8 border border-outline-variant/10 hidden xl:block">
                                    <div className="flex justify-between items-start mb-6">
                                        <span className="font-label-sm text-label-sm uppercase tracking-widest text-secondary">Philosophy</span>
                                        <span className="font-label-md text-label-md text-primary">$185</span>
                                    </div>
                                    <h3 className="font-headline-md text-headline-md text-primary mb-2">Meditations</h3>
                                    <p className="font-label-md text-label-md text-on-surface-variant mb-6 italic">Marcus Aurelius</p>
                                    <p className="font-body-md text-on-surface-variant leading-relaxed mb-8">
                                        The personal journals of Rome’s last Great Emperor, presented in a minimalist premium cloth edition with hand-pressed gold leaf details.
                                    </p>
                                    <div className="space-y-3">
                                        <button className="w-full bg-primary text-white py-3 font-label-md text-label-md uppercase tracking-widest hover:bg-black transition-colors" onClick={() => setView('cart')}>Add to Cart</button>
                                        <button className="w-full border border-primary text-primary py-3 font-label-md text-label-md uppercase tracking-widest hover:bg-primary-fixed transition-colors">Provenance</button>
                                    </div>
                                </div>
                            </div>
                            {/* Book Card 3 */}
                            <div className="book-container group relative">
                                <div className="aspect-[2/3] overflow-hidden bg-surface-container-high transition-all duration-500 border border-transparent group-hover:shadow-2xl">
                                    <img alt="The Odyssey" className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105" src="https://lh3.googleusercontent.com/aida-public/AB6AXuA7oHIC4aCmpCTamtg6PjZ756xJvx3oSWsDF-ct9ND3ZZtLtxM6Up6171lvGt_ZzXO3CVJ1eM1sl2vT30o_zjMPTKArLfBu_KJDJM5DzRzznu7TsRkpTZgt3jP7hAlu-Tev4GvxBfURHmOel2kgUSbEv_Ffp-tFaABwIzHb5mQ9oX1QWbSBS7r5GVS3AkzotEuWL-AjGrBHDSIcVuIbJuTN88gz5in97tk57CjRZiE7NwRAo8Ip_BWtmvxDD8VwXzACaboQdrxVhQc"/>
                                </div>
                                <div className="mt-6">
                                    <h2 className="font-headline-sm text-headline-sm text-on-surface">The Odyssey</h2>
                                    <p className="font-label-sm text-label-sm uppercase tracking-widest text-on-surface-variant mt-1">Homer • $310</p>
                                </div>
                                <div className="book-details absolute top-0 w-[320px] bg-white shadow-2xl p-8 border border-outline-variant/10 hidden xl:block">
                                    <div className="flex justify-between items-start mb-6">
                                        <span className="font-label-sm text-label-sm uppercase tracking-widest text-secondary">Rare Classics</span>
                                        <span className="font-label-md text-label-md text-primary">$310</span>
                                    </div>
                                    <h3 className="font-headline-md text-headline-md text-primary mb-2">The Odyssey</h3>
                                    <p className="font-label-md text-label-md text-on-surface-variant mb-6 italic">Homer</p>
                                    <p className="font-body-md text-on-surface-variant leading-relaxed mb-8">
                                        An heirloom-quality vellum edition of the epic quest, featuring hand-pressed typography on archival paper and a custom presentation case.
                                    </p>
                                    <div className="space-y-3">
                                        <button className="w-full bg-primary text-white py-3 font-label-md text-label-md uppercase tracking-widest hover:bg-black transition-colors" onClick={() => setView('cart')}>Add to Cart</button>
                                        <button className="w-full border border-primary text-primary py-3 font-label-md text-label-md uppercase tracking-widest hover:bg-primary-fixed transition-colors">Provenance</button>
                                    </div>
                                </div>
                            </div>
                            {/* Book Card 4 */}
                            <div className="book-container group relative">
                                <div className="aspect-[2/3] overflow-hidden bg-surface-container-high transition-all duration-500 border border-transparent group-hover:shadow-2xl">
                                    <img alt="Beyond Good and Evil" className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105" src="https://lh3.googleusercontent.com/aida-public/AB6AXuDcFm3-xfSOhm7fBdm9zV-04Aksh1CE06MQy3KFVNIqmnO4kgmUyG2cpO1qU6iO9ErnVXIQMuzIGeJQiqh3-H2pC4-67MmyKk-IvbLUuVtzQ9O1T7uAb4BUGNZIUNxN5iA0H_qvyq1VRfCUuV9m_Er9e5qpBbMnK7C41tEdbKrg3LbvZvtRo-O3b51HJ7dpE7k6BGgekxfEgmn87qe8-jXUWCWOx5pMCVGGKJccs6-kGXKbPjl4bUpfYyAwm_c963nCSUA0NsQifc0"/>
                                </div>
                                <div className="mt-6">
                                    <h2 className="font-headline-sm text-headline-sm text-on-surface">Beyond Good and Evil</h2>
                                    <p className="font-label-sm text-label-sm uppercase tracking-widest text-on-surface-variant mt-1">Friedrich Nietzsche • $215</p>
                                </div>
                                <div className="book-details absolute top-0 left-[105%] w-[320px] bg-white shadow-2xl p-8 border border-outline-variant/10 hidden xl:block">
                                    <div className="flex justify-between items-start mb-6">
                                        <span className="font-label-sm text-label-sm uppercase tracking-widest text-secondary">Philosophy</span>
                                        <span className="font-label-md text-label-md text-primary">$215</span>
                                    </div>
                                    <h3 className="font-headline-md text-headline-md text-primary mb-2">Beyond Good &amp; Evil</h3>
                                    <p className="font-label-md text-label-md text-on-surface-variant mb-6 italic">Friedrich Nietzsche</p>
                                    <p className="font-body-md text-on-surface-variant leading-relaxed mb-8">
                                        A striking black leather edition of Nietzsche’s radical critique, featuring a minimalist gold monogram and handcrafted binding.
                                    </p>
                                    <div className="space-y-3">
                                        <button className="w-full bg-primary text-white py-3 font-label-md text-label-md uppercase tracking-widest hover:bg-black transition-colors" onClick={() => setView('cart')}>Add to Cart</button>
                                        <button className="w-full border border-primary text-primary py-3 font-label-md text-label-md uppercase tracking-widest hover:bg-primary-fixed transition-colors">Provenance</button>
                                    </div>
                                </div>
                            </div>
                            {/* Book Card 5 */}
                            <div className="book-container group relative">
                                <div className="aspect-[2/3] overflow-hidden bg-surface-container-high transition-all duration-500 border border-transparent group-hover:shadow-2xl">
                                    <img alt="The Republic" className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105" src="https://lh3.googleusercontent.com/aida-public/AB6AXuAStC3sd0qoCvffxlsx_fjBevhLpLGSHsVvIg6dspjV5yE264A5XihgsJDmTxeEE9P_K6dkfZzFIblQcp8sk2aFHCXOaSLzIiibQZSykleAAtc5B78BQmRwoRXigqQbn4zh4qrBQYri2iTD0Cs0ibR__GrAVz6iUuvuP8JkGLj5F9H0qhMFxF-LLuTgS8rjUoRRQ8u9EYXcR4oWm59p50X1irOmTzjZc1rXzNdct-quYi_O05gEMC-kZGo6v5ORHDghTdaPADfSBKg"/>
                                </div>
                                <div className="mt-6">
                                    <h2 className="font-headline-sm text-headline-sm text-on-surface">The Republic</h2>
                                    <p className="font-label-sm text-label-sm uppercase tracking-widest text-on-surface-variant mt-1">Plato • $195</p>
                                </div>
                                <div className="book-details absolute top-0 left-[105%] w-[320px] bg-white shadow-2xl p-8 border border-outline-variant/10 hidden xl:block">
                                    <div className="flex justify-between items-start mb-6">
                                        <span className="font-label-sm text-label-sm uppercase tracking-widest text-secondary">Philosophy</span>
                                        <span className="font-label-md text-label-md text-primary">$195</span>
                                    </div>
                                    <h3 className="font-headline-md text-headline-md text-primary mb-2">The Republic</h3>
                                    <p className="font-label-md text-label-md text-on-surface-variant mb-6 italic">Plato</p>
                                    <p className="font-body-md text-on-surface-variant leading-relaxed mb-8">
                                        Plato’s seminal work on justice and the soul, bound in forest green calfskin with silk marker ribbons and hand-gilded edges.
                                    </p>
                                    <div className="space-y-3">
                                        <button className="w-full bg-primary text-white py-3 font-label-md text-label-md uppercase tracking-widest hover:bg-black transition-colors" onClick={() => setView('cart')}>Add to Cart</button>
                                        <button className="w-full border border-primary text-primary py-3 font-label-md text-label-md uppercase tracking-widest hover:bg-primary-fixed transition-colors">Provenance</button>
                                    </div>
                                </div>
                            </div>
                            {/* Book Card 6 */}
                            <div className="book-container group relative">
                                <div className="aspect-[2/3] overflow-hidden bg-surface-container-high transition-all duration-500 border border-transparent group-hover:shadow-2xl">
                                    <img alt="The Iliad" className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105" src="https://lh3.googleusercontent.com/aida-public/AB6AXuDHATiSacU91-BWV1BsI2trUywBwOuouK3IkES2EJbLG8ZkUga3MjdgYU0WLzetYfE_eY_M3M92xUoHWlppeVjLmsJ3otBrdSkeCc9PGzqfUhExN90ZagJVv54SYdE_-pFHeQAJ8gfEgd4ObtMWmumo7OEUdszz_e7Uh_mKy2meVMzF1h6tKGyQaY7jNSwqKTieHqgt9WVIZdvCNWZL8O22CidV9bkd2Ihjiv1XDeDlZLkdgC92zc3twbOguO1Z4c--HAPyIutzY5k"/>
                                </div>
                                <div className="mt-6">
                                    <h2 className="font-headline-sm text-headline-sm text-on-surface">The Iliad</h2>
                                    <p className="font-label-sm text-label-sm uppercase tracking-widest text-on-surface-variant mt-1">Homer • $290</p>
                                </div>
                                <div className="book-details absolute top-0 w-[320px] bg-white shadow-2xl p-8 border border-outline-variant/10 hidden xl:block">
                                    <div className="flex justify-between items-start mb-6">
                                        <span className="font-label-sm text-label-sm uppercase tracking-widest text-secondary">Rare Classics</span>
                                        <span className="font-label-md text-label-md text-primary">$290</span>
                                    </div>
                                    <h3 className="font-headline-md text-headline-md text-primary mb-2">The Iliad</h3>
                                    <p className="font-label-md text-label-md text-on-surface-variant mb-6 italic">Homer</p>
                                    <p className="font-body-md text-on-surface-variant leading-relaxed mb-8">
                                        A companion to our Odyssey edition, this Iliad features matching vellum and intricate Greek pattern borders inspired by antiquity.
                                    </p>
                                    <div className="space-y-3">
                                        <button className="w-full bg-primary text-white py-3 font-label-md text-label-md uppercase tracking-widest hover:bg-black transition-colors" onClick={() => setView('cart')}>Add to Cart</button>
                                        <button className="w-full border border-primary text-primary py-3 font-label-md text-label-md uppercase tracking-widest hover:bg-primary-fixed transition-colors">Provenance</button>
                                    </div>
                                </div>
                            </div>
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
                        <span className="font-display-lg text-headline-sm text-primary italic mb-6 block">The Manuscript</span>
                        <p className="font-body-md text-on-surface-variant leading-relaxed">Ensuring the legacy of the written word through unparalleled craftsmanship and curation.</p>
                    </div>
                    <div>
                        <h4 className="font-label-md text-label-md uppercase tracking-widest text-primary mb-6">Collections</h4>
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
                    <span className="font-body-md text-on-surface-variant opacity-60">© 2024 The Manuscript. All rights reserved.</span>
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
