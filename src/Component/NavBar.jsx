import { React, useState, useEffect, useRef } from "react";
import "./NavBar.css";
import home from "../assets/home.png"
import homeHover from "../assets/homeHover.png"
import message from "../assets/message.png"
import messageHover from "../assets/messageHover.png"
import bookmark from "../assets/bookmark.png"
import bookmarkHover from "../assets/bookmarkHover.png"
import cravelogo from "../assets/cravelogo.png"
import cravelogoWhite from "../assets/white-crave.png"
import cravelogoHover from "../assets/cravelogoHover.png"
import hamburgerMenu from "../assets/menu.png"
import hamburgerMenuHover from "../assets/menuHover.png"
import profilePic_1 from "../assets/profilePic_1.png"
import profilePic_1Hover from "../assets/profilePic_1Hover.png"
import search from "../assets/search.png"
import searchHover from "../assets/searchHover.png"

const FANTASTIC_URL = window.location.hostname === "localhost" ? "" : "/hci/teams/fantastic";

function NavBarInput(props) {
    let [inputText, setInputText] = useState("")
    let [inputShorten, setInputShorten] = useState(true)
    let [prod, setProd] = useState(false)
    let isMounted = useRef(false);
    let timer = useRef()
    let counter = useRef()

    useEffect(() => {
        counter.current = 0
        const location = window.location.pathname;
        if (location.includes('/hci/teams/fantastic')) {
          setProd(true)
        }
        else {
          setProd(false)
        }
    }, [])

    useEffect (() => {
        if (isMounted.current && document.getElementById("inputLongBarExtend")) {
            document.getElementById("inputLongBarExtend").id = "inputLongBarShorten"
        }
        isMounted.current = true
    }, [inputShorten, props.inputShortenParent])

    const shortenTimer = e => {
        if (!props.inputShortenParent && counter.current == 0) {
            counter.current = -1
            setInputShorten(!inputShorten)
            timer.current = setInterval(function() {
                props.changeInputBox(e, false)
                counter.current = 0
                clearInterval(timer.current)
            }, 250)
        }
    }

    return (
        <div id = "navBarOverlay" onClick = {(e) => (e.stopPropagation(), shortenTimer(e))}>
            <input autoFocus onClick={((e) => e.stopPropagation())} style = {{zIndex: 999}} id = "inputLongBarExtend" placeholder="Search here" 
                onChange={e => setInputText(e.target.value)}
                onKeyDown={event => {
                if (event.key === 'Enter' && inputText) {
                    window.location.href = FANTASTIC_URL + "/search?keyword=" + inputText
                }
            }}></input>
        </div>
    );
  }

