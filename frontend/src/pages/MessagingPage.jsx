import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { sendMessage } from '../utils/api';
import { User, Clock, Send } from "lucide-react";

const MessagingPage = () => {
    const [chatRequests, setChatRequests] = useState([]);
    const [selectedChatRequestId, setSelectedChatRequestId] = useState(null);
    const [messages, setMessages] = useState([]);
    const [newMessage, setNewMessage] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState('');
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

    return (

        <div className="min-h-screen bg-gradient-to-br from-blue-100 to-purple-100 flex">
            {/* Left Sidebar (Requests/Chats) */}
            <div className="w-1/3 bg-white shadow-lg border-r border-gray-300 p-5 rounded-r-3xl">
                <h2 className="text-xl font-semibold flex items-center space-x-2 mb-4">
                    <User className="h-6 w-6 text-gray-700" />
                    <span>{"All Messages"}</span>
                </h2>
        
                {isLoading && <p className="text-gray-500">Loading chat requests...</p>}
                {error && <p className="text-red-500">{error}</p>}
                {!isLoading && !error && (!chatRequests || chatRequests.length === 0) && (
                    <p className="text-gray-500">No chat requests found.</p>
                )}
        
                <ul className="space-y-2">
                    {chatRequests &&
                        chatRequests.map((req) => (
                            <li
                                key={req.id}
                                className={`p-3 rounded-lg flex items-center space-x-3 cursor-pointer transition-all duration-300  ${
                                    selectedChatRequestId === req.id
                                        ? "bg-blue-500 text-white"
                                        : "hover:bg-blue-100 bg-gray-100"
                                }`}
                                onClick={() => setSelectedChatRequestId(req.id)}
                            >
                                <img
                                    src={req.consultantProfilePicture || profilePicture}
                                    alt={`${req.userName}'s Profile`}
                                    className="w-10 h-10 rounded-full object-cover"
                                />
                                <div className="flex flex-col flex-grow">
                                    <p className="font-medium truncate">{req.userName}</p>
                                    <div className="flex items-center space-x-1 text-sm text-gray-600">
                                        <Clock className="h-4 w-4 text-white" />
                                        <p className="truncate text-white">
                                            {req.bookingDate} / {req.bookingTime}
                                        </p>
                                    </div>
                                </div>
                            </li>
                        ))}
                </ul>
            </div>
        
            {/* Right Panel (Chat Screen) */}
            <div className="w-2/3 p-6 flex flex-col">
                <div className="bg-white shadow-lg rounded-3xl p-5 flex flex-col h-full">
                    <h2 className="text-xl font-semibold mb-4">Chat</h2>
        
                    {/* Message Display */}
                    <div className="space-y-3 h-[70vh] overflow-y-auto flex-grow p-2">
                        {messages &&
                            messages.map((msg) => (
                                <div
                                    key={msg.id}
                                    className={`p-3 rounded-lg text-gray-700 shadow-md max-w-[80%] ${
                                        msg.senderId === parseInt(userId)
                                            ? "bg-blue-500 text-white ml-auto"
                                            : "bg-gray-200 mr-auto"
                                    }`}
                                >
                                    <p>{msg.message}</p>
                                    <p className="text-xs text-right opacity-75 mt-1">
                                        {msg.timestamp}
                                    </p>
                                </div>
                            ))}
                    </div>
        
                    {/* Message Input */}
                    <div className="flex items-center space-x-3">
                        <input
                            type="text"
                            value={newMessage}
                            onChange={(e) => setNewMessage(e.target.value)}
                            placeholder="Type your message..."
                            className="flex-grow border border-gray-300 rounded-full px-4 py-2 focus:ring-2 focus:ring-blue-500 outline-none"
                        />
                        <button
                            onClick={handleSendMessage}
                            className="bg-blue-500 hover:bg-blue-700 text-white py-2 px-4 rounded-full flex items-center space-x-2 shadow-md transition-all duration-300"
                        >
                            <Send className="h-5 w-5" />
                            <span>Send</span>
                        </button>
                    </div>
                </div>
            </div>
        </div>
        
    );
};

export default MessagingPage;