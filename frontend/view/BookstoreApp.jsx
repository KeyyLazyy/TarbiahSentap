import React, { useState, useMemo, useEffect } from 'react';
import {
    ShoppingCart, BookOpen, User, Star, Trash2, Plus,
    Search, LogOut, Package, ChevronRight, X, Check,
    CreditCard, ShieldCheck, LayoutDashboard, Edit,
    Sparkles, MessageSquare, Bot, Send, Loader2, Menu,
    Eye, EyeOff, Lock, Mail, ArrowRight, Tag, Gift, Truck,
    FileText, CheckCircle2, Heart
} from 'lucide-react';
import { authApi, bookApi, orderApi, adminApi } from './services/api';
import StitchDesign from './StitchDesign';
import ArchiveCatalog from './ArchiveCatalog';

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
    const [userId, setUserId] = useState(null);
    const [verifyEmail, setVerifyEmail] = useState(''); // For device verification

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
    const [promoDiscount, setPromoDiscount] = useState(0);
    const [promoCodeApplied, setPromoCodeApplied] = useState('');
    const [checkoutName, setCheckoutName] = useState('');
    const [checkoutPhone, setCheckoutPhone] = useState('');
    const [checkoutCity, setCheckoutCity] = useState('');
    const [checkoutPostalCode, setCheckoutPostalCode] = useState('');
    const [cardholderName, setCardholderName] = useState('');

    const [popupPlacements, setPopupPlacements] = useState({});

    // Price Calculations Shared
    const subtotal = useMemo(() => cart.reduce((sum, item) => sum + (item.book.price * item.quantity), 0), [cart]);
    const discountAmount = useMemo(() => (subtotal * promoDiscount) / 100, [subtotal, promoDiscount]);
    const tax = useMemo(() => (subtotal - discountAmount) * 0.08, [subtotal, discountAmount]);
    const total = useMemo(() => (subtotal - discountAmount) + tax, [subtotal, discountAmount, tax]);

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
        if (savedUser && savedUser !== 'undefined') setUser(JSON.parse(savedUser));

        // Check if account was just activated
        const params = new URLSearchParams(window.location.search);
        if (params.get('activated') === 'true') {
            addToast('Account activated successfully! Please log in.', 'success');
            window.history.replaceState({}, document.title, window.location.pathname);
            setView('login');
        }
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
            if (res.data.requires_device_verification) {
                setVerifyEmail(email);
                setView('verify-device');
                addToast('New device verification required', 'info');
            } else if (res.data.requires_totp) {
                setTempToken(res.data.temp_token);
                setUserId(res.data.user_id);
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
            const errorMsg = err.response?.data?.message || err.response?.data?.error || 'Invalid credentials';
            addToast(errorMsg, 'error');
        }
    };

    const handleSignup = async (email, password, name, phone) => {
        try {
            const res = await authApi.signup(email, password, name, phone);
            if (res.data.success) {
                addToast(res.data.message || 'Registration successful! Please verify your email.', 'info');
                setView('login');
            }
        } catch (err) {
            const errors = err.response?.data?.errors;
            let errorMsg = err.response?.data?.message || 'Registration failed';
            if (errors) {
                const firstErrorKey = Object.keys(errors)[0];
                if (firstErrorKey && errors[firstErrorKey][0]) {
                    errorMsg = errors[firstErrorKey][0];
                }
            }
            addToast(errorMsg, 'error');
        }
    };

    const handleVerify2FA = async (otp) => {
        try {
            const res = await authApi.verify2FA(otp, userId);
            if (res.data.success) {
                const userData = res.data.user;
                localStorage.setItem('token', res.data.token);
                localStorage.setItem('user', JSON.stringify(userData));
                setUser(userData);
                setTempToken(null);
                setUserId(null);
                setView('catalog');
                addToast('2FA Verified');
            }
        } catch (err) {
            const errorMsg = err.response?.data?.message || 'Invalid OTP';
            addToast(errorMsg, 'error');
        }
    };

    const handleVerifyDevice = async (code) => {
        try {
            const res = await authApi.verifyDevice(verifyEmail, code);
            if (res.data.requires_totp) {
                setTempToken(res.data.temp_token);
                setUserId(res.data.user_id);
                setVerifyEmail('');
                setView('2fa');
                addToast('2FA required', 'info');
            } else if (res.data.success) {
                const userData = res.data.user;
                localStorage.setItem('token', res.data.token);
                localStorage.setItem('user', JSON.stringify(userData));
                setUser(userData);
                setVerifyEmail('');
                setView('catalog');
                addToast('Device verified and logged in');
            }
        } catch (err) {
            const errorMsg = err.response?.data?.message || 'Invalid verification code';
            addToast(errorMsg, 'error');
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

    const Header = () => {
        const cartCount = cart.reduce((sum, item) => sum + item.quantity, 0);

        return (
            <header className="fixed top-0 w-full z-[100]">
                <div className="header-area bg-white/70 dark:bg-zinc-950/70 backdrop-blur-xl shadow-sm border-b border-gray-200/50 dark:border-zinc-900/50 transition-all duration-500">
                    <div className="main-header py-3" style={{ padding: '12px 0' }}>
                        <div className="container-fluid px-4">
                            <div className="menu-wrapper d-flex align-items-center justify-content-between">
                                {/* Logo */}
                                <div className="logo flex-shrink-0 cursor-pointer transition-transform hover:scale-105" onClick={() => setView('catalog')}>
                                    <img src="/assets/img/logo/tarbiah-sentap-logo.png" width="90" height="auto" alt="Tarbiah Sentap" className="dark:brightness-200" />
                                </div>

                                {/* Main Menu Nav */}
                                <div className="main-menu d-none d-lg-block">
                                    <nav>
                                        <ul id="navigation" className="d-flex align-items-center gap-4" style={{ listStyle: 'none', margin: 0, padding: 0 }}>
                                            <li>
                                                <button 
                                                    onClick={() => setView('catalog')}
                                                    className={`px-1 py-1 text-[11px] font-black uppercase tracking-widest transition-all duration-300 hover:scale-105 d-flex align-items-center gap-1.5 border-0 ${
                                                        view === 'catalog' 
                                                        ? 'text-gray-900 dark:text-white font-extrabold border-b-2 border-[#8b0000]' 
                                                        : 'text-gray-400 hover:text-gray-900 dark:hover:text-white'
                                                    }`}
                                                    style={{ outline: 'none', background: 'transparent' }}
                                                >
                                                    Home
                                                </button>
                                            </li>
                                            <li>
                                                <button 
                                                    onClick={() => setView('catalog')}
                                                    className="px-1 py-1 text-[11px] font-black uppercase tracking-widest text-gray-400 hover:text-gray-900 dark:hover:text-white transition-all duration-300 hover:scale-105 d-flex align-items-center gap-1.5 border-0"
                                                    style={{ outline: 'none', background: 'transparent' }}
                                                >
                                                    Shop
                                                </button>
                                            </li>
                                            {user && (
                                                <li>
                                                    <button 
                                                        onClick={() => setView('orders')}
                                                        className={`px-1 py-1 text-[11px] font-black uppercase tracking-widest transition-all duration-300 hover:scale-105 d-flex align-items-center gap-1.5 border-0 ${
                                                            view === 'orders' 
                                                            ? 'text-gray-900 dark:text-white font-extrabold border-b-2 border-[#8b0000]' 
                                                            : 'text-gray-400 hover:text-gray-900 dark:hover:text-white'
                                                        }`}
                                                        style={{ outline: 'none', background: 'transparent' }}
                                                    >
                                                        Orders
                                                    </button>
                                                </li>
                                            )}
                                            {user && user.role === 'admin' && (
                                                <li>
                                                    <button 
                                                        onClick={() => setView('admin')}
                                                        className={`px-1 py-1 text-[11px] font-black uppercase tracking-widest transition-all duration-300 hover:scale-105 d-flex align-items-center gap-1.5 border-0 ${
                                                            view === 'admin' 
                                                            ? 'text-gray-900 dark:text-white font-extrabold border-b-2 border-[#8b0000]' 
                                                            : 'text-gray-400 hover:text-gray-900 dark:hover:text-white'
                                                        }`}
                                                        style={{ outline: 'none', background: 'transparent' }}
                                                    >
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
                                                <span className="text-[9px] font-black text-gray-400 uppercase tracking-widest">Akaun</span>
                                                <span className="text-gray-800 dark:text-zinc-100 text-xs font-bold font-mono tracking-tight">{ (user?.name || 'User').split(' ')[0] }</span>
                                            </div>
                                            <button 
                                                onClick={() => setView('orders')}
                                                className={`w-10 h-10 rounded-full d-flex align-items-center justify-content-center border transition-all duration-300 ${
                                                    view === 'orders' 
                                                    ? 'bg-black border-black text-white dark:bg-zinc-800 dark:border-zinc-800' 
                                                    : 'border-gray-200 dark:border-zinc-800 text-gray-500 hover:border-gray-400 dark:text-zinc-400 hover:text-black dark:hover:text-white bg-transparent'
                                                }`}
                                                style={{ outline: 'none' }}
                                                title="Pesanan Saya"
                                            >
                                                <User className="w-4 h-4" />
                                            </button>
                                            <button 
                                                onClick={handleLogout}
                                                className="w-10 h-10 rounded-full border border-gray-200 dark:border-zinc-800 text-gray-400 hover:border-[#8b0000]/30 hover:bg-[#8b0000]/10 hover:text-[#8b0000] bg-transparent transition-all duration-300"
                                                style={{ outline: 'none' }}
                                                title="Log Keluar"
                                            >
                                                <LogOut className="w-4 h-4" />
                                            </button>
                                        </>
                                    ) : (
                                        <button 
                                            onClick={() => setView('login')}
                                            className="bg-black text-white hover:bg-[#8b0000] hover:text-white text-xs font-black uppercase tracking-widest px-6 py-2.5 rounded-full transition-all duration-300 shadow-sm border-0 outline-none cursor-pointer"
                                            style={{ outline: 'none' }}
                                        >
                                            Log In
                                        </button>
                                    )}

                                    {/* Cart Icon Link */}
                                    <button 
                                        onClick={() => setView('cart')}
                                        className={`w-10 h-10 rounded-full d-flex align-items-center justify-content-center border relative transition-all duration-300 ${
                                            view === 'cart' 
                                            ? 'bg-black border-black text-white dark:bg-zinc-800 dark:border-zinc-800' 
                                            : 'border-gray-200 dark:border-zinc-800 text-gray-500 hover:border-gray-400 dark:text-zinc-400 hover:text-black dark:hover:text-white bg-transparent'
                                        }`}
                                        style={{ outline: 'none' }}
                                        title="Troli"
                                    >
                                        <ShoppingCart className="w-4 h-4" />
                                        {cartCount > 0 && (
                                            <span className="absolute -top-1.5 -right-1.5 bg-[#8b0000] text-white text-[9px] font-black w-5 h-5 rounded-full d-flex align-items-center justify-content-center border border-white shadow-md">
                                                {cartCount}
                                            </span>
                                        )}
                                    </button>

                                    {/* Mobile Hamburger Toggle */}
                                    <button 
                                        onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                                        className="w-10 h-10 rounded-full d-flex d-lg-none align-items-center justify-content-center border border-gray-200 dark:border-zinc-800 text-gray-500 hover:text-black dark:hover:text-white bg-transparent transition-all duration-300"
                                        style={{ outline: 'none' }}
                                        title="Menu"
                                    >
                                        {mobileMenuOpen ? <X className="w-4 h-4" /> : <Menu className="w-4 h-4" />}
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Mobile Navigation Drawer */}
                    {mobileMenuOpen && (
                        <div className="d-lg-none bg-white dark:bg-zinc-950 border-t border-gray-100 dark:border-zinc-900 px-4 py-3 animate-in slide-in-from-top duration-300">
                            <ul className="d-flex flex-column gap-2" style={{ listStyle: 'none', margin: 0, padding: 0 }}>
                                <li>
                                    <button 
                                        onClick={() => { setView('catalog'); setMobileMenuOpen(false); }}
                                        className={`w-full text-start px-4 py-3 rounded-none text-xs font-black uppercase tracking-widest transition-all duration-300 border-0 ${
                                            view === 'catalog' 
                                            ? 'bg-[#8b0000] text-white' 
                                            : 'text-gray-600 hover:text-black dark:text-zinc-400 dark:hover:text-white bg-transparent'
                                        }`}
                                    >
                                        Home
                                    </button>
                                </li>
                                <li>
                                    <button 
                                        onClick={() => { setView('catalog'); setMobileMenuOpen(false); }}
                                        className="w-full text-start px-4 py-3 rounded-none text-xs font-black uppercase tracking-widest text-gray-600 hover:text-black dark:text-zinc-400 dark:hover:text-white bg-transparent border-0"
                                    >
                                        Shop
                                    </button>
                                </li>
                                {user && (
                                    <li>
                                        <button 
                                            onClick={() => { setView('orders'); setMobileMenuOpen(false); }}
                                            className={`w-full text-start px-4 py-3 rounded-none text-xs font-black uppercase tracking-widest transition-all duration-300 border-0 ${
                                                view === 'orders' 
                                                ? 'bg-[#8b0000] text-white' 
                                                : 'text-gray-600 hover:text-black dark:text-zinc-400 dark:hover:text-white bg-transparent'
                                            }`}
                                        >
                                            Orders
                                        </button>
                                    </li>
                                )}
                                {user && user.role === 'admin' && (
                                    <li>
                                        <button 
                                            onClick={() => { setView('admin'); setMobileMenuOpen(false); }}
                                            className={`w-full text-start px-4 py-3 rounded-none text-xs font-black uppercase tracking-widest transition-all duration-300 border-0 ${
                                                view === 'admin' 
                                                ? 'bg-[#8b0000] text-white' 
                                                : 'text-gray-600 hover:text-black dark:text-zinc-400 dark:hover:text-white bg-transparent'
                                            }`}
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
                <Loader2 className="w-12 h-12 text-primary animate-spin" />
                <p className="mt-3 text-muted font-bold tracking-widest text-xs uppercase">Menyusun koleksi perpustakaan...</p>
            </div>
        );

        return (
            <div className="animate-in fade-in bg-[#fafafa]">
                {/* Header (TopAppBar) */}
                <header className="fixed top-0 left-0 w-full z-50 flex justify-between items-center px-margin-desktop py-4 bg-surface/90 backdrop-blur-md border-b border-outline-variant/20 dark:border-outline/10">
                  <div className="flex items-center gap-12">
                    <a className="font-headline-md text-headline-md font-bold text-primary-container dark:text-primary-fixed uppercase tracking-widest" href="#">The Manuscript</a>
                    <nav className="hidden md:flex gap-8">
                      <a className="font-label-md text-label-md text-primary dark:text-primary-fixed border-b-2 border-primary-container pb-1 transition-all duration-200" href="#">Curations</a>
                      <a className="font-label-md text-label-md text-on-surface-variant dark:text-on-surface-variant hover:text-primary-container dark:hover:text-primary-fixed-dim transition-colors duration-300" href="#">Editions</a>
                      <a className="font-label-md text-label-md text-on-surface-variant dark:text-on-surface-variant hover:text-primary-container dark:hover:text-primary-fixed-dim transition-colors duration-300" href="#">Archives</a>
                      <a className="font-label-md text-label-md text-on-surface-variant dark:text-on-surface-variant hover:text-primary-container dark:hover:text-primary-fixed-dim transition-colors duration-300" href="#">About</a>
                    </nav>
                  </div>
                  <div className="flex items-center gap-6">
                    <div className="hidden md:flex items-center border-b border-on-surface/20 pb-1">
                      <span className="material-symbols-outlined text-[20px] text-on-surface-variant">search</span>
                      <input className="bg-transparent border-none focus:ring-0 text-label-md placeholder:text-on-surface-variant/50 w-48" placeholder="Search volumes..." type="text"/>
                    </div>
                    <button className="material-symbols-outlined text-on-surface hover:text-primary-container transition-colors" data-icon="shopping_bag">shopping_bag</button>
                    <button className="material-symbols-outlined text-on-surface hover:text-primary-container transition-colors" data-icon="person">person</button>
                  </div>
                </header>
                <main className="pt-24">
                  {/* Hero Section */}
                  <section className="grid grid-cols-1 lg:grid-cols-2 min-h-[921px]">
                    {/* Left: Hero Imagery */}
                    <div className="bg-primary-container flex items-center justify-center p-margin-mobile md:p-margin-desktop sticky top-24 h-[calc(100vh-6rem)] overflow-hidden">
                      <div className="relative group">
                        <img alt="The Shadow of the Wind" className="w-full max-w-md book-shadow transition-transform duration-700 group-hover:scale-[1.02]" src="https://lh3.googleusercontent.com/aida-public/AB6AXuA-wjZqv7-fmw-_nTZwp7fkodibw_2W_b4-eLEyi4_EaHDaxLXjna8u_2WPd-CTpV2AEd7-NbpYVv6I7KPZ64O3g3hhwFKYM6a5p5zIApMnBQ0_qBJrFf-jxWmSndRwskvJVrqHmZEhhR_DvMCV2VhiF0nNwYQVdF9cc4-mE4t54y-5ir-jRLveqTK6VcIO-7A15WcsyoHEAzx6am1U-vqPjiYIUsxd838kwtdUVZJvhtGWP5RGOPz_jKMKFtWr0KKd5ZvDDdK-hKI"/>
                        <div className="absolute -bottom-12 -right-12 opacity-10 pointer-events-none"><span className="font-headline-lg text-[180px] text-white select-none">M</span></div>
                      </div>
                    </div>
                    {/* Right: Content */}
                    <div className="bg-surface px-margin-mobile md:px-margin-desktop py-section-gap flex flex-col justify-center">
                      <div className="max-w-xl">
                        <nav className="flex items-center gap-2 mb-8 opacity-60">
                          <span className="font-label-sm text-label-sm uppercase tracking-tighter">Collections</span>
                          <span className="material-symbols-outlined text-[12px]">chevron_right</span>
                          <span className="font-label-sm text-label-sm uppercase tracking-tighter">Modern Classics</span>
                        </nav>
                        <h1 className="font-headline-lg text-headline-lg md:text-[64px] leading-tight mb-4 text-on-surface">The Shadow of the Wind</h1>
                        <p className="font-headline-sm text-headline-sm italic text-primary mb-8">Carlos Ruiz Zafón</p>
                        <div className="flex items-center gap-4 mb-12">
                          <span className="font-headline-md text-headline-md text-on-surface">$85.00</span>
                          <span className="px-3 py-1 bg-secondary-container text-on-secondary-container font-label-sm text-label-sm rounded-full">Collector's Edition</span>
                        </div>
                        <div className="space-y-8 mb-12">
                          <p className="font-body-lg text-body-lg text-on-surface-variant leading-relaxed">A stunning masterpiece set in post-war Barcelona, this edition features a hand-bound crimson linen cover, gold-leaf edges, and exclusive illustrations by the author. A story about a secret library of forgotten books and a boy’s obsession with a mysterious novelist.</p>
                          <div className="flex flex-col gap-4">
                            <button className="w-full bg-primary-container text-on-primary py-5 font-label-md text-label-md uppercase tracking-widest hover:bg-primary transition-all duration-300 flex items-center justify-center gap-3 group">
                              <span>Add to Private Library</span>
                              <span className="material-symbols-outlined group-hover:translate-x-1 transition-transform" data-icon="arrow_forward">arrow_forward</span>
                            </button>
                            <button className="w-full border border-secondary text-on-surface py-5 font-label-md text-label-md uppercase tracking-widest hover:bg-secondary-container/10 transition-all duration-300">Pre-order Signed Edition</button>
                          </div>
                        </div>
                        {/* Details Accordion */}
                        <div className="border-t border-outline-variant/30 pt-8 space-y-6">
                          <details className="group" open>
                            <summary className="list-none flex justify-between items-center cursor-pointer">
                              <span className="font-label-md text-label-md uppercase tracking-widest text-on-surface">Book Details</span>
                              <span className="material-symbols-outlined transition-transform group-open:rotate-180">expand_more</span>
                            </summary>
                            <div className="pt-4 grid grid-cols-2 gap-y-4">
                              <div>
                                <p className="font-label-sm text-label-sm text-on-surface-variant uppercase mb-1">Format</p>
                                <p className="font-body-md text-body-md">Hardcover, Linen Bound</p>
                              </div>
                              <div>
                                <p className="font-label-sm text-label-sm text-on-surface-variant uppercase mb-1">Pages</p>
                                <p className="font-body-md text-body-md">487 Premium Cream</p>
                              </div>
                              <div>
                                <p className="font-label-sm text-label-sm text-on-surface-variant uppercase mb-1">Dimensions</p>
                                <p className="font-body-md text-body-md">6.5" x 9.25"</p>
                              </div>
                              <div>
                                <p className="font-label-sm text-label-sm text-on-surface-variant uppercase mb-1">ISBN</p>
                                <p className="font-body-md text-body-md">978-0143034902</p>
                              </div>
                            </div>
                          </details>
                          <details className="group">
                            <summary className="list-none flex justify-between items-center cursor-pointer">
                              <span className="font-label-md text-label-md uppercase tracking-widest text-on-surface">Shipping &amp; Returns</span>
                              <span className="material-symbols-outlined transition-transform group-open:rotate-180">expand_more</span>
                            </summary>
                            <div className="pt-4">
                              <p className="font-body-md text-body-md text-on-surface-variant">Complementary white-glove shipping on all collector's editions. Delivered in a custom protective archival case.</p>
                            </div>
                          </details>
                        </div>
                      </div>
                    </div>
                  </section>  
                </main>

                {/* Shop Section */}
                <section id="shop-section" className="popular-items py-16" style={{ padding: '80px 0 50px 0' }}>
                    <div className="container">
                        {/* Elegant Dribbble Section Header (Mockup Style) */}
                        <div className="row align-items-end mb-8 px-2 g-4">
                            <div className="col-lg-7 col-md-8 col-sm-12 text-left">
                                <span className="text-primary text-[10px] font-black uppercase tracking-[0.2em] flex items-center gap-1.5 mb-2.5">
                                    <span className="w-1.5 h-1.5 rounded-full bg-primary inline-block animate-ping"></span>
                                    Koleksi Pilihan
                                </span>
                                <h2 className="text-3xl sm:text-4xl font-extrabold text-primary" style={{ fontFamily: 'EB Garamond, serif' }}>
                                    Terokai Buku Tarbiah Sentap Pilihan
                                </h2>
                            </div>
                            <div className="col-lg-5 col-md-4 col-sm-12 text-left text-md-end">
                                <p className="text-gray-500 dark:text-zinc-400 text-xs sm:text-sm leading-relaxed max-w-md ml-auto text-start">
                                    Di Tarbiah Sentap, kami menawarkan barisan naskhah dakwah kreatif, novel islamik, motivasi, dan persediaan akhir zaman terbaik untuk membimbing pemikiran Muslim kontemporari.
                                </p>
                            </div>
                        </div>

                        {/* Search, Sort & Category Filter Controls (Mason Style) */}
                        <div className="row g-3 align-items-center justify-content-between mb-4 px-2">
                            <div className="col-lg-4 col-md-5 col-sm-12">
                                <div className="relative">
                                    <input 
                                        type="text"
                                        placeholder="Search volumes..."
                                        value={search}
                                        onChange={(e) => setSearch(e.target.value)}
                                        className="bg-transparent border-none focus:ring-0 text-label-md placeholder:text-on-surface-variant/50 w-48"
                                    />
                                    <Search className="absolute right-3.5 top-3 w-4 h-4 text-gray-400" />
                                </div>
                            </div>
                            <div className="col-lg-4 col-md-5 col-sm-12 text-md-end flex justify-end items-center gap-2">
                                <span className="text-xs text-gray-400 font-bold uppercase tracking-wider">Susun:</span>
                                <select 
                                    value={sortBy}
                                    onChange={(e) => setSortBy(e.target.value)}
                                    className="bg-transparent border-none focus:ring-0 text-label-md placeholder:text-on-surface-variant/50"
                                >
                                    <option value="featured">Featured</option>
                                    <option value="price-asc">Harga: Rendah ke Tinggi</option>
                                    <option value="price-desc">Harga: Tinggi ke Rendah</option>
                                    <option value="rating">Rating Tertinggi</option>
                                </select>
                            </div>
                        </div>

                        {/* Category Tag Pills Row */}
                        <div className="flex gap-2 overflow-x-auto pb-4 mb-8 scrollbar-none px-2 flex-wrap">
                            {genres.map(g => (
                                <button
                                    key={g}
                                    onClick={() => setGenre(g)}
                                    className={`px-4 py-2 rounded-none text-[10px] font-black uppercase tracking-widest transition-all duration-300 border-0 outline-none ${
                                        genre === g 
                                            ? 'bg-primary-container text-on-primary-container shadow-md shadow-primary-container/25' 
                                            : 'bg-gray-100 hover:bg-gray-200 text-gray-500 hover:text-black dark:bg-zinc-850 dark:text-zinc-300 dark:hover:bg-zinc-800'
                                    }`}
                                >
                                    {g}
                                </button>
                            ))}
                        </div>

                        {/* Books Grid */}
                        {filteredBooks.length === 0 ? (
                            <div className="text-center py-5 text-gray-400 font-bold">Tiada buku ditemui padanan carian anda.</div>
                        ) : (
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-y-32 gap-x-gutter">
                                {filteredBooks.map((book, index) => (
            <div
                key={book.id}
                className="relative group book-card z-10"
                style={{ animationDelay: `${index * 35}ms` }}
                onMouseEnter={(e) => {
                    const rect = e.currentTarget.getBoundingClientRect();
                    const screenWidth = window.innerWidth;
                    const cardCenter = rect.left + rect.width / 2;
                    const side = cardCenter > screenWidth / 2 ? 'left' : 'right';
                    setPopupPlacements(prev => ({ ...prev, [book.id]: side }));
                }}
            >
                {/* Book Title */}
                <h3 className="text-xs sm:text-sm font-black text-gray-800 dark:text-zinc-100 hover:text-[#8b0000] dark:hover:text-[#8b0000] transition-colors line-clamp-1 mb-1" style={{ fontFamily: 'EB Garamond, serif' }}>
                    <a href="#" onClick={(e) => { e.preventDefault(); setView('catalog'); setSummaryModal({ isOpen: true, book, summary: getBookSummary(book), loading: false }); }} className="no-underline text-gray-800 dark:text-zinc-100 hover:text-[#8b0000]">{book.title}</a>
                </h3>
                {/* Stars Rating & Price Row */}
                <div className="flex justify-between items-center mt-1">
                    <div className="flex items-center gap-0.5 text-[#8b0000] text-[10px]">
                        {Array.from({ length: 5 }).map((_, i) => (
                            <span key={i}>{i < Math.floor(book.rating) ? '★' : '☆'}</span>
                        ))}
                        <span className="text-[9px] text-gray-400 font-bold ml-1 font-mono">({book.rating})</span>
                    </div>
                    <span className="font-extrabold text-xs sm:text-sm text-gray-900 dark:text-white font-mono">RM{book.price.toFixed(2)}</span>
                </div>
                {/* Thin Accent Line Divider */}
                <div className="border-t border-gray-100 dark:border-zinc-800/80 my-2.5"></div>
                {/* Actions Row: Beli Sekarang & Synopsis modal trigger */}
                <div className="flex justify-between items-center mt-auto">
                    <button
                        onClick={(e) => { e.stopPropagation(); addToCart(book); }}
                        className="bg-[#8b0000] text-white px-3 py-2 w-full text-xs font-bold uppercase transition-colors hover:bg-black"
                    >
                        Beli Sekarang
                    </button>
                </div>
                
                {/* Popup Sinopsis */}
                <div className="hidden group-hover:block absolute top-0 -right-4 translate-x-full w-64 bg-white dark:bg-zinc-900 shadow-2xl p-4 z-50 border border-gray-100 dark:border-zinc-800">
                    <h5 className="text-[9px] font-black text-gray-400 uppercase tracking-widest mb-2">Sinopsis</h5>
                    <p className="text-xs text-gray-600 dark:text-gray-300 leading-relaxed font-medium line-clamp-[8]">
                        {getBookSummary(book)}
                    </p>
                    <div className="mt-4 pt-3 border-t border-gray-100 dark:border-zinc-800 flex justify-between items-center">
                        <span className="font-extrabold text-sm text-gray-900 dark:text-white font-mono">RM{book.price.toFixed(2)}</span>
                        <span className="text-[9px] font-bold text-[#8b0000] uppercase tracking-wider bg-[#8b0000]/10 px-2 py-0.5 rounded-none">
                            STOK: {book.stock}
                        </span>
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
        const [couponInput, setCouponInput] = useState(promoCodeApplied);

        const handleApplyCoupon = (e) => {
            e.preventDefault();
            if (couponInput.toUpperCase() === 'TARBIAH10') {
                setPromoDiscount(10);
                setPromoCodeApplied('TARBIAH10');
                addToast('Kupon diskaun 10% berjaya digunakan!');
            } else if (couponInput.trim() === '') {
                setPromoDiscount(0);
                setPromoCodeApplied('');
            } else {
                addToast('Kod kupon tidak sah!', 'error');
            }
        };

        if (cart.length === 0) {
            return (
                <div className="container py-16 text-center animate-in fade-in">
                    <div className="p-8 sm:p-12 bg-white dark:bg-zinc-950 rounded-none border border-gray-100 dark:border-zinc-900 max-w-md mx-auto shadow-sm">
                        <div className="w-20 h-20 bg-gray-50 dark:bg-zinc-900 rounded-full flex items-center justify-center mx-auto mb-6 text-gray-400">
                            <ShoppingCart className="w-10 h-10" />
                        </div>
                        <h3 className="text-xl font-extrabold text-gray-900 dark:text-white mb-2" style={{ fontFamily: 'EB Garamond, serif' }}>Troli Anda Kosong</h3>
                        <p className="text-gray-400 text-sm mb-6 max-w-xs mx-auto">Tambahkan naskhah tarbiah, motivasi, dan novel kegemaran anda ke dalam troli untuk memulakan pembelian.</p>
                        <button onClick={() => setView('catalog')} className="bg-[#8b0000] hover:bg-black text-white px-8 py-3.5 rounded-full font-black text-xs uppercase tracking-widest transition-all duration-300 shadow-md border-0 outline-none cursor-pointer">Kembali Membeli Belah</button>
                    </div>
                </div>
            );
        }

        return (
            <div className="container py-12 animate-in fade-in" style={{ color: '#1a1a1a' }}>
                <div className="flex flex-col text-start mb-8">
                    <span className="text-[#8b0000] text-[9px] font-black tracking-widest uppercase mb-1">Pesanan Anda</span>
                    <h1 className="text-3xl font-extrabold text-gray-900 dark:text-white tracking-tight" style={{ fontFamily: 'EB Garamond, serif' }}>
                        Troli Pembelian <span className="text-[#8b0000] font-mono">({cart.reduce((sum, i) => sum + i.quantity, 0)})</span>
                    </h1>
                </div>

                <div className="row g-5">
                    <div className="col-lg-8">
                        <div className="bg-white dark:bg-zinc-950 rounded-none border border-gray-100 dark:border-zinc-900 p-6 sm:p-8 shadow-sm">
                            <div className="space-y-6">
                                {cart.map(item => (
                                    <div key={item.book.id} className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-6 border-b border-gray-100 dark:border-zinc-900 last:border-0 last:pb-0">
                                        <div className="flex items-center gap-4 flex-grow min-w-0">
                                            <div className="w-16 h-24 bg-[#f4f3f0] dark:bg-zinc-900/60 rounded-none overflow-hidden flex items-center justify-center p-2 shadow-sm shrink-0 border border-gray-100 dark:border-zinc-800/40">
                                                <img src={item.book.cover} className="max-h-full max-w-full object-contain" style={{ filter: 'drop-shadow(0 4px 6px rgba(0,0,0,0.08))' }} />
                                            </div>
                                            <div className="text-start min-w-0">
                                                <span className="text-[9px] font-black uppercase text-gray-400 tracking-wider">{item.book.genre}</span>
                                                <h4 className="text-sm font-bold text-gray-900 dark:text-white leading-tight mb-1 truncate" style={{ fontFamily: 'EB Garamond, serif' }}>{item.book.title}</h4>
                                                <p className="text-[10px] text-gray-400 font-bold truncate">Penulis: {item.book.author}</p>
                                            </div>
                                        </div>

                                        <div className="flex items-center justify-between sm:justify-end gap-6 w-full sm:w-auto">
                                            <div className="text-start sm:text-right shrink-0">
                                                <p className="text-[9px] text-gray-400 font-black uppercase tracking-wider mb-0.5">Harga Seunit</p>
                                                <p className="text-xs font-black text-gray-900 dark:text-white font-mono">RM{item.book.price.toFixed(2)}</p>
                                            </div>

                                            <div className="flex items-center rounded-full bg-gray-50 dark:bg-zinc-900/80 border border-gray-150 dark:border-zinc-800/80 p-1 shrink-0">
                                                <button onClick={() => updateQuantity(item.book.id, -1)} className="w-6 h-6 rounded-full border-0 bg-transparent text-gray-500 hover:bg-gray-200 dark:hover:bg-zinc-800 text-xs font-bold transition-all">-</button>
                                                <span className="px-3 text-xs font-black font-mono text-gray-800 dark:text-white">{item.quantity}</span>
                                                <button onClick={() => updateQuantity(item.book.id, 1)} className="w-6 h-6 rounded-full border-0 bg-transparent text-gray-500 hover:bg-gray-200 dark:hover:bg-zinc-800 text-xs font-bold transition-all">+</button>
                                            </div>

                                            <div className="text-right shrink-0 min-w-[70px]">
                                                <p className="text-[9px] text-gray-400 font-black uppercase tracking-wider mb-0.5">Subjumlah</p>
                                                <p className="text-xs font-black text-[#8b0000] font-mono">RM{(item.book.price * item.quantity).toFixed(2)}</p>
                                            </div>

                                            <button onClick={() => removeFromCart(item.book.id)} className="w-8 h-8 rounded-full bg-transparent border-0 text-gray-400 hover:text-[#8b0000] hover:bg-[#8b0000]/5 flex items-center justify-center transition-all cursor-pointer">
                                                <Trash2 className="w-4 h-4" />
                                            </button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>

                    <div className="col-lg-4">
                        <div className="bg-[#fcfbf9] dark:bg-zinc-900/50 rounded-none border border-gray-100 dark:border-zinc-900 p-6 sm:p-8 shadow-sm text-start">
                            <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-6" style={{ fontFamily: 'EB Garamond, serif' }}>Ringkasan Bil</h3>
                            
                            {/* Promo Code input */}
                            <form onSubmit={handleApplyCoupon} className="mb-6">
                                <label className="text-[9px] font-black uppercase tracking-wider text-gray-400 mb-1.5 block">Mempunyai Kupon / Promo?</label>
                                <div className="flex gap-2">
                                    <input 
                                        type="text" 
                                        placeholder="TARBIAH10 (Diskaun 10%)"
                                        value={couponInput}
                                        onChange={e => setCouponInput(e.target.value)}
                                        className="flex-grow px-4 py-2.5 rounded-none border border-gray-200 focus:border-[#8b0000] outline-none text-xs bg-white dark:bg-zinc-900 text-gray-800 dark:text-white"
                                    />
                                    <button type="submit" className="px-4 py-2.5 bg-black hover:bg-[#8b0000] text-white text-xs font-bold uppercase tracking-wider rounded-none transition-all duration-300 border-0 cursor-pointer">Apply</button>
                                </div>
                                {promoDiscount > 0 && (
                                    <p className="text-[10px] text-green-500 font-bold mt-1.5 flex items-center gap-1">
                                        <Tag className="w-3.5 h-3.5" /> Kupon {promoCodeApplied} aktif (-{promoDiscount}%)
                                    </p>
                                )}
                            </form>

                            <div className="space-y-3 pb-4 border-b border-gray-200 dark:border-zinc-800 text-xs text-gray-600 dark:text-zinc-400">
                                <div className="flex justify-between">
                                    <span>Subjumlah</span>
                                    <span className="font-bold text-gray-800 dark:text-white font-mono">RM{subtotal.toFixed(2)}</span>
                                </div>
                                {promoDiscount > 0 && (
                                    <div className="flex justify-between text-green-600 font-bold">
                                        <span>Diskaun ({promoDiscount}%)</span>
                                        <span className="font-mono">-RM{discountAmount.toFixed(2)}</span>
                                    </div>
                                )}
                                <div className="flex justify-between">
                                    <span>Kos Penghantaran</span>
                                    <span className="text-green-600 font-bold tracking-wider flex items-center gap-1"><Truck className="w-3.5 h-3.5" /> PERCUMA</span>
                                </div>
                                <div className="flex justify-between">
                                    <span>Cukai Perkhidmatan (8%)</span>
                                    <span className="font-bold text-gray-800 dark:text-white font-mono">RM{tax.toFixed(2)}</span>
                                </div>
                            </div>

                            <div className="flex justify-between items-center my-6">
                                <span className="text-sm text-gray-850 dark:text-zinc-200 font-bold">Jumlah Keseluruhan</span>
                                <span className="text-2xl font-black text-[#8b0000] font-mono">RM{total.toFixed(2)}</span>
                            </div>

                            <button 
                                onClick={handleCheckout} 
                                className="w-full py-4 bg-black hover:bg-[#8b0000] text-white font-black text-xs uppercase tracking-widest rounded-full transition-all duration-300 shadow-md border-0 outline-none flex items-center justify-center gap-2 cursor-pointer"
                            >
                                <ShieldCheck className="w-4 h-4" /> Seterusnya Ke Pembayaran
                            </button>
                            
                            <div className="mt-4 flex items-center justify-center gap-1.5 text-[9px] font-bold text-gray-400 uppercase tracking-wider">
                                <ShieldCheck className="w-3.5 h-3.5 text-green-600" /> Secure checkout process
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        );
    };

    const LoginView = () => {
        const [email, setEmail] = useState('');
        const [password, setPassword] = useState('');
        const [showPassword, setShowPassword] = useState(false);

        const onSubmit = (e) => {
            e.preventDefault();
            handleLogin(email, password);
        };

        return (
            <div className="min-h-[85vh] flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8 bg-[#faf9f6] dark:bg-zinc-950 text-start">
                <div className="max-w-5xl w-full bg-white dark:bg-zinc-900 rounded-none shadow-2xl border border-gray-100 dark:border-zinc-800 overflow-hidden flex flex-col md:flex-row">
                    {/* Left Column: Brand Showcase */}
                    <div className="md:w-1/2 bg-gradient-to-br from-charcoal-900 via-charcoal-950 to-black p-8 sm:p-12 text-white flex flex-col justify-between relative overflow-hidden">
                        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(251,191,36,0.08),transparent_50%)]"></div>
                        <div className="absolute -bottom-10 -left-10 w-40 h-40 bg-[#8b0000]/5 rounded-full blur-3xl"></div>
                        
                        <div className="relative z-10 flex items-center gap-3">
                            <div className="w-10 h-10 bg-white/10 backdrop-blur-md rounded-none flex items-center justify-center border border-white/20">
                                <BookOpen className="w-5 h-5 text-amber-400" />
                            </div>
                            <span className="text-xs font-black uppercase tracking-widest font-mono text-amber-400">Tarbiah Sentap</span>
                        </div>

                        <div className="my-12 relative z-10">
                            <span className="text-[10px] font-black uppercase tracking-[0.3em] text-amber-500 mb-3 block">Premium Bookstore</span>
                            <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-white mb-4 leading-tight" style={{ fontFamily: 'EB Garamond, serif' }}>
                                Keindahan Ilmu & <br />
                                <span className="gold-text-gradient font-black">Sentuhan Rohani</span>
                            </h1>
                            <p className="text-zinc-400 text-xs leading-relaxed max-w-sm">
                                Temui koleksi buku tarbiah, motivasi diri, novel islamik, dan bahan bacaan ilmiah premium untuk santapan jiwa yang tenang.
                            </p>
                        </div>

                        <div className="relative z-10 pt-6 border-t border-white/10 flex items-center gap-4">
                            <p className="text-[11px] font-medium text-zinc-400 italic">
                                "Sesungguhnya ilmu itu cahaya, dan cahaya Allah tidak diberikan kepada pelaku maksiat."
                            </p>
                        </div>
                    </div>

                    {/* Right Column: Login Form */}
                    <div className="md:w-1/2 p-8 sm:p-12 flex flex-col justify-center bg-white dark:bg-zinc-900">
                        <div className="mb-8">
                            <h2 className="text-2xl font-black text-gray-900 dark:text-white tracking-tight" style={{ fontFamily: 'EB Garamond, serif' }}>
                                Selamat Kembali
                            </h2>
                            <p className="text-gray-400 dark:text-zinc-500 text-xs mt-1">
                                Sila log masuk ke akaun anda untuk meneruskan pembelian.
                            </p>
                        </div>

                        <form onSubmit={onSubmit} className="space-y-5">
                            <div className="space-y-1.5">
                                <label className="text-[10px] font-black uppercase tracking-wider text-gray-400 dark:text-zinc-500 block">Alamat E-mel</label>
                                <div className="relative">
                                    <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-gray-400">
                                        <Mail className="w-4 h-4" />
                                    </span>
                                    <input 
                                        type="email" 
                                        className="w-full pl-10 pr-4 py-3 rounded-none border border-gray-200 dark:border-zinc-800 focus:border-[#8b0000] dark:focus:border-[#8b0000] outline-none text-xs bg-white dark:bg-zinc-900 text-gray-800 dark:text-white transition-all duration-300"
                                        placeholder="nama@contoh.com"
                                        value={email}
                                        onChange={e => setEmail(e.target.value)}
                                        required 
                                    />
                                </div>
                            </div>
                            
                            <div className="space-y-1.5">
                                <label className="text-[10px] font-black uppercase tracking-wider text-gray-400 dark:text-zinc-500 block">Kata Laluan</label>
                                <div className="relative">
                                    <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-gray-400">
                                        <Lock className="w-4 h-4" />
                                    </span>
                                    <input 
                                        type={showPassword ? "text" : "password"} 
                                        className="w-full pl-10 pr-10 py-3 rounded-none border border-gray-200 dark:border-zinc-800 focus:border-[#8b0000] dark:focus:border-[#8b0000] outline-none text-xs bg-white dark:bg-zinc-900 text-gray-800 dark:text-white transition-all duration-300"
                                        placeholder="Sila masukkan kata laluan"
                                        value={password}
                                        onChange={e => setPassword(e.target.value)}
                                        required 
                                    />
                                    <button 
                                        type="button"
                                        onClick={() => setShowPassword(!showPassword)}
                                        className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-gray-400 hover:text-gray-600 bg-transparent border-0 outline-none"
                                    >
                                        {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                                    </button>
                                </div>
                            </div>

                            <button 
                                type="submit" 
                                className="w-full py-4 bg-black hover:bg-[#8b0000] dark:bg-zinc-800 dark:hover:bg-[#8b0000] text-white hover-shine font-black text-xs uppercase tracking-widest rounded-full transition-all duration-300 shadow-md border-0 outline-none flex items-center justify-center gap-2 cursor-pointer"
                            >
                                <span>Log Masuk</span>
                                <ArrowRight className="w-4 h-4" />
                            </button>
                        </form>

                        <div className="mt-8 text-center pt-5 border-t border-gray-100 dark:border-zinc-800">
                            <button 
                                onClick={() => setView('register')}
                                className="text-xs font-black text-[#8b0000] hover:text-black dark:hover:text-white uppercase tracking-wider transition-colors bg-transparent border-0 p-0 cursor-pointer"
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
        const [name, setName] = useState('');
        const [phone, setPhone] = useState('');
        const [password, setPassword] = useState('');
        const [confirmPassword, setConfirmPassword] = useState('');
        const [showPassword, setShowPassword] = useState(false);

        const onSubmit = (e) => {
            e.preventDefault();
            if (password !== confirmPassword) {
                addToast('Kata laluan tidak sepadan', 'error');
                return;
            }
            if (password.length < 6) {
                addToast('Kata laluan mestilah sekurang-kurangnya 6 aksara', 'error');
                return;
            }
            handleSignup(email, password, name, phone);
        };

        return (
            <div className="min-h-[85vh] flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8 bg-[#faf9f6] dark:bg-zinc-950 text-start">
                <div className="max-w-5xl w-full bg-white dark:bg-zinc-900 rounded-none shadow-2xl border border-gray-100 dark:border-zinc-800 overflow-hidden flex flex-col md:flex-row">
                    {/* Left Column: Brand Showcase */}
                    <div className="md:w-1/2 bg-gradient-to-br from-charcoal-900 via-charcoal-950 to-black p-8 sm:p-12 text-white flex flex-col justify-between relative overflow-hidden">
                        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(251,191,36,0.08),transparent_50%)]"></div>
                        <div className="absolute -bottom-10 -left-10 w-40 h-40 bg-[#8b0000]/5 rounded-full blur-3xl"></div>
                        
                        <div className="relative z-10 flex items-center gap-3">
                            <div className="w-10 h-10 bg-white/10 backdrop-blur-md rounded-none flex items-center justify-center border border-white/20">
                                <BookOpen className="w-5 h-5 text-amber-400" />
                            </div>
                            <span className="text-xs font-black uppercase tracking-widest font-mono text-amber-400">Tarbiah Sentap</span>
                        </div>

                        <div className="my-12 relative z-10">
                            <span className="text-[10px] font-black uppercase tracking-[0.3em] text-amber-500 mb-3 block">Join Us Today</span>
                            <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-white mb-4 leading-tight" style={{ fontFamily: 'EB Garamond, serif' }}>
                                Bina Akaun <br />
                                <span className="gold-text-gradient font-black">Jatidiri Muslim</span>
                            </h1>
                            <p className="text-zinc-400 text-xs leading-relaxed max-w-sm">
                                Sertai komuniti kami untuk menikmati proses pembelian buku yang selamat, dapatkan promosi eksklusif, dan jejaki pesanan anda dalam masa nyata.
                            </p>
                        </div>

                        <div className="relative z-10 pt-6 border-t border-white/10 flex items-center gap-4">
                            <p className="text-[11px] font-medium text-zinc-400 italic">
                                "Sesiapa yang menempuh jalan untuk menuntut ilmu, maka Allah akan memudahkan jalannya ke syurga."
                            </p>
                        </div>
                    </div>

                    {/* Right Column: Register Form */}
                    <div className="md:w-1/2 p-8 sm:p-12 flex flex-col justify-center bg-white dark:bg-zinc-900">
                        <div className="mb-6">
                            <h2 className="text-2xl font-black text-gray-900 dark:text-white tracking-tight" style={{ fontFamily: 'EB Garamond, serif' }}>
                                Daftar Akaun
                            </h2>
                            <p className="text-gray-400 dark:text-zinc-500 text-xs mt-1">
                                Sila lengkapkan maklumat di bawah untuk pendaftaran.
                            </p>
                        </div>

                        <form onSubmit={onSubmit} className="space-y-4">
                            <div className="row g-2">
                                <div className="col-sm-6 space-y-1.5">
                                    <label className="text-[10px] font-black uppercase tracking-wider text-gray-400 dark:text-zinc-500 block">Nama Penuh</label>
                                    <input 
                                        type="text" 
                                        className="w-full px-4 py-3 rounded-none border border-gray-200 dark:border-zinc-800 focus:border-[#8b0000] dark:focus:border-[#8b0000] outline-none text-xs bg-white dark:bg-zinc-900 text-gray-800 dark:text-white transition-all duration-300"
                                        placeholder="Nama anda"
                                        value={name}
                                        onChange={e => setName(e.target.value)}
                                        required 
                                    />
                                </div>
                                <div className="col-sm-6 space-y-1.5">
                                    <label className="text-[10px] font-black uppercase tracking-wider text-gray-400 dark:text-zinc-500 block">No. Telefon</label>
                                    <input 
                                        type="text" 
                                        className="w-full px-4 py-3 rounded-none border border-gray-200 dark:border-zinc-800 focus:border-[#8b0000] dark:focus:border-[#8b0000] outline-none text-xs bg-white dark:bg-zinc-900 text-gray-800 dark:text-white transition-all duration-300"
                                        placeholder="0123456789"
                                        value={phone}
                                        onChange={e => setPhone(e.target.value)}
                                        required 
                                    />
                                </div>
                            </div>

                            <div className="space-y-1.5">
                                <label className="text-[10px] font-black uppercase tracking-wider text-gray-400 dark:text-zinc-500 block">Alamat E-mel</label>
                                <div className="relative">
                                    <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-gray-400">
                                        <Mail className="w-4 h-4" />
                                    </span>
                                    <input 
                                        type="email" 
                                        className="w-full pl-10 pr-4 py-3 rounded-none border border-gray-200 dark:border-zinc-800 focus:border-[#8b0000] dark:focus:border-[#8b0000] outline-none text-xs bg-white dark:bg-zinc-900 text-gray-800 dark:text-white transition-all duration-300"
                                        placeholder="nama@contoh.com"
                                        value={email}
                                        onChange={e => setEmail(e.target.value)}
                                        required 
                                    />
                                </div>
                            </div>
                            
                            <div className="row g-2">
                                <div className="col-sm-6 space-y-1.5">
                                    <label className="text-[10px] font-black uppercase tracking-wider text-gray-400 dark:text-zinc-500 block">Kata Laluan</label>
                                    <div className="relative">
                                        <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-gray-400">
                                            <Lock className="w-4 h-4" />
                                        </span>
                                        <input 
                                            type={showPassword ? "text" : "password"} 
                                            className="w-full pl-10 pr-4 py-3 rounded-none border border-gray-200 dark:border-zinc-800 focus:border-[#8b0000] dark:focus:border-[#8b0000] outline-none text-xs bg-white dark:bg-zinc-900 text-gray-800 dark:text-white transition-all duration-300"
                                            placeholder="Minima 6 aksara"
                                            value={password}
                                            onChange={e => setPassword(e.target.value)}
                                            required 
                                        />
                                    </div>
                                </div>
                                <div className="col-sm-6 space-y-1.5">
                                    <label className="text-[10px] font-black uppercase tracking-wider text-gray-400 dark:text-zinc-500 block">Sahkan Kata Laluan</label>
                                    <div className="relative">
                                        <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-gray-400">
                                            <Lock className="w-4 h-4" />
                                        </span>
                                        <input 
                                            type={showPassword ? "text" : "password"} 
                                            className="w-full pl-10 pr-4 py-3 rounded-none border border-gray-200 dark:border-zinc-800 focus:border-[#8b0000] dark:focus:border-[#8b0000] outline-none text-xs bg-white dark:bg-zinc-900 text-gray-800 dark:text-white transition-all duration-300"
                                            placeholder="Ulang kata laluan"
                                            value={confirmPassword}
                                            onChange={e => setConfirmPassword(e.target.value)}
                                            required 
                                        />
                                    </div>
                                </div>
                            </div>
                            
                            <div className="flex justify-between items-center py-1">
                                <button 
                                    type="button" 
                                    onClick={() => setShowPassword(!showPassword)}
                                    className="text-[10px] font-bold text-gray-500 hover:text-black dark:hover:text-white transition-colors bg-transparent border-0 outline-none p-0 cursor-pointer"
                                >
                                    {showPassword ? "Sembunyikan Kata Laluan" : "Tunjukkan Kata Laluan"}
                                </button>
                            </div>

                            <button 
                                type="submit" 
                                className="w-full py-4 bg-black hover:bg-[#8b0000] dark:bg-zinc-800 dark:hover:bg-[#8b0000] text-white hover-shine font-black text-xs uppercase tracking-widest rounded-full transition-all duration-300 shadow-md border-0 outline-none flex items-center justify-center gap-2 cursor-pointer"
                            >
                                <span>Daftar Akaun</span>
                                <ArrowRight className="w-4 h-4" />
                            </button>
                        </form>

                        <div className="mt-6 text-center pt-4 border-t border-gray-100 dark:border-zinc-800">
                            <button 
                                onClick={() => setView('login')}
                                className="text-xs font-black text-[#8b0000] hover:text-black dark:hover:text-white uppercase tracking-wider transition-colors bg-transparent border-0 p-0 cursor-pointer"
                                style={{ outline: 'none' }}
                            >
                                Sudah ada akaun? Log Masuk
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        );
    };

    const TwoFAView = () => {
        const [otp, setOtp] = useState('');
        return (
            <div className="min-h-[75vh] flex items-center justify-center py-16 px-4 bg-[#faf9f6] dark:bg-zinc-950 text-center">
                <div className="max-w-md w-full bg-white dark:bg-zinc-900 border border-gray-100 dark:border-zinc-800 rounded-none p-8 sm:p-10 shadow-2xl relative overflow-hidden">
                    <div className="absolute top-0 left-0 right-0 h-2 bg-gradient-to-r from-amber-400 to-[#8b0000]"></div>
                    
                    <div className="mb-6 inline-flex items-center justify-center w-16 h-16 rounded-full bg-[#8b0000]/5 text-[#8b0000] border border-[#8b0000]/10">
                        <Lock className="w-6 h-6 animate-pulse" />
                    </div>
                    
                    <h2 className="text-2xl font-black text-gray-900 dark:text-white tracking-tight mb-2" style={{ fontFamily: 'EB Garamond, serif' }}>
                        Pengesahan Vault Dua Faktor
                    </h2>
                    
                    <p className="text-gray-400 dark:text-zinc-500 text-xs leading-relaxed mb-8 max-w-sm mx-auto">
                        Sila masukkan kod 6-digit OTP daripada aplikasi pengesah peranti (authenticator) anda untuk meneruskan akses selamat.
                    </p>

                    <div className="space-y-6">
                        <div className="relative">
                            <input 
                                type="text" 
                                className="w-full text-center py-4 bg-gray-50 dark:bg-zinc-950 border border-gray-200 dark:border-zinc-800 focus:border-[#8b0000] dark:focus:border-[#8b0000] rounded-none outline-none font-mono font-black text-2xl tracking-[0.4em] text-gray-800 dark:text-white transition-all duration-300"
                                placeholder="000000"
                                value={otp}
                                onChange={e => setOtp(e.target.value)}
                                maxLength={6}
                                required
                            />
                        </div>

                        <button 
                            onClick={() => handleVerify2FA(otp)}
                            className="w-full py-4 bg-black hover:bg-[#8b0000] dark:bg-zinc-800 dark:hover:bg-[#8b0000] text-white hover-shine font-black text-xs uppercase tracking-widest rounded-full transition-all duration-300 shadow-md border-0 outline-none flex items-center justify-center gap-2 cursor-pointer"
                        >
                            <ShieldCheck className="w-4.5 h-4.5" /> Sahkan & Log Masuk
                        </button>
                    </div>

                    <div className="mt-8 pt-6 border-t border-gray-100 dark:border-zinc-800 text-[10px] text-gray-400 font-bold uppercase tracking-wider flex items-center justify-center gap-1.5">
                        <span>Petunjuk: gunakan</span>
                        <code className="px-2 py-0.5 bg-gray-100 dark:bg-zinc-800 text-[#8b0000] rounded-none font-mono text-xs">123456</code>
                    </div>
                </div>
            </div>
        );
    };

    const DeviceVerificationView = () => {
        const [code, setCode] = useState('');
        return (
            <div className="min-h-[75vh] flex items-center justify-center py-16 px-4 bg-[#faf9f6] dark:bg-zinc-950 text-center">
                <div className="max-w-md w-full bg-white dark:bg-zinc-900 border border-gray-100 dark:border-zinc-800 rounded-none p-8 sm:p-10 shadow-2xl relative overflow-hidden">
                    <div className="absolute top-0 left-0 right-0 h-2 bg-gradient-to-r from-amber-400 to-[#8b0000]"></div>
                    
                    <div className="mb-6 inline-flex items-center justify-center w-16 h-16 rounded-full bg-[#8b0000]/5 text-[#8b0000] border border-[#8b0000]/10">
                        <Mail className="w-6 h-6 animate-pulse" />
                    </div>
                    
                    <h2 className="text-2xl font-black text-gray-900 dark:text-white tracking-tight mb-2" style={{ fontFamily: 'EB Garamond, serif' }}>
                        Pengesahan Peranti Baru
                    </h2>
                    
                    <p className="text-gray-400 dark:text-zinc-500 text-xs leading-relaxed mb-8 max-w-sm mx-auto">
                        Peranti baru dikesan. Kod pengesahan telah dihantar ke <strong className="text-[#8b0000]">{verifyEmail}</strong>. Sila masukkan kod 6-digit untuk mengesahkan peranti anda.
                    </p>

                    <div className="space-y-6">
                        <div className="relative">
                            <input 
                                type="text" 
                                className="w-full text-center py-4 bg-gray-50 dark:bg-zinc-950 border border-gray-200 dark:border-zinc-800 focus:border-[#8b0000] dark:focus:border-[#8b0000] rounded-none outline-none font-mono font-black text-2xl tracking-[0.4em] text-gray-800 dark:text-white transition-all duration-300"
                                placeholder="000000"
                                value={code}
                                onChange={e => setCode(e.target.value)}
                                maxLength={6}
                                required
                            />
                        </div>

                        <button 
                            onClick={() => handleVerifyDevice(code)}
                            className="w-full py-4 bg-black hover:bg-[#8b0000] dark:bg-zinc-800 dark:hover:bg-[#8b0000] text-white hover-shine font-black text-xs uppercase tracking-widest rounded-full transition-all duration-300 shadow-md border-0 outline-none flex items-center justify-center gap-2 cursor-pointer"
                        >
                            <ShieldCheck className="w-4.5 h-4.5" /> Sahkan Peranti
                        </button>

                        <button 
                            onClick={() => { setVerifyEmail(''); setView('login'); }}
                            className="w-full text-center text-[10px] text-gray-400 hover:text-black dark:hover:text-white bg-transparent border-0 font-bold uppercase tracking-wider mt-3 cursor-pointer outline-none"
                        >
                            Kembali Ke Log Masuk
                        </button>
                    </div>

                    <div className="mt-8 pt-6 border-t border-gray-100 dark:border-zinc-800 text-[10px] text-gray-400 font-bold uppercase tracking-wider flex items-center justify-center gap-1.5">
                        <span>Petunjuk: gunakan</span>
                        <code className="px-2 py-0.5 bg-gray-100 dark:bg-zinc-800 text-[#8b0000] rounded-none font-mono text-xs">123456</code>
                    </div>
                </div>
            </div>
        );
    };

    const CheckoutView = () => {
        // Form states
        const formattedCardNumber = useMemo(() => {
            const clean = cardNumber.replace(/\D/g, '');
            const match = clean.match(/.{1,4}/g);
            return match ? match.join(' ') : '';
        }, [cardNumber]);

        const handleCardNumberChange = (e) => {
            const val = e.target.value;
            setCardNumber(val.slice(0, 19)); // allow spaces
        };

        const handleExpiryChange = (e) => {
            let val = e.target.value.replace(/\D/g, '');
            if (val.length > 2) {
                val = val.slice(0, 2) + '/' + val.slice(2, 4);
            }
            setCardExpiry(val.slice(0, 5));
        };

        const handleCvcChange = (e) => {
            const val = e.target.value.replace(/\D/g, '');
            setCardCvc(val.slice(0, 4));
        };

        return (
            <div className="container py-8 max-w-6xl text-start animate-in slide-in-from-bottom-12 fade-in duration-500">
                <div className="row g-5">
                    {/* Left Column: Form & Live Card */}
                    <div className="col-lg-7 space-y-8">
                        {/* Live Card Preview */}
                        <div className="flex flex-col items-center justify-center p-6 bg-[#fcfbf9] dark:bg-zinc-900/40 rounded-none border border-gray-100 dark:border-zinc-900 shadow-sm overflow-hidden">
                            <label className="text-[10px] font-black uppercase tracking-wider text-gray-400 mb-4 block self-start">Kad Pembayaran Virtual</label>
                            
                            {/* Slick Visa/Mastercard Mock Card */}
                            <div className="relative w-full max-w-[340px] aspect-[1.586/1] bg-gradient-to-br from-charcoal-900 via-charcoal-950 to-black rounded-none p-6 text-white shadow-xl border border-white/5 flex flex-col justify-between overflow-hidden group">
                                <div className="absolute inset-0 bg-[radial-gradient(circle_at_bottom_left,rgba(251,191,36,0.1),transparent_70%)]"></div>
                                <div className="absolute -top-12 -right-12 w-32 h-32 bg-amber-400/5 rounded-full blur-3xl"></div>
                                
                                {/* Top: Chip & Visa/Mastercard */}
                                <div className="flex justify-between items-start relative z-10">
                                    <div className="w-11 h-8 bg-gradient-to-r from-amber-300 to-amber-500 rounded-none shadow-inner flex flex-col justify-between p-1.5">
                                        <div className="h-[2px] bg-black/10 rounded"></div>
                                        <div className="h-[2px] bg-black/10 rounded"></div>
                                        <div className="h-[2px] bg-black/10 rounded"></div>
                                    </div>
                                    <div className="text-right font-black italic tracking-wider text-xs bg-white/10 px-3 py-1 rounded-none text-amber-400 border border-white/5">
                                        PREMIUM CARD
                                    </div>
                                </div>

                                {/* Middle: Card Number */}
                                <div className="relative z-10 font-mono text-lg sm:text-xl tracking-widest text-center py-2 text-zinc-100">
                                    {formattedCardNumber || '•••• •••• •••• ••••'}
                                </div>

                                {/* Bottom: Cardholder Name & Expiry */}
                                <div className="flex justify-between items-end relative z-10 text-[10px] text-zinc-400 font-bold uppercase tracking-widest">
                                    <div className="text-start">
                                        <p className="text-[8px] opacity-50 mb-0.5">Pemegang Kad</p>
                                        <p className="text-white mb-0 font-medium font-sans max-w-[150px] truncate">{cardholderName || checkoutName || user?.name || 'PELANGGAN'}</p>
                                    </div>
                                    <div className="text-center px-2">
                                        <p className="text-[8px] opacity-50 mb-0.5">Tamat</p>
                                        <p className="text-white mb-0 font-mono">{cardExpiry || 'MM/YY'}</p>
                                    </div>
                                    <div className="text-right">
                                        <p className="text-[8px] opacity-50 mb-0.5">CVC</p>
                                        <p className="text-white mb-0 font-mono">{cardCvc || '•••'}</p>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Shipping Fields & Card Fields Form */}
                        <div className="bg-white dark:bg-zinc-900 rounded-none border border-gray-100 dark:border-zinc-800 p-6 sm:p-8 shadow-sm space-y-6">
                            <h3 className="text-lg font-bold text-gray-900 dark:text-white" style={{ fontFamily: 'EB Garamond, serif' }}>Maklumat Penghantaran & Pembayaran</h3>
                            
                            {/* Shipping Information Group */}
                            <div className="space-y-4">
                                <div className="row g-3">
                                    <div className="col-sm-6 space-y-1.5">
                                        <label className="text-[10px] font-black uppercase tracking-wider text-gray-400 block">Nama Penuh Penerima</label>
                                        <input 
                                            type="text" 
                                            className="w-full px-4 py-3 rounded-none border border-gray-200 dark:border-zinc-800 focus:border-[#8b0000] outline-none text-xs bg-white dark:bg-zinc-900 text-gray-800 dark:text-white transition-all duration-300"
                                            placeholder="Nama penuh anda"
                                            value={checkoutName}
                                            onChange={e => setCheckoutName(e.target.value)}
                                            required 
                                        />
                                    </div>
                                    <div className="col-sm-6 space-y-1.5">
                                        <label className="text-[10px] font-black uppercase tracking-wider text-gray-400 block">No. Telefon</label>
                                        <input 
                                            type="text" 
                                            className="w-full px-4 py-3 rounded-none border border-gray-200 dark:border-zinc-800 focus:border-[#8b0000] outline-none text-xs bg-white dark:bg-zinc-900 text-gray-800 dark:text-white transition-all duration-300"
                                            placeholder="cth: 0123456789"
                                            value={checkoutPhone}
                                            onChange={e => setCheckoutPhone(e.target.value)}
                                            required 
                                        />
                                    </div>
                                </div>

                                <div className="space-y-1.5">
                                    <label className="text-[10px] font-black uppercase tracking-wider text-gray-400 block">Alamat Penuh</label>
                                    <textarea 
                                        className="w-full px-4 py-3 rounded-none border border-gray-200 dark:border-zinc-800 focus:border-[#8b0000] outline-none text-xs bg-white dark:bg-zinc-900 text-gray-800 dark:text-white transition-all duration-300"
                                        placeholder="Masukkan alamat penghantaran lengkap anda"
                                        value={billingAddress}
                                        onChange={e => setBillingAddress(e.target.value)}
                                        rows="3"
                                        required
                                    />
                                </div>

                                <div className="row g-3">
                                    <div className="col-sm-6 space-y-1.5">
                                        <label className="text-[10px] font-black uppercase tracking-wider text-gray-400 block">Bandar / City</label>
                                        <input 
                                            type="text" 
                                            className="w-full px-4 py-3 rounded-none border border-gray-200 dark:border-zinc-800 focus:border-[#8b0000] outline-none text-xs bg-white dark:bg-zinc-900 text-gray-800 dark:text-white transition-all duration-300"
                                            placeholder="cth: Shah Alam"
                                            value={checkoutCity}
                                            onChange={e => setCheckoutCity(e.target.value)}
                                            required 
                                        />
                                    </div>
                                    <div className="col-sm-6 space-y-1.5">
                                        <label className="text-[10px] font-black uppercase tracking-wider text-gray-400 block">Poskod / Postal Code</label>
                                        <input 
                                            type="text" 
                                            className="w-full px-4 py-3 rounded-none border border-gray-200 dark:border-zinc-800 focus:border-[#8b0000] outline-none text-xs bg-white dark:bg-zinc-900 text-gray-800 dark:text-white transition-all duration-300"
                                            placeholder="cth: 40000"
                                            value={checkoutPostalCode}
                                            onChange={e => setCheckoutPostalCode(e.target.value)}
                                            required 
                                        />
                                    </div>
                                </div>
                            </div>

                            <hr className="border-gray-100 dark:border-zinc-800 my-6" />

                            {/* Card Details Input */}
                            <div className="space-y-4">
                                <div className="space-y-1.5">
                                    <label className="text-[10px] font-black uppercase tracking-wider text-gray-400 block">Nama Pemilik Kad</label>
                                    <input 
                                        type="text" 
                                        className="w-full px-4 py-3 rounded-none border border-gray-200 dark:border-zinc-800 focus:border-[#8b0000] outline-none text-xs bg-white dark:bg-zinc-900 text-gray-800 dark:text-white transition-all duration-300"
                                        placeholder="cth: AHMAD BIN ALI"
                                        value={cardholderName}
                                        onChange={e => setCardholderName(e.target.value.toUpperCase())}
                                        required 
                                    />
                                </div>

                                <div className="space-y-1.5">
                                    <label className="text-[10px] font-black uppercase tracking-wider text-gray-400 block">Nombor Kad Kredit</label>
                                    <div className="relative">
                                        <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-gray-400">
                                            <CreditCard className="w-4 h-4" />
                                        </span>
                                        <input 
                                            type="text" 
                                            className="w-full pl-10 pr-4 py-3 rounded-none border border-gray-200 dark:border-zinc-800 focus:border-[#8b0000] outline-none text-xs bg-white dark:bg-zinc-900 text-gray-800 dark:text-white transition-all duration-300 font-mono"
                                            placeholder="4111 1111 1111 1111"
                                            value={formattedCardNumber}
                                            onChange={handleCardNumberChange}
                                            required
                                        />
                                    </div>
                                </div>

                                <div className="row g-3">
                                    <div className="col-6 space-y-1.5">
                                        <label className="text-[10px] font-black uppercase tracking-wider text-gray-400 block">Tarikh Tamat</label>
                                        <input 
                                            type="text" 
                                            className="w-full px-4 py-3 rounded-none border border-gray-200 dark:border-zinc-800 focus:border-[#8b0000] outline-none text-xs bg-white dark:bg-zinc-900 text-gray-800 dark:text-white transition-all duration-300 font-mono"
                                            placeholder="MM/YY"
                                            value={cardExpiry}
                                            onChange={handleExpiryChange}
                                            required
                                        />
                                    </div>
                                    <div className="col-6 space-y-1.5">
                                        <label className="text-[10px] font-black uppercase tracking-wider text-gray-400 block">CVC / CVV</label>
                                        <input 
                                            type="password" 
                                            className="w-full px-4 py-3 rounded-none border border-gray-200 dark:border-zinc-800 focus:border-[#8b0000] outline-none text-xs bg-white dark:bg-zinc-900 text-gray-800 dark:text-white transition-all duration-300 font-mono"
                                            placeholder="123"
                                            value={cardCvc}
                                            onChange={handleCvcChange}
                                            maxLength={4}
                                            required
                                        />
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Right Column: Order Summary */}
                    <div className="col-lg-5">
                        <div className="bg-[#fcfbf9] dark:bg-zinc-900/50 rounded-none border border-gray-100 dark:border-zinc-900 p-6 sm:p-8 shadow-sm">
                            <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-6" style={{ fontFamily: 'EB Garamond, serif' }}>Troli Anda</h3>
                            
                            <div className="mb-6 max-h-[300px] overflow-y-auto pr-2 divide-y divide-gray-100 dark:divide-zinc-800 space-y-4">
                                {cart.map(item => (
                                    <div key={item.book.id} className="flex gap-4 items-center py-3">
                                        <img src={item.book.cover} className="rounded-none border border-gray-100 dark:border-zinc-800 shrink-0 object-cover" style={{ width: '45px', height: '65px' }} alt="" />
                                        <div className="flex-grow text-start">
                                            <p className="mb-0.5 font-bold text-gray-900 dark:text-white text-xs leading-snug">{item.book.title}</p>
                                            <p className="text-gray-400 text-[10px] font-bold uppercase tracking-wider">{item.quantity} unit • RM{item.book.price.toFixed(2)}</p>
                                        </div>
                                        <div className="shrink-0 text-right font-black text-xs text-gray-800 dark:text-white font-mono">
                                            RM{(item.book.price * item.quantity).toFixed(2)}
                                        </div>
                                    </div>
                                ))}
                            </div>

                            <div className="space-y-3 pb-4 border-b border-gray-200 dark:border-zinc-800 text-xs text-gray-600 dark:text-zinc-400 border-t pt-4">
                                <div className="flex justify-between">
                                    <span>Subjumlah</span>
                                    <span className="font-bold text-gray-850 dark:text-zinc-205 font-mono">RM{subtotal.toFixed(2)}</span>
                                </div>
                                {promoDiscount > 0 && (
                                    <div className="flex justify-between text-green-600 font-bold">
                                        <span>Diskaun ({promoDiscount}%)</span>
                                        <span className="font-mono">-RM{discountAmount.toFixed(2)}</span>
                                    </div>
                                )}
                                <div className="flex justify-between">
                                    <span>Kos Penghantaran</span>
                                    <span className="text-green-600 font-bold tracking-wider flex items-center gap-1"><Truck className="w-3.5 h-3.5" /> PERCUMA</span>
                                </div>
                                <div className="flex justify-between">
                                    <span>Cukai Perkhidmatan (8%)</span>
                                    <span className="font-bold text-gray-850 dark:text-zinc-205 font-mono">RM{tax.toFixed(2)}</span>
                                </div>
                            </div>

                            <div className="flex justify-between items-center my-6">
                                <span className="text-sm text-gray-850 dark:text-zinc-200 font-bold">Jumlah Keseluruhan</span>
                                <span className="text-2xl font-black text-[#8b0000] font-mono">RM{total.toFixed(2)}</span>
                            </div>

                            <button 
                                onClick={processPayment} 
                                className="w-full py-4 bg-black hover:bg-[#8b0000] dark:bg-zinc-800 dark:hover:bg-[#8b0000] text-white font-black text-xs uppercase tracking-widest rounded-full transition-all duration-300 shadow-md border-0 outline-none flex items-center justify-center gap-2 cursor-pointer"
                            >
                                <ShieldCheck className="w-4.5 h-4.5" /> Seterusnya Ke Pembayaran
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        );
    };

    const PaymentGatewayView = () => {
        const [processing, setProcessing] = useState(false);

        const handleOutcome = (status) => {
            setProcessing(true);
            setTimeout(() => {
                setProcessing(false);
                completeTransaction(status);
            }, 2000);
        };

        const maskedCard = cardNumber ? `•••• •••• •••• ${cardNumber.replace(/\s/g, '').slice(-4)}` : '•••• •••• •••• 1234';

        return (
            <div className="max-w-md mx-auto px-4 py-16 animate-in zoom-in duration-300 text-start" style={{ color: '#1a1a1a' }}>
                <div className="bg-white dark:bg-zinc-900 border border-gray-200 dark:border-zinc-850 rounded-none p-8 sm:p-10 shadow-2xl relative overflow-hidden">
                    <div className="text-center mb-8 border-b border-gray-100 dark:border-zinc-800 pb-6">
                        <div className="bg-[#8b0000]/10 w-16 h-16 rounded-none flex items-center justify-center mx-auto mb-4 text-[#8b0000]">
                            <ShieldCheck className="w-8 h-8 animate-pulse" />
                        </div>
                        <h2 className="text-2xl font-black text-gray-905 dark:text-white tracking-tight" style={{ fontFamily: 'EB Garamond, serif' }}>
                            Gerbang <span className="text-[#8b0000]">Pembayaran Selamat</span>
                        </h2>
                        <p className="text-[9px] text-muted font-bold uppercase tracking-widest mt-1">Simulasi Bank Authorization Gateway</p>
                    </div>

                    {processing ? (
                        <div className="text-center py-12 flex flex-col items-center justify-center gap-4">
                            <Loader2 className="w-12 h-12 text-[#8b0000] animate-spin" />
                            <p className="text-sm text-gray-600 font-bold uppercase tracking-widest animate-pulse">Menghubungi Rangkaian Bank...</p>
                            <p className="text-[10px] text-muted uppercase tracking-wide">Mengesahkan token transaksi selamat</p>
                        </div>
                    ) : (
                        <div className="space-y-8">
                            {/* Visa/Mastercard Mock Card */}
                            <div className="bg-gradient-to-br from-charcoal-900 to-black rounded-none p-6 shadow-inner relative overflow-hidden text-white border border-white/5">
                                <div className="absolute top-4 right-6 text-white/10 font-black text-4xl italic">VISA</div>
                                <div className="w-10 h-8 bg-white/10 rounded-none mb-8 flex items-center justify-center shadow-inner">
                                    <div className="w-6 h-5 bg-white/20 rounded-none"></div>
                                </div>
                                <div className="font-mono text-lg tracking-widest mb-6 text-white">{maskedCard}</div>
                                <div className="flex justify-between items-center text-[10px] text-gray-400 font-bold uppercase tracking-widest">
                                    <div>
                                        <p className="text-[8px] opacity-60 mb-0.5 text-gray-400">Pemilik Kad</p>
                                        <p className="text-white mb-0">{cardholderName || checkoutName || user?.name || 'Pelanggan'}</p>
                                    </div>
                                    <div className="text-right">
                                        <p className="text-[8px] opacity-60 mb-0.5 text-gray-400">Tamat Tempoh</p>
                                        <p className="text-white mb-0">{cardExpiry || 'MM/YY'}</p>
                                    </div>
                                </div>
                            </div>

                            <div className="bg-gray-50 dark:bg-zinc-950 p-4 rounded-none border border-gray-200 dark:border-zinc-800 space-y-3">
                                <div className="flex justify-between items-center text-[11px] text-gray-600 dark:text-zinc-400 font-bold uppercase tracking-widest">
                                    <span>ID Merchant</span>
                                    <span className="text-dark dark:text-white font-black">TS-MERCHANT-89</span>
                                </div>
                                <div className="flex justify-between items-center text-[11px] text-gray-600 dark:text-zinc-400 font-bold uppercase tracking-widest">
                                    <span>Sufiks Kad</span>
                                    <span className="text-dark dark:text-white font-black">{cardNumber.replace(/\s/g, '').slice(-4) || '1234'}</span>
                                </div>
                                <div className="h-px bg-gray-200 dark:bg-zinc-800 my-2"></div>
                                <div className="flex justify-between items-center">
                                    <span className="text-[11px] text-gray-700 dark:text-zinc-300 font-bold uppercase tracking-widest">Jumlah Bil</span>
                                    <span className="text-xl font-black text-[#8b0000] font-mono">RM{total.toFixed(2)}</span>
                                </div>
                            </div>

                            <div className="space-y-4 pt-4 border-t border-gray-100 dark:border-zinc-800">
                                <label className="block text-center text-[9px] font-bold text-gray-500 uppercase tracking-[0.2em] mb-4">Pilih Hasil Simulasi</label>
                                <div className="row g-3">
                                    <div className="col-6">
                                        <button 
                                            onClick={() => handleOutcome('success')}
                                            className="w-full py-3 bg-green-600 hover:bg-green-700 text-white font-black text-xs uppercase tracking-wider rounded-none transition-all duration-300 border-0 outline-none cursor-pointer flex items-center justify-center gap-1.5"
                                        >
                                            <Check className="w-4 h-4" /> Berjaya
                                        </button>
                                    </div>
                                    <div className="col-6">
                                        <button 
                                            onClick={() => handleOutcome('fail')}
                                            className="w-full py-3 bg-[#8b0000] hover:bg-[#cf1b1b] text-white font-black text-xs uppercase tracking-wider rounded-none transition-all duration-300 border-0 outline-none cursor-pointer flex items-center justify-center gap-1.5"
                                        >
                                            <X className="w-4 h-4" /> Gagal
                                        </button>
                                    </div>
                                </div>
                                <button 
                                    onClick={() => setView('checkout')}
                                    className="w-full text-center text-[10px] text-gray-400 hover:text-black dark:hover:text-white bg-transparent border-0 font-bold uppercase tracking-wider mt-3 cursor-pointer outline-none"
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

    const OrdersView = () => {
        return (
            <div className="container py-8 max-w-4xl text-start animate-in fade-in duration-500" style={{ color: '#1a1a1a' }}>
                <div className="flex justify-between items-center mb-8">
                    <div>
                        <h1 className="text-2xl font-black text-gray-900 dark:text-white tracking-tight" style={{ fontFamily: 'EB Garamond, serif' }}>
                            Sejarah <span className="text-[#8b0000]">Pesanan</span>
                        </h1>
                        <p className="text-gray-400 dark:text-zinc-500 text-xs mt-1">Jejaki status pesanan dan dapatkan resit pembelian anda.</p>
                    </div>
                </div>

                {orders.length === 0 ? (
                    <div className="p-12 bg-white dark:bg-zinc-900 text-center rounded-none border border-gray-100 dark:border-zinc-800 shadow-sm flex flex-col items-center">
                        <div className="bg-gray-50 dark:bg-zinc-950 p-4 rounded-full text-gray-300 dark:text-zinc-700 mb-4">
                            <Package className="w-8 h-8" />
                        </div>
                        <p className="text-gray-400 dark:text-zinc-500 text-sm font-bold uppercase tracking-wider mb-0">Tiada sejarah transaksi dijumpai.</p>
                    </div>
                ) : (
                    <div className="space-y-6">
                        {orders.map(order => {
                            const orderTotal = order.total_amount;
                            const orderSubtotal = orderTotal / 1.08;
                            const orderTax = orderTotal - orderSubtotal;

                            return (
                                <div key={order.id} className="bg-white dark:bg-zinc-900 rounded-none border border-gray-100 dark:border-zinc-800 p-6 sm:p-8 shadow-sm space-y-6">
                                    
                                    {/* Order Header */}
                                    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center pb-4 border-b border-gray-100 dark:border-zinc-800 gap-4">
                                        <div>
                                            <p className="text-gray-400 dark:text-zinc-500 text-[9px] font-black uppercase tracking-widest mb-0.5">Rujukan Transaksi</p>
                                            <h3 className="text-lg font-black text-gray-900 dark:text-white font-mono uppercase">REF-{order.id.split('-')[0].toUpperCase()}</h3>
                                        </div>
                                        <div className="flex items-center gap-3">
                                            <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider border ${
                                                order.status === 'completed' 
                                                ? 'border-green-200 dark:border-green-900 bg-green-50 dark:bg-green-950 text-green-700 dark:text-green-400' 
                                                : 'border-amber-200 dark:border-amber-900 bg-amber-50 dark:bg-amber-950 text-amber-700 dark:text-amber-400'
                                            }`}>
                                                {order.status === 'completed' ? 'Selesai' : order.status}
                                            </span>
                                            <p className="text-gray-400 dark:text-zinc-500 text-xs font-mono mb-0">{new Date(order.created_at).toLocaleDateString('ms-MY', { day: 'numeric', month: 'short', year: 'numeric' })}</p>
                                        </div>
                                    </div>

                                    {/* Interactive Progress Stepper */}
                                    <div className="py-4">
                                        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center relative gap-6 sm:gap-2">
                                            {/* Line background */}
                                            <div className="hidden sm:block absolute left-[12.5%] right-[12.5%] top-[14px] h-0.5 bg-gray-100 dark:bg-zinc-800 z-0"></div>
                                            
                                            {/* Active progress color bar */}
                                            <div className="hidden sm:block absolute left-[12.5%] right-[37.5%] top-[14px] h-0.5 bg-green-500 z-0"></div>

                                            {/* Stepper items */}
                                            {[
                                                { label: 'Jualan Dibuat', date: 'Masa Nyata', active: true, done: true },
                                                { label: 'Pembayaran Lulus', date: 'Lulus', active: true, done: true },
                                                { label: 'Dalam Pemprosesan', date: 'Selesai', active: true, done: order.status === 'completed' },
                                                { label: 'Dihantar / Diterima', date: 'Selesai', active: order.status === 'completed', done: order.status === 'completed' }
                                            ].map((step, idx) => (
                                                <div key={idx} className="flex sm:flex-col items-center gap-3 sm:gap-2 relative z-10 sm:text-center w-full sm:w-1/4">
                                                    <div className={`w-8 h-8 rounded-full flex items-center justify-center border-2 transition-all duration-500 ${
                                                        step.done 
                                                        ? 'bg-green-500 border-green-500 text-white shadow-md' 
                                                        : step.active 
                                                        ? 'bg-white dark:bg-zinc-900 border-green-500 text-green-500 animate-pulse' 
                                                        : 'bg-white dark:bg-zinc-900 border-gray-200 dark:border-zinc-800 text-gray-300 dark:text-zinc-700'
                                                    }`}>
                                                        {step.done ? <Check className="w-4 h-4" /> : <div className="w-1.5 h-1.5 rounded-full bg-current"></div>}
                                                    </div>
                                                    <div className="text-start sm:text-center">
                                                        <p className="text-[10px] font-bold text-gray-800 dark:text-white tracking-tight leading-tight mb-0.5">{step.label}</p>
                                                        <p className="text-[8px] font-bold text-gray-400 dark:text-zinc-500 uppercase tracking-widest leading-none mb-0">{step.date}</p>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    </div>

                                    {/* Order Items Table / Detail */}
                                    <div className="bg-[#fcfbf9] dark:bg-zinc-900/40 border border-gray-100 dark:border-zinc-900 rounded-none p-6 space-y-4">
                                        <p className="text-[10px] font-black uppercase tracking-wider text-gray-400 border-b border-gray-150 dark:border-zinc-800 pb-2">Senarai Buku</p>
                                        
                                        <div className="divide-y divide-gray-100 dark:divide-zinc-800">
                                            {order.items.map((item, idx) => (
                                                <div key={idx} className="flex gap-4 items-center py-3 first:pt-0 last:pb-0">
                                                    <div className="w-10 h-14 bg-gray-100 dark:bg-zinc-800 rounded-none overflow-hidden shrink-0 border border-gray-200/10">
                                                        <BookOpen className="w-full h-full p-3.5 text-gray-400 dark:text-zinc-600" />
                                                    </div>
                                                    <div className="flex-grow text-start">
                                                        <p className="mb-0.5 font-bold text-gray-900 dark:text-white text-xs">{item.book_title || `Buku ID: ${item.book_id}`}</p>
                                                        <p className="text-gray-400 text-[10px] font-bold uppercase tracking-wider">{item.quantity} unit • RM{(item.price || 0).toFixed(2)}</p>
                                                    </div>
                                                    <div className="shrink-0 text-right font-black text-xs text-gray-800 dark:text-white font-mono">
                                                        RM{((item.price || 0) * item.quantity).toFixed(2)}
                                                    </div>
                                                </div>
                                            ))}
                                        </div>

                                        <hr className="border-gray-200 dark:border-zinc-800 my-4" />

                                        {/* Bill Summaries & Printable Invoice Trigger */}
                                        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end gap-4 text-xs">
                                            <div className="space-y-1 text-gray-500 dark:text-zinc-400 text-start">
                                                <p>Subjumlah: <span className="font-bold text-gray-850 dark:text-zinc-200 font-mono">RM{orderSubtotal.toFixed(2)}</span></p>
                                                <p>Cukai Perkhidmatan (8%): <span className="font-bold text-gray-850 dark:text-zinc-200 font-mono">RM{orderTax.toFixed(2)}</span></p>
                                                <p className="text-sm font-black text-gray-900 dark:text-white mt-1.5">Jumlah Dibayar: <span className="text-[#8b0000] font-mono font-black">RM{orderTotal.toFixed(2)}</span></p>
                                            </div>
                                            <button 
                                                onClick={() => window.print()}
                                                className="px-4 py-2.5 rounded-none bg-white dark:bg-zinc-800 hover:bg-gray-100 dark:hover:bg-zinc-700 text-gray-800 dark:text-white text-[10px] font-black uppercase tracking-wider border border-gray-250 dark:border-zinc-700 flex items-center gap-1.5 shadow-sm transition-all cursor-pointer outline-none"
                                            >
                                                <FileText className="w-3.5 h-3.5" /> Cetak Resit Rasmi
                                            </button>
                                        </div>
                                    </div>

                                </div>
                            );
                        })}
                    </div>
                )}
            </div>
        );
    };

    const AdminView = () => {
        const [activeTab, setActiveTab] = useState('dashboard');
        const [allOrders, setAllOrders] = useState([]);
        const [searchQuery, setSearchQuery] = useState('');

        useEffect(() => {
            if (activeTab === 'orders') {
                adminApi.getAllOrders().then(res => {
                    if (res.data.success) setAllOrders(res.data.data);
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

        const filteredBooks = useMemo(() => {
            if (!searchQuery.trim()) return books;
            return books.filter(b => 
                b.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
                b.author.toLowerCase().includes(searchQuery.toLowerCase())
            );
        }, [books, searchQuery]);

        return (
            <div className="container py-8 text-start animate-in zoom-in duration-500" style={{ color: '#1a1a1a' }}>
                <div className="row g-4">
                    {/* Sidebar Navigation */}
                    <div className="col-lg-3">
                        <div className="p-6 bg-white dark:bg-zinc-900 rounded-none border border-gray-100 dark:border-zinc-800 shadow-sm sticky-top" style={{ top: '100px', zIndex: 10 }}>
                            <div className="mb-6">
                                <h3 className="mb-1 font-black text-gray-900 dark:text-white" style={{ fontFamily: 'EB Garamond, serif' }}>
                                    Urus Setia <span className="text-[#8b0000]">Tarbiah</span>
                                </h3>
                                <p className="text-gray-400 dark:text-zinc-500 text-[9px] font-black uppercase tracking-widest">Hab Pengurusan</p>
                            </div>
                            
                            <nav className="nav flex-column gap-1">
                                {tabs.map(tab => (
                                    <button
                                        key={tab.id}
                                        onClick={() => setActiveTab(tab.id)}
                                        className={`btn text-start d-flex align-items-center gap-3 py-3 px-4 border-0 transition-all duration-300 outline-none ${
                                            activeTab === tab.id 
                                            ? 'bg-black text-white dark:bg-zinc-800 rounded-none shadow-md font-black' 
                                            : 'text-gray-500 hover:text-black dark:text-zinc-400 dark:hover:text-white bg-transparent rounded-none'
                                        }`}
                                    >
                                        <tab.icon className="w-4 h-4 shrink-0" />
                                        <span className="text-xs uppercase tracking-wider font-bold">{tab.label}</span>
                                    </button>
                                ))}
                            </nav>

                            <div className="mt-6 pt-4 border-t border-gray-100 dark:border-zinc-850">
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
                                    className="w-full py-3 bg-[#8b0000]/5 text-[#8b0000] hover:bg-[#8b0000] hover:text-white text-[10px] font-black uppercase tracking-widest rounded-none transition-all duration-300 border-0 outline-none flex items-center justify-center gap-2 cursor-pointer"
                                >
                                    <FileText className="w-4 h-4" /> Eksport Data Kedai
                                </button>
                            </div>
                        </div>
                    </div>

                    {/* Main Content Area */}
                    <div className="col-lg-9">
                        <div className="d-flex justify-content-between align-items-center mb-6">
                            <h2 className="text-xl font-black text-gray-900 dark:text-white uppercase tracking-tight" style={{ fontFamily: 'EB Garamond, serif' }}>
                                {tabs.find(t => t.id === activeTab)?.label}
                            </h2>
                            {activeTab === 'books' && (
                                <button className="px-4 py-2.5 bg-black hover:bg-[#8b0000] text-white text-xs font-black uppercase tracking-wider rounded-none transition-all duration-300 border-0 cursor-pointer">
                                    <Plus className="w-4 h-4 inline mr-1" /> Tambah Buku Baru
                                </button>
                            )}
                        </div>

                        {/* Tab Content: Dashboard */}
                        {activeTab === 'dashboard' && (
                            <div className="space-y-6 animate-in fade-in duration-300">
                                <div className="row g-3">
                                    {/* Metric Card 1: Revenue */}
                                    <div className="col-md-4">
                                        <div className="p-6 bg-white dark:bg-zinc-900 rounded-none border border-gray-100 dark:border-zinc-800 shadow-sm relative overflow-hidden group hover:border-[#8b0000]/30 transition-all duration-500">
                                            <p className="text-gray-400 dark:text-zinc-500 font-black text-[9px] uppercase tracking-widest mb-1">Jumlah Pendapatan</p>
                                            <h3 className="text-2xl font-black text-gray-900 dark:text-white font-mono">RM12,450</h3>
                                            
                                            {/* Mini SVG Sparkline Trend */}
                                            <div className="mt-3">
                                                <svg className="w-full h-8 text-green-500" viewBox="0 0 100 20" preserveAspectRatio="none">
                                                    <path d="M0,18 Q15,15 30,12 T60,8 T90,3 T100,1" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                                                </svg>
                                            </div>
                                            <div className="flex align-items-center gap-2 mt-3 text-[10px] font-bold text-green-600">
                                                <span className="px-2 py-0.5 rounded bg-green-50 dark:bg-green-950">+14% Suku Ini</span>
                                            </div>
                                        </div>
                                    </div>
                                    
                                    {/* Metric Card 2: Customers */}
                                    <div className="col-md-4">
                                        <div className="p-6 bg-white dark:bg-zinc-900 rounded-none border border-gray-100 dark:border-zinc-800 shadow-sm relative overflow-hidden group hover:border-[#8b0000]/30 transition-all duration-500">
                                            <p className="text-gray-400 dark:text-zinc-500 font-black text-[9px] uppercase tracking-widest mb-1">Pelanggan Berdaftar</p>
                                            <h3 className="text-2xl font-black text-gray-900 dark:text-white font-mono">1,204</h3>
                                            
                                            {/* Mini SVG Sparkline Trend */}
                                            <div className="mt-3">
                                                <svg className="w-full h-8 text-blue-500" viewBox="0 0 100 20" preserveAspectRatio="none">
                                                    <path d="M0,16 Q20,10 40,14 T70,8 T90,4 T100,2" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                                                </svg>
                                            </div>
                                            <div className="flex align-items-center gap-2 mt-3 text-[10px] font-bold text-blue-600">
                                                <span className="px-2 py-0.5 rounded bg-blue-50 dark:bg-blue-950">+5% Aktif</span>
                                            </div>
                                        </div>
                                    </div>
                                    
                                    {/* Metric Card 3: Orders */}
                                    <div className="col-md-4">
                                        <div className="p-6 bg-white dark:bg-zinc-900 rounded-none border border-gray-100 dark:border-zinc-800 shadow-sm relative overflow-hidden group hover:border-[#8b0000]/30 transition-all duration-500">
                                            <p className="text-gray-400 dark:text-zinc-500 font-black text-[9px] uppercase tracking-widest mb-1">Jumlah Transaksi</p>
                                            <h3 className="text-2xl font-black text-gray-900 dark:text-white font-mono">456</h3>
                                            
                                            {/* Mini SVG Sparkline Trend */}
                                            <div className="mt-3">
                                                <svg className="w-full h-8 text-[#8b0000]" viewBox="0 0 100 20" preserveAspectRatio="none">
                                                    <path d="M0,12 Q20,15 40,8 T70,12 T90,5 T100,4" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                                                </svg>
                                            </div>
                                            <div className="flex align-items-center gap-2 mt-3 text-[10px] font-bold text-[#8b0000]">
                                                <span className="px-2 py-0.5 rounded bg-amber-50 dark:bg-amber-950">-2% Sesi Ini</span>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                                
                                <div className="p-8 bg-white dark:bg-zinc-900 rounded-none border border-gray-100 dark:border-zinc-800 text-center shadow-sm relative overflow-hidden flex flex-col items-center justify-center min-h-[300px]">
                                    <div className="bg-[#8b0000]/5 w-16 h-16 rounded-none flex items-center justify-center mb-4 text-[#8b0000]">
                                        <LayoutDashboard className="w-8 h-8" />
                                    </div>
                                    <h4 className="font-black text-gray-900 dark:text-white mb-2">Pusat Analitis Kedai</h4>
                                    <p className="text-gray-400 dark:text-zinc-500 text-xs max-w-sm mx-auto mb-0 leading-relaxed">
                                        Sedang memproses dan menyegerakkan metrik global dari sistem pangkalan data...
                                    </p>
                                </div>
                            </div>
                        )}

                        {/* Tab Content: Books */}
                        {activeTab === 'books' && (
                            <div className="bg-white dark:bg-zinc-900 rounded-none border border-gray-100 dark:border-zinc-800 shadow-sm overflow-hidden animate-in fade-in duration-300">
                                
                                {/* Search Filter */}
                                <div className="p-4 border-b border-gray-100 dark:border-zinc-800">
                                    <div className="relative">
                                        <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-gray-400">
                                            <Search className="w-4 h-4" />
                                        </span>
                                        <input 
                                            type="text" 
                                            placeholder="Cari buku atau penulis..." 
                                            value={searchQuery}
                                            onChange={e => setSearchQuery(e.target.value)}
                                            className="w-full pl-10 pr-4 py-2.5 rounded-none border border-gray-200 dark:border-zinc-800 focus:border-[#8b0000] outline-none text-xs bg-white dark:bg-zinc-900 text-gray-800 dark:text-white"
                                        />
                                    </div>
                                </div>

                                <div className="table-responsive">
                                    <table className="table table-hover align-middle mb-0 text-start">
                                        <thead>
                                            <tr className="text-[10px] font-black text-gray-400 uppercase tracking-wider border-b border-gray-100 dark:border-zinc-800">
                                                <th className="px-5 py-4">Buku</th>
                                                <th className="px-5 py-4">Genre</th>
                                                <th className="px-5 py-4">Harga</th>
                                                <th className="px-5 py-4">Inventori</th>
                                                <th className="px-5 py-4 text-end">Tindakan</th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-gray-100 dark:divide-zinc-800/40">
                                            {filteredBooks.map(book => (
                                                <tr key={book.id} className="hover:bg-gray-50/50 dark:hover:bg-zinc-800/10 transition-colors">
                                                    <td className="px-5 py-4">
                                                        <div className="flex items-center gap-3">
                                                            <div className="border border-gray-100 dark:border-zinc-800 rounded-none overflow-hidden shrink-0" style={{ width: '40px', height: '55px' }}>
                                                                <img src={book.cover} className="w-full h-full object-cover" alt="" />
                                                            </div>
                                                            <div>
                                                                <p className="mb-0.5 font-bold text-xs text-gray-900 dark:text-white">{book.title}</p>
                                                                <p className="text-gray-400 mb-0 font-medium" style={{ fontSize: '10px' }}>{book.author}</p>
                                                            </div>
                                                        </div>
                                                    </td>
                                                    <td className="px-5 py-4">
                                                        <span className="px-2.5 py-1 rounded-full text-[9px] font-black uppercase tracking-wider bg-[#f8c146]/10 text-amber-600 dark:text-amber-400 border border-[#f8c146]/20">
                                                            {book.genre}
                                                        </span>
                                                    </td>
                                                    <td className="px-5 py-4 font-black text-xs text-gray-800 dark:text-white font-mono">RM{book.price.toFixed(2)}</td>
                                                    <td className="px-5 py-4">
                                                        <div className="flex items-center gap-2">
                                                            <div className={`rounded-full w-2 h-2 ${
                                                                book.stock === 0 
                                                                ? 'bg-red-950/100' 
                                                                : book.stock < 10 
                                                                ? 'bg-amber-500' 
                                                                : 'bg-green-500'
                                                            }`}></div>
                                                            <span className="text-gray-500 dark:text-zinc-400 text-xs font-bold font-mono">
                                                                {book.stock} unit
                                                                {book.stock === 0 && <span className="text-red-500 text-[10px] font-bold uppercase ml-1.5">(Habis)</span>}
                                                                {book.stock > 0 && book.stock < 10 && <span className="text-amber-500 text-[10px] font-bold uppercase ml-1.5">(Rendah)</span>}
                                                            </span>
                                                        </div>
                                                    </td>
                                                    <td className="px-5 py-4 text-end">
                                                        <div className="flex justify-content-end gap-2">
                                                            <button className="btn btn-outline-secondary border-gray-200 dark:border-zinc-800 btn-sm p-2 rounded-none hover:text-black hover:bg-gray-50 dark:hover:bg-zinc-800"><Edit className="w-4 h-4" /></button>
                                                            <button className="btn btn-outline-danger border-gray-200 dark:border-zinc-800 btn-sm p-2 rounded-none hover:text-primary hover:bg-red-950/10/50 dark:hover:bg-red-950/20"><Trash2 className="w-4 h-4" /></button>
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
                            <div className="bg-white dark:bg-zinc-900 rounded-none border border-gray-100 dark:border-zinc-800 shadow-sm p-8 text-center animate-in fade-in duration-300">
                                <div className="bg-[#8b0000]/5 w-16 h-16 rounded-none flex items-center justify-center mx-auto mb-4 text-[#8b0000]">
                                    <User className="w-8 h-8" />
                                </div>
                                <h4 className="font-black text-gray-900 dark:text-white mb-1">Pengurusan Pengguna</h4>
                                <p className="text-gray-400 dark:text-zinc-500 text-xs mb-6">Mengurus dan menyelia akaun pembeli berdaftar</p>
                                <div className="flex flex-col gap-3 max-w-xl mx-auto">
                                     {[1, 2, 3].map(i => (
                                         <div key={i} className="flex justify-between align-items-center p-4 bg-gray-50 dark:bg-zinc-950 rounded-none border border-gray-150 dark:border-zinc-800 text-start">
                                             <div className="flex align-items-center gap-3">
                                                 <div className="bg-black text-white rounded-full font-black text-xs flex items-center justify-center" style={{ width: '35px', height: '35px' }}>U{i}</div>
                                                 <div>
                                                     <p className="mb-0.5 font-bold text-xs text-gray-950 dark:text-white">Pengguna Contoh {i}</p>
                                                     <p className="text-gray-400 mb-0 font-mono" style={{ fontSize: '10px' }}>user{i}@example.com</p>
                                                 </div>
                                             </div>
                                             <span className="px-2.5 py-1 rounded-full text-[9px] font-black uppercase tracking-wider bg-gray-200/50 dark:bg-zinc-800 text-gray-600 dark:text-zinc-400">Pelanggan</span>
                                         </div>
                                     ))}
                                </div>
                            </div>
                        )}

                        {/* Tab Content: Promotions */}
                        {activeTab === 'promotions' && (
                            <div className="bg-white dark:bg-zinc-900 rounded-none border border-gray-100 dark:border-zinc-800 shadow-sm p-8 text-center animate-in fade-in duration-300">
                                <div className="bg-[#8b0000]/5 w-16 h-16 rounded-none flex items-center justify-center mx-auto mb-4 text-[#8b0000]">
                                    <Sparkles className="w-8 h-8" />
                                </div>
                                <h4 className="font-black text-gray-900 dark:text-white mb-1">Kempen Promosi</h4>
                                <p className="text-gray-400 dark:text-zinc-500 text-xs mb-6">Uruskan kod kupon, diskaun bermusim, dan kempen jualan kilat</p>
                                <button className="px-5 py-3 bg-black hover:bg-[#8b0000] text-white text-xs font-black uppercase tracking-widest rounded-full transition-all duration-300 border-0 cursor-pointer">
                                    Lancarkan Kempen Baru
                                </button>
                            </div>
                        )}

                        {/* Tab Content: Orders */}
                        {activeTab === 'orders' && (
                            <div className="bg-white dark:bg-zinc-900 rounded-none border border-gray-100 dark:border-zinc-800 shadow-sm p-8 animate-in fade-in duration-300">
                                <div className="text-center mb-6">
                                    <div className="bg-[#8b0000]/5 w-16 h-16 rounded-none flex items-center justify-center mx-auto mb-4 text-[#8b0000]">
                                        <Package className="w-8 h-8" />
                                    </div>
                                    <h4 className="font-black text-gray-900 dark:text-white mb-1">Semua Rekod Pesanan</h4>
                                    <p className="text-gray-400 dark:text-zinc-500 text-xs leading-relaxed">Pemantauan logistik dan pemenuhan pesanan dalam masa nyata</p>
                                </div>
                                {allOrders.length > 0 ? (
                                    <div className="flex flex-col gap-3">
                                        {allOrders.map(order => (
                                            <div key={order.id} className="p-4 bg-gray-50 dark:bg-zinc-950 rounded-none border border-gray-150 dark:border-zinc-850 flex justify-between align-items-center text-start">
                                                 <div className="flex align-items-center gap-3">
                                                    <div className="bg-black text-white p-2.5 rounded-none">
                                                        <Package className="w-4 h-4" />
                                                    </div>
                                                    <div>
                                                        <p className="mb-0.5 font-bold font-mono text-xs uppercase text-gray-900 dark:text-white">REF-{order.id.split('-')[0].toUpperCase()}</p>
                                                        <p className="text-gray-400 mb-0 font-mono" style={{ fontSize: '9px' }}>{new Date(order.created_at).toLocaleDateString('ms-MY', { month: 'short', day: 'numeric', year: 'numeric' })}</p>
                                                    </div>
                                                 </div>
                                                 <div className="text-end">
                                                    <p className="mb-0.5 font-black text-sm font-mono text-[#8b0000]">RM{order.total_amount.toFixed(2)}</p>
                                                    <span className={`px-2 py-0.5 rounded text-[9px] font-black uppercase tracking-wider ${
                                                        order.status === 'completed' 
                                                        ? 'bg-green-150 text-green-700 dark:bg-green-950/40 dark:text-green-400' 
                                                        : 'bg-amber-150 text-amber-700 dark:bg-amber-950/40 dark:text-amber-400'
                                                    }`}>
                                                        {order.status === 'completed' ? 'Selesai' : order.status}
                                                    </span>
                                                 </div>
                                            </div>
                                        ))}
                                    </div>
                                ) : (
                                    <div className="text-center py-5">
                                        <Loader2 className="w-8 h-8 text-[#8b0000] animate-spin mx-auto mb-2" />
                                        <p className="text-gray-450 text-[10px] font-bold uppercase tracking-wider mb-0">Sedang menyegerakkan senarai pesanan...</p>
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
        <div className="min-h-screen flex flex-col bg-[#fbfbfb] selection:bg-[#8b0000]/10" style={{ fontFamily: 'EB Garamond, serif' }}>
            <Header />

            <main className={`flex-grow ${view === 'catalog' ? '' : 'pt-28'}`}>
                {view === 'catalog' && <StitchDesign setView={setView} />}
                {view === 'archive' && <ArchiveCatalog setView={setView} />}
                {view === 'cart' && <CartView />}
                {view === 'checkout' && <CheckoutView />}
                {view === 'login' && <LoginView />}
                {view === 'register' && <RegisterView />}
                {view === '2fa' && <TwoFAView />}
                {view === 'verify-device' && <DeviceVerificationView />}
                {view === 'payment-gateway' && <PaymentGatewayView />}
                {view === 'orders' && <OrdersView />}
                {view === 'admin' && <AdminView />}
            </main>

            {/* Floating Cart Summary FAB (Sticky Bottom Bar) */}
            {cart.length > 0 && (view === 'catalog' || view === 'archive') && (
                <div className="fixed bottom-8 left-1/2 -translate-x-1/2 z-[60] w-[92%] max-w-md animate-in slide-in-from-bottom-12 fade-in duration-500 ease-out">
                    <div className="bg-white rounded-none shadow-[0_20px_50px_rgba(0,0,0,0.1)] border border-gray-100 p-2 pl-5 flex items-center justify-between ring-1 ring-black/5 overflow-hidden group">
                        
                        <div className="flex items-center gap-4 relative z-10">
                            <div className="relative">
                                <div className="w-14 h-14 bg-gray-900 rounded-none shadow-lg border border-white/20 flex items-center justify-center overflow-hidden rotate-[-4deg] group-hover:rotate-0 transition-transform duration-500">
                                    {cart[cart.length - 1]?.book?.cover ? (
                                        <img src={cart[cart.length - 1].book.cover} alt="Cart item" className="w-full h-full object-cover scale-110" />
                                    ) : (
                                        <Package className="w-7 h-7 text-white" />
                                    )}
                                </div>
                                <span className="absolute -top-2 -right-2 bg-[#8b0000] text-white text-[11px] font-black w-6 h-6 rounded-full flex items-center justify-center border-2 border-white shadow-md">
                                    {cart.reduce((sum, item) => sum + item.quantity, 0)}
                                </span>
                            </div>
                            
                            <div>
                                <p className="text-[10px] font-black text-[#8b0000] uppercase tracking-widest mb-0.5">Total Balance</p>
                                <p className="text-2xl font-black text-gray-900 tracking-tight">
                                    RM{cart.reduce((sum, item) => sum + (item.book.price * item.quantity), 0).toFixed(2)}
                                </p>
                            </div>
                        </div>

                        <button 
                            onClick={() => setView('cart')}
                            className="relative z-10 bg-gray-900 text-white px-8 py-4 rounded-none font-black text-sm hover:bg-[#8b0000] transition-all shadow-xl active:scale-95 flex items-center gap-2 group/btn"
                        >
                            Checkout
                            <ChevronRight className="w-4 h-4 group-hover/btn:translate-x-1 transition-transform" />
                        </button>
                    </div>
                </div>
            )}

            {/* AI Chatbot System */}
            <div className={`fixed right-4 sm:right-8 z-50 flex flex-col items-end transition-all duration-500 ${cart.length > 0 && (view === 'catalog' || view === 'archive') ? 'bottom-32' : 'bottom-8'}`}>
                {aiChatOpen && (
                    <div className="absolute bottom-20 right-0 w-[350px] sm:w-[450px] h-[550px] sm:h-[650px] bg-white rounded-none shadow-[0_20px_50px_rgba(0,0,0,0.15)] flex flex-col overflow-hidden border border-gray-200 animate-in slide-in-from-bottom-10 duration-500">
                        {/* Header */}
                        <div className="p-4 flex justify-between items-center shadow-sm" style={{ backgroundColor: '#1a1a1a', color: 'white' }}>
                            <div className="flex items-center gap-3">
                                <div className="bg-[#8b0000] p-2 rounded-none">
                                    <Bot className="w-5 h-5 text-white animate-pulse" />
                                </div>
                                <div>
                                    <p className="font-bold mb-0 text-white" style={{ fontSize: '13px', fontFamily: 'EB Garamond, serif', textTransform: 'uppercase', letterSpacing: '1px' }}>Pembantu AI Tarbiah</p>
                                    <p className="mb-0 text-muted" style={{ fontSize: '9px', textTransform: 'uppercase', color: '#aaa' }}>Sistem Aktif • Versi 4.0</p>
                                </div>
                            </div>
                            <button onClick={() => setAiChatOpen(false)} className="btn btn-link p-0 text-white hover:text-[#8b0000] transition-colors">
                                <X className="w-5 h-5" />
                            </button>
                        </div>

                        {/* Messages Area */}
                        <div className="flex-grow p-4 overflow-y-auto bg-light space-y-3 hide-scrollbar">
                            {aiMessages.map((msg, idx) => (
                                <div key={idx} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'} animate-in fade-in slide-in-from-bottom-2 duration-300`}>
                                    <div className={`max-w-[85%] p-3 rounded-none text-sm leading-relaxed shadow-sm border ${
                                        msg.role === 'user' 
                                        ? 'text-white rounded-br-sm border-none font-bold' 
                                        : 'bg-white border-gray-200 text-gray-800 rounded-bl-sm'
                                    }`}
                                    style={{
                                        backgroundColor: msg.role === 'user' ? '#8b0000' : 'white',
                                        color: msg.role === 'user' ? 'white' : '#1a1a1a',
                                    }}>
                                        {msg.text}
                                    </div>
                                </div>
                            ))}
                            {aiChatLoading && (
                                <div className="flex justify-start">
                                    <div className="bg-white border border-gray-200 p-3 rounded-none rounded-bl-sm shadow-sm flex gap-1.5">
                                        <div className="w-2 h-2 bg-[#8b0000] rounded-full animate-bounce"></div>
                                        <div className="w-2 h-2 bg-[#8b0000] rounded-full animate-bounce delay-100"></div>
                                        <div className="w-2 h-2 bg-[#8b0000] rounded-full animate-bounce delay-200"></div>
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* Input Area */}
                        <form onSubmit={(e) => { e.preventDefault(); handleSendAIMessage(e); }} className="p-3 bg-white border-t border-gray-200 d-flex gap-2 align-items-center">
                            <input 
                                type="text"
                                value={aiChatInput}
                                onChange={(e) => setAiChatInput(e.target.value)}
                                placeholder="Tanya Pembantu AI..."
                                className="form-control rounded-pill text-sm px-4 py-2 border-gray-300"
                                style={{ fontSize: '13px' }}
                            />
                            <button 
                                type="submit"
                                disabled={aiChatLoading || !aiChatInput.trim()}
                                className="btn rounded-circle p-2"
                                style={{ backgroundColor: '#8b0000', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', border: 'none' }}
                            >
                                <Send className="w-4 h-4" />
                            </button>
                        </form>
                    </div>
                )}

                <button 
                    onClick={() => setAiChatOpen(!aiChatOpen)}
                    className="w-14 h-14 rounded-circle shadow-lg hover:scale-110 active:scale-95 transition-all flex items-center justify-center border-none"
                    style={{ backgroundColor: '#8b0000', color: 'white' }}
                >
                    {aiChatOpen ? <X className="w-6 h-6" /> : <MessageSquare className="w-6 h-6" />}
                </button>
            </div>

            {/* Book Detail / Summary Modal */}
            {summaryModal.isOpen && summaryModal.book && (
                <div className="fixed inset-0 z-[80] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-300">
                    <div className="bg-surface border border-outline-variant/20 rounded-none w-full max-w-6xl overflow-hidden shadow-2xl animate-in zoom-in duration-300 relative h-[90vh] flex flex-col md:flex-row">
                        <button 
                            onClick={() => setSummaryModal({ isOpen: false, book: null, summary: '', loading: false })}
                            className="absolute top-6 right-6 text-on-surface hover:text-primary z-30 transition-colors bg-white/50 backdrop-blur-md p-2"
                        >
                            <span className="material-symbols-outlined text-3xl">close</span>
                        </button>
                        
                        {/* Left Side: Cover Image */}
                        <div className="w-full md:w-1/2 h-[40vh] md:h-full bg-surface-container-high relative overflow-hidden flex-shrink-0">
                            <img 
                                src={summaryModal.book.cover} 
                                alt={summaryModal.book.title} 
                                className="w-full h-full object-cover" 
                            />
                        </div>
                        
                        {/* Right Side: Details & Summary */}
                        <div className="w-full md:w-1/2 flex flex-col relative bg-surface">
                            <div className="p-8 md:p-12 lg:p-16 flex-grow overflow-y-auto pb-32">
                                <span className="font-label-md text-label-md text-secondary uppercase tracking-widest mb-4 block">{summaryModal.book.genre}</span>
                                <h2 className="font-display-lg-mobile md:font-display-lg text-display-lg-mobile md:text-display-lg text-primary leading-tight mb-4">{summaryModal.book.title}</h2>
                                <p className="font-label-md text-label-md text-on-surface-variant uppercase tracking-widest mb-8">Author: {summaryModal.book.author}</p>
                                
                                <div className="h-[1px] bg-secondary opacity-20 my-8 w-full"></div>
                                
                                <h4 className="font-label-md text-label-md text-primary uppercase tracking-widest mb-4">Synopsis / Overview</h4>
                                <p className="font-body-lg text-body-lg text-on-surface-variant leading-relaxed mb-8 italic">
                                    "{summaryModal.summary}"
                                </p>
                                
                                <div className="h-[1px] bg-secondary opacity-20 my-8 w-full"></div>
                                
                                <h4 className="font-label-md text-label-md text-primary uppercase tracking-widest mb-6">Edition Details</h4>
                                <ul className="space-y-4 mb-8">
                                    <li className="flex justify-between border-b border-outline-variant/30 pb-4">
                                        <span className="font-body-md text-on-surface-variant">Format</span>
                                        <span className="font-label-md text-label-md text-on-surface">Hardcover</span>
                                    </li>
                                    <li className="flex justify-between border-b border-outline-variant/30 pb-4">
                                        <span className="font-body-md text-on-surface-variant">Publisher</span>
                                        <span className="font-label-md text-label-md text-on-surface">Tarbiah Sentap</span>
                                    </li>
                                    <li className="flex justify-between border-b border-outline-variant/30 pb-4">
                                        <span className="font-body-md text-on-surface-variant">Language</span>
                                        <span className="font-label-md text-label-md text-on-surface">Malay</span>
                                    </li>
                                </ul>
                            </div>
                            
                            {/* Bottom Sticky Action Bar inside the Right Side */}
                            <div className="absolute bottom-0 left-0 w-full bg-surface/95 backdrop-blur-md border-t border-outline-variant/20 p-6 md:px-12 flex items-center justify-between z-20">
                                <div className="flex flex-col">
                                    <span className="font-label-sm text-label-sm text-on-surface-variant uppercase tracking-widest mb-1">Price</span>
                                    <span className="font-headline-md text-headline-md text-primary">RM{summaryModal.book.price.toFixed(2)}</span>
                                </div>
                                <button 
                                    onClick={() => {
                                        addToCart(summaryModal.book);
                                        setSummaryModal({ isOpen: false, book: null, summary: '', loading: false });
                                    }}
                                    className="bg-[#1A1A1A] text-white px-8 py-4 font-label-md text-label-md uppercase tracking-widest hover:bg-surface hover:text-[#1A1A1A] border border-transparent hover:border-secondary transition-all duration-300 flex items-center gap-3"
                                >
                                    <span className="material-symbols-outlined text-[20px]">shopping_bag</span> Add to Cart
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Toast System */}
            <div className="fixed top-24 right-6 z-[100] space-y-4 pointer-events-none">
                {toasts.map(t => (
                    <div key={t.id} className="pointer-events-auto flex items-center gap-3 px-4 py-3 rounded-none shadow-lg border"
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
