import React, { useState, useEffect } from 'react';
import { MessageCircle } from 'lucide-react';
import { getMessages, createMessage } from '../utils/api';

const Messaging = () => {
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [consultantId, setConsultantId] = useState(1); // Example, set dynamically later

  useEffect(() => {
    const fetchMessages = async () => {
      setLoading(true);
      setError('');
      try {
        const token = localStorage.getItem('token');
        if (!token) {
          setError('Authentication required. Please login.');
          return;
        }

        const data = await getMessages(token);
        setMessages(data);
      } catch (err) {
        setError('Failed to retrieve messages. Please try again.');
        setMessages([]);
        console.error('Failed to fetch messages:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchMessages();
  }, []);

  const handleSendMessage = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const token = localStorage.getItem('token');
      if (!token) {
        setError('Authentication required. Please login.');
        return;
      }

      await createMessage(token, consultantId, newMessage);
      setNewMessage('');

      // Fetch updated messages after sending
      const updatedMessages = await getMessages(token);
      setMessages(updatedMessages);
    } catch (err) {
      setError('Failed to send message. Please try again.');
      console.error('Message sending failed:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 p-10">
      {/* Message List */}
      <section className="max-w-4xl mx-auto bg-white rounded-2xl shadow-xl p-8 mb-8">
        <h2 className="text-3xl font-semibold text-gray-800 mb-4">
          Messaging
        </h2>

        {loading && <p className="text-center">Loading messages...</p>}
        {error && <p className="text-center text-red-500">{error}</p>}

        <div className="space-y-4">
          {messages.map((message) => (
            <div
              key={message.id}
              className={`rounded-2xl p-4 ${message.userId === 1 ? 'bg-blue-100 self-end' : 'bg-gray-100 self-start'
                }`}
              style={{ maxWidth: '80%' }}
            >
              <p className="text-gray-700">{message.message}</p>
              <p className="text-gray-500 text-sm mt-1 text-right">
                {message.timestamp}
              </p>
            </div>
          ))}
        </div>

        {/* Message Input */}
        <form onSubmit={handleSendMessage} className="mt-8">
          <div className="flex items-center">
            <textarea
              className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
              placeholder="Type your message..."
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
            />
            <button
              type="submit"
              className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline ml-4"
            >
              <MessageCircle className="inline-block h-5 w-5 mr-1" />
              Send
            </button>
          </div>
        </form>
      </section>
    </div>
  );
};

export default Messaging;