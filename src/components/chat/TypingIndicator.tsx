import React from 'react';
import { TypingIndicator as TypingIndicatorType } from '../../types';

interface TypingIndicatorProps {
  indicators: TypingIndicatorType[];
  conversationId: string;
}

export const TypingIndicator: React.FC<TypingIndicatorProps> = ({
  indicators,
  conversationId
}) => {
  const relevantIndicators = indicators.filter(
    indicator => indicator.conversationId === conversationId
  );

  if (relevantIndicators.length === 0) {
    return null;
  }

  const formatTypingText = (names: string[]) => {
    if (names.length === 1) {
      return `${names[0]} is typing...`;
    } else if (names.length === 2) {
      return `${names[0]} and ${names[1]} are typing...`;
    } else {
      return `${names[0]} and ${names.length - 1} others are typing...`;
    }
  };

  const typingNames = relevantIndicators.map(indicator => indicator.userName);

  return (
    <div className="flex items-center space-x-2 px-4 py-2">
      <div className="flex space-x-1">
        <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
        <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
        <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
      </div>
      <span className="text-sm text-gray-500 italic">
        {formatTypingText(typingNames)}
      </span>
    </div>
  );
};