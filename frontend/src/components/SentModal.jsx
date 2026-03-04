import { useEffect } from 'react';
import { useTheme } from '../context/ThemeContext';
import { HiOutlineX, HiOutlineClock, HiOutlineUser, HiOutlineFolderOpen } from 'react-icons/hi';

const SentModal = ({ reply, onClose }) => {
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

    if (!reply) return null;

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
            <div className={`relative w-full max-w-2xl max-h-[85vh] overflow-hidden flex flex-col animate-fade-in neo-border neo-shadow transition-colors duration-300 ${isDark ? 'bg-[#1B1B1B] text-white' : 'bg-white text-black'}`}>
                {/* Header */}
                <div className={`sticky top-0 z-10 flex items-start justify-between p-6 border-b-[3px] transition-colors ${isDark ? 'border-white/10 bg-[#1B1B1B]' : 'border-black bg-white'}`}>
                    <div className="flex-1 min-w-0 pr-4">
                        <div className="flex items-center gap-2 mb-2">
                            <span className={`text-xs px-2 py-1 rounded-md font-semibold ${isDark ? 'bg-primary-900/30 text-primary-400 border border-primary-500/20' : 'bg-primary-50 text-primary-600 border border-primary-100'}`}>
                                Sent Reply
                            </span>
                            <h2 className={`text-lg font-bold ${isDark ? 'text-white' : 'text-dark-900'}`}>
                                {reply.subject}
                            </h2>
                        </div>
                        <div className="flex flex-wrap items-center gap-x-4 gap-y-1.5">
                            <div className="flex items-center gap-1.5">
                                <HiOutlineUser className={`w-4 h-4 ${isDark ? 'text-dark-400' : 'text-dark-500'}`} />
                                <span className={`text-sm ${isDark ? 'text-dark-300' : 'text-dark-600'}`}>
                                    <span className={`text-xs mr-1 ${isDark ? 'text-dark-500' : 'text-dark-400'}`}>To:</span>
                                    {reply.to}
                                </span>
                            </div>
                            <div className="flex items-center gap-1.5">
                                <HiOutlineClock className={`w-4 h-4 ${isDark ? 'text-dark-400' : 'text-dark-500'}`} />
                                <span className={`text-sm ${isDark ? 'text-dark-400' : 'text-dark-500'}`}>
                                    {formatDate(reply.sentAt)}
                                </span>
                            </div>
                        </div>
                    </div>

                    <div className="flex items-center gap-2 shrink-0">
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
                    {/* The Reply Content */}
                    <div className={`prose prose-sm max-w-none whitespace-pre-wrap ${isDark ? 'prose-invert text-dark-200' : 'text-dark-800'}`}>
                        {reply.body}
                    </div>

                    {/* Original Context Reference */}
                    {reply.emailId && (
                        <div className={`mt-8 pt-4 border-t ${isDark ? 'border-dark-700/50' : 'border-dark-100'}`}>
                            <p className={`text-xs flex items-center gap-1.5 mb-2 ${isDark ? 'text-dark-500' : 'text-dark-400'}`}>
                                <HiOutlineFolderOpen className="w-4 h-4" />
                                In reply to original message:
                            </p>
                            <div className={`p-3 rounded-lg text-sm border-l-2 ${isDark ? 'bg-dark-800/50 border-primary-500/50 text-dark-400' : 'bg-dark-50 border-primary-400 text-dark-500'}`}>
                                <p className="font-medium mb-1">{reply.emailId.subject}</p>
                                <p className="text-xs opacity-80">From: {reply.emailId.fromName ? `${reply.emailId.fromName} <${reply.emailId.from}>` : reply.emailId.from}</p>
                            </div>
                        </div>
                    )}
                </div>

                {/* Footer */}
                <div className={`sticky bottom-0 flex items-center justify-end p-5 border-t-[3px] transition-colors ${isDark ? 'border-white/10 bg-[#1B1B1B]' : 'border-black bg-white'}`}>
                    <button
                        onClick={onClose}
                        className={`px-6 py-3 text-sm font-bold uppercase tracking-widest transition-colors neo-border neo-shadow-sm neo-active-btn ${isDark ? 'bg-[#1B1B1B] text-white hover:bg-white hover:text-black' : 'bg-white text-black hover:bg-black hover:text-white'}`}
                    >
                        Close
                    </button>
                </div>
            </div>
        </div>
    );
};

export default SentModal;