function NavBarNormal(props) {

    const pathname = window.location.pathname

    useEffect (() => {
        if (document.getElementById(pathname + "Icon")) {
            document.getElementById(pathname + "Icon").style.borderBottom = "5px solid white"
            document.getElementById(pathname + "Icon").style.filter = "invert(40%) sepia(34%) saturate(212%) hue-rotate(126deg) brightness(100%) contrast(86%)"
        }
/*         if (document.getElementById(pathname + "/profileIcon")) {
            document.getElementById(pathname + "/profileIcon").style.borderBottom = "3px solid white"
            document.getElementById(pathname + "Icon").style.filter = "invert(40%) sepia(34%) saturate(212%) hue-rotate(126deg) brightness(100%) contrast(86%)"
        } */
        if (document.getElementById(pathname + "/profileIcon")) {
            document.getElementById(pathname + "/profileIcon").style.borderBottom = "4px solid var(--lightblue)"
            document.getElementById(pathname + "/profileIcon").style.borderRadius = "5px"
        }
    }, [])

    return (
        <div id = "navBarOverlay" onClick = {(e) =>(e.stopPropagation(), props.changeAllBlur("div"))}>
        <div id = "leftNav" >
            <a href = {FANTASTIC_URL + '/'} id = {FANTASTIC_URL + "/Icon"}><img src = {home}/></a>
            <a href = {FANTASTIC_URL + '/bookmarks'} id = {FANTASTIC_URL + "/bookmarksIcon"}><img src = {bookmark}/></a>
            <a id = {FANTASTIC_URL + "/searchIcon"}onClick = {(e) =>(e.stopPropagation(), props.changeAllBlur("div"), props.changeInputBox(e, "extend"))}><img src = {search}/></a>
        </div>
        <div id = "middleNav">
            <a href = {FANTASTIC_URL + "/"} onMouseOver = {e => e.currentTarget.firstChild.src = cravelogoHover} onMouseLeave = {e => e.currentTarget.firstChild.src = cravelogo}><img src = {cravelogo}/></a>
        </div>
        <div id = "rightNav">
            {sessionStorage.getItem("token") && sessionStorage.getItem("user") && <a href = {FANTASTIC_URL + '/message'} id = {FANTASTIC_URL + "/messageIcon"} ><img src = {message}/></a>}
            {!sessionStorage.getItem("token") && !sessionStorage.getItem("user") &&  <a id = "loggedOutBTN" ><img id = "loggedOutBTN" src = {message} /></a>}
            {sessionStorage.getItem("token") && sessionStorage.getItem("user") && <a href = {FANTASTIC_URL + "/profile/" + sessionStorage.getItem("user")} id = {FANTASTIC_URL + "/profile/" + String(sessionStorage.getItem("user")) + "/profileIcon"} className = "dontFilterA" ><img id = "dontFilter" src = {(sessionStorage.getItem("profilepicture") ? sessionStorage.getItem("profilepicture") : "https://webdev.cse.buffalo.edu/hci/api/uploads/files/VntOdSotvVlHchly99GsCvYcvc1i-qyHJeYVc1kYvO8.png")} /></a>}
            {!sessionStorage.getItem("token") && !sessionStorage.getItem("user") &&  <a id = "loggedOutBTN" ><img id = "loggedOutBTN" src = {profilePic_1} /></a>}
            {sessionStorage.getItem("token") && sessionStorage.getItem("user") && <a onClick = { () => props.changeAllBlur("nav")} ><img src = {hamburgerMenu}/></a>}
            {!sessionStorage.getItem("token") && !sessionStorage.getItem("user") &&  <a id = "loggedOutBTN" ><img id = "loggedOutBTN" src = {hamburgerMenu}/></a>}
        </div>      
        </div>
    )
    
}

function NavBarAB (props) {
    let [inputText, setInputText] = useState("")
    let [userData, setUserData] = useState({})

    let logout = () => {
        sessionStorage.removeItem("token");
        sessionStorage.removeItem("user");
        sessionStorage.removeItem("username");
        sessionStorage.removeItem("profilepicture")
        sessionStorage.removeItem("email")
        this.setState({
          logout: true,
          login: false
        })
    }

    useEffect (() => {
        setUserData(props.userData)
    }, [])

    return (
        <div id = "navABOverlay" onClick = {(e) => e.stopPropagation()}>
            <div id = "navABWrapper">
                <img src = {cravelogoWhite}/>
                <br/>
                <div id = "navABRouteWrapper">
                    <ul>
                        <li>
                            <a href = {FANTASTIC_URL + '/'}>Home</a>
                        </li>
                        <br/>
                        <li>
                            <a href = {FANTASTIC_URL + '/bookmarks'}>Bookmarks</a>
                        </li>
                        <br/>
                        <li>
                            <input placeholder="Search!" onChange={e => setInputText(e.target.value)}
                                onKeyDown={event => {
                                if (event.key === 'Enter' && inputText) {
                                    window.location.href = FANTASTIC_URL + "/search?keyword=" + inputText
                                }
                            }}></input>
                        </li>
                        <br/>
                        <li>
                            <a href = {FANTASTIC_URL + '/message'}>Messages</a>
                        </li>
                        <br/>
                        <li>
                            <a href = {FANTASTIC_URL + "/profile/" + sessionStorage.getItem("user")}>Profile</a>
                        </li>
                        <br/>
                        <li>
                            <a href = {FANTASTIC_URL + "/settings"} >Settings</a>
                        </li>
                        <br/>
                        <li>
                            <a href = {FANTASTIC_URL + "/"} onClick = {() => logout()}>Logout</a>
                        </li>
                        <li id = "navABName">
                            <h1 >Sign in as:</h1>
                            <br/>
                            <a href = {FANTASTIC_URL + "/profile/" + sessionStorage.getItem("user")} style = {{marginTop: "4px", overflow: "hidden", whiteSpace: "nowrap", textOverflow: "ellipsis"}}><h2>{(userData && userData.email) ? userData.email : sessionStorage.getItem("email")}</h2></a>
                            <img src = {(sessionStorage.getItem("profilepicture") ? sessionStorage.getItem("profilepicture") : profilePic_1)}/>
                        </li>
                    </ul>
                            
                </div>
            </div>
        </div>
    )
}

export {NavBarInput, NavBarNormal, NavBarAB};