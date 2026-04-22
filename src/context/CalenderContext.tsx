import React, { createContext, useContext, useState } from 'react';

type MeetingStatus = 'pending' | 'accepted' | 'declined' | 'sent';

interface Meeting {
  id: number;
  title: string;
  start: string;
  end: string;
  status: MeetingStatus;
  user?: {
    name: string;
    avatar: string;
  };
}

interface MeetingContextType {
  meetings: Meeting[];
  addMeeting: (meeting: Meeting) => void;
  updateMeeting: (id: number, status: MeetingStatus) => void;
  selectedDate: Date | null;
  setSelectedDate: (date: Date | null) => void;
}

const MeetingContext = createContext<MeetingContextType | null>(null);

export const MeetingProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [meetings, setMeetings] = useState<Meeting[]>([]);
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);

  const addMeeting = (meeting: Meeting) => {
    setMeetings(prev => [...prev, meeting]);
  };

  const updateMeeting = (id: number, status: MeetingStatus) => {
    setMeetings(prev =>
      prev.map(m => (m.id === id ? { ...m, status } : m))
    );
  };

  return (
    <MeetingContext.Provider value={{ 
  meetings, 
  addMeeting, 
  updateMeeting, 
  selectedDate,
  setSelectedDate
}}>
      {children}
    </MeetingContext.Provider>
  );
};

export const useMeetings = () => {
  const context = useContext(MeetingContext);
  if (!context) throw new Error('useMeetings must be used inside MeetingProvider');
  return context;
};