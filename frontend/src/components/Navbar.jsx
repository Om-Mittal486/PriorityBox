import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { useSocket } from '../context/SocketContext';
import { HiOutlineMail, HiOutlineBell, HiOutlineSun, HiOutlineMoon, HiOutlineLogout, HiOutlineStatusOnline } from 'react-icons/hi';
import clsx from 'clsx';

const Navbar = ({ unreadCount }) => {
    const { user, logout } = useAuth();
    const { isDark, toggleTheme } = useTheme();
    const { connected } = useSocket();

    return (
        <nav className={clsx(
            "sticky top-0 z-50 transition-colors duration-300 border-b-[3px] border-black dark:border-white/20",
            isDark ? "bg-[var(--color-neo-dark-bg)]" : "bg-[#white]"
        )}>
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex items-center justify-between h-16">
                    {/* Logo */}
                    <Link to="/" className="flex items-center gap-3 group cursor-pointer hover:opacity-80 transition-opacity">
                        <div className="flex items-center justify-center w-10 h-10 bg-[#FFC900] neo-border neo-shadow-sm rotate-[-3deg] group-hover:rotate-0 transition-transform">
                            <HiOutlineMail className="w-5 h-5 text-black" />
                        </div>
                        <span className={`text-2xl font-black tracking-tighter uppercase ${isDark ? 'text-white' : 'text-[var(--color-neo-border)]'}`}>
                            Priority<span className="text-[#FF90E8]">Box</span>
                        </span>
                    </Link>

                    {/* Right side */}
                    <div className="flex items-center gap-2">
                        {/* Connection status */}
                        <div className={`hidden sm:flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold uppercase tracking-widest neo-border ${connected ? 'bg-[#90A8FF] text-black border-black' : 'bg-[#FF90E8] text-black border-black'}`}>
                            <HiOutlineStatusOnline className="w-3.5 h-3.5" />
                            {connected ? 'Live' : 'Offline'}
                        </div>

                        {/* Notifications */}
                        <button className={`relative p-2.5 transition-all duration-200 neo-border neo-shadow-sm neo-active-btn ml-2 ${isDark ? 'bg-[#1B1B1B] text-white hover:bg-neutral-800' : 'bg-white text-black hover:bg-neutral-100'}`}>
                            <HiOutlineBell className="w-5 h-5" />
                            {unreadCount > 0 && (
                                <span className="absolute -top-1.5 -right-1.5 flex items-center justify-center min-w-[20px] h-5 px-1.5 bg-[#FFC900] text-black neo-border text-xs font-black">
                                    {unreadCount > 99 ? '99+' : unreadCount}
                                </span>
                            )}
                        </button>

                        {/* Theme toggle */}
                        <button
                            onClick={toggleTheme}
                            className={`p-2.5 transition-all duration-200 neo-border neo-shadow-sm neo-active-btn ml-2 ${isDark ? 'bg-[#1B1B1B] text-yellow-400 hover:bg-neutral-800' : 'bg-white text-black hover:bg-neutral-100'}`}
                        >
                            {isDark ? <HiOutlineSun className="w-5 h-5" /> : <HiOutlineMoon className="w-5 h-5" />}
                        </button>

                        {/* User */}
                        <div className={`hidden sm:flex items-center gap-2.5 pl-4 ml-4 border-l-2 ${isDark ? 'border-white/20' : 'border-black'}`}>
                            {user?.avatar ? (
                                <img src={user.avatar} alt={user.name} className="w-9 h-9 neo-border" />
                            ) : (
                                <div className="w-9 h-9 bg-[#23A094] flex items-center justify-center text-black text-sm font-black neo-border">
                                    {user?.name?.charAt(0) || '?'}
                                </div>
                            )}
                            <span className={`text-sm font-black uppercase tracking-wider truncate max-w-[120px] ${isDark ? 'text-white' : 'text-black'}`}>
                                {user?.name}
                            </span>
                        </div>

                        {/* Logout */}
                        <button
                            onClick={logout}
                            title="Logout"
                            className={`p-2.5 transition-all duration-200 neo-border neo-shadow-sm neo-active-btn ml-4 ${isDark ? 'bg-[#FF90E8] text-black border-black' : 'bg-[#FF90E8] text-black border-black'}`}
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
