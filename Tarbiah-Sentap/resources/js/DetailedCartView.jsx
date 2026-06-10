import React, { useEffect, useState } from 'react';

export default function DetailedCartView({ cart, removeFromCart, setView }) {
    const totalAmount = cart.reduce((sum, item) => sum + (Number(item.book.price) * item.quantity), 0);
    const [isVisible, setIsVisible] = useState(false);

    useEffect(() => {
        window.scrollTo(0, 0);
        setTimeout(() => setIsVisible(true), 100);
    }, []);

    return (
        <main 
            className={`max-w-container-max mx-auto px-margin-desktop py-section-gap transition-all duration-1000 ease-out ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-5'}`}
        >
            <header className="mb-12">
                <h1 className="font-display-lg text-display-lg text-primary mb-4">Perpustakaan Peribadi Anda</h1>
                <p className="font-body-lg text-body-lg text-on-surface-variant max-w-2xl italic">
                    An exquisite collection curated for the discerning bibliophile. Review your acquisitions before they are secured for transit.
                </p>
            </header>
            
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-gutter items-start">
                {/* Cart Items List */}
                <div className="lg:col-span-8 space-y-12">
                    {cart.length === 0 ? (
                        <div className="text-center py-20 bg-surface-container-low border border-outline-variant/30">
                            <p className="font-body-lg text-on-surface-variant italic mb-6">Perpustakaan anda kini kosong.</p>
                            <button 
                                onClick={() => setView('catalog')}
                                className="bg-transparent border border-secondary px-8 py-3 font-label-md uppercase tracking-widest hover:bg-secondary/5 transition-all"
                            >
                                Return to Catalogue
                            </button>
                        </div>
                    ) : (
                        cart.map((item, index) => (
                            <div key={`${item.book.id}-${index}`} className="flex flex-col md:flex-row gap-8 pb-12 border-b border-outline-variant/30">
                                <div className="w-full md:w-64 aspect-[2/3] overflow-hidden bg-surface-container shadow-sm border border-secondary/10 group">
                                    <img 
                                        alt={item.book.title} 
                                        className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105" 
                                        src={item.book.cover || item.book.image} 
                                    />
                                </div>
                                <div className="flex-1 flex flex-col">
                                    <div className="flex justify-between items-start mb-4">
                                        <div>
                                            <h2 className="font-headline-md text-headline-md text-on-surface">{item.book.title}</h2>
                                            <p className="font-label-md text-label-md text-primary tracking-widest uppercase mt-1">{item.book.author}</p>
                                        </div>
                                        <p className="font-headline-sm text-headline-sm text-on-surface">RM{(Number(item.book.price) * item.quantity).toFixed(2)}</p>
                                    </div>
                                    <div className="bg-surface-container-low p-6 border-l-2 border-secondary/40 my-6">
                                        <h3 className="font-label-md text-label-md font-bold mb-2 flex items-center gap-2">
                                            <span className="material-symbols-outlined text-[18px]" style={{ fontVariationSettings: "'FILL' 1" }}>verified</span>
                                            Provenance & Authentication
                                        </h3>
                                        <p className="font-body-md text-body-md text-on-surface-variant leading-relaxed line-clamp-2">
                                            {item.book.description || "First edition, authentic print. Exceptional condition. Inspected and verified by our board of curators."}
                                        </p>
                                    </div>
                                    <div className="mt-auto flex justify-between items-center">
                                        <div className="flex items-center border border-outline/20">
                                            <button className="p-2 hover:bg-surface-container-high transition-colors"><span className="material-symbols-outlined">remove</span></button>
                                            <span className="px-6 font-label-md text-label-md border-x border-outline/20">
                                                {item.quantity < 10 ? `0${item.quantity}` : item.quantity}
                                            </span>
                                            <button className="p-2 hover:bg-surface-container-high transition-colors"><span className="material-symbols-outlined">add</span></button>
                                        </div>
                                        <button 
                                            onClick={() => removeFromCart(item.book.id)}
                                            className="flex bg-transparent border-0 items-center gap-2 font-label-sm text-label-sm text-on-surface-variant hover:text-error transition-colors uppercase tracking-widest cursor-pointer"
                                        >
                                            <span className="material-symbols-outlined text-[18px]">delete</span>
                                            Remove Item
                                        </button>
                                    </div>
                                </div>
                            </div>
                        ))
                    )}
                </div>

                {/* Summary Sidebar */}
                <aside className="lg:col-span-4 sticky top-32">
                    <div className="bg-white border border-outline-variant/30 p-8">
                        <h2 className="font-headline-sm text-headline-sm text-on-surface mb-8 border-b border-outline-variant/20 pb-4">Ringkasan Pembelian</h2>
                        <div className="space-y-4 mb-8">
                            <div className="flex justify-between font-body-md text-body-md">
                                <span className="text-on-surface-variant">Subjumlah</span>
                                <span className="text-on-surface">RM{totalAmount.toFixed(2)}</span>
                            </div>
                            <div className="flex justify-between font-body-md text-body-md">
                                <span className="text-on-surface-variant">Penghantaran Antarabangsa Berinsurans</span>
                                <span className="text-secondary font-medium uppercase tracking-tighter">Percuma</span>
                            </div>
                            <div className="flex justify-between font-body-md text-body-md pt-4 border-t border-outline-variant/10">
                                <span className="text-on-surface-variant">Cukai / Duti</span>
                                <span className="text-on-surface">Dikira Semasa Pembayaran</span>
                            </div>
                        </div>
                        <div className="flex justify-between items-end mb-10">
                            <span className="font-label-md text-label-md uppercase tracking-widest text-on-surface-variant">Jumlah Pelaburan</span>
                            <span className="font-headline-md text-headline-md text-primary">RM{totalAmount.toFixed(2)}</span>
                        </div>
                        <div className="space-y-4">
                            <button 
                                onClick={() => setView('checkout')}
                                disabled={cart.length === 0}
                                className={`w-full py-4 font-label-md text-label-md uppercase tracking-[0.2em] transition-all border-0 ${cart.length === 0 ? 'bg-gray-400 text-gray-200 cursor-not-allowed' : 'bg-primary-container text-white hover:bg-primary active:scale-[0.98] cursor-pointer'}`}
                            >
                                Proceed to Checkout
                            </button>
                            <button 
                                onClick={() => setView('catalog')}
                                className="w-full bg-transparent border border-secondary py-4 font-label-md text-label-md uppercase tracking-[0.2em] text-on-surface hover:bg-secondary/5 transition-all cursor-pointer"
                            >
                                Continue Browsing
                            </button>
                        </div>
                        <div className="mt-12 space-y-4">
                            <div className="flex gap-4">
                                <span className="material-symbols-outlined text-secondary" style={{ fontVariationSettings: "'FILL' 1" }}>security</span>
                                <div>
                                    <p className="font-label-md text-label-md font-bold m-0">Perlindungan Pembayaran Selamat</p>
                                    <p className="font-body-md text-body-md text-on-surface-variant text-sm m-0">Pembayaran anda disimpan dengan selamat sehingga penghantaran disahkan.</p>
                                </div>
                            </div>
                        </div>
                    </div>
                    
                    <div className="mt-8 p-6 bg-tertiary-container/5 border-dashed border border-outline/30 flex items-center justify-center gap-3">
                        <span className="material-symbols-outlined text-primary">auto_awesome</span>
                        <p className="font-label-sm text-label-sm uppercase tracking-widest text-primary m-0">Perkhidmatan Konsierj Peribadi Tersedia</p>
                    </div>
                </aside>
            </div>

            {/* Trust Section */}
            <section className="mt-section-gap border-t border-outline-variant/30 pt-16 flex flex-col items-center text-center">
                <div className="flex items-center gap-8 mb-8 opacity-60">
                    <span className="font-headline-sm text-headline-sm italic hidden md:block">Rakan Kongsi Sah Sotheby's</span>
                    <span className="h-8 w-px bg-outline-variant hidden md:block"></span>
                    <span className="font-headline-sm text-headline-sm italic">Disahkan RBDA</span>
                    <span className="h-8 w-px bg-outline-variant"></span>
                    <span className="font-headline-sm text-headline-sm italic hidden md:block">Amanah Warisan Global</span>
                </div>
                <div className="max-w-xl">
                    <span className="material-symbols-outlined text-primary text-4xl mb-4">diamond</span>
                    <h3 className="font-headline-md text-headline-md text-on-surface mb-2">Logistik Selamat Terjamin</h3>
                    <p className="font-body-md text-body-md text-on-surface-variant">
                        Every manuscript is transported in temperature-controlled, shock-absorbent vaults via private courier. Fully insured from our vault to your library.
                    </p>
                </div>
            </section>
        </main>
    );
}
