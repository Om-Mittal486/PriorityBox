import { useState, useEffect, useCallback, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { useSocket } from '../context/SocketContext';
import Navbar from '../components/Navbar';
import SenderManager from '../components/SenderManager';
import EmailList from '../components/EmailList';
import EmailModal from '../components/EmailModal';
import LoadingSpinner from '../components/LoadingSpinner';
import api from '../services/api';
import { HiOutlineRefresh, HiOutlineCheckCircle, HiOutlineInbox } from 'react-icons/hi';

// Notification sound (base64 encoded short beep)
const NOTIFICATION_SOUND = 'data:audio/wav;base64,UklGRl9vT19teleVmZXQAAAABAAEAIlYAAEhYAAABAAgAZGF0YU0AAAB/f39/f39/f39/f39/f39/f39/f39/f39/f39/';

const Dashboard = () => {
    const { user, loading: authLoading } = useAuth();
    const { isDark } = useTheme();
    const { socket } = useSocket();
    const navigate = useNavigate();

    const [emails, setEmails] = useState([]);
    const [loading, setLoading] = useState(true);
    const [unreadCount, setUnreadCount] = useState(0);
    const [selectedEmail, setSelectedEmail] = useState(null);
    const [refreshing, setRefreshing] = useState(false);
    const [page, setPage] = useState(1);
    const [pagination, setPagination] = useState(null);

    const notificationAudioRef = useRef(null);

    // Redirect if not logged in
    useEffect(() => {
        if (!authLoading && !user) navigate('/login', { replace: true });
    }, [user, authLoading, navigate]);

    // Create notification audio
    useEffect(() => {
        notificationAudioRef.current = new Audio(NOTIFICATION_SOUND);
        notificationAudioRef.current.volume = 0.3;
    }, []);

    // Fetch emails
    const fetchEmails = useCallback(async (pageNum = 1, append = false) => {
        try {
            const { data } = await api.get(`/emails?page=${pageNum}&limit=20`);
            setEmails(prev => append ? [...prev, ...data.emails] : data.emails);
            setPagination(data.pagination);
            setUnreadCount(data.unreadCount);
        } catch (err) {
            console.error('Failed to fetch emails:', err);
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    }, []);

    useEffect(() => {
        if (user) fetchEmails();
    }, [user, fetchEmails]);

    // Real-time email updates via Socket.io
    useEffect(() => {
        if (!socket) return;

        const handleNewEmail = (data) => {
            setEmails(prev => [data.email, ...prev]);
            setUnreadCount(prev => prev + 1);

            // Play notification sound
            try {
                notificationAudioRef.current?.play().catch(() => { });
            } catch (e) { }

            // Browser notification
            if (Notification.permission === 'granted') {
                new Notification('MailWatch — New Email', {
                    body: `From: ${data.email.fromName || data.email.from}\n${data.email.subject}`,
                    icon: '/vite.svg',
                });
            }
        };

        socket.on('new-email', handleNewEmail);
        return () => socket.off('new-email', handleNewEmail);
    }, [socket]);

    // Request notification permission
    useEffect(() => {
        if ('Notification' in window && Notification.permission === 'default') {
            Notification.requestPermission();
        }
    }, []);

    // Handlers
    const handleRefresh = () => {
        setRefreshing(true);
        fetchEmails(1, false);
    };

    const handleToggleRead = async (emailId) => {
        try {
            const { data } = await api.patch(`/emails/${emailId}/read`);
            setEmails(prev => prev.map(e => e._id === emailId ? data.email : e));
            setUnreadCount(data.unreadCount);
            if (selectedEmail?._id === emailId) {
                setSelectedEmail(data.email);
            }
        } catch (err) {
            console.error('Failed to toggle read status:', err);
        }
    };

    const handleMarkAllRead = async () => {
        try {
            await api.patch('/emails/mark-all-read');
            setEmails(prev => prev.map(e => ({ ...e, isRead: true })));
            setUnreadCount(0);
        } catch (err) {
            console.error('Failed to mark all as read:', err);
        }
    };

    const handleLoadMore = () => {
        if (pagination && page < pagination.pages) {
            const nextPage = page + 1;
            setPage(nextPage);
            fetchEmails(nextPage, true);
        }
    };

    const handleEmailClick = (email) => {
        setSelectedEmail(email);
        if (!email.isRead) {
            handleToggleRead(email._id);
        }
    };

    if (authLoading) {
        return <LoadingSpinner size="lg" text="Loading..." />;
    }

    if (!user) return null;

    return (
        <div className={`min-h-screen transition-colors duration-300 ${isDark ? 'bg-dark-950' : 'bg-dark-50'}`}>
            <Navbar unreadCount={unreadCount} />

            <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
                <div className="flex flex-col lg:flex-row gap-6">
                    {/* Sidebar — Sender Manager */}
                    <aside className="w-full lg:w-80 shrink-0">
                        <SenderManager />
                    </aside>

                    {/* Main — Email List */}
                    <section className="flex-1 min-w-0">
                        {/* Email header */}
                        <div className={`flex items-center justify-between mb-4`}>
                            <div className="flex items-center gap-3">
                                <HiOutlineInbox className={`w-6 h-6 ${isDark ? 'text-primary-400' : 'text-primary-600'}`} />
                                <h2 className={`text-xl font-bold ${isDark ? 'text-white' : 'text-dark-900'}`}>Inbox</h2>
                                {unreadCount > 0 && (
                                    <span className="px-2.5 py-1 rounded-full bg-primary-500/10 text-primary-500 text-xs font-bold">
                                        {unreadCount} new
                                    </span>
                                )}
                            </div>

                            <div className="flex items-center gap-2">
                                {unreadCount > 0 && (
                                    <button
                                        onClick={handleMarkAllRead}
                                        className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-medium transition-colors ${isDark ? 'bg-dark-800 text-dark-300 hover:bg-dark-700' : 'bg-white text-dark-600 hover:bg-dark-100 border border-dark-200'}`}
                                    >
                                        <HiOutlineCheckCircle className="w-4 h-4" />
                                        Mark all read
                                    </button>
                                )}
                                <button
                                    onClick={handleRefresh}
                                    disabled={refreshing}
                                    className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-medium transition-all ${isDark ? 'bg-dark-800 text-dark-300 hover:bg-dark-700' : 'bg-white text-dark-600 hover:bg-dark-100 border border-dark-200'}`}
                                >
                                    <HiOutlineRefresh className={`w-4 h-4 ${refreshing ? 'animate-spin' : ''}`} />
                                    Refresh
                                </button>
                            </div>
                        </div>

                        {/* Email list */}
                        <EmailList
                            emails={emails}
                            loading={loading}
                            onEmailClick={handleEmailClick}
                            onToggleRead={handleToggleRead}
                        />

                        {/* Load more */}
                        {pagination && page < pagination.pages && (
                            <div className="text-center mt-6">
                                <button
                                    onClick={handleLoadMore}
                                    className={`px-6 py-2.5 rounded-xl text-sm font-medium transition-all ${isDark ? 'bg-dark-800 text-dark-300 hover:bg-dark-700' : 'bg-white text-dark-600 hover:bg-dark-100 border border-dark-200'}`}
                                >
                                    Load more emails
                                </button>
                            </div>
                        )}
                    </section>
                </div>
            </main>

            {/* Email Modal */}
            {selectedEmail && (
                <EmailModal
                    email={selectedEmail}
                    onClose={() => setSelectedEmail(null)}
                    onToggleRead={handleToggleRead}
                />
            )}
        </div>
    );
};

export default Dashboard;
