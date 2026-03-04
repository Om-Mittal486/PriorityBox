import { useEffect } from 'react';
import { useTheme } from '../context/ThemeContext';
import { HiOutlineX, HiOutlineMail, HiOutlineMailOpen, HiOutlineClock, HiOutlineUser } from 'react-icons/hi';

const EmailModal = ({ email, onClose, onToggleRead }) => {
    const { isDark } = useTheme();

    // Close on Escape key
    useEffect(() => {
        const handleEsc = (e) => {
            if (e.key === 'Escape') onClose();
        };
        window.addEventListener('keydown', handleEsc);
        return () => window.removeEventListener('keydown', handleEsc);
    }, [onClose]);

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

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            {/* Backdrop */}
            <div
                className="absolute inset-0 bg-black/60 backdrop-blur-sm"
                onClick={onClose}
            />

            {/* Modal */}
            <div className={`relative w-full max-w-2xl max-h-[85vh] rounded-2xl overflow-hidden animate-fade-in ${isDark ? 'bg-dark-900 border border-dark-700' : 'bg-white shadow-2xl'}`}>
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
                <div className="overflow-y-auto max-h-[60vh] p-5">
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
                    <button
                        onClick={onClose}
                        className={`px-4 py-2 rounded-xl text-sm font-medium transition-colors ${isDark ? 'bg-dark-800 text-dark-300 hover:bg-dark-700' : 'bg-dark-200 text-dark-600 hover:bg-dark-300'}`}
                    >
                        Close
                    </button>
                </div>
            </div>
        </div>
    );
};

export default EmailModal;
