import React from 'react';

export default function UnifiedHeader({ setView, cartCount, user, handleLogout }) {
    return (
        <nav className="fixed top-0 left-0 right-0 z-50 bg-surface/80 backdrop-blur-md border-b border-outline-variant/30">
            <div className="w-full px-6 h-20 flex items-center justify-between">
                
                {/* Logo Branding */}
                <div className="flex items-center gap-2 cursor-pointer" onClick={() => setView('portal')}>
                    <span className="font-serif text-2xl font-semibold text-primary tracking-tight">Tarbiah Sentap</span>
                </div>

                {/* Navigation Links */}
                <div className="hidden md:flex items-center gap-10 font-sans text-[13px] font-medium uppercase tracking-[0.2em] text-black">
                    <button onClick={() => setView('portal')} className="bg-transparent border-0 hover:text-primary transition-colors duration-300 cursor-pointer p-0 font-sans text-[13px] font-medium uppercase tracking-[0.2em] text-black" style={{ color: '#000000' }}>Menu Utama</button>
                    <button onClick={() => setView('archive')} className="bg-transparent border-0 hover:text-primary transition-colors duration-300 cursor-pointer p-0 font-sans text-[13px] font-medium uppercase tracking-[0.2em] text-black" style={{ color: '#000000' }}>Katalog</button>
                    <button onClick={() => setView('cart')} className="bg-transparent border-0 hover:text-primary transition-colors duration-300 cursor-pointer p-0 font-sans text-[13px] font-medium uppercase tracking-[0.2em] text-black flex items-center gap-2" style={{ color: '#000000' }}>
                        Cart
                        {cartCount > 0 && <span className="bg-primary text-white text-[10px] w-4 h-4 flex items-center justify-center rounded-full leading-none">{cartCount}</span>}
                    </button>
                    <button onClick={() => setView('orders')} className="bg-transparent border-0 hover:text-primary transition-colors duration-300 cursor-pointer p-0 font-sans text-[13px] font-medium uppercase tracking-[0.2em] text-black" style={{ color: '#000000' }}>Pesanan</button>
                    <button onClick={() => setView('profile')} className="bg-transparent border-0 hover:text-primary transition-colors duration-300 cursor-pointer p-0 font-sans text-[13px] font-medium uppercase tracking-[0.2em] text-black" style={{ color: '#000000' }}>Profil</button>
                </div>

                {/* Action Button */}
                <div className="flex items-center">
                    {user ? (
                        <div className="flex items-center gap-2">
                            <div 
                                className="flex items-center gap-3 cursor-pointer hover:bg-black/5 p-1.5 pr-4 rounded-full transition-colors duration-300 border border-outline-variant/30"
                                onClick={() => setView('profile')}
                                title="View Profile"
                            >
                                <div className="w-8 h-8 rounded-full bg-[#8B0000] flex items-center justify-center text-white font-bold text-sm overflow-hidden">
                                    {user.avatar ? (
                                        <img src={user.avatar} alt="Avatar" className="w-full h-full object-cover" />
                                    ) : (
                                        user.name ? user.name.charAt(0).toUpperCase() : <span className="material-symbols-outlined text-sm">person</span>
                                    )}
                                </div>
                                <span className="hidden md:inline font-sans text-xs font-semibold uppercase tracking-[0.1em] text-[#1A1A1A]">
                                    {user.name || 'Profile'}
                                </span>
                            </div>
                            <button 
                                onClick={handleLogout}
                                className="bg-[#1A1A1A] text-white hover:bg-black w-10 h-10 rounded-full flex items-center justify-center transition-all duration-300 cursor-pointer border-0 shadow-sm"
                                title="Log Out"
                            >
                                <span className="material-symbols-outlined text-sm">logout</span>
                            </button>
                        </div>
                    ) : (
                        <button 
                            onClick={() => setView('login')}
                            className="bg-[#8B0000] border-0 text-white px-7 py-2.5 font-sans text-xs font-semibold uppercase tracking-[0.15em] hover:bg-black transition-all duration-300 shadow-lg shadow-black/10 cursor-pointer"
                        >
                            Sign In
                        </button>
                    )}
                </div>

            </div>
        </nav>
    );
}
