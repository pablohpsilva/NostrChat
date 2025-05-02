interface ChatMessageProps {
  isFromMe: boolean;
  content: string;
  timestamp: number;
}

const ChatMessage = ({ isFromMe, content, timestamp }: ChatMessageProps) => {
  return (
    <div
      className={`p-3 rounded-lg max-w-xs ${
        isFromMe ? "ml-auto bg-blue-500 text-white" : "bg-gray-200"
      }`}
    >
      {content}
      <div className="text-xs mt-1 opacity-70">
        {new Date(timestamp * 1000).toLocaleTimeString()}
      </div>
    </div>
  );
};

export default ChatMessage;
