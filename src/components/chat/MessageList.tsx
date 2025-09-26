// components/chat/MessageList.tsx
import React, { useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Volume2 } from "lucide-react";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Card } from "@/components/ui/card";
import { Message } from "@/types/chat.type";
import { ImageMessage } from "./ImageMessage";

interface MessageListProps {
  messages: Message[];
}

export const MessageList: React.FC<MessageListProps> = ({ messages }) => {
  const scrollAreaRef = useRef<HTMLDivElement>(null);

  // Auto scroll to bottom when new messages are added
  useEffect(() => {
    if (scrollAreaRef.current) {
      scrollAreaRef.current.scrollTop = scrollAreaRef.current.scrollHeight;
    }
  }, [messages]);

  const renderMessage = (message: Message) => {
    // Render image messages with special component
    if (message.type === "image") {
      return <ImageMessage key={message.id} message={message} />;
    }

    // Render text and audio messages
    return (
      <motion.div
        key={message.id}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -20 }}
        className={` flex ${
          message.role === "user" ? "justify-end" : "justify-start"
        }`}
      >
        <div
          className={`max-w-[80%] p-3 rounded-lg ${
            message.role === "user"
              ? "bg-primary text-primary-foreground ml-auto"
              : "bg-muted text-muted-foreground"
          }`}
        >
          <div className="flex items-center gap-2 mb-1">
            {message.type === "audio" && (
              <div className="flex items-center gap-1">
                <Volume2 className="h-3 w-3" />
                <span className="text-xs">Audio</span>
              </div>
            )}
          </div>
          <p className="text-sm">{message.content}</p>
          <p className="text-xs opacity-70 mt-1">
            {message.timestamp.toLocaleTimeString()}
          </p>
        </div>
      </motion.div>
    );
  };

  return (
    <Card className="flex-1 bg-card border-border">
      <ScrollArea className="h-[300px] p-4" ref={scrollAreaRef}>
        <div className="space-y-4">
          <AnimatePresence>{messages.map(renderMessage)}</AnimatePresence>
        </div>
      </ScrollArea>
    </Card>
  );
};
