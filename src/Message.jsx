import { ChevronLeft, Send } from "lucide-react";
import { ChatMessageList } from "@/components/ui/chat/chat-message-list";
import {
  ChatBubble,
  ChatBubbleMessage,
} from "@/components/ui/chat/chat-bubble";
import { ChatInput } from "@/components/ui/chat/chat-input";
import AvatarIcon from "@/assets/widgetChatAvatar.png";
import { useEffect, useState } from "react";
import { useWidget } from "@/context/WidgetContext";

const Message = ({ onBack, agentId }) => {
  console.log(agentId, "****agentId");
  const {
    messages,
    isLoading,
    isConnected,
    error,
    initializeChat,
    cleanupChat,
    sendMessage,
  } = useWidget();
  const [message, setMessage] = useState("");

  useEffect(() => {
    let isMounted = false;

    if (!isMounted) {
      console.log("setting up websocket01");
      initializeChat(agentId);
      isMounted = true;
    }

    return () => {
      console.log("setting up websocket02");
      isMounted = false;
      cleanupChat();
    };
  }, [agentId]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    const success = await sendMessage(message);
    if (success) {
      setMessage("");
    }
  };

  if (isLoading) {
    return <div>Loading...</div>;
  }

  return (
    <>
      <div className="bg-black px-4 py-[22px] h-full max-h-[92px] rounded-t-[18px] flex flex-col">
        <div className="flex justify-evenly gap-2 items-center mr-auto">
          <ChevronLeft
            onClick={onBack}
            className="text-white hover:cursor-pointer"
          />
          <img src={AvatarIcon} alt="avatar" width={40} height={40} />
          <div className="flex flex-col text-white text-base leading-6">
            <p className="font-medium text-zinc-100">Angela Campbell</p>
            <p className="text-zinc-200/[.5] text-sm">AI Sales Support Agent</p>
          </div>
        </div>
      </div>
      <div className="w-full mx-auto max-h-[471px] h-full">
        <ChatMessageList className="overflow-y-scroll">
          {messages.map((message, index) => (
            <ChatBubble
              key={index}
              variant={message.source === "assistant" ? "received" : "sent"}
            >
              {message.source === "assistant" && (
                <img src={AvatarIcon} alt="ai image" className="rounded-full" />
              )}
              <ChatBubbleMessage
                className={`text-sm font-geist leading-5 ${
                  message.source === "assistant" ? "bg-gray-100" : "bg-gray-800"
                }`}
              >
                {message.text}
              </ChatBubbleMessage>
            </ChatBubble>
          ))}
        </ChatMessageList>
        <div className="px-4 bottom-0 bg-secondary rounded-b-lg h-[80px] flex items-center">
          <form
            className="flex items-center justify-center gap-2 w-full"
            onSubmit={handleSubmit}
          >
            <ChatInput
              placeholder="Type your message here..."
              className="min-h-12 resize-none bg-gray-100 text-slate-400 rounded-full p-3 shadow-none focus:ring-0 focus-visible:ring-0 focus:border-0 focus-visible:border-0 border-0 ring-0 flex items-center"
              value={message}
              onChange={(e) => setMessage(e.target.value)}
            />
            <button type="submit" className="ml-auto">
              <Send className="text-slate-400 h-6 w-6" />
            </button>
          </form>
        </div>
      </div>
    </>
  );
};

export default Message;
