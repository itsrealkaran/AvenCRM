'use client';

import { useEffect, useRef, useState } from 'react';
import { whatsAppService } from '@/api/whatsapp.service';
import { LeadStatus, PropertyType } from '@/types';
import { Cross1Icon } from '@radix-ui/react-icons';
import { Cross, MessageSquare, Phone, Plus, Search, Send } from 'lucide-react';
import { toast } from 'sonner';

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
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { api } from '@/lib/api';
import { cn } from '@/lib/utils';

import { CreateLeadDialog } from '../leads/create-lead-dialog';
import { RegisterNumberModal } from './register-number';

type Chat = {
  phoneNumber: string;
  name?: string;
  latestMessage: {
    message: string;
    createdAt: string;
    status: string;
  };
  unreadCount: number;
};

type Message = {
  id: string;
  message: string;
  sentAt: string;
  phoneNumber: string;
  status: string;
  isOutbound: boolean;
  errorMessage?: string;
  wamid: string;
  recipient: {
    name?: string;
    phoneNumber: string;
  };
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
  isRegistered: boolean;
  createdAt: string;
  updatedAt: string;
};

type Messages = {
  [key: string]: Message[];
};

interface SSEMessage {
  type: 'new_message' | 'status_update' | 'connected';
  userId: string;
  data: {
    message?: Message;
    wamid?: string;
    status?: string;
    phoneNumberId?: string;
    phoneNumber?: string;
    error?: string;
  };
}

