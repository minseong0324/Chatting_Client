import React, { useState, useEffect, useRef } from 'react';
import SockJS from 'sockjs-client';
import Stomp from 'stompjs';

interface MessageOutput {
    senderId: string;
    message: string;
  }

  interface Frame {
    command: string;
    headers: Record<string, string>;
    body: string;
}

interface Client {
    send: (destination: string, headers?: Record<string, unknown>, body?: string) => void;
    subscribe: (destination: string, callback: (message: MessageEvent) => void) => void;
    // 필요에 따라 더 많은 메소드 및 프로퍼티 추가
  }
  
  interface MessageEvent {
    body: string;
    // 필요에 따라 더 많은 프로퍼티 추가
  }
  

const ChatTest: React.FC = () => {
    const [stompClient, setStompClient] = useState<Client | null>(null);
    const [serverUrl, setServerUrl] = useState('http://localhost:8080/ws');
  const [senderId, setSenderId] = useState('1');
  const [receiverId, setReceiverId] = useState('2');
  const [roomId, setRoomId] = useState('1001');
  const [message, setMessage] = useState('');
  const [chatArea, setChatArea] = useState<string[]>([]);

  const chatAreaRef = useRef<HTMLDivElement | null>(null);

  const connectToServer = () => {
    const socket = new SockJS(serverUrl);
    const client = Stomp.over(socket);

    client.connect(
        { login: '', passcode: '' },
        (frame?: Frame | undefined) => {  // 콜백 매개 변수를 Frame | undefined로 정의합니다.
            console.log('Connected: ' + frame);
            setStompClient(client);

            client.subscribe(`/subscribe/rooms/${roomId}`, (messageOutput: { body: string; }) => {
                showMessageOutput(JSON.parse(messageOutput.body));
            });
        }
    );
};

  

  const sendMessage = () => {
    if (stompClient) {
      const chatRequest = {
        senderId,
        receiverId,
        roomId,
        message
      };

      stompClient.send("/app/messages", {}, JSON.stringify(chatRequest));
    }
  };

  const showMessageOutput = (messageOutput: MessageOutput) => {
    setChatArea(prevChatArea => [...prevChatArea, `${messageOutput.senderId}: ${messageOutput.message}`]);
  };

  useEffect(() => {
    if (chatAreaRef.current) {
      chatAreaRef.current.scrollTop = chatAreaRef.current.scrollHeight;
    }
  }, [chatArea]);

  return (
    <div>
      <h2>Chat Test</h2>
      Server URL: <input type="text" value={serverUrl} onChange={(e) => setServerUrl(e.target.value)} /><br />
      Sender ID: <input type="text" value={senderId} onChange={(e) => setSenderId(e.target.value)} /><br />
      Receiver ID: <input type="text" value={receiverId} onChange={(e) => setReceiverId(e.target.value)} /><br />
      Room ID: <input type="text" value={roomId} onChange={(e) => setRoomId(e.target.value)} /><br />
      Message: <input type="text" value={message} onChange={(e) => setMessage(e.target.value)} /><br />
      <button onClick={sendMessage}>Send</button>
      <button onClick={connectToServer}>Connect</button>
      <div id="chatArea" ref={chatAreaRef} style={{ border: '1px solid black', padding: '10px', marginTop: '20px', height: '300px', overflowY: 'scroll' }}>
        {chatArea.map((message, index) => (
          <p key={index}>{message}</p>
        ))}
      </div>
    </div>
  );
};

export default ChatTest;
