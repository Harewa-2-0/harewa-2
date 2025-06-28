import { create } from 'zustand'
import { persist } from 'zustand/middleware'

interface Message {
  id: string
  content: string
  role: 'user' | 'assistant'
  timestamp: Date
  metadata?: {
    type?: 'text' | 'image' | 'file'
    fileName?: string
    fileSize?: number
  }
}

interface Conversation {
  id: string
  title: string
  messages: Message[]
  createdAt: Date
  updatedAt: Date
  isActive: boolean
}

interface ChatbotState {
  // Conversations
  conversations: Conversation[]
  currentConversationId: string | null
  
  // UI State
  isLoading: boolean
  isTyping: boolean
  
  // Actions
  createConversation: (title?: string) => string
  deleteConversation: (conversationId: string) => void
  setCurrentConversation: (conversationId: string) => void
  
  // Messages
  addMessage: (conversationId: string, message: Omit<Message, 'id' | 'timestamp'>) => void
  updateMessage: (conversationId: string, messageId: string, content: string) => void
  deleteMessage: (conversationId: string, messageId: string) => void
  clearConversation: (conversationId: string) => void
  
  // UI Actions
  setLoading: (loading: boolean) => void
  setTyping: (typing: boolean) => void
  
  // Getters
  getCurrentConversation: () => Conversation | null
  getConversationById: (id: string) => Conversation | null
}

export const useChatbotStore = create<ChatbotState>()(
  persist(
    (set, get) => ({
      // Initial State
      conversations: [],
      currentConversationId: null,
      isLoading: false,
      isTyping: false,
      
      // Actions
      createConversation: (title = 'New Conversation') => {
        const conversationId = `conv_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
        const newConversation: Conversation = {
          id: conversationId,
          title,
          messages: [],
          createdAt: new Date(),
          updatedAt: new Date(),
          isActive: true,
        }
        
        set((state) => ({
          conversations: [newConversation, ...state.conversations],
          currentConversationId: conversationId,
        }))
        
        return conversationId
      },
      
      deleteConversation: (conversationId) => set((state) => ({
        conversations: state.conversations.filter(conv => conv.id !== conversationId),
        currentConversationId: state.currentConversationId === conversationId ? null : state.currentConversationId,
      })),
      
      setCurrentConversation: (conversationId) => set({ currentConversationId: conversationId }),
      
      addMessage: (conversationId, messageData) => {
        const message: Message = {
          ...messageData,
          id: `msg_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
          timestamp: new Date(),
        }
        
        set((state) => ({
          conversations: state.conversations.map(conv =>
            conv.id === conversationId
              ? {
                  ...conv,
                  messages: [...conv.messages, message],
                  updatedAt: new Date(),
                }
              : conv
          ),
        }))
      },
      
      updateMessage: (conversationId, messageId, content) => set((state) => ({
        conversations: state.conversations.map(conv =>
          conv.id === conversationId
            ? {
                ...conv,
                messages: conv.messages.map(msg =>
                  msg.id === messageId
                    ? { ...msg, content }
                    : msg
                ),
                updatedAt: new Date(),
              }
            : conv
        ),
      })),
      
      deleteMessage: (conversationId, messageId) => set((state) => ({
        conversations: state.conversations.map(conv =>
          conv.id === conversationId
            ? {
                ...conv,
                messages: conv.messages.filter(msg => msg.id !== messageId),
                updatedAt: new Date(),
              }
            : conv
        ),
      })),
      
      clearConversation: (conversationId) => set((state) => ({
        conversations: state.conversations.map(conv =>
          conv.id === conversationId
            ? {
                ...conv,
                messages: [],
                updatedAt: new Date(),
              }
            : conv
        ),
      })),
      
      setLoading: (loading) => set({ isLoading: loading }),
      setTyping: (typing) => set({ isTyping: typing }),
      
      // Getters
      getCurrentConversation: () => {
        const { conversations, currentConversationId } = get()
        return conversations.find(conv => conv.id === currentConversationId) || null
      },
      
      getConversationById: (id) => {
        const { conversations } = get()
        return conversations.find(conv => conv.id === id) || null
      },
    }),
    {
      name: 'chatbot-store',
      partialize: (state) => ({ 
        conversations: state.conversations,
        currentConversationId: state.currentConversationId 
      }),
    }
  )
) 