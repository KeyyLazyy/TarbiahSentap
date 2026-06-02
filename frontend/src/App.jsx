import React, { useState, useMemo, useEffect } from 'react';
import {
    ShoppingCart, BookOpen, User, Star, Trash2, Plus,
    Search, LogOut, Package, ChevronRight, X, Check,
    CreditCard, ShieldCheck, LayoutDashboard, Edit,
    Sparkles, MessageSquare, Bot, Send, Loader2, Menu
} from 'lucide-react';
import { authApi, bookApi, orderApi, adminApi } from './services/api';

export default function App() {
    const [view, setView] = useState('catalog'); // 'catalog', 'cart', 'checkout', 'login', 'admin', 'orders', '2fa'
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
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
    const [billingAddress, setBillingAddress] = useState('');
    const [cardNumber, setCardNumber] = useState('');
    const [cardExpiry, setCardExpiry] = useState('');
    const [cardCvc, setCardCvc] = useState('');

    const [popupPlacements, setPopupPlacements] = useState({});

    const getBookSummary = (book) => {
        const summaries = {
            '1': 'Sebuah coretan rohani yang membimbing jiwa untuk meletakkan cinta tertinggi hanya kepada Allah SWT sebelum mencintai makhluk-Nya.',
            '2': 'Novel islamik berkisarkan tentang pencarian keindahan iman dan akhlak dalam melayari hubungan sesama manusia berlandaskan syariat.',
            '3': 'Kesinambungan kisah dakwah di kampus, membimbing mahasiswa menghadapi cabaran akademik, persahabatan, dan tarbiah diri.',
            '4': 'Himpunan sinopsis dan tadabbur ringkas 30 juzuk Al-Quran, ditulis dengan bahasa yang mudah difahami untuk mendekatkan diri dengan kalam tuhan.',
            '5': 'Naskhah buat setiap pendosa yang merasakan dirinya tidak layak diampuni, membawakan khabar gembira tentang keluasan rahmat dan keampunan Allah.',
            '6': 'Himpunan 100 doa-doa taubat pilihan daripada Al-Quran serta Hadith sahih untuk diamalkan dalam membersihkan jiwa yang leka.',
            '7': 'Sebuah buku motivasi dan terapi jiwa yang sangat popular, membincangkan cara menyembuhkan luka emosi dan mental melalui kekuatan doa dan tawakal.',
            '8': 'Panduan keibubapaan berlandaskan acuan syariat Islam bagi mendidik anak-anak menghadapi fitnah akhir zaman.',
            '9': 'Coretan tentang perasaan, emosi, dan pergolakan hati manusia yang ditarbiah agar sentiasa tunduk pada ketentuan Ilahi.',
            '11': 'Buku yang menyuntik harapan buat jiwa-jiwa yang sedang teraba-raba mencari sinar hidayah dan cahaya kebenaran.',
            '13': 'Buku terlaris (Edisi Istimewa) yang menghimpunkan surat-surat muhasabah diri rohani seolah-olah surat cinta yang dikirimkan terus dari pencipta.',
            '14': 'Ditujukan khas untuk sesiapa sahaja yang sedang kecewa, berduka, dan hilang arah, untuk kembali mencari ketenangan di sisi Allah.',
            '15': 'Himpunan hadith dan pesanan penting tentang tanda-tanda akhir zaman dan persediaan yang wajib dilakukan oleh setiap Muslim.',
            '16': 'Buku panduan dakwah dan tarbiah yang sangat santai, khusus untuk pelajar universiti membina jatidiri Muslim sejati di kampus.',
            '17': 'Naskhah rohani yang memupuk rasa rindu mendalam untuk bertemu, mengenali, dan mengikut sunnah baginda Nabi Muhammad SAW.',
            '18': 'Coretan khas mendidik wanita Muslimah untuk menghargai maruah diri dan bercita-cita menjadi bidadari yang dirindui syurga.',
            '19': 'Terapi ketenangan minda dan fizikal melalui keajaiban doa-doa harian dan amalan zikir yang bersumberkan sunnah.',
            '20': 'Buku motivasi yang membimbing pembaca meletakkan pergantungan mutlak kepada Allah dalam menggapai segala impian hidup.',
            '21': 'Kisah fiksi dakwah yang memecah stereotaip masyarakat terhadap peranan pendakwah muda, penuh konflik dan pengajaran.',
            '22': 'Bimbingan rohani ketika harapan duniawi musnah, membantu membina kembali kekuatan jiwa melalui redha dan husnudzon.',
            '23': 'Sebuah novel fiksyen islamik bertemakan sejarah, perjuangan maruah, dan pegangan iman yang tidak goyah.',
            '24': 'Catatan menyayat hati dan membakar semangat tentang perjuangan dan ketabahan saudara kita di bumi Palestin.',
            '25': 'Muhasabah tajam tentang maksiat, kelalaian manusia, dan bagaimana kemurkaan tuhan boleh mengundang ujian di dunia.',
            '26': 'Novel cinta islamik yang membincangkan erti cinta yang sebenar—cinta yang memandu kepada syurga, bukan maksiat.',
            '27': 'Berita gembira daripada Allah buat hamba-hamba-Nya yang sabar, bertaubat, dan istiqamah dalam melakukan kebaikan.',
            '29': 'Mengupas isu kekecewaan akibat dikhianati dan bagaimana membina semula kepercayaan serta memaafkan demi ketenangan jiwa.',
            '30': 'Novel tarbiah tentang perjalanan seorang pemuda yang berkelana mencari erti ketuhanan dan tujuan sebenar kehidupan.',
            '33': 'Novel islamik penuh misteri dan pengajaran tentang rahsia-rahsia kehidupan yang terselindung di sebalik ujian.',
            '38': 'Membongkar pelbagai mitos dan salah faham masyarakat dalam memahami konsep agama, ibadah, dan kehidupan.',
            '39': 'Kupasan tentang fitnah maksiat yang semakin bermaharajalela di akhir zaman serta benteng pertahanan iman yang perlu dibina.',
            '40': 'Ulasan mendalam mengenai tanda-tanda kiamat yang semakin hampir berdasarkan dalil sahih Al-Quran dan Hadith.',
            '41': 'Surat-surat penuh pujukan dan harapan yang ditujukan kepada jiwa yang putus asa agar bangkit semula mencari rahmat-Nya.',
            '42': 'Novel cinta dan rindu islamik yang membimbing pembaca meluahkan rindu dalam batas-batas yang diredhai Allah.',
            '43': 'Komik/Manga dakwah yang menyampaikan analogi-analogi kehidupan dan tarbiah dengan gaya ilustrasi yang santai dan menarik.',
            '44': 'Langkah-langkah praktikal dan perkongsian motivasi bagi sesiapa sahaja yang ingin berhijrah meninggalkan masa silam yang kelam.'
        };
        return summaries[book.id] || 'Coretan rohani dan inspirasi untuk mendekatkan diri kepada Allah SWT serta membina peribadi Muslim yang cemerlang.';
    };

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

    const processPayment = () => {
        if (!billingAddress.trim() || !cardNumber.trim() || !cardExpiry.trim() || !cardCvc.trim()) {
            addToast('Please fill out all billing and payment details', 'error');
            return;
        }
        setView('payment-gateway');
    };

    const completeTransaction = async (status) => {
        if (status === 'fail') {
            addToast('Transaction Declined: Card authorization failed.', 'error');
            setView('checkout');
            return;
        }

        try {
            const total = cart.reduce((sum, item) => sum + (item.book.price * item.quantity), 0);
            const res = await orderApi.create({
                items: cart.map(item => ({ book_id: item.book.id, quantity: item.quantity, price: item.book.price })),
                total_amount: total * 1.08 // including tax
            });
            
            if (res.data.success) {
                setCart([]);
                setBillingAddress('');
                setCardNumber('');
                setCardExpiry('');
                setCardCvc('');
                setView('orders');
                addToast('Payment successful! Order processed.');
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
            const errorMsg = err.response?.data?.error || 'Invalid credentials';
            addToast(errorMsg, 'error');
            if (err.response?.data?.verificationLink) {
                console.log('✉️ Firebase Verification Link:', err.response.data.verificationLink);
            }
        }
    };

    const handleSignup = async (email, password) => {
        try {
            const res = await authApi.signup(email, password);
            if (res.data.success) {
                if (res.data.verificationLink) {
                    console.log('✉️ Firebase Verification Link:', res.data.verificationLink);
                    addToast('Registration successful! Click the verification link in your browser console.', 'info');
                    setView('login');
                } else {
                    const userData = res.data.user;
                    localStorage.setItem('token', res.data.token);
                    localStorage.setItem('user', JSON.stringify(userData));
                    setUser(userData);
                    setView('catalog');
                    addToast('Registered & logged in successfully');
                }
            }
        } catch (err) {
            const errorMsg = err.response?.data?.error || 'Registration failed';
            addToast(errorMsg, 'error');
            if (err.response?.data?.verificationLink) {
                console.log('✉️ Firebase Verification Link:', err.response.data.verificationLink);
            }
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

    const handleSendAIMessage = async (e) => {
        if (!aiChatInput.trim()) return;
        const userMsg = { role: 'user', text: aiChatInput };
        setAiMessages(prev => [...prev, userMsg]);
        const promptText = aiChatInput;
        setAiChatInput('');
        setAiChatLoading(true);

        setTimeout(() => {
            let responseText = "Terima kasih atas mesej anda! Sebagai Pembantu AI Tarbiah Sentap, saya mencadangkan anda membaca buku 'Tuhan Aku Ingin Sembuh' oleh Najmi Fetih untuk motivasi rohani, atau novel 'Izinkan Aku Mencintai-Mu' oleh Ustaz Adnin Roslan.";
            const lower = promptText.toLowerCase();
            if (lower.includes('admin') || lower.includes('password') || lower.includes('login')) {
                responseText = "Untuk log masuk sebagai Admin, gunakan email: admin@tarbiahsentap.com dan kata laluan: password123. Sistem akan meminta 6-digit Device Verification code.";
            } else if (lower.includes('beli') || lower.includes('bayar') || lower.includes('troli') || lower.includes('cart') || lower.includes('payment')) {
                responseText = "Untuk membuat pembelian, sila tambah buku ke dalam troli, pergi ke halaman troli dan klik 'Secure Checkout'. Anda boleh memasukkan sebarang kad dummy (cth: Visa 4111 1111 1111 1111).";
            } else if (lower.includes('adnin') || lower.includes('ustaz')) {
                responseText = "Ustaz Adnin Roslan adalah pengasas Tarbiah Sentap. Buku popular beliau termasuk 'Izinkan Aku Mencintai-Mu', 'Surat Cinta Untuk Pendosa', dan 'Manga Tarbiah'.";
            } else if (lower.includes('razer') || lower.includes('razorpay')) {
                responseText = "Penyepaduan Razer Pay sedang dirancang untuk fasa pembangunan akan datang!";
            } else if (lower.includes('stok') || lower.includes('stock') || lower.includes('buku')) {
                responseText = "Anda boleh melihat stok semasa dengan meletakkan tetikus (hover) di atas kulit buku di kedai.";
            }

            setAiMessages(prev => [...prev, { role: 'model', text: responseText }]);
            setAiChatLoading(false);
        }, 1000);
    };

    // UI Components (Refined timezone-master Theme)
    const Header = () => {
        const cartCount = cart.reduce((sum, item) => sum + item.quantity, 0);

        return (
            <header className="sticky top-0 z-50">
                <div className="header-area bg-black shadow-lg border-b border-white/5">
                    <div className="main-header py-3" style={{ padding: '12px 0' }}>
                        <div className="container-fluid px-4">
                            <div className="menu-wrapper d-flex align-items-center justify-content-between">
                                {/* Logo */}
                                <div className="logo flex-shrink-0 cursor-pointer transition-transform hover:scale-105" onClick={() => setView('catalog')}>
                                    <img src="/assets/img/logo/tarbiah-sentap-logo.png" width="90" height="auto" alt="Tarbiah Sentap" />
                                </div>

                                {/* Main Menu Nav */}
                                <div className="main-menu d-none d-lg-block">
                                    <nav>
                                        <ul id="navigation" className="d-flex align-items-center gap-2" style={{ listStyle: 'none', margin: 0, padding: 0 }}>
                                            <li>
                                                <button 
                                                    onClick={() => setView('catalog')}
                                                    className={`px-4 py-2.5 rounded-xl text-[11px] font-black uppercase tracking-widest transition-all duration-300 hover:scale-105 d-flex align-items-center gap-1.5 ${
                                                        view === 'catalog' 
                                                        ? 'bg-gradient-to-r from-[#ff2020] to-[#cf1b1b] text-white shadow-[0_6px_20px_rgba(255,32,32,0.3)] border border-transparent' 
                                                        : 'text-gray-400 hover:text-white hover:bg-white/5 border border-white/5 hover:border-white/10'
                                                    }`}
                                                    style={{ outline: 'none' }}
                                                >
                                                    <BookOpen className="w-3.5 h-3.5" />
                                                    Home
                                                </button>
                                            </li>
                                            <li>
                                                <button 
                                                    onClick={() => setView('catalog')}
                                                    className="px-4 py-2.5 rounded-xl text-[11px] font-black uppercase tracking-widest text-gray-400 hover:text-white hover:bg-white/5 border border-white/5 hover:border-white/10 transition-all duration-300 hover:scale-105 d-flex align-items-center gap-1.5"
                                                    style={{ outline: 'none', background: 'transparent' }}
                                                >
                                                    <Sparkles className="w-3.5 h-3.5" />
                                                    Shop
                                                </button>
                                            </li>
                                            {user && (
                                                <li>
                                                    <button 
                                                        onClick={() => setView('orders')}
                                                        className={`px-4 py-2.5 rounded-xl text-[11px] font-black uppercase tracking-widest transition-all duration-300 hover:scale-105 d-flex align-items-center gap-1.5 ${
                                                            view === 'orders' 
                                                            ? 'bg-gradient-to-r from-[#ff2020] to-[#cf1b1b] text-white shadow-[0_6px_20px_rgba(255,32,32,0.3)] border border-transparent' 
                                                            : 'text-gray-400 hover:text-white hover:bg-white/5 border border-white/5 hover:border-white/10'
                                                        }`}
                                                        style={{ outline: 'none' }}
                                                    >
                                                        <Package className="w-3.5 h-3.5" />
                                                        Orders
                                                    </button>
                                                </li>
                                            )}
                                            {user && user.role === 'admin' && (
                                                <li>
                                                    <button 
                                                        onClick={() => setView('admin')}
                                                        className={`px-4 py-2.5 rounded-xl text-[11px] font-black uppercase tracking-widest transition-all duration-300 hover:scale-105 d-flex align-items-center gap-1.5 ${
                                                            view === 'admin' 
                                                            ? 'bg-gradient-to-r from-[#ff2020] to-[#cf1b1b] text-white shadow-[0_6px_20px_rgba(255,32,32,0.3)] border border-transparent' 
                                                            : 'text-gray-400 hover:text-white hover:bg-white/5 border border-white/5 hover:border-white/10'
                                                        }`}
                                                        style={{ outline: 'none' }}
                                                    >
                                                        <LayoutDashboard className="w-3.5 h-3.5" />
                                                        Admin Core
                                                    </button>
                                                </li>
                                            )}
                                        </ul>
                                    </nav>
                                </div>

                                {/* Right Side Actions */}
                                <div className="header-right d-flex align-items-center gap-3">
                                    {user ? (
                                        <>
                                            <div className="d-none d-sm-flex flex-column text-end mr-2">
                                                <span className="text-[9px] font-black text-gray-500 uppercase tracking-widest">Akaun</span>
                                                <span className="text-white text-xs font-bold font-mono tracking-tight">{user.email.split('@')[0]}</span>
                                            </div>
                                            <button 
                                                onClick={() => setView('orders')}
                                                className={`w-10 h-10 rounded-xl d-flex align-items-center justify-content-center border transition-all duration-300 ${
                                                    view === 'orders' 
                                                    ? 'bg-[#ff2020] border-[#ff2020] text-white' 
                                                    : 'border-white/10 text-gray-400 hover:border-white/30 hover:text-white bg-white/5'
                                                }`}
                                                style={{ outline: 'none' }}
                                                title="Pesanan Saya"
                                            >
                                                <User className="w-4 h-4" />
                                            </button>
                                            <button 
                                                onClick={handleLogout}
                                                className="w-10 h-10 rounded-xl d-flex align-items-center justify-content-center border border-white/10 text-gray-400 hover:border-[#ff2020]/30 hover:bg-[#ff2020]/10 hover:text-[#ff2020] bg-white/5 transition-all duration-300"
                                                style={{ outline: 'none' }}
                                                title="Log Keluar"
                                            >
                                                <LogOut className="w-4 h-4" />
                                            </button>
                                        </>
                                    ) : (
                                        <button 
                                            onClick={() => setView('login')}
                                            className={`px-4 py-2 rounded-xl text-xs font-black uppercase tracking-widest transition-all duration-300 d-flex align-items-center gap-2 ${
                                                view === 'login' 
                                                ? 'bg-[#ff2020] text-white shadow-[0_4px_15px_rgba(255,32,32,0.4)]' 
                                                : 'border border-white/10 text-gray-400 hover:border-white/30 hover:text-white bg-white/5'
                                            }`}
                                            style={{ outline: 'none' }}
                                        >
                                            <User className="w-3.5 h-3.5" />
                                            Sign In
                                        </button>
                                    )}

                                    {/* Cart Icon Link */}
                                    <button 
                                        onClick={() => setView('cart')}
                                        className={`w-10 h-10 rounded-xl d-flex align-items-center justify-content-center border relative transition-all duration-300 ${
                                            view === 'cart' 
                                            ? 'bg-[#ff2020] border-[#ff2020] text-white shadow-[0_4px_15px_rgba(255,32,32,0.4)]' 
                                            : 'border-white/10 text-gray-400 hover:border-white/30 hover:text-white bg-white/5'
                                        }`}
                                        style={{ outline: 'none' }}
                                        title="Troli"
                                    >
                                        <ShoppingCart className="w-4 h-4" />
                                        {cartCount > 0 && (
                                            <span className="absolute -top-1.5 -right-1.5 bg-[#ff2020] text-white text-[9px] font-black w-5 h-5 rounded-full d-flex align-items-center justify-center border border-black shadow-lg">
                                                {cartCount}
                                            </span>
                                        )}
                                    </button>

                                    {/* Mobile Hamburger Toggle */}
                                    <button 
                                        onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                                        className="w-10 h-10 rounded-xl d-flex d-lg-none align-items-center justify-content-center border border-white/10 text-gray-400 hover:border-white/30 hover:text-white bg-white/5 transition-all duration-300"
                                        style={{ outline: 'none' }}
                                        title="Menu"
                                    >
                                        {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Mobile Navigation Drawer */}
                    {mobileMenuOpen && (
                        <div className="d-lg-none bg-black border-t border-white/5 px-4 py-3 animate-in slide-in-from-top duration-300">
                            <ul className="d-flex flex-column gap-2" style={{ listStyle: 'none', margin: 0, padding: 0 }}>
                                <li>
                                    <button 
                                        onClick={() => { setView('catalog'); setMobileMenuOpen(false); }}
                                        className={`w-full text-start px-4 py-3 rounded-xl text-xs font-black uppercase tracking-widest transition-all duration-300 ${
                                            view === 'catalog' 
                                            ? 'bg-[#ff2020] text-white shadow-[0_4px_15px_rgba(255,32,32,0.4)]' 
                                            : 'text-gray-400 hover:text-white hover:bg-white/10'
                                        }`}
                                        style={{ border: 'none', outline: 'none', background: view === 'catalog' ? '#ff2020' : 'transparent' }}
                                    >
                                        Home
                                    </button>
                                </li>
                                <li>
                                    <button 
                                        onClick={() => { setView('catalog'); setMobileMenuOpen(false); }}
                                        className="w-full text-start px-4 py-3 rounded-xl text-xs font-black uppercase tracking-widest text-gray-400 hover:text-white hover:bg-white/10 transition-all duration-300"
                                        style={{ border: 'none', outline: 'none', background: 'transparent' }}
                                    >
                                        Shop
                                    </button>
                                </li>
                                {user && (
                                    <li>
                                        <button 
                                            onClick={() => { setView('orders'); setMobileMenuOpen(false); }}
                                            className={`w-full text-start px-4 py-3 rounded-xl text-xs font-black uppercase tracking-widest transition-all duration-300 ${
                                                view === 'orders' 
                                                ? 'bg-[#ff2020] text-white shadow-[0_4px_15px_rgba(255,32,32,0.4)]' 
                                                : 'text-gray-400 hover:text-white hover:bg-white/10'
                                            }`}
                                            style={{ border: 'none', outline: 'none', background: view === 'orders' ? '#ff2020' : 'transparent' }}
                                        >
                                            Orders
                                        </button>
                                    </li>
                                )}
                                {user && user.role === 'admin' && (
                                    <li>
                                        <button 
                                            onClick={() => { setView('admin'); setMobileMenuOpen(false); }}
                                            className={`w-full text-start px-4 py-3 rounded-xl text-xs font-black uppercase tracking-widest transition-all duration-300 ${
                                                view === 'admin' 
                                                ? 'bg-[#ff2020] text-white shadow-[0_4px_15px_rgba(255,32,32,0.4)]' 
                                                : 'text-gray-400 hover:text-white hover:bg-white/10'
                                            }`}
                                            style={{ border: 'none', outline: 'none', background: view === 'admin' ? '#ff2020' : 'transparent' }}
                                        >
                                            Admin Core
                                        </button>
                                    </li>
                                )}
                            </ul>
                        </div>
                    )}
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
            <div className="text-center py-5 animate-in fade-in" style={{ minHeight: '60vh', display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center' }}>
                <Loader2 className="w-12 h-12 text-[#ff2020] animate-spin" />
                <p className="mt-3 text-muted font-bold tracking-widest text-xs uppercase">Menyusun koleksi perpustakaan...</p>
            </div>
        );

        return (
            <div className="animate-in fade-in bg-[#fafafa]">
                {/* Improvised Dark Premium Hero Slider */}
                <div className="relative overflow-hidden bg-[#0d0d0d] text-white py-16 sm:py-24 border-b border-white/5">
                    {/* Glowing highlight accents */}
                    <div className="absolute top-1/4 left-1/3 w-[300px] h-[300px] bg-[#ff2020]/15 rounded-full filter blur-[100px] pointer-events-none"></div>
                    <div className="absolute bottom-1/4 right-1/4 w-[250px] h-[250px] bg-[#f8c146]/10 rounded-full filter blur-[80px] pointer-events-none"></div>

                    <div className="container position-relative">
                        <div className="row align-items-center justify-content-between">
                            <div className="col-xl-7 col-lg-7 col-md-8 col-sm-12">
                                <div className="hero__caption relative z-10 text-center text-sm-start">
                                    <span className="text-[#ff2020] text-xs font-black tracking-[0.25em] uppercase mb-3 block">Buku Tarbiah & Dakwah Kreatif</span>
                                    <h1 className="text-4xl sm:text-6xl font-black tracking-tight leading-none mb-4 text-white" style={{ fontFamily: 'Josefin Sans, sans-serif' }}>
                                        TARBIAH SENTAP
                                    </h1>
                                    <p className="text-gray-400 text-sm sm:text-base leading-relaxed mb-4 max-w-xl">
                                        Membina pemikiran rohani kontemporari menerusi naskhah berkualiti tinggi, novel islamik, motivasi, dan persediaan akhir zaman demi melahirkan jati diri Muslim unggul.
                                    </p>
                                    <div className="hero__btn mt-4">
                                        <a href="#shop-section" className="inline-block bg-[#ff2020] text-white px-8 py-3.5 rounded-xl font-black text-xs uppercase tracking-widest shadow-lg shadow-[#ff2020]/30 hover:bg-white hover:text-black hover:-translate-y-1 transition-all duration-300 no-underline">
                                            Beli Sekarang
                                        </a>
                                    </div>
                                </div>
                            </div>
                            <div className="col-xl-4 col-lg-4 col-md-4 col-sm-12 d-none d-md-block text-center">
                                <div className="relative inline-block p-2 bg-gradient-to-tr from-[#ff2020] to-[#f8c146] rounded-3xl shadow-[0_25px_50px_rgba(255,32,32,0.15)] overflow-hidden transition-all duration-500 hover:scale-105">
                                    <img src="/assets/img/hero/adn.jpg" alt="Ustaz Adnin Roslan" style={{ width: '100%', maxHeight: '380px', objectFit: 'cover', borderRadius: '20px' }} />
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Shop Section */}
                <section id="shop-section" className="popular-items py-16" style={{ padding: '80px 0 50px 0' }}>
                    <div className="container">
                        {/* Section Header Title */}
                        <div className="row justify-content-center">
                            <div className="col-xl-8 col-lg-8 col-md-10">
                                <div className="section-tittle mb-5 text-center">
                                    <h2 className="text-3xl sm:text-4xl font-black text-gray-900 tracking-tight mb-2" style={{ fontFamily: 'Josefin Sans, sans-serif' }}>Koleksi Buku Utama</h2>
                                    <p className="text-gray-500 text-sm sm:text-base max-w-xl mx-auto">Terokai barisan buku tarbiah sentap terbaik dari novel inspiratif hingga buku panduan rohani harian.</p>
                                </div>
                            </div>
                        </div>

                        {/* Search & Filter Bar */}
                        <div className="row mb-5 align-items-center justify-content-between g-3 px-2">
                            <div className="col-lg-4 col-md-6 col-sm-12">
                                <div className="relative">
                                    <input 
                                        type="text"
                                        placeholder="Cari buku atau penulis..."
                                        value={search}
                                        onChange={(e) => setSearch(e.target.value)}
                                        className="w-full pl-5 pr-10 py-3 rounded-xl border border-gray-200 focus:border-[#ff2020] focus:ring-1 focus:ring-[#ff2020] outline-none transition-all duration-300 text-sm bg-white shadow-sm"
                                    />
                                </div>
                            </div>
                            <div className="col-lg-6 col-md-6 col-sm-12 d-flex justify-content-start justify-content-md-end gap-2 flex-wrap">
                                <select 
                                    value={genre}
                                    onChange={(e) => setGenre(e.target.value)}
                                    className="px-4 py-3 rounded-xl border border-gray-200 outline-none cursor-pointer bg-white text-sm shadow-sm transition-all focus:border-[#ff2020]"
                                >
                                    {genres.map(g => <option key={g} value={g}>{g}</option>)}
                                </select>
                                <select 
                                    value={sortBy}
                                    onChange={(e) => setSortBy(e.target.value)}
                                    className="px-4 py-3 rounded-xl border border-gray-200 outline-none cursor-pointer bg-white text-sm shadow-sm transition-all focus:border-[#ff2020]"
                                >
                                    <option value="featured">Pilihan Utama (Featured)</option>
                                    <option value="price-asc">Harga: Rendah ke Tinggi</option>
                                    <option value="price-desc">Harga: Tinggi ke Rendah</option>
                                    <option value="rating">Penilaian Tertinggi</option>
                                </select>
                            </div>
                        </div>

                        {/* Books Grid */}
                        {filteredBooks.length === 0 ? (
                            <div className="text-center py-5 text-gray-400 font-bold">Tiada buku ditemui padanan carian anda.</div>
                        ) : (
                            <div className="row g-4 px-2">
                                {filteredBooks.map((book, index) => (
                                     <div 
                                         key={book.id} 
                                         className="col-6 col-md-4 col-lg-3 mb-4 sm:mb-5 animate-in fade-in" 
                                         style={{ animationDelay: `${index * 35}ms` }}
                                         onMouseEnter={(e) => {
                                             const rect = e.currentTarget.getBoundingClientRect();
                                             const screenWidth = window.innerWidth;
                                             const cardCenter = rect.left + rect.width / 2;
                                             const side = cardCenter > screenWidth / 2 ? 'left' : 'right';
                                             setPopupPlacements(prev => ({ ...prev, [book.id]: side }));
                                         }}
                                     >
                                         <div className="group relative bg-white rounded-2xl shadow-[0_8px_30px_rgb(0,0,0,0.03)] hover:shadow-[0_25px_50px_rgba(255,32,32,0.08)] p-3 border border-gray-100/50 hover:border-[#ff2020]/15 transition-all duration-500 hover:-translate-y-2 overflow-visible flex flex-col h-full">
                                             {/* Book Cover Container */}
                                             <div className="popular-img relative h-56 sm:h-72 overflow-hidden rounded-xl bg-gradient-to-b from-[#fbfbfb] to-[#f5f5f7] border border-gray-100 flex items-center justify-center p-3 group-hover:shadow-[inset_0_0_20px_rgba(0,0,0,0.015)] transition-all duration-500">
                                                 <img 
                                                     src={book.cover} 
                                                     alt={book.title} 
                                                     className="max-h-[85%] w-auto object-contain transition-transform duration-700 ease-out group-hover:scale-105" 
                                                     style={{ filter: 'drop-shadow(0 12px 18px rgba(0,0,0,0.12))' }}
                                                 />
                                                 
                                                 {/* Glassmorphic Bestseller Badge */}
                                                 {book.rating >= 4.8 && (
                                                     <span className="absolute top-2.5 right-2.5 bg-[#f8c146] text-black font-black uppercase text-[8px] tracking-widest px-2.5 py-1 rounded-full shadow-md z-10">
                                                         Terlaris
                                                     </span>
                                                 )}

                                                 {/* Glassmorphic Rating Badge */}
                                                 <div className="absolute bottom-2.5 left-2.5 bg-black/60 backdrop-blur-md border border-white/10 text-[#f8c146] px-2.5 py-1 rounded-lg text-[9px] font-black tracking-wider flex items-center gap-1 shadow-md z-10">
                                                     ★ {book.rating}
                                                 </div>

                                                 {/* Stock Badge */}
                                                 <div className="absolute top-2.5 left-2.5 bg-black/60 backdrop-blur-md border border-white/10 text-white px-2.5 py-1 rounded-lg text-[8px] font-black tracking-wider shadow-md z-10">
                                                     STOK: {book.stock}
                                                 </div>

                                                 {/* Quick Add overlay */}
                                                 <div className="absolute inset-0 bg-black/45 backdrop-blur-[1.5px] opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center cursor-pointer z-20"
                                                      onClick={() => addToCart(book)}>
                                                     <button className="bg-gradient-to-r from-[#ff2020] to-[#cf1b1b] text-white px-3.5 py-2 rounded-xl text-[9px] font-black uppercase tracking-widest shadow-lg shadow-[#ff2020]/25 transform translate-y-3 group-hover:translate-y-0 transition-all duration-300 hover:scale-105 border-0 outline-none">
                                                         + Masuk Troli
                                                     </button>
                                                 </div>
                                             </div>

                                             {/* Info & Meta Details */}
                                             <div className="popular-caption flex flex-col flex-grow pt-4">
                                                 <span className="text-[9px] font-black uppercase text-[#ff2020] tracking-widest block mb-1">{book.genre}</span>
                                                 <h3 className="text-xs sm:text-sm font-bold text-[#ff2020] line-clamp-2 min-h-[36px] sm:min-h-[40px] mb-2 leading-snug hover:text-[#b30000] transition-colors" style={{ fontFamily: 'Josefin Sans, sans-serif' }}>
                                                     <a href="#" onClick={(e) => { e.preventDefault(); setSummaryModal({ isOpen: true, book, summary: getBookSummary(book), loading: false }); }} className="no-underline text-[#ff2020] hover:text-[#b30000]">{book.title}</a>
                                                 </h3>
                                                 <p className="text-[10px] text-gray-400 font-bold uppercase tracking-wider mb-3 leading-none truncate">Penulis: {book.author}</p>
                                                 
                                                 <div className="d-flex justify-content-between align-items-center mt-auto pt-2 border-t border-gray-50/50">
                                                     <span className="font-extrabold text-sm sm:text-base text-gray-900 font-mono">RM{book.price.toFixed(2)}</span>
                                                     <button 
                                                         onClick={() => addToCart(book)}
                                                         className="px-3 py-1.5 bg-[#ff2020] text-white hover:bg-black hover:text-[#ff2020] border border-transparent hover:border-[#ff2020] rounded-xl text-[10px] font-black uppercase tracking-wider transition-all duration-300"
                                                         style={{ outline: 'none' }}
                                                     >
                                                         + Troli
                                                     </button>
                                                 </div>
                                             </div>

                                             {/* Hover Detail Popover (Displays on the side: left or right depending on viewport center calculation) */}
                                             <div className={`absolute top-0 hidden md:flex flex-col w-72 bg-white/98 dark:bg-zinc-950/98 backdrop-blur-md border border-gray-200 dark:border-zinc-800 p-5 rounded-2xl shadow-[0_20px_50px_rgba(0,0,0,0.15)] z-50 opacity-0 pointer-events-none group-hover:opacity-100 group-hover:pointer-events-auto transition-all duration-300 transform scale-95 group-hover:scale-100 ${
                                                 (popupPlacements[book.id] || (index % 2 === 0 ? 'right' : 'left')) === 'right' 
                                                     ? 'left-full ml-4 right-auto mr-0' 
                                                     : 'right-full mr-4 left-auto ml-0'
                                             }`}>
                                                 <span className="text-[9px] font-black uppercase text-[#ff2020] tracking-widest block mb-1">{book.genre}</span>
                                                 <h4 className="text-sm font-bold text-gray-900 dark:text-white leading-tight mb-1.5" style={{ fontFamily: 'Josefin Sans, sans-serif' }}>{book.title}</h4>
                                                 <p className="text-[10px] text-gray-500 font-bold uppercase tracking-wider mb-3 leading-none">Penulis: {book.author}</p>
                                                 
                                                 <div className="border-t border-gray-100 dark:border-zinc-800 pt-3 mt-1">
                                                     <h5 className="text-[9px] font-black text-gray-400 uppercase tracking-widest mb-2">Sinopsis</h5>
                                                     <p className="text-xs text-gray-600 dark:text-gray-300 leading-relaxed font-medium line-clamp-[8]">
                                                         {getBookSummary(book)}
                                                     </p>
                                                 </div>

                                                 <div className="mt-4 pt-3 border-t border-gray-100 dark:border-zinc-800 flex justify-between items-center">
                                                     <span className="font-extrabold text-sm text-gray-900 dark:text-white font-mono">RM{book.price.toFixed(2)}</span>
                                                     <span className="text-[9px] font-bold text-[#ff2020] uppercase tracking-wider bg-[#ff2020]/10 px-2 py-0.5 rounded-md">
                                                         STOK: {book.stock}
                                                     </span>
                                                 </div>
                                             </div>
                                         </div>
                                     </div>
                                ))}
                            </div>
                        )}
                    </div>
                </section>

                {/* Gallery Area */}
                <div className="gallery-area" style={{ padding: '50px 0' }}>
                    <div className="container-fluid p-0 fix">
                        <div className="row">
                            <div className="col-xl-6 col-lg-4 col-md-6 col-sm-6">
                                <div className="single-gallery mb-30" style={{ height: '350px', backgroundImage: 'url(/assets/img/books/17-Tuhan-Aku-Ingin-Jumpa-Nabi.jpg)', backgroundSize: 'cover', backgroundPosition: 'center', borderRadius: '10px', margin: '10px' }}></div>
                            </div>
                            <div className="col-xl-3 col-lg-4 col-md-6 col-sm-6">
                                <div className="single-gallery mb-30" style={{ height: '350px', backgroundImage: 'url(/assets/img/books/17-Tuhan-Aku-Ingin-Jumpa-Nabi.jpg)', backgroundSize: 'cover', backgroundPosition: 'center', borderRadius: '10px', margin: '10px' }}></div>
                            </div>
                            <div className="col-xl-3 col-lg-4 col-md-12">
                                <div className="row">
                                    <div className="col-xl-12 col-lg-12 col-md-6 col-sm-6">
                                        <div className="single-gallery mb-30" style={{ height: '165px', backgroundImage: 'url(/assets/img/books/26-Novel-Ajari-Aku-Tentang-Cinta.jpg)', backgroundSize: 'cover', backgroundPosition: 'center', borderRadius: '10px', margin: '10px' }}></div>
                                    </div>
                                    <div className="col-xl-12 col-lg-12 col-md-6 col-sm-6">
                                        <div className="single-gallery mb-30" style={{ height: '165px', backgroundImage: 'url(/assets/img/books/42-Ajari-Aku-Tentang-Rindu.jpg)', backgroundSize: 'cover', backgroundPosition: 'center', borderRadius: '10px', margin: '10px' }}></div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        );
    };

    const CartView = () => {
        const subtotal = cart.reduce((sum, item) => sum + (item.book.price * item.quantity), 0);
        const tax = subtotal * 0.08;
        const total = subtotal + tax;

        if (cart.length === 0) {
            return (
                <div className="container py-5 text-center">
                    <div className="p-5 bg-white rounded-lg border max-w-md mx-auto" style={{ boxShadow: '0 5px 25px rgba(0,0,0,0.05)' }}>
                        <ShoppingCart className="w-16 h-16 text-muted mx-auto mb-4" />
                        <h3 className="mb-2" style={{ fontFamily: 'Josefin Sans, sans-serif', fontWeight: 700 }}>Troli Anda Kosong</h3>
                        <p className="text-muted text-sm mb-4">Tambahkan buku bermotivasi dan novel kegemaran anda ke dalam troli.</p>
                        <button onClick={() => setView('catalog')} className="btn text-white px-4 py-3" style={{ backgroundColor: '#ff2020', fontWeight: 'bold', textTransform: 'uppercase', borderRadius: '8px' }}>Kembali Membeli Belah</button>
                    </div>
                </div>
            );
        }

        return (
            <div className="container py-5 animate-in fade-in" style={{ color: '#1a1a1a' }}>
                <h1 className="mb-5" style={{ fontFamily: 'Josefin Sans, sans-serif', fontWeight: 700 }}>
                    Troli <span style={{ color: '#ff2020' }}>Pembelian</span>
                </h1>
                <div className="row">
                    <div className="col-lg-8 mb-4">
                        <div className="bg-white rounded-lg border p-4 shadow-sm">
                            <div className="table-responsive">
                                <table className="table align-middle">
                                    <thead>
                                        <tr className="text-uppercase text-muted font-bold text-xs">
                                            <th>Buku</th>
                                            <th>Harga</th>
                                            <th>Kuantiti</th>
                                            <th className="text-end">Jumlah</th>
                                            <th></th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {cart.map(item => (
                                            <tr key={item.book.id}>
                                                <td>
                                                    <div className="d-flex align-items-center gap-3">
                                                        <img src={item.book.cover} className="rounded border" style={{ width: '45px', height: '65px', objectFit: 'cover' }} />
                                                        <div>
                                                            <p className="mb-0 font-bold" style={{ fontSize: '13px' }}>{item.book.title}</p>
                                                            <p className="text-muted mb-0" style={{ fontSize: '11px' }}>{item.book.author}</p>
                                                        </div>
                                                    </div>
                                                </td>
                                                <td className="font-bold" style={{ fontSize: '13px' }}>RM{item.book.price.toFixed(2)}</td>
                                                <td>
                                                    <div className="d-flex align-items-center border rounded-2 bg-light" style={{ width: 'fit-content' }}>
                                                        <button onClick={() => updateQuantity(item.book.id, -1)} className="btn btn-sm px-2 border-0" style={{ fontWeight: 'bold' }}>-</button>
                                                        <span className="px-3 text-xs font-bold">{item.quantity}</span>
                                                        <button onClick={() => updateQuantity(item.book.id, 1)} className="btn btn-sm px-2 border-0" style={{ fontWeight: 'bold' }}>+</button>
                                                    </div>
                                                </td>
                                                <td className="text-end font-bold" style={{ fontSize: '13px' }}>RM{(item.book.price * item.quantity).toFixed(2)}</td>
                                                <td>
                                                    <button onClick={() => removeFromCart(item.book.id)} className="btn text-danger p-1"><Trash2 className="w-4 h-4" /></button>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    </div>
                    <div className="col-lg-4">
                        <div className="bg-white rounded-lg border p-4 shadow-sm" style={{ color: '#1a1a1a' }}>
                            <h3 className="mb-4 font-bold" style={{ fontFamily: 'Josefin Sans, sans-serif' }}>Ringkasan Bil</h3>
                            <div className="d-flex justify-content-between mb-2">
                                <span>Subjumlah</span>
                                <span>RM{subtotal.toFixed(2)}</span>
                            </div>
                            <div className="d-flex justify-content-between mb-2">
                                <span>Kos Penghantaran</span>
                                <span className="text-success">PERCUMA</span>
                            </div>
                            <div className="d-flex justify-content-between mb-3">
                                <span>Cukai Perkhidmatan (8%)</span>
                                <span>RM{tax.toFixed(2)}</span>
                            </div>
                            <hr />
                            <div className="d-flex justify-content-between mb-4" style={{ fontSize: '18px', fontWeight: 'bold' }}>
                                <span>Jumlah Keseluruhan</span>
                                <span style={{ color: '#ff2020' }}>RM{total.toFixed(2)}</span>
                            </div>
                            <button onClick={handleCheckout} className="btn w-full py-3" style={{ backgroundColor: '#ff2020', color: 'white', fontWeight: 'bold', textTransform: 'uppercase', borderRadius: '8px' }}>Seterusnya Ke Pembayaran</button>
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
            <div className="relative min-h-[80vh] d-flex align-items-center justify-content-center py-12 px-4 overflow-hidden bg-[#fafafa]">
                {/* Decorative Glowing Blobs */}
                <div className="absolute top-1/4 left-1/4 w-[250px] h-[250px] bg-[#ff2020]/10 rounded-full filter blur-[80px] pointer-events-none"></div>
                <div className="absolute bottom-1/4 right-1/4 w-[200px] h-[200px] bg-[#f8c146]/15 rounded-full filter blur-[70px] pointer-events-none"></div>

                <div className="w-full max-w-md relative z-10 animate-in fade-in zoom-in-95 duration-500">
                    <div className="bg-white rounded-3xl border border-gray-100 p-8 sm:p-10 shadow-[0_20px_50px_rgba(0,0,0,0.04)] hover:shadow-[0_25px_60px_rgba(255,32,32,0.05)] transition-all duration-500">
                        {/* Logo & Header */}
                        <div className="text-center mb-8">
                            <div className="inline-flex items-center justify-content-center w-16 h-16 rounded-2xl bg-[#ff2020]/5 mb-4 border border-[#ff2020]/10 text-[#ff2020]">
                                <User className="w-7 h-7" />
                            </div>
                            <h2 className="text-2xl font-black text-gray-900 tracking-tight" style={{ fontFamily: 'Josefin Sans, sans-serif' }}>
                                Log Masuk <span className="text-[#ff2020]">Akaun</span>
                            </h2>
                            <p className="text-gray-400 text-xs mt-2 max-w-xs mx-auto">
                                Selamat kembali! Log masuk untuk mengakses profil dan membuat pesanan anda.
                            </p>
                        </div>

                        {/* Login Form */}
                        <form onSubmit={onSubmit} className="space-y-4">
                            <div className="space-y-1.5">
                                <label className="text-[10px] font-black uppercase tracking-wider text-gray-400 block">Alamat E-mel</label>
                                <input 
                                    type="email" 
                                    className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-[#ff2020] focus:ring-1 focus:ring-[#ff2020] outline-none text-sm transition-all duration-300"
                                    placeholder="nama@contoh.com"
                                    value={email}
                                    onChange={e => setEmail(e.target.value)}
                                    required 
                                />
                            </div>
                            
                            <div className="space-y-1.5 pt-2">
                                <label className="text-[10px] font-black uppercase tracking-wider text-gray-400 block">Kata Laluan</label>
                                <input 
                                    type="password" 
                                    className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-[#ff2020] focus:ring-1 focus:ring-[#ff2020] outline-none text-sm transition-all duration-300"
                                    placeholder="Sila masukkan kata laluan"
                                    value={password}
                                    onChange={e => setPassword(e.target.value)}
                                    required 
                                />
                            </div>

                            <div className="pt-4">
                                <button 
                                    type="submit" 
                                    className="w-full py-3.5 bg-gradient-to-r from-[#ff2020] to-[#cf1b1b] text-white hover:scale-[1.02] active:scale-[0.98] font-black text-xs uppercase tracking-widest rounded-xl transition-all duration-300 shadow-lg shadow-[#ff2020]/20"
                                    style={{ border: 'none', outline: 'none' }}
                                >
                                    Masuk Akaun
                                </button>
                            </div>
                        </form>

                        {/* Footer Action */}
                        <div className="mt-8 text-center pt-4 border-t border-gray-50">
                            <button 
                                onClick={() => setView('register')}
                                className="text-xs font-black text-[#ff2020] hover:text-black uppercase tracking-wider transition-colors bg-transparent border-0 p-0"
                                style={{ outline: 'none' }}
                            >
                                Belum ada akaun? Daftar Sekarang
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        );
    };

    const RegisterView = () => {
        const [email, setEmail] = useState('');
        const [password, setPassword] = useState('');
        const [confirmPassword, setConfirmPassword] = useState('');

        const onSubmit = (e) => {
            e.preventDefault();
            if (password !== confirmPassword) {
                addToast('Passwords do not match', 'error');
                return;
            }
            if (password.length < 6) {
                addToast('Password must be at least 6 characters', 'error');
                return;
            }
            handleSignup(email, password);
        };

        return (
            <div className="container py-5 animate-in zoom-in" style={{ color: '#1a1a1a' }}>
                <div className="row justify-content-center">
                    <div className="col-md-6 col-lg-5">
                        <div className="p-5 bg-white shadow-lg rounded-lg border" style={{ boxShadow: '0 5px 25px rgba(0,0,0,0.05)' }}>
                            <div className="text-center mb-4">
                                <div className="bg-[#ff2020]/10 w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-3">
                                    <User className="w-8 h-8 text-[#ff2020]" />
                                </div>
                                <h2 style={{ fontFamily: 'Josefin Sans, sans-serif', fontWeight: 700 }}>Daftar <span style={{ color: '#ff2020' }}>Akaun Baru</span></h2>
                                <p className="text-muted" style={{ fontSize: '12px' }}>Daftar akaun untuk menikmati pengalaman pembelian yang lancar.</p>
                            </div>
                            
                            <form onSubmit={onSubmit} className="space-y-4">
                                <div className="form-group mb-3">
                                    <label className="form-label text-xs font-bold text-muted uppercase tracking-wider">Alamat E-mel</label>
                                    <input 
                                        type="email" 
                                        className="form-control py-3"
                                        placeholder="nama@contoh.com"
                                        value={email}
                                        onChange={e => setEmail(e.target.value)}
                                        style={{ borderRadius: '8px', fontSize: '13px' }}
                                        required 
                                    />
                                </div>
                                <div className="form-group mb-3">
                                    <label className="form-label text-xs font-bold text-muted uppercase tracking-wider">Kata Laluan</label>
                                    <input 
                                        type="password" 
                                        className="form-control py-3"
                                        placeholder="Minima 6 aksara"
                                        value={password}
                                        onChange={e => setPassword(e.target.value)}
                                        style={{ borderRadius: '8px', fontSize: '13px' }}
                                        required 
                                    />
                                </div>
                                <div className="form-group mb-4">
                                    <label className="form-label text-xs font-bold text-muted uppercase tracking-wider">Sahkan Kata Laluan</label>
                                    <input 
                                        type="password" 
                                        className="form-control py-3"
                                        placeholder="Sahkan kata laluan anda"
                                        value={confirmPassword}
                                        onChange={e => setConfirmPassword(e.target.value)}
                                        style={{ borderRadius: '8px', fontSize: '13px' }}
                                        required 
                                    />
                                </div>
                                
                                <button type="submit" className="btn w-full py-3 text-white" style={{ backgroundColor: '#ff2020', fontWeight: 'bold', textTransform: 'uppercase', borderRadius: '8px', fontSize: '14px' }}>
                                    Daftar Akaun
                                </button>
                            </form>
                            
                            <div className="mt-4 text-center">
                                <button 
                                    onClick={() => setView('login')}
                                    className="btn btn-link text-decoration-none"
                                    style={{ fontSize: '12px', color: '#ff2020', fontWeight: 'bold' }}
                                >
                                    Sudah ada akaun? Log Masuk
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        );
    };

    const TwoFAView = () => {
        const [otp, setOtp] = useState('');
        return (
            <div className="container py-5 animate-in zoom-in" style={{ color: '#1a1a1a' }}>
                <div className="row justify-content-center">
                    <div className="col-md-5">
                        <div className="p-5 bg-white text-center" style={{ borderRadius: '10px', border: '1px solid #eee', boxShadow: '0 5px 25px rgba(0,0,0,0.05)' }}>
                            <div className="mb-4" style={{ fontSize: '3rem', color: '#ff2020' }}>🔒</div>
                            <h2 className="mb-2" style={{ fontFamily: 'Josefin Sans, sans-serif', fontWeight: 700 }}>Pengesahan Vault</h2>
                            <p className="text-muted mb-4" style={{ fontSize: '13px' }}>Akaun anda memerlukan pengesahan 2-Faktor. Sila masukkan kod OTP dari aplikasi authenticator anda.</p>
                            <input 
                                type="text" 
                                className="form-control text-center py-3 mb-4 font-mono font-bold tracking-widest"
                                placeholder="000 000"
                                value={otp}
                                onChange={e => setOtp(e.target.value)}
                                style={{ fontSize: '20px', borderRadius: '8px' }}
                                maxLength={6}
                            />
                            <button 
                                onClick={() => handleVerify2FA(otp)}
                                className="btn w-full py-3" 
                                style={{ backgroundColor: '#ff2020', color: 'white', fontWeight: 'bold', textTransform: 'uppercase', borderRadius: '8px' }}
                            >
                                Sahkan Akses
                            </button>
                            <p className="mt-3 text-muted" style={{ fontSize: '11px' }}>Petunjuk: gunakan 123456</p>
                        </div>
                    </div>
                </div>
            </div>
        );
    };

    const CheckoutView = () => {
        return (
            <div className="container py-5 animate-in slide-in-from-right-8" style={{ color: '#1a1a1a' }}>
                <div className="row">
                    <div className="col-lg-7 mb-4">
                        <div className="bg-white rounded-lg border p-4 shadow-sm">
                            <h3 className="mb-4 font-bold" style={{ fontFamily: 'Josefin Sans, sans-serif' }}>Maklumat Penghantaran</h3>
                            <div className="form-group mb-3">
                                <label className="form-label text-xs font-bold text-muted uppercase tracking-wider">Alamat Penuh</label>
                                <textarea 
                                    className="form-control py-3"
                                    placeholder="Masukkan alamat penghantaran lengkap anda"
                                    value={billingAddress}
                                    onChange={e => setBillingAddress(e.target.value)}
                                    style={{ borderRadius: '8px', fontSize: '13px' }}
                                    rows="3"
                                    required
                                />
                            </div>

                            <h3 className="my-4 font-bold" style={{ fontFamily: 'Josefin Sans, sans-serif' }}>Maklumat Pembayaran</h3>
                            <div className="form-group mb-3">
                                <label className="form-label text-xs font-bold text-muted uppercase tracking-wider">Nombor Kad Kredit</label>
                                <div className="input-group">
                                    <span className="input-group-text bg-white"><CreditCard className="w-4 h-4 text-muted" /></span>
                                    <input 
                                        type="text" 
                                        className="form-control py-3"
                                        placeholder="4111 1111 1111 1111"
                                        value={cardNumber}
                                        onChange={e => setCardNumber(e.target.value)}
                                        style={{ borderRadius: '0 8px 8px 0', fontSize: '13px' }}
                                        required
                                    />
                                </div>
                            </div>
                            <div className="row">
                                <div className="col-6 mb-3">
                                    <label className="form-label text-xs font-bold text-muted uppercase tracking-wider">Tarikh Tamat</label>
                                    <input 
                                        type="text" 
                                        className="form-control py-3"
                                        placeholder="MM/YY"
                                        value={cardExpiry}
                                        onChange={e => setCardExpiry(e.target.value)}
                                        style={{ borderRadius: '8px', fontSize: '13px' }}
                                        required
                                    />
                                </div>
                                <div className="col-6 mb-3">
                                    <label className="form-label text-xs font-bold text-muted uppercase tracking-wider">CVC / CVV</label>
                                    <input 
                                        type="text" 
                                        className="form-control py-3"
                                        placeholder="123"
                                        value={cardCvc}
                                        onChange={e => setCardCvc(e.target.value)}
                                        style={{ borderRadius: '8px', fontSize: '13px' }}
                                        required
                                    />
                                </div>
                            </div>
                            <p className="text-muted text-[11px] mb-0 mt-2">Simulasi ini menyokong sebarang data dummy untuk kelulusan kad.</p>
                        </div>
                    </div>
                    <div className="col-lg-5">
                        <div className="bg-white rounded-lg border p-4 shadow-sm" style={{ color: '#1a1a1a' }}>
                            <h3 className="mb-4 font-bold" style={{ fontFamily: 'Josefin Sans, sans-serif' }}>Troli Anda</h3>
                            <div className="mb-4 max-h-[220px] overflow-y-auto pr-2">
                                {cart.map(item => (
                                    <div key={item.book.id} className="d-flex gap-3 align-items-center mb-3">
                                        <img src={item.book.cover} className="rounded border" style={{ width: '45px', height: '65px', objectFit: 'cover' }} />
                                        <div>
                                            <p className="mb-0 font-bold" style={{ fontSize: '13px', lineHeight: '1.2' }}>{item.book.title}</p>
                                            <p className="text-muted mb-0" style={{ fontSize: '11px' }}>{item.quantity} unit • RM{(item.book.price * item.quantity).toFixed(2)}</p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                            <div className="h-px bg-gray-200 my-3"></div>
                            <div className="d-flex justify-content-between mb-4" style={{ fontSize: '18px', fontWeight: 'bold' }}>
                                <span>Jumlah Bil</span>
                                <span style={{ color: '#ff2020' }}>RM{(cart.reduce((sum, item) => sum + (item.book.price * item.quantity), 0) * 1.08).toFixed(2)}</span>
                            </div>
                            <button onClick={processPayment} className="btn w-full py-3 text-white" style={{ backgroundColor: '#ff2020', fontWeight: 'bold', textTransform: 'uppercase', borderRadius: '8px' }}>Buat Pembayaran Selamat</button>
                        </div>
                    </div>
                </div>
            </div>
        );
    };

    const PaymentGatewayView = () => {
        const [processing, setProcessing] = useState(false);
        const total = cart.reduce((sum, item) => sum + (item.book.price * item.quantity), 0) * 1.08;

        const handleOutcome = (status) => {
            setProcessing(true);
            setTimeout(() => {
                setProcessing(false);
                completeTransaction(status);
            }, 2000);
        };

        const maskedCard = cardNumber ? `•••• •••• •••• ${cardNumber.slice(-4)}` : '•••• •••• •••• 1234';

        return (
            <div className="max-w-md mx-auto px-4 py-16 animate-in zoom-in duration-300" style={{ color: '#1a1a1a' }}>
                <div className="bg-white border border-gray-200 rounded-[2rem] p-8 sm:p-10 shadow-lg relative overflow-hidden">
                    <div className="text-center mb-8 border-b border-gray-100 pb-6">
                        <div className="bg-[#ff2020]/10 w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-4">
                            <ShieldCheck className="w-8 h-8 text-[#ff2020] animate-pulse" />
                        </div>
                        <h2 className="text-2xl font-black tracking-tight" style={{ fontFamily: 'Josefin Sans, sans-serif' }}>
                            Gerbang <span style={{ color: '#ff2020' }}>Pembayaran Selamat</span>
                        </h2>
                        <p className="text-[9px] text-muted font-bold uppercase tracking-widest mt-1">Simulasi Bank Authorization Gateway</p>
                    </div>

                    {processing ? (
                        <div className="text-center py-12 flex flex-col items-center justify-center gap-4">
                            <Loader2 className="w-12 h-12 text-[#ff2020] animate-spin" />
                            <p className="text-sm text-gray-600 font-bold uppercase tracking-widest animate-pulse">Menghubungi Rangkaian Bank...</p>
                            <p className="text-[10px] text-muted uppercase tracking-wide">Mengesahkan token transaksi selamat</p>
                        </div>
                    ) : (
                        <div className="space-y-8">
                            <div className="bg-gradient-to-br from-gray-900 to-black rounded-3xl p-6 shadow-inner relative overflow-hidden text-white">
                                <div className="absolute top-4 right-6 text-white/10 font-black text-4xl italic">VISA</div>
                                <div className="w-10 h-8 bg-white/10 rounded-lg mb-8 flex items-center justify-center shadow-inner">
                                    <div className="w-6 h-5 bg-white/20 rounded-md"></div>
                                </div>
                                <div className="font-mono text-lg tracking-widest mb-6 text-white">{maskedCard}</div>
                                <div className="flex justify-between items-center text-[10px] text-gray-400 font-bold uppercase tracking-widest">
                                    <div>
                                        <p className="text-[8px] opacity-60 mb-0.5 text-gray-400">Pemilik Kad</p>
                                        <p className="text-white mb-0">{user?.name || 'Pelanggan'}</p>
                                    </div>
                                    <div className="text-right">
                                        <p className="text-[8px] opacity-60 mb-0.5 text-gray-400">Tamat Tempoh</p>
                                        <p className="text-white mb-0">{cardExpiry || 'MM/YY'}</p>
                                    </div>
                                </div>
                            </div>

                            <div className="bg-light p-4 rounded-2xl border border-gray-200 space-y-3">
                                <div className="flex justify-between items-center text-[11px] text-gray-600 font-bold uppercase tracking-widest">
                                    <span>ID Merchant</span>
                                    <span className="text-dark font-black">TS-MERCHANT-89</span>
                                </div>
                                <div className="flex justify-between items-center text-[11px] text-gray-600 font-bold uppercase tracking-widest">
                                    <span>Sufiks Kad</span>
                                    <span className="text-dark font-black">{cardNumber.slice(-4) || '1234'}</span>
                                </div>
                                <div className="h-px bg-gray-200 my-2"></div>
                                <div className="flex justify-between items-center">
                                    <span className="text-[11px] text-gray-700 font-bold uppercase tracking-widest">Jumlah Bil</span>
                                    <span className="text-xl font-black" style={{ color: '#ff2020' }}>RM{total.toFixed(2)}</span>
                                </div>
                            </div>

                            <div className="space-y-4 pt-4 border-t border-gray-100">
                                <label className="block text-center text-[9px] font-bold text-gray-500 uppercase tracking-[0.2em] mb-4">Pilih Hasil Simulasi</label>
                                <div className="row g-3">
                                    <div className="col-6">
                                        <button 
                                            onClick={() => handleOutcome('success')}
                                            className="btn w-full py-3"
                                            style={{ backgroundColor: '#28a745', color: 'white', fontWeight: 'bold', fontSize: '12px', textTransform: 'uppercase', borderRadius: '8px', border: 'none' }}
                                        >
                                            <Check className="w-4 h-4 inline mr-1" /> Berjaya
                                        </button>
                                    </div>
                                    <div className="col-6">
                                        <button 
                                            onClick={() => handleOutcome('fail')}
                                            className="btn w-full py-3"
                                            style={{ backgroundColor: '#ff2020', color: 'white', fontWeight: 'bold', fontSize: '12px', textTransform: 'uppercase', borderRadius: '8px', border: 'none' }}
                                        >
                                            <X className="w-4 h-4 inline mr-1" /> Gagal
                                        </button>
                                    </div>
                                </div>
                                <button 
                                    onClick={() => setView('checkout')}
                                    className="btn btn-link w-full text-center text-[11px] text-decoration-none mt-3"
                                    style={{ color: '#666', fontWeight: 'bold', textTransform: 'uppercase' }}
                                >
                                    Batal & Kembali
                                </button>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        );
    };

    const OrdersView = () => (
        <div className="container py-5 animate-in fade-in duration-500" style={{ color: '#1a1a1a' }}>
            <h1 className="mb-4" style={{ fontFamily: 'Josefin Sans, sans-serif', fontWeight: 700 }}>
                Sejarah <span style={{ color: '#ff2020' }}>Pesanan</span>
            </h1>
            {orders.length === 0 ? (
                <div className="p-5 bg-white text-center rounded-lg border" style={{ boxShadow: '0 5px 25px rgba(0,0,0,0.05)' }}>
                    <p className="text-muted mb-0" style={{ fontSize: '13px', fontWeight: 'bold' }}>Tiada sejarah transaksi dijumpai.</p>
                </div>
            ) : (
                <div className="space-y-4">
                    {orders.map(order => (
                        <div key={order.id} className="p-4 bg-white rounded-lg border mb-4" style={{ boxShadow: '0 5px 25px rgba(0,0,0,0.05)' }}>
                            <div className="d-flex justify-content-between align-items-center pb-3 mb-3 border-bottom border-gray-100">
                                <div>
                                    <p className="text-muted mb-0" style={{ fontSize: '10px', fontWeight: 'bold', textTransform: 'uppercase', trackingSpacing: '1px' }}>Transaksi Pesanan</p>
                                    <h4 className="mb-0" style={{ fontFamily: 'Josefin Sans, sans-serif', fontWeight: 700 }}>REF-{order.id.split('-')[0].toUpperCase()}</h4>
                                </div>
                                <div className="text-right">
                                    <span className="px-3 py-1 rounded-full text-[10px] font-bold" style={{ backgroundColor: order.status === 'completed' ? '#e8f5e9' : '#f8d7da', color: order.status === 'completed' ? '#28a745' : '#721c24', border: `1px solid ${order.status === 'completed' ? '#c8e6c9' : '#f5c6cb'}` }}>
                                        {order.status === 'completed' ? 'Selesai' : order.status}
                                    </span>
                                    <p className="text-muted mb-0 mt-1" style={{ fontSize: '11px' }}>{new Date(order.created_at).toLocaleDateString('ms-MY')}</p>
                                </div>
                            </div>
                            <div className="d-flex justify-content-between align-items-end">
                                <div className="d-flex align-items-center gap-2">
                                    {order.items.slice(0, 3).map((item, idx) => (
                                        <div key={idx} className="border rounded overflow-hidden" style={{ width: '40px', height: '55px' }}>
                                            <div className="w-full h-full bg-light d-flex align-items-center justify-center">
                                                <BookOpen className="w-4 h-4 text-muted"/>
                                            </div>
                                        </div>
                                    ))}
                                    {order.items.length > 3 && (
                                        <div className="d-flex align-items-center justify-center rounded border bg-light text-muted font-bold text-xs" style={{ width: '40px', height: '55px' }}>
                                            +{order.items.length - 3}
                                        </div>
                                    )}
                                </div>
                                <div className="text-right">
                                    <p className="text-muted mb-0" style={{ fontSize: '10px', fontWeight: 'bold', textTransform: 'uppercase' }}>Jumlah Keseluruhan</p>
                                    <p className="mb-0 font-bold" style={{ fontSize: '20px', color: '#ff2020' }}>RM{order.total_amount.toFixed(2)}</p>
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
            { id: 'dashboard', label: 'Papan Pemuka', icon: LayoutDashboard },
            { id: 'books', label: 'Katalog Buku', icon: BookOpen },
            { id: 'users', label: 'Pengguna', icon: User },
            { id: 'promotions', label: 'Promosi', icon: Sparkles },
            { id: 'orders', label: 'Semua Pesanan', icon: Package },
        ];

        return (
            <div className="container py-5 animate-in zoom-in duration-500" style={{ color: '#1a1a1a' }}>
                <div className="row">
                    {/* Sidebar Navigation */}
                    <div className="col-lg-3 mb-4">
                        <div className="p-4 bg-white rounded-lg border shadow-sm sticky-top" style={{ top: '100px', zIndex: 10 }}>
                            <div className="mb-4">
                                <h3 className="mb-0 font-bold" style={{ fontFamily: 'Josefin Sans, sans-serif', color: '#1a1a1a' }}>
                                    Urus Setia <span style={{ color: '#ff2020' }}>Tarbiah</span>
                                </h3>
                                <p className="text-muted mb-0" style={{ fontSize: '10px', fontWeight: 'bold', textTransform: 'uppercase' }}>Hab Pengurusan</p>
                            </div>
                            
                            <nav className="nav flex-column gap-2">
                                {tabs.map(tab => (
                                    <button
                                        key={tab.id}
                                        onClick={() => setActiveTab(tab.id)}
                                        className="btn text-start d-flex align-items-center gap-3 py-3 px-3 transition-all"
                                        style={{ 
                                            borderRadius: '8px',
                                            fontWeight: 'bold',
                                            fontSize: '14px',
                                            backgroundColor: activeTab === tab.id ? '#ff2020' : 'transparent',
                                            color: activeTab === tab.id ? 'white' : '#555',
                                            border: 'none',
                                            boxShadow: activeTab === tab.id ? '0 4px 15px rgba(255, 32, 32, 0.2)' : 'none'
                                        }}
                                    >
                                        <tab.icon className="w-5 h-5" style={{ color: activeTab === tab.id ? 'white' : '#555' }} />
                                        <span>{tab.label}</span>
                                    </button>
                                ))}
                            </nav>

                            <div className="mt-4 pt-3 border-top">
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
                                            addToast('Analisis kedai berjaya dieksport ke CSV');
                                        } catch (err) { addToast('Eksport gagal', 'error'); }
                                    }}
                                    className="btn btn-link text-decoration-none p-0 text-start d-flex align-items-center gap-2"
                                    style={{ fontSize: '11px', fontWeight: 'bold', color: '#ff2020', textTransform: 'uppercase' }}
                                >
                                    <Edit className="w-4 h-4" /> Eksport Data Kedai
                                </button>
                            </div>
                        </div>
                    </div>

                    {/* Main Content Area */}
                    <div className="col-lg-9">
                        <div className="d-flex justify-content-between align-items-center mb-4">
                            <h2 style={{ fontFamily: 'Josefin Sans, sans-serif', fontWeight: 700, margin: 0 }}>
                                {tabs.find(t => t.id === activeTab)?.label}
                            </h2>
                            {activeTab === 'books' && (
                                <button className="btn text-white" style={{ backgroundColor: '#ff2020', fontWeight: 'bold', fontSize: '13px', padding: '10px 20px', borderRadius: '8px' }}>
                                    <Plus className="w-4 h-4 inline mr-1" /> Tambah Buku Baru
                                </button>
                            )}
                        </div>

                        {/* Tab Content: Dashboard */}
                        {activeTab === 'dashboard' && (
                            <div className="animate-in fade-in duration-300">
                                <div className="row g-3 mb-4">
                                    <div className="col-md-4">
                                        <div className="p-4 bg-white rounded-lg border shadow-sm">
                                            <p className="text-muted font-bold text-[10px] uppercase tracking-widest mb-2">Jumlah Pendapatan</p>
                                            <h3 className="mb-0 font-bold" style={{ color: '#1a1a1a' }}>RM12,450</h3>
                                            <div className="d-flex align-items-center gap-2 mt-3">
                                                <span className="px-2 py-0.5 rounded text-[10px] font-bold" style={{ backgroundColor: '#d4edda', color: '#155724' }}>+14%</span>
                                                <span className="text-muted text-[10px] font-bold uppercase">Suku Ini</span>
                                            </div>
                                        </div>
                                    </div>
                                    <div className="col-md-4">
                                        <div className="p-4 bg-white rounded-lg border shadow-sm">
                                            <p className="text-muted font-bold text-[10px] uppercase tracking-widest mb-2">Pelanggan Berdaftar</p>
                                            <h3 className="mb-0 font-bold" style={{ color: '#1a1a1a' }}>1,204</h3>
                                            <div className="d-flex align-items-center gap-2 mt-3">
                                                <span className="px-2 py-0.5 rounded text-[10px] font-bold" style={{ backgroundColor: '#d4edda', color: '#155724' }}>+5%</span>
                                                <span className="text-muted text-[10px] font-bold uppercase">Aktif</span>
                                            </div>
                                        </div>
                                    </div>
                                    <div className="col-md-4">
                                        <div className="p-4 bg-white rounded-lg border shadow-sm">
                                            <p className="text-muted font-bold text-[10px] uppercase tracking-widest mb-2">Jumlah Transaksi</p>
                                            <h3 className="mb-0 font-bold" style={{ color: '#1a1a1a' }}>456</h3>
                                            <div className="d-flex align-items-center gap-2 mt-3">
                                                <span className="px-2 py-0.5 rounded text-[10px] font-bold" style={{ backgroundColor: '#f8d7da', color: '#721c24' }}>-2%</span>
                                                <span className="text-muted text-[10px] font-bold uppercase">Sesi Ini</span>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                                
                                <div className="p-5 bg-white rounded-lg border text-center shadow-sm position-relative overflow-hidden" style={{ minHeight: '300px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                    <div>
                                        <div className="bg-[#ff2020]/10 w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-3">
                                            <LayoutDashboard className="w-8 h-8 text-[#ff2020]" />
                                        </div>
                                        <h4 className="font-bold mb-1">Pusat Analitis Kedai</h4>
                                        <p className="text-muted text-xs max-w-sm mx-auto mb-0">Sedang memproses dan menyegerakkan metrik global dari sistem pangkalan data...</p>
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* Tab Content: Books */}
                        {activeTab === 'books' && (
                            <div className="bg-white rounded-lg border shadow-sm overflow-hidden animate-in fade-in duration-300">
                                <div className="table-responsive">
                                    <table className="table table-hover align-middle mb-0">
                                        <thead className="table-light">
                                            <tr className="text-[10px] font-bold text-muted text-uppercase tracking-wider">
                                                <th className="px-4 py-3">Buku</th>
                                                <th className="px-4 py-3">Genre</th>
                                                <th className="px-4 py-3">Harga</th>
                                                <th className="px-4 py-3">Inventori</th>
                                                <th className="px-4 py-3 text-end">Tindakan</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {books.map(book => (
                                                <tr key={book.id}>
                                                    <td className="px-4 py-3">
                                                        <div className="d-flex align-items-center gap-3">
                                                            <div className="border rounded overflow-hidden" style={{ width: '40px', height: '55px' }}>
                                                                <img src={book.cover} className="w-full h-full object-cover" alt="" />
                                                            </div>
                                                            <div>
                                                                <p className="mb-0 font-bold" style={{ fontSize: '13px', color: '#1a1a1a' }}>{book.title}</p>
                                                                <p className="text-muted mb-0" style={{ fontSize: '10px' }}>{book.author}</p>
                                                            </div>
                                                        </div>
                                                    </td>
                                                    <td className="px-4 py-3">
                                                        <span className="px-2 py-1 rounded-full text-[10px] font-bold" style={{ backgroundColor: '#f8c14620', color: '#b45309', border: '1px solid #f8c14640' }}>{book.genre}</span>
                                                    </td>
                                                    <td className="px-4 py-3 font-bold" style={{ fontSize: '13px' }}>RM{book.price.toFixed(2)}</td>
                                                    <td className="px-4 py-3">
                                                        <div className="d-flex align-items-center gap-2">
                                                            <div className="rounded-full" style={{ width: '8px', height: '8px', backgroundColor: book.stock > 10 ? '#28a745' : '#dc3545' }}></div>
                                                            <span className="text-muted text-xs">{book.stock} naskah</span>
                                                        </div>
                                                    </td>
                                                    <td className="px-4 py-3 text-end">
                                                        <div className="d-flex justify-content-end gap-2">
                                                            <button className="btn btn-outline-secondary btn-sm p-2" style={{ borderRadius: '6px' }}><Edit className="w-4 h-4" /></button>
                                                            <button className="btn btn-outline-danger btn-sm p-2" style={{ borderRadius: '6px' }}><Trash2 className="w-4 h-4" /></button>
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
                            <div className="bg-white rounded-lg border shadow-sm p-5 text-center animate-in fade-in duration-300">
                                <div className="bg-[#ff2020]/10 w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-3">
                                    <User className="w-8 h-8 text-[#ff2020]" />
                                </div>
                                <h4 className="font-bold">Pengurusan Pengguna</h4>
                                <p className="text-muted text-xs mb-4">Mengurus dan menyelia akaun pembeli berdaftar</p>
                                <div className="d-flex flex-column gap-2 max-w-lg mx-auto">
                                     {[1,2,3].map(i => (
                                         <div key={i} className="d-flex justify-content-between align-items-center p-3 bg-light rounded border">
                                             <div className="d-flex align-items-center gap-3">
                                                 <div className="bg-[#ff2020] text-white rounded-full font-bold d-flex align-items-center justify-center text-xs" style={{ width: '35px', height: '35px' }}>U{i}</div>
                                                 <div className="text-start">
                                                     <p className="mb-0 font-bold" style={{ fontSize: '13px' }}>Pengguna Contoh {i}</p>
                                                     <p className="text-muted mb-0" style={{ fontSize: '10px' }}>user{i}@example.com</p>
                                                 </div>
                                             </div>
                                             <span className="px-2 py-0.5 rounded text-[10px] font-bold" style={{ backgroundColor: '#e2e3e5', color: '#383d41' }}>Pelanggan</span>
                                         </div>
                                     ))}
                                </div>
                            </div>
                        )}

                        {/* Tab Content: Promotions */}
                        {activeTab === 'promotions' && (
                            <div className="bg-white rounded-lg border shadow-sm p-5 text-center animate-in fade-in duration-300">
                                <div className="bg-[#ff2020]/10 w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-3">
                                    <Sparkles className="w-8 h-8 text-[#ff2020]" />
                                </div>
                                <h4 className="font-bold">Kempen Promosi</h4>
                                <p className="text-muted text-xs mb-4">Uruskan kod kupon, diskaun bermusim, dan kempen jualan kilat</p>
                                <button className="btn text-white" style={{ backgroundColor: '#ff2020', fontWeight: 'bold', fontSize: '13px', padding: '10px 20px', borderRadius: '8px' }}>
                                    Lancarkan Kempen Baru
                                </button>
                            </div>
                        )}

                        {/* Tab Content: Orders */}
                        {activeTab === 'orders' && (
                            <div className="bg-white rounded-lg border shadow-sm p-5 animate-in fade-in duration-300">
                                <div className="text-center mb-4">
                                    <div className="bg-[#ff2020]/10 w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-3">
                                        <Package className="w-8 h-8 text-[#ff2020]" />
                                    </div>
                                    <h4 className="font-bold">Semua Rekod Pesanan</h4>
                                    <p className="text-muted text-xs">Pemantauan logistik dan pemenuhan pesanan dalam masa nyata</p>
                                </div>
                                {allOrders.length > 0 ? (
                                    <div className="d-flex flex-column gap-3">
                                        {allOrders.map(order => (
                                            <div key={order.id} className="p-3 bg-light rounded border d-flex justify-content-between align-items-center">
                                                 <div className="d-flex align-items-center gap-3">
                                                    <div className="bg-[#ff2020] p-2 rounded text-white">
                                                        <Package className="w-5 h-5" />
                                                    </div>
                                                    <div>
                                                        <p className="mb-0 font-bold font-mono text-sm">REF-{order.id.split('-')[0].toUpperCase()}</p>
                                                        <p className="text-muted mb-0" style={{ fontSize: '10px' }}>{new Date(order.created_at).toLocaleDateString('ms-MY', { month: 'short', day: 'numeric', year: 'numeric' })}</p>
                                                    </div>
                                                 </div>
                                                 <div className="text-end">
                                                    <p className="mb-0 font-bold text-md" style={{ color: '#ff2020' }}>RM{order.total_amount.toFixed(2)}</p>
                                                    <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${order.status === 'completed' ? 'bg-[#d4edda] text-[#155724]' : 'bg-[#fff3cd] text-[#856404]'}`}>
                                                        {order.status === 'completed' ? 'Selesai' : order.status}
                                                    </span>
                                                 </div>
                                            </div>
                                        ))}
                                    </div>
                                ) : (
                                    <div className="text-center py-5">
                                        <Loader2 className="w-8 h-8 text-muted animate-spin mx-auto mb-2" />
                                        <p className="text-muted text-xs mb-0">Sedang menyegerakkan senarai pesanan...</p>
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
        <div className="min-h-screen flex flex-col bg-[#fbfbfb] selection:bg-[#ff2020]/10" style={{ fontFamily: 'Josefin Sans, sans-serif' }}>
            <Header />

            <main className="flex-grow">
                {view === 'catalog' && <CatalogView />}
                {view === 'cart' && <CartView />}
                {view === 'checkout' && <CheckoutView />}
                {view === 'login' && <LoginView />}
                {view === 'register' && <RegisterView />}
                {view === '2fa' && <TwoFAView />}
                {view === 'payment-gateway' && <PaymentGatewayView />}
                {view === 'orders' && <OrdersView />}
                {view === 'admin' && <AdminView />}
            </main>

            {/* Floating Cart Summary FAB (Sticky Bottom Bar) */}
            {cart.length > 0 && view === 'catalog' && (
                <div className="fixed bottom-8 left-1/2 -translate-x-1/2 z-[60] w-[92%] max-w-md animate-in slide-in-from-bottom-12 fade-in duration-500 ease-out">
                    <div className="bg-white rounded-[2rem] shadow-[0_20px_50px_rgba(0,0,0,0.1)] border border-gray-100 p-2 pl-5 flex items-center justify-between ring-1 ring-black/5 overflow-hidden group">
                        
                        <div className="flex items-center gap-4 relative z-10">
                            <div className="relative">
                                <div className="w-14 h-14 bg-gray-900 rounded-2xl shadow-lg border border-white/20 flex items-center justify-center overflow-hidden rotate-[-4deg] group-hover:rotate-0 transition-transform duration-500">
                                    {cart[cart.length - 1]?.book?.cover ? (
                                        <img src={cart[cart.length - 1].book.cover} alt="Cart item" className="w-full h-full object-cover scale-110" />
                                    ) : (
                                        <Package className="w-7 h-7 text-white" />
                                    )}
                                </div>
                                <span className="absolute -top-2 -right-2 bg-[#ff2020] text-white text-[11px] font-black w-6 h-6 rounded-full flex items-center justify-center border-2 border-white shadow-md">
                                    {cart.reduce((sum, item) => sum + item.quantity, 0)}
                                </span>
                            </div>
                            
                            <div className="text-start">
                                <p className="text-muted mb-0 font-bold text-[9px] uppercase tracking-widest">Troli Anda</p>
                                <p className="mb-0 font-black text-sm" style={{ color: '#ff2020' }}>
                                    RM{(cart.reduce((sum, item) => sum + (item.book.price * item.quantity), 0) * 1.08).toFixed(2)}
                                </p>
                            </div>
                        </div>

                        <button 
                            onClick={() => setView('cart')}
                            className="btn px-4 py-3.5 text-white d-flex align-items-center gap-2 group-hover:bg-[#d91414] transition-all"
                            style={{ backgroundColor: '#ff2020', borderRadius: '1.6rem', border: 'none', fontWeight: 'bold', fontSize: '13px' }}
                        >
                            <span>Troli Detail</span>
                            <ChevronRight className="w-4 h-4 translate-x-0 group-hover:translate-x-1 transition-transform" />
                        </button>
                    </div>
                </div>
            )}

            {/* AI Chatbot Float Button and Chatbox */}
            <div className="fixed bottom-8 right-8 z-[70]">
                {aiChatOpen ? (
                    <div className="bg-white border border-gray-200 rounded-[2rem] shadow-[0_20px_50px_rgba(0,0,0,0.15)] flex flex-col overflow-hidden animate-in slide-in-from-bottom-8 duration-300" 
                         style={{ width: '360px', height: '500px', color: '#1a1a1a' }}>
                        
                        {/* Chat Header */}
                        <div className="p-4 bg-dark text-white d-flex align-items-center justify-between" style={{ backgroundColor: 'black' }}>
                            <div className="d-flex align-items-center gap-2.5">
                                <div className="bg-[#ff2020] p-2 rounded-xl text-white">
                                    <Bot className="w-5 h-5" />
                                </div>
                                <div>
                                    <h5 className="mb-0 font-black text-sm" style={{ fontFamily: 'Josefin Sans, sans-serif' }}>Tarbiah Sentap AI</h5>
                                    <span className="text-[9px] text-[#f8c146] font-bold uppercase tracking-wider">Pembantu Rohani Peribadi</span>
                                </div>
                            </div>
                            <button onClick={() => setAiChatOpen(false)} className="btn p-1 text-white opacity-80 hover:opacity-100"><X className="w-5 h-5" /></button>
                        </div>

                        {/* Chat Messages */}
                        <div className="flex-grow p-4 overflow-y-auto space-y-3 bg-light">
                            {aiMessages.map((msg, i) => (
                                <div key={i} className={`d-flex ${msg.role === 'user' ? 'justify-content-end' : 'justify-content-start'}`}>
                                    <div className={`p-3 max-w-[80%] rounded-[1.2rem] text-xs leading-relaxed ${msg.role === 'user' ? 'bg-[#ff2020] text-white font-bold' : 'bg-white border text-dark shadow-sm'}`}
                                         style={{ 
                                             borderRadius: msg.role === 'user' ? '1.2rem 1.2rem 0 1.2rem' : '1.2rem 1.2rem 1.2rem 0'
                                         }}>
                                        {msg.text}
                                    </div>
                                </div>
                            ))}
                            {aiChatLoading && (
                                <div className="d-flex justify-content-start">
                                    <div className="p-3 bg-white border rounded-[1.2rem] shadow-sm d-flex align-items-center gap-2">
                                        <Loader2 className="w-4 h-4 text-muted animate-spin" />
                                        <span className="text-[10px] text-muted font-bold uppercase tracking-wider">Menjawab...</span>
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* Chat Input */}
                        <form onSubmit={(e) => { e.preventDefault(); handleSendAIMessage(); }} className="p-3 bg-white border-t border-gray-100 d-flex gap-2">
                            <input 
                                type="text"
                                className="form-control py-2.5 text-xs"
                                placeholder="Tanya tentang cadangan buku..."
                                value={aiChatInput}
                                onChange={e => setAiChatInput(e.target.value)}
                                style={{ borderRadius: '12px' }}
                            />
                            <button type="submit" className="btn text-white px-3 d-flex align-items-center justify-center" style={{ backgroundColor: '#ff2020', borderRadius: '12px', border: 'none' }}>
                                <Send className="w-4 h-4" />
                            </button>
                        </form>
                    </div>
                ) : (
                    <button 
                        onClick={() => setAiChatOpen(true)}
                        className="btn rounded-circle p-3 shadow-lg text-white d-flex align-items-center justify-center hover:scale-105 active:scale-95 transition-all"
                        style={{ backgroundColor: '#ff2020', width: '56px', height: '56px', border: 'none' }}
                    >
                        <MessageSquare className="w-6 h-6 animate-bounce" />
                    </button>
                )}
            </div>

            {/* Book Detail / Summary Modal */}
            {summaryModal.isOpen && summaryModal.book && (
                <div className="fixed inset-0 z-[80] flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-in fade-in duration-300">
                    <div className="bg-white border border-gray-200 rounded-[2rem] w-full max-w-2xl overflow-hidden shadow-2xl animate-in zoom-in duration-300 relative" style={{ color: '#1a1a1a' }}>
                        <button 
                            onClick={() => setSummaryModal({ isOpen: false, book: null, summary: '', loading: false })}
                            className="btn rounded-circle p-2 position-absolute"
                            style={{ top: '20px', right: '20px', backgroundColor: '#f1f1f1', border: 'none', color: '#1a1a1a', zIndex: 10 }}
                        >
                            <X className="w-5 h-5" />
                        </button>
                        
                        <div className="flex flex-col md:flex-row h-full">
                            {/* Left Side: Cover Image */}
                            <div className="w-full md:w-2/5 aspect-[3/4] md:aspect-auto md:h-auto bg-light relative overflow-hidden flex-shrink-0">
                                <img 
                                    src={summaryModal.book.cover} 
                                    alt={summaryModal.book.title} 
                                    className="w-full h-full object-cover" 
                                />
                            </div>
                            
                            {/* Right Side: Details & Summary */}
                            <div className="p-8 md:p-10 flex flex-col justify-between flex-grow">
                                <div>
                                    <span className="text-[10px] font-bold uppercase tracking-[0.25em] block mb-2" style={{ color: '#ff2020' }}>{summaryModal.book.genre}</span>
                                    <h2 className="text-2xl font-black leading-tight mb-2 tracking-tight" style={{ fontFamily: 'Josefin Sans, sans-serif' }}>{summaryModal.book.title}</h2>
                                    <p className="text-xs text-muted font-bold uppercase tracking-widest mb-4">Penulis: {summaryModal.book.author}</p>
                                    
                                    <div className="h-px bg-gray-200 my-3"></div>
                                    
                                    <h4 className="text-[10px] font-bold text-gray-500 uppercase tracking-widest mb-2">Sinopsis / Ringkasan</h4>
                                    <p className="text-gray-600 text-sm leading-relaxed mb-4 italic">
                                        "{summaryModal.summary}"
                                    </p>
                                </div>
                                
                                <div className="flex items-center justify-between mt-auto pt-4 border-t border-gray-100">
                                    <div className="flex flex-col">
                                        <span className="text-[9px] font-bold text-gray-500 uppercase tracking-widest mb-0.5">Harga</span>
                                        <span className="font-bold text-2xl" style={{ color: '#ff2020' }}>RM{summaryModal.book.price.toFixed(2)}</span>
                                    </div>
                                    <button 
                                        onClick={() => {
                                            addToCart(summaryModal.book);
                                            setSummaryModal({ isOpen: false, book: null, summary: '', loading: false });
                                        }}
                                        className="btn px-4 py-3 text-white"
                                        style={{ backgroundColor: '#ff2020', fontWeight: 'bold', fontSize: '13px', borderRadius: '8px' }}
                                    >
                                        <ShoppingCart className="w-4 h-4 inline mr-1" /> Masuk Troli
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Toast System */}
            <div className="fixed top-24 right-6 z-[100] space-y-4 pointer-events-none">
                {toasts.map(t => (
                    <div key={t.id} className="pointer-events-auto flex items-center gap-3 px-4 py-3 rounded-lg shadow-lg border"
                         style={{
                             backgroundColor: t.type === 'error' ? '#f8d7da' : '#d4edda',
                             color: t.type === 'error' ? '#721c24' : '#155724',
                             borderColor: t.type === 'error' ? '#f5c6cb' : '#c3e6cb',
                         }}>
                        {t.type === 'error' ? <X className="w-5 h-5" /> : <Check className="w-5 h-5 text-success" />}
                        <p className="mb-0 font-bold text-xs uppercase tracking-wider">{t.message}</p>
                    </div>
                ))}
            </div>
        </div>
    );
}
