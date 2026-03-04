import { useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { HiOutlineMail, HiOutlineShieldCheck, HiOutlineBell, HiOutlineLightningBolt } from 'react-icons/hi';

const Login = () => {
    const { user, loginWithGoogle, loginWithToken, loading, error } = useAuth();
    const { isDark, toggleTheme } = useTheme();
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();

    // If already logged in, redirect to dashboard
    useEffect(() => {
        if (user) navigate('/dashboard', { replace: true });
    }, [user, navigate]);

    // Handle OAuth callback token
    useEffect(() => {
        const token = searchParams.get('token');
        if (token) {
            loginWithToken(token);
            navigate('/dashboard', { replace: true });
        }
    }, [searchParams, loginWithToken, navigate]);

    const features = [
        { icon: <HiOutlineMail className="w-6 h-6" />, title: 'Smart Monitoring', desc: 'Track emails from specific senders in real-time' },
        { icon: <HiOutlineBell className="w-6 h-6" />, title: 'Instant Alerts', desc: 'Get notified the moment important emails arrive' },
        { icon: <HiOutlineShieldCheck className="w-6 h-6" />, title: 'Secure & Private', desc: 'OAuth 2.0 login with encrypted token storage' },
        { icon: <HiOutlineLightningBolt className="w-6 h-6" />, title: 'Real-time Dashboard', desc: 'Beautiful live dashboard with dark & light mode' },
    ];

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="w-10 h-10 border-4 border-primary-500 border-t-transparent rounded-full animate-spin"></div>
            </div>
        );
    }

    return (
        <div className={`min-h-screen flex flex-col ${isDark ? 'bg-dark-950' : 'bg-gradient-to-br from-primary-50 via-white to-primary-100'}`}>
            {/* Theme toggle */}
            <button
                onClick={toggleTheme}
                className={`absolute top-6 right-6 p-2.5 rounded-xl transition-all duration-300 ${isDark ? 'bg-dark-800 text-yellow-400 hover:bg-dark-700' : 'bg-white text-dark-600 hover:bg-dark-100 shadow-md'}`}
            >
                {isDark ? '☀️' : '🌙'}
            </button>

            <div className="flex-1 flex items-center justify-center px-4 py-12">
                <div className="w-full max-w-md animate-fade-in">
                    {/* Logo & Title */}
                    <div className="text-center mb-10">
                        <div className={`inline-flex items-center justify-center w-20 h-20 rounded-2xl mb-6 ${isDark ? 'bg-gradient-to-br from-primary-600 to-primary-800' : 'bg-gradient-to-br from-primary-500 to-primary-700'} shadow-xl shadow-primary-500/25`}>
                            <HiOutlineMail className="w-10 h-10 text-white" />
                        </div>
                        <h1 className={`text-4xl font-bold mb-3 ${isDark ? 'text-white' : 'text-dark-900'}`}>
                            Mail<span className="text-primary-500">Watch</span>
                        </h1>
                        <p className={`text-lg ${isDark ? 'text-dark-400' : 'text-dark-500'}`}>
                            Monitor your important emails in real-time
                        </p>
                    </div>

                    {/* Login Card */}
                    <div className={`rounded-2xl p-8 ${isDark ? 'bg-dark-900/80 border border-dark-700' : 'bg-white shadow-xl shadow-dark-200/50 border border-dark-100'}`}>
                        {error && (
                            <div className="mb-6 p-4 rounded-xl bg-red-500/10 border border-red-500/20 text-red-500 text-sm text-center">
                                {error}
                            </div>
                        )}

                        <button
                            onClick={loginWithGoogle}
                            className="w-full flex items-center justify-center gap-3 py-3.5 px-6 rounded-xl font-semibold transition-all duration-300 bg-white text-dark-800 border border-dark-200 hover:border-dark-300 hover:shadow-lg hover:-translate-y-0.5 active:translate-y-0"
                        >
                            <svg className="w-5 h-5" viewBox="0 0 24 24">
                                <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" />
                                <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                                <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
                                <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
                            </svg>
                            Sign in with Google
                        </button>

                        <div className="mt-6 flex items-center gap-3">
                            <div className={`flex-1 h-px ${isDark ? 'bg-dark-700' : 'bg-dark-200'}`}></div>
                            <span className={`text-xs uppercase tracking-wider ${isDark ? 'text-dark-500' : 'text-dark-400'}`}>secured by OAuth 2.0</span>
                            <div className={`flex-1 h-px ${isDark ? 'bg-dark-700' : 'bg-dark-200'}`}></div>
                        </div>
                    </div>

                    {/* Features */}
                    <div className="grid grid-cols-2 gap-4 mt-10">
                        {features.map((f, i) => (
                            <div
                                key={i}
                                className={`p-4 rounded-xl transition-all duration-300 hover:-translate-y-1 ${isDark ? 'bg-dark-900/50 border border-dark-800 hover:border-dark-600' : 'bg-white/80 border border-dark-100 hover:shadow-md'}`}
                            >
                                <div className="text-primary-500 mb-2">{f.icon}</div>
                                <h3 className={`font-semibold text-sm mb-1 ${isDark ? 'text-white' : 'text-dark-800'}`}>{f.title}</h3>
                                <p className={`text-xs ${isDark ? 'text-dark-400' : 'text-dark-500'}`}>{f.desc}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            {/* Footer */}
            <div className={`text-center py-6 text-sm ${isDark ? 'text-dark-500' : 'text-dark-400'}`}>
                © {new Date().getFullYear()} MailWatch — Your email, your rules.
            </div>
        </div>
    );
};

export default Login;
