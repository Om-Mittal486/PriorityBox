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
            <div className={`relative w-full max-w-2xl max-h-[85vh] rounded-2xl overflow-hidden flex flex-col animate-fade-in ${isDark ? 'bg-dark-900 border border-dark-700' : 'bg-white shadow-2xl'}`}>
                {/* Header */}
                <div className={`sticky top-0 z-10 flex items-start justify-between p-5 border-b ${isDark ? 'bg-dark-900 border-dark-700' : 'bg-white border-dark-200'}`}>
                    <div className="flex-1 min-w-0 pr-4">
                        <h2 className={`text-lg font-bold mb-2 ${isDark ? 'text-white' : 'text-dark-900'}`}>
                            {email.subject}
                        </h2>
                        <div className="flex flex-wrap items-center gap-x-4 gap-y-1.5">
                            <div className="flex items-center gap-1.5">
                                <HiOutlineUser className={`w-4 h-4 ${isDark ? 'text-dark-400' : 'text-dark-500'}`} />
                                <span className={`text-sm ${isDark ? 'text-dark-300' : 'text-dark-600'}`}>
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
                    <div className={`border-t p-4 animate-fade-in ${isDark ? 'bg-dark-850 border-dark-700' : 'bg-dark-50 border-dark-200'}`}>
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
                                    className={`w-full px-3.5 py-2.5 rounded-xl text-sm outline-none resize-none transition-all duration-200 ${isDark
                                        ? 'bg-dark-800 border border-dark-600 text-white placeholder-dark-500 focus:border-primary-500'
                                        : 'bg-white border border-dark-200 text-dark-900 placeholder-dark-400 focus:border-primary-500'
                                        }`}
                                    autoFocus
                                    disabled={sending}
                                />
                                <div className="flex items-center justify-end gap-2 mt-3">
                                    <button
                                        onClick={handleCancelReply}
                                        disabled={sending}
                                        className={`px-4 py-2 rounded-xl text-sm font-medium transition-colors ${isDark ? 'bg-dark-800 text-dark-300 hover:bg-dark-700' : 'bg-dark-200 text-dark-600 hover:bg-dark-300'}`}
                                    >
                                        Cancel
                                    </button>
                                    <button
                                        onClick={handleSendReply}
                                        disabled={sending || !replyBody.trim()}
                                        className="flex items-center gap-2 px-5 py-2 rounded-xl bg-primary-600 text-white text-sm font-medium hover:bg-primary-700 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                                    >
                                        {sending ? (
                                            <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                                        ) : (
                                            <HiOutlineReply className="w-4 h-4" />
                                        )}
                                        {sending ? 'Sending...' : 'Send Reply'}
                                    </button>
                                </div>
                            </>
                        )}
                    </div>
                )}

                {/* Footer */}
                <div className={`sticky bottom-0 flex items-center justify-between p-4 border-t ${isDark ? 'bg-dark-900 border-dark-700' : 'bg-dark-50 border-dark-200'}`}>
                    <div className="flex items-center gap-2">
                        <span className={`inline-flex items-center gap-1 text-xs px-2.5 py-1 rounded-full ${email.isRead
                            ? isDark ? 'bg-dark-800 text-dark-400' : 'bg-dark-200 text-dark-500'
                            : 'bg-primary-500/10 text-primary-500'
                            }`}>
                            {email.isRead ? <HiOutlineMailOpen className="w-3 h-3" /> : <HiOutlineMail className="w-3 h-3" />}
                            {email.isRead ? 'Read' : 'Unread'}
                        </span>
                    </div>
                    <div className="flex items-center gap-2">
                        {!showReply && (
                            <button
                                onClick={() => { setShowReply(true); setReplyStatus(null); }}
                                className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-primary-600 text-white text-sm font-medium hover:bg-primary-700 transition-all duration-200"
                            >
                                <HiOutlineReply className="w-4 h-4" />
                                Reply
                            </button>
                        )}
                        <button
                            onClick={onClose}
                            className={`px-4 py-2 rounded-xl text-sm font-medium transition-colors ${isDark ? 'bg-dark-800 text-dark-300 hover:bg-dark-700' : 'bg-dark-200 text-dark-600 hover:bg-dark-300'}`}
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
