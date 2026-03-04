import { useState, useEffect } from 'react';
import { HiOutlinePlus, HiOutlinePencil, HiOutlineTrash, HiOutlineCheck, HiOutlineX, HiOutlineMail } from 'react-icons/hi';
import { useTheme } from '../context/ThemeContext';
import api from '../services/api';

const SenderManager = () => {
    const { isDark } = useTheme();
    const [senders, setSenders] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showForm, setShowForm] = useState(false);
    const [editingId, setEditingId] = useState(null);
    const [form, setForm] = useState({ email: '', label: '' });
    const [error, setError] = useState('');
    const [saving, setSaving] = useState(false);

    // Fetch senders
    useEffect(() => {
        fetchSenders();
    }, []);

    const fetchSenders = async () => {
        try {
            const { data } = await api.get('/senders');
            setSenders(data.senders);
        } catch (err) {
            setError('Failed to load senders');
        } finally {
            setLoading(false);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!form.email.trim()) return;
        setSaving(true);
        setError('');

        try {
            if (editingId) {
                const { data } = await api.put(`/senders/${editingId}`, form);
                setSenders(prev => prev.map(s => s._id === editingId ? data.sender : s));
            } else {
                const { data } = await api.post('/senders', form);
                setSenders(prev => [data.sender, ...prev]);
            }
            resetForm();
        } catch (err) {
            setError(err.response?.data?.message || 'Failed to save sender');
        } finally {
            setSaving(false);
        }
    };

    const handleEdit = (sender) => {
        setEditingId(sender._id);
        setForm({ email: sender.email, label: sender.label });
        setShowForm(true);
        setError('');
    };

    const handleDelete = async (id) => {
        if (!confirm('Remove this sender?')) return;
        try {
            await api.delete(`/senders/${id}`);
            setSenders(prev => prev.filter(s => s._id !== id));
        } catch (err) {
            setError('Failed to delete sender');
        }
    };

    const resetForm = () => {
        setShowForm(false);
        setEditingId(null);
        setForm({ email: '', label: '' });
        setError('');
    };

    return (
        <div className={`rounded-2xl border transition-colors duration-300 ${isDark ? 'bg-dark-900/80 border-dark-700' : 'bg-white border-dark-200 shadow-sm'}`}>
            {/* Header */}
            <div className={`flex items-center justify-between p-4 border-b ${isDark ? 'border-dark-700' : 'border-dark-200'}`}>
                <div className="flex items-center gap-2">
                    <HiOutlineMail className="w-5 h-5 text-primary-500" />
                    <h2 className={`font-semibold ${isDark ? 'text-white' : 'text-dark-900'}`}>Tracked Senders</h2>
                    <span className={`text-xs px-2 py-0.5 rounded-full ${isDark ? 'bg-dark-700 text-dark-300' : 'bg-dark-100 text-dark-500'}`}>
                        {senders.length}
                    </span>
                </div>
                <button
                    onClick={() => { resetForm(); setShowForm(!showForm); }}
                    className={`p-2 rounded-lg transition-all duration-200 ${showForm ? (isDark ? 'bg-red-500/10 text-red-400' : 'bg-red-50 text-red-500') : 'bg-primary-500/10 text-primary-500 hover:bg-primary-500/20'}`}
                >
                    {showForm ? <HiOutlineX className="w-4 h-4" /> : <HiOutlinePlus className="w-4 h-4" />}
                </button>
            </div>

            {/* Error */}
            {error && (
                <div className="mx-4 mt-3 p-3 rounded-lg bg-red-500/10 border border-red-500/20 text-red-500 text-sm">
                    {error}
                </div>
            )}

            {/* Add/Edit Form */}
            {showForm && (
                <form onSubmit={handleSubmit} className={`p-4 border-b animate-fade-in ${isDark ? 'border-dark-700' : 'border-dark-200'}`}>
                    <div className="space-y-3">
                        <input
                            type="email"
                            placeholder="sender@example.com"
                            value={form.email}
                            onChange={(e) => setForm(f => ({ ...f, email: e.target.value }))}
                            required
                            className={`w-full px-3.5 py-2.5 rounded-xl text-sm outline-none transition-all duration-200 ${isDark ? 'bg-dark-800 border border-dark-600 text-white placeholder-dark-500 focus:border-primary-500' : 'bg-dark-50 border border-dark-200 text-dark-900 placeholder-dark-400 focus:border-primary-500'}`}
                        />
                        <input
                            type="text"
                            placeholder="Label (optional, e.g. Boss, Client)"
                            value={form.label}
                            onChange={(e) => setForm(f => ({ ...f, label: e.target.value }))}
                            className={`w-full px-3.5 py-2.5 rounded-xl text-sm outline-none transition-all duration-200 ${isDark ? 'bg-dark-800 border border-dark-600 text-white placeholder-dark-500 focus:border-primary-500' : 'bg-dark-50 border border-dark-200 text-dark-900 placeholder-dark-400 focus:border-primary-500'}`}
                        />
                        <button
                            type="submit"
                            disabled={saving}
                            className="w-full py-2.5 rounded-xl bg-primary-600 text-white text-sm font-medium hover:bg-primary-700 transition-all duration-200 disabled:opacity-50 flex items-center justify-center gap-2"
                        >
                            {saving ? (
                                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                            ) : (
                                <>
                                    <HiOutlineCheck className="w-4 h-4" />
                                    {editingId ? 'Update Sender' : 'Add Sender'}
                                </>
                            )}
                        </button>
                    </div>
                </form>
            )}

            {/* Sender List */}
            <div className="p-2 max-h-[400px] overflow-y-auto">
                {loading ? (
                    <div className="space-y-2 p-2">
                        {[1, 2, 3].map(i => (
                            <div key={i} className={`h-14 rounded-xl skeleton`}></div>
                        ))}
                    </div>
                ) : senders.length === 0 ? (
                    <div className="text-center py-8">
                        <HiOutlineMail className={`w-10 h-10 mx-auto mb-2 ${isDark ? 'text-dark-600' : 'text-dark-300'}`} />
                        <p className={`text-sm ${isDark ? 'text-dark-500' : 'text-dark-400'}`}>No senders tracked yet</p>
                        <p className={`text-xs mt-1 ${isDark ? 'text-dark-600' : 'text-dark-300'}`}>Add a sender to start monitoring</p>
                    </div>
                ) : (
                    <div className="space-y-1">
                        {senders.map((sender, idx) => (
                            <div
                                key={sender._id}
                                className={`flex items-center justify-between p-3 rounded-xl transition-all duration-200 animate-slide-in ${isDark ? 'hover:bg-dark-800' : 'hover:bg-dark-50'}`}
                                style={{ animationDelay: `${idx * 50}ms` }}
                            >
                                <div className="flex items-center gap-3 min-w-0">
                                    <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-primary-400 to-primary-600 flex items-center justify-center text-white text-xs font-bold shrink-0">
                                        {sender.email.charAt(0).toUpperCase()}
                                    </div>
                                    <div className="min-w-0">
                                        <p className={`text-sm font-medium truncate ${isDark ? 'text-white' : 'text-dark-800'}`}>
                                            {sender.label || sender.email}
                                        </p>
                                        {sender.label && (
                                            <p className={`text-xs truncate ${isDark ? 'text-dark-400' : 'text-dark-500'}`}>{sender.email}</p>
                                        )}
                                    </div>
                                </div>
                                <div className="flex items-center gap-1 shrink-0">
                                    <button
                                        onClick={() => handleEdit(sender)}
                                        className={`p-1.5 rounded-lg transition-colors ${isDark ? 'hover:bg-dark-700 text-dark-400' : 'hover:bg-dark-100 text-dark-500'}`}
                                    >
                                        <HiOutlinePencil className="w-3.5 h-3.5" />
                                    </button>
                                    <button
                                        onClick={() => handleDelete(sender._id)}
                                        className={`p-1.5 rounded-lg transition-colors ${isDark ? 'hover:bg-red-500/10 text-dark-400 hover:text-red-400' : 'hover:bg-red-50 text-dark-500 hover:text-red-500'}`}
                                    >
                                        <HiOutlineTrash className="w-3.5 h-3.5" />
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
};

export default SenderManager;
