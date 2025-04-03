'use client';

import { useState } from 'react';
import { MessageSquare, Phone, Search, Send } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { cn } from '@/lib/utils';

// Mock data
const mockChats = [
  {
    id: 1,
    phoneNumber: '+91 98765 43210',
    lastMessage: 'I would like to schedule a viewing for the 3BHK apartment in Andheri',
    timestamp: '2:30 PM',
    unread: 2,
  },
  {
    id: 2,
    phoneNumber: '+91 87654 32109',
    lastMessage: 'What is the maintenance cost for the property?',
    timestamp: '1:45 PM',
    unread: 0,
  },
  {
    id: 3,
    phoneNumber: '+91 76543 21098',
    lastMessage: 'Thank you for the property details. When can I visit?',
    timestamp: '12:15 PM',
    unread: 1,
  },
  {
    id: 4,
    phoneNumber: '+91 65432 10987',
    lastMessage: 'Is parking available for 2 cars?',
    timestamp: '11:30 AM',
    unread: 0,
  },
  {
    id: 5,
    phoneNumber: '+91 54321 09876',
    lastMessage: 'I am interested in the commercial space in Bandra',
    timestamp: '10:45 AM',
    unread: 3,
  },
];

const mockMessages = {
  1: [
    {
      id: 1,
      text: 'Hello, I saw the listing for the 3BHK apartment in Andheri',
      timestamp: '2:25 PM',
      isOutbound: false,
    },
    {
      id: 2,
      text: 'Hi! Yes, that property is still available. Would you like to know more details about it?',
      timestamp: '2:26 PM',
      isOutbound: true,
    },
    {
      id: 3,
      text: 'Yes, I would like to schedule a viewing for the 3BHK apartment in Andheri',
      timestamp: '2:27 PM',
      isOutbound: false,
    },
    {
      id: 4,
      text: 'I can arrange a viewing tomorrow between 11 AM to 6 PM. What time works best for you?',
      timestamp: '2:30 PM',
      isOutbound: true,
    },
  ],
  2: [
    {
      id: 1,
      text: 'What is the maintenance cost for the property?',
      timestamp: '1:40 PM',
      isOutbound: false,
    },
    {
      id: 2,
      text: 'The maintenance cost is ₹5,000 per month which includes water, security, and common area maintenance.',
      timestamp: '1:45 PM',
      isOutbound: true,
    },
  ],
  3: [
    {
      id: 1,
      text: 'Thank you for the property details. When can I visit?',
      timestamp: '12:10 PM',
      isOutbound: false,
    },
    {
      id: 2,
      text: 'You can visit today between 3 PM to 7 PM. Would you like me to schedule a viewing?',
      timestamp: '12:15 PM',
      isOutbound: true,
    },
  ],
  4: [
    {
      id: 1,
      text: 'Is parking available for 2 cars?',
      timestamp: '11:25 AM',
      isOutbound: false,
    },
    {
      id: 2,
      text: 'Yes, the property comes with 2 dedicated parking spots in the basement.',
      timestamp: '11:30 AM',
      isOutbound: true,
    },
  ],
  5: [
    {
      id: 1,
      text: 'I am interested in the commercial space in Bandra',
      timestamp: '10:40 AM',
      isOutbound: false,
    },
    {
      id: 2,
      text: 'Great! The commercial space is 2000 sq ft with high ceilings and excellent connectivity. Would you like to know the price?',
      timestamp: '10:45 AM',
      isOutbound: true,
    },
  ],
};

type Message = {
  id: number;
  text: string;
  timestamp: string;
  isOutbound: boolean;
};

type Messages = {
  [key: number]: Message[];
};

