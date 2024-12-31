import './App.css';
import Chatbot from './chatbot/Chatbot.js'
import { MdLightMode, MdDarkMode } from "react-icons/md";
import DocIndex from './chatbot/DocIndex.js'
import { useEffect, useRef, useState } from 'react'

function Header(){
    const [theme, setTheme] = useState(window.matchMedia("(prefers-color-scheme: dark)").matches? "dark": "light");
    const toggleColorScheme = () => {
        const newTheme = theme === "light" ? "dark" : "light";
        setTheme(newTheme);

        // Update the `color-scheme` property on `:root`
        document.documentElement.style.colorScheme = newTheme;
    };

    return <div className='AppHeader'>
        <div style={{display: 'flex', alignItems: 'center'}}>
            <span className={'Logo ' + (theme === "light"? "Dark": "Light")}></span>
            <h3 style={{marginLeft: '20px'}}>NetConnect Global</h3>
        </div>
        <div style={{display: 'flex', alignItems: 'center'}}>

            {
                theme === "dark" ?
                <MdLightMode className='theme-button' onClick={ toggleColorScheme }/>
                : <MdDarkMode className='theme-button' onClick={ toggleColorScheme }/>
            }
            
        </div>
    </div>
}

function App() {
    useEffect(()=>{
        document.title = process.env.REACT_APP_TITLE;
        const favicon = document.querySelector("link[rel='icon']");
        if (favicon) {
            favicon.href = process.env.REACT_APP_FAVICON;
        }
    }, []);
    const modalRef = useRef(null);
      return (
            <div className="App">
                <style>{`
                    /* Light mode */

                    .Logo.Light {
                        background-image: url(${process.env.REACT_APP_LOGO_LIGHT});
                    }
                    
                    /* Dark mode */
                    .Logo.Dark {
                        background-image: url(${process.env.REACT_APP_LOGO_DARK});
                    }`}
                </style>
                
                <Header/>
                <DocIndex ref={modalRef}/>
                <Chatbot modal={modalRef}/>
            </div>
    );
}

export default App;
