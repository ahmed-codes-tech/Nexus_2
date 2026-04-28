import React, { useState, useRef, useEffect } from 'react';
import {
  Video,
  VideoOff,
  Mic,
  MicOff,
  PhoneOff,
  Users,
  Share2,
  MessageCircle,
  Settings,
  Maximize2,
  Minimize2,
  Camera,
  Monitor,
  X
} from 'lucide-react';
import { Avatar } from '../ui/Avatar';

interface VideoCallProps {
  meetingId: string;
  meetingTitle: string;
  onEndCall: () => void;
  isInitiator?: boolean;
  participants?: Participant[];
}

interface Participant {
  id: string;
  name: string;
  avatar?: string;
  isVideoOn: boolean;
  isAudioOn: boolean;
  isMain?: boolean;
  isOnline?: boolean;
}

export const VideoCall: React.FC<VideoCallProps> = ({
  meetingId,
  meetingTitle,
  onEndCall,
  isInitiator = true,
  participants: externalParticipants
}) => {
  const [isVideoOn, setIsVideoOn] = useState(true);
  const [isAudioOn, setIsAudioOn] = useState(true);
  const [isScreenSharing, setIsScreenSharing] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [showChat, setShowChat] = useState(false);
  const [callDuration, setCallDuration] = useState(0);
  const [participants, setParticipants] = useState<Participant[]>(
    externalParticipants || [
      { 
        id: '1', 
        name: 'You', 
        avatar: 'https://images.pexels.com/photos/771742/pexels-photo-771742.jpeg',
        isVideoOn: true, 
        isAudioOn: true, 
        isMain: true,
        isOnline: true
      },
      { 
        id: '2', 
        name: 'John Investor', 
        avatar: 'https://images.pexels.com/photos/2379004/pexels-photo-2379004.jpeg',
        isVideoOn: true, 
        isAudioOn: true, 
        isMain: false,
        isOnline: true
      },
      { 
        id: '3', 
        name: 'Sarah Partner', 
        avatar: 'https://images.pexels.com/photos/774909/pexels-photo-774909.jpeg',
        isVideoOn: false, 
        isAudioOn: true, 
        isMain: false,
        isOnline: true
      },
      { 
        id: '4', 
        name: 'Mike Mentor', 
        avatar: 'https://images.pexels.com/photos/220453/pexels-photo-220453.jpeg',
        isVideoOn: true, 
        isAudioOn: false, 
        isMain: false,
        isOnline: false
      },
    ]
  );
  
  const [messages, setMessages] = useState([
    { id: '1', user: 'John Investor', avatar: 'https://images.pexels.com/photos/2379004/pexels-photo-2379004.jpeg', text: 'Hi everyone! Ready for the pitch?', time: '10:30 AM' },
    { id: '2', user: 'Sarah Partner', avatar: 'https://images.pexels.com/photos/774909/pexels-photo-774909.jpeg', text: 'Excited to hear about your startup!', time: '10:31 AM' },
    { id: '3', user: 'You', avatar: 'https://images.pexels.com/photos/771742/pexels-photo-771742.jpeg', text: 'Thanks for joining! Let me share my screen.', time: '10:32 AM' },
  ]);
  const [newMessage, setNewMessage] = useState('');
  
  const videoRef = useRef<HTMLVideoElement>(null);
  const callContainerRef = useRef<HTMLDivElement>(null);

  // Mock local video stream
  useEffect(() => {
    if (isVideoOn && videoRef.current) {
      // Mock: Create a fake video stream (black video with text)
      const canvas = document.createElement('canvas');
      canvas.width = 640;
      canvas.height = 480;
      const ctx = canvas.getContext('2d');
      if (ctx) {
        ctx.fillStyle = '#1a1a1a';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        ctx.fillStyle = '#ffffff';
        ctx.font = '24px Arial';
        ctx.fillText('Your Camera', canvas.width / 2 - 80, canvas.height / 2);
        ctx.font = '16px Arial';
        ctx.fillText('Video Mock Mode', canvas.width / 2 - 70, canvas.height / 2 + 40);
      }
      const stream = canvas.captureStream();
      videoRef.current.srcObject = stream;
      videoRef.current.play().catch(e => console.log('Video play error:', e));
    }
  }, [isVideoOn]);

  // Timer for call duration
  useEffect(() => {
    const timer = setInterval(() => {
      setCallDuration(prev => prev + 1);
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const formatDuration = (seconds: number) => {
    const hrs = Math.floor(seconds / 3600);
    const mins = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    if (hrs > 0) {
      return `${hrs}:${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    }
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const toggleVideo = () => {
    setIsVideoOn(!isVideoOn);
    setParticipants(participants.map(p => 
      p.id === '1' ? { ...p, isVideoOn: !isVideoOn } : p
    ));
  };

  const toggleAudio = () => {
    setIsAudioOn(!isAudioOn);
    setParticipants(participants.map(p => 
      p.id === '1' ? { ...p, isAudioOn: !isAudioOn } : p
    ));
  };

  const toggleScreenShare = () => {
    setIsScreenSharing(!isScreenSharing);
    const mockMessage = {
      id: Date.now().toString(),
      user: 'System',
      avatar: '',
      text: isScreenSharing ? 'Stopped sharing screen' : 'Started sharing screen',
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };
    setMessages([...messages, mockMessage]);
  };

  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      callContainerRef.current?.requestFullscreen();
      setIsFullscreen(true);
    } else {
      document.exitFullscreen();
      setIsFullscreen(false);
    }
  };

  const sendMessage = () => {
    if (newMessage.trim()) {
      const currentUser = participants.find(p => p.id === '1');
      setMessages([
        ...messages,
        {
          id: Date.now().toString(),
          user: 'You',
          avatar: currentUser?.avatar || '',
          text: newMessage,
          time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        }
      ]);
      setNewMessage('');
    }
  };

  const handleEndCall = () => {
    if (confirm('Are you sure you want to end the call?')) {
      onEndCall();
    }
  };

  // Get initials for avatar fallback
  const getInitials = (name: string) => {
    return name.charAt(0).toUpperCase();
  };

  return (
    <div ref={callContainerRef} className="fixed inset-0 bg-gray-900 z-50 flex flex-col">
      {/* Header */}
      <div className="bg-gradient-to-r from-gray-800 to-gray-900 text-white px-6 py-4 flex justify-between items-center shadow-lg">
        <div>
          <h2 className="text-xl font-semibold">{meetingTitle}</h2>
          <p className="text-sm text-gray-400">
            Meeting ID: {meetingId} • Duration: {formatDuration(callDuration)}
          </p>
        </div>
        <div className="flex gap-3">
          <button
            onClick={toggleFullscreen}
            className="p-2 hover:bg-gray-700 rounded-lg transition"
            title="Fullscreen"
          >
            {isFullscreen ? <Minimize2 size={20} /> : <Maximize2 size={20} />}
          </button>
          <button
            onClick={() => setShowChat(!showChat)}
            className="p-2 hover:bg-gray-700 rounded-lg transition relative"
            title="Chat"
          >
            <MessageCircle size={20} />
            {messages.length > 0 && (
              <span className="absolute top-0 right-0 w-2 h-2 bg-blue-500 rounded-full"></span>
            )}
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex overflow-hidden">
        {/* Video Grid */}
        <div className={`flex-1 p-4 overflow-auto transition-all ${showChat ? 'mr-80' : ''}`}>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 h-full">
            {/* Main/Your Video */}
            <div className="relative bg-gray-800 rounded-xl overflow-hidden aspect-video">
              {isVideoOn ? (
                <video
                  ref={videoRef}
                  autoPlay
                  muted
                  playsInline
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center bg-gray-700">
                  <div className="text-center">
                    <Avatar
                      src={participants.find(p => p.id === '1')?.avatar ?? ''}
                      alt="You"
                      size="xl"
                      className="mx-auto mb-3"
                    />
                    <p className="text-white font-semibold">You</p>
                    <p className="text-sm text-gray-400">Camera Off</p>
                  </div>
                </div>
              )}
              <div className="absolute bottom-2 left-2 bg-black bg-opacity-50 px-2 py-1 rounded text-white text-sm flex items-center gap-2">
                <Avatar
                  src={participants.find(p => p.id === '1')?.avatar ?? ''}
                  alt="You"
                  size="xs"
                  status="online"
                />
                You {!isAudioOn && '(Muted)'}
              </div>
              {!isAudioOn && (
                <div className="absolute top-2 right-2 bg-red-500 rounded-full p-1">
                  <MicOff size={12} className="text-white" />
                </div>
              )}
            </div>

            {/* Other Participants */}
            {participants.filter(p => !p.isMain).map((participant) => (
              <div key={participant.id} className="relative bg-gray-800 rounded-xl overflow-hidden aspect-video">
                {participant.isVideoOn ? (
                  <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-blue-600 to-purple-600">
                    <div className="text-center text-white">
                      <Avatar
                        src={participant.avatar ?? ''}
                        alt={participant.name}
                        size="xl"
                        status={participant.isOnline ? 'online' : 'offline'}
                        className=""
                      />
                      <p className="font-semibold text-lg">{participant.name}</p>
                      <p className="text-xs opacity-75 mt-1">
                        {participant.isOnline ? 'Connected' : 'Reconnecting...'}
                      </p>
                    </div>
                  </div>
                ) : (
                  <div className="w-full h-full flex items-center justify-center bg-gray-700">
                    <div className="text-center">
                      <Avatar
                        src={participant.avatar ?? ''}
                        alt={participant.name}
                        size="xl"
                        status={participant.isOnline ? 'online' : 'offline'}
                        className="mx-auto mb-3"
                      />
                      <p className="text-white font-semibold">{participant.name}</p>
                      <p className="text-sm text-gray-400">Camera Off</p>
                    </div>
                  </div>
                )}
                <div className="absolute bottom-2 left-2 bg-black bg-opacity-50 px-2 py-1 rounded text-white text-sm flex items-center gap-2">
                  <Avatar
                    src={participant.avatar ?? ''}
                    alt={participant.name}
                    size="xs"
                    status={participant.isOnline ? 'online' : 'offline'}
                  />
                  {participant.name}
                  {!participant.isAudioOn && ' (Muted)'}
                  {!participant.isOnline && ' (Connecting...)'}
                </div>
                {!participant.isAudioOn && (
                  <div className="absolute top-2 right-2 bg-red-500 rounded-full p-1">
                    <MicOff size={12} className="text-white" />
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Chat Sidebar */}
        {showChat && (
          <div className="w-80 bg-white border-l border-gray-200 flex flex-col">
            <div className="p-4 border-b bg-gray-50 flex justify-between items-center">
              <h3 className="font-semibold text-gray-900">Meeting Chat</h3>
              <button onClick={() => setShowChat(false)} className="hover:bg-gray-200 p-1 rounded">
                <X size={18} />
              </button>
            </div>
            <div className="flex-1 overflow-y-auto p-4 space-y-3">
              {messages.map((msg) => (
                <div key={msg.id} className={`flex flex-col ${msg.user === 'You' ? 'items-end' : 'items-start'}`}>
                  <div className={`flex items-start gap-2 max-w-[80%] ${msg.user === 'You' ? 'flex-row-reverse' : 'flex-row'}`}>
                    {msg.user !== 'You' && msg.user !== 'System' && (
                      <Avatar
                        src={msg.avatar}
                        alt={msg.user}
                        size="sm"
                        className="flex-shrink-0"
                      />
                    )}
                    <div className={`rounded-lg p-3 ${msg.user === 'You' ? 'bg-blue-500 text-white' : msg.user === 'System' ? 'bg-gray-200 text-gray-600' : 'bg-gray-100 text-gray-900'}`}>
                      {msg.user !== 'System' && (
                        <p className="text-sm font-semibold mb-1">{msg.user}</p>
                      )}
                      <p className="text-sm">{msg.text}</p>
                      <p className={`text-xs mt-1 ${msg.user === 'You' ? 'text-blue-100' : 'text-gray-500'}`}>
                        {msg.time}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
            <div className="p-4 border-t">
              <div className="flex gap-2">
                <input
                  type="text"
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && sendMessage()}
                  placeholder="Type a message..."
                  className="flex-1 px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                <button
                  onClick={sendMessage}
                  className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition"
                >
                  Send
                </button>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Controls */}
      <div className="bg-gradient-to-r from-gray-800 to-gray-900 text-white py-4 px-6">
        <div className="flex justify-center items-center gap-4">
          {/* Audio Toggle */}
          <button
            onClick={toggleAudio}
            className={`p-4 rounded-full transition-all transform hover:scale-105 ${
              isAudioOn ? 'bg-gray-700 hover:bg-gray-600' : 'bg-red-600 hover:bg-red-700'
            }`}
            title={isAudioOn ? 'Mute' : 'Unmute'}
          >
            {isAudioOn ? <Mic size={24} /> : <MicOff size={24} />}
          </button>

          {/* Video Toggle */}
          <button
            onClick={toggleVideo}
            className={`p-4 rounded-full transition-all transform hover:scale-105 ${
              isVideoOn ? 'bg-gray-700 hover:bg-gray-600' : 'bg-red-600 hover:bg-red-700'
            }`}
            title={isVideoOn ? 'Turn off camera' : 'Turn on camera'}
          >
            {isVideoOn ? <Video size={24} /> : <VideoOff size={24} />}
          </button>

          {/* Screen Share */}
          <button
            onClick={toggleScreenShare}
            className={`p-4 rounded-full transition-all transform hover:scale-105 ${
              isScreenSharing ? 'bg-green-600 hover:bg-green-700' : 'bg-gray-700 hover:bg-gray-600'
            }`}
            title={isScreenSharing ? 'Stop sharing' : 'Share screen'}
          >
            <Monitor size={24} />
          </button>

          {/* End Call */}
          <button
            onClick={handleEndCall}
            className="p-4 bg-red-600 rounded-full hover:bg-red-700 transition-all transform hover:scale-105"
            title="End call"
          >
            <PhoneOff size={24} />
          </button>
        </div>
        
        {/* Participant Count */}
        <div className="text-center mt-3 text-sm text-gray-400">
          <div className="flex items-center justify-center gap-2">
            <Users size={14} />
            {participants.length} participants in call
          </div>
        </div>
      </div>
    </div>
  );
};