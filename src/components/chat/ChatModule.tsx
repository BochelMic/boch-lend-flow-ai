import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import {
  Send, MessageCircle, Search, ChevronLeft, Check, CheckCheck,
  Smile, Paperclip, X, FileText, Download
} from 'lucide-react';
import { notifyEvent } from '@/utils/notifyEvent';

interface Message {
  id: string;
  sender_id: string;
  receiver_id: string;
  content: string | null;
  created_at: string;
  read: boolean;
  file_url?: string | null;
  file_type?: string | null;
  file_name?: string | null;
}

interface Contact {
  id: string;
  name: string;
  role: string;
  avatar_url?: string | null;
  lastMessage?: string;
  lastTime?: string;
  unreadCount: number;
  online?: boolean;
  agentLabel?: string | null;
}

const EMOJI_LIST = [
  '😀', '😂', '😍', '🥰', '😊', '😎', '🤔', '😅', '😭', '😤',
  '👍', '👎', '❤️', '🔥', '💯', '🎉', '👏', '🙏', '💪', '🤝',
  '✅', '❌', '⚠️', '💰', '📄', '📎', '📞', '💬', '🏠', '🚀',
];

const getConversationColor = (myRole: string, theirRole: string): string => {
  const pair = [myRole, theirRole].sort().join('-');
  if (pair === 'agente-gestor') return '#d37c22';
  if (pair === 'cliente-gestor') return '#1a3a5c';
  if (pair === 'agente-cliente') return '#1a1a1a';
  return '#6b7280';
};

