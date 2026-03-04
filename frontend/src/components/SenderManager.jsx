import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import clsx from 'clsx';
import { HiOutlinePlus, HiOutlinePencil, HiOutlineTrash, HiOutlineCheck, HiOutlineX, HiOutlineMail } from 'react-icons/hi';
import { useTheme } from '../context/ThemeContext';
import api from '../services/api';

const SenderManager = ({ onSenderDeleted }) => {
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
        if (!confirm('Remove this sender and all their emails?')) return;
        try {
            await api.delete(`/senders/${id}`);
            setSenders(prev => prev.filter(s => s._id !== id));
            // Notify parent to re-fetch emails since associated emails were deleted
            if (onSenderDeleted) onSenderDeleted();
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
        <div className={clsx(
            "neo-border neo-shadow transition-colors duration-300 overflow-hidden",
            isDark ? "bg-[#1B1B1B]" : "bg-[#EAE6DF]"
        )}>
            {/* Header */}
            <div className={clsx(
                "flex items-center justify-between p-5 border-b-[3px] transition-colors border-black dark:border-white/10"
            )}>
                <div className="flex items-center gap-3">
                    <div className={clsx(
                        "p-2 neo-border neo-shadow-sm rotate-2",
                        isDark ? "bg-[#FFC900] text-black" : "bg-[#FFC900] text-black"
                    )}>
                        <HiOutlineMail className="w-6 h-6" />
                    </div>
                    <div>
                        <h2 className={clsx("font-black tracking-wide uppercase", isDark ? "text-white" : "text-black")}>Tracked Senders</h2>
                        <p className={clsx("text-sm font-bold", isDark ? "text-dark-400" : "text-dark-600")}>
                            {senders.length} active
                        </p>
                    </div>
                </div>
                <button
                    onClick={() => { resetForm(); setShowForm(!showForm); }}
                    className={clsx(
                        "p-2.5 neo-border neo-shadow-sm neo-active-btn transition-transform",
                        showForm
                            ? isDark ? 'bg-red-500 text-white' : 'bg-red-500 text-white'
                            : isDark ? 'bg-white text-black' : 'bg-black text-white'
                    )}
                >
                    {showForm ? <HiOutlineX className="w-5 h-5" /> : <HiOutlinePlus className="w-5 h-5" />}
                </button>
            </div>

            {/* Error */}
            {error && (
                <div className="mx-4 mt-3 p-3 rounded-lg bg-red-500/10 border border-red-500/20 text-red-500 text-sm">
                    {error}
                </div>
            )}

            {/* Add/Edit Form */}
            <AnimatePresence>
                {showForm && (
                    <motion.form
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: "auto", opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.3, ease: "easeInOut" }}
                        onSubmit={handleSubmit}
                        className={clsx(
                            "px-5 py-5 border-b-[3px] overflow-hidden",
                            isDark ? "border-white/10 bg-[#1B1B1B]" : "border-black bg-white"
                        )}
                    >
                        <div className="space-y-5">
                            <div className="space-y-4">
                                <input
                                    type="email"
                                    placeholder="sender@example.com"
                                    value={form.email}
                                    onChange={(e) => setForm(f => ({ ...f, email: e.target.value }))}
                                    required
                                    className={clsx(
                                        "w-full px-4 py-3 text-base font-bold outline-none transition-all duration-300 neo-border",
                                        isDark
                                            ? "bg-dark-900 text-white placeholder-dark-500 focus:bg-dark-800"
                                            : "bg-[#EAE6DF] text-black placeholder-dark-500 focus:bg-white"
                                    )}
                                />
                                <input
                                    type="text"
                                    placeholder="Label (optional, e.g. Boss, Client)"
                                    value={form.label}
                                    onChange={(e) => setForm(f => ({ ...f, label: e.target.value }))}
                                    className={clsx(
                                        "w-full px-4 py-3 text-base font-bold outline-none transition-all duration-300 neo-border",
                                        isDark
                                            ? "bg-dark-900 text-white placeholder-dark-500 focus:bg-dark-800"
                                            : "bg-[#EAE6DF] text-black placeholder-dark-500 focus:bg-white"
                                    )}
                                />
                            </div>
                            <button
                                type="submit"
                                disabled={saving}
                                className="w-full py-4 bg-[#FF90E8] text-black text-base uppercase tracking-widest font-black neo-border neo-shadow-sm neo-active-btn disabled:opacity-50 flex items-center justify-center gap-2"
                            >
                                {saving ? (
                                    <div className="w-5 h-5 border-[3px] border-black border-t-transparent rounded-full animate-spin" />
                                ) : (
                                    <>
                                        <HiOutlineCheck className="w-6 h-6" />
                                        {editingId ? 'Save Changes' : 'Start Tracking'}
                                    </>
                                )}
                            </button>
                        </div>
                    </motion.form>
                )}
            </AnimatePresence>

            {/* Sender List */}
            <div className="p-3 max-h-[500px] overflow-y-auto custom-scrollbar">
                {loading ? (
                    <div className="space-y-2 p-2">
                        {[1, 2, 3].map(i => (
                            <div key={i} className="h-16 rounded-2xl skeleton opacity-70"></div>
                        ))}
                    </div>
                ) : senders.length === 0 ? (
                    <motion.div
                        initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                        className="text-center py-10 px-4"
                    >
                        <div className={clsx(
                            "w-16 h-16 rounded-2xl mx-auto flex items-center justify-center mb-4 transition-colors",
                            isDark ? "bg-dark-800" : "bg-dark-100"
                        )}>
                            <HiOutlineMail className={clsx("w-8 h-8", isDark ? "text-dark-600" : "text-dark-400")} />
                        </div>
                        <p className={clsx("text-sm font-medium mb-1", isDark ? 'text-dark-300' : 'text-dark-700')}>No senders tracked</p>
                        <p className={clsx("text-xs leading-relaxed", isDark ? 'text-dark-500' : 'text-dark-500')}>Add a sender's email to start receiving live notifications.</p>
                    </motion.div>
                ) : (
                    <div className="space-y-3">
                        <AnimatePresence>
                            {senders.map((sender, idx) => (
                                <motion.div
                                    key={sender._id}
                                    initial={{ opacity: 0, x: -10 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    exit={{ opacity: 0, scale: 0.95, transition: { duration: 0.2 } }}
                                    transition={{ duration: 0.3, delay: idx * 0.05 }}
                                    className={clsx(
                                        "group flex items-center justify-between p-4 neo-border neo-hover-card transition-all duration-300",
                                        isDark ? 'bg-dark-900 text-white' : 'bg-white text-black'
                                    )}
                                >
                                    <div className="flex items-center gap-4 min-w-0">
                                        <div className="w-12 h-12 bg-[#90A8FF] neo-border flex items-center justify-center text-black text-lg font-black shrink-0 -rotate-2">
                                            {sender.email.charAt(0).toUpperCase()}
                                        </div>
                                        <div className="min-w-0">
                                            <p className={clsx("text-base font-black truncate", isDark ? 'text-white' : 'text-dark-900')}>
                                                {sender.label || sender.email}
                                            </p>
                                            {sender.label && (
                                                <p className={clsx("text-sm truncate font-bold", isDark ? 'text-dark-400' : 'text-dark-500')}>{sender.email}</p>
                                            )}
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-2 shrink-0 opacity-100 sm:opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                                        <button
                                            onClick={() => handleEdit(sender)}
                                            className="p-2 neo-border neo-shadow-sm bg-[#FFC900] text-black hover:bg-white neo-active-btn"
                                        >
                                            <HiOutlinePencil className="w-5 h-5" />
                                        </button>
                                        <button
                                            onClick={() => handleDelete(sender._id)}
                                            className="p-2 neo-border neo-shadow-sm bg-[#FF90E8] text-black hover:bg-white neo-active-btn"
                                        >
                                            <HiOutlineTrash className="w-5 h-5" />
                                        </button>
                                    </div>
                                </motion.div>
                            ))}
                        </AnimatePresence>
                    </div>
                )}
            </div>
        </div>
    );
};

export default SenderManager;
