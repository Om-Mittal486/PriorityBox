import { useState, useEffect, useCallback, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import clsx from 'clsx';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { useSocket } from '../context/SocketContext';
import Navbar from '../components/Navbar';
import SenderManager from '../components/SenderManager';
import EmailList from '../components/EmailList';
import EmailModal from '../components/EmailModal';
import SentList from '../components/SentList';
import SentModal from '../components/SentModal';
import LoadingSpinner from '../components/LoadingSpinner';
import api from '../services/api';
import { HiOutlineRefresh, HiOutlineCheckCircle, HiOutlineInbox, HiOutlinePaperAirplane } from 'react-icons/hi';

// Notification sound (base64 encoded short beep)
const NOTIFICATION_SOUND = 'data:audio/wav;base64,UklGRl9vT19teleVmZXQAAAABAAEAIlYAAEhYAAABAAgAZGF0YU0AAAB/f39/f39/f39/f39/f39/f39/f39/f39/f39/';

const Dashboard = () => {
    const { user, loading: authLoading } = useAuth();
    const { isDark } = useTheme();
    const { socket } = useSocket();
    const navigate = useNavigate();

    const [emails, setEmails] = useState([]);
    const [replies, setReplies] = useState([]);
    const [loading, setLoading] = useState(true);
    const [unreadCount, setUnreadCount] = useState(0);
    const [selectedEmail, setSelectedEmail] = useState(null);
    const [selectedReply, setSelectedReply] = useState(null);
    const [refreshing, setRefreshing] = useState(false);
    const [page, setPage] = useState(1);
    const [pagination, setPagination] = useState(null);
    const [activeTab, setActiveTab] = useState('inbox'); // 'inbox' | 'sent'

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
        setLoading(true);
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

    // Fetch sent replies
    const fetchReplies = useCallback(async (pageNum = 1, append = false) => {
        setLoading(true);
        try {
            const { data } = await api.get(`/emails/replies?page=${pageNum}&limit=20`);
            setReplies(prev => append ? [...prev, ...data.replies] : data.replies);
            setPagination(data.pagination);
        } catch (err) {
            console.error('Failed to fetch replies:', err);
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    }, []);

    useEffect(() => {
        if (user) {
            setPage(1);
            if (activeTab === 'inbox') {
                fetchEmails(1, false);
            } else {
                fetchReplies(1, false);
            }
        }
    }, [user, activeTab, fetchEmails, fetchReplies]);

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
                new Notification('PriorityBox — New Email', {
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
    const handleRefresh = async () => {
        setRefreshing(true);
        try {
            if (activeTab === 'inbox') {
                // Trigger a live Gmail poll and get updated emails
                const { data } = await api.post('/emails/refresh');
                setEmails(data.emails);
                setPagination(data.pagination);
                setUnreadCount(data.unreadCount);
                setPage(1);
            } else {
                await fetchReplies(1, false);
            }
        } catch (err) {
            console.error('Refresh failed:', err);
            // Fallback: just re-fetch from database
            if (activeTab === 'inbox') {
                await fetchEmails(1, false);
            }
        } finally {
            setRefreshing(false);
        }
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
            if (activeTab === 'inbox') {
                fetchEmails(nextPage, true);
            } else {
                fetchReplies(nextPage, true);
            }
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
        <div className={clsx(
            "min-h-screen transition-colors duration-500 relative overflow-hidden",
            isDark ? "bg-[var(--color-neo-dark-bg)] text-white" : "bg-[var(--color-neo-bg)] text-[var(--color-neo-border)]"
        )}>
            {/* Geometric Background Grid (Optional brutalist touch) */}
            <div className={clsx(
                "absolute inset-0 pointer-events-none opacity-[0.03]",
                isDark ? "invert" : ""
            )} style={{ backgroundImage: 'radial-gradient(circle, #000 2px, transparent 2.5px)', backgroundSize: '32px 32px' }}></div>

            <div className="relative z-10 flex flex-col min-h-screen">
                <Navbar unreadCount={unreadCount} />

                <main className="flex-1 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 w-full">
                    <div className="flex flex-col lg:flex-row gap-8">
                        {/* Sidebar — Sender Manager */}
                        <aside className="w-full lg:w-80 shrink-0">
                            <motion.div
                                initial={{ opacity: 0, x: -20 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ duration: 0.5, delay: 0.1 }}
                            >
                                <SenderManager onSenderDeleted={() => fetchEmails(1, false)} />
                            </motion.div>
                        </aside>

                        {/* Main — Email List */}
                        <motion.section
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.5, delay: 0.2 }}
                            className="flex-1 min-w-0"
                        >
                            {/* Tabs & Actions */}
                            <div className={`flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6`}>
                                {/* Tabs */}
                                <div className={clsx(
                                    "relative inline-flex flex-wrap p-1.5 neo-border neo-shadow-sm gap-2",
                                    isDark ? "bg-[#1B1B1B]" : "bg-white"
                                )}>
                                    {[
                                        { id: 'inbox', label: 'Inbox', icon: HiOutlineInbox, count: unreadCount },
                                        { id: 'sent', label: 'Sent', icon: HiOutlinePaperAirplane }
                                    ].map((tab) => (
                                        <button
                                            key={tab.id}
                                            onClick={() => setActiveTab(tab.id)}
                                            className={clsx(
                                                "relative flex items-center gap-2 px-5 py-2.5 text-sm font-black uppercase tracking-wider transition-colors z-10 neo-border",
                                                activeTab === tab.id
                                                    ? isDark ? "bg-[#90A8FF] text-black border-transparent" : "bg-[#FFC900] text-black border-transparent"
                                                    : isDark ? "bg-transparent text-white border-transparent hover:bg-white/10" : "bg-transparent text-black border-transparent hover:bg-black/5"
                                            )}
                                        >
                                            <tab.icon className="w-5 h-5" />
                                            {tab.label}
                                            {tab.id === 'inbox' && tab.count > 0 && (
                                                <span className={clsx(
                                                    "px-2 min-w-[1.5rem] text-center py-0.5 text-[11px] ml-1 transition-colors border-2 border-black",
                                                    activeTab === 'inbox'
                                                        ? 'bg-black text-white'
                                                        : isDark ? 'bg-white text-black' : 'bg-black text-white'
                                                )}>
                                                    {tab.count}
                                                </span>
                                            )}
                                        </button>
                                    ))}
                                </div>

                                <div className="flex items-center gap-3">
                                    {activeTab === 'inbox' && unreadCount > 0 && (
                                        <button
                                            onClick={handleMarkAllRead}
                                            className={clsx(
                                                "flex items-center gap-1.5 px-4 py-2.5 text-xs font-bold uppercase tracking-widest transition-all neo-border neo-shadow-sm neo-active-btn",
                                                isDark ? "bg-[#1B1B1B] text-white" : "bg-white text-black"
                                            )}
                                        >
                                            <HiOutlineCheckCircle className="w-5 h-5" />
                                            Mark all read
                                        </button>
                                    )}
                                    <button
                                        onClick={handleRefresh}
                                        disabled={refreshing}
                                        className={clsx(
                                            "flex items-center gap-1.5 px-4 py-2.5 text-xs font-bold uppercase tracking-widest transition-all neo-border neo-shadow-sm neo-active-btn",
                                            isDark ? "bg-[#1B1B1B] text-white" : "bg-[#90A8FF] text-black"
                                        )}
                                    >
                                        <HiOutlineRefresh className={`w-5 h-5 ${refreshing ? 'animate-spin' : ''}`} />
                                        Refresh
                                    </button>
                                </div>
                            </div>

                            {/* List Area */}
                            <AnimatePresence mode="wait">
                                <motion.div
                                    key={activeTab}
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    exit={{ opacity: 0, y: -10 }}
                                    transition={{ duration: 0.2 }}
                                >
                                    {activeTab === 'inbox' ? (
                                        <EmailList
                                            emails={emails}
                                            loading={loading}
                                            onEmailClick={handleEmailClick}
                                            onToggleRead={handleToggleRead}
                                        />
                                    ) : (
                                        <SentList
                                            replies={replies}
                                            loading={loading}
                                            onReplyClick={setSelectedReply}
                                        />
                                    )}
                                </motion.div>
                            </AnimatePresence>

                            {/* Load more */}
                            {pagination && page < pagination.pages && (
                                <div className="text-center mt-10">
                                    <button
                                        onClick={handleLoadMore}
                                        className={clsx(
                                            "px-8 py-4 text-sm font-black uppercase tracking-widest transition-all neo-border neo-shadow neo-active-btn",
                                            isDark ? "bg-[#EAE6DF] text-black" : "bg-[#FF90E8] text-black",
                                            "hover:-translate-y-1"
                                        )}
                                    >
                                        Load more {activeTab === 'inbox' ? 'emails' : 'replies'}
                                    </button>
                                </div>
                            )}
                        </motion.section>
                    </div>
                </main>

                {/* Email Modal */}
                <AnimatePresence>
                    {selectedEmail && (
                        <EmailModal
                            email={selectedEmail}
                            onClose={() => setSelectedEmail(null)}
                            onToggleRead={handleToggleRead}
                        />
                    )}

                    {/* Sent Modal */}
                    {selectedReply && (
                        <SentModal
                            reply={selectedReply}
                            onClose={() => setSelectedReply(null)}
                        />
                    )}
                </AnimatePresence>
            </div>
        </div>
    );
};

export default Dashboard;
