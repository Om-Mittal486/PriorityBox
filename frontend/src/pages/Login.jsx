import { useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { HiOutlineMail, HiOutlineShieldCheck, HiOutlineBell, HiOutlineLightningBolt } from 'react-icons/hi';
import clsx from 'clsx';

const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
        opacity: 1,
        transition: {
            staggerChildren: 0.15,
            delayChildren: 0.2,
        },
    },
};

const itemVariants = {
    hidden: { opacity: 0, y: 30 },
    visible: {
        opacity: 1,
        y: 0,
        transition: { type: 'spring', stiffness: 300, damping: 24 },
    },
};

const floatingVariants = {
    animate: {
        y: [0, -15, 0],
        transition: {
            duration: 4,
            repeat: Infinity,
            ease: "easeInOut"
        }
    }
};

const Login = () => {
    const { user, loginWithGoogle, loginWithToken, loading, error } = useAuth();
    const { isDark, toggleTheme } = useTheme();
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();

    // Eliminated automatic redirect for logged in users so they can see the landing page
    // if they navigate to it.

    // Handle OAuth callback token
    useEffect(() => {
        const token = searchParams.get('token');
        if (token) {
            loginWithToken(token);
            navigate('/dashboard', { replace: true });
        }
    }, [searchParams, loginWithToken, navigate]);

    const features = [
        { icon: <HiOutlineMail className="w-6 h-6" />, title: 'Smart Monitoring', desc: 'Track emails from specific senders in real-time, right into your personalized dashboard.' },
        { icon: <HiOutlineBell className="w-6 h-6" />, title: 'Instant Alerts', desc: 'Get notified the moment important emails arrive via real-time WebSocket connections.' },
        { icon: <HiOutlineLightningBolt className="w-6 h-6" />, title: 'In-App Replies', desc: 'Respond instantly without ever leaving the app, with seamless threaded conversations.' },
        { icon: <HiOutlineShieldCheck className="w-6 h-6" />, title: 'Secure & Private', desc: 'State-of-the-art OAuth 2.0 login with fully encrypted JWT token storage.' },
    ];

    if (loading) {
        return (
            <div className={`min-h-screen flex items-center justify-center ${isDark ? 'bg-dark-950' : 'bg-dark-50'}`}>
                <div className="w-12 h-12 border-4 border-primary-500/30 border-t-primary-500 rounded-full animate-spin"></div>
            </div>
        );
    }

    return (
        <div className={clsx(
            "relative min-h-screen flex flex-col overflow-hidden transition-colors duration-500",
            isDark ? "bg-[var(--color-neo-dark-bg)] text-white" : "bg-[var(--color-neo-bg)] text-[var(--color-neo-border)]"
        )}>
            {/* Geometric Background Grid (Optional brutalist touch) */}
            <div className={clsx(
                "absolute inset-0 pointer-events-none opacity-[0.03]",
                isDark ? "invert" : ""
            )} style={{ backgroundImage: 'radial-gradient(circle, #000 2px, transparent 2.5px)', backgroundSize: '32px 32px' }}></div>

            {/* Header */}
            <header className="relative z-10 p-6 flex items-center justify-between max-w-7xl mx-auto w-full border-b-[3px] border-black dark:border-white/10">
                <div className="flex items-center gap-3 cursor-pointer" onClick={() => navigate('/')}>
                    <div className="flex items-center justify-center w-12 h-12 bg-[#FFC900] neo-border neo-shadow-sm rotate-[-3deg]">
                        <HiOutlineMail className="w-7 h-7 text-black" />
                    </div>
                    <span className="text-3xl font-black tracking-tighter uppercase ml-2">
                        Priority<span className="text-[#FF90E8]">Box</span>
                    </span>
                </div>

                <motion.button
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                    onClick={toggleTheme}
                    className={clsx(
                        "w-12 h-12 flex items-center justify-center neo-border neo-shadow-sm neo-active-btn transition-transform",
                        isDark ? "bg-[#1B1B1B] text-yellow-400" : "bg-white text-black"
                    )}
                >
                    {isDark ? '☀️' : '🌙'}
                </motion.button>
            </header>

            {/* Main Content */}
            <main className="relative z-10 flex-1 flex flex-col items-center justify-center px-4 py-16 max-w-screen-xl mx-auto w-full">
                <div className="grid lg:grid-cols-2 gap-16 lg:gap-24 items-center w-full">

                    {/* Left Column - Hero */}
                    <motion.div
                        variants={containerVariants}
                        initial="hidden"
                        animate="visible"
                        className="flex flex-col max-w-2xl"
                    >
                        <motion.div variants={itemVariants} className="inline-flex items-center gap-2 px-4 py-2 bg-[#90A8FF] text-black neo-border neo-shadow-sm font-bold w-fit mb-8 uppercase tracking-widest text-xs rotate-[-1deg]">
                            <span className="w-2.5 h-2.5 rounded-full bg-black animate-pulse"></span>
                            PriorityBox v2.0
                        </motion.div>

                        <motion.h1 variants={itemVariants} className="text-6xl lg:text-8xl font-black tracking-tighter leading-[0.95] mb-8 uppercase">
                            Monitor <br />
                            <span className={clsx("inline-block mt-2 px-2 bg-[#FF90E8] text-black neo-border rotate-1")}>Emails.</span><br />
                            Respond fast.
                        </motion.h1>

                        <motion.p variants={itemVariants} className="text-xl lg:text-2xl font-medium leading-relaxed mb-10 max-w-xl border-l-[6px] border-[#FFC900] pl-6 py-2 bg-white/5">
                            The brute-force monitoring dashboard for tracking high-priority senders. Never miss an important thread.
                        </motion.p>

                        <motion.div variants={itemVariants} className="flex flex-col sm:flex-row gap-4">
                            {user ? (
                                <button
                                    onClick={() => navigate('/dashboard')}
                                    className={clsx(
                                        "group relative flex items-center justify-center gap-4 px-8 py-5 font-black text-xl uppercase tracking-wider",
                                        "bg-[#FFC900] text-black neo-border neo-shadow neo-active-btn"
                                    )}
                                >
                                    <span>Go to Dashboard!</span>
                                    <svg className="w-6 h-6 ml-2 group-hover:translate-x-1 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M14 5l7 7m0 0l-7 7m7-7H3" />
                                    </svg>
                                </button>
                            ) : (
                                <button
                                    onClick={loginWithGoogle}
                                    className={clsx(
                                        "group relative flex items-center justify-center gap-4 px-8 py-5 font-black text-xl uppercase tracking-wider",
                                        "bg-white text-black neo-border neo-shadow neo-active-btn"
                                    )}
                                >
                                    <svg className="w-7 h-7" viewBox="0 0 24 24">
                                        <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" />
                                        <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                                        <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
                                        <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
                                    </svg>
                                    <span>Sign in with Google</span>
                                </button>
                            )}
                        </motion.div>

                        {error && (
                            <motion.div
                                initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
                                className="mt-6 p-4 rounded-2xl bg-red-500/10 border border-red-500/20 text-red-500 text-sm max-w-md font-medium"
                            >
                                {error}
                            </motion.div>
                        )}
                    </motion.div>

                    {/* Right Column - Features Grid */}
                    <motion.div
                        variants={containerVariants}
                        initial="hidden"
                        animate="visible"
                        className="grid sm:grid-cols-2 gap-6 relative"
                    >
                        {features.map((f, i) => {
                            const colors = ['bg-[#FFC900]', 'bg-[#90A8FF]', 'bg-[#FF90E8]', 'bg-[#23A094]'];
                            const bgColor = colors[i % colors.length];

                            return (
                                <motion.div
                                    key={i}
                                    variants={itemVariants}
                                    className={clsx(
                                        "p-6 neo-border neo-shadow neo-hover-card flex flex-col justify-between",
                                        isDark ? "bg-[#1B1B1B]" : "bg-white",
                                        i % 2 === 0 ? "rotate-1" : "-rotate-1"
                                    )}
                                >
                                    <div className={clsx(
                                        "w-14 h-14 flex items-center justify-center mb-6 neo-border neo-shadow-sm text-black shadow-black",
                                        bgColor
                                    )}>
                                        {f.icon}
                                    </div>
                                    <h3 className="font-black text-xl mb-3 uppercase tracking-wide">
                                        {f.title}
                                    </h3>
                                    <p className="text-base font-medium leading-relaxed opacity-90 border-t-2 border-black/10 dark:border-white/10 pt-3">
                                        {f.desc}
                                    </p>
                                </motion.div>
                            );
                        })}
                    </motion.div>
                </div>
            </main>

            {/* Footer */}
            <motion.footer
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 1 }}
                className="relative z-10 text-center py-8 text-sm font-bold uppercase tracking-widest border-t-[3px] border-black dark:border-white/10 mt-auto"
            >
                © {new Date().getFullYear()} PriorityBox Labs.
            </motion.footer>
        </div>
    );
};

export default Login;
