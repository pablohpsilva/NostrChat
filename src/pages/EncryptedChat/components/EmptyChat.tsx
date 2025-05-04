interface EmptyChatProps {
  onBackClick: () => void;
}

const EmptyChat = ({ onBackClick }: EmptyChatProps) => {
  return (
    <div className="flex flex-col h-full">
      {/* <div className="p-4 border-b border-gray-200 flex items-center">
        <button onClick={onBackClick} className="mr-3 text-gray-600">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-6 w-6"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M4 6h16M4 12h16M4 18h16"
            />
          </svg>
        </button>
        <h2 className="text-xl font-semibold">Chat</h2>
      </div> */}
      <div className="flex-1 flex items-center justify-center text-gray-500">
        Select a conversation to start chatting
      </div>
    </div>
  );
};

export default EmptyChat;
