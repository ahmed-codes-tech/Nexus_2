import React, { useState } from 'react';
import Calendar from 'react-calendar';
import 'react-calendar/dist/Calendar.css';
import { Video, Phone, Clock, Users, CheckCircle, XCircle, Menu, X } from 'lucide-react';

import { useMeetings } from '../../context/CalenderContext';
import { Card, CardBody } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Badge } from '../../components/ui/Badge';
import { Avatar } from '../../components/ui/Avatar';
import { useAuth } from '../../context/AuthContext';
import { VideoCall } from '../../components/VideoCall/VideoCall';

type MeetingStatus = 'pending' | 'accepted' | 'declined';

export const CalendarPage: React.FC = () => {
  const [date, setDate] = useState(new Date());
  const [availability, setAvailability] = useState<string[]>([]);
  const [isRequestOpen, setIsRequestOpen] = useState(false);
  const [search, setSearch] = useState('');
  const [activeCall, setActiveCall] = useState<{ id: string; title: string } | null>(null);
  const [selectedMeetingForCall, setSelectedMeetingForCall] = useState<any>(null);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const { addMeeting, selectedDate, setSelectedDate, meetings, updateMeeting } = useMeetings();
  const { user } = useAuth();

  const startVideoCall = (meetingId: string, meetingTitle: string) => {
    setActiveCall({ id: meetingId, title: meetingTitle });
  };

  // Dummy users (replace later with API)
  const users = [
    {
      id: 1,
      name: 'Sarah Johnson',
      avatar: 'https://images.pexels.com/photos/774909/pexels-photo-774909.jpeg'
    },
    {
      id: 2,
      name: 'Michael Rodriguez',
      avatar: 'https://images.pexels.com/photos/2379004/pexels-photo-2379004.jpeg'
    }
  ];

  const filteredUsers = users.filter(u =>
    u.name.toLowerCase().includes(search.toLowerCase())
  );

  const sendMeetingRequest = (userItem: any) => {
    if (!selectedDate) {
      alert('Select a date from calendar first');
      return;
    }

    addMeeting({
      id: Date.now(),
      title: `Meeting with ${userItem.name}`,
      start: selectedDate.toISOString(),
      end: selectedDate.toISOString(),
      status: 'pending',
      user: userItem
    });

    setIsRequestOpen(false);
  };

  const addAvailability = () => {
    const selectedDateStr = date.toDateString();

    if (!availability.includes(selectedDateStr)) {
      setAvailability(prev => [...prev, selectedDateStr]);
    }

    addMeeting({
      id: Date.now(),
      title: 'Available Meeting Slot',
      start: date.toISOString(),
      end: date.toISOString(),
      status: 'pending',
    });
  };

  const updateMeetingStatus = (id: number, status: MeetingStatus) => {
    updateMeeting(id, status);
  };

  const handleJoinCall = (meeting: any) => {
    setSelectedMeetingForCall(meeting);
    startVideoCall(meeting.id.toString(), meeting.title);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Mobile Header */}
      <div className="lg:hidden bg-white border-b border-gray-200 sticky top-0 z-40">
        <div className="flex items-center justify-between px-4 py-3">
          <div>
            <h1 className="text-lg font-bold text-gray-900">Meeting Scheduler</h1>
            <p className="text-xs text-gray-500">Manage your meetings</p>
          </div>
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="p-2 rounded-lg hover:bg-gray-100"
          >
            {mobileMenuOpen ? <X size={20} /> : <Menu size={20} />}
          </button>
        </div>
        
        {/* Mobile Menu Dropdown */}
        {mobileMenuOpen && (
          <div className="border-t border-gray-200 p-4 space-y-3">
            <Button onClick={addAvailability} fullWidth className="bg-blue-600 hover:bg-blue-700">
              Add Availability
            </Button>
            <Button onClick={() => setIsRequestOpen(true)} fullWidth variant="outline">
              Request Meeting
            </Button>
          </div>
        )}
      </div>

      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-6 lg:py-8">
        <div className="space-y-4 sm:space-y-6">
          {/* Desktop Header - Hidden on mobile */}
          <div className="hidden lg:flex justify-between items-center">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Meeting Scheduler</h1>
              <p className="text-gray-600">Manage availability and meeting requests</p>
            </div>
            <Button onClick={addAvailability} className="bg-blue-600 hover:bg-blue-700">
              Add Availability
            </Button>
          </div>

          {/* Desktop Action Buttons - Hidden on mobile */}
          <div className="hidden lg:block">
            <Button onClick={() => setIsRequestOpen(true)}>
              Request Meeting
            </Button>
          </div>

          {/* Calendar Section - Responsive Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6">
            {/* Calendar Card */}
            <div className="lg:col-span-2">
              <Card>
                <CardBody className="p-3 sm:p-4 md:p-6">
                  <div className="overflow-x-auto">
                    <div className="min-w-[300px]">
                      <Calendar
                        onChange={(value) => {
                          setDate(value as Date);
                          setSelectedDate(value as Date);
                        }}
                        value={date}
                        className="responsive-calendar"
                      />
                    </div>
                  </div>
                </CardBody>
              </Card>
            </div>

            {/* Availability Card - Moves to top on mobile */}
            <div>
              <Card>
                <CardBody className="p-4 sm:p-6">
                  <h2 className="font-semibold mb-3 text-gray-900 text-base sm:text-lg">
                    Your Availability
                  </h2>
                  <div className="flex flex-wrap gap-2">
                    {availability.length === 0 ? (
                      <p className="text-gray-500 text-sm">No availability added</p>
                    ) : (
                      availability.map((slot, index) => (
                        <Badge key={index} variant="secondary" className="text-xs sm:text-sm">
                          {slot}
                        </Badge>
                      ))
                    )}
                  </div>
                </CardBody>
              </Card>
            </div>
          </div>

          {/* Meeting Requests Section */}
          <div>
            <h2 className="font-semibold mb-3 text-gray-900 text-base sm:text-lg flex items-center justify-between">
              <span>Meeting Requests</span>
              <Badge variant="primary" className="text-xs">
                {meetings.filter(m => m.status === 'pending').length} pending
              </Badge>
            </h2>
            <div className="space-y-3 sm:space-y-4">
              {meetings.filter(m => m.status === 'pending').length === 0 ? (
                <Card>
                  <CardBody className="text-center py-8 sm:py-12">
                    <div className="inline-flex items-center justify-center w-12 h-12 sm:w-16 sm:h-16 rounded-full bg-gray-100 mb-3 sm:mb-4">
                      <Clock size={24} className="text-gray-400 sm:w-6 sm:h-6" />
                    </div>
                    <p className="text-gray-500 text-sm sm:text-base">No pending requests</p>
                    <p className="text-xs sm:text-sm text-gray-400 mt-1">
                  When someone requests a meeting, it will appear here
                    </p>
                  </CardBody>
                </Card>
              ) : (
                meetings.filter(m => m.status === 'pending').map(meeting => (
                  <Card key={meeting.id}>
                    <CardBody className="p-4 sm:p-6">
                      <div className="flex flex-col sm:flex-row sm:items-start gap-4">
                        {meeting.user && (
                          <div className="flex-shrink-0 self-start">
                            <Avatar
                              src={meeting.user.avatar}
                              alt={meeting.user.name}
                              size="sm"
                            />
                          </div>
                        )}
                        <div className="flex-1 min-w-0">
                          <h3 className="font-medium text-gray-900 text-sm sm:text-base">
                            {meeting.title}
                          </h3>
                          <p className="text-xs sm:text-sm text-gray-500 mt-1">
                            {new Date(meeting.start).toLocaleDateString()} at{' '}
                            {new Date(meeting.start).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                          </p>
                          <div className="mt-2">
                            <Badge variant="secondary" className="text-xs">
                              {meeting.status}
                            </Badge>
                          </div>
                          <div className="flex flex-col sm:flex-row gap-2 mt-3">
                            <Button
                              size="sm"
                              onClick={() => updateMeetingStatus(meeting.id, 'accepted')}
                              className="w-full sm:w-auto"
                            >
                              Accept
                            </Button>
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => updateMeetingStatus(meeting.id, 'declined')}
                              className="w-full sm:w-auto"
                            >
                              Decline
                            </Button>
                          </div>
                        </div>
                      </div>
                    </CardBody>
                  </Card>
                ))
              )}
            </div>
          </div>

          {/* Confirmed Meetings Section */}
          <div>
            <h2 className="font-semibold mb-3 text-gray-900 text-base sm:text-lg">
              Confirmed Meetings
            </h2>
            <div className="space-y-3 sm:space-y-4">
              {meetings.filter(m => m.status === 'accepted').length === 0 ? (
                <Card>
                  <CardBody className="text-center py-8 sm:py-12">
                    <div className="inline-flex items-center justify-center w-12 h-12 sm:w-16 sm:h-16 rounded-full bg-gray-100 mb-3 sm:mb-4">
                      <Video size={24} className="text-gray-400" />
                    </div>
                    <p className="text-gray-500 text-sm sm:text-base">No confirmed meetings</p>
                    <p className="text-xs sm:text-sm text-gray-400 mt-1">
                      Accepted meeting requests will appear here
                    </p>
                  </CardBody>
                </Card>
              ) : (
                meetings
                  .filter(m => m.status === 'accepted')
                  .map(meeting => (
                    <Card key={meeting.id}>
                      <CardBody className="p-4 sm:p-6">
                        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                          <div className="flex-1 min-w-0">
                            <p className="font-medium text-gray-900 text-sm sm:text-base">
                              {meeting.title}
                            </p>
                            <p className="text-xs sm:text-sm text-gray-500 mt-1">
                              {new Date(meeting.start).toLocaleDateString()} at{' '}
                              {new Date(meeting.start).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                            </p>
                            {meeting.user && (
                              <p className="text-xs sm:text-sm text-gray-600 mt-1 flex items-center gap-1">
                                <Users size={12} />
                                With: {meeting.user.name}
                              </p>
                            )}
                          </div>
                          <Button
                            onClick={() => handleJoinCall(meeting)}
                            className="bg-green-600 hover:bg-green-700 flex items-center gap-2 w-full sm:w-auto justify-center"
                          >
                            <Video size={16} />
                            Join Call
                          </Button>
                        </div>
                      </CardBody>
                    </Card>
                  ))
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Request Meeting Modal - Responsive */}
      {isRequestOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50 p-4">
          <div className="bg-white w-full max-w-md rounded-xl p-4 sm:p-6 space-y-4 max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center">
              <h2 className="text-lg sm:text-xl font-semibold text-gray-900">
                Send Meeting Request
              </h2>
              <button
                onClick={() => setIsRequestOpen(false)}
                className="p-1 hover:bg-gray-100 rounded-lg transition"
              >
                <X size={20} />
              </button>
            </div>

            <input
              type="text"
              placeholder="Search users..."
              className="w-full border p-2 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm sm:text-base"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />

            <div className="space-y-3 max-h-60 overflow-y-auto">
              {filteredUsers.length === 0 ? (
                <p className="text-gray-500 text-center py-4">No users found</p>
              ) : (
                filteredUsers.map(u => (
                  <div key={u.id} className="flex items-center justify-between border p-3 rounded-lg">
                    <div className="flex items-center gap-3 min-w-0 flex-1">
                      <Avatar src={u.avatar} alt={u.name} size="sm" className="flex-shrink-0" />
                      <span className="font-medium text-sm sm:text-base truncate">{u.name}</span>
                    </div>
                    <Button size="sm" onClick={() => sendMeetingRequest(u)} className="ml-2 flex-shrink-0">
                      Send
                    </Button>
                  </div>
                ))
              )}
            </div>

            <Button variant="ghost" fullWidth onClick={() => setIsRequestOpen(false)}>
              Close
            </Button>
          </div>
        </div>
      )}

      {/* Video Call Modal */}
      {activeCall && (
        <VideoCall
          meetingId={activeCall.id}
          meetingTitle={activeCall.title}
          onEndCall={() => {
            setActiveCall(null);
            setSelectedMeetingForCall(null);
          }}
          isInitiator={true}
        />
      )}
    </div>
  );
};