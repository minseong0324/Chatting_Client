// React 및 필요한 hook과 라이브러리를 가져옵니다.
import React, { useState, useEffect, useRef } from 'react';
import SockJS from 'sockjs-client';
import Stomp from 'stompjs';

// 메시지 출력에 사용될 인터페이스를 정의합니다.
interface MessageOutput {
    senderId: string;
    message: string;
}

// 프레임 인터페이스를 정의합니다.
interface Frame {
    command: string;
    headers: Record<string, string>;
    body: string;
}

// 클라이언트 인터페이스를 정의합니다.
interface Client {
    send: (destination: string, headers?: Record<string, string>, body?: string) => void; // headers 타입을 수정했습니다.
    subscribe: (destination: string, callback: (message: MessageEvent) => void) => void;
}

// 메시지 이벤트 인터페이스를 정의합니다.
interface MessageEvent {
    body: string;
}

// ChatTest 컴포넌트를 정의합니다.
const ChattingPage: React.FC = () => {
    // 상태 훅을 사용하여 변수를 초기화하고 설정합니다.
    const [stompClient, setStompClient] = useState<Client | null>(null);
    const [serverUrl, setServerUrl] = useState('http://localhost:8080/ws');
    const [senderId, setSenderId] = useState('1');
    const [receiverId, setReceiverId] = useState('2');
    const [roomId, setRoomId] = useState('1001');
    const [message, setMessage] = useState('');
    const [chatArea, setChatArea] = useState<string[]>([]);

    // 채팅 영역에 대한 참조를 만듭니다.
    const chatAreaRef = useRef<HTMLDivElement | null>(null);

    // 서버에 연결하는 함수를 정의합니다.
    const connectToServer = () => {
        const socket = new SockJS(serverUrl);  // SockJS를 사용하여 소켓을 생성합니다.
        const client = Stomp.over(socket);  // Stomp 클라이언트를 생성합니다.

        client.connect(
            { login: '', passcode: '' },
            (frame?: Frame | undefined) => {
                console.log('Connected: ' + frame);
                setStompClient(client);  // 연결이 성공하면 Stomp 클라이언트를 설정합니다.

                client.subscribe(`/subscribe/rooms/${roomId}`, (messageOutput: { body: string; }) => {
                    showMessageOutput(JSON.parse(messageOutput.body));  // 메시지를 구독하고 출력합니다.
                });
            }
        );
    };

    // 메시지를 전송하는 함수를 정의합니다.
    const sendMessage = () => {
        if (stompClient) {
            const chatRequest = {
                senderId,
                receiverId,
                roomId,
                message
            };

            stompClient.send("/app/messages", {}, JSON.stringify(chatRequest));  // 메시지를 전송합니다.
        }
    };

    // 메시지 출력을 표시하는 함수를 정의합니다.
    const showMessageOutput = (messageOutput: MessageOutput) => {
        setChatArea(prevChatArea => [...prevChatArea, `${messageOutput.senderId}: ${messageOutput.message}`]);  // 새 메시지를 채팅 영역에 추가합니다.
    };

    // 채팅 영역이 업데이트 될 때마다 스크롤을 아래로 이동시킵니다.
    useEffect(() => {
        if (chatAreaRef.current) {
            chatAreaRef.current.scrollTop = chatAreaRef.current.scrollHeight;
        }
    }, [chatArea]);

    // 컴포넌트를 렌더링합니다.
    return (
        <div>
            <h2>Chat Test</h2>
            {/* 여러 입력 필드와 버튼을 렌더링합니다. */}
            Server URL: <input type="text" value={serverUrl} onChange={(e) => setServerUrl(e.target.value)} /><br />
            Sender ID: <input type="text" value={senderId} onChange={(e) => setSenderId(e.target.value)} /><br />
            Receiver ID: <input type="text" value={receiverId} onChange={(e) => setReceiverId(e.target.value)} /><br />
            Room ID: <input type="text" value={roomId} onChange={(e) => setRoomId(e.target.value)} /><br />
            Message: <input type="text" value={message} onChange={(e) => setMessage(e.target.value)} /><br />
            <button onClick={sendMessage}>Send</button>
            <button onClick={connectToServer}>Connect</button>
            {/* 채팅 영역을 렌더링합니다. */}
            <div id="chatArea" ref={chatAreaRef} style={{ border: '1px solid black', padding: '10px', marginTop: '20px', height: '300px', overflowY: 'scroll' }}>
                {chatArea.map((message, index) => (
                    <p key={index}>{message}</p>
                ))}
            </div>
        </div>
    );
};

export default ChattingPage;
