import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Send, X, MessageCircle, User } from 'lucide-react';
import api from '../api/api';
import useSocket from '../hooks/useSocket';
import useAuthStore from '../store/useAuthStore';

const ChatPanel = ({ bookingId, isOpen, onClose, recipientName }) => {
    const { user } = useAuthStore();
    const socket = useSocket();
    const [messages, setMessages] = useState([]);
    const [newMessage, setNewMessage] = useState('');
    const [loading, setLoading] = useState(true);
    const scrollRef = useRef(null);

    useEffect(() => {
        if (isOpen && bookingId) {
            fetchMessages();
            if (socket) {
                socket.emit('join_chat', bookingId);
                socket.on('receive_message', (message) => {
                    setMessages(prev => [...prev, message]);
                });
            }
        }
        return () => {
            if (socket) socket.off('receive_message');
        };
    }, [isOpen, bookingId, socket]);

    useEffect(() => {
        if (scrollRef.current) {
            scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
        }
    }, [messages]);

    const fetchMessages = async () => {
        try {
            const { data } = await api.get(`/chat/${bookingId}`);
            setMessages(data);
        } catch (error) {
            console.error('Failed to fetch messages:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleSendMessage = (e) => {
        e.preventDefault();
        if (!newMessage.trim() || !socket) return;

        const messageData = {
            bookingId,
            senderId: user._id,
            content: newMessage
        };

        socket.emit('send_message', messageData);
        setNewMessage('');
    };

    return (
        <AnimatePresence>
            {isOpen && (
                <motion.div
                    initial={{ opacity: 0, y: 100, scale: 0.9 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: 100, scale: 0.9 }}
                    transition={{ type: 'spring', damping: 25, stiffness: 200 }}
                    className="fixed bottom-6 right-6 w-[380px] h-[550px] bg-white rounded-[2.5rem] shadow-apple-xl border border-[#F5F5F7] z-[1000] flex flex-col overflow-hidden"
                >
                    {/* Header */}
                    <div className="p-6 border-b border-[#F5F5F7] flex items-center justify-between bg-black text-white">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 bg-white/10 rounded-xl flex items-center justify-center">
                                <User size={20} />
                            </div>
                            <div>
                                <h4 className="font-bold text-sm tracking-tight">{recipientName || 'Chat'}</h4>
                                <p className="text-[10px] text-white/50 font-bold uppercase tracking-widest">Online</p>
                            </div>
                        </div>
                        <button onClick={onClose} className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center hover:bg-white/20 transition-colors">
                            <X size={16} />
                        </button>
                    </div>

                    {/* Messages Area */}
                    <div ref={scrollRef} className="flex-1 overflow-y-auto p-6 space-y-4 custom-scrollbar">
                        {loading ? (
                            <div className="h-full flex items-center justify-center text-apple-gray text-xs font-bold uppercase tracking-widest">Loading history...</div>
                        ) : messages.length === 0 ? (
                            <div className="h-full flex flex-col items-center justify-center text-apple-gray gap-3">
                                <MessageCircle size={32} strokeWidth={1.5} />
                                <p className="text-xs font-bold uppercase tracking-widest">No messages yet</p>
                            </div>
                        ) : (
                            messages.map((msg, i) => {
                                const isMe = msg.sender._id === user._id || msg.sender === user._id;
                                return (
                                    <motion.div
                                        key={msg._id || i}
                                        initial={{ opacity: 0, x: isMe ? 20 : -20 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        className={`flex ${isMe ? 'justify-end' : 'justify-start'}`}
                                    >
                                        <div className={`max-w-[80%] p-4 rounded-3xl text-sm font-medium ${isMe ? 'bg-black text-white rounded-tr-none' : 'bg-[#F5F5F7] text-black rounded-tl-none'}`}>
                                            {msg.content}
                                            <p className={`text-[9px] mt-1 opacity-50 ${isMe ? 'text-right' : 'text-left'}`}>
                                                {new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                            </p>
                                        </div>
                                    </motion.div>
                                );
                            })
                        )}
                    </div>

                    {/* Input Area */}
                    <form onSubmit={handleSendMessage} className="p-6 border-t border-[#F5F5F7] bg-white">
                        <div className="relative">
                            <input
                                type="text"
                                value={newMessage}
                                onChange={(e) => setNewMessage(e.target.value)}
                                placeholder="Write a message..."
                                className="w-full h-12 bg-[#F5F5F7] rounded-2xl pl-5 pr-14 text-sm font-medium outline-none border-2 border-transparent focus:border-black transition-all"
                            />
                            <button
                                type="submit"
                                disabled={!newMessage.trim()}
                                className="absolute right-2 top-1/2 -translate-y-1/2 w-8 h-8 bg-black text-white rounded-xl flex items-center justify-center disabled:opacity-30 disabled:grayscale transition-all hover:scale-105 active:scale-95"
                            >
                                <Send size={14} />
                            </button>
                        </div>
                    </form>
                </motion.div>
            )}
        </AnimatePresence>
    );
};

export default ChatPanel;
