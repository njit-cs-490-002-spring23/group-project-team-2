import React, { useState, useEffect, useMemo } from 'react';
import useTownController from '../../../../../hooks/useTownController';
import { ChatMessage } from '../../../../../types/CoveyTownSocket';
import TextConversation from '../../../../../classes/TextConversation';
import './ChatArea.css';

export function ChatArea(): JSX.Element {
  const [message, setMessage] = useState('');
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([]);

  const townController = useTownController();
  const chatController = useMemo(() => new TextConversation(townController), [townController]);

  const handleSendMessage = () => {
    if (message.trim() === '') return;
    chatController.sendMessage(message);

    setMessage('');
  };

  useEffect(() => {
    const handleChatMessage = (msg: ChatMessage) => {
      setChatMessages(prevMessages => [...prevMessages, msg]);
    };

    chatController.onMessageAdded(handleChatMessage);

    return () => {
      chatController.offMessageAdded(handleChatMessage);
    };
  }, [chatController]);

  return (
    <div className='chatContainer'>
      <ul className='chatMessages'>
        {chatMessages.map(msg => (
          <li key={msg.sid}>
            <strong>{msg.author}:</strong> {msg.body}
          </li>
        ))}
      </ul>
      <div className='chatInput'>
        <input
          type='text'
          placeholder='Type your message'
          value={message}
          onChange={e => setMessage(e.target.value)}
        />
        <button onClick={handleSendMessage}>Send</button>
      </div>
    </div>
  );
}
