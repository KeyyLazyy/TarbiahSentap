import React, { useState, useMemo, useEffect } from 'react';
import {
    ShoppingCart, BookOpen, User, Star, Trash2, Plus,
    Search, LogOut, Package, ChevronRight, X, Check,
    CreditCard, ShieldCheck, LayoutDashboard, Edit,
    Sparkles, MessageSquare, Bot, Send, Loader2
} from 'lucide-react';
import { authApi, bookApi, orderApi, adminApi } from './services/api';

export default function App() {
    const [view, setView] = useState('catalog'); // 'catalog', 'cart', 'checkout', 'login', 'admin', 'orders', '2fa'
    const [user, setUser] = useState(null);
    const [books, setBooks] = useState([]);
    const [loading, setLoading] = useState(true);
    const [cart, setCart] = useState([]);
    const [orders, setOrders] = useState([]);
    const [toasts, setToasts] = useState([]);
    const [tempToken, setTempToken] = useState(null); // For 2FA

    const [aiChatOpen, setAiChatOpen] = useState(false);
    const [aiMessages, setAiMessages] = useState([
        { role: 'model', text: 'Hello! I am the Tarbiah Sentap AI Assistant. How can I help you today?' }
    ]);
    const [aiChatInput, setAiChatInput] = useState('');
    const [aiChatLoading, setAiChatLoading] = useState(false);

    const [summaryModal, setSummaryModal] = useState({ isOpen: false, book: null, summary: '', loading: false });

    // Toast Notification System
    const addToast = (message, type = 'success') => {
        const id = Date.now();
        setToasts(prev => [...prev, { id, message, type }]);
        setTimeout(() => {
            setToasts(prev => prev.filter(t => t.id !== id));
        }, 3000);
    };

    // Load initial data
    useEffect(() => {
        fetchBooks();
        const savedUser = localStorage.getItem('user');
        if (savedUser) setUser(JSON.parse(savedUser));
    }, []);

    const fetchBooks = async () => {
        try {
            setLoading(true);
            const res = await bookApi.getAll();
            if (res.data.success) {
                setBooks(res.data.data);
            }
        } catch (err) {
            addToast('Failed to load books', 'error');
        } finally {
            setLoading(false);
        }
    };

    const fetchMyOrders = async () => {
        try {
            const res = await orderApi.getMyOrders();
            if (res.data.success) {
                setOrders(res.data.data);
            }
        } catch (err) {
            addToast('Failed to load orders', 'error');
        }
    };

    useEffect(() => {
        if (view === 'orders' && user) {
            fetchMyOrders();
        }
    }, [view, user]);

    const addToCart = (book) => {
        setCart(prev => {
            const existing = prev.find(item => item.book.id === book.id);
            if (existing) {
                return prev.map(item => item.book.id === book.id ? { ...item, quantity: item.quantity + 1 } : item);
            }
            return [...prev, { book, quantity: 1 }];
        });
        addToast(`Added ${book.title} to cart`);
    };

    const removeFromCart = (bookId) => {
        setCart(prev => prev.filter(item => item.book.id !== bookId));
    };

    const updateQuantity = (bookId, delta) => {
        setCart(prev => prev.map(item => {
            if (item.book.id === bookId) {
                const newQ = Math.max(1, item.quantity + delta);
                return { ...item, quantity: newQ };
            }
            return item;
        }));
    };

    const handleCheckout = () => {
        if (!user) {
            addToast('Please login to checkout', 'error');
            setView('login');
            return;
        }
        setView('checkout');
    };

    const processPayment = async () => {
        try {
            const total = cart.reduce((sum, item) => sum + (item.book.price * item.quantity), 0);
            const res = await orderApi.create({
                items: cart.map(item => ({ book_id: item.book.id, quantity: item.quantity, price: item.book.price })),
                total_amount: total * 1.08 // including tax
            });
            
            if (res.data.success) {
                setCart([]);
                setView('orders');
                addToast('Order placed successfully!');
            }
        } catch (err) {
            addToast('Payment failed', 'error');
        }
    };

    const handleLogin = async (email, password) => {
        try {
            const res = await authApi.login(email, password);
            if (res.data.pending2FA) {
                setTempToken(res.data.tempToken);
                setView('2fa');
                addToast('2FA required', 'info');
            } else if (res.data.success) {
                const userData = res.data.user;
                localStorage.setItem('token', res.data.token);
                localStorage.setItem('user', JSON.stringify(userData));
                setUser(userData);
                setView('catalog');
                addToast('Logged in successfully');
            }
        } catch (err) {
            addToast('Invalid credentials', 'error');
        }
    };

    const handleVerify2FA = async (otp) => {
        try {
            const res = await authApi.verify2FA(otp, tempToken);
            if (res.data.success) {
                const userData = res.data.user;
                localStorage.setItem('token', res.data.token);
                localStorage.setItem('user', JSON.stringify(userData));
                setUser(userData);
                setTempToken(null);
                setView('catalog');
                addToast('2FA Verified');
            }
        } catch (err) {
            addToast('Invalid OTP', 'error');
        }
    };

    const handleLogout = () => {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        setUser(null);
        setView('catalog');
        addToast('Logged out');
    };

    // UI Components (Refined)
    const Header = () => {
        const cartCount = cart.reduce((sum, item) => sum + item.quantity, 0);

        return (
            <header className="sticky top-0 z-50 glass-dark shadow-xl border-b border-white/5">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between">
                    <div className="flex items-center gap-3 cursor-pointer group" onClick={() => setView('catalog')}>
                        <div className="bg-gold-600 p-2.5 rounded-xl group-hover:bg-gold-500 transition-all shadow-lg shadow-gold-600/20">
                            <BookOpen className="w-6 h-6 text-white" />
                        </div>
                        <span className="font-black text-xl sm:text-2xl tracking-tighter text-white">
                            Tarbiah<span className="gold-text-gradient hidden xs:inline">Sentap</span>
                        </span>
                    </div>

                    <div className="flex items-center gap-3 sm:gap-6">
                        <button onClick={() => setView('cart')} className="relative p-2 text-gray-400 hover:text-gold-400 transition-all hover:scale-110">
                            <ShoppingCart className="w-6 h-6" />
                            {cartCount > 0 && (
                                <span className="absolute top-0 right-0 bg-gold-500 text-charcoal-950 text-[10px] font-black w-5 h-5 rounded-full flex items-center justify-center translate-x-1 -translate-y-1 shadow-lg ring-2 ring-charcoal-900">
                                    {cartCount}
                                </span>
                            )}
                        </button>

                        {user ? (
                            <div className="flex items-center gap-2 sm:gap-4">
                                {user.role === 'admin' && (
                                    <button onClick={() => setView('admin')} className={`text-sm font-bold flex items-center gap-1.5 transition-colors px-4 py-2 rounded-xl ${view === 'admin' ? 'bg-gold-600 text-white' : 'text-gray-400 hover:text-gold-400'}`}>
                                        <LayoutDashboard className="w-4 h-4" /> <span className="hidden md:inline">Admin</span>
                                    </button>
                                )}
                                <button onClick={() => setView('orders')} className={`text-sm font-bold flex items-center gap-1.5 transition-colors px-4 py-2 rounded-xl ${view === 'orders' ? 'bg-gold-600 text-white' : 'text-gray-400 hover:text-gold-400'}`}>
                                    <Package className="w-4 h-4" /> <span className="hidden md:inline">Orders</span>
                                </button>
                                <div className="h-10 w-10 rounded-xl gold-gradient flex items-center justify-center text-charcoal-950 font-black shadow-lg">
                                    {user.email[0].toUpperCase()}
                                </div>
                                <button onClick={handleLogout} className="text-gray-500 hover:text-red-500 transition-all p-2">
                                    <LogOut className="w-5 h-5" />
                                </button>
                            </div>
                        ) : (
                            <button onClick={() => setView('login')} className="flex items-center gap-2 gold-gradient text-charcoal-950 px-6 py-2.5 rounded-xl text-xs sm:text-sm font-black hover:scale-105 transition-all shadow-xl shadow-gold-600/20 active:scale-95">
                                <User className="w-4 h-4" /> <span className="hidden xs:inline">Sign In</span>
                            </button>
                        )}
                    </div>
                </div>
            </header>
        );
    };

    const CatalogView = () => {
        const [search, setSearch] = useState('');
        const [genre, setGenre] = useState('All');
        const [sortBy, setSortBy] = useState('featured');

        const genres = ['All', ...new Set(books.map(b => b.genre))];

        const filteredBooks = useMemo(() => {
            let result = books.filter(b =>
                (genre === 'All' || b.genre === genre) &&
                (b.title.toLowerCase().includes(search.toLowerCase()) || b.author.toLowerCase().includes(search.toLowerCase()))
            );

            if (sortBy === 'price-asc') result.sort((a, b) => a.price - b.price);
            if (sortBy === 'price-desc') result.sort((a, b) => b.price - a.price);
            if (sortBy === 'rating') result.sort((a, b) => b.rating - a.rating);

            return result;
        }, [books, search, genre, sortBy]);

        if (loading) return (
            <div className="flex flex-col items-center justify-center h-[60vh] gap-4">
                <Loader2 className="w-12 h-12 text-primary-600 animate-spin" />
                <p className="text-gray-500 font-medium">Curating your library...</p>
            </div>
        );

        return (
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
                {/* Hero Section / Front Panel */}
                <div className="relative w-full rounded-[2.5rem] overflow-hidden mb-12 shadow-2xl group min-h-[300px] md:min-h-[450px] bg-gray-900">
                    <img 
                        src="/assets/front-panel.png" 
                        alt="Tarbiah Sentap Hero" 
                        className="absolute inset-0 w-full h-full object-cover transition-transform duration-1000 group-hover:scale-105"
                    />
                    <div className="absolute inset-0 bg-gradient-to-r from-black/80 via-black/40 to-transparent flex flex-col justify-center px-8 md:px-16">
                        <div className="max-w-xl animate-in fade-in slide-in-from-left-8 duration-1000 delay-300">
                            <span className="bg-primary-600 text-white text-[10px] font-black uppercase tracking-[0.3em] px-4 py-2 rounded-full mb-6 inline-block">
                                New Arrival 2026
                            </span>
                            <h2 className="text-4xl md:text-6xl font-black text-white mb-4 tracking-tight leading-tight">
                                Transform Your <br />
                                <span className="text-primary-400">Soul & Mind.</span>
                            </h2>
                            <p className="text-gray-300 text-sm md:text-lg mb-8 max-w-md font-medium leading-relaxed">
                                Curated collections that inspire spiritual growth and intellectual excellence. Start your journey with Tarbiah Sentap.
                            </p>
                            <div className="flex flex-wrap gap-4">
                                <button className="bg-white text-gray-900 px-8 py-4 rounded-2xl font-black text-sm hover:bg-primary-500 hover:text-white transition-all shadow-xl active:scale-95">
                                    Explore Best Sellers
                                </button>
                                <button className="glass text-white px-8 py-4 rounded-2xl font-black text-sm hover:bg-white/20 transition-all active:scale-95 border border-white/20">
                                    Our Story
                                </button>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="flex flex-col lg:flex-row justify-between items-center gap-6 mb-10">
                    <div className="relative w-full lg:w-96 group">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500 group-focus-within:text-gold-400 transition-colors" />
                        <input 
                            type="text"
                            placeholder="Search the archive..."
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            className="w-full pl-12 pr-4 py-4 rounded-2xl bg-charcoal-900 border border-charcoal-800 text-white placeholder-gray-500 focus:border-gold-500 focus:ring-4 focus:ring-gold-500/10 outline-none transition-all shadow-inner"
                        />
                    </div>
                    <div className="grid grid-cols-2 lg:flex gap-3 sm:gap-4 w-full lg:w-auto">
                        <select 
                            value={genre}
                            onChange={(e) => setGenre(e.target.value)}
                            className="px-6 py-4 rounded-2xl bg-charcoal-900 border border-charcoal-800 text-white outline-none focus:border-gold-500 cursor-pointer shadow-sm text-sm font-bold"
                        >
                            {genres.map(g => <option key={g} value={g}>{g}</option>)}
                        </select>
                        <select 
                            value={sortBy}
                            onChange={(e) => setSortBy(e.target.value)}
                            className="px-6 py-4 rounded-2xl bg-charcoal-900 border border-charcoal-800 text-white outline-none focus:border-gold-500 cursor-pointer shadow-sm text-sm font-bold"
                        >
                            <option value="featured">Featured Picks</option>
                            <option value="price-asc">Price: Low to High</option>
                            <option value="price-desc">Price: High to Low</option>
                            <option value="rating">Top Rated</option>
                        </select>
                    </div>
                </div>

                {filteredBooks.length === 0 ? (
                    <div className="text-center py-20 text-gray-500">No books found matching your criteria.</div>
                ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
                        {filteredBooks.map(book => (
                            <div key={book.id} className="group bg-charcoal-900 rounded-[2rem] p-6 border border-charcoal-800 hover:gold-border transition-all duration-500 flex flex-col relative overflow-hidden">
                                <div className="relative aspect-[3/4] mb-6 overflow-hidden rounded-2xl bg-charcoal-950 shadow-2xl">
                                    <img src={book.cover} alt={book.title} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700 opacity-90 group-hover:opacity-100" />
                                    <div className="absolute top-3 right-3 bg-charcoal-950/80 backdrop-blur-md text-[10px] font-black text-gold-400 px-3 py-1.5 rounded-xl flex items-center gap-1.5 shadow-xl border border-white/5">
                                        <Star className="w-3.5 h-3.5 fill-gold-400" /> {book.rating}
                                    </div>
                                    <div className="absolute inset-0 bg-gradient-to-t from-charcoal-950 via-transparent to-transparent opacity-60" />
                                </div>
                                <div className="flex flex-col flex-grow">
                                    <span className="text-[10px] font-black text-gold-500 mb-2 uppercase tracking-[0.25em]"> {book.genre} </span>
                                    <h3 className="font-black text-white text-xl leading-tight mb-2 group-hover:gold-text-gradient transition-all"> {book.title} </h3>
                                    <p className="text-xs text-gray-500 font-bold uppercase tracking-widest mb-6"> {book.author} </p>
                                    <div className="mt-auto flex items-center justify-between">
                                        <span className="font-black text-2xl text-white"> RM{book.price.toFixed(2)} </span>
                                        <div className="flex gap-2">
                                            <button 
                                                className="bg-charcoal-800 text-gold-400 p-3.5 rounded-2xl hover:bg-gold-600 hover:text-white transition-all shadow-lg active:scale-90"
                                                title="AI Insights"
                                            >
                                                <Sparkles className="w-5 h-5" />
                                            </button>
                                            <button 
                                                onClick={() => addToCart(book)}
                                                className="gold-gradient text-charcoal-950 p-3.5 rounded-2xl hover:scale-110 transition-all shadow-xl shadow-gold-600/10 active:scale-90"
                                            >
                                                <Plus className="w-5 h-5" />
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        );
    };

    const CartView = () => {
        const subtotal = cart.reduce((sum, item) => sum + (item.book.price * item.quantity), 0);
        const tax = subtotal * 0.08;
        const total = subtotal + tax;

        if (cart.length === 0) {
            return (
                <div className="max-w-3xl mx-auto px-4 py-20 text-center animate-in zoom-in duration-300">
                    <div className="w-32 h-32 bg-charcoal-900 rounded-full flex items-center justify-center mx-auto mb-8 shadow-inner border border-white/5">
                        <ShoppingCart className="w-12 h-12 text-gold-600" />
                    </div>
                    <h2 className="text-3xl font-black text-white mb-3">Your collection is empty</h2>
                    <p className="text-gray-500 mb-10 text-lg font-medium">Your next spiritual breakthrough is just a click away.</p>
                    <button 
                        onClick={() => setView('catalog')}
                        className="gold-gradient text-charcoal-950 px-10 py-4 rounded-2xl font-black hover:scale-105 active:scale-95 transition-all shadow-2xl shadow-gold-600/20"
                    >
                        Explore the Archive
                    </button>
                </div>
            );
        }

        return (
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 animate-in fade-in duration-500">
                <h1 className="text-4xl font-black text-white mb-10 tracking-tight">Shopping <span className="gold-text-gradient">Collection</span></h1>
                <div className="flex flex-col lg:flex-row gap-12">
                    <div className="flex-grow space-y-6">
                        {cart.map(item => (
                            <div key={item.book.id} className="bg-charcoal-900 p-6 rounded-[2rem] border border-charcoal-800 flex items-center gap-8 shadow-2xl hover:gold-border transition-all group">
                                <div className="w-24 h-36 flex-shrink-0 shadow-2xl rounded-xl overflow-hidden border border-white/5 bg-charcoal-950">
                                    <img src={item.book.cover} alt={item.book.title} className="w-full h-full object-cover opacity-80 group-hover:opacity-100 transition-opacity" />
                                </div>
                                <div className="flex-grow">
                                    <h3 className="font-black text-xl text-white mb-1 group-hover:gold-text-gradient transition-all"> {item.book.title} </h3>
                                    <p className="text-gray-500 text-xs font-black uppercase tracking-widest mb-4"> {item.book.author} </p>
                                    <span className="font-black gold-text-gradient text-2xl"> RM{item.book.price.toFixed(2)} </span>
                                </div>
                                <div className="flex items-center gap-4 bg-charcoal-950 p-2 rounded-2xl border border-charcoal-800 shadow-inner">
                                    <button onClick={() => updateQuantity(item.book.id, -1)} className="w-10 h-10 flex items-center justify-center rounded-xl bg-charcoal-900 text-white shadow-sm hover:bg-charcoal-800 transition-all font-black"> - </button>
                                    <span className="w-6 text-center font-black text-gold-400"> {item.quantity} </span>
                                    <button onClick={() => updateQuantity(item.book.id, 1)} className="w-10 h-10 flex items-center justify-center rounded-xl bg-charcoal-900 text-white shadow-sm hover:bg-charcoal-800 transition-all font-black"> + </button>
                                </div>
                                <button onClick={() => removeFromCart(item.book.id)} className="p-3 text-gray-500 hover:text-red-500 transition-all rounded-2xl ml-4">
                                    <Trash2 className="w-6 h-6" />
                                </button>
                            </div>
                        ))}
                    </div>

                    <div className="w-full lg:w-[400px]">
                        <div className="bg-charcoal-900 p-8 rounded-[2.5rem] border border-charcoal-800 shadow-2xl sticky top-28">
                            <h2 className="text-2xl font-black text-white mb-8 tracking-tight">Order Summary</h2>
                            <div className="space-y-5 mb-8">
                                <div className="flex justify-between text-gray-500 font-bold uppercase tracking-widest text-[10px]">
                                    <span>Subtotal ({cart.reduce((a, b) => a + b.quantity, 0)} items)</span>
                                    <span className="text-white">RM{subtotal.toFixed(2)}</span>
                                </div>
                                <div className="flex justify-between text-gray-500 font-bold uppercase tracking-widest text-[10px]">
                                    <span>Shipping</span>
                                    <span className="text-gold-500 font-black">COMPLIMENTARY</span>
                                </div>
                                <div className="flex justify-between text-gray-500 font-bold uppercase tracking-widest text-[10px]">
                                    <span>Est. Service Tax (8%)</span>
                                    <span className="text-white">RM{tax.toFixed(2)}</span>
                                </div>
                                <div className="h-px bg-charcoal-800 my-4"></div>
                                <div className="flex justify-between font-black text-2xl text-white">
                                    <span>Total</span>
                                    <span className="gold-text-gradient font-black">RM{total.toFixed(2)}</span>
                                </div>
                            </div>
                            <button 
                                onClick={handleCheckout}
                                className="w-full gold-gradient text-charcoal-950 py-5 rounded-2xl font-black text-lg flex items-center justify-center gap-3 hover:scale-105 transition-all shadow-2xl shadow-gold-600/20 active:scale-95"
                            >
                                Secure Checkout <ChevronRight className="w-6 h-6" />
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        );
    };

    const LoginView = () => {
        const [email, setEmail] = useState('');
        const [password, setPassword] = useState('');

        const onSubmit = (e) => {
            e.preventDefault();
            handleLogin(email, password);
        };

        return (
            <div className="max-w-md mx-auto px-4 py-24 animate-in slide-in-from-top-8 duration-500">
                <div className="bg-charcoal-900 p-10 rounded-[2.5rem] shadow-2xl border border-charcoal-800 relative overflow-hidden">
                    <div className="absolute top-0 right-0 w-32 h-32 bg-gold-600/5 blur-[60px] rounded-full"></div>
                    <div className="text-center mb-10">
                        <div className="bg-charcoal-950 w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-6 border border-white/5">
                            <ShieldCheck className="w-8 h-8 text-gold-500" />
                        </div>
                        <h2 className="text-3xl font-black text-white mb-2 tracking-tight">Access the <span className="gold-text-gradient">Vault</span></h2>
                        <p className="text-gray-500 text-sm font-bold uppercase tracking-widest text-[10px]">Secure Identity Verification</p>
                    </div>
                    <form onSubmit={onSubmit} className="space-y-6">
                        <div>
                            <label className="block text-[10px] font-black text-gray-500 mb-2 ml-1 uppercase tracking-widest">Email Identity</label>
                            <input 
                                type="email"
                                value={email}
                                onChange={e => setEmail(e.target.value)}
                                placeholder="name@archive.com"
                                className="w-full px-5 py-4 rounded-2xl bg-charcoal-950 border border-charcoal-800 text-white focus:border-gold-500 focus:ring-4 focus:ring-gold-500/10 outline-none transition-all shadow-inner"
                                required
                            />
                        </div>
                        <div>
                            <label className="block text-[10px] font-black text-gray-500 mb-2 ml-1 uppercase tracking-widest">Secret Key</label>
                            <input 
                                type="password"
                                value={password}
                                onChange={e => setPassword(e.target.value)}
                                placeholder="••••••••"
                                className="w-full px-5 py-4 rounded-2xl bg-charcoal-950 border border-charcoal-800 text-white focus:border-gold-500 focus:ring-4 focus:ring-gold-500/10 outline-none transition-all shadow-inner"
                                required
                            />
                        </div>
                        <button type="submit" className="w-full gold-gradient text-charcoal-950 py-4.5 rounded-2xl font-black text-lg hover:scale-105 transition-all mt-4 shadow-2xl shadow-gold-600/10 active:scale-95">
                            Authenticate
                        </button>
                    </form>
                    <div className="mt-10 p-5 bg-charcoal-950 rounded-2xl border border-charcoal-800 text-center text-[10px] text-gray-500 space-y-1 font-bold uppercase tracking-widest">
                        <p>Admin: <span className="text-gold-500">admin@tarbiahsentap.com</span></p>
                        <p>Customer: <span className="text-gold-500">customer@example.com</span></p>
                        <p>Access: <span className="text-gold-500">password123</span></p>
                    </div>
                </div>
            </div>
        );
    };

    const TwoFAView = () => {
        const [otp, setOtp] = useState('');
        return (
            <div className="max-w-md mx-auto px-4 py-24 animate-in zoom-in duration-300">
                <div className="bg-charcoal-900 p-10 rounded-[2.5rem] shadow-2xl border border-charcoal-800 text-center">
                    <div className="bg-charcoal-950 w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-8 border border-white/5">
                        <ShieldCheck className="w-8 h-8 text-gold-500 animate-pulse" />
                    </div>
                    <h2 className="text-3xl font-black text-white mb-3 tracking-tight">Vault <span className="gold-text-gradient">Verification</span></h2>
                    <p className="text-gray-500 mb-10 text-[10px] font-black uppercase tracking-widest">Enter the 6-digit biometric token</p>
                    <div className="flex gap-4 justify-center mb-10">
                        <input 
                            type="text"
                            maxLength="6"
                            value={otp}
                            onChange={(e) => setOtp(e.target.value)}
                            className="w-full text-center text-4xl font-black tracking-[0.5em] py-6 bg-charcoal-950 border-2 border-charcoal-800 focus:border-gold-500 rounded-2xl outline-none text-gold-400 transition-all shadow-inner"
                            placeholder="000000"
                        />
                    </div>
                    <button 
                        onClick={() => handleVerify2FA(otp)}
                        className="w-full gold-gradient text-charcoal-950 py-5 rounded-2xl font-black text-lg hover:scale-105 shadow-2xl shadow-gold-600/20 transition-all active:scale-95"
                    >
                        Confirm Access
                    </button>
                    <p className="mt-6 text-[10px] text-gray-500 font-bold uppercase tracking-widest italic">Hint: use 123456</p>
                </div>
            </div>
        );
    };

    const CheckoutView = () => {
        return (
            <div className="max-w-4xl mx-auto px-4 py-12 animate-in slide-in-from-right-8 duration-500">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
                    <div className="bg-charcoal-900 p-10 rounded-[2.5rem] border border-charcoal-800 shadow-2xl">
                        <h2 className="text-2xl font-black text-white mb-8 tracking-tight">Secure <span className="gold-text-gradient">Checkout</span></h2>
                        <div className="space-y-6">
                            <div>
                                <label className="block text-[10px] font-black text-gray-500 uppercase tracking-widest mb-2 ml-1">Logistics Destination</label>
                                <input type="text" placeholder="Full Street Address" className="w-full px-5 py-4 rounded-2xl bg-charcoal-950 border border-charcoal-800 text-white focus:border-gold-500 focus:ring-4 focus:ring-gold-500/10 outline-none transition-all shadow-inner" />
                            </div>
                            <div className="pt-6 border-t border-charcoal-800">
                                <label className="block text-[10px] font-black text-gray-500 uppercase tracking-widest mb-4 ml-1">Payment Protocol</label>
                                <div className="bg-gold-500/5 p-5 rounded-2xl mb-6 flex items-center gap-4 border border-gold-500/10">
                                    <div className="bg-charcoal-950 p-2.5 rounded-xl border border-white/5 shadow-xl">
                                        <CreditCard className="text-gold-500" />
                                    </div>
                                    <div className="flex-grow">
                                        <p className="font-black text-white text-sm">Credit/Debit Node</p>
                                        <p className="text-[10px] text-gold-500 font-black uppercase tracking-widest">Razorpay Integrated</p>
                                    </div>
                                </div>
                                <div className="space-y-4">
                                    <input type="text" placeholder="Secure Card Number" className="w-full px-5 py-4 rounded-2xl bg-charcoal-950 border border-charcoal-800 text-white focus:border-gold-500 focus:ring-4 focus:ring-gold-500/10 outline-none transition-all shadow-inner" />
                                    <div className="grid grid-cols-2 gap-4">
                                        <input type="text" placeholder="MM/YY" className="w-full px-5 py-4 rounded-2xl bg-charcoal-950 border border-charcoal-800 text-white focus:border-gold-500 focus:ring-4 focus:ring-gold-500/10 outline-none transition-all shadow-inner" />
                                        <input type="text" placeholder="CVC" className="w-full px-5 py-4 rounded-2xl bg-charcoal-950 border border-charcoal-800 text-white focus:border-gold-500 focus:ring-4 focus:ring-gold-500/10 outline-none transition-all shadow-inner" />
                                    </div>
                                </div>
                            </div>
                        </div>
                        <button 
                            onClick={processPayment}
                            className="w-full mt-10 gold-gradient text-charcoal-950 py-5 rounded-2xl font-black text-xl hover:scale-105 transition-all shadow-2xl shadow-gold-600/20 active:scale-95"
                        >
                            Pay Securely
                        </button>
                    </div>
                    <div className="py-6">
                        <h3 className="text-xl font-black text-white mb-8 tracking-tight">Order <span className="gold-text-gradient">Manifest</span></h3>
                        <div className="space-y-6 max-h-[400px] overflow-y-auto pr-2 hide-scrollbar">
                            {cart.map(item => (
                                <div key={item.book.id} className="flex gap-4 items-center group">
                                    <div className="w-16 h-24 flex-shrink-0 bg-charcoal-950 rounded-xl overflow-hidden border border-white/5 shadow-xl">
                                        <img src={item.book.cover} className="w-full h-full object-cover opacity-80 group-hover:opacity-100 transition-opacity" />
                                    </div>
                                    <div>
                                        <p className="font-black text-white text-sm group-hover:gold-text-gradient transition-all">{item.book.title}</p>
                                        <p className="text-[10px] text-gray-500 font-bold uppercase tracking-widest mt-1">{item.quantity} unit{item.quantity > 1 ? 's' : ''}</p>
                                        <p className="text-gold-500 font-black mt-1 text-sm tracking-tight">RM{(item.book.price * item.quantity).toFixed(2)}</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        );
    };

    const OrdersView = () => (
        <div className="max-w-5xl mx-auto px-4 py-12 animate-in fade-in duration-500">
            <h1 className="text-4xl font-black text-white mb-10 tracking-tight">Purchase <span className="gold-text-gradient">History</span></h1>
            {orders.length === 0 ? (
                <div className="bg-charcoal-900 p-16 rounded-[2.5rem] border border-dashed border-charcoal-800 text-center">
                    <p className="text-gray-500 font-bold uppercase tracking-widest text-[10px]">No transaction history found in the matrix.</p>
                </div>
            ) : (
                <div className="space-y-8">
                    {orders.map(order => (
                        <div key={order.id} className="bg-charcoal-900 rounded-[2.5rem] border border-charcoal-800 overflow-hidden shadow-2xl hover:gold-border transition-all duration-500 animate-in fade-in slide-in-from-bottom-4">
                            <div className="p-8 border-b border-charcoal-800 bg-charcoal-950/50 flex justify-between items-center">
                                <div>
                                    <p className="text-[10px] text-gold-500 font-black uppercase tracking-[0.3em] mb-1">Order Transaction</p>
                                    <h3 className="text-xl font-black text-white tracking-tighter">REF-{order.id.split('-')[0].toUpperCase()}</h3>
                                </div>
                                <div className="text-right">
                                    <span className="bg-gold-500/10 text-gold-400 border border-gold-500/20 px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest">
                                        {order.status}
                                    </span>
                                    <p className="text-[10px] text-gray-500 font-bold mt-2 uppercase tracking-widest">{new Date(order.created_at).toLocaleDateString()}</p>
                                </div>
                            </div>
                            <div className="p-8">
                                <div className="flex justify-between items-end">
                                    <div className="flex -space-x-4">
                                        {order.items.slice(0, 3).map((item, idx) => (
                                            <div key={idx} className="w-12 h-16 rounded-lg border-2 border-charcoal-950 shadow-xl overflow-hidden bg-charcoal-800">
                                                <div className="w-full h-full bg-charcoal-700 flex items-center justify-center"><BookOpen className="w-4 h-4 text-gold-400"/></div>
                                            </div>
                                        ))}
                                        {order.items.length > 3 && (
                                            <div className="w-12 h-16 rounded-lg border-2 border-charcoal-950 shadow-xl bg-gold-600 flex items-center justify-center text-charcoal-950 text-xs font-black">+{order.items.length - 3}</div>
                                        )}
                                    </div>
                                    <div className="text-right">
                                        <p className="text-[10px] text-gray-500 font-black uppercase tracking-widest mb-1">Total Matrix</p>
                                        <p className="text-3xl font-black gold-text-gradient">RM{order.total_amount.toFixed(2)}</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );

    const AdminView = () => {
        const [activeTab, setActiveTab] = useState('dashboard');
        const [allOrders, setAllOrders] = useState([]);

        useEffect(() => {
            if (activeTab === 'orders') {
                adminApi.getAllOrders().then(res => {
                    if(res.data.success) setAllOrders(res.data.data);
                }).catch(() => {});
            }
        }, [activeTab]);

        const tabs = [
            { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
            { id: 'books', label: 'Books Catalog', icon: BookOpen },
            { id: 'users', label: 'Users', icon: User },
            { id: 'promotions', label: 'Promotions', icon: Sparkles },
            { id: 'orders', label: 'All Orders', icon: Package },
        ];

        return (
            <div className="max-w-7xl mx-auto px-4 py-8 animate-in zoom-in duration-500">
                <div className="flex flex-col md:flex-row gap-8">
                    {/* Sidebar Navigation */}
                    <div className="w-full md:w-64 flex-shrink-0">
                        <div className="bg-charcoal-900 rounded-[2.5rem] border border-charcoal-800 shadow-2xl p-6 sticky top-24">
                            <div className="mb-10 px-2">
                                <h1 className="text-2xl font-black text-white tracking-tight">Admin<span className="gold-text-gradient">Core</span></h1>
                                <p className="text-[10px] text-gray-500 font-black uppercase tracking-[0.2em] mt-1">Management Hub</p>
                            </div>
                            
                            <nav className="space-y-2">
                                {tabs.map(tab => (
                                    <button
                                        key={tab.id}
                                        onClick={() => setActiveTab(tab.id)}
                                        className={`w-full flex items-center gap-3 px-5 py-4 rounded-2xl font-bold text-sm transition-all duration-300 ${
                                            activeTab === tab.id 
                                            ? 'gold-gradient text-charcoal-950 shadow-lg shadow-gold-600/20 translate-x-2' 
                                            : 'text-gray-500 hover:text-white hover:bg-white/5'
                                        }`}
                                    >
                                        <tab.icon className={`w-5 h-5 ${activeTab === tab.id ? 'text-charcoal-950' : 'text-gray-500'}`} />
                                        {tab.label}
                                    </button>
                                ))}
                            </nav>

                            <div className="mt-12 pt-8 border-t border-charcoal-800 px-2">
                                <button 
                                    onClick={async () => {
                                        try {
                                            const res = await adminApi.exportCSV();
                                            const url = window.URL.createObjectURL(new Blob([res.data]));
                                            const link = document.createElement('a');
                                            link.href = url;
                                            link.setAttribute('download', 'orders.csv');
                                            document.body.appendChild(link);
                                            link.click();
                                            addToast('CSV Exported');
                                        } catch (err) { addToast('Export failed', 'error'); }
                                    }}
                                    className="w-full flex items-center gap-2 text-xs font-black text-gray-500 hover:text-gold-400 transition-colors uppercase tracking-widest"
                                >
                                    <Edit className="w-4 h-4" /> Export Store Analytics
                                </button>
                            </div>
                        </div>
                    </div>

                    {/* Main Content Area */}
                    <div className="flex-grow min-w-0">
                        <div className="flex justify-between items-center mb-8">
                            <h2 className="text-3xl font-black text-white tracking-tight">
                                {tabs.find(t => t.id === activeTab)?.label}
                            </h2>
                            {activeTab === 'books' && (
                                <button className="gold-gradient text-charcoal-950 px-6 py-3 rounded-2xl font-black text-sm hover:scale-105 transition-all flex items-center gap-2 shadow-xl shadow-gold-600/10 active:scale-95">
                                    <Plus className="w-4 h-4" /> Add New Book
                                </button>
                            )}
                        </div>

                        {/* Tab Content: Dashboard */}
                        {activeTab === 'dashboard' && (
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8 animate-in fade-in duration-300">
                                <div className="bg-charcoal-900 p-8 rounded-3xl border border-charcoal-800 shadow-sm flex flex-col justify-between hover:gold-border transition-all cursor-default group">
                                    <p className="text-gray-500 font-black text-[10px] uppercase tracking-widest mb-4">Gross Revenue</p>
                                    <h3 className="text-4xl font-black text-white group-hover:gold-text-gradient transition-all">RM12,450</h3>
                                    <div className="flex items-center gap-2 mt-6">
                                        <span className="bg-green-500/10 text-green-500 px-2 py-1 rounded-lg text-[10px] font-black">+14%</span>
                                        <span className="text-[10px] text-gray-500 font-bold uppercase tracking-widest">Growth Matrix</span>
                                    </div>
                                </div>
                                <div className="bg-charcoal-900 p-8 rounded-3xl border border-charcoal-800 shadow-sm flex flex-col justify-between hover:gold-border transition-all cursor-default group">
                                    <p className="text-gray-500 font-black text-[10px] uppercase tracking-widest mb-4">Registered Souls</p>
                                    <h3 className="text-4xl font-black text-white group-hover:gold-text-gradient transition-all">1,204</h3>
                                    <div className="flex items-center gap-2 mt-6">
                                        <span className="bg-green-500/10 text-green-500 px-2 py-1 rounded-lg text-[10px] font-black">+5%</span>
                                        <span className="text-[10px] text-gray-500 font-bold uppercase tracking-widest">Active now</span>
                                    </div>
                                </div>
                                <div className="bg-charcoal-900 p-8 rounded-3xl border border-charcoal-800 shadow-sm flex flex-col justify-between hover:gold-border transition-all cursor-default group">
                                    <p className="text-gray-500 font-black text-[10px] uppercase tracking-widest mb-4">Total Matrix</p>
                                    <h3 className="text-4xl font-black text-white group-hover:gold-text-gradient transition-all">456</h3>
                                    <div className="flex items-center gap-2 mt-6">
                                        <span className="bg-red-500/10 text-red-500 px-2 py-1 rounded-lg text-[10px] font-black">-2%</span>
                                        <span className="text-[10px] text-gray-500 font-bold uppercase tracking-widest">This session</span>
                                    </div>
                                </div>
                                
                                <div className="md:col-span-3 bg-charcoal-900 p-10 rounded-[2.5rem] border border-charcoal-800 shadow-sm h-[400px] flex items-center justify-center bg-gradient-to-br from-charcoal-900 to-charcoal-950 relative overflow-hidden group">
                                    <div className="absolute inset-0 opacity-10 bg-[radial-gradient(#D4AF37_1px,transparent_1px)] [background-size:24px_24px]"></div>
                                    <div className="text-center relative z-10">
                                        <div className="bg-charcoal-950 w-20 h-20 rounded-3xl flex items-center justify-center mx-auto mb-6 group-hover:rotate-12 transition-transform duration-500 border border-gold-500/20">
                                            <LayoutDashboard className="w-10 h-10 text-gold-500" />
                                        </div>
                                        <p className="text-white font-black text-2xl tracking-tight">Market Analytical Core</p>
                                        <p className="text-sm text-gray-500 mt-4 max-w-sm mx-auto leading-relaxed uppercase tracking-widest font-bold text-[10px]">Processing global store metrics...</p>
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* Tab Content: Books */}
                        {activeTab === 'books' && (
                            <div className="bg-charcoal-900 rounded-[2.5rem] border border-charcoal-800 shadow-2xl overflow-hidden animate-in fade-in duration-300">
                                <div className="overflow-x-auto">
                                    <table className="w-full text-left">
                                        <thead>
                                            <tr className="text-[10px] font-black text-gray-500 uppercase tracking-[0.2em] bg-charcoal-950/50">
                                                <th className="px-8 py-6">Library Entry</th>
                                                <th className="px-8 py-6">Genre</th>
                                                <th className="px-8 py-6">Price</th>
                                                <th className="px-8 py-6">Inventory</th>
                                                <th className="px-8 py-6 text-right">Matrix Actions</th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-charcoal-800">
                                            {books.map(book => (
                                                <tr key={book.id} className="hover:bg-white/5 transition-colors group">
                                                    <td className="px-8 py-6">
                                                        <div className="flex items-center gap-4">
                                                            <div className="w-12 h-16 rounded-xl shadow-xl overflow-hidden bg-charcoal-950 border border-white/5">
                                                                <img src={book.cover} className="w-full h-full object-cover opacity-80 group-hover:opacity-100 transition-opacity" alt="" />
                                                            </div>
                                                            <div>
                                                                <p className="font-black text-white leading-tight group-hover:gold-text-gradient transition-all">{book.title}</p>
                                                                <p className="text-[10px] text-gray-500 font-bold uppercase tracking-widest mt-1">{book.author}</p>
                                                            </div>
                                                        </div>
                                                    </td>
                                                    <td className="px-8 py-6">
                                                        <span className="text-[10px] font-black text-gold-500 bg-gold-500/10 border border-gold-500/20 px-3 py-1.5 rounded-full uppercase tracking-widest">{book.genre}</span>
                                                    </td>
                                                    <td className="px-8 py-6 font-black text-white">RM{book.price.toFixed(2)}</td>
                                                    <td className="px-8 py-6">
                                                        <div className="flex items-center gap-2">
                                                            <div className={`w-2 h-2 rounded-full ${book.stock > 10 ? 'bg-green-500' : 'bg-red-500'} shadow-[0_0_8px_rgba(34,197,94,0.4)]`}></div>
                                                            <span className="font-bold text-gray-400 text-sm tracking-tight">{book.stock} units</span>
                                                        </div>
                                                    </td>
                                                    <td className="px-8 py-6 text-right">
                                                        <div className="flex justify-end gap-2">
                                                            <button className="text-gray-500 hover:text-gold-400 p-3 bg-charcoal-950 rounded-2xl transition-all border border-white/5"><Edit className="w-4 h-4" /></button>
                                                            <button className="text-gray-500 hover:text-red-500 p-3 bg-charcoal-950 rounded-2xl transition-all border border-white/5"><Trash2 className="w-4 h-4" /></button>
                                                        </div>
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            </div>
                        )}

                        {/* Tab Content: Users */}
                        {activeTab === 'users' && (
                            <div className="bg-charcoal-900 rounded-[2.5rem] border border-charcoal-800 shadow-2xl p-10 text-center animate-in fade-in duration-300">
                                <div className="bg-charcoal-950 w-20 h-20 rounded-3xl flex items-center justify-center mx-auto mb-6 border border-white/5">
                                    <User className="w-10 h-10 text-gold-600" />
                                </div>
                                <h3 className="text-2xl font-black text-white tracking-tight">Identity Matrix</h3>
                                <p className="text-sm text-gray-500 mt-2 mb-10 font-bold uppercase tracking-widest text-[10px]">Managing registered souls and access levels</p>
                                <div className="space-y-3 max-w-2xl mx-auto">
                                     {[1,2,3].map(i => (
                                         <div key={i} className="flex justify-between items-center p-6 bg-charcoal-950 border border-charcoal-800 rounded-[1.5rem] hover:gold-border transition-all group">
                                             <div className="flex items-center gap-4">
                                                 <div className="w-12 h-12 bg-charcoal-900 rounded-2xl flex items-center justify-center text-gold-500 font-black group-hover:gold-gradient group-hover:text-charcoal-950 transition-all border border-white/5">U{i}</div>
                                                 <div className="text-left">
                                                     <p className="font-black text-white">Mock User {i}</p>
                                                     <p className="text-[10px] text-gray-500 font-black uppercase tracking-widest mt-1">user{i}@example.com</p>
                                                 </div>
                                             </div>
                                             <span className="text-[10px] font-black text-gold-400 bg-gold-400/10 px-4 py-2 rounded-full uppercase tracking-widest border border-gold-400/20">Customer</span>
                                         </div>
                                     ))}
                                </div>
                            </div>
                        )}

                        {/* Tab Content: Promotions */}
                        {activeTab === 'promotions' && (
                            <div className="bg-charcoal-900 rounded-[2.5rem] border border-charcoal-800 shadow-2xl p-10 text-center animate-in fade-in duration-300">
                                <div className="bg-charcoal-950 w-20 h-20 rounded-3xl flex items-center justify-center mx-auto mb-6 border border-white/5">
                                    <Sparkles className="w-10 h-10 text-gold-500" />
                                </div>
                                <h3 className="text-2xl font-black text-white tracking-tight">Campaign Matrix</h3>
                                <p className="text-sm text-gray-500 mt-2 max-w-sm mx-auto leading-relaxed font-bold uppercase tracking-widest text-[10px]">Orchestrate flash sales and exclusive spiritual offerings</p>
                                <button className="mt-10 gold-gradient text-charcoal-950 px-10 py-5 rounded-[2rem] font-black text-sm hover:scale-105 shadow-2xl shadow-gold-600/20 active:scale-95 transition-all">
                                    Initialize New Campaign
                                </button>
                            </div>
                        )}

                        {/* Tab Content: Orders */}
                        {activeTab === 'orders' && (
                            <div className="bg-charcoal-900 rounded-[2.5rem] border border-charcoal-800 shadow-2xl p-10 animate-in fade-in duration-300">
                                <div className="text-center mb-12">
                                    <div className="bg-charcoal-950 w-20 h-20 rounded-3xl flex items-center justify-center mx-auto mb-6 border border-white/5">
                                        <Package className="w-10 h-10 text-gold-600" />
                                    </div>
                                    <h3 className="text-2xl font-black text-white tracking-tight">Global Transaction Matrix</h3>
                                    <p className="text-sm text-gray-500 mt-2 font-bold uppercase tracking-widest text-[10px]">Real-time logistics and fulfillment oversight</p>
                                </div>
                                {allOrders.length > 0 ? (
                                    <div className="grid grid-cols-1 gap-4">
                                        {allOrders.map(order => (
                                            <div key={order.id} className="p-6 bg-charcoal-950 border border-charcoal-800 rounded-[2rem] flex justify-between items-center hover:gold-border transition-all group">
                                                 <div className="flex items-center gap-6">
                                                    <div className="bg-charcoal-900 p-4 rounded-2xl group-hover:gold-gradient transition-all border border-white/5">
                                                        <Package className="w-6 h-6 text-gold-500 group-hover:text-charcoal-950" />
                                                    </div>
                                                    <div>
                                                        <p className="font-black text-white font-mono text-sm tracking-tighter">REF-{order.id.split('-')[0].toUpperCase()}</p>
                                                        <p className="text-[10px] text-gray-500 font-black uppercase tracking-[0.2em] mt-1">{new Date(order.created_at).toLocaleDateString('en-MY', { month: 'short', day: 'numeric', year: 'numeric' })}</p>
                                                    </div>
                                                 </div>
                                                 <div className="text-right">
                                                    <p className="font-black gold-text-gradient text-xl tracking-tight mb-1">RM{order.total_amount.toFixed(2)}</p>
                                                    <span className={`px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest ${order.status === 'completed' ? 'bg-green-500/10 text-green-400 border border-green-500/20' : 'bg-gold-500/10 text-gold-400 border border-gold-500/20'}`}>
                                                        {order.status}
                                                    </span>
                                                 </div>
                                            </div>
                                        ))}
                                    </div>
                                ) : (
                                    <div className="text-center py-10">
                                        <Loader2 className="w-10 h-10 text-gold-600 animate-spin mx-auto mb-4" />
                                        <p className="text-sm text-gray-500 font-black uppercase tracking-widest">Synchronizing Matrix...</p>
                                    </div>
                                )}
                            </div>
                        )}
                    </div>
                </div>
            </div>
        );
    };

    return (
        <div className="min-h-screen flex flex-col bg-charcoal-950 selection:bg-gold-500/30">
            <Header />

            <main className="flex-grow">
                {view === 'catalog' && <CatalogView />}
                {view === 'cart' && <CartView />}
                {view === 'checkout' && <CheckoutView />}
                {view === 'login' && <LoginView />}
                {view === '2fa' && <TwoFAView />}
                {view === 'orders' && <OrdersView />}
                {view === 'admin' && <AdminView />}
            </main>

            {/* Floating Cart Summary FAB (Sticky Bottom Bar) */}
            {cart.length > 0 && view === 'catalog' && (
                <div className="fixed bottom-8 left-1/2 -translate-x-1/2 z-[60] w-[92%] max-w-md animate-in slide-in-from-bottom-12 fade-in duration-500 ease-out">
                    <div className="glass rounded-[2rem] shadow-[0_20px_50px_rgba(0,0,0,0.2)] border border-white/40 p-2 pl-5 flex items-center justify-between ring-1 ring-black/5 overflow-hidden group">
                        {/* Shimmer Effect */}
                        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover:animate-[shimmer_3s_infinite] pointer-events-none" />
                        
                        <div className="flex items-center gap-4 relative z-10">
                            <div className="relative">
                                <div className="w-14 h-14 bg-gray-900 rounded-2xl shadow-lg border border-white/20 flex items-center justify-center overflow-hidden rotate-[-4deg] group-hover:rotate-0 transition-transform duration-500">
                                    {cart[cart.length - 1]?.book?.cover ? (
                                        <img src={cart[cart.length - 1].book.cover} alt="Cart item" className="w-full h-full object-cover scale-110" />
                                    ) : (
                                        <Package className="w-7 h-7 text-white" />
                                    )}
                                </div>
                                <span className="absolute -top-2 -right-2 bg-red-500 text-white text-[11px] font-black w-6 h-6 rounded-full flex items-center justify-center border-2 border-white shadow-md">
                                    {cart.reduce((sum, item) => sum + item.quantity, 0)}
                                </span>
                            </div>
                            
                            <div>
                                <p className="text-[10px] font-black text-primary-600 uppercase tracking-widest mb-0.5">Total Balance</p>
                                <p className="text-2xl font-black text-gray-900 tracking-tight">
                                    RM{cart.reduce((sum, item) => sum + (item.book.price * item.quantity), 0).toFixed(2)}
                                </p>
                            </div>
                        </div>

                        <button 
                            onClick={() => setView('cart')}
                            className="relative z-10 bg-gray-900 text-white px-8 py-4 rounded-[1.5rem] font-black text-sm hover:bg-primary-600 transition-all shadow-xl active:scale-95 flex items-center gap-2 group/btn"
                        >
                            Checkout
                            <ChevronRight className="w-4 h-4 group-hover/btn:translate-x-1 transition-transform" />
                        </button>
                    </div>
                </div>
            )}

            {/* AI Chatbot System */}
            <div className={`fixed right-4 sm:right-8 z-50 flex flex-col items-end transition-all duration-500 ${cart.length > 0 && view === 'catalog' ? 'bottom-32' : 'bottom-8'}`}>
                {aiChatOpen && (
                    <div className="absolute bottom-20 right-0 w-[350px] sm:w-[450px] h-[550px] sm:h-[650px] bg-charcoal-900 rounded-[2.5rem] shadow-[0_20px_50px_rgba(0,0,0,0.5)] flex flex-col overflow-hidden border border-charcoal-800 animate-in slide-in-from-bottom-10 duration-500">
                        {/* Header */}
                        <div className="gold-gradient p-6 flex justify-between items-center shadow-lg">
                            <div className="flex items-center gap-4 text-charcoal-950">
                                <div className="bg-charcoal-950 p-2.5 rounded-xl shadow-xl">
                                    <Bot className="w-6 h-6 text-gold-500" />
                                </div>
                                <div>
                                    <p className="font-black text-sm uppercase tracking-widest">AI Librarian</p>
                                    <p className="text-[10px] font-black opacity-60 uppercase tracking-widest">System Online • Matrix v4.0</p>
                                </div>
                            </div>
                            <button onClick={() => setAiChatOpen(false)} className="hover:bg-black/10 p-2 rounded-full transition-colors text-charcoal-950">
                                <X className="w-5 h-5" />
                            </button>
                        </div>

                        {/* Messages Area */}
                        <div className="flex-grow p-6 overflow-y-auto bg-charcoal-950 space-y-4 hide-scrollbar">
                            {aiMessages.map((msg, idx) => (
                                <div key={idx} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'} animate-in fade-in slide-in-from-bottom-2 duration-300`}>
                                    <div className={`max-w-[85%] p-4 rounded-2xl text-sm leading-relaxed shadow-xl border ${
                                        msg.role === 'user' 
                                        ? 'gold-gradient text-charcoal-950 rounded-br-sm border-white/10 font-bold' 
                                        : 'bg-charcoal-900 border-charcoal-800 text-gray-200 rounded-bl-sm'
                                    }`}>
                                        {msg.text}
                                    </div>
                                </div>
                            ))}
                            {aiChatLoading && (
                                <div className="flex justify-start">
                                    <div className="bg-charcoal-900 border border-charcoal-800 p-4 rounded-2xl rounded-bl-sm shadow-xl flex gap-1.5">
                                        <div className="w-2 h-2 bg-gold-600 rounded-full animate-bounce"></div>
                                        <div className="w-2 h-2 bg-gold-600 rounded-full animate-bounce delay-100"></div>
                                        <div className="w-2 h-2 bg-gold-600 rounded-full animate-bounce delay-200"></div>
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* Input Area */}
                        <form onSubmit={(e) => { e.preventDefault(); handleSendAIMessage(e); }} className="p-5 bg-charcoal-900 border-t border-charcoal-800 flex gap-3 items-center">
                            <input 
                                type="text"
                                value={aiChatInput}
                                onChange={(e) => setAiChatInput(e.target.value)}
                                placeholder="Consult the AI Librarian..."
                                className="flex-grow px-6 py-4 bg-charcoal-950 border border-charcoal-800 rounded-2xl text-sm text-white outline-none focus:border-gold-500 focus:ring-4 focus:ring-gold-500/10 transition-all shadow-inner"
                            />
                            <button 
                                type="submit"
                                disabled={aiChatLoading || !aiChatInput.trim()}
                                className="gold-gradient text-charcoal-950 p-4 rounded-2xl hover:scale-110 disabled:opacity-50 transition-all shadow-xl shadow-gold-600/20 active:scale-90"
                            >
                                <Send className="w-5 h-5" />
                            </button>
                        </form>
                    </div>
                )}

                <button 
                    onClick={() => setAiChatOpen(!aiChatOpen)}
                    className="w-14 h-14 sm:w-16 sm:h-16 gold-gradient text-charcoal-950 rounded-2xl shadow-[0_15px_40px_rgba(212,175,55,0.3)] hover:scale-110 active:scale-95 transition-all flex items-center justify-center border border-white/20"
                >
                    {aiChatOpen ? <X className="w-6 h-6 sm:w-8 sm:h-8" /> : <MessageSquare className="w-6 h-6 sm:w-8 sm:h-8" />}
                </button>
            </div>

            {/* Toast System */}
            <div className="fixed top-24 right-6 z-[100] space-y-4 pointer-events-none">
                {toasts.map(t => (
                    <div key={t.id} className={`pointer-events-auto flex items-center gap-4 px-8 py-5 rounded-[1.5rem] shadow-[0_20px_50px_rgba(0,0,0,0.5)] animate-in slide-in-from-right-10 duration-300 border ${t.type === 'error' ? 'bg-red-600/90 text-white border-red-500 backdrop-blur-lg' : 'bg-charcoal-900/90 text-white border-gold-500/20 backdrop-blur-lg'}`}>
                        {t.type === 'error' ? <X className="w-5 h-5" /> : <Check className="w-5 h-5 text-gold-400" />}
                        <p className="font-black text-sm tracking-tight uppercase tracking-widest">{t.message}</p>
                    </div>
                ))}
            </div>
        </div>
    );
}
