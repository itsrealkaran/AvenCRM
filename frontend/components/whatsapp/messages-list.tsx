'use client';

import { useEffect, useState } from 'react';
import { whatsAppService } from '@/api/whatsapp.service';
import { MessageSquare, Phone, Search, Send } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { api } from '@/lib/api';
import { cn } from '@/lib/utils';

type Chat = {
  phoneNumber: string;
  name?: string;
  latestMessage: {
    message: string;
    createdAt: string;
    status: string;
  };
};

type Message = {
  id: string;
  message: string;
  sentAt: string;
  status: string;
  isOutbound: boolean;
  wamid: string;
};

type PaginatedResponse<T> = {
  data: T[];
  pagination: {
    currentPage: number;
    totalPages: number;
    totalItems: number;
    hasMore: boolean;
  };
};

type PhoneNumber = {
  id: string;
  phoneNumber: string;
  phoneNumberId: string;
  status: string;
  createdAt: string;
  updatedAt: string;
};

type Messages = {
  [key: string]: Message[];
};

const MessagesList = ({
  phoneNumbers,
  accessToken,
}: {
  phoneNumbers: PhoneNumber[];
  accessToken: string;
}) => {
  const [chats, setChats] = useState<PaginatedResponse<Chat>>({
    data: [],
    pagination: { currentPage: 1, totalPages: 1, totalItems: 0, hasMore: false },
  });
  const [selectedChat, setSelectedChat] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [inputMessage, setInputMessage] = useState('');
  const [messages, setMessages] = useState<Messages>({});
  const [isLoading, setIsLoading] = useState(true);
  const [isLoadingMessages, setIsLoadingMessages] = useState(false);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [chatPage, setChatPage] = useState(1);
  const [messagePage, setMessagePage] = useState(1);
  const [hasMoreChats, setHasMoreChats] = useState(true);
  const [hasMoreMessages, setHasMoreMessages] = useState(true);
  const [phoneNumberId, setPhoneNumberId] = useState<string>(phoneNumbers[0].phoneNumberId);

  useEffect(() => {
    const fetchChats = async () => {
      try {
        const response = await whatsAppService.getPhoneNumbers(1, 20, phoneNumberId);
        setChats(response);
        setHasMoreChats(response.pagination.hasMore);

        // Initialize messages state with empty arrays for each chat
        const initialMessages: Messages = {};
        response.data.forEach((chat: Chat) => {
          initialMessages[chat.phoneNumber] = [];
        });
        setMessages(initialMessages);
      } catch (error) {
        console.error('Error fetching chats:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchChats();
  }, []);

  const loadMoreChats = async () => {
    if (!hasMoreChats || isLoadingMore) return;

    setIsLoadingMore(true);
    try {
      const nextPage = chatPage + 1;
      const response = await whatsAppService.getPhoneNumbers(nextPage, 20, phoneNumberId);
      setChats((prev) => ({
        ...prev,
        data: [...prev.data, ...response.data],
        pagination: {
          ...prev.pagination,
          currentPage: nextPage,
          hasMore: response.pagination.hasMore,
        },
      }));
      setHasMoreChats(response.pagination.hasMore);

      // Initialize messages state for new chats
      const newMessages: Messages = { ...messages };
      response.data.forEach((chat: Chat) => {
        if (!newMessages[chat.phoneNumber]) {
          newMessages[chat.phoneNumber] = [];
        }
      });
      setMessages(newMessages);
    } catch (error) {
      console.error('Error loading more chats:', error);
    } finally {
      setIsLoadingMore(false);
    }
  };

  useEffect(() => {
    const fetchMessages = async () => {
      if (!selectedChat) return;

      setIsLoadingMessages(true);
      try {
        const response = await whatsAppService.getPhoneNumberChats(selectedChat, phoneNumberId, 1);
        setMessages((prev) => ({
          ...prev,
          [selectedChat]: response.data,
        }));
        setHasMoreMessages(response.pagination.hasMore);
        setMessagePage(1);
      } catch (error) {
        console.error('Error fetching messages:', error);
      } finally {
        setIsLoadingMessages(false);
      }
    };

    if (selectedChat) {
      fetchMessages();
    }
  }, [selectedChat]);

  const loadMoreMessages = async () => {
    if (!selectedChat || !hasMoreMessages || isLoadingMore) return;

    setIsLoadingMore(true);
    try {
      const nextPage = messagePage + 1;
      const response = await whatsAppService.getPhoneNumberChats(
        selectedChat,
        phoneNumberId,
        nextPage
      );
      setMessages((prev) => ({
        ...prev,
        [selectedChat]: [...prev[selectedChat], ...response.data],
      }));
      setMessagePage(nextPage);
      setHasMoreMessages(response.pagination.hasMore);
    } catch (error) {
      console.error('Error loading more messages:', error);
    } finally {
      setIsLoadingMore(false);
    }
  };

  const handleScroll = (e: React.UIEvent<HTMLDivElement>) => {
    const { scrollTop } = e.currentTarget;
    if (scrollTop === 0 && hasMoreMessages) {
      loadMoreMessages();
    }
  };

  const filteredChats = chats.data.filter((chat) =>
    chat.phoneNumber.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleSendMessage = () => {
    if (!selectedChat || !inputMessage.trim()) return;

    const newMessage: Message = {
      id: String(Date.now()),
      message: inputMessage,
      sentAt: new Date().toISOString(),
      status: 'PENDING',
      isOutbound: true,
      wamid: String(Date.now()),
    };

    const campaignData = {
      recipient_type: 'individual',
      messaging_product: 'whatsapp',
      to: `${selectedChat}`,
      type: 'text',
      text: {
        preview_url: true,
        body: inputMessage,
      },
    };

    //@ts-ignore
    FB.api(
      `/${phoneNumberId}/messages?access_token=${accessToken}`,
      'POST',
      campaignData,
      (phoneNumbers: any) => {
        api.post('/whatsapp/campaigns/saveMessage', {
          recipientNumber: selectedChat,
          phoneNumberId: phoneNumberId,
          message: inputMessage,
          wamid: phoneNumbers.messages[0].id,
          sentAt: new Date().toISOString(),
        });
      }
    );

    setMessages((prev) => ({
      ...prev,
      [selectedChat]: [...prev[selectedChat], newMessage],
    }));

    setInputMessage('');
  };

  const handleSelectPhoneNumber = (value: string) => {};

  return (
    <div className='flex h-[calc(100vh-200px)] border rounded-lg overflow-auto max-h-[500px]'>
      {/* Left Panel - Chat List */}
      <div className='w-1/3 border-r flex flex-col'>
        <div className='p-4 border-b'>
          <Select onValueChange={handleSelectPhoneNumber}>
            <SelectTrigger className='w-full'>
              <SelectValue placeholder='Select a phone number' />
            </SelectTrigger>
            <SelectContent>
              {phoneNumbers?.map((phoneNumber) => (
                <SelectItem key={phoneNumber.id} value={phoneNumber.phoneNumberId}>
                  {phoneNumber.phoneNumber}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
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
        <ScrollArea
          className='flex-1'
          onScrollCapture={() => {
            const element = document.querySelector('.scroll-area-viewport');
            if (element) {
              const { scrollTop, scrollHeight, clientHeight } = element;
              if (scrollHeight - scrollTop === clientHeight) {
                loadMoreChats();
              }
            }
          }}
        >
          <div className='space-y-1'>
            {isLoading ? (
              <div className='p-4 text-center text-muted-foreground'>Loading chats...</div>
            ) : (
              <>
                {filteredChats.map((chat) => (
                  <div
                    key={chat.phoneNumber}
                    className={cn(
                      'flex items-center p-4 cursor-pointer hover:bg-accent transition-colors',
                      selectedChat === chat.phoneNumber && 'bg-accent'
                    )}
                    onClick={() => setSelectedChat(chat.phoneNumber)}
                  >
                    <div className='flex-shrink-0 w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center'>
                      <Phone className='h-6 w-6 text-primary' />
                    </div>
                    <div className='ml-4 flex-1 min-w-0'>
                      <div className='flex justify-between items-baseline'>
                        <p className='font-medium truncate text-sm'>{chat.phoneNumber}</p>
                        <span className='text-xs text-muted-foreground ml-2'>
                          {new Date(chat.latestMessage?.createdAt).toLocaleTimeString([], {
                            hour: '2-digit',
                            minute: '2-digit',
                          })}
                        </span>
                      </div>
                      <div className='flex justify-between items-center'>
                        <p className='text-sm w-[50%] text-muted-foreground truncate'>
                          {chat.latestMessage?.message || 'No messages'}
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
                {isLoadingMore && (
                  <div className='p-4 text-center text-muted-foreground'>Loading more chats...</div>
                )}
              </>
            )}
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
                <p className='font-medium'>{selectedChat}</p>
                <p className='text-sm text-muted-foreground'>Online</p>
              </div>
            </div>

            {/* Messages */}
            <ScrollArea className='flex-1 p-4' onScrollCapture={handleScroll}>
              <div className='space-y-4'>
                {isLoadingMessages ? (
                  <div className='text-center text-muted-foreground'>Loading messages...</div>
                ) : (
                  <>
                    {isLoadingMore && (
                      <div className='text-center text-muted-foreground'>
                        Loading more messages...
                      </div>
                    )}
                    {messages[selectedChat]?.map((message) => (
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
                          <p className='text-sm'>{message.message}</p>
                          <p
                            className={cn(
                              'text-xs text-muted-foreground mt-1',
                              message.isOutbound ? 'text-white' : 'text-left'
                            )}
                          >
                            {new Date(message.sentAt).toLocaleTimeString([], {
                              hour: '2-digit',
                              minute: '2-digit',
                            })}
                          </p>
                        </div>
                      </div>
                    ))}
                  </>
                )}
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
