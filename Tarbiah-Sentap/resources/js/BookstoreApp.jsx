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

    // UI Components (Refined)
    const Header = () => {
        const cartCount = cart.reduce((sum, item) => sum + item.quantity, 0);

        return (
            <header>
                <div className="header-area" style={{ backgroundColor: 'black' }}>
                    <div className="main-header header-sticky" style={{ backgroundColor: 'black', padding: '15px 0' }}>
                        <div className="container-fluid">
                            <div className="menu-wrapper d-flex align-items-center justify-content-between">
                                <div className="logo" onClick={() => setView('catalog')} style={{ cursor: 'pointer' }}>
                                    <img src="/assets/img/logo/tarbiah-sentap-logo.png" width="90" height="auto" alt="Tarbiah Sentap" />
                                </div>
                                <div className="main-menu d-none d-lg-block">
                                    <nav>
                                        <ul id="navigation" className="d-flex align-items-center gap-4" style={{ listStyle: 'none', margin: 0, padding: 0 }}>
                                            <li className={view === 'catalog' ? 'active' : ''}>
                                                <a href="#" onClick={(e) => { e.preventDefault(); setView('catalog'); }}>Home</a>
                                            </li>
                                            <li className={view === 'catalog' ? 'active' : ''}>
                                                <a href="#" onClick={(e) => { e.preventDefault(); setView('catalog'); }}>Shop</a>
                                            </li>
                                            {user && (
                                                <li className={view === 'orders' ? 'active' : ''}>
                                                    <a href="#" onClick={(e) => { e.preventDefault(); setView('orders'); }}>Orders</a>
                                                </li>
                                            )}
                                            {user && user.role === 'admin' && (
                                                <li className={view === 'admin' ? 'active' : ''}>
                                                    <a href="#" onClick={(e) => { e.preventDefault(); setView('admin'); }}>Admin Core</a>
                                                </li>
                                            )}
                                        </ul>
                                    </nav>
                                </div>
                                <div className="header-right">
                                    <ul id="navigation" className="d-flex align-items-center gap-4" style={{ listStyle: 'none', margin: 0, padding: 0 }}>
                                        {user ? (
                                            <>
                                                <li style={{ color: 'white', fontWeight: 'bold', fontSize: '14px' }}>
                                                    {user.name.split(' ')[0]}
                                                </li>
                                                <li>
                                                    <a href="#" onClick={(e) => { e.preventDefault(); handleLogout(); }} title="Sign Out">
                                                        <span className="flaticon-user" style={{ color: '#ff2020' }}></span>
                                                    </a>
                                                </li>
                                            </>
                                        ) : (
                                            <li>
                                                <a href="#" onClick={(e) => { e.preventDefault(); setView('login'); }} title="Sign In">
                                                    <span className="flaticon-user"></span>
                                                </a>
                                            </li>
                                        )}
                                        <li style={{ position: 'relative' }}>
                                            <a href="#" onClick={(e) => { e.preventDefault(); setView('cart'); }}>
                                                <span className="flaticon-shopping-cart"></span>
                                                {cartCount > 0 && (
                                                    <span style={{
                                                        position: 'absolute',
                                                        top: '-10px',
                                                        right: '-10px',
                                                        background: '#ff2020',
                                                        color: 'white',
                                                        borderRadius: '50%',
                                                        padding: '2px 6px',
                                                        fontSize: '11px',
                                                        fontWeight: 'bold'
                                                    }}>
                                                        {cartCount}
                                                    </span>
                                                )}
                                            </a>
                                        </li>
                                    </ul>
                                </div>
							</div>
						</div>
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
            <div className="text-center py-5 animate-in fade-in" style={{ minHeight: '60vh', display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center' }}>
                <Loader2 className="w-12 h-12 text-danger animate-spin" />
                <p className="mt-3 text-muted" style={{ fontFamily: 'Josefin Sans, sans-serif', fontWeight: 'bold' }}>Curating your library...</p>
            </div>
        );

        return (
            <div className="animate-in fade-in" style={{ backgroundColor: '#fcfcfc', color: '#1a1a1a' }}>
                {/* Hero Slider Area */}
                <div className="slider-area" style={{ background: '#f0f0f2', padding: '60px 0' }}>
                    <div className="container">
                        <div className="row align-items-center justify-content-between">
                            <div className="col-xl-7 col-lg-7 col-md-8 col-sm-8">
                                <div className="hero__caption">
                                    <h1 style={{ fontFamily: 'Josefin Sans, sans-serif', fontWeight: 900, color: '#f8c146', fontSize: '3rem', textTransform: 'uppercase', marginBottom: '20px' }}>TARBIAH SENTAP</h1>
                                    <p style={{ fontSize: '15px', color: '#555', lineHeight: '1.8', marginBottom: '40px' }}>
                                        Membina pemikiran islamik kontemporari melalui karya rohani, novel, motivasi, dan tarbiah bermutu untuk membimbing generasi muda.
                                    </p>
                                    <div className="hero__btn">
                                        <a href="#shop-section" className="btn hero-btn" style={{ backgroundColor: '#ff2020', color: 'white', padding: '18px 40px', borderRadius: '5px', textTransform: 'uppercase', fontWeight: 'bold', textDecoration: 'none' }}>Shop Now</a>
                                    </div>
                                </div>
                            </div>
                            <div className="col-xl-4 col-lg-4 col-md-4 col-sm-4 d-none d-sm-block">
                                <div className="hero__img">
                                    <img src="/assets/img/hero/adn.jpg" alt="Ustaz Adnin Roslan" className="heartbeat" style={{ width: '100%', borderRadius: '15px', boxShadow: '0 15px 30px rgba(0,0,0,0.1)' }} />
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Shop Section */}
                <section id="shop-section" className="popular-items section-padding30" style={{ padding: '80px 0 50px 0' }}>
                    <div className="container">
                        {/* Header Title */}
                        <div className="row justify-content-center">
                           <div className="col-xl-8 col-lg-8 col-md-10">
                               <div className="section-tittle mb-70 text-center">
                                   <h2 style={{ fontFamily: 'Josefin Sans, sans-serif', fontWeight: 700, fontSize: '2.5rem', color: '#000a2d', marginBottom: '15px' }}>Buku Tarbiah Sentap</h2>
                                   <p style={{ color: '#777', fontSize: '15px' }}>Terokai koleksi penuh buku-buku dakwah, novel dakwah kreatif, motivasi dan kesedaran akhir zaman.</p>
                               </div>
                           </div>
                        </div>

                        {/* Search & Filter Bar */}
                        <div className="row mb-5 align-items-center justify-content-between" style={{ gap: '20px' }}>
                            <div className="col-lg-4 col-md-6">
                                <div style={{ position: 'relative' }}>
                                    <input 
                                        type="text"
                                        placeholder="Cari buku atau penulis..."
                                        value={search}
                                        onChange={(e) => setSearch(e.target.value)}
                                        style={{ width: '100%', padding: '12px 20px', borderRadius: '30px', border: '1px solid #ddd', outline: 'none', transition: 'border 0.3s' }}
                                    />
                                </div>
                            </div>
                            <div className="col-lg-6 col-md-6 d-flex justify-content-md-end gap-3 flex-wrap">
                                <select 
                                    value={genre}
                                    onChange={(e) => setGenre(e.target.value)}
                                    style={{ padding: '12px 20px', borderRadius: '30px', border: '1px solid #ddd', outline: 'none', cursor: 'pointer', background: 'white' }}
                                >
                                    {genres.map(g => <option key={g} value={g}>{g}</option>)}
                                </select>
                                <select 
                                    value={sortBy}
                                    onChange={(e) => setSortBy(e.target.value)}
                                    style={{ padding: '12px 20px', borderRadius: '30px', border: '1px solid #ddd', outline: 'none', cursor: 'pointer', background: 'white' }}
                                >
                                    <option value="featured">Featured Picks</option>
                                    <option value="price-asc">Price: Low to High</option>
                                    <option value="price-desc">Price: High to Low</option>
                                    <option value="rating">Top Rated</option>
                                </select>
                            </div>
                        </div>

                        {/* Books Grid */}
                        {filteredBooks.length === 0 ? (
                            <div className="text-center py-5 text-muted">Tiada buku ditemui padanan carian anda.</div>
                        ) : (
                            <div className="row">
                                {filteredBooks.map((book, index) => (
                                    <div key={book.id} className="col-xl-3 col-lg-3 col-md-6 col-sm-6 mb-5 animate-in fade-in" style={{ animationDelay: `${index * 30}ms` }}>
                                        <div className="single-popular-items text-center" style={{ background: 'white', borderRadius: '10px', boxShadow: '0 5px 15px rgba(0,0,0,0.05)', padding: '20px', border: '1px solid #eee', position: 'relative', overflow: 'hidden' }}>
                                            <div className="popular-img" style={{ position: 'relative', height: '280px', overflow: 'hidden', borderRadius: '5px' }}>
                                                <img src={book.cover} alt={book.title} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                                                
                                                <div style={{ position: 'absolute', top: '10px', left: '10px', background: 'rgba(0,0,0,0.7)', color: '#fbbf24', padding: '4px 8px', borderRadius: '5px', fontSize: '10px', fontWeight: 'bold' }}>
                                                    ★ {book.rating}
                                                </div>

                                                <div className="img-cap" style={{ position: 'absolute', bottom: 0, left: 0, width: '100%', padding: '15px 0', background: 'rgba(255, 32, 32, 0.9)', color: 'white', transform: 'translateY(100%)', transition: 'transform 0.3s ease', cursor: 'pointer' }}>
                                                    <span onClick={() => addToCart(book)} style={{ fontWeight: 'bold', textTransform: 'uppercase', fontSize: '12px' }}>🛒 Add To Cart</span>
                                                </div>
                                            </div>
                                            <div className="popular-caption" style={{ paddingTop: '20px' }}>
                                                <h3 style={{ fontSize: '16px', fontFamily: 'Josefin Sans, sans-serif', fontWeight: 600, height: '45px', overflow: 'hidden', marginBottom: '10px' }}>
                                                    <a href="#" onClick={(e) => { e.preventDefault(); setSummaryModal({ isOpen: true, book, summary: getBookSummary(book), loading: false }); }} style={{ color: '#444', textDecoration: 'none', transition: 'color 0.2s' }}>{book.title}</a>
                                                </h3>
                                                <p style={{ fontSize: '11px', color: '#999', textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '10px' }}>{book.author}</p>
                                                <div className="d-flex justify-content-between align-items-center mt-3" style={{ padding: '0 5px' }}>
                                                    <span style={{ fontSize: '18px', fontWeight: 900, color: '#ff2020' }}>RM{book.price.toFixed(2)}</span>
                                                    <button 
                                                        onClick={() => setSummaryModal({ isOpen: true, book, summary: getBookSummary(book), loading: false })}
                                                        style={{ border: 'none', background: '#f8c146', color: 'white', padding: '6px 12px', borderRadius: '4px', fontSize: '11px', fontWeight: 'bold' }}
                                                    >
                                                        Sinopsis
                                                    </button>
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
                                <div className="single-gallery mb-30" style={{ height: '350px', backgroundImage: 'url(/assets/img/gallery/tuhan-aku-ingin-jumpa-nabi.jpg)', backgroundSize: 'cover', backgroundPosition: 'center', borderRadius: '10px', margin: '10px' }}></div>
                            </div>
                            <div className="col-xl-3 col-lg-4 col-md-6 col-sm-6">
                                <div className="single-gallery mb-30" style={{ height: '350px', backgroundImage: 'url(/assets/img/gallery/tuhan-aku-ingin-jumpa-nabi.jpg)', backgroundSize: 'cover', backgroundPosition: 'center', borderRadius: '10px', margin: '10px' }}></div>
                            </div>
                            <div className="col-xl-3 col-lg-4 col-md-12">
                                <div className="row">
                                    <div className="col-xl-12 col-lg-12 col-md-6 col-sm-6">
                                        <div className="single-gallery mb-30" style={{ height: '165px', backgroundImage: 'url(/assets/img/gallery/ajari-aku-tentang-cinta.jpg)', backgroundSize: 'cover', backgroundPosition: 'center', borderRadius: '10px', margin: '10px' }}></div>
                                    </div>
                                    <div className="col-xl-12 col-lg-12 col-md-6 col-sm-6">
                                        <div className="single-gallery mb-30" style={{ height: '165px', backgroundImage: 'url(/assets/img/gallery/ajari-aku-tentang-rindu.jpg)', backgroundSize: 'cover', backgroundPosition: 'center', borderRadius: '10px', margin: '10px' }}></div>
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
                <div className="container py-5 text-center" style={{ minHeight: '60vh', display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center' }}>
                    <div className="mb-4" style={{ fontSize: '4rem', color: '#ccc' }}>🛒</div>
                    <h2 style={{ fontFamily: 'Josefin Sans, sans-serif', fontWeight: 'bold' }}>Troli Anda Kosong</h2>
                    <p className="text-muted mb-4">Sila tambahkan buku dari kedai kami ke dalam troli.</p>
                    <button onClick={() => setView('catalog')} className="btn" style={{ backgroundColor: '#ff2020', color: 'white', fontWeight: 'bold', padding: '12px 30px' }}>Kembali Ke Kedai</button>
                </div>
            );
        }

        return (
            <div className="container py-5 animate-in fade-in" style={{ color: '#1a1a1a' }}>
                <h2 className="mb-5" style={{ fontFamily: 'Josefin Sans, sans-serif', fontWeight: 700 }}>Troli Pembelian</h2>
                <div className="row">
                    <div className="col-lg-8">
                        {cart.map(item => (
                            <div key={item.book.id} className="d-flex align-items-center justify-content-between p-3 mb-3 bg-white" style={{ borderRadius: '10px', boxShadow: '0 3px 10px rgba(0,0,0,0.03)', border: '1px solid #eee' }}>
                                <div className="d-flex align-items-center gap-3">
                                    <img src={item.book.cover} alt={item.book.title} style={{ width: '60px', height: '90px', objectFit: 'cover', borderRadius: '4px' }} />
                                    <div>
                                        <h4 style={{ fontSize: '16px', fontWeight: 'bold', marginBottom: '5px' }}>{item.book.title}</h4>
                                        <p className="text-muted mb-0" style={{ fontSize: '12px' }}>{item.book.author}</p>
                                        <span style={{ color: '#ff2020', fontWeight: 'bold', fontSize: '15px' }}>RM{item.book.price.toFixed(2)}</span>
                                    </div>
                                </div>
                                <div className="d-flex align-items-center gap-3">
                                    <div className="d-flex align-items-center border rounded">
                                        <button onClick={() => updateQuantity(item.book.id, -1)} className="btn btn-sm px-3 py-1">-</button>
                                        <span className="px-2" style={{ fontWeight: 'bold' }}>{item.quantity}</span>
                                        <button onClick={() => updateQuantity(item.book.id, 1)} className="btn btn-sm px-3 py-1">+</button>
                                    </div>
                                    <button onClick={() => removeFromCart(item.book.id)} className="btn btn-sm text-danger" style={{ border: 'none', background: 'none' }}>🗑️</button>
                                </div>
                            </div>
                        ))}
                    </div>
                    <div className="col-lg-4">
                        <div className="p-4 bg-white" style={{ borderRadius: '10px', border: '1px solid #eee', boxShadow: '0 5px 15px rgba(0,0,0,0.03)' }}>
                            <h3 className="mb-4" style={{ fontFamily: 'Josefin Sans, sans-serif', fontWeight: 600 }}>Ringkasan Pesanan</h3>
                            <div className="d-flex justify-content-between mb-2">
                                <span>Subtotal</span>
                                <span>RM{subtotal.toFixed(2)}</span>
                            </div>
                            <div className="d-flex justify-content-between mb-2">
                                <span>Penghantaran</span>
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
                            <button onClick={handleCheckout} className="btn w-full py-3" style={{ backgroundColor: '#ff2020', color: 'white', fontWeight: 'bold', textTransform: 'uppercase' }}>Seterusnya Ke Pembayaran</button>
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
            <div className="container py-5 animate-in fade-in" style={{ color: '#1a1a1a' }}>
                <div className="row justify-content-center">
                    <div className="col-md-5">
                        <div className="p-5 bg-white" style={{ borderRadius: '10px', border: '1px solid #eee', boxShadow: '0 5px 25px rgba(0,0,0,0.05)' }}>
                            <h2 className="text-center mb-4" style={{ fontFamily: 'Josefin Sans, sans-serif', fontWeight: 700 }}>Log Masuk</h2>
                            <form onSubmit={onSubmit} className="space-y-4">
                                <div>
                                    <label className="form-label" style={{ fontSize: '12px', fontWeight: 'bold' }}>Emel</label>
                                    <input 
                                        type="email"
                                        value={email}
                                        onChange={e => setEmail(e.target.value)}
                                        placeholder="emel@tarbiahsentap.com"
                                        className="form-control"
                                        style={{ padding: '12px', borderRadius: '8px' }}
                                        required
                                    />
                                </div>
                                <div>
                                    <label className="form-label" style={{ fontSize: '12px', fontWeight: 'bold' }}>Kata Laluan</label>
                                    <input 
                                        type="password"
                                        value={password}
                                        onChange={e => setPassword(e.target.value)}
                                        placeholder="••••••••"
                                        className="form-control"
                                        style={{ padding: '12px', borderRadius: '8px' }}
                                        required
                                    />
                                </div>
                                <button type="submit" className="btn w-full mt-4 py-3" style={{ backgroundColor: '#ff2020', color: 'white', fontWeight: 'bold', textTransform: 'uppercase' }}>Log Masuk</button>
                            </form>
                            <div className="mt-4 text-center">
                                <button 
                                    onClick={() => setView('register')}
                                    className="btn btn-link text-decoration-none"
                                    style={{ fontSize: '12px', color: '#ff2020', fontWeight: 'bold' }}
                                >
                                    Belum ada akaun? Daftar Sekarang
                                </button>
                            </div>
                            <div className="mt-4 p-3 bg-light rounded text-center" style={{ fontSize: '11px', color: '#666', border: '1px solid #ddd' }}>
                                <p className="mb-1">Admin: <strong>admin@tarbiahsentap.com</strong></p>
                                <p className="mb-1">Customer: <strong>customer@example.com</strong></p>
                                <p className="mb-0">Password: <strong>password123</strong></p>
                            </div>
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

        const onSubmit = (e) => {
            e.preventDefault();
            if (password !== confirmPassword) {
                addToast('Kata laluan tidak sepadan', 'error');
                return;
            }
            if (password.length < 8) {
                addToast('Kata laluan mestilah sekurang-kurangnya 8 aksara', 'error');
                return;
            }
            handleSignup(email, password, name, phone);
        };

        return (
            <div className="container py-5 animate-in fade-in" style={{ color: '#1a1a1a' }}>
                <div className="row justify-content-center">
                    <div className="col-md-5">
                        <div className="p-5 bg-white" style={{ borderRadius: '10px', border: '1px solid #eee', boxShadow: '0 5px 25px rgba(0,0,0,0.05)' }}>
                            <h2 className="text-center mb-4" style={{ fontFamily: 'Josefin Sans, sans-serif', fontWeight: 700 }}>Daftar Akaun</h2>
                            <form onSubmit={onSubmit} className="space-y-4">
                                <div>
                                    <label className="form-label" style={{ fontSize: '12px', fontWeight: 'bold' }}>Nama Penuh</label>
                                    <input 
                                        type="text"
                                        value={name}
                                        onChange={e => setName(e.target.value)}
                                        placeholder="Nama Penuh Anda"
                                        className="form-control"
                                        style={{ padding: '12px', borderRadius: '8px' }}
                                        required
                                    />
                                </div>
                                <div>
                                    <label className="form-label" style={{ fontSize: '12px', fontWeight: 'bold' }}>Nombor Telefon</label>
                                    <input 
                                        type="tel"
                                        value={phone}
                                        onChange={e => setPhone(e.target.value)}
                                        placeholder="+60123456789"
                                        className="form-control"
                                        style={{ padding: '12px', borderRadius: '8px' }}
                                        required
                                    />
                                </div>
                                <div>
                                    <label className="form-label" style={{ fontSize: '12px', fontWeight: 'bold' }}>Emel</label>
                                    <input 
                                        type="email"
                                        value={email}
                                        onChange={e => setEmail(e.target.value)}
                                        placeholder="emel@tarbiahsentap.com"
                                        className="form-control"
                                        style={{ padding: '12px', borderRadius: '8px' }}
                                        required
                                    />
                                </div>
                                <div>
                                    <label className="form-label" style={{ fontSize: '12px', fontWeight: 'bold' }}>Kata Laluan</label>
                                    <input 
                                        type="password"
                                        value={password}
                                        onChange={e => setPassword(e.target.value)}
                                        placeholder="••••••••"
                                        className="form-control"
                                        style={{ padding: '12px', borderRadius: '8px' }}
                                        required
                                    />
                                </div>
                                <div>
                                    <label className="form-label" style={{ fontSize: '12px', fontWeight: 'bold' }}>Sahkan Kata Laluan</label>
                                    <input 
                                        type="password"
                                        value={confirmPassword}
                                        onChange={e => setConfirmPassword(e.target.value)}
                                        placeholder="••••••••"
                                        className="form-control"
                                        style={{ padding: '12px', borderRadius: '8px' }}
                                        required
                                    />
                                </div>
                                <button type="submit" className="btn w-full mt-4 py-3" style={{ backgroundColor: '#ff2020', color: 'white', fontWeight: 'bold', textTransform: 'uppercase' }}>Daftar Akaun</button>
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
                            <p className="text-muted mb-4" style={{ fontSize: '13px' }}>Sila masukkan 6-digit biometric token untuk meneruskan.</p>
                            <input 
                                type="text"
                                maxLength="6"
                                value={otp}
                                onChange={(e) => setOtp(e.target.value)}
                                className="form-control text-center mb-4"
                                style={{ padding: '12px', fontSize: '24px', fontWeight: 'bold', trackingSpacing: '6px' }}
                                placeholder="000000"
                            />
                            <button 
                                onClick={() => handleVerify2FA(otp)}
                                className="btn w-full py-3" 
                                style={{ backgroundColor: '#ff2020', color: 'white', fontWeight: 'bold', textTransform: 'uppercase' }}
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

    const DeviceVerificationView = () => {
        const [code, setCode] = useState('');
        return (
            <div className="container py-5 animate-in zoom-in" style={{ color: '#1a1a1a' }}>
                <div className="row justify-content-center">
                    <div className="col-md-5">
                        <div className="p-5 bg-white text-center" style={{ borderRadius: '10px', border: '1px solid #eee', boxShadow: '0 5px 25px rgba(0,0,0,0.05)' }}>
                            <div className="mb-4" style={{ fontSize: '3rem', color: '#ff2020' }}>📱</div>
                            <h2 className="mb-2" style={{ fontFamily: 'Josefin Sans, sans-serif', fontWeight: 700 }}>Pengesahan Peranti</h2>
                            <p className="text-muted mb-3" style={{ fontSize: '13px' }}>Peranti baru dikesan. Kod pengesahan telah dihantar ke <strong style={{ color: '#ff2020' }}>{verifyEmail}</strong>.</p>
                            <input 
                                type="text"
                                maxLength="6"
                                value={code}
                                onChange={(e) => setCode(e.target.value)}
                                className="form-control text-center mb-4"
                                style={{ padding: '12px', fontSize: '24px', fontWeight: 'bold', trackingSpacing: '6px' }}
                                placeholder="000000"
                            />
                            <button 
                                onClick={() => handleVerifyDevice(code)}
                                className="btn w-full py-3" 
                                style={{ backgroundColor: '#ff2020', color: 'white', fontWeight: 'bold', textTransform: 'uppercase' }}
                            >
                                Sahkan Peranti
                            </button>
                            <button 
                                onClick={() => { setVerifyEmail(''); setView('login'); }}
                                className="btn btn-link mt-3 text-decoration-none"
                                style={{ fontSize: '12px', color: '#666', fontWeight: 'bold' }}
                            >
                                Kembali Ke Log Masuk
                            </button>
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
                        <div className="p-5 bg-white" style={{ borderRadius: '10px', border: '1px solid #eee', boxShadow: '0 5px 25px rgba(0,0,0,0.05)' }}>
                            <h2 className="mb-4" style={{ fontFamily: 'Josefin Sans, sans-serif', fontWeight: 700 }}>Alamat Penghantaran</h2>
                            <div className="space-y-4">
                                <div>
                                    <label className="form-label" style={{ fontSize: '12px', fontWeight: 'bold' }}>Destinasi Penghantaran</label>
                                    <input 
                                        type="text" 
                                        value={billingAddress}
                                        onChange={e => setBillingAddress(e.target.value)}
                                        placeholder="Alamat Lengkap Penghantaran" 
                                        className="form-control" 
                                        style={{ padding: '12px', borderRadius: '8px' }}
                                        required
                                    />
                                </div>
                                <div className="pt-4 mt-4 border-t">
                                    <h4 className="mb-3" style={{ fontFamily: 'Josefin Sans, sans-serif', fontWeight: 600 }}>Maklumat Pembayaran</h4>
                                    <div className="p-3 bg-light rounded d-flex align-items-center gap-3 mb-4" style={{ border: '1px solid #ddd' }}>
                                        <div className="p-2 bg-white rounded border">
                                            <CreditCard className="text-danger" />
                                        </div>
                                        <div>
                                            <p className="mb-0 font-bold" style={{ fontSize: '14px' }}>Kad Kredit / Debit</p>
                                            <p className="text-muted mb-0" style={{ fontSize: '11px' }}>Sistem Selamat Bank Redirect</p>
                                        </div>
                                    </div>
                                    <div className="space-y-3">
                                        <input 
                                            type="text" 
                                            value={cardNumber}
                                            onChange={e => setCardNumber(e.target.value)}
                                            placeholder="Nombor Kad Kredit (16 digit)" 
                                            className="form-control" 
                                            style={{ padding: '12px', borderRadius: '8px' }}
                                            maxLength="19"
                                            required
                                        />
                                        <div className="row">
                                            <div className="col-6">
                                                <input 
                                                    type="text" 
                                                    value={cardExpiry}
                                                    onChange={e => setCardExpiry(e.target.value)}
                                                    placeholder="MM/YY" 
                                                    className="form-control" 
                                                    style={{ padding: '12px', borderRadius: '8px' }}
                                                    maxLength="5"
                                                    required
                                                />
                                            </div>
                                            <div className="col-6">
                                                <input 
                                                    type="password" 
                                                    value={cardCvc}
                                                    onChange={e => setCardCvc(e.target.value)}
                                                    placeholder="CVC" 
                                                    className="form-control" 
                                                    style={{ padding: '12px', borderRadius: '8px' }}
                                                    maxLength="4"
                                                    required
                                                />
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                            <button 
                                onClick={processPayment}
                                className="btn w-full mt-5 py-3" 
                                style={{ backgroundColor: '#ff2020', color: 'white', fontWeight: 'bold', textTransform: 'uppercase' }}
                            >
                                Bayar Secara Selamat
                            </button>
                        </div>
                    </div>
                    <div className="col-lg-5">
                        <div className="p-5 bg-white" style={{ borderRadius: '10px', border: '1px solid #eee', boxShadow: '0 5px 25px rgba(0,0,0,0.05)' }}>
                            <h3 className="mb-4" style={{ fontFamily: 'Josefin Sans, sans-serif', fontWeight: 700 }}>Pesanan Anda</h3>
                            <div className="space-y-4 max-h-[400px] overflow-y-auto pr-2 hide-scrollbar">
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
                {view === 'verify-device' && <DeviceVerificationView />}
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
                            
                            <div>
                                <p className="text-[10px] font-black text-[#ff2020] uppercase tracking-widest mb-0.5">Total Balance</p>
                                <p className="text-2xl font-black text-gray-900 tracking-tight">
                                    RM{cart.reduce((sum, item) => sum + (item.book.price * item.quantity), 0).toFixed(2)}
                                </p>
                            </div>
                        </div>

                        <button 
                            onClick={() => setView('cart')}
                            className="relative z-10 bg-gray-900 text-white px-8 py-4 rounded-[1.5rem] font-black text-sm hover:bg-[#ff2020] transition-all shadow-xl active:scale-95 flex items-center gap-2 group/btn"
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
                    <div className="absolute bottom-20 right-0 w-[350px] sm:w-[450px] h-[550px] sm:h-[650px] bg-white rounded-[2rem] shadow-[0_20px_50px_rgba(0,0,0,0.15)] flex flex-col overflow-hidden border border-gray-200 animate-in slide-in-from-bottom-10 duration-500">
                        {/* Header */}
                        <div className="p-4 flex justify-between items-center shadow-sm" style={{ backgroundColor: '#1a1a1a', color: 'white' }}>
                            <div className="flex items-center gap-3">
                                <div className="bg-[#ff2020] p-2 rounded-xl">
                                    <Bot className="w-5 h-5 text-white animate-pulse" />
                                </div>
                                <div>
                                    <p className="font-bold mb-0 text-white" style={{ fontSize: '13px', fontFamily: 'Josefin Sans, sans-serif', textTransform: 'uppercase', letterSpacing: '1px' }}>Pembantu AI Tarbiah</p>
                                    <p className="mb-0 text-muted" style={{ fontSize: '9px', textTransform: 'uppercase', color: '#aaa' }}>Sistem Aktif • Versi 4.0</p>
                                </div>
                            </div>
                            <button onClick={() => setAiChatOpen(false)} className="btn btn-link p-0 text-white hover:text-[#ff2020] transition-colors">
                                <X className="w-5 h-5" />
                            </button>
                        </div>

                        {/* Messages Area */}
                        <div className="flex-grow p-4 overflow-y-auto bg-light space-y-3 hide-scrollbar">
                            {aiMessages.map((msg, idx) => (
                                <div key={idx} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'} animate-in fade-in slide-in-from-bottom-2 duration-300`}>
                                    <div className={`max-w-[85%] p-3 rounded-2xl text-sm leading-relaxed shadow-sm border ${
                                        msg.role === 'user' 
                                        ? 'text-white rounded-br-sm border-none font-bold' 
                                        : 'bg-white border-gray-200 text-gray-800 rounded-bl-sm'
                                    }`}
                                    style={{
                                        backgroundColor: msg.role === 'user' ? '#ff2020' : 'white',
                                        color: msg.role === 'user' ? 'white' : '#1a1a1a',
                                    }}>
                                        {msg.text}
                                    </div>
                                </div>
                            ))}
                            {aiChatLoading && (
                                <div className="flex justify-start">
                                    <div className="bg-white border border-gray-200 p-3 rounded-2xl rounded-bl-sm shadow-sm flex gap-1.5">
                                        <div className="w-2 h-2 bg-[#ff2020] rounded-full animate-bounce"></div>
                                        <div className="w-2 h-2 bg-[#ff2020] rounded-full animate-bounce delay-100"></div>
                                        <div className="w-2 h-2 bg-[#ff2020] rounded-full animate-bounce delay-200"></div>
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
                                style={{ backgroundColor: '#ff2020', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', border: 'none' }}
                            >
                                <Send className="w-4 h-4" />
                            </button>
                        </form>
                    </div>
                )}

                <button 
                    onClick={() => setAiChatOpen(!aiChatOpen)}
                    className="w-14 h-14 rounded-circle shadow-lg hover:scale-110 active:scale-95 transition-all flex items-center justify-center border-none"
                    style={{ backgroundColor: '#ff2020', color: 'white' }}
                >
                    {aiChatOpen ? <X className="w-6 h-6" /> : <MessageSquare className="w-6 h-6" />}
                </button>
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
