import { useTheme } from '../context/ThemeContext';
import { HiOutlineMail, HiOutlineClock, HiOutlineEye, HiOutlineMailOpen } from 'react-icons/hi';

const EmailList = ({ emails, loading, onEmailClick, onToggleRead }) => {
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

    if (emails.length === 0) {
        return (
            <div className="text-center py-16">
                <div className={`w-20 h-20 mx-auto mb-4 rounded-2xl flex items-center justify-center ${isDark ? 'bg-dark-800' : 'bg-dark-100'}`}>
                    <HiOutlineMail className={`w-10 h-10 ${isDark ? 'text-dark-600' : 'text-dark-300'}`} />
                </div>
                <h3 className={`text-lg font-semibold mb-2 ${isDark ? 'text-dark-300' : 'text-dark-600'}`}>No emails yet</h3>
                <p className={`text-sm max-w-xs mx-auto ${isDark ? 'text-dark-500' : 'text-dark-400'}`}>
                    Add some sender email addresses and we'll start watching for their emails.
                </p>
            </div>
        );
    }

    return (
        <div className="space-y-2">
            {emails.map((email, idx) => (
                <div
                    key={email._id}
                    onClick={() => onEmailClick(email)}
                    className={`group relative p-4 rounded-xl cursor-pointer transition-all duration-200 animate-fade-in ${!email.isRead ? 'email-new' : ''
                        } ${isDark
                            ? `${email.isRead ? 'bg-dark-900/50' : 'bg-dark-800/80'} hover:bg-dark-800 border border-dark-700/50 hover:border-dark-600`
                            : `${email.isRead ? 'bg-white' : 'bg-primary-50/50'} hover:bg-dark-50 border border-dark-200/80 hover:border-dark-300 hover:shadow-sm`
                        }`}
                    style={{ animationDelay: `${idx * 30}ms` }}
                >
                    <div className="flex items-start gap-3">
                        {/* Avatar */}
                        <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 text-sm font-bold ${!email.isRead
                                ? 'bg-gradient-to-br from-primary-400 to-primary-600 text-white shadow-md shadow-primary-500/20'
                                : isDark ? 'bg-dark-700 text-dark-400' : 'bg-dark-200 text-dark-500'
                            }`}>
                            {(email.fromName || email.from).charAt(0).toUpperCase()}
                        </div>

                        {/* Content */}
                        <div className="flex-1 min-w-0">
                            <div className="flex items-center justify-between mb-1">
                                <span className={`text-sm font-semibold truncate ${!email.isRead
                                        ? isDark ? 'text-white' : 'text-dark-900'
                                        : isDark ? 'text-dark-300' : 'text-dark-600'
                                    }`}>
                                    {email.fromName || email.from}
                                </span>
                                <div className="flex items-center gap-1.5 shrink-0 ml-2">
                                    <HiOutlineClock className={`w-3 h-3 ${isDark ? 'text-dark-500' : 'text-dark-400'}`} />
                                    <span className={`text-xs ${isDark ? 'text-dark-500' : 'text-dark-400'}`}>
                                        {formatTime(email.receivedAt)}
                                    </span>
                                </div>
                            </div>

                            <p className={`text-sm truncate mb-1 ${!email.isRead
                                    ? isDark ? 'text-dark-200 font-medium' : 'text-dark-800 font-medium'
                                    : isDark ? 'text-dark-400' : 'text-dark-600'
                                }`}>
                                {email.subject}
                            </p>

                            <p className={`text-xs truncate ${isDark ? 'text-dark-500' : 'text-dark-400'}`}>
                                {email.snippet}
                            </p>
                        </div>
                    </div>

                    {/* Hover actions */}
                    <div className="absolute top-3 right-3 flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button
                            onClick={(e) => { e.stopPropagation(); onToggleRead(email._id); }}
                            title={email.isRead ? 'Mark as unread' : 'Mark as read'}
                            className={`p-1.5 rounded-lg transition-colors ${isDark ? 'hover:bg-dark-700 text-dark-400' : 'hover:bg-dark-100 text-dark-500'}`}
                        >
                            {email.isRead ? <HiOutlineMail className="w-4 h-4" /> : <HiOutlineMailOpen className="w-4 h-4" />}
                        </button>
                        <button
                            onClick={(e) => { e.stopPropagation(); onEmailClick(email); }}
                            title="View email"
                            className={`p-1.5 rounded-lg transition-colors ${isDark ? 'hover:bg-dark-700 text-dark-400' : 'hover:bg-dark-100 text-dark-500'}`}
                        >
                            <HiOutlineEye className="w-4 h-4" />
                        </button>
                    </div>

                    {/* Unread dot */}
                    {!email.isRead && (
                        <div className="absolute top-1/2 -translate-y-1/2 -left-0.5 w-2 h-2 rounded-full bg-primary-500" />
                    )}
                </div>
            ))}
        </div>
    );
};

export default EmailList;
