import React, { useState, useMemo, useEffect } from 'react';
import {
    ShoppingCart, BookOpen, User, Star, Trash2, Plus,
    Search, LogOut, Package, ChevronRight, X, Check,
    CreditCard, ShieldCheck, LayoutDashboard, Edit,
    Sparkles, MessageSquare, Bot, Send, Loader2, Menu,
    Eye, EyeOff, Lock, Mail, ArrowRight, Tag, Gift, Truck,
    FileText, CheckCircle2, Heart

} from 'lucide-react';
import { authApi, bookApi, orderApi, adminApi, paymentApi } from './services/api';
import StitchDesign from './StitchDesign';
import ArchiveCatalog from './ArchiveCatalog';
import PortalView from './PortalView';
import CartDrawer from './CartDrawer';
import DetailedCartView from './DetailedCartView';
import UnifiedHeader from './UnifiedHeader';

export default function App() {
    const [viewActual, setViewActual] = useState('portal'); // 'portal', 'catalog', 'cart', 'checkout', 'login', 'admin', 'orders', '2fa'
    const [isCartOpen, setIsCartOpen] = useState(false);
    
    // Intercept view changes so 'cart' navigates to the detailed cart view
    const setView = (v) => {
        if (v === 'cart') {
            setViewActual('detailed-cart');
        } else {
            setViewActual(v);
        }
    };
    
    // Alias view to viewActual for the rest of the component
    const view = viewActual;
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
    const [user, setUser] = useState(null);
    const [books, setBooks] = useState([]);
    const [loading, setLoading] = useState(true);
    const [cart, setCart] = useState(() => {
        try {
            const savedCart = localStorage.getItem('cart_items');
            return savedCart ? JSON.parse(savedCart) : [];
        } catch {
            return [];
        }
    });

    useEffect(() => {
        localStorage.setItem('cart_items', JSON.stringify(cart));
    }, [cart]);
    const [lastOrder, setLastOrder] = useState(null);
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
    const [cardNumber, setCardNumber] = useState('4242 4242 4242 4242');
    const [cardExpiry, setCardExpiry] = useState('12/28');
    const [cardCvc, setCardCvc] = useState('123');
    const [promoDiscount, setPromoDiscount] = useState(0);
    const [promoCodeApplied, setPromoCodeApplied] = useState('');
    const [checkoutName, setCheckoutName] = useState('');
    const [checkoutPhone, setCheckoutPhone] = useState('');
    const [checkoutCity, setCheckoutCity] = useState('');
    const [checkoutPostalCode, setCheckoutPostalCode] = useState('');
    const [cardholderName, setCardholderName] = useState('ALI BIN AHMAD');

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
            '4': 'Himpunan sinopsis dan tadabbur ringkas 30 juzuk Al-Quran, ditulis dengan bahasa yang mudah dipahami untuk mendekatkan diri dengan kalam tuhan.',
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
        if (savedUser) {
            const parsedUser = JSON.parse(savedUser);
            // Check if user has a valid UUID (UUID v4 format), if not clear corrupted session
            const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
            if (!parsedUser.id || !uuidRegex.test(parsedUser.id)) {
                localStorage.removeItem('user');
                localStorage.removeItem('token');
                setUser(null);
            } else {
                setUser(parsedUser);
                if (parsedUser.role === 'admin') {
                    setViewActual('admin'); // set to admin view directly
                }
            }
        }

        // Check if account was just activated
        const params = new URLSearchParams(window.location.search);
        if (params.get('activated') === 'true') {
            addToast('Akaun berjaya diaktifkan! Sila log masuk.', 'success');
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
            addToast('Gagal memuatkan buku', 'error');
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
            addToast('Gagal memuatkan pesanan', 'error');
        }
    };

    useEffect(() => {
        if (view === 'orders' && user) {
            fetchMyOrders();
        }
        
        // Handle activation redirect from Laravel backend
        const params = new URLSearchParams(window.location.search);
        if (params.get('activated') === 'true') {
            setView('activation');
            // Clean up the URL without refreshing
            window.history.replaceState({}, document.title, window.location.pathname);
        } else if (window.location.pathname === '/login') {
            setView('login');
        }

        // Handle Stripe payment callbacks
        if (params.get('payment') === 'success' || params.get('payment') === 'cancel') {
            const status = params.get('payment');
            const tempCart = localStorage.getItem('temp_cart');
            const tempBilling = localStorage.getItem('temp_billing_address');
            
            let restoredCart = cart;
            if (tempCart) {
                restoredCart = JSON.parse(tempCart);
                setCart(restoredCart);
            }
            if (tempBilling) setBillingAddress(tempBilling);
            
            localStorage.removeItem('temp_cart');
            localStorage.removeItem('temp_billing_address');
            
            completeTransaction(status === 'success' ? 'success' : 'fail', restoredCart);
            window.history.replaceState({}, document.title, window.location.pathname);
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
        setIsCartOpen(true);
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
            addToast('Sila log masuk untuk membuat pembayaran', 'error');
            setView('login');
            return;
        }
        setIsCartOpen(false);
        setView('checkout');
    };

    const processPayment = async () => {
        if (!billingAddress.trim()) {
            addToast('Sila isikan alamat destinasi anda.', 'error');
            return;
        }

        try {
            const finalTotal = total;
            
            // Save cart state before redirecting to Stripe
            localStorage.setItem('temp_cart', JSON.stringify(cart));
            localStorage.setItem('temp_billing_address', billingAddress);

            const res = await paymentApi.createOrder({
                amount: finalTotal,
                currency: 'MYR',
                success_url: `${window.location.origin}/?payment=success`,
                cancel_url: `${window.location.origin}/?payment=cancel`
            });

            if (!res.data.success) {
                addToast('Gagal memulakan pembayaran', 'error');
                return;
            }

            // Redirect to Stripe checkout URL
            window.location.href = res.data.url;

        } catch (err) {
            console.error(err);
            addToast('Ralat menyediakan pembayaran. Beralih ke mod sandaran...', 'error');
            // If backend is unavailable or not set up, just fallback for visual tests
            completeTransaction('success');
        }
    };

    const completeTransaction = async (status, cartOverride = null) => {
        if (status === 'fail') {
            setView('payment-failed');
            return;
        }

        const activeCart = cartOverride || cart;
        const currentTotal = activeCart.reduce((sum, item) => sum + (item.book.price * item.quantity), 0);
        const orderPayload = {
            items: activeCart.map(item => ({ book_id: item.book.id, quantity: item.quantity, price: item.book.price })),
            total_amount: currentTotal * 1.08 // including tax
        };

        const executeSuccessFlow = (orderId) => {
            setLastOrder({
                items: [...activeCart],
                total: currentTotal * 1.08,
                orderId: orderId || 'MS-2024-8891-GATS'
            });
            setCart([]);
            setBillingAddress('');
            setCardNumber('');
            setCardExpiry('');
            setCardCvc('');
            setView('payment-success');
        };

        try {
            const res = await orderApi.create(orderPayload);
            if (res.data.success) {
                executeSuccessFlow(res.data.data.id);
            } else {
                setView('payment-failed');
            }
        } catch (err) {
            console.error('Backend order creation errored', err);
            setView('payment-failed');
            // If we have addToast available here, we could use it, but setView handles the UI
        }
    };

    const handleLogin = async (email, password) => {
        try {
            const res = await authApi.login(email, password);
            if (res.data.requires_device_verification) {
                setVerifyEmail(email);
                setView('verify-device');
                addToast('Pengesahan peranti baharu diperlukan', 'info');
            } else if (res.data.requires_totp || res.data.pending2FA) {
                setTempToken(res.data.temp_token || res.data.tempToken);
                setUserId(res.data.user_id || res.data.userId);
                setView('2fa');
                addToast('Pengesahan 2FA diperlukan', 'info');
            } else if (res.data.success) {
                const userData = res.data.user;
                localStorage.setItem('token', res.data.token);
                localStorage.setItem('user', JSON.stringify(userData));
                setUser(userData);
                setView(userData.role === 'admin' ? 'admin' : 'catalog');
                addToast('Log masuk berjaya');
            }
        } catch (err) {
            const errorMsg = err.response?.data?.message || err.response?.data?.error || 'Log masuk tidak sah';
            addToast(errorMsg, 'error');
        }
    };

    const handleSignup = async (email, password, name, phone) => {
        try {
            const res = await authApi.signup(email, password, name, phone);
            if (res.data.success) {
                addToast(res.data.message || 'Pendaftaran berjaya! Sila sahkan e-mel anda.', 'info');
                setView('login');
            }
        } catch (err) {
            const errors = err.response?.data?.errors;
            let errorMsg = err.response?.data?.message || 'Pendaftaran gagal';
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
            const res = await authApi.verify2FA(otp, userId, tempToken);
            if (res.data.success) {
                const userData = res.data.user;
                localStorage.setItem('token', res.data.token);
                localStorage.setItem('user', JSON.stringify(userData));
                setUser(userData);
                setTempToken(null);
                setUserId(null);
                setView(userData.role === 'admin' ? 'admin' : 'catalog');
                addToast('2FA Disahkan');
            }
        } catch (err) {
            const errorMsg = err.response?.data?.message || 'OTP tidak sah';
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
                addToast('Pengesahan 2FA diperlukan', 'info');
            } else if (res.data.success) {
                const userData = res.data.user;
                localStorage.setItem('token', res.data.token);
                localStorage.setItem('user', JSON.stringify(userData));
                setUser(userData);
                setVerifyEmail('');
                setView(userData.role === 'admin' ? 'admin' : 'catalog');
                addToast('Peranti disahkan dan berjaya log masuk');
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
        addToast('Log keluar berjaya');
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
                    <a className="font-headline-md text-headline-md font-bold uppercase tracking-widest" href="#" style={{ color: '#c5a059' }}>Tarbiah Sentap</a>
                    <nav className="hidden md:flex gap-8">
                      <a className="font-label-md text-label-md text-primary dark:text-primary-fixed border-b-2 border-primary-container pb-1 transition-all duration-200" href="#">Koleksi</a>
                      <a className="font-label-md text-label-md text-on-surface-variant dark:text-on-surface-variant hover:text-primary-container dark:hover:text-primary-fixed-dim transition-colors duration-300" href="#">Edisi</a>
                      <a className="font-label-md text-label-md text-on-surface-variant dark:text-on-surface-variant hover:text-primary-container dark:hover:text-primary-fixed-dim transition-colors duration-300" href="#">Arkib</a>
                      <a className="font-label-md text-label-md text-on-surface-variant dark:text-on-surface-variant hover:text-primary-container dark:hover:text-primary-fixed-dim transition-colors duration-300" href="#">Tentang Kami</a>
                    </nav>
                  </div>
                  <div className="flex items-center gap-6">
                    <div className="hidden md:flex items-center border-b border-on-surface/20 pb-1">
                      <span className="material-symbols-outlined text-[20px] text-on-surface-variant">search</span>
                      <input className="bg-transparent border-none focus:ring-0 text-label-md placeholder:text-on-surface-variant/50 w-48" placeholder="Cari naskhah..." type="text"/>
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
                          <span className="font-label-sm text-label-sm uppercase tracking-tighter">Koleksi</span>
                          <span className="material-symbols-outlined text-[12px]">chevron_right</span>
                          <span className="font-label-sm text-label-sm uppercase tracking-tighter">Klasik Moden</span>
                        </nav>
                        <h1 className="font-headline-lg text-headline-lg md:text-[64px] leading-tight mb-4 text-on-surface">Bayangan Angin</h1>
                        <p className="font-headline-sm text-headline-sm italic text-primary mb-8">Carlos Ruiz Zafón</p>
                        <div className="flex items-center gap-4 mb-12">
                          <span className="font-headline-md text-headline-md text-on-surface">$85.00</span>
                          <span className="px-3 py-1 bg-secondary-container text-on-secondary-container font-label-sm text-label-sm rounded-full">Edisi Istimewa</span>
                        </div>
                        <div className="space-y-8 mb-12">
                          <p className="font-body-lg text-body-lg text-on-surface-variant leading-relaxed">Karya agung berlatarkan Barcelona pasca perang, menampilkan ilustrasi eksklusif. Sebuah kisah mengenai perpustakaan rahsia buku-buku yang dilupakan dan obsesi seorang budak lelaki terhadap seorang novelis misteri.</p>
                          <div className="flex flex-col gap-4">
                            <button className="w-full bg-primary-container text-on-primary py-5 font-label-md text-label-md uppercase tracking-widest hover:bg-primary transition-all duration-300 flex items-center justify-center gap-3 group">
                              <span>Masuk Troli</span>
                              <span className="material-symbols-outlined group-hover:translate-x-1 transition-transform" data-icon="arrow_forward">arrow_forward</span>
                            </button>
                            <button className="w-full border border-secondary text-on-surface py-5 font-label-md text-label-md uppercase tracking-widest hover:bg-secondary-container/10 transition-all duration-300">Prapesan Edisi Istimewa</button>
                          </div>
                        </div>
                        {/* Details Accordion */}
                        <div className="border-t border-outline-variant/30 pt-8 space-y-6">
                          <details className="group" open>
                            <summary className="list-none flex justify-between items-center cursor-pointer">
                              <span className="font-label-md text-label-md uppercase tracking-widest text-on-surface">Butiran Buku</span>
                              <span className="material-symbols-outlined transition-transform group-open:rotate-180">expand_more</span>
                            </summary>
                            <div className="pt-4 grid grid-cols-2 gap-y-4">
                              <div>
                                <p className="font-label-sm text-label-sm text-on-surface-variant uppercase mb-1">Format</p>
                                <p className="font-body-md text-body-md">Kulit Keras, Berbalut Fabrik</p>
                              </div>
                              <div>
                                <p className="font-label-sm text-label-sm text-on-surface-variant uppercase mb-1">Muka Surat</p>
                                <p className="font-body-md text-body-md">487 Kertas Krim Premium</p>
                              </div>
                              <div>
                                <p className="font-label-sm text-label-sm text-on-surface-variant uppercase mb-1">Dimensi</p>
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
                              <span className="font-label-md text-label-md uppercase tracking-widest text-on-surface">Penghantaran &amp; Pemulangan</span>
                              <span className="material-symbols-outlined transition-transform group-open:rotate-180">expand_more</span>
                            </summary>
                            <div className="pt-4">
                              <p className="font-body-md text-body-md text-on-surface-variant">Penghantaran eksklusif percuma untuk semua edisi istimewa. Dihantar dalam kotak simpanan arkib pelindung khas.</p>
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
                                        placeholder="Cari naskhah..."
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
                                    <button type="submit" className="px-4 py-2.5 bg-black hover:bg-[#8b0000] text-white text-xs font-bold uppercase tracking-wider rounded-none transition-all duration-300 border-0 cursor-pointer">Guna</button>
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
            <div className="min-h-[85vh] flex items-center justify-center py-12 px-4 sm:px-6 bg-gradient-to-br from-[#8b0000] via-[#4a0000] to-black">
                <div className="w-full max-w-2xl bg-white shadow-2xl p-10 sm:p-16 relative overflow-hidden mx-auto rounded-none border border-gray-100">
                    {/* Decorative Element: Subtle Crimson Line */}
                    <div className="absolute top-0 left-0 w-full h-1 bg-primary-container"></div>
                    <div className="text-center mb-12">
                        <span className="font-label-sm text-label-sm text-secondary tracking-[0.2em] uppercase mb-4 block">Archive Access</span>
                        <h1 className="font-headline-lg text-headline-lg text-on-surface mb-4">Welcome Back</h1>
                        <p className="font-body-md text-body-md text-on-surface-variant max-w-[320px] mx-auto italic">
                            The quiet of the library awaits your return. Please enter your credentials to access your private collection.
                        </p>
                    </div>
                    <form onSubmit={onSubmit} className="space-y-8">
                        {/* Input Group: Email */}
                        <div className="relative group">
                            <label className="block font-label-md text-label-md text-on-surface mb-1 transition-colors group-focus-within:text-primary" htmlFor="email">Alamat Emel</label>
                            <input 
                                className="w-full bg-transparent border-t-0 border-x-0 border-b border-on-surface/20 py-3 focus:ring-0 focus:border-primary transition-all font-body-md placeholder:text-on-surface-variant/30 outline-none" 
                                id="email" 
                                name="email" 
                                placeholder="user@tarbiahsentap.com" 
                                required 
                                type="email"
                                value={email}
                                onChange={e => setEmail(e.target.value)}
                            />
                        </div>
                        {/* Input Group: Password */}
                        <div className="relative group">
                            <div className="flex justify-between items-center mb-1">
                                <label className="block font-label-md text-label-md text-on-surface transition-colors group-focus-within:text-primary" htmlFor="password">Kata Laluan</label>
                                <a className="font-label-sm text-label-sm text-on-surface-variant hover:text-primary transition-colors underline decoration-primary/20 cursor-pointer" onClick={(e) => e.preventDefault()}>Forgot?</a>
                            </div>
                            <input 
                                className="w-full bg-transparent border-t-0 border-x-0 border-b border-on-surface/20 py-3 focus:ring-0 focus:border-primary transition-all font-body-md placeholder:text-on-surface-variant/30 outline-none" 
                                id="password" 
                                name="password" 
                                placeholder="••••••••" 
                                required 
                                type={showPassword ? "text" : "password"}
                                value={password}
                                onChange={e => setPassword(e.target.value)}
                            />
                            <button 
                                className="absolute right-0 bottom-3 text-on-surface-variant/60 hover:text-primary transition-colors bg-transparent border-0 cursor-pointer outline-none flex items-center justify-center p-1" 
                                type="button"
                                onClick={() => setShowPassword(!showPassword)}
                            >
                                <span className="material-symbols-outlined text-[20px]">{showPassword ? 'visibility_off' : 'visibility'}</span>
                            </button>
                        </div>
                        {/* Remember Me */}
                        <div className="flex items-center gap-3">
                            <input className="w-4 h-4 border-on-surface/30 text-primary-container focus:ring-primary-container/20 rounded-none cursor-pointer outline-none" id="remember" type="checkbox"/>
                            <label className="font-label-sm text-label-sm text-on-surface-variant cursor-pointer" htmlFor="remember">Remember my session in this archive</label>
                        </div>
                        {/* Primary Action */}
                        <div className="pt-4 flex flex-col gap-4">
                            <button className="w-full bg-[#8b0000] hover:bg-[#5a0000] border-0 text-white font-label-md text-label-md py-5 transition-all duration-300 hover:tracking-widest active:scale-[0.98] cursor-pointer outline-none shadow-md font-bold uppercase tracking-widest" type="submit">
                                Sign In
                            </button>
                            <button type="button" onClick={() => setView('register')} style={{ color: '#8b0000' }} className="w-full bg-transparent border border-[#8b0000] hover:bg-[#8b0000]/5 font-label-md text-label-md py-5 transition-all duration-300 hover:tracking-widest active:scale-[0.98] cursor-pointer outline-none uppercase font-semibold">
                                Register
                            </button>
                        </div>
                    </form>
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
            <div className="min-h-[85vh] flex items-center justify-center py-12 px-4 sm:px-6 bg-gradient-to-br from-white via-gray-200 to-gray-400">
                <div className="w-full max-w-2xl bg-[#8b0000] shadow-2xl p-10 sm:p-16 relative overflow-hidden mx-auto rounded-none border border-[#8b0000]">
                    {/* Decorative Element: Subtle White Line */}
                    <div className="absolute top-0 left-0 w-full h-1 bg-white/20"></div>
                    
                    <div className="text-center mb-12">
                        <span className="font-label-sm text-label-sm text-white/70 tracking-[0.2em] uppercase mb-4 block">New Patron</span>
                        <h1 className="font-headline-lg text-headline-lg text-white mb-4">Request Invitation</h1>
                        <p className="font-body-md text-body-md text-white/80 max-w-[320px] mx-auto italic">
                            Begin your journey with us. Fill in your details to create your private collection.
                        </p>
                    </div>

                    <form onSubmit={onSubmit} className="space-y-6">
                        {/* Name */}
                        <div className="relative group">
                            <label className="block font-label-md text-label-md text-white/90 mb-1 transition-colors group-focus-within:text-white" htmlFor="name">Nama Penuh</label>
                            <input 
                                className="w-full bg-transparent border-t-0 border-x-0 border-b border-white/30 py-3 focus:ring-0 focus:border-white transition-all font-body-md text-white placeholder:text-white/40 outline-none" 
                                id="name" name="name" placeholder="Your full name" required type="text"
                                value={name} onChange={e => setName(e.target.value)}
                            />
                        </div>

                        {/* Phone */}
                        <div className="relative group">
                            <label className="block font-label-md text-label-md text-white/90 mb-1 transition-colors group-focus-within:text-white" htmlFor="phone">Nombor Telefon</label>
                            <input 
                                className="w-full bg-transparent border-t-0 border-x-0 border-b border-white/30 py-3 focus:ring-0 focus:border-white transition-all font-body-md text-white placeholder:text-white/40 outline-none" 
                                id="phone" name="phone" placeholder="Your phone number" required type="text"
                                value={phone} onChange={e => setPhone(e.target.value)}
                            />
                        </div>

                        {/* Email */}
                        <div className="relative group">
                            <label className="block font-label-md text-label-md text-white/90 mb-1 transition-colors group-focus-within:text-white" htmlFor="email">Alamat Emel</label>
                            <input 
                                className="w-full bg-transparent border-t-0 border-x-0 border-b border-white/30 py-3 focus:ring-0 focus:border-white transition-all font-body-md text-white placeholder:text-white/40 outline-none" 
                                id="email" name="email" placeholder="user@tarbiahsentap.com" required type="email"
                                value={email} onChange={e => setEmail(e.target.value)}
                            />
                        </div>

                        {/* Passwords */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                            {/* Password */}
                            <div className="relative group">
                                <label className="block font-label-md text-label-md text-white/90 mb-1 transition-colors group-focus-within:text-white" htmlFor="password">Kata Laluan</label>
                                <input 
                                    className="w-full bg-transparent border-t-0 border-x-0 border-b border-white/30 py-3 focus:ring-0 focus:border-white transition-all font-body-md text-white placeholder:text-white/40 outline-none pr-10" 
                                    id="password" name="password" placeholder="Min. 6 chars" required type={showPassword ? "text" : "password"}
                                    value={password} onChange={e => setPassword(e.target.value)}
                                />
                                <button 
                                    className="absolute right-0 bottom-3 text-white/60 hover:text-white transition-colors bg-transparent border-0 cursor-pointer outline-none flex items-center justify-center p-1" 
                                    type="button" onClick={() => setShowPassword(!showPassword)}
                                >
                                    <span className="material-symbols-outlined text-[20px]">{showPassword ? 'visibility_off' : 'visibility'}</span>
                                </button>
                            </div>

                            {/* Confirm Password */}
                            <div className="relative group">
                                <label className="block font-label-md text-label-md text-white/90 mb-1 transition-colors group-focus-within:text-white" htmlFor="confirmPassword">Confirm Password</label>
                                <input 
                                    className="w-full bg-transparent border-t-0 border-x-0 border-b border-white/30 py-3 focus:ring-0 focus:border-white transition-all font-body-md text-white placeholder:text-white/40 outline-none pr-10" 
                                    id="confirmPassword" name="confirmPassword" placeholder="Repeat password" required type={showPassword ? "text" : "password"}
                                    value={confirmPassword} onChange={e => setConfirmPassword(e.target.value)}
                                />
                            </div>
                        </div>

                        {/* Actions */}
                        <div className="pt-8 flex flex-col gap-4">
                            <button style={{ color: '#8b0000' }} className="w-full bg-white hover:bg-gray-100 border-0 font-label-md text-label-md py-5 transition-all duration-300 hover:tracking-widest active:scale-[0.98] cursor-pointer outline-none shadow-md font-bold uppercase tracking-widest" type="submit">
                                Register
                            </button>
                            <button type="button" onClick={() => setView('login')} className="w-full bg-transparent border border-white/40 text-white hover:bg-white/10 font-label-md text-label-md py-5 transition-all duration-300 hover:tracking-widest active:scale-[0.98] cursor-pointer outline-none uppercase font-semibold">
                                Return to Sign In
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        );
    };

    const ActivationView = () => {
        return (
            <div className="min-h-screen bg-surface-bright dark:bg-zinc-950 flex flex-col font-sans transition-colors duration-300">
                <div className="flex-1 flex flex-col items-center justify-center p-6 text-center z-10 relative">
                  <div className="w-20 h-20 bg-green-500/10 rounded-full flex items-center justify-center mb-6 border border-green-500/20">
                    <span className="material-symbols-outlined text-4xl text-green-500">
                      check_circle
                    </span>
                  </div>
                  <h2 className="text-3xl font-bold text-gray-900 dark:text-white tracking-tight mb-3" style={{ fontFamily: 'EB Garamond, serif' }}>
                    Account Activated
                  </h2>
                  <p className="text-gray-500 dark:text-zinc-400 max-w-md mx-auto mb-8 leading-relaxed text-sm">
                    Thank you for verifying your email. Your Tarbiah Sentap account is now fully active. You can now login to access all features.
                  </p>
                  <button onClick={() => setView('login')} className="bg-[#f27830] hover:bg-[#d96620] text-white px-8 py-3 rounded-xl font-bold transition-all duration-300 shadow-[0_4px_14px_0_rgba(242,120,48,0.39)] hover:shadow-[0_6px_20px_rgba(242,120,48,0.23)] hover:-translate-y-0.5 active:translate-y-0 border-0 cursor-pointer">
                    Continue to Login
                  </button>
                </div>
            </div>
        );
    };

    const ProfileView = () => {
        const [isEditModalOpen, setIsEditModalOpen] = useState(false);
        const [profileName, setProfileName] = useState(user?.name || 'Arthur Penhaligon');
        const [profileTitle, setProfileTitle] = useState('Senior Curator');
        const [profileBio, setProfileBio] = useState('Dedicated to the preservation of 19th-century rare manuscripts and the evolution of modern typography. My collection focuses on the intersection of visual arts and philosophical texts.');
        
        const [editName, setEditName] = useState(profileName);
        const [editTitle, setEditTitle] = useState(profileTitle);
        const [editBio, setEditBio] = useState(profileBio);
        const [editAvatarFile, setEditAvatarFile] = useState(null);
        const [editAvatarPreview, setEditAvatarPreview] = useState(user?.avatar || 'https://lh3.googleusercontent.com/aida/AP1WRLs_xQ7iinow1lDM-3BuBZJ7Fx0qu0FX163teSFdDor-OW1spUFaQ-YbkQln6hPPO4iswURLqFioXyRkTX4pVQx-nIxT8_N4XxG9FDyeWSQB__lk9omcHENV9TNipkjuu6mbsSPfL9AHvQhSzFhY3k5q7KQ49YZOwh7aJeiE_Z3CcMC3cKn7NVJBFz7s5hzbn3OuEYVhUy4V4GcCKUppKZNnJnbm5OexHxBWqLsSHKQkThwpikwwWWu1pYU');

        const handleSave = async (e) => {
            e.preventDefault();
            try {
                const formData = new FormData();
                formData.append('name', editName);
                formData.append('title', editTitle);
                formData.append('bio', editBio);
                if (editAvatarFile) {
                    formData.append('avatar', editAvatarFile);
                }

                const res = await authApi.updateProfile(formData);
                
                if (res.data.success) {
                    setProfileName(res.data.user.name);
                    setProfileTitle(res.data.user.title || '');
                    setProfileBio(res.data.user.bio || '');
                    
                    // Update global user state and local storage
                    const updatedUser = { ...user, ...res.data.user };
                    setUser(updatedUser);
                    localStorage.setItem('user', JSON.stringify(updatedUser));
                    
                    setIsEditModalOpen(false);
                    addToast('Profile updated successfully', 'success');
                }
            } catch (err) {
                console.error(err);
                addToast('Failed to update profile', 'error');
            }
        };

        return (
            <div className="bg-[#f9f9f9] text-[#1a1c1c] min-h-screen">
                <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-16 pb-24">
                    {/* Section 1: Member Overview */}
                    <section className="mb-24">
                        <div className="flex flex-col md:flex-row md:items-end justify-between gap-8">
                            <div className="max-w-2xl">
                                <span className="font-label-md text-label-md tracking-[0.2em] uppercase text-[#610000] mb-4 block">Personal Archives</span>
                                <div className="flex items-center gap-6 mb-6">
                                    <img alt="Profile" className="w-20 h-20 rounded-full object-cover border border-[#e3beb8]/30 shadow-sm" src={user?.avatar || "https://lh3.googleusercontent.com/aida/AP1WRLs_xQ7iinow1lDM-3BuBZJ7Fx0qu0FX163teSFdDor-OW1spUFaQ-YbkQln6hPPO4iswURLqFioXyRkTX4pVQx-nIxT8_N4XxG9FDyeWSQB__lk9omcHENV9TNipkjuu6mbsSPfL9AHvQhSzFhY3k5q7KQ49YZOwh7aJeiE_Z3CcMC3cKn7NVJBFz7s5hzbn3OuEYVhUy4V4GcCKUppKZNnJnbm5OexHxBWqLsSHKQkThwpikwwWWu1pYU"} />
                                    <div className="flex items-center gap-6">
                                        <h1 className="font-headline-lg text-4xl leading-none text-[#1a1c1c]">{profileName}</h1>
                                        <button style={{ color: '#000000', borderColor: '#000000' }} onClick={() => setIsEditModalOpen(true)} className="px-4 py-1.5 border border-black text-black font-label-md text-label-md uppercase tracking-widest hover:bg-black hover:text-white transition-colors cursor-pointer bg-transparent">Edit</button>
                                    </div>
                                </div>
                            </div>
                            <div className="flex items-center gap-4 mt-8 pt-8 border-t border-[#e3beb8]/10">
                                <button className="bg-[#610000] text-white px-8 py-3 font-label-md text-label-md uppercase tracking-widest hover:bg-[#8b0000] transition-colors duration-300 shadow-sm cursor-pointer border-0">Save Changes</button>
                                <button style={{ color: '#000000' }} className="px-8 py-3 font-label-md text-label-md uppercase tracking-widest text-black hover:opacity-70 transition-colors duration-300 cursor-pointer border-0 bg-transparent">Batal</button>
                            </div>
                        </div>
                    </section>

                    {/* Section 2: Order History */}
                    <section className="mb-24 grid grid-cols-1 lg:grid-cols-12 gap-6">
                        <div className="lg:col-span-8">
                            <h2 className="font-headline-md text-3xl mb-8 text-[#1a1c1c]">Recent Orders</h2>
                            <div className="overflow-x-auto">
                                <table className="w-full border-collapse">
                                    <thead>
                                        <tr className="border-b border-[#5a403c]/20">
                                            <th className="text-left py-4 font-label-md text-label-md uppercase tracking-widest text-[#5a403c]">Order Ref</th>
                                            <th className="text-left py-4 font-label-md text-label-md uppercase tracking-widest text-[#5a403c]">Pembelian</th>
                                            <th className="text-left py-4 font-label-md text-label-md uppercase tracking-widest text-[#5a403c]">Status</th>
                                            <th className="text-right py-4 font-label-md text-label-md uppercase tracking-widest text-[#5a403c]">Action</th>
                                        </tr>
                                    </thead>
                                    <tbody className="font-body-md text-body-md">
                                        {orders && orders.length > 0 ? (
                                            orders.slice(0, 5).map((order) => (
                                                <tr key={order.id} className="border-b border-[#e3beb8]/10 hover:bg-white transition-colors">
                                                    <td className="py-6">#{order.id ? order.id.toString().slice(0, 8).toUpperCase() : 'N/A'}</td>
                                                    <td className="py-6">
                                                        {order.items && order.items.length > 0 
                                                            ? `${order.items[0].book?.title || 'Book'}${order.items.length > 1 ? ` + ${order.items.length - 1} more` : ''}` 
                                                            : 'Unknown Item'}
                                                    </td>
                                                    <td className="py-6">
                                                        <span className={`inline-flex items-center gap-2 font-medium ${order.status === 'pending' ? 'text-[#735c00]' : 'text-[#610000]'}`}>
                                                            <span className={`w-2 h-2 rounded-full ${order.status === 'pending' ? 'bg-[#735c00]' : 'bg-[#610000] animate-pulse'}`}></span>
                                                            {order.status === 'pending' ? 'Processing' : 'Shipped'}
                                                        </span>
                                                    </td>
                                                    <td className="py-6 text-right"><a className="text-[#5a403c] hover:text-[#610000] underline underline-offset-4 decoration-1 cursor-pointer">Track</a></td>
                                                </tr>
                                            ))
                                        ) : (
                                            <tr className="border-b border-[#e3beb8]/10 hover:bg-white transition-colors">
                                                <td colSpan="4" className="py-8 text-center text-[#5a403c]">no recent order</td>
                                            </tr>
                                        )}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    </section>

                    {/* Section 5: Account Settings */}
                    <section className="mb-24">
                        <h2 className="font-headline-md text-3xl mb-10 text-[#1a1c1c]">Archive Governance</h2>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
                            <div className="border-t border-[#5a403c]/20 pt-8 flex justify-between items-start">
                                <div>
                                    <h4 className="font-label-md text-label-md uppercase tracking-widest text-[#610000] mb-2">Shipping Sanctuaries</h4>
                                    <p className="font-body-md text-body-md text-[#5a403c] mb-6">Manage your primary and secondary delivery residences for rare items.</p>
                                    <a className="font-label-sm text-label-sm uppercase tracking-tighter text-[#1a1c1c] hover:text-[#610000] transition-colors border-b border-[#610000] pb-1 cursor-pointer flex items-center w-max"><span className="material-symbols-outlined text-[18px] mr-2">settings</span>Modify Addresses</a>
                                </div>
                                <span className="material-symbols-outlined text-[#5a403c]/40">home_pin</span>
                            </div>
                            <div className="border-t border-[#5a403c]/20 pt-8 flex justify-between items-start">
                                <div>
                                    <h4 className="font-label-md text-label-md uppercase tracking-widest text-[#610000] mb-2">Digital Security</h4>
                                    <p className="font-body-md text-body-md text-[#5a403c] mb-6">Update your multi-factor authentication and personal entry keys.</p>
                                    <a className="font-label-sm text-label-sm uppercase tracking-tighter text-[#1a1c1c] hover:text-[#610000] transition-colors border-b border-[#610000] pb-1 cursor-pointer flex items-center w-max"><span className="material-symbols-outlined text-[18px] mr-2">settings</span>Secure Login</a>
                                </div>
                                <span className="material-symbols-outlined text-[#5a403c]/40">key</span>
                            </div>
                        </div>
                        
                        <div className="mt-16 border-t border-[#5a403c]/20 pt-12">
                            <h3 className="font-headline-sm text-2xl mb-8 text-[#1a1c1c]">Manage Shipping Sanctuaries</h3>
                            <form className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-8">
                                <div className="flex flex-col gap-2">
                                    <label className="font-label-md text-label-md uppercase tracking-widest text-[#5a403c]">Recipient Name</label>
                                    <input className="bg-transparent border-0 border-b border-[#5a403c]/30 py-2 px-0 font-body-md text-body-md focus:ring-0 focus:border-[#610000] transition-colors outline-none" placeholder="e.g. Arthur Penhaligon" type="text" />
                                </div>
                                <div className="flex flex-col gap-2">
                                    <label className="font-label-md text-label-md uppercase tracking-widest text-[#5a403c]">Street Address</label>
                                    <input className="bg-transparent border-0 border-b border-[#5a403c]/30 py-2 px-0 font-body-md text-body-md focus:ring-0 focus:border-[#610000] transition-colors outline-none" placeholder="e.g. 123 Baker Street" type="text" />
                                </div>
                                <div className="grid grid-cols-3 gap-4">
                                    <div className="flex flex-col gap-2">
                                        <label className="font-label-md text-label-md uppercase tracking-widest text-[#5a403c]">Bandar</label>
                                        <input className="bg-transparent border-0 border-b border-[#5a403c]/30 py-2 px-0 font-body-md text-body-md focus:ring-0 focus:border-[#610000] transition-colors outline-none" placeholder="London" type="text" />
                                    </div>
                                    <div className="flex flex-col gap-2">
                                        <label className="font-label-md text-label-md uppercase tracking-widest text-[#5a403c]">State</label>
                                        <input className="bg-transparent border-0 border-b border-[#5a403c]/30 py-2 px-0 font-body-md text-body-md focus:ring-0 focus:border-[#610000] transition-colors outline-none" placeholder="Greater London" type="text" />
                                    </div>
                                    <div className="flex flex-col gap-2">
                                        <label className="font-label-md text-label-md uppercase tracking-widest text-[#5a403c]">Poskod</label>
                                        <input className="bg-transparent border-0 border-b border-[#5a403c]/30 py-2 px-0 font-body-md text-body-md focus:ring-0 focus:border-[#610000] transition-colors outline-none" placeholder="NW1 6XE" type="text" />
                                    </div>
                                </div>
                                <div className="flex flex-col gap-2">
                                    <label className="font-label-md text-label-md uppercase tracking-widest text-[#5a403c]">Country</label>
                                    <select className="bg-transparent border-0 border-b border-[#5a403c]/30 py-2 px-0 font-body-md text-body-md focus:ring-0 focus:border-[#610000] transition-colors cursor-pointer outline-none">
                                        <option value="UK">United Kingdom</option>
                                        <option value="US">United States</option>
                                        <option value="FR">France</option>
                                    </select>
                                </div>
                                <div className="md:col-span-2 flex items-center gap-3 mt-4">
                                    <input className="w-5 h-5 rounded border-[#e3beb8] text-[#610000] focus:ring-[#610000]" id="primary_residence" type="checkbox" />
                                    <label className="font-body-md text-body-md text-[#5a403c] select-none cursor-pointer" htmlFor="primary_residence">Mark as my Primary Sanctuary for rare item deliveries.</label>
                                </div>
                                <div className="md:col-span-2 mt-4">
                                    <button className="bg-[#610000] text-white px-8 py-3 font-label-md text-label-md uppercase tracking-widest hover:bg-[#8b0000] transition-colors duration-300 shadow-sm border-0 cursor-pointer" type="button">Update Sanctuary</button>
                                </div>
                            </form>
                        </div>
                    </section>
                </main>

                {/* Edit Modal */}
                {isEditModalOpen && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center p-6 bg-[#1a1c1c]/65 backdrop-blur-md">
                        <div className="bg-white w-full max-w-2xl shadow-2xl overflow-hidden relative border border-[#735c00]/10">
                            <div className="h-1.5 w-full bg-[#8b0000]"></div>
                            <div className="p-8 md:p-12">
                                <div className="flex justify-between items-start mb-12">
                                    <div>
                                        <h2 className="font-headline-md text-3xl text-[#1a1c1c]">Refine Your Curator Persona</h2>
                                        <p className="font-body-md text-body-md text-[#5a403c] mt-2">Adjust how you are perceived across the literary collective.</p>
                                    </div>
                                    <button className="group transition-all bg-transparent border-0 outline-none cursor-pointer" onClick={() => setIsEditModalOpen(false)}>
                                        <span className="material-symbols-outlined text-[#5a403c] hover:text-[#610000] transition-all duration-300">close</span>
                                    </button>
                                </div>
                                <form onSubmit={handleSave} className="space-y-10">
                                    {/* Profile Image Upload */}
                                    <div className="flex items-center gap-8 group">
                                        <div className="relative w-24 h-24 shrink-0 bg-[#eeeeee] overflow-hidden">
                                            <img alt="Current Profile" className="w-full h-full object-cover" src={editAvatarPreview} />
                                            <label htmlFor="avatar-upload" className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer">
                                                <span className="material-symbols-outlined text-white text-xl">photo_camera</span>
                                            </label>
                                        </div>
                                        <div className="flex flex-col">
                                            <span className="font-label-md text-label-md text-[#1a1c1c] mb-1">Profile Portrait</span>
                                            <label htmlFor="avatar-upload" className="text-[#610000] font-label-sm text-label-sm uppercase tracking-widest border-b border-[#610000]/20 hover:border-[#610000] transition-all self-start bg-transparent cursor-pointer">
                                                Change Image
                                            </label>
                                            <input 
                                                id="avatar-upload" 
                                                type="file" 
                                                accept="image/*" 
                                                className="hidden" 
                                                onChange={(e) => {
                                                    const file = e.target.files[0];
                                                    if (file) {
                                                        setEditAvatarFile(file);
                                                        setEditAvatarPreview(URL.createObjectURL(file));
                                                    }
                                                }}
                                            />
                                        </div>
                                    </div>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-10">
                                        {/* Full Name */}
                                        <div className="flex flex-col">
                                            <label className="font-label-md text-label-md text-[#1a1c1c] mb-2" htmlFor="full-name">Nama Penuh</label>
                                            <input className="bg-transparent border-t-0 border-x-0 border-b border-[#1a1c1c]/20 py-2 font-body-lg focus:ring-0 focus:border-[#735c00] transition-all outline-none" id="full-name" type="text" value={editName} onChange={e => setEditName(e.target.value)} />
                                        </div>
                                        {/* Scholarly Title */}
                                        <div className="flex flex-col">
                                            <label className="font-label-md text-label-md text-[#1a1c1c] mb-2" htmlFor="title">Scholarly Title</label>
                                            <select className="bg-transparent border-t-0 border-x-0 border-b border-[#1a1c1c]/20 py-2 font-body-lg focus:ring-0 focus:border-[#735c00] transition-all appearance-none cursor-pointer outline-none" id="title" value={editTitle} onChange={e => setEditTitle(e.target.value)}>
                                                <option value="Dr.">Dr.</option>
                                                <option value="Prof.">Prof.</option>
                                                <option value="Senior Curator">Senior Curator</option>
                                                <option value="Librarian Emeritus">Librarian Emeritus</option>
                                                <option value="Research Fellow">Research Fellow</option>
                                            </select>
                                        </div>
                                    </div>
                                    {/* Curator Bio */}
                                    <div className="flex flex-col">
                                        <label className="font-label-md text-label-md text-[#1a1c1c] mb-2" htmlFor="bio">Curator Bio</label>
                                        <textarea className="bg-transparent border border-[#1a1c1c]/10 p-4 font-body-md focus:ring-1 focus:ring-[#735c00] focus:border-[#735c00] transition-all resize-none outline-none" id="bio" rows="3" value={editBio} onChange={e => setEditBio(e.target.value)}></textarea>
                                    </div>
                                    {/* Actions */}
                                    <div className="flex flex-col-reverse md:flex-row items-center justify-between gap-6 pt-6 border-t border-[#e3beb8]/10">
                                        <button className="font-label-md text-label-md text-[#5a403c] hover:text-[#1a1c1c] transition-colors border-0 bg-transparent cursor-pointer" onClick={() => setIsEditModalOpen(false)} type="button">Dismiss</button>
                                        <button className="bg-[#8b0000] text-white px-10 py-4 font-label-md text-label-md uppercase tracking-[0.2em] hover:bg-[#920703] transition-all active:scale-95 shadow-lg border-0 cursor-pointer w-full md:w-auto" type="submit">
                                            Commit Changes
                                        </button>
                                    </div>
                                </form>
                            </div>
                        </div>
                    </div>
                )}
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
        // Form states (moved to App or removed to avoid hook issues)

        return (
            <main className="max-w-container-max mx-auto px-margin-desktop py-16 animate-in slide-in-from-bottom-12 fade-in duration-500 text-start">
                {/* Page Header */}
                <header className="mb-16 text-center">
                    <h1 className="font-display-lg text-display-lg text-on-surface mb-4">Acquisition Commitment</h1>
                    <p className="font-body-lg text-body-lg text-on-surface-variant max-w-2xl mx-auto italic">
                        Formalize your stewardship of history. This commitment signifies the transfer of rare literary artifacts into your private collection.
                    </p>
                    <div className="mt-8 flex justify-center items-center gap-4">
                        <div className="h-px bg-gradient-to-r from-transparent via-[#D4AF3744] to-transparent w-24"></div>
                        <span className="material-symbols-outlined text-secondary" style={{ fontVariationSettings: "'FILL' 1" }}>verified_user</span>
                        <div className="h-px bg-gradient-to-r from-transparent via-[#D4AF3744] to-transparent w-24"></div>
                    </div>
                </header>

                <div className="grid grid-cols-1 lg:grid-cols-12 gap-16 items-start">
                    {/* Left Column: Formal Details */}
                    <div className="lg:col-span-7 space-y-20">
                        {/* Shipping Sanctuary */}
                        <section id="shipping-sanctuary">
                            <div className="flex items-center gap-4 mb-8">
                                <span className="font-label-md text-label-md uppercase tracking-widest text-primary">Section I</span>
                                <h2 className="font-headline-md text-headline-md text-on-surface">Shipping Sanctuary</h2>
                            </div>
                            <div className="bg-surface-container-low border border-outline-variant/20 p-8 md:p-10 rounded-lg shadow-sm space-y-12">
                                <div className="space-y-10">
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-10">
                                        <div className="flex flex-col gap-2">
                                            <label className="font-label-sm text-label-sm text-on-surface-variant uppercase">Full Legal Name</label>
                                            <input 
                                                className="border-t-0 border-l-0 border-r-0 border-b border-on-surface bg-transparent rounded-none px-0 focus:ring-0 focus:border-b-primary focus:outline-none transition-colors font-body-md text-body-md w-full" 
                                                placeholder="e.g. Julian Vane-Stanton" 
                                                type="text"
                                                value={checkoutName}
                                                onChange={e => setCheckoutName(e.target.value)}
                                            />
                                        </div>
                                        <div className="flex flex-col gap-2">
                                            <label className="font-label-sm text-label-sm text-on-surface-variant uppercase">Contact Reference</label>
                                            <input 
                                                className="border-t-0 border-l-0 border-r-0 border-b border-on-surface bg-transparent rounded-none px-0 focus:ring-0 focus:border-b-primary focus:outline-none transition-colors font-body-md text-body-md w-full" 
                                                placeholder="+1 (555) 012-3456" 
                                                type="text"
                                                value={checkoutPhone}
                                                onChange={e => setCheckoutPhone(e.target.value)}
                                            />
                                        </div>
                                    </div>
                                    <div className="flex flex-col gap-2">
                                        <label className="font-label-sm text-label-sm text-on-surface-variant uppercase">Destination Address</label>
                                        <input 
                                            className="border-t-0 border-l-0 border-r-0 border-b border-on-surface bg-transparent rounded-none px-0 focus:ring-0 focus:border-b-primary focus:outline-none transition-colors font-body-md text-body-md w-full" 
                                            placeholder="Private Residence or Institutional Archive" 
                                            type="text"
                                            value={billingAddress}
                                            onChange={e => setBillingAddress(e.target.value)}
                                        />
                                    </div>
                                    <div className="grid grid-cols-1 md:grid-cols-3 gap-x-8 gap-y-10">
                                        <div className="flex flex-col gap-2">
                                            <label className="font-label-sm text-label-sm text-on-surface-variant uppercase">Bandar</label>
                                            <input 
                                                className="border-t-0 border-l-0 border-r-0 border-b border-on-surface bg-transparent rounded-none px-0 focus:ring-0 focus:border-b-primary focus:outline-none transition-colors font-body-md text-body-md w-full" 
                                                type="text"
                                                value={checkoutCity}
                                                onChange={e => setCheckoutCity(e.target.value)}
                                            />
                                        </div>
                                        <div className="flex flex-col gap-2">
                                            <label className="font-label-sm text-label-sm text-on-surface-variant uppercase">Province</label>
                                            <input 
                                                className="border-t-0 border-l-0 border-r-0 border-b border-on-surface bg-transparent rounded-none px-0 focus:ring-0 focus:border-b-primary focus:outline-none transition-colors font-body-md text-body-md w-full" 
                                                type="text"
                                                placeholder="State/Province"
                                            />
                                        </div>
                                        <div className="flex flex-col gap-2">
                                            <label className="font-label-sm text-label-sm text-on-surface-variant uppercase">Poskod</label>
                                            <input 
                                                className="border-t-0 border-l-0 border-r-0 border-b border-on-surface bg-transparent rounded-none px-0 focus:ring-0 focus:border-b-primary focus:outline-none transition-colors font-body-md text-body-md w-full" 
                                                type="text"
                                                value={checkoutPostalCode}
                                                onChange={e => setCheckoutPostalCode(e.target.value)}
                                            />
                                        </div>
                                    </div>
                                </div>
                                <div className="border-t border-outline-variant/20 pt-10">
                                    <div className="flex items-start gap-5">
                                        <span className="material-symbols-outlined text-primary text-3xl">ac_unit</span>
                                        <div>
                                            <h4 className="font-headline-sm text-headline-sm mb-3 text-on-surface">Climate-Controlled Transport</h4>
                                            <p className="font-body-md text-body-md text-on-surface-variant leading-relaxed">
                                                Your acquisition will be transported in a specialized atmospheric container, maintaining a constant 18°C temperature and 50% relative humidity to preserve parchment integrity.
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </section>

                        {/* Secure Settlement */}
                        <section id="secure-settlement">
                            <div className="flex items-center gap-4 mb-8">
                                <span className="font-label-md text-label-md uppercase tracking-widest text-primary">Section II</span>
                                <h2 className="font-headline-md text-headline-md text-on-surface">Secure Settlement</h2>
                            </div>
                            <div className="space-y-6">
                                <div className="border border-outline-variant/30 p-6 flex items-center justify-between cursor-pointer group hover:border-primary transition-all duration-300 bg-surface-container-lowest">
                                    <div className="flex items-center gap-4">
                                        <div className="w-5 h-5 rounded-full border border-primary flex items-center justify-center">
                                            <div className="w-3 h-3 rounded-full bg-primary"></div>
                                        </div>
                                        <div>
                                            <span className="font-headline-sm text-headline-sm block text-on-surface">Stripe Secure Checkout</span>
                                            <span className="font-label-sm text-label-sm text-on-surface-variant uppercase">Secure payment via Stripe</span>
                                        </div>
                                    </div>
                                    <div className="flex gap-2">
                                        <span className="material-symbols-outlined text-outline">credit_card</span>
                                    </div>
                                </div>
                                <div className="p-4 flex gap-4 text-on-surface-variant italic">
                                    <span className="material-symbols-outlined text-secondary">encrypted</span>
                                    <p className="font-body-md text-body-md">
                                        All financial movements are shrouded in industry-leading encryption and verified through our discrete private banking portal.
                                    </p>
                                </div>
                            </div>
                        </section>
                    </div>

                    {/* Right Column: Acquisition Summary & Financial Ledger */}
                    <aside className="lg:col-span-5 sticky top-32">
                        <div className="bg-surface-container border border-outline-variant/20 p-10 space-y-10">
                            {/* Acquisition Summary */}
                            <div>
                                <h3 className="font-headline-sm text-headline-sm mb-8 uppercase tracking-widest border-b border-outline-variant/40 pb-4 text-on-surface">Ringkasan Pembelian</h3>
                                <div className="space-y-8 max-h-[400px] overflow-y-auto pr-2">
                                    {cart.length === 0 ? (
                                        <p className="text-on-surface-variant font-body-md italic text-center py-4">Your acquisition list is empty.</p>
                                    ) : (
                                        cart.map(item => (
                                            <div key={item.book.id} className="flex gap-6 items-center">
                                                <div className="w-16 aspect-[2/3] bg-on-surface-variant/10 shadow-[15px_15px_30px_rgba(0,0,0,0.08)] relative overflow-hidden group">
                                                    <img className="w-full h-full object-cover" src={item.book.cover || item.book.image} alt={item.book.title} />
                                                </div>
                                                <div className="flex-1">
                                                    <p className="font-body-md font-semibold italic text-on-surface">{item.book.title}</p>
                                                    <p className="font-label-sm text-on-surface-variant">{item.book.author}</p>
                                                    <div className="mt-1">
                                                        <span className="font-label-sm text-[10px] text-secondary bg-secondary/10 px-1.5 py-0.5 border border-secondary/20">Qty: {item.quantity}</span>
                                                    </div>
                                                </div>
                                                <div className="shrink-0 text-right font-black text-xs text-on-surface font-mono">
                                                    RM{(item.book.price * item.quantity).toFixed(2)}
                                                </div>
                                            </div>
                                        ))
                                    )}
                                </div>
                            </div>

                            {/* Financial Ledger */}
                            <div>
                                <h3 className="font-headline-sm text-headline-sm mb-6 uppercase tracking-widest border-b border-outline-variant/40 pb-4 text-on-surface">Financial Ledger</h3>
                                <div className="space-y-4">
                                    <div className="space-y-3 pb-4">
                                        <div className="flex justify-between items-center">
                                            <span className="font-body-md text-on-surface-variant">Hammer Price</span>
                                            <span className="font-label-md text-on-surface tracking-wider">RM{subtotal.toFixed(2)}</span>
                                        </div>
                                        <div className="flex justify-between items-center">
                                            <span className="font-body-md text-on-surface-variant">Global Shipping Sanctuary Premium</span>
                                            <span className="font-label-md text-on-surface tracking-wider">Percuma</span>
                                        </div>
                                        <div className="flex justify-between items-center">
                                            <span className="font-body-md text-on-surface-variant">Service Tax (8%)</span>
                                            <span className="font-label-md text-on-surface tracking-wider">RM{tax.toFixed(2)}</span>
                                        </div>
                                    </div>
                                    <div className="bg-surface-container-high -mx-10 px-10 py-8 space-y-2">
                                        <div className="flex justify-between items-end">
                                            <span className="font-headline-sm uppercase tracking-widest text-on-surface-variant">Total Commitment</span>
                                            <div className="text-right">
                                                <span className="font-headline-lg text-primary leading-none block font-display-lg">RM{total.toFixed(2)}</span>
                                            </div>
                                        </div>
                                        <div className="flex justify-end">
                                            <span className="font-label-sm text-on-surface-variant/70 uppercase italic tracking-widest">All duties inclusive</span>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Final Commitment Action */}
                            <div className="pt-6">
                                <button 
                                    onClick={processPayment}
                                    className="w-full bg-primary-container text-on-primary font-headline-sm text-headline-sm py-6 hover:bg-primary transition-all duration-500 flex items-center justify-center gap-3 group relative overflow-hidden border-0 cursor-pointer"
                                    disabled={cart.length === 0}
                                >
                                    <span className="relative z-10">Commit to Acquisition</span>
                                    <span className="material-symbols-outlined relative z-10 transition-transform group-hover:translate-x-1">history_edu</span>
                                    <div className="absolute inset-0 bg-secondary/10 translate-y-full group-hover:translate-y-0 transition-transform duration-500"></div>
                                </button>
                                <p className="text-center mt-6 font-label-sm text-label-sm text-on-surface-variant uppercase tracking-widest opacity-60">
                                    Subject to Terms of Stewardship
                                </p>
                            </div>
                        </div>
                    </aside>
                </div>
            </main>
        );
    };

    const PaymentGatewayView = () => {
        const [processing, setProcessing] = useState(false);
        const [isSuccess, setIsSuccess] = useState(false);

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

        const handleSubmit = (e) => {
            e.preventDefault();
            setProcessing(true);
            
            // Check if dummy card is all zeros
            const isFailureTest = formattedCardNumber === '0000 0000 0000 0000';
            
            setTimeout(() => {
                if (isFailureTest) {
                    completeTransaction('fail');
                } else {
                    setIsSuccess(true);
                    setTimeout(() => {
                        completeTransaction('success');
                    }, 2000);
                }
            }, 2500);
        };

        return (
            <main className="pt-[80px]">
                <div className="editorial-split">
                    {/* Left Side: Visual & Summary */}
                    <section className="bg-surface-container-low p-margin-desktop flex flex-col justify-center animate-in slide-in-from-left-12 duration-500">
                        <div className="max-w-md mx-auto w-full">
                            <span className="font-label-md text-label-md uppercase tracking-[0.2em] text-primary mb-8 block">Investment Summary</span>
                            <h1 className="font-display-lg text-display-lg text-on-surface mb-12 leading-none">Card Settlement Authorization</h1>
                            
                            <div className="border-t border-outline-variant/30 pt-8 space-y-6 mb-12">
                                <div className="flex justify-between items-baseline">
                                    <span className="font-body-md text-on-surface-variant">Acquisition Commitment</span>
                                    <span className="font-headline-sm text-headline-sm">RM{total.toFixed(2)}</span>
                                </div>
                                <div className="flex justify-between items-center">
                                    <span className="font-body-md text-on-surface-variant">Asset Identifier</span>
                                    <span className="font-label-md text-label-md">MS-{cart.length > 0 ? cart[0].book.id : '992'}-G</span>
                                </div>
                                <div className="flex justify-between items-center">
                                    <span className="font-body-md text-on-surface-variant">Tax Jurisdictional Est.</span>
                                    <span className="font-label-md text-label-md">Calculated at Disbursement</span>
                                </div>
                            </div>

                            {/* Visual Card Display */}
                            <div className="perspective-1000">
                                <div className="visual-card aspect-[1.586/1] w-full rounded-xl p-8 flex flex-col justify-between">
                                    <div className="flex justify-between items-start">
                                        <div className="card-gold-text font-display-lg text-2xl tracking-wide italic">Tarbiah Sentap</div>
                                        <div className="card-chip"></div>
                                    </div>
                                    <div className="card-gold-text font-headline-md text-center text-2xl tracking-[0.15em] py-4">
                                        {formattedCardNumber || '0000 0000 0000 0000'}
                                    </div>
                                    <div className="flex justify-between items-end">
                                        <div className="space-y-1">
                                            <div className="card-gold-text text-[10px] uppercase tracking-widest opacity-70">Cardholder</div>
                                            <div className="card-gold-text font-headline-sm text-lg uppercase truncate max-w-[200px]">
                                                {cardholderName || 'AS APPEARS ON INSTRUMENT'}
                                            </div>
                                        </div>
                                        <div className="flex gap-6">
                                            <div className="space-y-1">
                                                <div className="card-gold-text text-[10px] uppercase tracking-widest opacity-70 text-right">Expires</div>
                                                <div className="card-gold-text font-headline-sm text-lg">
                                                    {cardExpiry || 'MM/YY'}
                                                </div>
                                            </div>
                                            <div className="space-y-1">
                                                <div className="card-gold-text text-[10px] uppercase tracking-widest opacity-70 text-right">CVV</div>
                                                <div className="card-gold-text font-headline-sm text-lg">
                                                    {cardCvc ? '***' : '***'}
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </section>

                    {/* Right Side: Payment Form */}
                    <section className="bg-surface-container-lowest p-margin-desktop flex flex-col justify-center animate-in slide-in-from-right-12 duration-500">
                        <div className="max-w-md mx-auto w-full">
                            <form className="space-y-6" onSubmit={handleSubmit}>
                                <div className="space-y-2">
                                    <label className="font-label-sm text-label-sm uppercase text-on-surface-variant block tracking-wider">Nama Pemegang Kad</label>
                                    <input 
                                        type="text" 
                                        className="w-full form-input-modern font-body-md text-on-surface placeholder:text-outline/40" 
                                        placeholder="Full Name" 
                                        value={cardholderName}
                                        onChange={e => setCardholderName(e.target.value.toUpperCase())}
                                        required 
                                        disabled={processing}
                                    />
                                </div>

                                <div className="space-y-2">
                                    <label className="font-label-sm text-label-sm uppercase text-on-surface-variant block tracking-wider">Card Information</label>
                                    <div className="relative">
                                        <input 
                                            type="text" 
                                            className="w-full form-input-modern font-body-md text-on-surface placeholder:text-outline/40 pr-[140px]" 
                                            placeholder="Card Number" 
                                            maxLength="19" 
                                            value={formattedCardNumber}
                                            onChange={handleCardNumberChange}
                                            required 
                                            disabled={processing}
                                        />
                                        <div className="absolute right-4 top-1/2 -translate-y-1/2 flex items-center gap-1.5 pointer-events-none opacity-80 scale-90">
                                            <img src="https://lh3.googleusercontent.com/aida-public/AB6AXuDzGmeBryO5eKsT8y-Bre596XurAPBEgbRxzDy-eEcoyA2noywWS45wH3sCA3T6p2FmaayIv0RECgZUJRvdR0Kdq89r_mcsXhTW3N-6LmjaJHwFnmR7ycwze695bDkViQRUoqAakrV2qRqaWcRzA8i65UwuUUPW4jDckg-WP8XeIdupVpFcvhnWw9k25oYW-SFJE7t5HaLXMajWiNs5kLoYWr9HjOeo5xltjGVno9Lx1F8jHsUNM8WhCAkVq9d-6FBlGRXJlbr0oEs" alt="Visa" className="h-4" />
                                            <img src="https://lh3.googleusercontent.com/aida-public/AB6AXuA1kRhvwS27bLL-yig9jxkx84KrMr3905CHlfcP8zckgl4lKKu--VcdF5h-KOPGq1NnoEZBRsDXBbIW-RG6UxECmCjakfBMqQbEnDdSjxkyeTjrGL12LbHeTtqI85pMXU0iAVToPfM8iDdQi2LfUQQT0GVqGC3tj9_vL6qPQLIAG-BJO_UaFWJcsiVzPAM1qOH3vpDOKQLDAkIa3uLHYIve_gwqbmGJZUzLrIckLie84rSePsw2iedxOtHR7jJYKwF2rnTBGQRJb34" alt="Mastercard" className="h-4" />
                                            <img src="https://lh3.googleusercontent.com/aida-public/AB6AXuC9lOIjljsflsvcEWDJGUUnCjIvjb2mVptwZFjVfR_AZVnr-EBbagZsQEQvOLwh8gWwweK4NpSlK2smxL8LlaGcJn9rR9RaFUzs0_DgSDYpemD2V2mxUiALs9SIBKS_2s6-2W4Of2SfFf2ehT23DAQJTlvHjvHHEIWVXVzfqEpoER73qu4gZWlzSQ5ZSNAJbD4wRrz5dcaCMbh5Jrl5aM2W0F32QrDYlXknNOSnpTHU5xBFampBLHShFPoQltb3Smw59v2WrPSMIkk" alt="Amex" className="h-4" />
                                        </div>
                                    </div>
                                    
                                    <div className="grid grid-cols-2 gap-4 mt-4">
                                        <div className="relative">
                                            <input 
                                                type="text" 
                                                className="w-full form-input-modern font-body-md text-on-surface placeholder:text-outline/40" 
                                                placeholder="MM / YY" 
                                                maxLength="5" 
                                                value={cardExpiry}
                                                onChange={handleExpiryChange}
                                                required 
                                                disabled={processing}
                                            />
                                        </div>
                                        <div className="relative">
                                            <input 
                                                type="password" 
                                                className="w-full form-input-modern font-body-md text-on-surface placeholder:text-outline/40 pr-10" 
                                                placeholder="CVC" 
                                                maxLength="4" 
                                                value={cardCvc}
                                                onChange={handleCvcChange}
                                                required 
                                                disabled={processing}
                                            />
                                            <span className="material-symbols-outlined absolute right-3 top-1/2 -translate-y-1/2 text-outline/40 text-xl" style={{ fontVariationSettings: "'FILL' 0" }}>credit_card</span>
                                        </div>
                                    </div>
                                </div>

                                <div className="pt-6 space-y-3">
                                    <button 
                                        type="submit" 
                                        disabled={processing}
                                        className={`w-full text-white font-label-md text-label-md py-6 rounded-lg transition-all duration-300 shadow-lg border-0 outline-none flex items-center justify-center gap-2 ${isSuccess ? 'bg-secondary' : 'bg-primary-container hover:bg-primary active:scale-[0.98]'}`}
                                    >
                                        {isSuccess ? (
                                            <><span className="material-symbols-outlined">check_circle</span> AUTHORIZATION COMPLETE</>
                                        ) : processing ? (
                                            <>VERIFYING WITH LEDGER...</>
                                        ) : (
                                            <>FINALIZE STEWARDSHIP</>
                                        )}
                                    </button>
                                    
                                    {!processing && (
                                        <button 
                                            type="button"
                                            onClick={() => setView('checkout')}
                                            className="w-full bg-transparent text-on-surface-variant font-label-sm uppercase tracking-widest py-3 border-0 cursor-pointer hover:text-primary transition-colors"
                                        >
                                            Return to Commitment
                                        </button>
                                    )}
                                </div>

                                <div className="space-y-6 pt-10 border-t border-outline-variant/10">
                                    <div className="flex items-start gap-4">
                                        <span className="material-symbols-outlined text-primary shrink-0" style={{ fontVariationSettings: "'FILL' 0" }}>lock_person</span>
                                        <p className="font-body-md text-on-surface-variant text-sm leading-relaxed text-left m-0">
                                            Your transaction is protected by industry-leading 256-bit encryption. All interactions with our ledger are conducted through discrete banking channels to ensure absolute privacy of your literary acquisitions.
                                        </p>
                                    </div>
                                    <div className="flex justify-center gap-8 grayscale opacity-40">
                                        <span className="material-symbols-outlined text-4xl">credit_card</span>
                                        <span className="material-symbols-outlined text-4xl">account_balance</span>
                                        <span className="material-symbols-outlined text-4xl">verified_user</span>
                                    </div>
                                </div>
                            </form>
                        </div>
                    </section>
                </div>
            </main>
        );
    };

    const PaymentSuccessView = () => {
        const [timeLeft, setTimeLeft] = useState(10);

        useEffect(() => {
            if (timeLeft <= 0) {
                setView('orders');
                return;
            }
            const timer = setInterval(() => {
                setTimeLeft(prev => prev - 1);
            }, 1000);
            return () => clearInterval(timer);
        }, [timeLeft]);

        return (
            <div className="fixed inset-0 z-50 flex items-center justify-center px-4 md:px-8" style={{
                background: "linear-gradient(to bottom, rgba(255, 255, 255, 0.92), rgba(255, 255, 255, 0.98)), url('https://lh3.googleusercontent.com/aida/AP1WRLv_yUY33VYN3taB5_YIlFq98lOlnHtP-UPopynHVx09WiIiKxSPMy_Aqy6bGzREsQuzfYwnOjRYLhd7VgbsK1RQJ2wPSPBo5Npp72PM7aZw0m3Cm7-TtyJoTrlW2IHIX7sIELKZwfGbhKlgxL9eBsyfvS0vKVCtU7QyseZ2aPU3srtbPQ8H7ziQ2G2WtekVGjET3gfX9h30UQUWxYdYZwPcyV5x7nsRUVFphUyVEzz84j2V9xLaVWcScUw')",
                backgroundSize: "cover",
                backgroundAttachment: "fixed",
                backgroundPosition: "center"
            }}>
                {/* Stewardship Certificate Layout */}
                <section className="max-w-4xl w-full shadow-2xl p-10 md:p-20 border border-secondary/15 relative overflow-hidden animate-in slide-in-from-bottom-8 duration-700" style={{
                    backgroundColor: "#ffffff",
                    backgroundImage: "url('https://www.transparenttextures.com/patterns/natural-paper.png')"
                }}>
                    {/* Corner Accents */}
                    <div className="absolute top-0 left-0 w-24 h-24 border-t-2 border-l-2 border-secondary/30 pointer-events-none"></div>
                    <div className="absolute bottom-0 right-0 w-24 h-24 border-b-2 border-r-2 border-secondary/30 pointer-events-none"></div>
                    
                    <div className="flex flex-col items-center text-center space-y-12">
                        {/* Brand Emblem */}
                        <div className="w-20 h-20 border border-secondary/40 flex items-center justify-center rounded-full mb-4">
                            <span className="material-symbols-outlined text-primary text-4xl" style={{ fontVariationSettings: "'wght' 300" }}>menu_book</span>
                        </div>
                        
                        {/* Main Heading */}
                        <div className="space-y-4">
                            <h1 className="font-display-lg text-display-lg-mobile md:text-display-lg text-primary">Terima Kasih Membeli di Tarbiah Sentap</h1>
                            <div className="flex items-center justify-center gap-4">
                                <div className="h-[1px] w-12 bg-secondary/30"></div>
                                <span className="font-label-md text-label-md uppercase tracking-[0.3em] text-secondary">Sijil Penghargaan</span>
                                <div className="h-[1px] w-12 bg-secondary/30"></div>
                            </div>
                        </div>

                        {/* Message */}
                        <p className="font-headline-sm italic text-tertiary-container max-w-2xl leading-relaxed">
                            "Pembelian anda ini membantu menyokong penulisan dan warisan ilmu bernilai. Kami berbesar hati mengalu-alukan anda sebagai sebahagian daripada keluarga Tarbiah Sentap."
                        </p>

                        {/* Acquisition Summary Grid */}
                        <div className="flex flex-col items-center gap-2 py-4">
                            <div className="flex items-center gap-4">
                                <span className="font-display-lg text-4xl md:text-6xl text-primary-container">{timeLeft}</span>
                                <div className="h-8 w-[1px] bg-secondary/30"></div>
                                <p className="font-body-md text-on-surface-variant tracking-wide">
                                    Akan dihalakan semula ke Pesanan Anda dalam masa <span className="font-semibold">saat</span>...
                                </p>
                            </div>
                            <div className="w-48 h-[2px] bg-secondary/10 relative overflow-hidden">
                                <div className="absolute left-0 top-0 h-full bg-primary-container transition-all duration-1000 ease-linear" style={{ width: `${(timeLeft / 5) * 100}%` }}></div>
                            </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-px bg-secondary/10 w-full border border-secondary/10 my-8">
                            <div className="bg-white/50 p-6">
                                <p className="font-label-sm text-label-sm uppercase tracking-widest text-secondary mb-1">ID Pembelian</p>
                                <p className="font-body-lg text-on-surface font-semibold tracking-tighter">MS-7749-X22</p>
                            </div>
                            <div className="bg-white/50 p-6">
                                <p className="font-label-sm text-label-sm uppercase tracking-widest text-secondary mb-1">Jangkaan Tiba</p>
                                <p className="font-body-lg text-on-surface font-semibold tracking-tighter">12 — 14 December, 2024</p>
                            </div>
                            <div className="bg-white/50 p-6 md:col-span-2 text-left">
                                <p className="font-label-sm text-label-sm uppercase tracking-widest text-secondary mb-1">Butiran Pakej Istimewa</p>
                                <p className="font-body-md text-on-surface-variant">Disertakan bersama pembungkus pelindung khas, nota penghargaan penulis, dan sijil pengesahan.</p>
                            </div>
                        </div>
                        
                        {/* Action Buttons */}
                        <div className="flex flex-col md:flex-row items-center gap-8 w-full justify-center">
                            <button onClick={() => setView('orders')} className="px-8 py-3 bg-primary text-white font-label-md uppercase tracking-widest hover:bg-[#8b0000] transition-colors border-0 cursor-pointer">
                                Lihat Pesanan Sekarang
                            </button>
                            <button onClick={() => window.print()} className="px-8 py-3 bg-transparent border border-secondary text-secondary font-label-md uppercase tracking-widest hover:bg-secondary/5 transition-colors cursor-pointer print:hidden flex items-center gap-2">
                                <span className="material-symbols-outlined text-sm">print</span>
                                Cetak Sijil
                            </button>
                        </div>
                    </div>
                </section>
            </div>
        );
    };

    const PaymentFailedView = () => {
        return (
            <main className="flex-grow flex items-center justify-center py-section-gap px-margin-mobile">
                <div className="max-w-4xl w-full grid grid-cols-1 md:grid-cols-12 gap-gutter items-center animate-in slide-in-from-bottom-12 duration-500">
                    {/* Visual Anchor: Asymmetric Image Column */}
                    <div className="md:col-span-5 relative group">
                        <div className="aspect-[2/3] overflow-hidden border border-secondary/20 editorial-shadow transition-all duration-700 group-hover:border-secondary/40">
                            <img className="w-full h-full object-cover grayscale brightness-75 transition-transform duration-1000 group-hover:scale-105" src="https://lh3.googleusercontent.com/aida-public/AB6AXuDp4o-5icTPKDTx-kxzPnSGycIV1HKPTXFYT9ftGMvI45BIxXgAo1LfHB9-aG8ancoZQ40p9ztOldafYp6eQ3OxVNZSHbksGcI-9WS7n8yS7E60TiL-RIYXB3VwkBPxe7F-L0qsUmAXkSJMb-Vcmo40iaX5AtbMz6vFLsjYnTHGHzXOw_BHnZamvC7OYy0--6JvQkDQBFhpKq-tph1kr023_8G_qZkzCpMQFcra-BTRZtHsaeFY9cfhNp0ubc6wK7y0S1bX79cfbGA" alt="Deferred Transaction" />
                        </div>
                        {/* Decorative Element */}
                        <div className="absolute -bottom-4 -right-4 w-24 h-24 border-b border-r border-primary/30 hidden md:block"></div>
                    </div>
                    {/* Content Column */}
                    <div className="md:col-span-7 md:pl-12 flex flex-col items-start text-left">
                        <div className="inline-flex items-center gap-2 mb-6">
                            <span className="w-8 h-px bg-primary/40"></span>
                            <span className="font-label-md text-label-md text-primary tracking-widest uppercase">Transaction Status</span>
                        </div>
                        <h1 className="font-display-lg text-display-lg-mobile md:text-display-lg text-on-surface mb-6 leading-tight">
                            Authorization <br/>Deferred
                        </h1>
                        <p className="font-body-lg text-body-lg text-on-surface-variant mb-10 max-w-md leading-relaxed italic">
                            Our secure ledger could not authorize the stewardship commitment at this time. The transaction has been held to ensure the continued integrity of your archival account.
                        </p>
                        {/* Action Block */}
                        <div className="flex flex-col sm:flex-row gap-4 w-full sm:w-auto">
                            <button onClick={() => setView('payment-gateway')} className="px-8 py-4 bg-primary text-on-tertiary font-label-md text-label-md uppercase tracking-widest hover:bg-on-primary-fixed-variant transition-all duration-300 editorial-shadow active:scale-[0.98] border-0 cursor-pointer outline-none">
                                Retry Settlement
                            </button>
                            <button onClick={() => setView('checkout')} className="px-8 py-4 bg-transparent border border-secondary text-on-surface font-label-md text-label-md uppercase tracking-widest hover:bg-secondary/5 transition-all duration-300 active:scale-[0.98] cursor-pointer outline-none">
                                Choose Alternate Method
                            </button>
                        </div>
                        {/* Footer Support Link */}
                        <div className="mt-12 flex items-center gap-3">
                            <span className="material-symbols-outlined text-primary text-[20px]" style={{ fontVariationSettings: "'FILL' 0" }}>help_center</span>
                            <span className="font-body-md text-body-md text-on-surface-variant">
                                Requiring assistance? Contact <a className="text-primary font-bold border-b border-primary/30 hover:border-primary transition-all" href="#">Curatorial Support</a>.
                            </span>
                        </div>
                    </div>
                </div>
            </main>
        );
    };

    const OrdersView = () => {
        const [orders, setOrders] = useState([]);
        const [loading, setLoading] = useState(true);

        useEffect(() => {
            const fetchOrders = async () => {
                try {
                    const res = await orderApi.getMyOrders();
                    if (res.data && res.data.success) {
                        setOrders(res.data.data);
                    }
                } catch (err) {
                    console.error("Failed to fetch orders", err);
                } finally {
                    setLoading(false);
                }
            };
            fetchOrders();
        }, []);

        const activeOrders = orders.filter(o => o.status === 'pending');
        const pastOrders = orders.filter(o => o.status !== 'pending');

        // Helper to get book details
        const getBookDetails = (bookId) => {
            return books.find(b => b.id === String(bookId) || b.id === Number(bookId)) || {};
        };

        if (loading) {
            return (
                <div className="min-h-screen flex items-center justify-center bg-[#f9f9f9]">
                    <div className="w-12 h-12 border-4 border-primary/30 border-t-primary rounded-full animate-spin"></div>
                </div>
            );
        }

        return (
            <div className="bg-[#f9f9f9] text-[#1a1c1c] min-h-screen">
                <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 md:py-24 animate-in fade-in duration-500">
                    {/* Header Section */}
                    <header className="mb-16 md:mb-32">
                        <p className="font-label-md text-label-md text-[#610000] tracking-[0.2em] mb-4">ARCHIVAL RECORDS</p>
                        <h1 className="font-display-lg text-4xl md:text-[64px] text-[#1a1c1c] leading-tight">Lejar Perolehan</h1>
                        <div className="h-px bg-gradient-to-r from-transparent via-[#8e706b]/20 to-transparent mt-8 w-32"></div>
                    </header>

                    {/* Active Acquisitions */}
                    <section className="mb-24">
                        <div className="flex justify-between items-end mb-8 border-b border-[#8e706b]/10 pb-4">
                            <h2 className="font-headline-md text-3xl text-[#1a1c1c]">Pesanan Aktif</h2>
                            <span className="font-label-sm text-label-sm text-[#5a403c] uppercase tracking-widest">{activeOrders.length} Pesanan Sedang Diproses</span>
                        </div>
                        <div className="flex flex-col items-center gap-6">
                            {activeOrders.length === 0 ? (
                                <p className="text-on-surface-variant font-body-md italic text-center w-full py-8">Tiada pesanan aktif pada masa ini.</p>
                            ) : (
                                activeOrders.map(order => (
                                    <div key={order.id} className="group relative w-full flex flex-col md:flex-row gap-6 p-6 bg-[#f3f3f4] border border-[#8e706b]/5 hover:border-[#8e706b]/20 transition-all duration-500 max-w-3xl shadow-sm">
                                        <div className="w-full md:w-48 aspect-[2/3] overflow-hidden bg-[#e2e2e2] shrink-0">
                                            {order.items && order.items.length > 0 && (
                                                <img className="w-full h-full object-cover grayscale-[0.2] group-hover:grayscale-0 transition-all duration-700" alt="Cover" src={getBookDetails(order.items[0].book_id).cover || getBookDetails(order.items[0].book_id).image || 'https://via.placeholder.com/150'} />
                                            )}
                                        </div>
                                        <div className="flex-1 flex flex-col">
                                            <div className="flex justify-between items-start mb-2">
                                                <span className="font-label-sm text-label-sm text-[#610000] tracking-tighter">#{order.id.split('-')[0].toUpperCase()}</span>
                                                <span className="px-2 py-1 bg-[#8b0000] text-[#ff907f] font-label-sm text-[10px] uppercase tracking-widest">{order.status}</span>
                                            </div>
                                            <h3 className="font-headline-sm text-2xl text-[#1a1c1c] mb-1">
                                                {order.items?.map(i => getBookDetails(i.book_id).title || 'Unknown Book').join(', ')}
                                            </h3>
                                            <p className="font-body-md text-body-md text-[#5a403c] mb-6 italic">
                                                Acquired {new Date(order.created_at).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' })}
                                            </p>
                                            <div className="mt-auto pt-4 border-t border-[#8e706b]/10 flex justify-between items-center">
                                                <span className="font-label-md text-label-md text-[#1a1c1c] font-bold">RM{Number(order.total_amount).toFixed(2)}</span>
                                                <button className="font-label-md text-label-md text-[#610000] hover:underline underline-offset-4 transition-all bg-transparent border-0 cursor-pointer">Jejak Pesanan</button>
                                            </div>
                                        </div>
                                    </div>
                                ))
                            )}
                        </div>
                    </section>

                    {/* Past Ledger */}
                    <section>
                        <div className="flex justify-between items-end mb-8 border-b border-[#8e706b]/10 pb-4">
                            <h2 className="font-headline-md text-3xl text-[#1a1c1c]">Rekod Lepas</h2>
                            <div className="flex gap-4">
                                <button className="font-label-sm text-label-sm text-[#5a403c] hover:text-[#610000] transition-colors bg-transparent border-0 cursor-pointer">Eksport PDF</button>
                                <button className="font-label-sm text-label-sm text-[#5a403c] hover:text-[#610000] transition-colors bg-transparent border-0 cursor-pointer">Tapis</button>
                            </div>
                        </div>
                        <div className="overflow-x-auto">
                            <table className="w-full text-left border-collapse">
                                <thead>
                                    <tr className="border-b-2 border-[#8b0000]/20">
                                        <th className="py-6 font-label-md text-label-md text-[#5a403c] uppercase tracking-widest">ID Pesanan</th>
                                        <th className="py-6 font-label-md text-label-md text-[#5a403c] uppercase tracking-widest">Tarikh</th>
                                        <th className="py-6 font-label-md text-label-md text-[#5a403c] uppercase tracking-widest">Kulit Buku</th>
                                        <th className="py-6 font-label-md text-label-md text-[#5a403c] uppercase tracking-widest">Pembelian</th>
                                        <th className="py-6 font-label-md text-label-md text-[#5a403c] uppercase tracking-widest">Status</th>
                                        <th className="py-6 font-label-md text-label-md text-[#5a403c] uppercase tracking-widest text-right">Nilai</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-[#8e706b]/5">
                                    {pastOrders.length === 0 ? (
                                        <tr>
                                            <td colSpan="6" className="py-8 text-center text-on-surface-variant font-body-md italic">Tiada rekod pembelian lepas.</td>
                                        </tr>
                                    ) : (
                                        pastOrders.map(order => (
                                            <tr key={order.id} className="group hover:bg-[#ffffff] transition-colors cursor-pointer border-b border-[#8e706b]/5">
                                                <td className="py-8 font-label-md text-label-md text-[#610000]">#{order.id.split('-')[0].toUpperCase()}</td>
                                                <td className="py-8 font-body-md text-body-md text-[#5a403c]">{new Date(order.created_at).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' })}</td>
                                                <td className="py-4">
                                                    <div className="w-12 h-16 bg-[#e2e2e2] overflow-hidden border border-[#8e706b]/10 shadow-sm flex items-center justify-center">
                                                        {order.items && order.items.length > 0 && (
                                                            <img className="w-full h-full object-cover grayscale-[0.2]" alt="Cover" src={getBookDetails(order.items[0].book_id).cover || getBookDetails(order.items[0].book_id).image || 'https://via.placeholder.com/50'} />
                                                        )}
                                                    </div>
                                                </td>
                                                <td className="py-8 font-headline-sm text-xl text-[#1a1c1c] max-w-[300px] truncate">
                                                    {order.items?.map(i => getBookDetails(i.book_id).title || 'Unknown Book').join(', ')}
                                                </td>
                                                <td className="py-8">
                                                    <span className="flex items-center gap-2 font-label-sm text-label-sm text-[#5a403c] capitalize">
                                                        <span className="w-1.5 h-1.5 rounded-full bg-[#8e706b]"></span> {order.status}
                                                    </span>
                                                </td>
                                                <td className="py-8 font-label-md text-label-md text-[#1a1c1c] text-right font-bold">RM{Number(order.total_amount).toFixed(2)}</td>
                                            </tr>
                                        ))
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </section>
                </main>
            </div>
        );
    };

    const AdminView = () => {
        const [activeTab, setActiveTab] = useState('dashboard');
        const [books, setBooks] = useState([]);
        const [allOrders, setAllOrders] = useState([]);
        const [allUsers, setAllUsers] = useState([]);
        const [searchQuery, setSearchQuery] = useState('');
        const [isSidebarOpen, setIsSidebarOpen] = useState(true);

        useEffect(() => {
            const handleKeyDown = (e) => {
                if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
                    e.preventDefault();
                    document.getElementById('admin-search-input')?.focus();
                }
            };
            window.addEventListener('keydown', handleKeyDown);
            return () => window.removeEventListener('keydown', handleKeyDown);
        }, []);
        const [isAddBookModalOpen, setIsAddBookModalOpen] = useState(false);
        const [isUserModalOpen, setIsUserModalOpen] = useState(false);
        const [editingUserId, setEditingUserId] = useState(null);
        const [trackingUser, setTrackingUser] = useState(null);
        const [newUserForm, setNewUserForm] = useState({ name: '', email: '', role: 'customer', password: '' });
        const [editingBookId, setEditingBookId] = useState(null);
        const [newBookForm, setNewBookForm] = useState({
            title: '',
            author: '',
            genre: '',
            price: 0,
            stock: 0,
            rating: 5,
            cover: '',
            coverFile: null
        });
        const [stripeOverview, setStripeOverview] = useState(null);
        const [showChartBars, setShowChartBars] = useState(false);
        const [dashboardStats, setDashboardStats] = useState({
            perolehanKasar: 0,
            keuntunganBersih: 0,
            purataNilaiPesanan: 0,
            nilaiSepanjangHayat: 0,
            stripeRevenue: 0,
            chart: {
                naskhahNadir: [0, 0, 0, 0, 0, 0],
                edisiBaharu: [0, 0, 0, 0, 0, 0],
                labels: ['Jan', 'Feb', 'Mac', 'Apr', 'Mei', 'Jun']
            }
        });

        useEffect(() => {
            const handleResize = () => {
                if (window.innerWidth < 1024) setIsSidebarOpen(false);
                else setIsSidebarOpen(true);
            };
            handleResize();
            window.addEventListener('resize', handleResize);
            return () => window.removeEventListener('resize', handleResize);
        }, []);

        const fetchUsers = () => {
            adminApi.getAllUsers().then(res => {
                if (res.data.success) setAllUsers(res.data.data);
            }).catch(() => {});
        };

        const fetchBooks = () => {
            bookApi.getAll().then(res => {
                if (res.data && res.data.success) setBooks(res.data.data);
            }).catch(() => {});
        };

        const fetchOrders = () => {
            adminApi.getAllOrders().then(res => {
                if (res.data.success) setAllOrders(res.data.data);
            }).catch(() => {});
        };

        useEffect(() => {
            fetchOrders(); // load orders upfront so we can track user orders
            if (activeTab === 'users') {
                fetchUsers();
            } else if (activeTab === 'books') {
                fetchBooks();
            }
        }, [activeTab]);

        const filteredBooks = useMemo(() => {
            if (!searchQuery.trim()) return books;
            return books.filter(b => 
                b.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
                b.author.toLowerCase().includes(searchQuery.toLowerCase())
            );
        }, [books, searchQuery]);

        const filteredUsers = useMemo(() => {
            if (!searchQuery.trim()) return allUsers;
            return allUsers.filter(u => {
                const nameMatch = u.user_metadata?.name?.toLowerCase().includes(searchQuery.toLowerCase());
                const emailMatch = u.email?.toLowerCase().includes(searchQuery.toLowerCase());
                const roleMatch = u.app_metadata?.role?.toLowerCase().includes(searchQuery.toLowerCase());
                return nameMatch || emailMatch || roleMatch;
            });
        }, [allUsers, searchQuery]);

        const filteredOrders = useMemo(() => {
            if (!searchQuery.trim()) return allOrders;
            return allOrders.filter(o => {
                const refMatch = `REF-${o.id.toString().split('-')[0].toUpperCase()}`.includes(searchQuery.toUpperCase());
                const nameMatch = o.user?.name?.toLowerCase().includes(searchQuery.toLowerCase());
                const statusMatch = o.status?.toLowerCase().includes(searchQuery.toLowerCase());
                return refMatch || nameMatch || statusMatch;
            });
        }, [allOrders, searchQuery]);

        const handleAddUserSubmit = async (e) => {
            e.preventDefault();
            try {
                let res;
                if (editingUserId) {
                    res = await adminApi.updateUser(editingUserId, newUserForm);
                } else {
                    res = await adminApi.createUser(newUserForm);
                }

                if (res.data && res.data.success) {
                    addToast(editingUserId ? 'Pengguna berjaya dikemas kini!' : 'Akaun baharu berjaya didaftarkan!');
                    setIsUserModalOpen(false);
                    setEditingUserId(null);
                    setNewUserForm({ name: '', email: '', role: 'customer', password: '' });
                    fetchUsers();
                } else {
                    addToast(res.data.error || 'Gagal menyimpan pengguna', 'error');
                }
            } catch (err) {
                addToast('Ralat menyimpan pengguna', 'error');
                console.error(err);
            }
        };

        const openEditUserModal = (user) => {
            setEditingUserId(user.id);
            setNewUserForm({
                name: user.user_metadata?.name || '',
                email: user.email || '',
                role: user.app_metadata?.role || 'customer',
                password: '' // Don't populate password
            });
            setIsUserModalOpen(true);
        };

        const handleDeleteUser = async (id, email) => {
            if (!window.confirm(`Adakah anda pasti mahu memadam akaun pengguna ini (${email}) secara kekal?`)) return;
            try {
                const res = await adminApi.deleteUser(id);
                if (res.data && res.data.success) {
                    addToast('Pengguna berjaya dipadam');
                    fetchUsers();
                } else {
                    addToast(res.data.error || 'Gagal memadam pengguna', 'error');
                }
            } catch (err) {
                const actualError = err.response?.data?.error || err.message || 'Ralat memadam pengguna';
                addToast(actualError, 'error');
                console.error(err);
            }
        };

        const handleUpdateOrderStatus = async (id, newStatus) => {
            try {
                const res = await adminApi.updateOrderStatus(id, newStatus);
                if (res.data && res.data.success) {
                    addToast(`Status pesanan dikemas kini ke: ${newStatus}`);
                    adminApi.getAllOrders().then(res => {
                        if (res.data.success) setAllOrders(res.data.data);
                    });
                } else {
                    addToast('Gagal mengemas kini pesanan', 'error');
                }
            } catch (err) {
                addToast('Ralat mengemas kini pesanan', 'error');
                console.error(err);
            }
        };

        const handleDeleteOrder = async (id) => {
            if (!window.confirm('Adakah anda pasti untuk memadam pesanan ini?')) return;
            try {
                const res = await adminApi.deleteOrder(id);
                if (res.data && res.data.success) {
                    addToast('Pesanan berjaya dipadam');
                    setAllOrders(allOrders.filter(o => o.id !== id));
                } else {
                    addToast('Gagal memadam pesanan', 'error');
                }
            } catch (err) {
                addToast('Ralat memadam pesanan', 'error');
                console.error(err);
            }
        };

        const handleRestock = async (bookId) => {
            const qtyInput = document.getElementById(`restock-${bookId}`);
            const qty = parseInt(qtyInput?.value || 0, 10);
            if (qty <= 0) {
                addToast('Sila masukkan kuantiti yang sah', 'error');
                return;
            }
            try {
                const bookToUpdate = books.find(b => b.id === bookId);
                const updatedStock = (bookToUpdate.stock || 0) + qty;
                const res = await bookApi.update(bookId, { stock: updatedStock });
                if (res.data && res.data.success) {
                    addToast(`Berjaya menambah ${qty} unit stok`);
                    fetchBooks(); // refresh books list
                    if (qtyInput) qtyInput.value = '';
                } else {
                    addToast('Gagal mengemas kini stok', 'error');
                }
            } catch (err) {
                addToast('Ralat mengemas kini stok', 'error');
                console.error(err);
            }
        };

        const handleAddBookSubmit = async (e) => {
            e.preventDefault();
            try {
                const formData = new FormData();
                formData.append('title', newBookForm.title);
                formData.append('author', newBookForm.author);
                formData.append('genre', newBookForm.genre);
                formData.append('price', newBookForm.price);
                formData.append('stock', newBookForm.stock);
                formData.append('rating', newBookForm.rating);
                if (newBookForm.coverFile) {
                    formData.append('cover_image', newBookForm.coverFile);
                } else if (newBookForm.cover) {
                    formData.append('cover', newBookForm.cover);
                }

                let res;
                if (editingBookId) {
                    res = await bookApi.update(editingBookId, formData);
                } else {
                    formData.append('id', Math.floor(Math.random() * 1000000).toString());
                    res = await bookApi.create(formData);
                }

                if (res.data && res.data.success) {
                    addToast(editingBookId ? 'Buku berjaya dikemas kini!' : 'Buku baharu berjaya ditambah!');
                    setIsAddBookModalOpen(false);
                    setEditingBookId(null);
                    setNewBookForm({ title: '', author: '', genre: '', price: 0, stock: 0, rating: 5, cover: '', coverFile: null });
                    fetchBooks();
                } else {
                    addToast('Gagal menyimpan buku', 'error');
                }
            } catch (err) {
                addToast('Ralat menyimpan buku', 'error');
                console.error(err);
            }
        };

        const openEditModal = (book) => {
            setEditingBookId(book.id);
            setNewBookForm({
                title: book.title,
                author: book.author,
                genre: book.genre || '',
                price: book.price,
                stock: book.stock,
                rating: book.rating || 5,
                cover: book.cover || '',
                coverFile: null
            });
            setIsAddBookModalOpen(true);
        };

        const handleDeleteBook = async (id) => {
            if (!window.confirm('Adakah anda pasti mahu memadam buku ini dari rekod?')) return;
            try {
                const res = await bookApi.delete(id);
                if (res.data && res.data.success) {
                    addToast('Buku berjaya dipadam dari rekod');
                    fetchBooks();
                } else {
                    addToast('Gagal memadam buku', 'error');
                }
            } catch (err) {
                addToast('Ralat memadam buku', 'error');
                console.error(err);
            }
        };

        useEffect(() => {
            if (activeTab === 'dashboard') {
                adminApi.getDashboardStats().then(res => {
                    if (res.data && res.data.success) {
                        setDashboardStats(res.data.data);
                    }
                }).catch(err => console.error(err));
                
                adminApi.getStripeOverview().then(res => {
                    if (res.data && res.data.success) {
                        setStripeOverview(res.data.data);
                    }
                }).catch(err => console.error(err));
            }
        }, [activeTab]);

        useEffect(() => {
            if (activeTab === 'dashboard') {
                setShowChartBars(false);
                const timer = setTimeout(() => {
                    setShowChartBars(true);
                }, 150);
                return () => clearTimeout(timer);
            }
        }, [dashboardStats, activeTab]);

        let naskhahData = dashboardStats.chart.naskhahNadir;
        let edisiData = dashboardStats.chart.edisiBaharu;
        
        // If database is empty, use realistic-looking "ML Prediction" data for the chart
        const totalVolume = naskhahData.reduce((a, b) => a + b, 0);
        if (totalVolume === 0) {
            naskhahData = [450, 620, 580, 890, 1200, 1450];
            edisiData = [320, 480, 750, 640, 950, 1100];
        }

        const maxChartVal = Math.max(
            ...naskhahData,
            ...edisiData,
            1 // prevent division by zero
        );

        return (
            <div className="font-['Inter'] text-[#1a1c1c] bg-[#f9f9f9] min-h-screen overflow-x-hidden absolute inset-0 z-[100] w-full text-start">
                <style>{`
                    .admin-primary-container { background-color: #8b0000; }
                    .text-admin-primary-container { color: #8b0000; }
                    .bg-admin-tertiary { background-color: #1e2e3b; }
                    .text-admin-on-tertiary { color: #ffffff; }
                    .border-admin-outline-variant { border-color: #e3beb8; }
                    .text-admin-tertiary-fixed-dim { color: #b8c8da; }
                    .bg-admin-surface { background-color: #f9f9f9; }
                    .border-admin-surface-variant { border-color: #e2e2e2; }
                    .bg-admin-surface-container-low { background-color: #f3f3f3; }
                    .text-admin-secondary { color: #5f5e5e; }
                    .text-admin-primary { color: #610000; }
                    .bg-admin-primary { background-color: #610000; }
                    .bg-admin-surface-container-lowest { background-color: #ffffff; }
                    .text-admin-error { color: #ba1a1a; }
                    .bg-admin-error-10 { background-color: rgba(186, 26, 26, 0.1); }
                    .bg-admin-primary-5 { background-color: rgba(97, 0, 0, 0.05); }
                    .border-admin-primary { border-color: #610000; }
                    .bg-admin-surface-container-high { background-color: #e8e8e8; }
                    .bg-admin-primary-fixed-dim { background-color: #ffb4a8; }
                    .bg-admin-on-tertiary-30 { background-color: rgba(255, 255, 255, 0.3); }
                    .bg-admin-on-tertiary { background-color: #ffffff; }
                    .text-admin-tertiary { color: #1e2e3b; }
                    .bg-admin-surface-container { background-color: #eeeeee; }
                    
                    .font-admin-headline-md { font-family: 'EB Garamond', serif; font-size: clamp(20px, 2vw, 24px); font-weight: 500; line-height: 1.3; word-break: break-word; }
                    .font-admin-headline-lg { font-family: 'EB Garamond', serif; font-size: clamp(24px, 2.5vw, 32px); font-weight: 500; line-height: 1.2; word-break: break-word; }
                    .font-admin-headline-sm { font-family: 'EB Garamond', serif; font-size: clamp(16px, 1.5vw, 20px); font-weight: 600; line-height: 1.4; word-break: break-word; }
                    .font-admin-display-lg { font-family: 'EB Garamond', serif; font-size: clamp(28px, 4vw, 48px); font-weight: 600; line-height: 1.1; letter-spacing: -0.02em; word-break: break-word; }
                    .font-admin-label-caps { font-family: 'Inter', sans-serif; font-size: clamp(10px, 1vw, 11px); font-weight: 600; line-height: 1.2; letter-spacing: 0.08em; text-transform: uppercase; word-break: break-word; }
                    .font-admin-body-md { font-family: 'Inter', sans-serif; font-size: clamp(12px, 1vw, 14px); font-weight: 400; line-height: 1.5; word-break: break-word; }
                    .font-admin-body-lg { font-family: 'Inter', sans-serif; font-size: clamp(14px, 1.2vw, 16px); font-weight: 400; line-height: 1.6; word-break: break-word; }
                    .font-admin-data-table { font-family: 'Inter', sans-serif; font-size: clamp(11px, 1vw, 13px); font-weight: 400; line-height: 1.4; letter-spacing: 0.01em; word-break: break-word; }
                    
                    .admin-data-card { border: 1px solid #E0E0E0; transition: border-color 0.2s ease; overflow: hidden; min-width: 0; }
                    .admin-data-card:hover { border-color: #8b0000; }
                    .admin-chart-bar { transition: height 1s ease-out; height: 0; }
                    .scholarly-input:focus { box-shadow: 0 0 0 1px #8b0000; }
                `}</style>

                {/* Sidebar Overlay */}
                {isSidebarOpen && (
                    <div className="fixed inset-0 bg-black/50 z-[105] lg:hidden" onClick={() => setIsSidebarOpen(false)} />
                )}

                {/* Sidebar */}
                <aside className={`fixed left-0 top-0 h-full w-[280px] bg-admin-tertiary border-r border-admin-outline-variant flex flex-col py-8 z-[110] transform transition-transform duration-300 ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'}`}>
                    <div className="px-6 mb-10 flex justify-between items-center">
                        <div>
                            <h1 className="font-admin-headline-md tracking-tight" style={{ color: '#c5a059' }}>Tarbiah Sentap Admin</h1>
                            <p className="font-admin-label-caps text-admin-tertiary-fixed-dim mt-1 uppercase opacity-70">Kuasa Pentadbiran</p>
                        </div>
                        <button className="lg:hidden text-white bg-transparent border-0 cursor-pointer" onClick={() => setIsSidebarOpen(false)}>
                            <span className="material-symbols-outlined">close</span>
                        </button>
                    </div>
                    <nav className="flex-1 space-y-1">
                        <button onClick={() => { setActiveTab('dashboard'); setIsSidebarOpen(false); }} className={`w-full flex items-center px-6 py-3 font-admin-body-md transition-colors group cursor-pointer border-0 ${activeTab === 'dashboard' ? 'border-l-4 border-[#8b0000] bg-[#344452] text-[#ff907f] font-bold' : 'bg-transparent text-admin-tertiary-fixed-dim hover:text-white'}`}>
                            <span className="material-symbols-outlined mr-4">account_balance</span> Treasury
                        </button>
                        <button onClick={() => { setActiveTab('books'); setIsSidebarOpen(false); }} className={`w-full flex items-center px-6 py-3 font-admin-body-md transition-colors group cursor-pointer border-0 ${activeTab === 'books' ? 'border-l-4 border-[#8b0000] bg-[#344452] text-[#ff907f] font-bold' : 'bg-transparent text-admin-tertiary-fixed-dim hover:text-white'}`}>
                            <span className="material-symbols-outlined mr-4">inventory_2</span> The Stacks
                        </button>
                        <button onClick={() => { setActiveTab('orders'); setIsSidebarOpen(false); }} className={`w-full flex items-center px-6 py-3 font-admin-body-md transition-colors group cursor-pointer border-0 ${activeTab === 'orders' ? 'border-l-4 border-[#8b0000] bg-[#344452] text-[#ff907f] font-bold' : 'bg-transparent text-admin-tertiary-fixed-dim hover:text-white'}`}>
                            <span className="material-symbols-outlined mr-4">history_edu</span> Acquisition Logs
                        </button>
                        <button onClick={() => { setActiveTab('users'); setIsSidebarOpen(false); }} className={`w-full flex items-center px-6 py-3 font-admin-body-md transition-colors group cursor-pointer border-0 ${activeTab === 'users' ? 'border-l-4 border-[#8b0000] bg-[#344452] text-[#ff907f] font-bold' : 'bg-transparent text-admin-tertiary-fixed-dim hover:text-white'}`}>
                            <span className="material-symbols-outlined mr-4">group</span> User
                        </button>
                    </nav>
                    <div className="mt-auto px-6 space-y-1 border-t border-white/10 pt-6">
                        <button onClick={() => setView('portal')} className="w-full flex items-center py-2 text-admin-tertiary-fixed-dim font-admin-label-caps hover:text-white transition-colors uppercase cursor-pointer border-0 bg-transparent">
                            <span className="material-symbols-outlined mr-3 text-sm">exit_to_app</span> Back to Portal
                        </button>
                    </div>
                </aside>
                
                {/* Header */}
                <header className={`!flex flex-row flex-nowrap items-center justify-between h-16 px-4 lg:px-10 bg-[#ffffff] border-b border-[#e2e2e2] fixed top-0 right-0 z-[100] shadow-sm transition-all duration-300 ${isSidebarOpen ? 'lg:left-[280px] left-0' : 'left-0'}`}>
                    
                    {/* Left Section: Menu & Utility Icons */}
                    <div className="!flex flex-row flex-nowrap items-center gap-2 sm:gap-6 shrink-0">
                        <button className="transition-colors bg-transparent border-0 cursor-pointer p-2 rounded-full hover:bg-gray-200 flex items-center justify-center shrink-0" style={{ color: '#610000' }} onClick={() => setIsSidebarOpen(!isSidebarOpen)}>
                            <span className="material-symbols-outlined text-2xl">menu_open</span>
                        </button>
                        
                        <div className="flex items-center gap-1 lg:gap-2">
                            <button onClick={() => addToast('Tiada notifikasi baharu buat masa ini.', 'info')} className="relative transition-colors p-2 rounded-full hover:bg-gray-200 group border-0 bg-transparent cursor-pointer flex items-center justify-center" style={{ color: '#610000' }}>
                                <span className="material-symbols-outlined text-xl lg:text-2xl">notifications</span>
                                <span className="absolute top-2 right-2 block h-2 w-2 rounded-full bg-red-700 ring-2 ring-white"></span>
                            </button>
                            <button onClick={() => addToast('Log aktiviti sedang dikemas kini...', 'info')} className="transition-colors p-2 rounded-full hover:bg-gray-200 group border-0 bg-transparent cursor-pointer flex items-center justify-center" style={{ color: '#610000' }}>
                                <span className="material-symbols-outlined text-xl lg:text-2xl">history</span>
                            </button>
                            <button onClick={() => addToast('Pusat Bantuan: Sila hubungi sokongan teknikal di admin@tarbiahsentap.com', 'info')} className="transition-colors p-2 rounded-full hover:bg-gray-200 group border-0 bg-transparent cursor-pointer flex items-center justify-center" style={{ color: '#610000' }}>
                                <span className="material-symbols-outlined text-xl lg:text-2xl">help_outline</span>
                            </button>
                        </div>
                    </div>
                    
                    {/* Right Section: Search & Profile */}
                    <div className="!flex flex-row flex-nowrap items-center gap-2 sm:gap-4 lg:gap-6 flex-1 justify-end min-w-0 shrink">
                        <div className="relative w-full max-w-[120px] sm:max-w-md min-w-0 shrink">
                            <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center" style={{ color: '#610000' }}>
                                <span className="material-symbols-outlined text-xl">search</span>
                            </span>
                            <input id="admin-search-input" className="scholarly-input block w-full pl-9 sm:pl-11 pr-2 sm:pr-4 py-2 border border-[#e3beb8] rounded bg-[#f3f3f3] font-sans text-xs sm:text-sm focus:outline-none focus:border-[#8b0000] transition-all placeholder:text-[#5a403c]/60 min-w-0 truncate" placeholder={activeTab === 'users' ? 'Cari pengguna...' : activeTab === 'books' ? 'Cari arkib...' : activeTab === 'orders' ? 'Cari transaksi...' : 'Cari...'} type="text" value={searchQuery} onChange={e => setSearchQuery(e.target.value)} />
                            <div className="absolute inset-y-0 right-0 pr-3 flex items-center">
                                <kbd className="hidden sm:inline-flex items-center px-2 py-0.5 border border-[#e3beb8] rounded text-[10px] font-sans text-[#5a403c]/60 bg-[#f9f9f9]">
                                    ⌘K
                                </kbd>
                            </div>
                        </div>

                        {/* Divider */}
                        <div className="hidden sm:block h-8 w-px bg-[#e2e2e2] mx-2"></div>
                        
                        {/* Profile */}
                        <div className="flex items-center gap-2 sm:gap-4 cursor-pointer group pl-1 sm:pl-2 shrink-0">
                            <div className="hidden lg:flex flex-col items-end">
                                <span className="text-[10px] font-bold uppercase tracking-[0.15em] text-[#5a403c]/70 leading-none mb-1">Pengurus Kanan</span>
                                <span className="text-base font-serif font-medium text-[#1a1c1c] group-hover:text-[#610000] transition-colors leading-none">Profil Arkib</span>
                            </div>
                            <div className="relative shrink-0">
                                <div className="h-10 w-10 rounded-lg bg-[#610000] flex items-center justify-center text-white border border-[#8e706b]/20 shadow-md transition-transform group-hover:scale-105 active:scale-95">
                                    <span className="material-symbols-outlined text-2xl">account_circle</span>
                                </div>
                                <div className="absolute -bottom-0.5 -right-0.5 h-3 w-3 rounded-full bg-green-500 border-2 border-white"></div>
                            </div>
                        </div>
                    </div>
                </header>

                {/* Main Content */}
                <main className={`pt-24 pb-20 px-4 md:px-6 lg:px-10 max-w-[1440px] transition-all duration-300 ${isSidebarOpen ? 'lg:ml-[280px]' : 'mx-auto'}`}>
                    {activeTab === 'dashboard' && (
                        <div className="animate-in fade-in duration-500">
                            <div className="mb-10 flex flex-col items-center text-center gap-4">
                                <div>
                                    <h2 className="font-admin-headline-lg text-admin-primary mb-1">Maklumat Kewangan</h2>
                                    <p className="font-admin-body-lg text-admin-secondary mt-1 mb-0">Pengurusan kewangan dan metrik jualan untuk kitaran semasa.</p>
                                </div>
                                <button className="bg-admin-primary-container text-white px-6 py-3 font-admin-body-md hover:opacity-90 transition-all flex items-center justify-center gap-2 border-0 cursor-pointer">
                                    <span className="material-symbols-outlined">add</span> New Financial Entry
                                </button>
                            </div>

                            {/* NEW STRIPE OVERVIEW UI */}
                            <div className="bg-white rounded-lg border border-outline-variant/20 p-6 shadow-sm font-sans mb-10 text-left">
                                <div className="flex justify-between items-center mb-6">
                                    <h2 className="text-xl font-semibold text-[#1a1c1c]">Your overview</h2>
                                    <div className="flex items-center gap-4 text-sm text-gray-500">
                                        <div className="flex items-center gap-1 cursor-pointer hover:text-black"><span className="material-symbols-outlined text-[16px]">calendar_today</span> Last 7 days</div>
                                        <div className="flex items-center gap-1 cursor-pointer hover:text-black"><span className="material-symbols-outlined text-[16px]">compare_arrows</span> Compare: Previous period</div>
                                    </div>
                                </div>
                                
                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-0 border-t border-l border-outline-variant/20">
                                    {/* Gross Volume */}
                                    <div className="p-4 border-r border-b border-outline-variant/20 hover:bg-gray-50 transition-colors cursor-pointer group flex flex-col justify-between h-32">
                                        <div className="flex justify-between items-start mb-2">
                                            <span className="text-sm font-medium text-[#4f566b] group-hover:text-[#635BFF]">Gross volume</span>
                                            <span className="material-symbols-outlined text-gray-400 text-[18px]">info</span>
                                        </div>
                                        <div>
                                            <div className="text-2xl font-semibold text-[#1a1c1c] mb-1">MYR {stripeOverview?.grossVolume?.toFixed(2) || '0.00'}</div>
                                            <div className="text-xs text-[#697386]">MYR {stripeOverview?.previousPeriod?.grossVolume?.toFixed(2) || '0.00'} previous period</div>
                                        </div>
                                    </div>

                                    {/* Net Volume */}
                                    <div className="p-4 border-r border-b border-outline-variant/20 hover:bg-gray-50 transition-colors cursor-pointer group flex flex-col justify-between h-32">
                                        <div className="flex justify-between items-start mb-2">
                                            <span className="text-sm font-medium text-[#4f566b] group-hover:text-[#635BFF]">Net volume</span>
                                            <span className="material-symbols-outlined text-gray-400 text-[18px]">info</span>
                                        </div>
                                        <div>
                                            <div className="text-2xl font-semibold text-[#1a1c1c] mb-1">MYR {stripeOverview?.netVolume?.toFixed(2) || '0.00'}</div>
                                            <div className="text-xs text-[#697386]">MYR {stripeOverview?.previousPeriod?.netVolume?.toFixed(2) || '0.00'} previous period</div>
                                        </div>
                                    </div>

                                    {/* Failed Payments */}
                                    <div className="p-4 border-r border-b border-outline-variant/20 hover:bg-gray-50 transition-colors cursor-pointer group flex flex-col justify-between h-32">
                                        <div className="flex justify-between items-start mb-2">
                                            <span className="text-sm font-medium text-[#4f566b] group-hover:text-[#635BFF]">Failed payments</span>
                                            <span className="material-symbols-outlined text-gray-400 text-[18px]">info</span>
                                        </div>
                                        <div>
                                            <div className="text-2xl font-semibold text-[#1a1c1c] mb-1">{stripeOverview?.failedPayments || '0'}</div>
                                            <div className="text-xs text-[#697386]">0 previous period</div>
                                        </div>
                                    </div>

                                    {/* New Customers */}
                                    <div className="p-4 border-r border-b border-outline-variant/20 hover:bg-gray-50 transition-colors cursor-pointer group flex flex-col justify-between h-32">
                                        <div className="flex justify-between items-start mb-2">
                                            <span className="text-sm font-medium text-[#4f566b] group-hover:text-[#635BFF]">New customers</span>
                                            <span className="material-symbols-outlined text-gray-400 text-[18px]">info</span>
                                        </div>
                                        <div>
                                            <div className="text-2xl font-semibold text-[#1a1c1c] mb-1">{stripeOverview?.newCustomers || '0'}</div>
                                            <div className="text-xs text-[#697386]">{stripeOverview?.previousPeriod?.newCustomers || '0'} previous period</div>
                                        </div>
                                    </div>

                                    {/* Top Customers */}
                                    <div className="p-4 border-r border-b border-outline-variant/20 hover:bg-gray-50 transition-colors cursor-pointer group flex flex-col justify-between h-32">
                                        <div className="flex justify-between items-start mb-2">
                                            <span className="text-sm font-medium text-[#4f566b] group-hover:text-[#635BFF]">Top customers by spend</span>
                                            <span className="material-symbols-outlined text-gray-400 text-[18px]">info</span>
                                        </div>
                                        <div>
                                            <div className="text-xl font-medium text-[#8792a2] mb-1">No data</div>
                                            <div className="text-xs text-[#697386]">All time</div>
                                        </div>
                                    </div>
                                </div>
                                      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-10">
                                {/* Chart 1: Main Sales Graph */}
                                <div className="col-span-1 lg:col-span-3 rounded-xl bg-white p-6 md:p-8 border border-outline-variant/20 shadow-sm overflow-hidden relative">
                                    <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4 border-b border-outline-variant/10 pb-6">
                                        <h4 className="font-admin-headline-sm text-[#1a1c1c] mb-0">Tren Jualan Bulanan</h4>
                                        <div className="flex flex-wrap gap-4 justify-start">
                                            <div className="flex items-center gap-2"><span className="w-3 h-3 rounded-full bg-[#8b0000]"></span><span className="font-admin-label-caps text-admin-secondary">Naskhah Nadir</span></div>
                                            <div className="flex items-center gap-2"><span className="w-3 h-3 rounded-full bg-[#c85a5a]"></span><span className="font-admin-label-caps text-admin-secondary">Edisi Baharu</span></div>
                                        </div>
                                    </div>
                                    <div className="h-[250px] md:h-[300px] flex items-end justify-between gap-2 md:gap-4 px-2 md:px-4 relative">
                                        {/* Background Grid Lines */}
                                        <div className="absolute inset-0 flex flex-col justify-between opacity-100 pointer-events-none z-0">
                                            <div className="w-full h-[1px] bg-outline-variant/20"></div>
                                            <div className="w-full h-[1px] bg-outline-variant/20"></div>
                                            <div className="w-full h-[1px] bg-outline-variant/20"></div>
                                            <div className="w-full h-[1px] bg-outline-variant/20"></div>
                                            <div className="w-full h-[1px] bg-outline-variant/20"></div>
                                        </div>
                                        {dashboardStats.chart.labels.map((m, i) => (
                                            <div key={m} className="flex-1 flex flex-col justify-end items-center group relative z-10 w-full h-full pb-1">
                                                {/* Grouped bars container */}
                                                <div className="flex items-end justify-center gap-0.5 md:gap-1 w-full h-full">
                                                    <div className="w-full max-w-[24px] bg-gradient-to-t from-[#8b0000] to-[#b30000] transition-all duration-1000 rounded-t-sm shadow-sm" style={{ height: showChartBars ? `${(naskhahData[i] / maxChartVal) * 100}%` : '0%' }}></div>
                                                    <div className="w-full max-w-[24px] bg-gradient-to-t from-[#c85a5a] to-[#d47878] transition-all duration-1000 rounded-t-sm shadow-sm" style={{ height: showChartBars ? `${(edisiData[i] / maxChartVal) * 100}%` : '0%' }}></div>
                                                </div>
                                                <p className="mt-2 md:mt-3 font-admin-label-caps text-[10px] md:text-xs text-admin-secondary mb-0">{m}</p>
                                                {/* Tooltip on hover */}
                                                <div className="absolute top-10 opacity-0 group-hover:opacity-100 transition-opacity bg-white border border-outline-variant/20 p-2 rounded shadow-lg whitespace-nowrap pointer-events-none z-20 flex flex-col gap-1 items-center font-sans text-xs">
                                                    <span className="text-[#8b0000] font-semibold">{Math.round(naskhahData[i])} Nadir</span>
                                                    <span className="text-[#c85a5a] font-semibold">{Math.round(edisiData[i])} Baharu</span>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>

                                {/* Chart 2: Traffic Sources (Donut using conic-gradient) */}
                                <div className="col-span-1 rounded-xl bg-white p-6 md:p-8 border border-outline-variant/20 shadow-sm relative overflow-hidden flex flex-col items-center justify-center">
                                    <h4 className="font-admin-headline-sm text-[#1a1c1c] mb-6 self-start w-full border-b border-outline-variant/10 pb-4">Sumber Trafik</h4>
                                    
                                    {/* CSS Donut Chart */}
                                    <div className="relative w-40 h-40 md:w-52 md:h-52 rounded-full shadow-sm mb-6 transition-transform duration-500 hover:scale-105" 
                                         style={{ background: 'conic-gradient(#8b0000 0% 45%, #c85a5a 45% 75%, #e59999 75% 100%)' }}>
                                        {/* Inner circle to make it a donut */}
                                        <div className="absolute inset-4 md:inset-5 rounded-full bg-white flex items-center justify-center shadow-inner">
                                            <div className="text-center flex flex-col items-center">
                                                <span className="text-2xl md:text-3xl font-bold text-[#1a1c1c]">98%</span>
                                                <span className="block text-[8px] md:text-[10px] font-admin-label-caps text-admin-secondary">Ketepatan</span>
                                            </div>
                                        </div>
                                    </div>
                                    
                                    <div className="flex flex-wrap gap-3 md:gap-6 w-full justify-center mt-2">
                                        <div className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 bg-[#8b0000] rounded-full"></span><span className="font-admin-label-caps text-[10px] md:text-xs text-admin-secondary">Carian (45%)</span></div>
                                        <div className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 bg-[#c85a5a] rounded-full"></span><span className="font-admin-label-caps text-[10px] md:text-xs text-admin-secondary">Terus (30%)</span></div>
                                        <div className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 bg-[#e59999] rounded-full"></span><span className="font-admin-label-caps text-[10px] md:text-xs text-admin-secondary">Sosial (25%)</span></div>
                                    </div>
                                </div>

                                {/* Chart 3: Top Genres (Horizontal Bars) */}
                                <div className="col-span-1 lg:col-span-2 rounded-xl bg-white p-6 md:p-8 border border-outline-variant/20 shadow-sm relative overflow-hidden flex flex-col">
                                    <h4 className="font-admin-headline-sm text-[#1a1c1c] mb-6 w-full border-b border-outline-variant/10 pb-4">Prestasi Koleksi Buku</h4>
                                    
                                    <div className="flex flex-col gap-5 md:gap-6 w-full mt-2 flex-grow justify-center font-sans">
                                        {/* Bar 1 */}
                                        <div className="group cursor-default">
                                            <div className="flex justify-between text-xs md:text-sm font-medium mb-1.5">
                                                <span className="text-[#4f566b] group-hover:text-[#1a1c1c] transition-colors">Tarbiah Sentap</span>
                                                <span className="text-[#1a1c1c] font-semibold">1,204 naskhah</span>
                                            </div>
                                            <div className="w-full h-2 bg-gray-100 rounded-full overflow-hidden">
                                                <div className="h-full bg-[#8b0000] rounded-full transition-all duration-1000 ease-out" style={{ width: showChartBars ? '85%' : '0%' }}></div>
                                            </div>
                                        </div>
                                        {/* Bar 2 */}
                                        <div className="group cursor-default">
                                            <div className="flex justify-between text-xs md:text-sm font-medium mb-1.5">
                                                <span className="text-[#4f566b] group-hover:text-[#1a1c1c] transition-colors">Motivasi Diri</span>
                                                <span className="text-[#1a1c1c] font-semibold">842 naskhah</span>
                                            </div>
                                            <div className="w-full h-2 bg-gray-100 rounded-full overflow-hidden">
                                                <div className="h-full bg-[#a31f1f] rounded-full transition-all duration-1000 delay-100 ease-out" style={{ width: showChartBars ? '60%' : '0%' }}></div>
                                            </div>
                                        </div>
                                        {/* Bar 3 */}
                                        <div className="group cursor-default">
                                            <div className="flex justify-between text-xs md:text-sm font-medium mb-1.5">
                                                <span className="text-[#4f566b] group-hover:text-[#1a1c1c] transition-colors">Novel Dakwah</span>
                                                <span className="text-[#1a1c1c] font-semibold">530 naskhah</span>
                                            </div>
                                            <div className="w-full h-2 bg-gray-100 rounded-full overflow-hidden">
                                                <div className="h-full bg-[#ba3c3c] rounded-full transition-all duration-1000 delay-200 ease-out" style={{ width: showChartBars ? '35%' : '0%' }}></div>
                                            </div>
                                        </div>
                                         {/* Bar 4 */}
                                        <div className="group cursor-default">
                                            <div className="flex justify-between text-xs md:text-sm font-medium mb-1.5">
                                                <span className="text-[#4f566b] group-hover:text-[#1a1c1c] transition-colors">Sejarah Islam</span>
                                                <span className="text-[#1a1c1c] font-semibold">210 naskhah</span>
                                            </div>
                                            <div className="w-full h-2 bg-gray-100 rounded-full overflow-hidden">
                                                <div className="h-full bg-[#c85a5a] rounded-full transition-all duration-1000 delay-300 ease-out" style={{ width: showChartBars ? '15%' : '0%' }}></div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>                          </div>
                        </div>
                    )}

                    {activeTab === 'books' && (
                        <div className="animate-in fade-in duration-500">
                            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end mb-10 gap-4">
                                <div>
                                    <h2 className="font-admin-headline-lg text-admin-primary mb-1">Koleksi Buku</h2>
                                    <p className="font-admin-body-lg text-admin-secondary mb-0">Pengurusan inventori menyeluruh untuk arkib utama dan stor.</p>
                                </div>
                                <div className="flex flex-col sm:flex-row gap-4 w-full sm:w-auto">
                                    <button onClick={(e) => { e.preventDefault(); setEditingBookId(null); setNewBookForm({ title: '', author: '', genre: '', price: 0, stock: 0, rating: 5, cover: '', coverFile: null }); setIsAddBookModalOpen(true); }} className="px-6 py-2 bg-[#8b0000] text-white font-bold hover:bg-black transition-opacity flex items-center border-0 cursor-pointer shadow-lg">
                                        <span className="material-symbols-outlined mr-2 text-sm">add_circle</span> TAMBAH BUKU BAHARU
                                    </button>
                                    <button className="px-6 py-2 border border-admin-outline text-admin-primary font-admin-body-md hover:bg-admin-surface-container transition-colors flex items-center bg-transparent cursor-pointer">
                                        <span className="material-symbols-outlined mr-2 text-sm">edit_note</span> Update Metadata
                                    </button>
                                </div>
                            </div>

                            <section className="mb-10 bg-admin-surface-container-lowest border border-admin-outline-variant p-6">
                                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-6 gap-4">
                                    <h3 className="font-admin-headline-sm text-admin-primary flex items-center mb-0"><span className="material-symbols-outlined mr-2 text-admin-error">warning</span> Critical Rarity Alerts</h3>
                                    <span className="font-admin-label-caps text-admin-error bg-admin-error-10 px-2 py-1">Tindakan Diperlukan</span>
                                </div>
                                <div className="space-y-4">
                                    <div className="flex flex-col md:flex-row items-start md:items-center justify-between p-4 bg-admin-primary-5 border-l-4 border-admin-primary gap-4">
                                        <div className="flex items-center">
                                            <div className="w-12 h-16 bg-admin-surface-container-high border border-admin-outline-variant flex items-center justify-center mr-4">
                                                <span className="material-symbols-outlined text-admin-secondary opacity-30">book</span>
                                            </div>
                                            <div><p className="font-admin-headline-sm text-sm text-[#1a1c1c] mb-0">Tarbiah Sentap: Edisi Terhad</p><p className="font-admin-body-md text-xs text-admin-secondary mb-0 mt-1">ID: MS-VLT-0092</p></div>
                                        </div>
                                        <div className="text-left md:text-right flex flex-col sm:flex-row items-start sm:items-center gap-4 w-full md:w-auto">
                                            <div><p className="font-admin-label-caps text-admin-error mb-0">1 NASKHAH TINGGAL</p><p className="font-admin-body-md text-xs text-admin-secondary mb-0 mt-1">Pesanan Terakhir: 2j lepas</p></div>
                                            <button className="text-admin-primary font-admin-label-caps border border-admin-primary bg-transparent px-3 py-1 hover:bg-admin-primary hover:text-white transition-all cursor-pointer">TAMBAH STOK</button>
                                        </div>
                                    </div>
                                </div>
                            </section>

                            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-8 border-b border-admin-outline-variant pb-4 gap-4">
                                <h3 className="font-admin-headline-md text-[#1a1c1c] mb-0">Grid Inventori Buku</h3>
                                <div className="flex space-x-6 text-admin-secondary font-admin-label-caps">
                                    <span className="text-admin-primary border-b-2 border-admin-primary cursor-pointer pb-2">SEMUA BUKU</span>
                                </div>
                            </div>
                            
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                                {filteredBooks.map(book => (
                                    <div key={book.id} className="bg-admin-surface-container-lowest border border-admin-outline-variant group hover:border-admin-primary transition-all duration-300">
                                        <div className="h-48 bg-admin-surface-container relative overflow-hidden">
                                            <img src={book.cover} alt="" className="w-full h-full object-cover transition-all duration-500" />
                                            <div className="absolute top-3 right-3">
                                                <span className="bg-white/90 text-[#1a1c1c] text-[10px] font-admin-label-caps px-2 py-1 backdrop-blur-sm">ID: BK-{book.id}</span>
                                            </div>
                                        </div>
                                        <div className="p-5">
                                            <div className="flex justify-between items-start mb-2">
                                                <h4 className="font-admin-headline-sm text-base text-[#1a1c1c] leading-tight mb-0 line-clamp-2">{book.title}</h4>
                                                <div className="flex gap-2 ml-2 flex-shrink-0">
                                                    <span onClick={() => openEditModal(book)} className="material-symbols-outlined text-admin-secondary hover:text-admin-primary text-sm cursor-pointer" title="Edit Metadata">edit</span>
                                                    <span onClick={() => handleDeleteBook(book.id)} className="material-symbols-outlined text-admin-secondary hover:text-admin-error text-sm cursor-pointer" title="Remove from Registry">delete</span>
                                                </div>
                                            </div>
                                            <p className="font-admin-body-md text-xs text-admin-secondary mb-3 truncate">{book.author}</p>
                                            <div className="grid grid-cols-2 gap-4 border-t border-admin-outline-variant pt-4">
                                                <div>
                                                    <p className="font-admin-label-caps text-[9px] text-admin-secondary opacity-70 mb-0">Current Rarity</p>
                                                    <p className={`font-admin-data-table font-bold mb-0 mt-1 ${book.stock === 0 ? 'text-admin-error' : 'text-[#1a1c1c]'}`}>{book.stock} VOLUMES</p>
                                                </div>
                                                <div className="text-right">
                                                    <p className="font-admin-label-caps text-[9px] text-admin-secondary opacity-70 mb-0">Valuation</p>
                                                    <p className="font-admin-data-table text-admin-primary font-bold mb-0 mt-1">RM{book.price.toFixed(2)}</p>
                                                </div>
                                            </div>
                                            <div className="mt-4 pt-4 border-t border-admin-outline-variant flex gap-2">
                                                <input 
                                                    type="number" 
                                                    min="1" 
                                                    placeholder="Qty" 
                                                    className="w-full px-2 py-1.5 text-sm border border-admin-outline-variant font-admin-body-md"
                                                    id={`restock-${book.id}`}
                                                />
                                                <button 
                                                    onClick={() => handleRestock(book.id)}
                                                    className="bg-admin-primary text-white px-3 py-1.5 text-sm font-admin-body-md whitespace-nowrap hover:bg-[#610000] cursor-pointer border-0"
                                                >
                                                    Tambah Stok
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    {activeTab === 'orders' && (
                        <div className="animate-in fade-in duration-500">
                            <div className="mb-10 flex flex-col sm:flex-row justify-between items-start sm:items-end gap-4">
                                <div>
                                    <h2 className="font-admin-headline-lg text-admin-primary mb-1">Log Jualan</h2>
                                    <p className="font-admin-body-lg text-admin-secondary mt-1 mb-0">Official registry of successful historical and modern transactions.</p>
                                </div>
                            </div>
                            
                            <div className="admin-data-card bg-white overflow-hidden">
                                <div className="p-6 border-b border-admin-surface-variant flex justify-between items-center">
                                    <h4 className="font-admin-headline-sm mb-0">Daftar Transaksi</h4>
                                </div>
                                <div className="overflow-x-auto">
                                    <table className="w-full text-left border-collapse">
                                        <thead>
                                            <tr className="bg-admin-surface-container-low">
                                                <th className="px-6 py-4 font-admin-label-caps text-admin-secondary border-b border-admin-surface-variant">Rujukan Pesanan</th>
                                                <th className="px-6 py-4 font-admin-label-caps text-admin-secondary border-b border-admin-surface-variant">Tarikh Direkod</th>
                                                <th className="px-6 py-4 font-admin-label-caps text-admin-secondary border-b border-admin-surface-variant">Lejar Klien</th>
                                                <th className="px-6 py-4 font-admin-label-caps text-admin-secondary border-b border-admin-surface-variant">Jumlah Penilaian</th>
                                                <th className="px-6 py-4 font-admin-label-caps text-admin-secondary border-b border-admin-surface-variant">Status Integriti</th>
                                                <th className="px-6 py-4 font-admin-label-caps text-admin-secondary border-b border-admin-surface-variant">Tindakan</th>
                                            </tr>
                                        </thead>
                                        <tbody className="font-admin-data-table text-[#1a1c1c]">
                                            {filteredOrders.length === 0 ? (
                                                <tr><td colSpan="6" className="p-8 text-center text-admin-secondary">Tiada transaksi dijumpai...</td></tr>
                                            ) : filteredOrders.map(order => (
                                                <tr key={order.id} className="hover:bg-admin-surface-container-low transition-colors border-b border-admin-surface-variant">
                                                    <td className="px-6 py-4 font-bold text-[#1a1c1c]">REF-{order.id.toString().split('-')[0].toUpperCase()}</td>
                                                    <td className="px-6 py-4">{new Date(order.created_at).toLocaleDateString()}</td>
                                                    <td className="px-6 py-4">{order.user ? order.user.name : 'Unknown Scholar'}</td>
                                                    <td className="px-6 py-4 font-bold text-admin-primary">RM{parseFloat(order.total_amount).toFixed(2)}</td>
                                                    <td className="px-6 py-4">
                                                        <select 
                                                            value={order.status} 
                                                            onChange={(e) => handleUpdateOrderStatus(order.id, e.target.value)}
                                                            className={`px-3 py-1 text-[10px] font-bold uppercase tracking-widest border-0 cursor-pointer outline-none ${
                                                                order.status === 'completed' 
                                                                ? 'bg-[#dcfce7] text-green-800' 
                                                                : order.status === 'shipped'
                                                                ? 'bg-[#e0f2fe] text-blue-800'
                                                                : order.status === 'processing'
                                                                ? 'bg-[#f3e8ff] text-purple-800'
                                                                : order.status === 'cancelled'
                                                                ? 'bg-[#fee2e2] text-red-800'
                                                                : 'bg-[#fef3c7] text-amber-800'
                                                            }`}
                                                        >
                                                            <option value="pending">Pending</option>
                                                            <option value="processing">Processing</option>
                                                            <option value="shipped">Shipped</option>
                                                            <option value="completed">Completed</option>
                                                            <option value="cancelled">Cancelled</option>
                                                        </select>
                                                    </td>
                                                    <td className="px-6 py-4">
                                                        <button 
                                                            onClick={() => handleDeleteOrder(order.id)} 
                                                            className="text-admin-secondary hover:text-[#8b0000] transition-colors p-2 bg-transparent border-none cursor-pointer flex items-center justify-center"
                                                            title="Padam Pesanan"
                                                        >
                                                            <span className="material-symbols-outlined text-xl">delete</span>
                                                        </button>
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            </div>
                        </div>
                    )}

                    {activeTab === 'users' && (
                        <div className="animate-in fade-in duration-500">
                            <div className="mb-10 flex flex-col sm:flex-row justify-between items-start sm:items-end gap-4">
                                <div>
                                    <h2 className="font-admin-headline-lg text-admin-primary mb-1">User</h2>
                                    <p className="font-admin-body-lg text-admin-secondary mt-1 mb-0">Pengurusan profil dan akses warga sistem.</p>
                                </div>
                                <div className="flex flex-col sm:flex-row gap-4 w-full sm:w-auto">
                                    <button onClick={(e) => { e.preventDefault(); setEditingUserId(null); setNewUserForm({ name: '', email: '', role: 'customer', password: '' }); setIsUserModalOpen(true); }} className="px-6 py-2 bg-[#8b0000] text-white font-bold hover:bg-black transition-opacity flex items-center border-0 cursor-pointer shadow-lg">
                                        <span className="material-symbols-outlined mr-2 text-sm">person_add</span> TAMBAH AKAUN BAHARU
                                    </button>
                                </div>
                            </div>
                            
                            <div className="admin-data-card bg-white overflow-hidden">
                                <div className="p-6 border-b border-admin-surface-variant flex justify-between items-center">
                                    <h4 className="font-admin-headline-sm mb-0">Senarai Pengguna</h4>
                                </div>
                                <div className="overflow-x-auto">
                                    <table className="w-full text-left border-collapse">
                                        <thead>
                                            <tr className="bg-admin-surface-container-low">
                                                <th className="px-6 py-4 font-admin-label-caps text-admin-secondary border-b border-admin-surface-variant">ID Pengguna</th>
                                                <th className="px-6 py-4 font-admin-label-caps text-admin-secondary border-b border-admin-surface-variant">Emel / Nama</th>
                                                <th className="px-6 py-4 font-admin-label-caps text-admin-secondary border-b border-admin-surface-variant">Peranan</th>
                                                <th className="px-6 py-4 font-admin-label-caps text-admin-secondary border-b border-admin-surface-variant">Tarikh Daftar</th>
                                                <th className="px-6 py-4 font-admin-label-caps text-admin-secondary border-b border-admin-surface-variant">Tindakan</th>
                                            </tr>
                                        </thead>
                                        <tbody className="font-admin-data-table text-[#1a1c1c]">
                                            {filteredUsers.length === 0 ? (
                                                <tr><td colSpan="5" className="p-8 text-center text-admin-secondary">Tiada pengguna dijumpai...</td></tr>
                                            ) : filteredUsers.map(u => (
                                                <tr key={u.id} className="hover:bg-admin-surface-container-low transition-colors border-b border-admin-surface-variant">
                                                    <td className="px-6 py-4 font-mono text-xs text-admin-secondary">{u.id.substring(0, 8)}...</td>
                                                    <td className="px-6 py-4">
                                                        <div className="font-bold text-[#1a1c1c]">{u.user_metadata?.name || 'Scholar'}</div>
                                                        <div className="text-admin-secondary text-xs">{u.email}</div>
                                                    </td>
                                                    <td className="px-6 py-4">
                                                        <span className={`px-3 py-1 text-[10px] font-bold uppercase tracking-widest ${
                                                            u.app_metadata?.role === 'admin' 
                                                            ? 'bg-[#ffebee] text-[#8b0000]' 
                                                            : 'bg-[#f0f9ff] text-[#0369a1]'
                                                        }`}>
                                                            {u.app_metadata?.role === 'admin' ? 'Admin' : 'Customer'}
                                                        </span>
                                                    </td>
                                                    <td className="px-6 py-4">{new Date(u.created_at).toLocaleDateString()}</td>
                                                    <td className="px-6 py-4">
                                                        <div className="flex gap-2 text-admin-secondary">
                                                            <span onClick={() => setTrackingUser(u)} className="material-symbols-outlined hover:text-admin-primary text-sm cursor-pointer" title="Track User Orders">receipt_long</span>
                                                            <span onClick={() => openEditUserModal(u)} className="material-symbols-outlined hover:text-admin-primary text-sm cursor-pointer" title="Edit Metadata">edit</span>
                                                            <span onClick={() => handleDeleteUser(u.id, u.email)} className="material-symbols-outlined hover:text-admin-error text-sm cursor-pointer" title="Remove User">block</span>
                                                        </div>
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            </div>
                        </div>
                    )}
                </main>
                
                {isAddBookModalOpen && (
                    <div style={{ position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh', backgroundColor: 'rgba(0,0,0,0.8)', zIndex: 99999, display: 'flex', alignItems: 'center', justifyContent: 'center', overflowY: 'auto', padding: '2rem' }} id="modal-overlay">
                        <div style={{ backgroundColor: '#ffffff', width: '100%', maxWidth: '1000px', maxHeight: '90vh', overflowY: 'auto', borderRadius: '8px', boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.5)', position: 'relative', zIndex: 100000 }}>
                            <div className="p-10 flex-1">
                                <form onSubmit={handleAddBookSubmit}>
                                    <div className="flex justify-between items-end mb-10">
                                        <div>
                                            <nav className="flex items-center gap-2 font-admin-label-caps text-admin-secondary mb-4 uppercase">
                                                <span>ADMINISTRATION</span>
                                                <span className="material-symbols-outlined text-[12px]">chevron_right</span>
                                                <span>THE STACKS</span>
                                                <span className="material-symbols-outlined text-[12px]">chevron_right</span>
                                                <span className="text-admin-primary font-bold">NEW VOLUME ENTRY</span>
                                            </nav>
                                            <h2 className="font-admin-headline-lg text-[#1a1c1c] mb-0">{editingBookId ? 'Update Volume Metadata' : 'Commit New Volume to Registry'}</h2>
                                            <p className="font-admin-body-lg text-admin-secondary max-w-2xl mt-2 mb-0">Ensure all bibliographic data is precise. The Registry is the permanent record of the Sanctuary's intellectual capital.</p>
                                        </div>
                                        <div className="flex items-center gap-4">
                                            <button type="button" onClick={() => setIsAddBookModalOpen(false)} className="px-6 py-2 border border-admin-outline text-admin-secondary font-admin-body-md hover:bg-admin-surface-container transition-all cursor-pointer bg-transparent">Discard Draft</button>
                                            <button type="submit" className="px-8 py-2 bg-[#8b0000] text-white font-admin-body-md font-medium hover:opacity-90 transition-all flex items-center gap-2 cursor-pointer border-0 shadow-md">
                                                <span className="material-symbols-outlined text-[18px]">save</span>{editingBookId ? 'Save Revisions' : 'Commit to Registry'}
                                            </button>
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-1 md:grid-cols-12 gap-10">
                                        <div className="col-span-1 md:col-span-8 space-y-8">
                                            <section className="bg-admin-surface-container-lowest p-8 border border-admin-outline-variant shadow-sm transition-shadow focus-within:shadow-md">
                                                <div className="mb-6">
                                                    <label className="block font-admin-headline-sm mb-2 text-[#1a1c1c]">Volume Title</label>
                                                    <input required value={newBookForm.title} onChange={e => setNewBookForm({...newBookForm, title: e.target.value})} className="w-full border-0 border-b border-admin-outline-variant focus:border-admin-primary-container focus:ring-0 font-admin-headline-md px-0 py-2 bg-transparent placeholder:text-gray-400 transition-all outline-none text-[#1a1c1c]" placeholder="Enter the full scholarly title..." type="text" />
                                                </div>
                                                <div className="grid grid-cols-2 gap-8">
                                                    <div className="space-y-1">
                                                        <label className="block font-admin-label-caps text-admin-secondary uppercase tracking-widest">Primary Author</label>
                                                        <input required value={newBookForm.author} onChange={e => setNewBookForm({...newBookForm, author: e.target.value})} className="w-full border-0 border-b border-admin-outline-variant focus:border-admin-primary-container focus:ring-0 font-admin-body-lg px-0 py-2 bg-transparent outline-none text-[#1a1c1c]" placeholder="e.g. Alistair P. Thorne" type="text" />
                                                    </div>
                                                    <div className="space-y-1">
                                                        <label className="block font-admin-label-caps text-admin-secondary uppercase tracking-widest">Cover Image File</label>
                                                        <input accept="image/*" onChange={e => setNewBookForm({...newBookForm, coverFile: e.target.files[0]})} className="w-full border-0 border-b border-admin-outline-variant focus:border-admin-primary-container focus:ring-0 font-admin-body-lg px-0 py-2 bg-transparent outline-none text-[#1a1c1c] file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-bold file:bg-[#8b0000] file:text-white hover:file:bg-black cursor-pointer" type="file" />
                                                    </div>
                                                </div>
                                            </section>

                                            <section className="bg-admin-surface-container-lowest p-8 border border-admin-outline-variant shadow-sm transition-shadow focus-within:shadow-md">
                                                <h3 className="font-admin-headline-sm mb-8 flex items-center gap-2 text-[#1a1c1c]">
                                                    <span className="material-symbols-outlined text-[#D4AF37]">auto_awesome</span>Bibliographic Specifications
                                                </h3>
                                                <div className="grid grid-cols-3 gap-8 mb-8">
                                                    <div className="space-y-2">
                                                        <label className="block font-admin-label-caps text-admin-secondary uppercase tracking-widest">Genre / Category</label>
                                                        <select required value={newBookForm.genre} onChange={e => setNewBookForm({...newBookForm, genre: e.target.value})} className="w-full border border-admin-outline-variant focus:border-admin-primary-container focus:ring-0 font-admin-body-md px-3 py-2 bg-admin-surface-container-lowest outline-none text-[#1a1c1c]">
                                                            <option value="">Select Category</option>
                                                            <option value="Tarbiah">Tarbiah</option>
                                                            <option value="Motivasi">Motivasi</option>
                                                            <option value="Fiksyen">Fiksyen</option>
                                                            <option value="Kerohanian">Kerohanian</option>
                                                            <option value="Koleksi Nadir">Koleksi Nadir</option>
                                                        </select>
                                                    </div>
                                                    <div className="space-y-2">
                                                        <label className="block font-admin-label-caps text-admin-secondary uppercase tracking-widest">Rating (0-5)</label>
                                                        <input required value={newBookForm.rating} onChange={e => setNewBookForm({...newBookForm, rating: parseFloat(e.target.value)})} className="w-full border border-admin-outline-variant focus:border-admin-primary-container focus:ring-0 font-admin-body-md px-3 py-2 bg-admin-surface-container-lowest outline-none text-[#1a1c1c]" placeholder="5.0" type="number" step="0.1" min="0" max="5" />
                                                    </div>
                                                    <div className="space-y-2">
                                                        <label className="block font-admin-label-caps text-admin-secondary uppercase tracking-widest">Acquisition Price</label>
                                                        <div className="relative flex items-center">
                                                            <span className="absolute left-3 text-admin-secondary font-admin-body-md">RM</span>
                                                            <input required value={newBookForm.price} onChange={e => setNewBookForm({...newBookForm, price: parseFloat(e.target.value)})} className="w-full pl-9 pr-3 py-2 border border-admin-outline-variant focus:border-admin-primary-container focus:ring-0 font-admin-body-md bg-admin-surface-container-lowest outline-none text-[#1a1c1c]" placeholder="0.00" type="number" step="0.01" min="0" />
                                                        </div>
                                                    </div>
                                                </div>
                                                <div className="space-y-2">
                                                    <label className="block font-admin-label-caps text-admin-secondary uppercase tracking-widest">Physical Description & Binding</label>
                                                    <textarea className="w-full border border-admin-outline-variant focus:border-admin-primary-container focus:ring-0 font-admin-body-md px-3 py-2 bg-admin-surface-container-lowest outline-none text-[#1a1c1c]" placeholder="Describe the material condition, binding leather, paper grain, and any marginalia..." rows="4"></textarea>
                                                </div>
                                            </section>
                                        </div>

                                        <div className="col-span-1 md:col-span-4 space-y-8">
                                            <section className="bg-admin-surface-container-lowest p-6 border border-admin-outline-variant shadow-sm">
                                                <label className="block font-admin-label-caps text-admin-secondary uppercase tracking-widest mb-4">Volume Cover Display</label>
                                                <div className="relative group aspect-[3/4] border-2 border-dashed border-admin-outline-variant transition-all flex flex-col items-center justify-center bg-admin-surface overflow-hidden">
                                                    {(newBookForm.coverFile || newBookForm.cover) ? (
                                                        <img src={newBookForm.coverFile ? URL.createObjectURL(newBookForm.coverFile) : newBookForm.cover} alt="Cover Preview" className="w-full h-full object-cover" />
                                                    ) : (
                                                        <div className="text-center transition-transform">
                                                            <span className="material-symbols-outlined text-4xl text-admin-secondary mb-2">image</span>
                                                            <p className="font-admin-headline-sm text-admin-secondary mb-0">Preview</p>
                                                        </div>
                                                    )}
                                                </div>
                                            </section>

                                            <section className="bg-admin-surface-container-lowest p-6 border border-admin-outline-variant shadow-sm">
                                                <label className="block font-admin-label-caps text-admin-secondary uppercase tracking-widest mb-4">Registry Logistics</label>
                                                <div className="space-y-6">
                                                    <div className="flex items-center justify-between">
                                                        <span className="font-admin-body-md font-medium text-[#1a1c1c]">Initial Stock Quantity</span>
                                                        <div className="flex items-center border border-admin-outline-variant">
                                                            <button type="button" onClick={() => setNewBookForm({...newBookForm, stock: Math.max(0, newBookForm.stock - 1)})} className="px-3 py-1 hover:bg-admin-surface-container cursor-pointer border-0 bg-transparent text-[#1a1c1c]">-</button>
                                                            <input value={newBookForm.stock} onChange={e => setNewBookForm({...newBookForm, stock: parseInt(e.target.value, 10)})} className="w-12 text-center border-x border-y-0 border-admin-outline-variant focus:ring-0 font-admin-body-md bg-transparent outline-none text-[#1a1c1c]" type="number" min="0" />
                                                            <button type="button" onClick={() => setNewBookForm({...newBookForm, stock: newBookForm.stock + 1})} className="px-3 py-1 hover:bg-admin-surface-container cursor-pointer border-0 bg-transparent text-[#1a1c1c]">+</button>
                                                        </div>
                                                    </div>
                                                    
                                                    <div className="pt-4 border-t border-admin-outline-variant">
                                                        <div className="flex items-start gap-3 p-3 bg-admin-primary-5 border border-admin-primary">
                                                            <span className="material-symbols-outlined text-admin-primary text-[20px]">info</span>
                                                            <p className="text-[12px] leading-snug text-admin-primary mb-0">This volume will be assigned a unique Sanctuary UID upon submission to the registry.</p>
                                                        </div>
                                                    </div>
                                                </div>
                                            </section>
                                        </div>
                                    </div>
                                </form>
                            </div>
                        </div>
                    </div>
                )}

                {isUserModalOpen && (
                    <div style={{ position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh', backgroundColor: 'rgba(0,0,0,0.8)', zIndex: 99999, display: 'flex', alignItems: 'center', justifyContent: 'center', overflowY: 'auto', padding: '2rem' }} id="modal-overlay">
                        <div style={{ backgroundColor: '#ffffff', width: '100%', maxWidth: '800px', maxHeight: '90vh', overflowY: 'auto', borderRadius: '8px', boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.5)', position: 'relative', zIndex: 100000 }}>
                            <div className="p-10 flex-1">
                                <form onSubmit={handleAddUserSubmit}>
                                    <div className="flex justify-between items-end mb-10">
                                        <div>
                                            <nav className="flex items-center gap-2 font-admin-label-caps text-admin-secondary mb-4 uppercase">
                                                <span>ADMINISTRATION</span>
                                                <span className="material-symbols-outlined text-[12px]">chevron_right</span>
                                                <span className="text-admin-primary font-bold">USER REGISTRY</span>
                                            </nav>
                                            <h2 className="font-admin-headline-lg text-[#1a1c1c] mb-0">{editingUserId ? 'Update User Metadata' : 'Register New Scholar/Admin'}</h2>
                                            <p className="font-admin-body-lg text-admin-secondary max-w-2xl mt-2 mb-0">Manage system access privileges and profile identity.</p>
                                        </div>
                                        <div className="flex items-center gap-4">
                                            <button type="button" onClick={() => setIsUserModalOpen(false)} className="px-6 py-2 border border-admin-outline text-admin-secondary font-admin-body-md hover:bg-admin-surface-container transition-all cursor-pointer bg-transparent">Discard Draft</button>
                                            <button type="submit" className="px-8 py-2 bg-[#8b0000] text-white font-admin-body-md font-medium hover:opacity-90 transition-all flex items-center gap-2 cursor-pointer border-0 shadow-md">
                                                <span className="material-symbols-outlined text-[18px]">save</span>{editingUserId ? 'Save Revisions' : 'Commit to Registry'}
                                            </button>
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
                                        <div className="md:col-span-2 space-y-8">
                                            <section className="bg-admin-surface-container-lowest p-6 border border-admin-outline-variant shadow-sm">
                                                <label className="block font-admin-label-caps text-admin-secondary uppercase tracking-widest mb-4 border-b border-admin-outline-variant pb-2">Profile Identity</label>
                                                <div className="space-y-5">
                                                    <div>
                                                        <label className="block font-admin-body-md font-medium text-[#1a1c1c] mb-2">Full Name</label>
                                                        <input required value={newUserForm.name} onChange={e => setNewUserForm({...newUserForm, name: e.target.value})} className="scholarly-input w-full px-4 py-3 bg-admin-surface border border-admin-outline-variant font-admin-body-lg text-[#1a1c1c] placeholder-admin-secondary outline-none transition-all" placeholder="Enter scholar's full name" />
                                                    </div>
                                                    <div>
                                                        <label className="block font-admin-body-md font-medium text-[#1a1c1c] mb-2">Email Address</label>
                                                        <input required type="email" disabled={!!editingUserId} value={newUserForm.email} onChange={e => setNewUserForm({...newUserForm, email: e.target.value})} className={`scholarly-input w-full px-4 py-3 bg-admin-surface border border-admin-outline-variant font-admin-body-lg text-[#1a1c1c] placeholder-admin-secondary outline-none transition-all ${editingUserId ? 'opacity-60 cursor-not-allowed' : ''}`} placeholder="name@domain.com" />
                                                    </div>
                                                    <div>
                                                        <label className="block font-admin-body-md font-medium text-[#1a1c1c] mb-2">Password {editingUserId ? '(Leave blank to keep current)' : ''}</label>
                                                        <input required={!editingUserId} type="password" value={newUserForm.password} onChange={e => setNewUserForm({...newUserForm, password: e.target.value})} className="scholarly-input w-full px-4 py-3 bg-admin-surface border border-admin-outline-variant font-admin-body-lg text-[#1a1c1c] placeholder-admin-secondary outline-none transition-all" placeholder="Enter secure password" />
                                                    </div>
                                                </div>
                                            </section>
                                        </div>

                                        <div className="space-y-8">
                                            <section className="bg-admin-surface-container-lowest p-6 border border-admin-outline-variant shadow-sm">
                                                <label className="block font-admin-label-caps text-admin-secondary uppercase tracking-widest mb-4 border-b border-admin-outline-variant pb-2">Privileges</label>
                                                <div className="space-y-5">
                                                    <div>
                                                        <label className="block font-admin-body-md font-medium text-[#1a1c1c] mb-2">Access Role</label>
                                                        <select value={newUserForm.role} onChange={e => setNewUserForm({...newUserForm, role: e.target.value})} className="scholarly-input w-full px-4 py-3 bg-admin-surface border border-admin-outline-variant font-admin-body-lg text-[#1a1c1c] outline-none transition-all cursor-pointer">
                                                            <option value="customer">Customer</option>
                                                            <option value="admin">Administrator</option>
                                                        </select>
                                                    </div>
                                                    
                                                    <div className="pt-4 border-t border-admin-outline-variant">
                                                        <div className="flex items-start gap-3 p-3 bg-admin-primary-5 border border-admin-primary">
                                                            <span className="material-symbols-outlined text-admin-primary text-[20px]">security</span>
                                                            <p className="text-[12px] leading-snug text-admin-primary mb-0">Admins have full access to registry operations and order fulfillment. Proceed with caution.</p>
                                                        </div>
                                                    </div>
                                                </div>
                                            </section>
                                        </div>
                                    </div>
                                </form>
                            </div>
                        </div>
                    </div>
                )}

                {trackingUser && (
                    <div style={{ position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh', backgroundColor: 'rgba(0,0,0,0.8)', zIndex: 99999, display: 'flex', alignItems: 'center', justifyContent: 'center', overflowY: 'auto', padding: '2rem' }} id="modal-overlay">
                        <div style={{ backgroundColor: '#ffffff', width: '100%', maxWidth: '800px', maxHeight: '90vh', overflowY: 'auto', borderRadius: '8px', boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.5)', position: 'relative', zIndex: 100000 }}>
                            <div className="p-10 flex-1">
                                <div className="flex justify-between items-end mb-10">
                                    <div>
                                        <nav className="flex items-center gap-2 font-admin-label-caps text-admin-secondary mb-4 uppercase">
                                            <span>ADMINISTRATION</span>
                                            <span className="material-symbols-outlined text-[12px]">chevron_right</span>
                                            <span>USER</span>
                                            <span className="material-symbols-outlined text-[12px]">chevron_right</span>
                                            <span className="text-admin-primary font-bold">TRANSACTION LOGS</span>
                                        </nav>
                                        <h2 className="font-admin-headline-lg text-[#1a1c1c] mb-0">Order History</h2>
                                        <p className="font-admin-body-lg text-admin-secondary max-w-2xl mt-2 mb-0">Records for {trackingUser.user_metadata?.name || trackingUser.email}</p>
                                    </div>
                                    <div className="flex items-center gap-4">
                                        <button type="button" onClick={() => setTrackingUser(null)} className="px-6 py-2 border border-admin-outline text-admin-secondary font-admin-body-md hover:bg-admin-surface-container transition-all cursor-pointer bg-transparent">Close Viewer</button>
                                    </div>
                                </div>

                                <div className="space-y-4">
                                    {allOrders.filter(o => o.user_id === trackingUser.id).length === 0 ? (
                                        <div className="p-8 text-center text-admin-secondary border border-admin-outline-variant bg-admin-surface-container-lowest">
                                            <span className="material-symbols-outlined text-4xl mb-2 opacity-50">receipt_long</span>
                                            <p className="font-admin-body-lg">Tiada transaksi direkodkan untuk pengguna ini.</p>
                                        </div>
                                    ) : (
                                        <div className="admin-data-card bg-white overflow-hidden border border-admin-surface-variant">
                                            <div className="overflow-x-auto">
                                                <table className="w-full text-left border-collapse">
                                                    <thead>
                                                        <tr className="bg-admin-surface-container-low">
                                                            <th className="px-6 py-4 font-admin-label-caps text-admin-secondary border-b border-admin-surface-variant">Rujukan Pesanan</th>
                                                            <th className="px-6 py-4 font-admin-label-caps text-admin-secondary border-b border-admin-surface-variant">Tarikh</th>
                                                            <th className="px-6 py-4 font-admin-label-caps text-admin-secondary border-b border-admin-surface-variant">Jumlah</th>
                                                            <th className="px-6 py-4 font-admin-label-caps text-admin-secondary border-b border-admin-surface-variant">Status</th>
                                                        </tr>
                                                    </thead>
                                                    <tbody className="font-admin-data-table text-[#1a1c1c]">
                                                        {allOrders.filter(o => o.user_id === trackingUser.id).map(order => (
                                                            <tr key={order.id} className="hover:bg-admin-surface-container-low transition-colors border-b border-admin-surface-variant">
                                                                <td className="px-6 py-4 font-bold text-[#1a1c1c]">REF-{order.id.toString().split('-')[0].toUpperCase()}</td>
                                                                <td className="px-6 py-4">{new Date(order.created_at).toLocaleDateString()}</td>
                                                                <td className="px-6 py-4 font-bold text-admin-primary">RM{parseFloat(order.total_amount).toFixed(2)}</td>
                                                                <td className="px-6 py-4">
                                                                    <select 
                                                                        value={order.status} 
                                                                        onChange={(e) => handleUpdateOrderStatus(order.id, e.target.value)}
                                                                        className={`px-3 py-1 text-[10px] font-bold uppercase tracking-widest border-0 cursor-pointer outline-none ${
                                                                            order.status === 'completed' 
                                                                            ? 'bg-[#dcfce7] text-green-800' 
                                                                            : order.status === 'shipped'
                                                                            ? 'bg-[#e0f2fe] text-blue-800'
                                                                            : order.status === 'processing'
                                                                            ? 'bg-[#f3e8ff] text-purple-800'
                                                                            : order.status === 'cancelled'
                                                                            ? 'bg-[#fee2e2] text-red-800'
                                                                            : 'bg-[#fef3c7] text-amber-800'
                                                                        }`}
                                                                    >
                                                                        <option value="pending">Pending</option>
                                                                        <option value="processing">Processing</option>
                                                                        <option value="shipped">Shipped</option>
                                                                        <option value="completed">Completed</option>
                                                                        <option value="cancelled">Cancelled</option>
                                                                    </select>
                                                                </td>
                                                            </tr>
                                                        ))}
                                                    </tbody>
                                                </table>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        );
    };

    return (
        <div className="min-h-screen flex flex-col bg-[#fbfbfb] selection:bg-[#8b0000]/10" style={{ fontFamily: 'EB Garamond, serif' }}>
            {view !== 'payment-success' && view !== 'payment-failed' && view !== 'admin' && (
                <UnifiedHeader setView={setView} cartCount={cart.reduce((sum, item) => sum + item.quantity, 0)} user={user} handleLogout={handleLogout} />
            )}

            <main className={`flex-grow ${view === 'payment-success' || view === 'payment-failed' || view === 'admin' ? '' : 'pt-24'}`}>
                {view === 'portal' && <PortalView setView={setView} books={books} />}
                {view === 'catalog' && <StitchDesign setView={setView} books={books} addToCart={addToCart} />}
                {view === 'activation' && <ActivationView />}
                {view === 'archive' && <ArchiveCatalog setView={setView} books={books} addToCart={addToCart} />}
                {view === 'detailed-cart' && <DetailedCartView setView={setView} cart={cart} removeFromCart={removeFromCart} />}
                {view === 'checkout' && CheckoutView()}
                {view === 'login' && <LoginView />}
                {view === 'register' && <RegisterView />}
                {view === '2fa' && <TwoFAView />}
                {view === 'profile' && <ProfileView />}
                {view === 'verify-device' && <DeviceVerificationView />}
                {view === 'payment-gateway' && <PaymentGatewayView />}
                {view === 'payment-success' && <PaymentSuccessView />}
                {view === 'payment-failed' && <PaymentFailedView />}
                {view === 'orders' && <OrdersView />}
                {view === 'admin' && <AdminView />}
            </main>

            {/* The New Sliding Cart Drawer */}
            <CartDrawer 
                isOpen={isCartOpen} 
                setIsOpen={setIsCartOpen} 
                cart={cart} 
                removeFromCart={removeFromCart}
                setView={setView}
            />

            {/* AI Chatbot System */}
            {view !== 'payment-success' && view !== 'payment-failed' && view !== 'admin' && (
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
            )}

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
                                
                                <h4 className="font-label-md text-label-md text-primary uppercase tracking-widest mb-4">Sinopsis / Ringkasan</h4>
                                <p className="font-body-lg text-body-lg text-on-surface-variant leading-relaxed mb-8 italic">
                                    "{summaryModal.summary}"
                                </p>
                                
                                <div className="h-[1px] bg-secondary opacity-20 my-8 w-full"></div>
                                
                                <h4 className="font-label-md text-label-md text-primary uppercase tracking-widest mb-6">Edition Details</h4>
                                <ul className="space-y-4 mb-8">
                                    <li className="flex justify-between border-b border-outline-variant/30 pb-4">
                                        <span className="font-body-md text-on-surface-variant">Format</span>
                                        <span className="font-label-md text-label-md text-on-surface">Kulit Keras</span>
                                    </li>
                                    <li className="flex justify-between border-b border-outline-variant/30 pb-4">
                                        <span className="font-body-md text-on-surface-variant">Penerbit</span>
                                        <span className="font-label-md text-label-md text-on-surface">Tarbiah Sentap</span>
                                    </li>
                                    <li className="flex justify-between border-b border-outline-variant/30 pb-4">
                                        <span className="font-body-md text-on-surface-variant">Bahasa</span>
                                        <span className="font-label-md text-label-md text-on-surface">Bahasa Melayu</span>
                                    </li>
                                </ul>
                            </div>
                            
                            {/* Bottom Sticky Action Bar inside the Right Side */}
                            <div className="absolute bottom-0 left-0 w-full bg-surface/95 backdrop-blur-md border-t border-outline-variant/20 p-6 md:px-12 flex items-center justify-between z-20">
                                <div className="flex flex-col">
                                    <span className="font-label-sm text-label-sm text-on-surface-variant uppercase tracking-widest mb-1">Harga</span>
                                    <span className="font-headline-md text-headline-md text-primary">RM{summaryModal.book.price.toFixed(2)}</span>
                                </div>
                                <button 
                                    onClick={() => {
                                        addToCart(summaryModal.book);
                                        setSummaryModal({ isOpen: false, book: null, summary: '', loading: false });
                                    }}
                                    className="bg-[#8b0000] text-white px-8 py-4 font-label-md text-label-md uppercase tracking-widest hover:bg-surface hover:text-[#8b0000] border border-transparent hover:border-[#8b0000] transition-all duration-300 flex items-center gap-3"
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
