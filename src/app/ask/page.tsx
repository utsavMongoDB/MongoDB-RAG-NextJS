"use client";
import { useState, ChangeEvent, FormEvent } from 'react';
import NavBar from '../component/navbar';

interface Message {
  id: number;
  sender: string;
  text: string;
}

const simulateAIResponse = async (userMessage: string): Promise<string> => {
  // Make the GET request with fetch
  const response = await fetch('/api/?query=' + userMessage);
  console.log("res : ", response) 
  const jsonData = await response.json();
  return JSON.parse(JSON.stringify(jsonData))['text'];
};


export default function Home() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState<string>('');
  const [waitingForAI, setWaitingForAI] = useState<Boolean>(false);

  const sendMessage = async (e: FormEvent<HTMLFormElement> | ChangeEvent<HTMLInputElement>) => {
    e.preventDefault();
    if (!newMessage.trim()) return;

    const updatedMessages = [...messages, { id: messages.length + 1, sender: 'User', text: newMessage }];
    setMessages(updatedMessages);
    setWaitingForAI(true)

    setNewMessage('');
    const aiResponse = await simulateAIResponse(newMessage);
    const updatedMessagesWithAIResponse = [...updatedMessages, { id: updatedMessages.length + 1, sender: 'AI', text: aiResponse }];
    setMessages(updatedMessagesWithAIResponse);
    setWaitingForAI(false)

  };

  return (
    <div>
      <NavBar />
      <div
        style={{ height: '70vh', overflowY: 'scroll', flexDirection: "column-reverse", display: "flex" }}
        className="mx-auto p-6 rounded-lg "
      >
        <>
          {waitingForAI &&
            (
              <div className="loading">
                <img src='/1484.gif'></img>
              </div>
            )}
        </>
        <div className="pr-4 messages" style={{ minWidth: '100%', display: 'table' }}>
          {messages.map((message) => (
            <div key={message.id} className="flex gap-3 my-4 text-gray-600 text-sm flex-1">
              <span className="relative flex shrink-0 overflow-hidden rounded-full w-8 h-8" style={{ margin: '30px', marginTop: '0px' }}>
                <div className="rounded-full bg-gray-100 border p-1">
                  {message.sender === 'AI' ? (
                    <img src="/bot.png" />
                  ) : (
                    <img src="/user.png" />
                  )}
                </div>
              </span>
              <p className="leading-relaxed" style={{ color: 'aliceblue' }}>
                <span className="block font-bold">{message.sender}</span>
                {message.text}
              </p>
            </div>
          ))}
        </div>

        <div className="flex items-center pt-0 chat-window">
          <form className="flex items-center justify-center w-full space-x-2" onSubmit={sendMessage}>
            <input
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              className="flex h-10 w-full rounded-md border border-[#e5e7eb] px-3 py-2 text-sm placeholder-[#6b7280] focus:outline-none focus:ring-2 focus:ring-[#9ca3af] disabled:cursor-not-allowed disabled:opacity-50 text-[#030712] focus-visible:ring-offset-2"
              placeholder="Type your message"
            />
            <button
              type="submit"
              className="inline-flex items-center justify-center rounded-md text-sm font-medium text-[#f9fafb] disabled:pointer-events-none disabled:opacity-50 bg-black hover:bg-[#111827E6] h-10 px-4 py-2"
            >
              Send
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
