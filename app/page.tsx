'use client'

import ChatInput from '@/components/core/ChatInput';
import ChatMessage from '@/components/core/ChatMessage';
import { TextShimmerWave } from '@/components/ui/text-shimmer-wave';
import { useChat } from '@ai-sdk/react';
import { useState } from 'react';

function ChatComponent() {
  const [showSearch, setShowSearch] = useState(false);
  const [showThink, setShowThink] = useState(false);
  const [showCanvas, setShowCanvas] = useState(false);
  const { messages, input, setInput, handleInputChange, handleSubmit, isLoading } = useChat({
    api: '/api/chat',
    body: {
      webSearch: showSearch,
      reasoning: showThink,
    },
    headers: {
      Authorization: `Bearer ${process.env.OPENAI_API_KEY!}`,
    },
  });
  return (
    <div className="flex flex-col h-[calc(100dvh-3rem)]">
      <div className="flex-1 overflow-y-auto p-4">
        {messages?.map((msg, i) =>
          <ChatMessage key={i} isUser={msg.role === "user"} content={msg} />
        )
        }
        {isLoading && (
          <TextShimmerWave>
            Typing...
          </TextShimmerWave>
        )}
      </div>
      <ChatInput showSearch={showSearch} showThink={showThink} showCanvas={showCanvas} setShowCanvas={setShowCanvas} setShowSearch={setShowSearch} setShowThink={setShowThink} input={input} handleInputChange={handleInputChange} handleSubmit={handleSubmit} isGenerating={isLoading} setInput={setInput} />
    </div>
  );
}

export default ChatComponent;