const ChatModule = () => {
  const { user } = useAuth();
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [selectedContact, setSelectedContact] = useState<Contact | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [sending, setSending] = useState(false);
  const [showEmoji, setShowEmoji] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [previewFile, setPreviewFile] = useState<{ url: string } | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const emojiRef = useRef<HTMLDivElement>(null);
  const selectedContactRef = useRef<Contact | null>(null);

  // Keep ref in sync for use inside subscription callbacks
  useEffect(() => { selectedContactRef.current = selectedContact; }, [selectedContact]);

  useEffect(() => { if (user) loadContacts(); }, [user]);

  useEffect(() => {
    if (selectedContact) {
      loadMessages(selectedContact.id);
      inputRef.current?.focus();
      setShowEmoji(false);
    }
  }, [selectedContact]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Close emoji on outside click
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (emojiRef.current && !emojiRef.current.contains(e.target as Node)) setShowEmoji(false);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  // ===== REAL-TIME: Subscribe to ALL changes on chat_messages =====
  useEffect(() => {
    if (!user) return;

    const channel = supabase
      .channel('chat-live')
      // New messages TO me (from others)
      .on('postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'chat_messages', filter: `receiver_id=eq.${user.id}` },
        (payload) => {
          const msg = payload.new as Message;
          const current = selectedContactRef.current;
          if (current && msg.sender_id === current.id) {
            setMessages(prev => {
              if (prev.some(m => m.id === msg.id)) return prev;
              return [...prev, msg];
            });
            // Auto mark as read
            supabase.from('chat_messages').update({ read: true }).eq('id', msg.id);
          }
          loadContacts();
        }
      )
      // New messages FROM me (so my sent messages appear instantly if insert was slow)
      .on('postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'chat_messages', filter: `sender_id=eq.${user.id}` },
        (payload) => {
          const msg = payload.new as Message;
          setMessages(prev => {
            if (prev.some(m => m.id === msg.id)) return prev;
            return [...prev, msg];
          });
        }
      )
      // Read receipt updates (when other person reads my message)
      .on('postgres_changes',
        { event: 'UPDATE', schema: 'public', table: 'chat_messages', filter: `sender_id=eq.${user.id}` },
        (payload) => {
          const updated = payload.new as Message;
          setMessages(prev => prev.map(m => m.id === updated.id ? { ...m, read: updated.read } : m));
        }
      )
      .subscribe();

    return () => { supabase.removeChannel(channel); };
  }, [user]);

  const loadContacts = useCallback(async () => {
    if (!user) return;

    const [{ data: profiles }, { data: roles }] = await Promise.all([
      supabase.from('profiles').select('user_id, name, avatar_url').neq('user_id', user.id),
      supabase.from('user_roles').select('user_id, role'),
    ]);
    if (!profiles) return;

    const roleMap = new Map((roles || []).map(r => [r.user_id, r.role]));

    // Determine which contacts this user can see
    let allowedUserIds: Set<string> | null = null; // null = no restriction

    if (user.role === 'agente') {
      // Agents can only chat with their own clients + gestor
      const { data: myClients } = await supabase
        .from('clients')
        .select('user_id')
        .eq('agent_id', user.id)
        .not('user_id', 'is', null);

      const clientUserIds = new Set((myClients || []).map(c => c.user_id).filter(Boolean));

      // Also include all gestors
      allowedUserIds = new Set<string>();
      for (const [uid, role] of roleMap) {
        if (role === 'gestor' || clientUserIds.has(uid)) {
          allowedUserIds.add(uid);
        }
      }
    } else if (user.role === 'cliente') {
      // Clients: see only gestor(s) + their assigned agent (if created by one)
      allowedUserIds = new Set<string>();

      // Always add all gestors (admin)
      for (const [uid, role] of roleMap) {
        if (role === 'gestor') allowedUserIds.add(uid);
      }

      // Check if this client was created by an agent
      const { data: clientRecord } = await supabase
        .from('clients')
        .select('agent_id')
        .eq('user_id', user.id)
        .maybeSingle();

      if (clientRecord?.agent_id) {
        allowedUserIds.add(clientRecord.agent_id);
      }
    } else {
      // Gestor sees everyone (agentes + clientes)
      const allowed = ['agente', 'cliente'];
      allowedUserIds = new Set(
        [...roleMap.entries()].filter(([, role]) => allowed.includes(role)).map(([uid]) => uid)
      );
    }

    // For gestor: build a map of client user_id -> agent name
    const agentLabelMap = new Map<string, string>();
    if (user.role === 'gestor') {
      const { data: clientsWithAgent } = await supabase
        .from('clients')
        .select('user_id, agent_id')
        .not('agent_id', 'is', null)
        .not('user_id', 'is', null);

      if (clientsWithAgent && clientsWithAgent.length > 0) {
        const agentIds = [...new Set(clientsWithAgent.map(c => c.agent_id).filter(Boolean))];
        const agentProfiles = profiles.filter(p => agentIds.includes(p.user_id));
        const agentNameMap = new Map(agentProfiles.map(p => [p.user_id, p.name]));
        for (const c of clientsWithAgent) {
          if (c.user_id && c.agent_id && agentNameMap.has(c.agent_id)) {
            agentLabelMap.set(c.user_id, agentNameMap.get(c.agent_id)!);
          }
        }
      }
    }

    const [{ data: unread }, { data: allMsgs }] = await Promise.all([
      supabase.from('chat_messages').select('sender_id').eq('receiver_id', user.id).eq('read', false),
      supabase.from('chat_messages').select('sender_id, receiver_id, content, file_name, created_at').or(`sender_id.eq.${user.id},receiver_id.eq.${user.id}`).order('created_at', { ascending: false }).limit(200),
    ]);

    const unreadMap = new Map<string, number>();
    (unread || []).forEach(m => { unreadMap.set(m.sender_id, (unreadMap.get(m.sender_id) || 0) + 1); });

    const lastMsgMap = new Map<string, { content: string; time: string }>();
    (allMsgs || []).forEach(m => {
      const otherId = m.sender_id === user.id ? m.receiver_id : m.sender_id;
      if (!lastMsgMap.has(otherId)) {
        lastMsgMap.set(otherId, { content: m.file_name ? `📎 ${m.file_name}` : (m.content || ''), time: m.created_at });
      }
    });

    const list: Contact[] = profiles
      .filter(p => allowedUserIds === null || allowedUserIds.has(p.user_id))
      .map(p => ({
        id: p.user_id, name: p.name, role: roleMap.get(p.user_id) || 'cliente',
        avatar_url: (p as any).avatar_url || null,
        lastMessage: lastMsgMap.get(p.user_id)?.content,
        lastTime: lastMsgMap.get(p.user_id)?.time,
        unreadCount: unreadMap.get(p.user_id) || 0,
        agentLabel: agentLabelMap.get(p.user_id) || null,
      }))
      .sort((a, b) => {
        if (a.unreadCount > 0 && b.unreadCount === 0) return -1;
        if (b.unreadCount > 0 && a.unreadCount === 0) return 1;
        if (a.lastTime && b.lastTime) return new Date(b.lastTime).getTime() - new Date(a.lastTime).getTime();
        return 0;
      });
    setContacts(list);
  }, [user]);

  const loadMessages = async (contactId: string) => {
    if (!user) return;
    const { data } = await supabase.from('chat_messages').select('*')
      .or(`and(sender_id.eq.${user.id},receiver_id.eq.${contactId}),and(sender_id.eq.${contactId},receiver_id.eq.${user.id})`)
      .order('created_at', { ascending: true });
    setMessages(data || []);
    await supabase.from('chat_messages').update({ read: true }).eq('sender_id', contactId).eq('receiver_id', user.id).eq('read', false);
    loadContacts();
  };

  const sendMessage = async (fileData?: { url: string; type: string; name: string }) => {
    if ((!newMessage.trim() && !fileData) || !selectedContact || !user || sending) return;
    setSending(true);
    const text = newMessage.trim();
    setNewMessage(''); // Clear immediately for snappy UX

    const payload: any = { sender_id: user.id, receiver_id: selectedContact.id };
    if (fileData) {
      payload.file_url = fileData.url;
      payload.file_type = fileData.type;
      payload.file_name = fileData.name;
      payload.content = text || null;
    } else {
      payload.content = text;
    }

    const { data, error } = await supabase.from('chat_messages').insert(payload).select().single();
    if (data && !error) {
      // Add to messages immediately (real-time will deduplicate)
      setMessages(prev => {
        if (prev.some(m => m.id === data.id)) return prev;
        return [...prev, data as Message];
      });

      // Send notification to receiver
      try {
        await notifyEvent('CHAT_MESSAGE', {
          userId: selectedContact.id,
          fromUserId: user.id,
          clientName: user.name || 'Admin',
          rejectReason: fileData ? `📎 Enviou um ficheiro: ${fileData.name}` : text
        });
      } catch (notifyErr) {
        console.warn('[ChatModule] Notify error:', notifyErr);
      }

      loadContacts();
    } else if (error) {
      setNewMessage(text); // Restore message on error
    }
    setSending(false);
    inputRef.current?.focus();
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !user) return;
    if (file.size > 5 * 1024 * 1024) {
      alert('Ficheiro muito grande. Máximo 5MB.');
      if (fileInputRef.current) fileInputRef.current.value = '';
      return;
    }
    setUploading(true);
    try {
      const ext = file.name.split('.').pop();
      const path = `${user.id}/${Date.now()}.${ext}`;
      const { error } = await supabase.storage.from('chat-files').upload(path, file);
      if (error) { alert('Erro ao enviar ficheiro.'); return; }
      const { data: urlData } = supabase.storage.from('chat-files').getPublicUrl(path);
      await sendMessage({ url: urlData.publicUrl, type: file.type, name: file.name });
    } catch (err) {
      alert('Erro ao enviar ficheiro.');
    } finally {
      setUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  const addEmoji = (emoji: string) => { setNewMessage(prev => prev + emoji); inputRef.current?.focus(); };
  const formatTime = (ts: string) => new Date(ts).toLocaleTimeString('pt-MZ', { hour: '2-digit', minute: '2-digit' });
  const formatDate = (ts: string) => {
    const d = new Date(ts); const today = new Date();
    if (d.toDateString() === today.toDateString()) return 'Hoje';
    const y = new Date(today); y.setDate(y.getDate() - 1);
    if (d.toDateString() === y.toDateString()) return 'Ontem';
    return d.toLocaleDateString('pt-MZ', { day: '2-digit', month: '2-digit' });
  };
  const isImage = (type?: string | null) => type?.startsWith('image/');
  const filteredContacts = contacts.filter(c => c.name.toLowerCase().includes(searchTerm.toLowerCase()));
  const convColor = selectedContact ? getConversationColor(user?.role || 'cliente', selectedContact.role) : '#1a3a5c';
  const getRoleLabel = (role: string) => ({ gestor: 'Admin', agente: 'Agente', cliente: 'Cliente' }[role] || role);

  // Avatar component
  const Avatar = ({ contact, size = 44 }: { contact: Contact | null; size?: number }) => {
    if (!contact) return null;
    const color = getConversationColor(user?.role || 'cliente', contact.role);
    if (contact.avatar_url) {
      return (
        <img src={contact.avatar_url} alt={contact.name}
          className="rounded-full object-cover flex-shrink-0 shadow-sm"
          style={{ width: size, height: size }}
        />
      );
    }
    return (
      <div className="rounded-full flex items-center justify-center text-white font-bold flex-shrink-0 shadow-sm"
        style={{ width: size, height: size, backgroundColor: color, fontSize: size * 0.38 }}
      >
        {contact.name[0]?.toUpperCase()}
      </div>
    );
  };

  const renderFileContent = (msg: Message) => {
    if (!msg.file_url) return null;
    if (isImage(msg.file_type)) {
      return (
        <div className="mt-1 rounded-lg overflow-hidden cursor-pointer" onClick={() => setPreviewFile({ url: msg.file_url! })}>
          <img src={msg.file_url} alt={msg.file_name || ''} className="max-w-[240px] max-h-[200px] object-cover rounded-lg" loading="lazy" />
        </div>
      );
    }
    return (
      <a href={msg.file_url} target="_blank" rel="noopener noreferrer"
        className="mt-1 flex items-center gap-2 bg-black/5 rounded-lg px-3 py-2 text-sm hover:bg-black/10 transition-colors">
        <FileText className="h-4 w-4 flex-shrink-0" />
        <span className="truncate text-gray-700">{msg.file_name || 'Documento'}</span>
        <Download className="h-3.5 w-3.5 flex-shrink-0 ml-auto text-gray-500" />
      </a>
    );
  };

  return (
    <div className="h-[calc(100vh-120px)] md:h-[calc(100vh-140px)] flex flex-col">
      {/* Header */}
      <div className="flex items-center gap-3 mb-4 px-1">
        <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ backgroundColor: '#1a3a5c' }}>
          <MessageCircle className="h-5 w-5 text-white" />
        </div>
        <div>
          <h1 className="text-xl md:text-2xl font-bold text-gray-900">Chat</h1>
          <p className="text-xs text-gray-500">{contacts.length} contacto(s)</p>
        </div>
      </div>

      <div className="flex-1 grid grid-cols-1 lg:grid-cols-[340px_1fr] gap-0 min-h-0 rounded-2xl overflow-hidden shadow-lg border border-gray-200">
        {/* Dark Sidebar */}
        <div className={`flex flex-col overflow-hidden ${selectedContact ? 'hidden lg:flex' : 'flex'}`} style={{ backgroundColor: '#1e293b' }}>
          <div className="p-3 border-b border-white/10">
            <div className="flex items-center gap-2 mb-3">
              <MessageCircle className="h-4 w-4 text-white/70" />
              <span className="text-white/90 font-semibold text-sm">Conversas</span>
            </div>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-white/40" />
              <input placeholder="Procurar..." value={searchTerm} onChange={e => setSearchTerm(e.target.value)}
                className="w-full pl-9 pr-3 py-2 bg-white/10 border-0 rounded-xl text-sm text-white placeholder:text-white/30 focus:outline-none focus:ring-1 focus:ring-white/20" />
            </div>
          </div>
          <ScrollArea className="flex-1">
            <div className="p-2">
              {filteredContacts.length === 0 ? (
                <div className="text-center py-12 text-white/30">
                  <MessageCircle className="h-10 w-10 mx-auto mb-2 opacity-30" />
                  <p className="text-sm">Nenhum contacto</p>
                </div>
              ) : (
                filteredContacts.map(contact => {
                  const isSelected = selectedContact?.id === contact.id;
                  return (
                    <div key={contact.id} onClick={() => setSelectedContact(contact)}
                      className={`flex items-center gap-3 p-3 rounded-xl cursor-pointer transition-all duration-200 mb-1 ${isSelected ? 'bg-white/15' : 'hover:bg-white/8'}`}>
                      <Avatar contact={contact} size={44} />
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between">
                          <span className="font-semibold text-sm text-white truncate">{contact.name}</span>
                          {contact.lastTime && <span className="text-[10px] text-white/40 flex-shrink-0 ml-2">{formatDate(contact.lastTime)}</span>}
                        </div>
                        <div className="flex items-center justify-between mt-0.5">
                          <div className="flex items-center gap-1.5 min-w-0">
                            <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full text-white flex-shrink-0"
                              style={{ backgroundColor: getConversationColor(user?.role || 'cliente', contact.role) }}>
                              {getRoleLabel(contact.role)}
                            </span>
                            {contact.agentLabel && (
                              <span className="text-[9px] font-semibold px-1.5 py-0.5 rounded-full bg-amber-500/80 text-white flex-shrink-0 truncate max-w-[80px]" title={`Agente: ${contact.agentLabel}`}>
                                AG: {contact.agentLabel}
                              </span>
                            )}
                            {contact.lastMessage && <span className="text-xs text-white/30 truncate max-w-[80px]">{contact.lastMessage}</span>}
                          </div>
                          {contact.unreadCount > 0 && (
                            <span className="w-5 h-5 rounded-full bg-green-500 text-white text-[10px] font-bold flex items-center justify-center flex-shrink-0">
                              {contact.unreadCount}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </ScrollArea>
        </div>

        {/* Chat Area */}
        <div className={`flex flex-col bg-[#efeae2] overflow-hidden ${selectedContact ? 'flex' : 'hidden lg:flex'}`}>
          {selectedContact ? (
            <>
              {/* Chat Header */}
              <div className="flex items-center gap-3 px-4 py-3 bg-white border-b border-gray-200 shadow-sm">
                <Button variant="ghost" size="icon" className="lg:hidden h-8 w-8" onClick={() => setSelectedContact(null)}>
                  <ChevronLeft className="h-5 w-5" />
                </Button>
                <Avatar contact={selectedContact} size={40} />
                <div className="flex-1 min-w-0">
                  <h2 className="font-bold text-gray-900 truncate text-sm">{selectedContact.name}</h2>
                  <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full text-white"
                    style={{ backgroundColor: convColor }}>{getRoleLabel(selectedContact.role)}</span>
                </div>
              </div>

              {/* Messages */}
              <ScrollArea className="flex-1 min-h-0">
                <div className="p-4 space-y-1 min-h-full"
                  style={{ backgroundImage: 'url("data:image/svg+xml,%3Csvg width=\'60\' height=\'60\' viewBox=\'0 0 60 60\' xmlns=\'http://www.w3.org/2000/svg\'%3E%3Cg fill=\'none\' fill-rule=\'evenodd\'%3E%3Cg fill=\'%23d5cfc5\' fill-opacity=\'0.18\'%3E%3Cpath d=\'M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z\'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")' }}>
                  {messages.length === 0 && (
                    <div className="text-center py-16 text-gray-400">
                      <MessageCircle className="h-12 w-12 mx-auto mb-3 opacity-20" />
                      <p className="text-sm">Envie a primeira mensagem</p>
                    </div>
                  )}
                  {messages.map((msg, i) => {
                    const isMine = msg.sender_id === user?.id;
                    const showDate = i === 0 || formatDate(messages[i - 1].created_at) !== formatDate(msg.created_at);
                    return (
                      <div key={msg.id} className="contents">
                        {showDate && (
                          <div className="flex justify-center my-3">
                            <span className="text-[11px] bg-white/80 text-gray-600 px-4 py-1 rounded-full font-medium shadow-sm">{formatDate(msg.created_at)}</span>
                          </div>
                        )}
                        <div className={`flex ${isMine ? 'justify-end' : 'justify-start'} mb-1`}>
                          {/* Show small avatar for received messages */}
                          {!isMine && (
                            <div className="flex-shrink-0 mr-1.5 self-end mb-1">
                              <Avatar contact={selectedContact} size={24} />
                            </div>
                          )}
                          <div className="max-w-[75%] md:max-w-[60%] rounded-xl px-3.5 py-2 shadow-sm"
                            style={{
                              backgroundColor: isMine ? '#d9fdd3' : '#ffffff',
                              borderTopLeftRadius: isMine ? '12px' : '4px',
                              borderTopRightRadius: isMine ? '4px' : '12px',
                            }}>
                            {renderFileContent(msg)}
                            {msg.content && <p className="text-[13.5px] leading-relaxed text-gray-900 whitespace-pre-wrap">{msg.content}</p>}
                            <div className="flex items-center justify-end gap-1 mt-0.5 -mb-0.5">
                              <span className="text-[10px] text-gray-500">{formatTime(msg.created_at)}</span>
                              {isMine && (
                                msg.read
                                  ? <CheckCheck className="h-3.5 w-3.5 text-blue-500" />
                                  : <Check className="h-3.5 w-3.5 text-gray-400" />
                              )}
                            </div>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                  <div ref={messagesEndRef} />
                </div>
              </ScrollArea>

              {/* Emoji Picker */}
              {showEmoji && (
                <div ref={emojiRef} className="bg-white border-t border-gray-200 p-3">
                  <div className="grid grid-cols-10 gap-1">
                    {EMOJI_LIST.map(emoji => (
                      <button key={emoji} onClick={() => addEmoji(emoji)}
                        className="h-9 w-9 flex items-center justify-center text-xl hover:bg-gray-100 rounded-lg transition-colors">{emoji}</button>
                    ))}
                  </div>
                </div>
              )}

              {/* Input */}
              <div className="bg-white border-t border-gray-200 px-3 py-2.5">
                <div className="flex items-center gap-1.5">
                  <button onClick={() => setShowEmoji(!showEmoji)}
                    className={`h-9 w-9 flex items-center justify-center rounded-full transition-colors ${showEmoji ? 'bg-gray-200' : 'text-gray-500 hover:bg-gray-100'}`}>
                    <Smile className="h-5 w-5" />
                  </button>
                  <button onClick={() => fileInputRef.current?.click()} disabled={uploading}
                    className="h-9 w-9 flex items-center justify-center rounded-full text-gray-500 hover:bg-gray-100 transition-colors">
                    <Paperclip className="h-5 w-5" />
                  </button>
                  <input ref={fileInputRef} type="file" accept="image/jpeg,image/png,image/gif,image/webp,.pdf,.doc,.docx" onChange={handleFileUpload} className="hidden" />
                  <input ref={inputRef} placeholder={uploading ? 'A enviar...' : 'Escreva uma mensagem...'}
                    value={newMessage} onChange={e => setNewMessage(e.target.value)}
                    onKeyDown={e => e.key === 'Enter' && !e.shiftKey && sendMessage()} disabled={uploading}
                    className="flex-1 bg-gray-100 border-0 rounded-full px-4 py-2.5 text-sm text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-gray-200" />
                  <button onClick={() => sendMessage()} disabled={(!newMessage.trim() && !uploading) || sending}
                    className="h-10 w-10 rounded-full flex items-center justify-center text-white shadow-md transition-all hover:shadow-lg disabled:opacity-40"
                    style={{ backgroundColor: convColor }}>
                    <Send className="h-4 w-4" />
                  </button>
                </div>
              </div>
            </>
          ) : (
            <div className="flex-1 flex items-center justify-center">
              <div className="text-center p-6">
                <div className="w-24 h-24 rounded-full bg-white/60 flex items-center justify-center mx-auto mb-5 shadow-inner">
                  <MessageCircle className="h-12 w-12 text-gray-400" />
                </div>
                <h3 className="font-bold text-gray-700 text-lg mb-1">Chat Interno</h3>
                <p className="text-sm text-gray-500">Selecione um contacto para conversar</p>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Image Preview */}
      {previewFile && (
        <div className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center p-4" onClick={() => setPreviewFile(null)}>
          <button className="absolute top-4 right-4 text-white hover:text-gray-300" onClick={() => setPreviewFile(null)}><X className="h-8 w-8" /></button>
          <img src={previewFile.url} alt="" className="max-w-full max-h-[90vh] object-contain rounded-xl shadow-2xl" />
        </div>
      )}
    </div>
  );
};

export default ChatModule;
