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
    phoneNumber: '+91 77381 21979',
    lastMessage: 'Welcome and congratulations!',
    timestamp: '2:30 PM',
    unread: 0,
  },
  {
    id: 2,
    phoneNumber: '+91 77103 35863',
    lastMessage: 'Test',
    timestamp: '1:45 PM',
    unread: 0,
  },
];

const mockMessages = {
  1: [
    {
      id: 1,
      text: `Welcome and congratulations!! This message demonstrates your ability to send a WhatsApp message notification from the Cloud API, hosted by Meta. Thank you for taking the time to test with us.`,
      timestamp: '2:25 PM',
      isOutbound: false,
    },
  ],
  2: [
    {
      id: 1,
      text: 'Welcome and congratulations!! This message demonstrates your ability to send a WhatsApp message notification from the Cloud API, hosted by Meta. Thank you for taking the time to test with us.',
      timestamp: '1:40 PM',
      isOutbound: false,
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

  const handleHidden = () => {
    if (!selectedChat) return;

    const newMessage: Message = {
      id: messages[selectedChat].length + 1,
      text: 'Hii',
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
                    {/* <span className='text-xs text-muted-foreground ml-2'>{chat.timestamp}</span> */}
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
              <div className='ml-auto'>
                <button
                  className='text-muted-foreground h-4 w-4 cursor-pointer'
                  onClick={handleHidden}
                ></button>
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
