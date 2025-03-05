import React, { useState, useEffect } from 'react';
import axios from 'axios'; // Assuming you have axios installed
import { sendMessage } from '../utils/api';
import { CreditCard, Plus } from 'lucide-react';

const MessagingPage = () => {
    const [chatRequests, setChatRequests] = useState([]);
    const [selectedChatRequestId, setSelectedChatRequestId] = useState(null);
    const [messages, setMessages] = useState([]);
    const [newMessage, setNewMessage] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState('');
    const [userRole, setUserRole] = useState(localStorage.getItem('userRole') || 'guest');
    const [userId, setUserId] = useState(localStorage.getItem('userId') || '');
    const [profilePicture, setProfilePicture] = useState(localStorage.getItem('profilePicture') || 'https://via.placeholder.com/150'); // Placeholder URL


    useEffect(() => {
        const fetchChatRequests = async () => {
            setIsLoading(true);
            setError('');

            try {
                const token = localStorage.getItem('token');
                if (!token) {
                    setError('Authentication required. Please login.');
                    return;
                }
                let endpoint = 'http://localhost:5555/api/chat/requests';

                // Get All Requests
                const response = await axios.get(endpoint, {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                });
                setChatRequests(response.data);

            } catch (error) {
                setError('Failed to fetch chat requests.');
                console.error(error);
            } finally {
                setIsLoading(false);
            }
        };
        fetchChatRequests();

    }, []);

    useEffect(() => {
        const fetchMessages = async () => {
            if (!selectedChatRequestId) return;

            setIsLoading(true);
            setError('');

            try {
                const token = localStorage.getItem('token');
                if (!token) {
                    setError('Authentication required. Please login.');
                    return;
                }

                // Fetch  chat
                const response = await axios.get(`http://localhost:5555/api/chat/${selectedChatRequestId}/messages`, {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                });
                setMessages(response.data);

            } catch (error) {
                setError('Failed to fetch messages.');
                console.error(error);
            } finally {
                setIsLoading(false);
            }
        };

        fetchMessages();
    }, [selectedChatRequestId]);

    const handleSendMessage = async () => {
        try {
            const token = localStorage.getItem('token');
            if (!token) {
                setError('Authentication required. Please login.');
                return;
            }
            const data = await sendMessage(token, selectedChatRequestId, newMessage);
            console.log(data)

            // After sending, fetch the messages again
            const response = await axios.get(`http://localhost:5555/api/chat/${selectedChatRequestId}/messages`, {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            });
            setMessages(response.data);
            setNewMessage('');
        } catch (error) {
            setError('Failed to send message.');
            console.error(error);
        }
    };

    const isConsultant = userRole === 'consultant';
    const isUser = userRole === 'user';

    return (
        <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50 flex">
            {/* Left Sidebar (Requests/Chats) */}
            <div className="w-1/3 bg-gray-100 border-r border-gray-300 p-4">
                <h2 className="text-xl font-semibold mb-4">
                    {isConsultant ? 'My Chats' : 'My Chats'}
                </h2>

                {isLoading && <p>Loading chat requests...</p>}
                {error && <p className="text-red-500">{error}</p>}
                {!isLoading && !error && (!chatRequests || chatRequests.length === 0) && (
                    <p>No chat requests found.</p>
                )}

                <ul className="space-y-2">
                    {chatRequests && chatRequests.map((req) => (
                        <li
                            key={req.id}
                            className={`p-3 rounded-lg cursor-pointer ${selectedChatRequestId === req.id
                                ? 'bg-blue-200'
                                : 'hover:bg-gray-200'
                                }`}
                            onClick={() => setSelectedChatRequestId(req.id)}
                        >
                            <div className="flex items-center space-x-3">
                                <img
                                    src={req.consultantProfilePicture || profilePicture}
                                    alt={`${req.userName}'s Profile`}
                                    className="w-8 h-8 rounded-full object-cover"
                                />
                                <div>
                                    <p className="font-medium">{req.userName}</p>
                                    <p className="text-sm text-gray-500">{req.bookingDate} /  {req.bookingTime}</p>
                                </div>
                            </div>
                        </li>
                    ))}
                </ul>
            </div>

            {/* Right Panel (Chat Screen) */}
            <div className="w-2/3 p-4">
                <div className="bg-white shadow-md rounded-2xl p-4 space-y-4">
                    <h2 className="text-xl font-semibold">Chat</h2>

                    {/* Message Display */}
                    <div className="space-y-3 h-96 overflow-y-auto">
                        {messages && messages.map((msg) => (
                            <div
                                key={msg.id}
                                className={`p-3 rounded-lg ${msg.senderId === parseInt(userId)
                                    ? 'bg-blue-100 self-end ml-auto'
                                    : 'bg-gray-100 self-start mr-auto'
                                }`}
                                style={{ maxWidth: '80%' }}
                            >
                                <p className="text-gray-700">{msg.message}</p>
                                <p className="text-gray-500 text-sm mt-1 text-right">
                                    {msg.timestamp}
                                </p>
                            </div>
                        ))}
                    </div>

                    {/* Message Input */}
                    <div className="flex items-center">
                        <input
                            type="text"
                            value={newMessage}
                            onChange={(e) => setNewMessage(e.target.value)}
                            placeholder="Type your message..."
                            className="flex-grow border rounded-md p-2 mr-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                        <button
                            onClick={handleSendMessage}
                            className="bg-blue-500 hover:bg-blue-700 text-white py-2 px-4 rounded-md"
                        >
                            Send
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default MessagingPage;