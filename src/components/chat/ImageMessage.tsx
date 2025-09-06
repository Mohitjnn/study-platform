// components/chat/ImageMessage.tsx
import React from 'react';
import { motion } from 'framer-motion';
import { Message } from '@/types/chat.type';

interface ImageMessageProps {
  message: Message;
}

export const ImageMessage: React.FC<ImageMessageProps> = ({ message }) => {
  if (message.type !== 'image' || !message.imageUrl) {
    return null;
  }

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.8 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.8 }}
      className="flex justify-start"
    >
      <div className="max-w-[80%] bg-muted text-muted-foreground rounded-lg overflow-hidden">
        <div className="relative">
          <img
            src={message.imageUrl}
            alt={message.explanation || 'Generated image'}
            className="w-full h-auto max-w-md rounded-t-lg"
            onError={(e) => {
              console.error('Failed to load image:', message.imageUrl);
              e.currentTarget.style.display = 'none';
            }}
            onLoad={() => {
              console.log('Image loaded successfully:', message.imageUrl);
            }}
          />
          <div className="absolute bottom-0 left-0 right-0 bg-black bg-opacity-50 text-white p-2">
            <div className="flex items-center gap-2">
              <span className="text-xs">🖼️ Image</span>
            </div>
          </div>
        </div>
        
        {message.explanation && (
          <div className="p-3">
            <p className="text-sm">{message.explanation}</p>
            <p className="text-xs opacity-70 mt-1">
              {message.timestamp.toLocaleTimeString()}
            </p>
          </div>
        )}
      </div>
    </motion.div>
  );
};