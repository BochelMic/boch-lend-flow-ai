import React, { useState, useEffect, useRef } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useAuth } from '@/hooks/useAuth';
import { Send, MessageCircle, User, Search } from 'lucide-react';

interface Message {
  id: string;
  senderId: string;
  senderName: string;
  senderRole: string;
  receiverId: string;
  content: string;
  timestamp: string;
  read: boolean;
}

interface Contact {
  id: string;
  name: string;
  role: string;
  lastMessage?: string;
  unreadCount: number;
}

const ChatModule = () => {
  const { user } = useAuth();
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [selectedContact, setSelectedContact] = useState<Contact | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    loadContacts();
  }, [user]);

  useEffect(() => {
    if (selectedContact) {
      loadMessages(selectedContact.id);
    }
  }, [selectedContact]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const loadContacts = () => {
    const users = JSON.parse(localStorage.getItem('users') || '[]');
    const allMessages = JSON.parse(localStorage.getItem('chat_messages') || '[]');
    
    const contactsList: Contact[] = users
      .filter((u: any) => u.id !== user?.id)
      .map((u: any) => {
        const userMessages = allMessages.filter(
          (m: Message) => 
            (m.senderId === u.id && m.receiverId === user?.id) ||
            (m.senderId === user?.id && m.receiverId === u.id)
        );
        const lastMsg = userMessages[userMessages.length - 1];
        const unread = userMessages.filter(
          (m: Message) => m.receiverId === user?.id && !m.read
        ).length;
        
        return {
          id: u.id,
          name: u.name,
          role: u.role,
          lastMessage: lastMsg?.content,
          unreadCount: unread
        };
      });
    
    setContacts(contactsList);
  };

  const loadMessages = (contactId: string) => {
    const allMessages = JSON.parse(localStorage.getItem('chat_messages') || '[]');
    const conversationMessages = allMessages.filter(
      (m: Message) =>
        (m.senderId === contactId && m.receiverId === user?.id) ||
        (m.senderId === user?.id && m.receiverId === contactId)
    );
    
    // Marcar como lidas
    const updatedMessages = allMessages.map((m: Message) => {
      if (m.senderId === contactId && m.receiverId === user?.id && !m.read) {
        return { ...m, read: true };
      }
      return m;
    });
    localStorage.setItem('chat_messages', JSON.stringify(updatedMessages));
    
    setMessages(conversationMessages);
    loadContacts();
  };

  const sendMessage = () => {
    if (!newMessage.trim() || !selectedContact || !user) return;

    const message: Message = {
      id: Date.now().toString(),
      senderId: user.id,
      senderName: user.name,
      senderRole: user.role,
      receiverId: selectedContact.id,
      content: newMessage.trim(),
      timestamp: new Date().toISOString(),
      read: false
    };

    const allMessages = JSON.parse(localStorage.getItem('chat_messages') || '[]');
    allMessages.push(message);
    localStorage.setItem('chat_messages', JSON.stringify(allMessages));

    setMessages([...messages, message]);
    setNewMessage('');
    loadContacts();
  };

  const getRoleBadge = (role: string) => {
    const colors: Record<string, string> = {
      gestor: 'bg-primary text-primary-foreground',
      agente: 'bg-accent text-accent-foreground',
      cliente: 'bg-secondary text-secondary-foreground'
    };
    const labels: Record<string, string> = {
      gestor: 'Gestor',
      agente: 'Agente',
      cliente: 'Cliente'
    };
    return (
      <Badge className={colors[role] || 'bg-muted'}>
        {labels[role] || role}
      </Badge>
    );
  };

  const filteredContacts = contacts.filter(c =>
    c.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const formatTime = (timestamp: string) => {
    const date = new Date(timestamp);
    return date.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2">
        <MessageCircle className="h-5 w-5 md:h-6 md:w-6 text-primary" />
        <h1 className="text-xl md:text-3xl font-bold">Chat Interno</h1>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 h-[calc(100vh-180px)] md:h-[calc(100vh-200px)]">
        {/* Lista de Contatos */}
        <Card className={`lg:col-span-1 flex flex-col ${selectedContact ? 'hidden lg:flex' : 'flex'}`}>
          <CardHeader className="p-3 md:p-4 pb-2">
            <CardTitle className="text-base md:text-lg">Contatos</CardTitle>
            <div className="relative mt-2">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Buscar..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-9"
              />
            </div>
          </CardHeader>
          <CardContent className="flex-1 overflow-hidden p-2">
            <ScrollArea className="h-full">
              <div className="space-y-2">
                {filteredContacts.length === 0 ? (
                  <p className="text-center text-muted-foreground p-4 text-sm">
                    Nenhum contato encontrado
                  </p>
                ) : (
                  filteredContacts.map((contact) => (
                    <div
                      key={contact.id}
                      onClick={() => setSelectedContact(contact)}
                      className={`p-2 md:p-3 rounded-lg cursor-pointer transition-colors ${
                        selectedContact?.id === contact.id
                          ? 'bg-primary/10 border border-primary'
                          : 'hover:bg-muted'
                      }`}
                    >
                      <div className="flex items-center gap-2 md:gap-3">
                        <div className="w-8 h-8 md:w-10 md:h-10 rounded-full bg-primary/20 flex items-center justify-center flex-shrink-0">
                          <User className="h-4 w-4 md:h-5 md:w-5 text-primary" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2">
                            <span className="font-medium truncate text-sm md:text-base">{contact.name}</span>
                            {contact.unreadCount > 0 && (
                              <Badge variant="destructive" className="text-xs">
                                {contact.unreadCount}
                              </Badge>
                            )}
                          </div>
                          <div className="flex items-center gap-2">
                            {getRoleBadge(contact.role)}
                          </div>
                          {contact.lastMessage && (
                            <p className="text-xs text-muted-foreground truncate mt-1">
                              {contact.lastMessage}
                            </p>
                          )}
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </ScrollArea>
          </CardContent>
        </Card>

        {/* Área de Chat */}
        <Card className={`lg:col-span-2 flex flex-col ${selectedContact ? 'flex' : 'hidden lg:flex'}`}>
          {selectedContact ? (
            <>
              <CardHeader className="border-b p-3 md:p-4">
                <div className="flex items-center gap-2 md:gap-3">
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    className="lg:hidden"
                    onClick={() => setSelectedContact(null)}
                  >
                    ←
                  </Button>
                  <div className="w-8 h-8 md:w-10 md:h-10 rounded-full bg-primary/20 flex items-center justify-center">
                    <User className="h-4 w-4 md:h-5 md:w-5 text-primary" />
                  </div>
                  <div>
                    <CardTitle className="text-base md:text-lg">{selectedContact.name}</CardTitle>
                    {getRoleBadge(selectedContact.role)}
                  </div>
                </div>
              </CardHeader>
              <CardContent className="flex-1 overflow-hidden p-0">
                <ScrollArea className="h-[calc(100vh-350px)] md:h-[calc(100vh-380px)] p-3 md:p-4">
                  <div className="space-y-3 md:space-y-4">
                    {messages.map((message) => (
                      <div
                        key={message.id}
                        className={`flex ${
                          message.senderId === user?.id ? 'justify-end' : 'justify-start'
                        }`}
                      >
                        <div
                          className={`max-w-[85%] md:max-w-[80%] rounded-lg p-2 md:p-3 ${
                            message.senderId === user?.id
                              ? 'bg-primary text-primary-foreground'
                              : 'bg-muted'
                          }`}
                        >
                          <p className="text-sm">{message.content}</p>
                          <p
                            className={`text-xs mt-1 ${
                              message.senderId === user?.id
                                ? 'text-primary-foreground/70'
                                : 'text-muted-foreground'
                            }`}
                          >
                            {formatTime(message.timestamp)}
                          </p>
                        </div>
                      </div>
                    ))}
                    <div ref={messagesEndRef} />
                  </div>
                </ScrollArea>
              </CardContent>
              <div className="border-t p-3 md:p-4">
                <div className="flex gap-2">
                  <Input
                    placeholder="Digite sua mensagem..."
                    value={newMessage}
                    onChange={(e) => setNewMessage(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && sendMessage()}
                    className="flex-1"
                  />
                  <Button onClick={sendMessage} size="icon">
                    <Send className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </>
          ) : (
            <div className="flex-1 flex items-center justify-center text-muted-foreground">
              <div className="text-center p-4">
                <MessageCircle className="h-10 w-10 md:h-12 md:w-12 mx-auto mb-4 opacity-50" />
                <p className="text-sm md:text-base">Selecione um contato para iniciar uma conversa</p>
              </div>
            </div>
          )}
        </Card>
      </div>
    </div>
  );
};

export default ChatModule;
