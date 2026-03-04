import { useState, useEffect } from 'react';
import { useTheme } from '../context/ThemeContext';
import { HiOutlineX, HiOutlineMail, HiOutlineMailOpen, HiOutlineClock, HiOutlineUser, HiOutlineReply, HiOutlineCheck } from 'react-icons/hi';
import api from '../services/api';

const EmailModal = ({ email, onClose, onToggleRead }) => {
    const { isDark } = useTheme();
    const [showReply, setShowReply] = useState(false);
    const [replyBody, setReplyBody] = useState('');
    const [sending, setSending] = useState(false);
    const [replyStatus, setReplyStatus] = useState(null); // 'success' | 'error' | null
    const [replyError, setReplyError] = useState('');

    // Close on Escape key
    useEffect(() => {
        const handleEsc = (e) => {
            if (e.key === 'Escape') {
                if (showReply) {
                    setShowReply(false);
                } else {
                    onClose();
                }
            }
        };
        window.addEventListener('keydown', handleEsc);
        return () => window.removeEventListener('keydown', handleEsc);
    }, [onClose, showReply]);

    // Prevent body scroll
    useEffect(() => {
        document.body.style.overflow = 'hidden';
        return () => { document.body.style.overflow = ''; };
    }, []);

    if (!email) return null;

    const formatDate = (dateStr) => {
        return new Date(dateStr).toLocaleString('en-US', {
            weekday: 'long',
            year: 'numeric',
            month: 'long',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
        });
    };

    const handleSendReply = async () => {
        if (!replyBody.trim()) return;
        setSending(true);
        setReplyStatus(null);
        setReplyError('');

        try {
            await api.post(`/emails/${email._id}/reply`, { body: replyBody });
            setReplyStatus('success');
            setReplyBody('');
            // Auto-hide success after 3 seconds
            setTimeout(() => {
                setShowReply(false);
                setReplyStatus(null);
            }, 2500);
        } catch (err) {
            setReplyStatus('error');
            setReplyError(err.response?.data?.message || 'Failed to send reply');
        } finally {
            setSending(false);
        }
    };

    const handleCancelReply = () => {
        setShowReply(false);
        setReplyBody('');
        setReplyStatus(null);
        setReplyError('');
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            {/* Backdrop */}
            <div
                className="absolute inset-0 bg-black/60 backdrop-blur-sm"
                onClick={onClose}
            />

            {/* Modal */}
            <div className={`relative w-full max-w-2xl max-h-[85vh] overflow-hidden flex flex-col animate-fade-in neo-border neo-shadow transition-colors duration-300 ${isDark ? 'bg-[#1B1B1B] text-white' : 'bg-white text-black'}`}>
                {/* Header */}
                <div className={`sticky top-0 z-10 flex items-start justify-between p-6 border-b-[3px] transition-colors ${isDark ? 'border-white/10 bg-[#1B1B1B]' : 'border-black bg-white'}`}>
                    <div className="flex-1 min-w-0 pr-4">
                        <h2 className={`text-lg font-bold mb-2 ${isDark ? 'text-white' : 'text-dark-900'}`}>
                            {email.subject}
                        </h2>
                        <div className="flex flex-wrap items-center gap-x-4 gap-y-1.5">
                            <div className="flex items-center gap-1.5">
                                <HiOutlineUser className={`w-4 h-4 ${isDark ? 'text-dark-400' : 'text-dark-500'}`} />
                                <span className={`text-sm font-bold ${isDark ? 'text-dark-300' : 'text-dark-600'}`}>
                                    {email.fromName ? `${email.fromName} <${email.from}>` : email.from}
                                </span>
                            </div>
                            <div className="flex items-center gap-1.5">
                                <HiOutlineClock className={`w-4 h-4 ${isDark ? 'text-dark-400' : 'text-dark-500'}`} />
                                <span className={`text-sm ${isDark ? 'text-dark-400' : 'text-dark-500'}`}>
                                    {formatDate(email.receivedAt)}
                                </span>
                            </div>
                        </div>
                    </div>

                    <div className="flex items-center gap-2 shrink-0">
                        <button
                            onClick={() => onToggleRead(email._id)}
                            title={email.isRead ? 'Mark as unread' : 'Mark as read'}
                            className={`p-2 rounded-xl transition-colors ${isDark ? 'hover:bg-dark-800 text-dark-400' : 'hover:bg-dark-100 text-dark-500'}`}
                        >
                            {email.isRead ? <HiOutlineMail className="w-5 h-5" /> : <HiOutlineMailOpen className="w-5 h-5" />}
                        </button>
                        <button
                            onClick={onClose}
                            className={`p-2 rounded-xl transition-colors ${isDark ? 'hover:bg-dark-800 text-dark-400' : 'hover:bg-dark-100 text-dark-500'}`}
                        >
                            <HiOutlineX className="w-5 h-5" />
                        </button>
                    </div>
                </div>

                {/* Body */}
                <div className="overflow-y-auto flex-1 p-5">
                    {email.body ? (
                        <div
                            className={`prose prose-sm max-w-none ${isDark ? 'prose-invert' : ''}`}
                            dangerouslySetInnerHTML={{ __html: email.body }}
                        />
                    ) : (
                        <div className={`text-center py-12 ${isDark ? 'text-dark-500' : 'text-dark-400'}`}>
                            <p className="text-sm mb-2">No email body available</p>
                            <p className="text-xs italic">{email.snippet}</p>
                        </div>
                    )}
                </div>

                {/* Reply Section */}
                {showReply && (
                    <div className={`border-t-[3px] p-5 animate-fade-in ${isDark ? 'bg-[#1B1B1B] border-white/10' : 'bg-white border-black'}`}>
                        {/* Success message */}
                        {replyStatus === 'success' && (
                            <div className="flex items-center gap-2 p-3 rounded-xl bg-green-500/10 border border-green-500/20 text-green-500 text-sm mb-3">
                                <HiOutlineCheck className="w-5 h-5 shrink-0" />
                                <span>Reply sent successfully!</span>
                            </div>
                        )}

                        {/* Error message */}
                        {replyStatus === 'error' && (
                            <div className="p-3 rounded-xl bg-red-500/10 border border-red-500/20 text-red-500 text-sm mb-3">
                                {replyError}
                            </div>
                        )}

                        {/* Reply form */}
                        {replyStatus !== 'success' && (
                            <>
                                <div className={`text-xs mb-2 ${isDark ? 'text-dark-400' : 'text-dark-500'}`}>
                                    Replying to <span className="font-medium">{email.fromName || email.from}</span>
                                </div>
                                <textarea
                                    value={replyBody}
                                    onChange={(e) => setReplyBody(e.target.value)}
                                    placeholder="Type your reply..."
                                    rows={4}
                                    className={`w-full px-4 py-3 text-base font-medium outline-none resize-none transition-all duration-200 neo-border ${isDark
                                        ? 'bg-[#111] text-white placeholder-dark-500 focus:bg-[#222]'
                                        : 'bg-[#EAE6DF] text-black placeholder-dark-500 focus:bg-white'
                                        }`}
                                    autoFocus
                                    disabled={sending}
                                />
                                <div className="flex items-center justify-end gap-2 mt-3">
                                    <button
                                        onClick={handleCancelReply}
                                        disabled={sending}
                                        className={`px-5 py-3 text-sm font-bold uppercase tracking-widest transition-colors neo-border ${isDark ? 'bg-[#1B1B1B] text-white hover:bg-white hover:text-black' : 'bg-white text-black hover:bg-black hover:text-white'}`}
                                    >
                                        Cancel
                                    </button>
                                    <button
                                        onClick={handleSendReply}
                                        disabled={sending || !replyBody.trim()}
                                        className="flex items-center gap-2 px-6 py-3 bg-[#FF90E8] text-black text-sm uppercase tracking-widest font-black neo-border neo-shadow-sm neo-active-btn disabled:opacity-50 disabled:cursor-not-allowed"
                                    >
                                        {sending ? (
                                            <div className="w-5 h-5 border-[3px] border-black border-t-transparent rounded-full animate-spin" />
                                        ) : (
                                            <HiOutlineReply className="w-5 h-5" />
                                        )}
                                        {sending ? 'Sending...' : 'Send Reply'}
                                    </button>
                                </div>
                            </>
                        )}
                    </div>
                )}

                {/* Footer */}
                <div className={`sticky bottom-0 flex items-center justify-between p-5 border-t-[3px] transition-colors ${isDark ? 'border-white/10 bg-[#1B1B1B]' : 'border-black bg-white'}`}>
                    <div className="flex items-center gap-2">
                        <span className={`inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-widest px-3 py-1.5 border-2 border-black ${email.isRead
                            ? isDark ? 'bg-white text-black' : 'bg-black text-white'
                            : 'bg-[#FFC900] text-black'
                            }`}>
                            {email.isRead ? <HiOutlineMailOpen className="w-4 h-4" /> : <HiOutlineMail className="w-4 h-4" />}
                            {email.isRead ? 'Read' : 'Unread'}
                        </span>
                    </div>
                    <div className="flex items-center gap-3">
                        {!showReply && (
                            <button
                                onClick={() => { setShowReply(true); setReplyStatus(null); }}
                                className="flex items-center gap-2 px-6 py-3 bg-[#FF90E8] text-black text-sm uppercase tracking-widest font-black neo-border neo-shadow-sm neo-active-btn transition-all duration-200"
                            >
                                <HiOutlineReply className="w-5 h-5" />
                                Reply
                            </button>
                        )}
                        <button
                            onClick={onClose}
                            className={`px-6 py-3 text-sm font-bold uppercase tracking-widest transition-colors neo-border neo-shadow-sm neo-active-btn ${isDark ? 'bg-[#1B1B1B] text-white hover:bg-white hover:text-black' : 'bg-white text-black hover:bg-black hover:text-white'}`}
                        >
                            Close
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default EmailModal;
