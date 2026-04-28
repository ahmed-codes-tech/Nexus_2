import React from 'react';
import { useNavigate } from 'react-router-dom';
import { MessageCircle } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { getConversationsForUser } from '../../data/messages';
import { ChatUserList } from '../../components/chat/ChatUserList';

export const MessagesPage: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  
  if (!user) return null;
  
  const conversations = getConversationsForUser(user.id);
  
  // Handle conversation click
  const handleConversationClick = (userId: string) => {
    navigate(`/chat/${userId}`);
  };
  
  return (
    <div className="h-[calc(100vh-8rem)] bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden animate-fade-in">
      {conversations.length > 0 ? (
        <ChatUserList 
          conversations={conversations} 
          onConversationClick={handleConversationClick}
        />
      ) : (
        <div className="h-full flex flex-col items-center justify-center p-4 sm:p-8">
          <div className="bg-gray-100 p-4 sm:p-6 rounded-full mb-4">
            <MessageCircle size={32} className="text-gray-400" />
          </div>
          <h2 className="text-lg sm:text-xl font-medium text-gray-900">No messages yet</h2>
          <p className="text-sm sm:text-base text-gray-600 text-center mt-2 max-w-md">
            Start connecting with entrepreneurs and investors to begin conversations
          </p>
          <button
            onClick={() => navigate('/investors')}
            className="mt-6 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            Find People to Connect With
          </button>
        </div>
      )}
    </div>
  );
};