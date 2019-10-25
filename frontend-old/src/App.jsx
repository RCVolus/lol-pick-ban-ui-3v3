import React, {useEffect, useState} from 'react';
import Overlay from "./europe/Overlay";
import convertState from './convertState';

function App() {
    const backendUrl = process.env.REACT_APP_LCSU_BACKEND || window.location.hostname;
    const socketUrl = window.location.pathname === '/example' ? `ws://${backendUrl}/example` : 'ws://' + backendUrl + '/ws';

    const [globalState, setGlobalState] = useState({});
    const [config, setConfig] = useState({
        frontend: {
            scoreEnabled: false,
            spellsEnabled: true,
            coachesEnabled: false,
            blueTeam: {
                name: "Team Blue",
                score: 0,
                coach: "",
                color: "rgb(0,151,196)"
            },
            redTeam: {
                name: "Team Red",
                score: 0,
                coach: "",
                color: "rgb(222,40,70)"
            },
            patch: "",
            socketUrl,
            backendUrl
        }
    });
    useEffect(() => {
        console.log(`WebSocket service: ${socketUrl}`);
        let socket;

        const onopen = (() => {
            console.log('Connected to WS backend!');
        });

        const onmessage = msg => {
            const data = JSON.parse(msg.data);
            if (data.heartbeat === true) {
                setConfig(data.config);
                return;
            }
            setGlobalState(data);
        };

        const observeConnection = () => {
            if (!socket || socket.readyState === WebSocket.CLOSED) {
                // Reset state
                setGlobalState({});
                console.log('Websocket is closed, try to reconnect!');
                socket = new WebSocket(socketUrl);
                socket.onopen = onopen;
                socket.onmessage = onmessage;
            }
        };

        observeConnection();
        setTimeout(() => setInterval(observeConnection, 500), 2000);
    }, [socketUrl]);

    console.log(backendUrl);

    return (
        <div className="App">
            <Overlay state={convertState(globalState, backendUrl)} config={config}/>
        </div>
    );
}

export default App;