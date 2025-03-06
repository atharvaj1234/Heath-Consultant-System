import React, { useState, useEffect, useRef } from "react";
import axios from "axios";
import {
  sendMessage,
  updateChatRequest,
  getMessages,
  getChatRequests,
} from "../utils/api";
import {
  User,
  Clock,
  Send,
  Paperclip,
  ImagePlus,
  Loader2,
  AlertCircle,
} from "lucide-react";
import { Calendar, Eye, X, Check } from "lucide-react";
import { use } from "react";

const MessagingPage = () => {
  const [chatRequests, setChatRequests] = useState([]);
  const [selectedChatRequestId, setSelectedChatRequestId] = useState(null);
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [ispending, setIspending] = useState(true);
  const [userId, setUserId] = useState(localStorage.getItem("userId") || "");
  const [isConsultant, setIsConsutant] = useState(false);
  const [profilePicture, setProfilePicture] = useState(
    localStorage.getItem("profilePicture") || "https://via.placeholder.com/150"
  ); // Placeholder URL
  const messagesEndRef = useRef(null);

  useEffect(() => {
    const fetchChatRequests = async () => {
      setIsLoading(true);
      setError("");

      try {
        const data = await getChatRequests();
        setChatRequests(data);
        console.log(data);
        const ic = data[0].consultantId?.toString() == userId?.toString();
        setIsConsutant(ic);
      } catch (error) {
        setError("Failed to fetch chat requests.");
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
      const data = await getMessages(selectedChatRequestId);

      setMessages(data);
      setIsLoading(false);
    };

    fetchMessages();
  }, [selectedChatRequestId]);

  useEffect(() => {
    const isPending = (reqs) => reqs.filter((req) => req.id === selectedChatRequestId)
    const p =isPending(chatRequests)[0]?.status == "pending";
    setIspending(p);
    console.log(p)
  }, [chatRequests, selectedChatRequestId]);

//   useEffect(() => {
//     // Scroll to bottom on message change
//     messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
//   }, [messages]);

  const handleSendMessage = async () => {
    if (!newMessage.trim()) return; // Prevent sending empty messages

    try {
      const token = localStorage.getItem("token");
      if (!token) {
        setError("Authentication required. Please login.");
        return;
      }
      await sendMessage(token, selectedChatRequestId, newMessage);

      // After sending, fetch the messages again (optimistic update could be used here)
      const response = await getMessages(selectedChatRequestId);
      setMessages(response);
      setNewMessage("");
    } catch (error) {
      setError("Failed to send message.");
      console.error(error);
    }
  };

  const handleEnterPress = (e) => {
    if (e.key === "Enter") {
      handleSendMessage();
    }
  };

  const handleRequest = async (requestId, status) => {
    try {
      const token = localStorage.getItem("token");
      if (!token) {
        setError("Authentication required. Please login.");
        return;
      }
      await updateChatRequest(token, requestId, status);
      const data = await getChatRequests();
      setChatRequests(data);
    } catch (error) {
      setError("Failed to send message.");
      console.error(error);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50 flex items-center justify-center py-10">
      <div className="container mx-auto shadow-xl rounded-3xl overflow-hidden flex flex-col md:flex-row w-full max-w-8xl min-h-[85vh] border border-indigo-100">
        {/* Left Sidebar - Chat List */}
        <aside className="bg-white border-r border-gray-200 w-full md:w-1/3 p-4 flex flex-col">
          <h2 className="font-semibold text-gray-800 mb-3 flex items-center space-x-2">
            <User className="h-5 w-5 text-gray-500" />
            <span>{"Chats"}</span>
          </h2>

          {isLoading && (
            <div className="text-center text-gray-500 py-4">
              <Loader2 className="animate-spin inline-block mr-2" />
              Loading chats...
            </div>
          )}

          {error && (
            <div className="text-red-500 py-4 flex items-center">
              <AlertCircle className="h-4 w-4 mr-2" />
              {error}
            </div>
          )}

          {!isLoading && !error && chatRequests.length === 0 && (
            <p className="text-gray-500 py-4">No chats available.</p>
          )}

          <ul className="flex-grow overflow-y-auto">
            {chatRequests.map((req) => (
              <li key={req.id} onClick={() => setSelectedChatRequestId(req.id)}>
                <div
                  className={`flex items-center justify-between space-x-3 mt-2 py-3 px-4 rounded-xl transition-colors duration-200 hover:bg-gray-100 cursor-pointer ${
                    selectedChatRequestId === req.id
                      ? "bg-blue-100 font-semibold text-blue-800"
                      : "text-gray-700"
                  }`}
                >
                  <div className="flex flex-row space-x-3 ">
                    {isConsultant ? (
                      <>
                        <img
                          src={`http://localhost:5555/${req.userProfilePicture}`}
                          alt={`${req.userName}'s Profile`}
                          className="w-10 h-10 rounded-full object-cover shadow-inner"
                          onError={(e) => {
                            e.target.onerror = null;
                            e.target.src = profilePicture;
                          }} // Prevent broken images
                        />
                        <div className="flex flex-col overflow-hidden">
                          <span className="text-sm font-medium truncate">
                            {req.userName}
                          </span>
                          <div className="flex items-center space-x-1 text-xs text-gray-500">
                            <Clock className="h-4 w-4" />
                            <span className="truncate">
                              {new Date(req.bookingDate).toLocaleDateString()} /{" "}
                              {req.bookingTime}
                            </span>
                          </div>
                        </div>
                      </>
                    ) : (
                      <>
                        <img
                          src={`http://localhost:5555/${req .consultantProfilePicture}`}
                          alt={`${req.consultantName}'s Profile`}
                          className="w-10 h-10 rounded-full object-cover shadow-inner"
                          onError={(e) => {
                            e.target.onerror = null;
                            e.target.src = profilePicture;
                          }} // Prevent broken images
                        />
                        <div className="flex flex-col overflow-hidden">
                          <span className="text-sm font-medium truncate">
                            {req.consultantName}
                          </span>
                          <div className="flex items-center space-x-1 text-xs text-gray-500">
                            <Clock className="h-4 w-4" />
                            <span className="truncate">
                              {new Date(req.bookingDate).toLocaleDateString()} /{" "}
                              {req.bookingTime}
                            </span>
                          </div>
                        </div>
                      </>
                    )}
                  </div>
                  {req.status === "pending" && isConsultant && (
                    <div className="flex flex-row space-x-2">
                      <button
                        className="flex items-center cursor-pointer gap-1 bg-green-500 hover:bg-green-600 text-white py-2 px-4 rounded-lg shadow-md transition"
                        onClick={() => handleRequest(req.id, "accepted")}
                      >
                        <Check className="h-5 w-5" />
                      </button>
                      <button
                        className="flex items-center  cursor-pointer gap-1 bg-red-500 hover:bg-red-600 text-white py-2 px-4 rounded-lg shadow-md transition"
                        onClick={() => handleRequest(req.id, "rejected")}
                      >
                        <X className="h-5 w-5" />
                      </button>
                    </div>
                  )}
                </div>
              </li>
            ))}
          </ul>
        </aside>

        {/* Right Main - Chat Messages */}
        <main className="bg-blue-50 w-full md:w-2/3 flex flex-col">
          {selectedChatRequestId ? (
            <>
              {/* Message Area */}
              <div className="flex-grow p-4 space-y-2 overflow-y-auto max-h-[80vh]">
                {messages.map((msg) => (
                  <div
                    key={msg.id}
                    className={`rounded-2xl p-3 text-sm break-words max-w-[60%] shadow-sm ${
                      msg.senderId === parseInt(userId)
                        ? "bg-blue-200 ml-auto text-gray-800"
                        : "bg-white mr-auto text-gray-700"
                    }`}
                  >
                    {msg.message}
                    <div className="text-right text-xs opacity-70 mt-1">
                      {new Date(msg.timestamp).toLocaleTimeString()}
                    </div>
                  </div>
                ))}
                <div ref={messagesEndRef} /> {/* Scroll anchor */}
              </div>

              {/* Input Area */}
              <div
                className={`p-4 border-t border-gray-200 ${
                  ispending ? "pointer-events-none opacity-50" : ""
                }`}
              >
                <div className="flex items-center space-x-3">
                  <input
                    type="text"
                    value={newMessage}
                    onChange={(e) => setNewMessage(e.target.value)}
                    onKeyDown={handleEnterPress}
                    placeholder={ispending ? "Your consultant has't yet accepted your message request" : "Type your message..."}
                    disabled={ispending} // Properly disables the input
                    className="flex-grow border border-gray-300 rounded-full px-4 py-2 focus:ring-2 focus:ring-blue-200 outline-none disabled:bg-gray-100 disabled:cursor-not-allowed"
                  />
                  <button
                    onClick={!ispending ? handleSendMessage : null}
                    disabled={ispending} // Properly disables the button
                    className={`bg-blue-500 hover:bg-blue-600 text-white py-2 px-4 rounded-full flex items-center space-x-2 shadow-md transition-colors duration-200 disabled:bg-gray-400 disabled:cursor-not-allowed`}
                  >
                    <Send className="h-5 w-5" />
                    <span>Send</span>
                  </button>
                </div>
              </div>
            </>
          ) : (
            // No Chat Selected
            <div className="flex items-center justify-center h-full text-gray-500 text-lg">
              Select a chat to start messaging.
            </div>
          )}
        </main>
      </div>
    </div>
  );
};

export default MessagingPage;
