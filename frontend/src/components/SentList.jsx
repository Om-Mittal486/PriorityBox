import { useTheme } from '../context/ThemeContext';
import { HiOutlineDocumentText, HiOutlineClock, HiOutlineEye } from 'react-icons/hi';

const SentList = ({ replies, loading, onReplyClick }) => {
    const { isDark } = useTheme();

    const formatTime = (dateStr) => {
        const date = new Date(dateStr);
        const now = new Date();
        const diffMs = now - date;
        const diffMins = Math.floor(diffMs / 60000);
        const diffHours = Math.floor(diffMs / 3600000);
        const diffDays = Math.floor(diffMs / 86400000);

        if (diffMins < 1) return 'Just now';
        if (diffMins < 60) return `${diffMins}m ago`;
        if (diffHours < 24) return `${diffHours}h ago`;
        if (diffDays < 7) return `${diffDays}d ago`;
        return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
    };

    if (loading) {
        return (
            <div className="space-y-3">
                {[1, 2, 3, 4, 5].map(i => (
                    <div key={i} className={`h-20 rounded-xl skeleton`}></div>
                ))}
            </div>
        );
    }

    if (replies.length === 0) {
        return (
            <div className="text-center py-16">
                <div className={`w-20 h-20 mx-auto mb-4 rounded-2xl flex items-center justify-center ${isDark ? 'bg-dark-800' : 'bg-dark-100'}`}>
                    <HiOutlineDocumentText className={`w-10 h-10 ${isDark ? 'text-dark-600' : 'text-dark-300'}`} />
                </div>
                <h3 className={`text-lg font-semibold mb-2 ${isDark ? 'text-dark-300' : 'text-dark-600'}`}>No replied emails yet</h3>
                <p className={`text-sm max-w-xs mx-auto ${isDark ? 'text-dark-500' : 'text-dark-400'}`}>
                    Reply to an email in your Inbox to see it appear here.
                </p>
            </div>
        );
    }

    return (
        <div className="space-y-2">
            {replies.map((reply, idx) => (
                <div
                    key={reply._id}
                    onClick={() => onReplyClick(reply)}
                    className={`group relative p-4 rounded-xl cursor-pointer transition-all duration-200 animate-fade-in ${isDark
                            ? 'bg-dark-900/50 hover:bg-dark-800 border border-dark-700/50 hover:border-dark-600'
                            : 'bg-white hover:bg-dark-50 border border-dark-200/80 hover:border-dark-300 hover:shadow-sm'
                        }`}
                    style={{ animationDelay: `${idx * 30}ms` }}
                >
                    <div className="flex items-start gap-3">
                        {/* Avatar */}
                        <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 text-sm font-bold ${isDark ? 'bg-dark-700 text-dark-400' : 'bg-dark-200 text-dark-500'
                            }`}>
                            {reply.to ? reply.to.charAt(0).toUpperCase() : 'U'}
                        </div>

                        {/* Content */}
                        <div className="flex-1 min-w-0">
                            <div className="flex items-center justify-between mb-1">
                                <div className="flex items-center gap-1.5 min-w-0">
                                    <span className={`text-xs px-1.5 py-0.5 rounded-md ${isDark ? 'bg-dark-800 text-dark-400' : 'bg-dark-100 text-dark-500'}`}>
                                        To:
                                    </span>
                                    <span className={`text-sm font-semibold truncate ${isDark ? 'text-dark-300' : 'text-dark-600'
                                        }`}>
                                        {reply.to}
                                    </span>
                                </div>
                                <div className="flex items-center gap-1.5 shrink-0 ml-2">
                                    <HiOutlineClock className={`w-3 h-3 ${isDark ? 'text-dark-500' : 'text-dark-400'}`} />
                                    <span className={`text-xs ${isDark ? 'text-dark-500' : 'text-dark-400'}`}>
                                        {formatTime(reply.sentAt)}
                                    </span>
                                </div>
                            </div>

                            <p className={`text-sm truncate mb-1 ${isDark ? 'text-dark-400' : 'text-dark-600'
                                }`}>
                                {reply.subject}
                            </p>

                            <p className={`text-xs truncate ${isDark ? 'text-dark-500' : 'text-dark-400'}`}>
                                {reply.body.substring(0, 100)}{reply.body.length > 100 ? '...' : ''}
                            </p>
                        </div>
                    </div>

                    {/* Hover actions */}
                    <div className="absolute top-3 right-3 flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button
                            onClick={(e) => { e.stopPropagation(); onReplyClick(reply); }}
                            title="View reply"
                            className={`p-1.5 rounded-lg transition-colors ${isDark ? 'hover:bg-dark-700 text-dark-400' : 'hover:bg-dark-100 text-dark-500'}`}
                        >
                            <HiOutlineEye className="w-4 h-4" />
                        </button>
                    </div>
                </div>
            ))}
        </div>
    );
};

export default SentList;
