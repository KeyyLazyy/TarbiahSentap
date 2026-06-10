import React, { useEffect } from 'react';

export default function CartDrawer({ isOpen, setIsOpen, cart, removeFromCart, setView }) {
    const handleClose = () => {
        setIsOpen(false);
    };

    // Auto-lock body scroll when open
    useEffect(() => {
        if (isOpen) {
            document.body.style.overflow = 'hidden';
        } else {
            document.body.style.overflow = '';
        }
        return () => {
            document.body.style.overflow = '';
        };
    }, [isOpen]);

    const totalAmount = cart.reduce((sum, item) => sum + (Number(item.book.price) * item.quantity), 0);

    return (
        <>
            {/* Cart Overlay */}
            <div 
                className={`fixed inset-0 bg-on-surface/60 backdrop-blur-sm z-50 transition-opacity duration-500 ${isOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'}`} 
                id="cart-overlay" 
                onClick={handleClose}
            ></div>

            {/* Cart Drawer */}
            <aside 
                className={`fixed top-0 right-0 h-full w-full md:w-[500px] paper-texture z-[60] shadow-2xl transition-transform duration-500 ease-[cubic-bezier(0.33,1,0.68,1)] flex flex-col border-l border-secondary/20 bg-surface ${isOpen ? 'translate-x-0' : 'translate-x-full'}`} 
                id="cart-drawer"
            >
                {/* Cart Header */}
                <div className="px-gutter pt-8 pb-6 flex justify-between items-end border-b border-secondary/10">
                    <div>
                        <h2 className="font-headline-md text-headline-md text-on-surface">Perpustakaan Peribadi Anda</h2>
                        <p className="font-label-sm text-label-sm uppercase tracking-[0.2em] text-secondary mt-1">{cart.length} Rare Selections</p>
                    </div>
                    <button className="p-2 hover:bg-secondary/5 rounded-full transition-colors border-0 bg-transparent cursor-pointer" onClick={handleClose}>
                        <span className="material-symbols-outlined text-on-surface">close</span>
                    </button>
                </div>

                {/* Cart Items (Scrollable) */}
                <div className="flex-grow overflow-y-auto px-gutter py-8 space-y-10 custom-scrollbar">
                    {cart.length === 0 ? (
                        <div className="text-center py-20">
                            <p className="font-body-md text-on-surface-variant italic">Perpustakaan anda kini kosong.</p>
                        </div>
                    ) : (
                        cart.map((item, index) => (
                            <div key={`${item.book.id}-${index}`} className="flex gap-6 group">
                                <div className="w-32 aspect-[2/3] bg-surface-container-low shrink-0 relative border border-secondary/5 group-hover:border-secondary/30 transition-all">
                                    <img className="w-full h-full object-cover" alt={item.book.title} src={item.book.cover || item.book.image} />
                                    <div className="absolute -top-2 -left-2 bg-on-surface text-white text-[10px] px-2 py-1 uppercase tracking-tighter">RARE</div>
                                </div>
                                <div className="flex flex-col justify-between py-1 flex-grow">
                                    <div>
                                        <div className="flex justify-between items-start">
                                            <h3 className="font-headline-sm text-[20px] leading-tight">{item.book.title}</h3>
                                            <p className="font-headline-sm text-[20px] ml-4">RM{(Number(item.book.price) * item.quantity).toFixed(2)}</p>
                                        </div>
                                        <p className="font-body-md text-on-surface-variant italic">{item.book.author}</p>
                                        <div className="mt-3 flex items-center gap-2">
                                            <span className="material-symbols-outlined text-[14px] text-secondary" style={{ fontVariationSettings: "'FILL' 1" }}>verified</span>
                                            <span className="font-label-sm text-[10px] uppercase tracking-widest text-secondary">Keaslian Disahkan</span>
                                        </div>
                                    </div>
                                    <div className="flex justify-between items-center mt-4">
                                        <div className="flex items-center border border-secondary/20 rounded-sm">
                                            <span className="px-3 py-1 font-label-md text-on-surface-variant">Qty: {item.quantity}</span>
                                        </div>
                                        <button 
                                            className="bg-transparent border-0 font-label-sm uppercase tracking-widest text-on-surface-variant hover:text-primary transition-colors border-b border-transparent hover:border-primary cursor-pointer"
                                            onClick={() => removeFromCart(item.book.id)}
                                        >
                                            Remove
                                        </button>
                                    </div>
                                </div>
                            </div>
                        ))
                    )}
                </div>

                {/* Cart Footer */}
                <div className="px-gutter py-8 border-t border-secondary/10 bg-white">
                    <div className="space-y-3 mb-8">
                        <div className="flex justify-between font-body-md text-on-surface-variant">
                            <span>Subjumlah</span>
                            <span>RM{totalAmount.toFixed(2)}</span>
                        </div>
                        <div className="flex justify-between font-body-md text-on-surface-variant">
                            <span>Penghantaran Berinsurans</span>
                            <span className="text-secondary uppercase text-[12px] tracking-widest">Percuma</span>
                        </div>
                        <div className="flex justify-between items-end pt-4">
                            <span className="font-headline-sm">Jumlah Pelaburan</span>
                            <span className="font-headline-md text-primary">RM{totalAmount.toFixed(2)}</span>
                        </div>
                    </div>
                    <div className="flex flex-col gap-3">
                        <button 
                            className="w-full py-4 border-0 bg-primary-container text-white font-label-md uppercase tracking-[0.25em] relative group overflow-hidden transition-all duration-300 cursor-pointer"
                            onClick={() => {
                                handleClose();
                                setView('checkout');
                            }}
                            disabled={cart.length === 0}
                        >
                            <span className="relative z-10">Teruskan ke Pembayaran</span>
                            <div className="absolute inset-0 bg-black/20 translate-y-full group-hover:translate-y-0 transition-transform duration-300"></div>
                        </button>
                        <button 
                            className="bg-surface w-full py-3 text-primary font-label-sm uppercase tracking-widest border border-primary/30 hover:border-primary hover:bg-primary/5 transition-colors cursor-pointer" 
                            onClick={() => {
                                handleClose();
                                setView('detailed-cart');
                            }}
                        >
                            View Cart Details
                        </button>
                        <button 
                            className="bg-transparent w-full py-3 text-on-surface font-label-sm uppercase tracking-widest border border-secondary/20 hover:border-secondary transition-colors cursor-pointer" 
                            onClick={handleClose}
                        >
                            Continue Browsing
                        </button>
                    </div>
                    <p className="text-center mt-6 text-[10px] text-on-surface-variant uppercase tracking-widest opacity-50">Logistik Selamat Terjamin</p>
                </div>
            </aside>
        </>
    );
}
