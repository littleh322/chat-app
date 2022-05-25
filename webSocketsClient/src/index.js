import ReactDOM from 'react-dom';
import React from 'react';
import { w3cwebsocket as W3CWebSocket } from 'websocket';
import { Card, Avatar, Input, Typography } from 'antd';
import 'antd/dist/antd.css'
import './index.css';

const { Search } = Input;
const { Text } = Typography;
const { Meta } = Card;

const client = new W3CWebSocket('ws://127.0.0.1:8000');

const App = () => {
    const [isLoggedIn, setIsLoggedIn] = React.useState(false);
    const [appState, setAppState] = React.useState({
        userName: '',
        messages: [],
        // searchVal: ''
    });

    const onButtonClicked = (value) => {
        client.send(JSON.stringify({
            type: 'message',
            msg: value,
            user: appState.userName
        }));
        setAppState((prev) => ({...prev, searchVal: ''}));
    }

    React.useEffect(() => {
        client.onopen = () => {
            console.log('WebSocket Client Connection!')
        }
        client.onmessage = (message) => {
            const dataFromServer = JSON.parse(message.data);
            console.log('got reply!', dataFromServer);

            if(dataFromServer.type === 'message') {
                setAppState((state) => ({...state,
                    messages: [...state.messages,
                    {
                        msg: dataFromServer.msg,
                        user: dataFromServer.user
                    }]
                }));
            }
        }
    }, []);

    return (
        <div>
            {isLoggedIn ? 
                <div>
                    <div className='title'>
                        <Text type="secondary" style={{fontSize: '36px'}}>WEB SOCKET CHAT</Text>
                    </div>
                    <div style={{ display: 'flex', flexDirection: 'column', paddingBottom: 50}}>
                        {appState.messages.map(message => 
                            <Card key={message.msg} style={{ width: 300, margin: '16px 4px 0 4px', alignSelf: appState.userName === message.user ? 'flex-end' : 'flex-start'}}>
                                <Meta 
                                    avatar={
                                        <Avatar style={{ color: '#f56a00', backgroundColor: '#fde3cf'}}>{message.user[0].toUpperCase()}</Avatar>
                                    }
                                    title={message.user}
                                    description={message.msg}
                                />
                            </Card>
                        )}
                    </div>
                    <div className="bottom">
                        <Search 
                            placeholder='input message and send'
                            enterButton='Send'
                            value={appState.searchVal}
                            size="large"
                            onChange={(e) => setAppState((prev) => ({...prev, searchVal: e.target.value}))}
                            onSearch={value => onButtonClicked(value)}
                        />
                    </div>
                </div>
            : 
                <div style={{padding: "200px 40px"}}>
                    <Search 
                        placeholder='Enter Username'
                        enterButton='Login'
                        size='large'
                        onSearch={value => {
                            setAppState((prev) => ({...prev, userName: value }));
                            setIsLoggedIn(true);
                        }}
                    />
                </div>
            }
        </div>
    )
}

ReactDOM.render(<App />, document.getElementById("root"));