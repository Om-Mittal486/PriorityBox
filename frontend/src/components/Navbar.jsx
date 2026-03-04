import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { useSocket } from '../context/SocketContext';
import { HiOutlineMail, HiOutlineBell, HiOutlineSun, HiOutlineMoon, HiOutlineLogout, HiOutlineStatusOnline } from 'react-icons/hi';

const Navbar = ({ unreadCount }) => {
    const { user, logout } = useAuth();
    const { isDark, toggleTheme } = useTheme();
    const { connected } = useSocket();

    return (
        <nav className={`sticky top-0 z-50 glass border-b transition-colors duration-300 ${isDark ? 'bg-dark-900/70 border-dark-700' : 'bg-white/70 border-dark-200'}`}>
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex items-center justify-between h-16">
                    {/* Logo */}
                    <div className="flex items-center gap-3">
                        <div className="flex items-center justify-center w-9 h-9 rounded-lg bg-gradient-to-br from-primary-500 to-primary-700 shadow-lg shadow-primary-500/20">
                            <HiOutlineMail className="w-5 h-5 text-white" />
                        </div>
                        <span className={`text-xl font-bold ${isDark ? 'text-white' : 'text-dark-900'}`}>
                            Mail<span className="text-primary-500">Watch</span>
                        </span>
                    </div>

                    {/* Right side */}
                    <div className="flex items-center gap-2">
                        {/* Connection status */}
                        <div className={`hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium ${connected ? 'bg-emerald-500/10 text-emerald-500' : 'bg-red-500/10 text-red-500'}`}>
                            <HiOutlineStatusOnline className="w-3.5 h-3.5" />
                            {connected ? 'Live' : 'Offline'}
                        </div>

                        {/* Notifications */}
                        <button className={`relative p-2.5 rounded-xl transition-all duration-200 ${isDark ? 'hover:bg-dark-800 text-dark-300' : 'hover:bg-dark-100 text-dark-600'}`}>
                            <HiOutlineBell className="w-5 h-5" />
                            {unreadCount > 0 && (
                                <span className="absolute -top-0.5 -right-0.5 flex items-center justify-center min-w-[20px] h-5 px-1.5 rounded-full bg-red-500 text-white text-xs font-bold animate-pulse-glow">
                                    {unreadCount > 99 ? '99+' : unreadCount}
                                </span>
                            )}
                        </button>

                        {/* Theme toggle */}
                        <button
                            onClick={toggleTheme}
                            className={`p-2.5 rounded-xl transition-all duration-200 ${isDark ? 'hover:bg-dark-800 text-yellow-400' : 'hover:bg-dark-100 text-dark-600'}`}
                        >
                            {isDark ? <HiOutlineSun className="w-5 h-5" /> : <HiOutlineMoon className="w-5 h-5" />}
                        </button>

                        {/* User */}
                        <div className={`hidden sm:flex items-center gap-2.5 pl-3 ml-1 border-l ${isDark ? 'border-dark-700' : 'border-dark-200'}`}>
                            {user?.avatar ? (
                                <img src={user.avatar} alt={user.name} className="w-8 h-8 rounded-full ring-2 ring-primary-500/30" />
                            ) : (
                                <div className="w-8 h-8 rounded-full bg-primary-500 flex items-center justify-center text-white text-sm font-bold">
                                    {user?.name?.charAt(0) || '?'}
                                </div>
                            )}
                            <span className={`text-sm font-medium truncate max-w-[120px] ${isDark ? 'text-dark-200' : 'text-dark-700'}`}>
                                {user?.name}
                            </span>
                        </div>

                        {/* Logout */}
                        <button
                            onClick={logout}
                            title="Logout"
                            className={`p-2.5 rounded-xl transition-all duration-200 ${isDark ? 'hover:bg-red-500/10 text-dark-400 hover:text-red-400' : 'hover:bg-red-50 text-dark-500 hover:text-red-500'}`}
                        >
                            <HiOutlineLogout className="w-5 h-5" />
                        </button>
                    </div>
                </div>
            </div>
        </nav>
    );
};

export default Navbar;
