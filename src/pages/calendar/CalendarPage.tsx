import React, { useState } from 'react';
import Calendar from 'react-calendar';
import 'react-calendar/dist/Calendar.css';

import { useMeetings } from '../../context/CalenderContext';

import { Card, CardBody } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Badge } from '../../components/ui/Badge';
import { Avatar } from '../../components/ui/Avatar';
import { useAuth } from '../../context/AuthContext';

type MeetingStatus = 'pending' | 'accepted' | 'declined';

export const CalendarPage: React.FC = () => {
  const [date, setDate] = useState(new Date());
  const [availability, setAvailability] = useState<string[]>([]);

  const { addMeeting, selectedDate } = useMeetings();

  const [isRequestOpen, setIsRequestOpen] = useState(false);
  const [search, setSearch] = useState('');

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
      status: 'sent',
      user: userItem
    });

    setIsRequestOpen(false);
  };

  const { user } = useAuth();

  // ✅ FIX: use context INSIDE component
  const { meetings, updateMeeting } = useMeetings();

  // 🟢 Add availability + create meeting
  const addAvailability = () => {
    const selectedDate = date.toDateString();

    if (!availability.includes(selectedDate)) {
      setAvailability(prev => [...prev, selectedDate]);
    }

    // ✅ ALSO create meeting (this updates dashboard too)
    addMeeting({
      id: Date.now(),
      title: 'Available Meeting Slot',
      start: date.toISOString(),
      end: date.toISOString(),
      status: 'pending',
    });
  };

  // 🔄 Update meeting status (GLOBAL)
  const updateMeetingStatus = (id: number, status: MeetingStatus) => {
    updateMeeting(id, status);
  };
  const { setSelectedDate } = useMeetings();

  return (
    <div className="space-y-6">

      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold">Meeting Scheduler</h1>
          <p className="text-gray-600">
            Manage availability and meeting requests
          </p>
        </div>

        <Button onClick={addAvailability}>
          Add Availability
        </Button>
      </div>

      {/* Calendar */}
      <Card>
        <CardBody>
          <Calendar
            onChange={(value) => {
              setDate(value as Date);
              setSelectedDate(value as Date); // 🔥 key
            }}
            value={date}
          />
          <Button

            className="mt-4"
            onClick={() => setIsRequestOpen(true)}
          >
            Request Meeting
          </Button>
        </CardBody>
      </Card>

      {/* Availability */}
      <Card>
        <CardBody>
          <h2 className="font-semibold mb-3">Your Availability</h2>

          <div className="flex flex-wrap gap-2">
            {availability.length === 0 ? (
              <p className="text-gray-500">No availability added</p>
            ) : (
              availability.map((slot, index) => (
                <Badge key={index} variant="secondary">
                  {slot}
                </Badge>
              ))
            )}
          </div>
        </CardBody>
      </Card>

      {/* Meeting Requests */}
      <div>
        <h2 className="font-semibold mb-3">Meeting Requests</h2>

        <div className="space-y-4">
          {meetings.map(meeting => (
            <Card key={meeting.id}>
              <CardBody className="flex items-start gap-4">

                {user && (
                  <Avatar
                    src={user.avatarUrl}
                    alt={user.name}
                    size="sm"
                    status={user.isOnline ? 'online' : 'offline'}
                  />
                )}

                <div className="flex-1">
                  <h3 className="font-medium">{meeting.title}</h3>

                  <p className="text-sm text-gray-500 mt-1">
                    {new Date(meeting.start).toLocaleDateString()}
                  </p>

                  <div className="mt-2">
                    <Badge
                      variant={
                        meeting.status === 'accepted'
                          ? 'primary'
                          : 'secondary'
                      }
                    >
                      {meeting.status}
                    </Badge>
                  </div>

                  {/* Actions */}
                  {meeting.status === 'pending' && (
                    <div className="flex gap-2 mt-3">
                      <Button
                        size="sm"
                        onClick={() =>
                          updateMeetingStatus(meeting.id, 'accepted')
                        }
                      >
                        Accept
                      </Button>

                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() =>
                          updateMeetingStatus(meeting.id, 'declined')
                        }
                      >
                        Decline
                      </Button>
                    </div>
                  )}
                </div>

              </CardBody>
            </Card>
          ))}
        </div>
      </div>

      {/* Confirmed Meetings */}
      <div>
        <h2 className="font-semibold mb-3">Confirmed Meetings</h2>

        <div className="space-y-3">
          {meetings.filter(m => m.status === 'accepted').length === 0 ? (
            <p className="text-gray-500">No confirmed meetings</p>
          ) : (
            meetings
              .filter(m => m.status === 'accepted')
              .map(meeting => (
                <Card key={meeting.id}>
                  <CardBody>
                    <p className="font-medium">
                      {meeting.title}
                    </p>
                    <p className="text-sm text-gray-500">
                      {new Date(meeting.start).toLocaleDateString()}
                    </p>
                  </CardBody>
                </Card>
              ))
          )}
        </div>
      </div>
      {isRequestOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50">

          <div className="bg-white w-full max-w-md rounded-xl p-4 space-y-4">

            <h2 className="text-lg font-semibold">Send Meeting Request</h2>

            {/* Search */}
            <input
              type="text"
              placeholder="Search users..."
              className="w-full border p-2 rounded-md"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />

            {/* Users */}
            <div className="space-y-3 max-h-60 overflow-y-auto">
              {filteredUsers.map(u => (
                <div
                  key={u.id}
                  className="flex items-center justify-between border p-2 rounded-lg"
                >
                  <div className="flex items-center gap-3">
                    <Avatar src={u.avatar} alt={u.name} size="sm" />
                    <span>{u.name}</span>
                  </div>

                  <Button
                    size="sm"
                    onClick={() => sendMeetingRequest(u)}
                  >
                    Send
                  </Button>
                </div>
              ))}
            </div>

            <Button
              variant="ghost"
              fullWidth
              onClick={() => setIsRequestOpen(false)}
            >
              Close
            </Button>

          </div>
        </div>
      )}
    </div>
  );
};