const MessagesList = ({
  phoneNumbers,
  accessToken,
  wabaId,
}: {
  phoneNumbers: PhoneNumber[];
  accessToken: string;
  wabaId: string;
}) => {
  const [chats, setChats] = useState<PaginatedResponse<Chat>>({
    data: [],
    pagination: { currentPage: 1, totalPages: 1, totalItems: 0, hasMore: false },
  });
  const [selectedChat, setSelectedChat] = useState<{
    phoneNumber: string;
    name: string | undefined;
  }>({
    phoneNumber: '',
    name: '',
  });
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
  const [conversationCache, setConversationCache] = useState<Record<string, Message[]>>({});
  const [isRegisteringModalOpen, setIsRegisteringModalOpen] = useState(false);
  const [selectedMessage, setSelectedMessage] = useState<Message | null>(null);
  const [isAddToLeadsModalOpen, setIsAddToLeadsModalOpen] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const eventSourceRef = useRef<EventSource | null>(null);
  // Add scroll to bottom function
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  // Add useEffect to scroll to bottom when messages change
  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    const fetchChats = async () => {
      try {
        const response = await whatsAppService.getPhoneNumbers(1, 20, phoneNumberId);
        // Add unreadCount to each chat
        const chatsWithUnread = response.data.map((chat: Chat) => ({
          ...chat,
          unreadCount: 0,
        }));
        setChats({
          ...response,
          data: chatsWithUnread,
        });
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

  useEffect(() => {
    // Set up SSE connection
    const setupSSE = () => {
      if (eventSourceRef.current) {
        eventSourceRef.current.close();
      }

      const eventSource = new EventSource(
        `${process.env.NEXT_PUBLIC_BACKEND_URL}/whatsapp/messages/stream`,
        {
          withCredentials: true,
        }
      );
      eventSourceRef.current = eventSource;

      eventSource.onopen = () => {
        console.log('SSE Connection established');
      };

      eventSource.onmessage = (event) => {
        console.log('Raw SSE event data:', event.data);
        try {
          const data = JSON.parse(event.data) as SSEMessage;
          console.log('Parsed SSE message:', data);

          if (data.type === 'connected') {
            console.log('Connected to SSE with userId:', data.userId);
            return;
          }

          if (data.type === 'new_message' && data.data.message && data.data.phoneNumberId) {
            console.log('Processing new message:', {
              message: data.data.message,
              phoneNumberId: data.data.phoneNumberId,
            });

            const { message, phoneNumberId } = data.data;
            const recipientPhoneNumber = message.phoneNumber;

            // Update chats state with new message and unread count
            setChats((prev) => {
              const currentChats = [...prev.data];
              const chatIndex = currentChats.findIndex(
                (chat) => chat.phoneNumber === recipientPhoneNumber
              );

              if (chatIndex !== -1) {
                // Chat exists, update it
                const updatedChat: Chat = {
                  ...currentChats[chatIndex],
                  latestMessage: {
                    message: message.message,
                    createdAt: message.sentAt,
                    status: message.status,
                  },
                  unreadCount:
                    selectedChat.phoneNumber === recipientPhoneNumber
                      ? 0
                      : currentChats[chatIndex].unreadCount + 1,
                };

                // Remove from current position and add to beginning
                currentChats.splice(chatIndex, 1);
                currentChats.unshift(updatedChat);

                return {
                  ...prev,
                  data: currentChats,
                };
              } else {
                // New chat, add it to the beginning
                const newChat: Chat = {
                  phoneNumber: recipientPhoneNumber,
                  name: message.recipient.name,
                  latestMessage: {
                    message: message.message,
                    createdAt: message.sentAt,
                    status: message.status,
                  },
                  unreadCount: selectedChat.phoneNumber === recipientPhoneNumber ? 0 : 1,
                };

                return {
                  ...prev,
                  data: [newChat, ...currentChats],
                };
              }
            });

            // Update current messages if this is the selected chat
            if (selectedChat.phoneNumber === recipientPhoneNumber) {
              setMessages((prev) => {
                const currentMessages = { ...prev };
                if (!currentMessages[selectedChat.phoneNumber]) {
                  currentMessages[selectedChat.phoneNumber] = [];
                }
                currentMessages[selectedChat.phoneNumber] = [
                  ...currentMessages[selectedChat.phoneNumber],
                  message,
                ];
                return currentMessages;
              });
            }
          } else if (
            data.type === 'status_update' &&
            data.data.wamid &&
            data.data.status &&
            data.data.phoneNumberId
          ) {
            const { wamid, status, phoneNumberId, phoneNumber, error } = data.data;

            // Update message status in cache
            setConversationCache((prev) => {
              const currentCache = { ...prev };
              console.log('Phone number:', phoneNumber);

              if (phoneNumber && currentCache[phoneNumber]) {
                console.log(
                  'Phone number:',
                  currentCache[phoneNumber].filter((msg) => {
                    console.log('Msg:', msg.wamid);
                    console.log('Wamid:', wamid);
                    return msg.wamid === wamid;
                  })
                );
                currentCache[phoneNumber] = currentCache[phoneNumber].map((msg) =>
                  msg.wamid === wamid ? { ...msg, status, error } : msg
                );
              }

              console.log('Updated cache with status:', currentCache);
              return currentCache;
            });

            // Update current messages if this is the selected chat
            if (selectedChat.phoneNumber) {
              setMessages((prev) => {
                const currentMessages = { ...prev };

                if (currentMessages[selectedChat.phoneNumber]) {
                  currentMessages[selectedChat.phoneNumber] = currentMessages[
                    selectedChat.phoneNumber
                  ].map((msg) => (msg.wamid === wamid ? { ...msg, status, error } : msg));
                }

                console.log('Updated messages with status:', currentMessages);
                return currentMessages;
              });
            }
          }
        } catch (error) {
          console.error('Error processing SSE message:', error);
        }
      };

      eventSource.onerror = (error) => {
        console.error('SSE Error:', error);
        // Attempt to reconnect after 5 seconds
        setTimeout(setupSSE, 5000);
      };
    };

    setupSSE();

    // Cleanup on unmount
    return () => {
      if (eventSourceRef.current) {
        eventSourceRef.current.close();
      }
    };
  }, [phoneNumbers, selectedChat.phoneNumber]);

  // Add effect to reset unread count when selecting a chat
  useEffect(() => {
    if (selectedChat.phoneNumber) {
      setChats((prev) => ({
        ...prev,
        data: prev.data.map((chat) =>
          chat.phoneNumber === selectedChat.phoneNumber ? { ...chat, unreadCount: 0 } : chat
        ),
      }));
    }
  }, [selectedChat.phoneNumber]);

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

  const fetchMessages = async (phoneNumber: string) => {
    if (!phoneNumber) return;

    // Check if messages exist in cache
    if (conversationCache[phoneNumber]) {
      setMessages((prev) => ({
        ...prev,
        [phoneNumber]: conversationCache[phoneNumber],
      }));
      return;
    }

    setIsLoadingMessages(true);
    try {
      const response = await whatsAppService.getPhoneNumberChats(phoneNumber, phoneNumberId, 1);
      setConversationCache((prev) => ({
        ...prev,
        [phoneNumber]: response.data,
      }));
      setMessages((prev) => ({
        ...prev,
        [phoneNumber]: response.data,
      }));
      setHasMoreMessages(response.pagination.hasMore);
      setMessagePage(1);
    } catch (error) {
      console.error('Error fetching messages:', error);
    } finally {
      setIsLoadingMessages(false);
    }
  };

  const loadMoreMessages = async () => {
    if (!selectedChat.phoneNumber || !hasMoreMessages || isLoadingMore) return;

    setIsLoadingMore(true);
    try {
      const nextPage = messagePage + 1;
      const response = await whatsAppService.getPhoneNumberChats(
        selectedChat.phoneNumber,
        phoneNumberId,
        nextPage
      );
      setMessages((prev) => ({
        ...prev,
        [selectedChat.phoneNumber]: [...prev[selectedChat.phoneNumber], ...response.data],
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
    if (!selectedChat.phoneNumber || !inputMessage.trim()) return;

    const newMessageId = String(Date.now());
    const newMessage: Message = {
      id: newMessageId,
      message: inputMessage,
      phoneNumber: selectedChat.phoneNumber,
      sentAt: new Date().toISOString(),
      status: 'PENDING',
      isOutbound: true,
      wamid: newMessageId,
      recipient: {
        phoneNumber: selectedChat.phoneNumber,
      },
    };

    // Update cache and messages state
    setConversationCache((prev) => ({
      ...prev,
      [selectedChat.phoneNumber]: [...(prev[selectedChat.phoneNumber] || []), newMessage],
    }));
    setMessages((prev) => ({
      ...prev,
      [selectedChat.phoneNumber]: [...(prev[selectedChat.phoneNumber] || []), newMessage],
    }));

    const campaignData = {
      recipient_type: 'individual',
      messaging_product: 'whatsapp',
      to: `${selectedChat.phoneNumber}`,
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
        if (phoneNumbers.messages[0].id) {
          api
            .post('/whatsapp/campaigns/saveMessage', {
              recipientNumber: selectedChat.phoneNumber,
              phoneNumberId: phoneNumberId,
              message: inputMessage,
              wamid: phoneNumbers.messages[0].id,
              sentAt: new Date().toISOString(),
            })
            .catch((err) => {
              // if error then remove the message from the cache
              setConversationCache((prev) => ({
                ...prev,
                [selectedChat.phoneNumber]: prev[selectedChat.phoneNumber].filter(
                  (msg) => msg.wamid !== newMessageId
                ),
              }));
              setMessages((prev) => ({
                ...prev,
                [selectedChat.phoneNumber]: prev[selectedChat.phoneNumber].filter(
                  (msg) => msg.wamid !== newMessageId
                ),
              }));
            });
        } else {
          // if error then remove the message from the cache
          setConversationCache((prev) => ({
            ...prev,
            [selectedChat.phoneNumber]: prev[selectedChat.phoneNumber].filter(
              (msg) => msg.wamid !== newMessageId
            ),
          }));
          setMessages((prev) => ({
            ...prev,
            [selectedChat.phoneNumber]: prev[selectedChat.phoneNumber].filter(
              (msg) => msg.wamid !== newMessageId
            ),
          }));
        }
      }
    );

    setInputMessage('');
  };

  const handleSelectPhoneNumber = (value: string) => {
    setPhoneNumberId(value);
  };

  useEffect(() => {
    if (
      phoneNumbers.find(
        (phoneNumber) =>
          phoneNumber.phoneNumberId === phoneNumberId && phoneNumber.isRegistered === false
      )
    ) {
      setIsRegisteringModalOpen(true);
    }
  }, [messages]);

  return (
    <div className='flex h-[calc(100vh-200px)] border rounded-lg overflow-auto max-h-[480px]'>
      {/* Left Panel - Chat List */}
      <div className='w-1/3 border-r flex flex-col'>
        <div className='p-4 border-b'>
          <Select value={phoneNumberId} onValueChange={handleSelectPhoneNumber}>
            <SelectTrigger className='w-full'>
              <SelectValue placeholder='Select phone number' />
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
                      selectedChat.phoneNumber === chat.phoneNumber && 'bg-accent'
                    )}
                    onClick={() => {
                      setSelectedChat({ phoneNumber: chat.phoneNumber, name: chat.name });
                      fetchMessages(chat.phoneNumber);
                    }}
                  >
                    <div className='flex-shrink-0 w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center'>
                      <Phone className='h-6 w-6 text-primary' />
                    </div>
                    <div className='ml-4 flex-1 min-w-0'>
                      <div className='flex justify-between items-baseline'>
                        <p className='font-medium truncate text-sm'>
                          {chat.name ? chat.name : chat.phoneNumber}
                        </p>
                        <div className='flex items-center gap-2'>
                          {chat.unreadCount > 0 && (
                            <span className='bg-primary text-primary-foreground text-xs rounded-full px-2 py-1'>
                              {chat.unreadCount}
                            </span>
                          )}
                          <span className='text-xs text-muted-foreground'>
                            {new Date(chat.latestMessage?.createdAt).toLocaleTimeString([], {
                              hour: '2-digit',
                              minute: '2-digit',
                            })}
                          </span>
                        </div>
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
        {selectedChat.phoneNumber ? (
          <>
            {/* Chat Header */}
            <div className='p-4 border-b flex items-center'>
              <div className='flex-shrink-0 w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center'>
                <Phone className='h-5 w-5 text-primary' />
              </div>
              <div className='ml-4'>
                <p className='font-medium'>
                  {selectedChat.name
                    ? `${selectedChat.name} (+${selectedChat.phoneNumber})`
                    : selectedChat.phoneNumber}
                </p>
                <p className='text-sm text-muted-foreground'>Online</p>
              </div>
              <div className='ml-auto'>
                <Button
                  variant='outline'
                  size='sm'
                  onClick={() => {
                    if (selectedChat.phoneNumber) {
                      setSelectedMessage({
                        id: '',
                        message: '',
                        sentAt: new Date().toISOString(),
                        phoneNumber: selectedChat.phoneNumber,
                        status: '',
                        isOutbound: false,
                        wamid: '',
                        recipient: {
                          name: selectedChat.name,
                          phoneNumber: selectedChat.phoneNumber,
                        },
                      });
                      setIsAddToLeadsModalOpen(true);
                    }
                  }}
                >
                  <Plus className='h-4 w-4' />
                  Add to leads
                </Button>
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
                    {messages[selectedChat.phoneNumber]?.map((message) => (
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
                        {message.status === 'FAILED' && (
                          <TooltipProvider>
                            <Tooltip>
                              <TooltipTrigger asChild>
                                <div className='flex items-center ml-2'>
                                  <Cross1Icon className='h-5 w-5 text-red-500 border-2 border-red-500 rounded-full p-1 hover:bg-red-50 hover:text-red-600 transition-all duration-200 cursor-help' />
                                </div>
                              </TooltipTrigger>
                              <TooltipContent
                                side='left'
                                className='max-w-[300px] bg-white/95 backdrop-blur-sm border border-red-100 shadow-lg rounded-lg p-3'
                              >
                                <div className='flex flex-col gap-2'>
                                  <p className='text-sm font-semibold text-red-600'>
                                    Message Failed
                                  </p>
                                  <p className='text-xs text-red-500/90 leading-relaxed'>
                                    {message.errorMessage || 'Failed to send message'}
                                  </p>
                                </div>
                              </TooltipContent>
                            </Tooltip>
                          </TooltipProvider>
                        )}
                      </div>
                    ))}
                    <div ref={messagesEndRef} />
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
      <RegisterNumberModal
        open={isRegisteringModalOpen}
        onClose={() => setIsRegisteringModalOpen(false)}
        accessToken={accessToken}
        phoneNumberId={phoneNumberId}
        wabaId={wabaId}
        phoneNumbers={phoneNumbers.map((phoneNumber) => ({
          id: phoneNumber.id,
          phoneNumberId: phoneNumber.phoneNumberId,
          name: phoneNumber.phoneNumber,
          phoneNumber: phoneNumber.phoneNumber,
          codeVerificationStatus: phoneNumber.status,
          isRegistered: phoneNumber.isRegistered,
        }))}
      />
      <CreateLeadDialog
        open={isAddToLeadsModalOpen}
        onOpenChange={(open) => setIsAddToLeadsModalOpen(open)}
        initialValues={{
          name: selectedChat.name || '',
          phone: selectedChat.phoneNumber,
          source: 'WhatsApp',
          status: LeadStatus.NEW,
          role: 'BUY',
          propertyType: PropertyType.RESIDENTIAL,
          budget: undefined,
          location: '',
          notes: [],
        }}
      />
    </div>
  );
};

export default MessagesList;