const MessagesList = () => {
  const [selectedChat, setSelectedChat] = useState<number | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [inputMessage, setInputMessage] = useState('');
  const [messages, setMessages] = useState<Messages>(mockMessages);

  const filteredChats = mockChats.filter((chat) =>
    chat.phoneNumber.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleSendMessage = () => {
    if (!selectedChat || !inputMessage.trim()) return;

    const newMessage: Message = {
      id: messages[selectedChat].length + 1,
      text: inputMessage,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      isOutbound: true,
    };

    setMessages((prev) => ({
      ...prev,
      [selectedChat]: [...prev[selectedChat], newMessage],
    }));

    setInputMessage('');
  };

  return (
    <div className='flex h-[calc(100vh-200px)] border rounded-lg overflow-hidden'>
      {/* Left Panel - Chat List */}
      <div className='w-1/3 border-r flex flex-col'>
        <div className='p-4 border-b'>
          <div className='relative'>
            <Search className='absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground' />
            <Input
              placeholder='Search chats...'
              className='pl-9'
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
        </div>
        <ScrollArea className='flex-1'>
          <div className='space-y-1'>
            {filteredChats.map((chat) => (
              <div
                key={chat.id}
                className={cn(
                  'flex items-center p-4 cursor-pointer hover:bg-accent transition-colors',
                  selectedChat === chat.id && 'bg-accent'
                )}
                onClick={() => setSelectedChat(chat.id)}
              >
                <div className='flex-shrink-0 w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center'>
                  <Phone className='h-6 w-6 text-primary' />
                </div>
                <div className='ml-4 flex-1 min-w-0'>
                  <div className='flex justify-between items-baseline'>
                    <p className='font-medium truncate text-sm'>{chat.phoneNumber}</p>
                    <span className='text-xs text-muted-foreground ml-2'>{chat.timestamp}</span>
                  </div>
                  <div className='flex justify-between items-center'>
                    <p className='text-sm w-[50%] text-muted-foreground truncate'>
                      {chat.lastMessage}
                    </p>
                    {chat.unread > 0 && (
                      <span className='bg-primary text-primary-foreground text-xs rounded-full px-2 py-1 min-w-[20px] inline-flex items-center justify-center'>
                        {chat.unread > 99 ? '99+' : chat.unread}
                      </span>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </ScrollArea>
      </div>

      {/* Right Panel - Messages */}
      <div className='flex-1 flex flex-col'>
        {selectedChat ? (
          <>
            {/* Chat Header */}
            <div className='p-4 border-b flex items-center'>
              <div className='flex-shrink-0 w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center'>
                <Phone className='h-5 w-5 text-primary' />
              </div>
              <div className='ml-4'>
                <p className='font-medium'>
                  {mockChats.find((c) => c.id === selectedChat)?.phoneNumber}
                </p>
                <p className='text-sm text-muted-foreground'>Online</p>
              </div>
            </div>

            {/* Messages */}
            <ScrollArea className='flex-1 p-4'>
              <div className='space-y-4'>
                {messages[selectedChat as keyof typeof messages]?.map((message) => (
                  <div
                    key={message.id}
                    className={cn('flex', message.isOutbound ? 'justify-end' : 'justify-start')}
                  >
                    <div
                      className={cn(
                        'max-w-[70%] rounded-lg px-4 py-2',
                        message.isOutbound ? 'bg-primary text-primary-foreground' : 'bg-muted'
                      )}
                    >
                      <p className='text-sm'>{message.text}</p>
                      <span className='text-xs opacity-70 mt-1 block'>{message.timestamp}</span>
                    </div>
                  </div>
                ))}
              </div>
            </ScrollArea>

            {/* Message Input */}
            <div className='p-4 border-t'>
              <div className='flex gap-2'>
                <Input
                  placeholder='Type a message...'
                  className='flex-1'
                  value={inputMessage}
                  onChange={(e) => setInputMessage(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      handleSendMessage();
                    }
                  }}
                />
                <Button size='icon' onClick={handleSendMessage}>
                  <Send className='h-4 w-4' />
                </Button>
              </div>
            </div>
          </>
        ) : (
          <div className='flex-1 flex items-center justify-center text-muted-foreground'>
            <div className='text-center'>
              <MessageSquare className='h-12 w-12 mx-auto mb-4' />
              <p>Select a chat to view messages</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default MessagesList;
