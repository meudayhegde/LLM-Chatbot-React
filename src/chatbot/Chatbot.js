import { MdMessage, MdCancel, MdSend, MdPerson, MdDesktopMac, MdDelete, MdFileCopy, MdFullscreen, MdFullscreenExit } from "react-icons/md";
import "./Chatbot.css"
import { useState, useRef, useEffect, forwardRef, useImperativeHandle } from "react";
import Markdown from 'markdown-to-jsx'

function Conversation(props){
    const divRef = useRef(null);

    // Function to scroll to the bottom
    const scrollToBottom = () => {
        if (divRef.current && ((divRef.current.scrollHeight - divRef.current.scrollTop) < 500)) {
            divRef.current.scrollTop = divRef.current.scrollHeight;
        }
    };

    // Scroll to the bottom when the component renders or when updates occur
    useEffect(() => {
        scrollToBottom();
    }, [props.data]);

    return <div className="Conversation" ref={divRef}>
        {
            (props.data? props.data: []).map(
                dataItem => {
                    return <div className={`conversation-item-layout ${dataItem.role}`} key={dataItem.key}>
                        {dataItem.role !== 'user'? <div className="chat-icon assistant"><MdDesktopMac/></div>:<></>}
                        <div className={`chat-content ${dataItem.role}`}><Markdown>{dataItem.content}</Markdown></div>
                        {dataItem.role === 'user'? <div className="chat-icon user"><MdPerson/></div>:<></>}
                    </div>
                }
            )
        }
        
    </div>
}

const ConversationLayout = forwardRef((props, ref)=>{

    let default_chat = JSON.stringify([{role: 'assistant', content: 'Hello, How may I help you today?', key: Date.now().toString(36)}]);
    
    const [chat, setChat] = useState(JSON.parse(localStorage.getItem('conversation') || default_chat));
    const [formData, setFormData] = useState({input: ''});
    const [queryState, setQueryState] = useState(false);

    const clearChat = () =>{
        if(window.confirm("Continue to clear this conversation?")){
            localStorage.removeItem('conversation');
            setChat(JSON.parse(default_chat))
        }
    }

    useImperativeHandle(ref, () => ({
        clearChat,
    }));

    const handleChange = (e) => {
        const { input, value } = e.target;
        setFormData({ ...formData, input: value });
    };

    let handleSubmit = async (e)=>{
        e.preventDefault();
        if(!formData.input){
            return
        }

        let messages = [...chat, {role: 'user', content: formData.input, key: Date.now().toString(36)}]
        let counter = 0
        let loading = setInterval(()=>{
            counter = (counter + 1) % 3
            setChat([...messages, {
                role: 'assistant',
                content: "**" + Array(counter + 1).fill('.').join(' ') + "**",
                key: Date.now().toString(36)
            }]);
        }, 200);
        
        setQueryState(true);
        setFormData({ ...formData, input: '' });

        try {
            const response = await fetch(`${process.env.REACT_APP_API_ENDPOINT}/api/chat`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({conversation: messages}),
            });
      
            const result = await response.json();
            
            let newMessages = [...messages, {...result, key: Date.now().toString(36)}]
            setChat(newMessages);

            console.log('Success:', result);
            setQueryState(false);

            localStorage.setItem('conversation', JSON.stringify(newMessages));
            clearInterval(loading);
          } catch (error) {
            console.error('Error:', error);
            setQueryState(false);
            clearInterval(loading);

          }
    }

    return <div className="ConversationLayout">
        
        <Conversation data={chat}/>

        <form style={{display:'flex', width: '100%'}} onSubmit={handleSubmit}>
            <input className="chat-input" id="input" name="input" placeholder="Enter your query" value={formData.input} onChange={handleChange} required disabled={queryState}/>
            <button className="submit-button" type='submit'><MdSend/></button>
        </form>

    </div>
});

function ChatWindow(props){
    const childRef = useRef(null);

    const clearConversation = () => {
        if (childRef.current) {
            childRef.current.clearChat();
        }
    };
      
    return <div className="ChatWindow">
        <div className="Header">
            <h3>CV Assistant</h3>
            <div style={{display: "flex"}}>
                {
                    props.modal?
                        <span className='close-button' style={{marginRight: '10px'}} onClick={ () => props.modal.current.openModal() } title="Index Documents">
                            <MdFileCopy style={{fontSize: '1.325rem'}}/>
                        </span> : <></>
                }
                
                <span className='close-button' style={{marginRight: '10px'}} onClick={ clearConversation } title="Clear Conversation">
                    <MdDelete style={{fontSize: '1.325rem'}}/>
                </span>

                <span className='close-button' style={{marginRight: '10px'}} onClick={ props.onScreenResize }>
                    { props.fullScreen?
                        <MdFullscreenExit style={{fontSize: '1.325rem'}} title="Exit Fullscreen"/> :
                        <MdFullscreen style={{fontSize: '1.325rem'}} title="Enter Fullscreen"/>
                    }
                </span>

                <span className='close-button' onClick={ props.onCloseClick } title="Minimize">
                    <MdCancel style={{fontSize: '1.325rem'}}/>
                </span>

            </div>
        </div>
        
        <ConversationLayout ref={ childRef }/>
    </div>
}

function Chatbot(props){
    const [fullScreen, setFullScreen] = useState(false);
    const [active, setActive] = useState(false);

    return <div className={ ["Chatbot", active? "active": "", (active && fullScreen)? "full-screen": ""].join(" ") } style={props.style}>
        <div className="Fab" onClick={() => setActive(true)}>
            <MdMessage style={{fontSize:'28px', color: 'white'}}/>
        </div>

        <ChatWindow modal={props.modal} onCloseClick={ () => setActive(false) } onScreenResize={()=> setFullScreen(!fullScreen)} fullScreen={ fullScreen }/>
    </div>
}

export default Chatbot