import { createContext, useContext } from 'react'

const ChatPanelContext = createContext({ panelOpen: false })

export const useChatPanel = () => useContext(ChatPanelContext)
export default ChatPanelContext
