import { createContext, useContext } from 'react'
import useChatbot from '../hooks/useChatbot'

const ChatbotContext = createContext(null)

export function ChatbotProvider({ children }) {
  const chatbot = useChatbot()
  return (
    <ChatbotContext.Provider value={chatbot}>
      {children}
    </ChatbotContext.Provider>
  )
}

export function useChatbotShared() {
  return useContext(ChatbotContext)
}
