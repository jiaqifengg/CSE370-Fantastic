/*
  App.js is the starting point for the application.   All of the components in your app should have this file as the root.
  This is the level that will handle the routing of requests, and also the one that will manage communication between
  sibling components at a lower level.  It holds the basic structural components of navigation, content, and a modal dialog.
*/

import React from "react";
import "./App.css";
import PostForm from "./Component/PostForm.jsx";
import FriendList from "./Component/FriendList.jsx";
import GroupList from "./Component/GroupList.jsx";
import LoginForm from "./Component/LoginForm.jsx";
import Profile from "./Component/Profile.jsx";
import FriendForm from "./Component/FriendForm.jsx";
import MakePost from "./Component/MakePost.jsx";
import { NavBarNormal, NavBarInput, NavBarAB } from "./Component/NavBar.jsx";
import Message from "./Component/Message";
import Account from "./Component/Account.jsx";
import SinglePost from "./Component/SinglePost.jsx";
import RegisterForm from "./Component/RegisterForm";
import SearchPage from "./Component/SearchPage";
import arrowRight from "./assets/arrowRight.png"
import hamburgerMenu from "./assets/menu.png"
import Bookmarks from "./Component/Bookmarks.jsx";
import whiteCrave from "./assets/white-crave.png";
import foodBackground from "./assets/foods3.png";
import {
  BrowserRouter as Router, Route, Routes
} from 'react-router-dom';

// import profilePic_0 from '../src/assets/profilePic_0.png'
import setting from '../src/assets/setting.png'
import logout from '../src/assets/logout.png'
import { textChangeRangeIsUnchanged } from "typescript";
import { render } from "react-dom";

// toggleModal will both show and hide the modal dialog, depending on current state.  Note that the
// contents of the modal dialog are set separately before calling toggle - this is just responsible
// for showing and hiding the component
function toggleModal(app) {
  app.setState({
    openModal: !app.state.openModal
  });
}

const FANTASTIC_URL = window.location.hostname === "localhost" ? "" : "/hci/teams/fantastic";
let windowWidth = window.innerWidth

// the App class defines the main rendering method and state information for the app
class App extends React.Component {

  // the only state held at the app level is whether or not the modal dialog
  // is currently displayed - it is hidden by default when the app is started.
  constructor(props) {
    super(props);
    this.state = {
      openModal: false,
      refreshPosts: false,
      logout: false,
      login: false,
      blur: "blurAllOff",
      menuOverlay: false,
      inputOverlay: false,
      inputShorten: false,
      userData: {},
      navABDisplay: false,
    };

    // in the event we need a handle back to the parent from a child component,
    // we can create a reference to this and pass it down.
    this.mainContent = React.createRef();

    // since we are passing the doRefreshPosts method to a child component, we need to 
    // bind it 
    this.doRefreshPosts = this.doRefreshPosts.bind(this);
    this.login = this.login.bind(this);
    this.logout = this.logout.bind(this);
    this.timer = React.createRef();
    this.counter = React.createRef();
  }

  logout = () =>{
    sessionStorage.removeItem("token");
    sessionStorage.removeItem("user");
    sessionStorage.removeItem("username");
    sessionStorage.removeItem("profilepicture")
    sessionStorage.removeItem("email")
    this.setState({
      logout: true,
      login: false,
      userData: {}
    });
    
  }
  
  login = () => {
    
    this.setState({
      login: true,
      logout: false,
      refreshPosts:true
    });  
  }
  

  // doRefreshPosts is called after the user logs in, to display relevant posts.
  // there are probably more elegant ways to solve this problem, but this is... a way
  doRefreshPosts = () => {
    this.setState({
      refreshPosts:true
    });
  }

  fetchUserData() {
    if (sessionStorage.getItem("token")) {
      fetch(process.env.REACT_APP_API_PATH + `/users/${sessionStorage.getItem("user")}`, {
        method: "get",
        headers: {
          'Content-Type': 'application/json',
          'Authorization': "Bearer " + sessionStorage.getItem("token"),
        },
      })
        .then(res => res.json())
        .then(
          result => {
            if (result) {
              this.setState({userData: {email: result.email, user: result.id, username: result.email}})
              sessionStorage.setItem("email", result.email);
              sessionStorage.setItem("user", result.id);
              sessionStorage.setItem("username", result.email);
            }
            else {
              sessionStorage.removeItem("token");
              sessionStorage.removeItem("user");
              sessionStorage.removeItem("username");
              sessionStorage.removeItem("profilepicture");
              sessionStorage.removeItem("email")
            }
          })
    }
    else {
        sessionStorage.removeItem("token");
        sessionStorage.removeItem("user");
        sessionStorage.removeItem("username");
        sessionStorage.removeItem("profilepicture");
        sessionStorage.removeItem("email") 
    }
  }
  
  // This doesn't really do anything, but I included it as a placeholder, as you are likely to
  // want to do something when the app loads.  You can define listeners here, set state, load data, etc.
  componentDidMount(){
    this.setState({profilePicture: false})
    this.fetchUserData()
    document.title = "Crave - Login";
    //this.userValid()
  }

  changeAllBlur = (a) => {
    if (this.state.blur === "blurAllOff" && a === "nav") {
      this.setState ({blur: "blurAllOn"})
      this.setState ({menuOverlay: true})
    }
    else if (this.state.blur === "blurAllOn" && a === "div" && this.state.menuOverlay) {
      this.setState ({blur: "blurAllOff"})
      this.setState ({menuOverlay: false})
    }
    if (this.state.navABDisplay) {
      this.setState({navABDisplay: false})
    }
  }

  changeInputBox = (e, a) => {
    if (a === "extend" && !this.state.inputOverlay) {
      e.preventDefault()
      this.setState({inputOverlay: true})
    }
    else if (a === "shorten" && this.state.inputOverlay && this.counter.current != -1) {
      this.setState({inputShorten: !this.state.inputShorten})
      this.counter.current = -1;
      this.timer.current = setInterval(() => {
          this.setState({inputOverlay: false})
          clearInterval(this.timer.current)
          this.counter.current = 0;
      }, 250)
    }
    else {
      this.setState({inputOverlay: false})
    }
  }

  menu = () => {
    return (
      <div id = "menu">
        <div id = "menuTop" style = {{padding: "1rem", display: "flex"}} href = {FANTASTIC_URL + "/profile/" + sessionStorage.getItem("user")} element={<UserProfile login={this.login} />}>
          <a href = {FANTASTIC_URL + "/profile/" + sessionStorage.getItem("user")} element={<UserProfile login={this.login} />}><img style = {{borderRadius: "1.5rem", cursor: "pointer", height: "3.25rem", marginTop: "auto", marginBottom: "auto", marginRight: "1rem"}} src = {(sessionStorage.getItem("profilepicture")) ? (sessionStorage.getItem("profilepicture")) : "https://webdev.cse.buffalo.edu//hci/api/uploads/files/aPVq0p2Ums6FEpiYCeY9F-U1w35K0RhHfxVHifBgXHc.png"}/></a>

          <div style = {{marginTop: "0rem", height: "3rem"}}>
            {sessionStorage.getItem("token") && sessionStorage.getItem("username") && <a id = "hamburgerName" style = {{cursor: "pointer", fontSize: "1.35rem", textDecoration: "none"}} href = { FANTASTIC_URL + "/profile/" + sessionStorage.getItem("user")} element={<UserProfile login={this.login} />}>{sessionStorage.getItem("username")}</a>}
            {!sessionStorage.getItem("token")  && <a id = "hamburgerName" style = {{cursor: "pointer", fontSize: "1.35rem", textDecoration: "none"}} href = { FANTASTIC_URL + "/profile/" + sessionStorage.getItem("user")} element={<UserProfile login={this.login} />}>Please log in</a>}
            <div style = {{height: "0.25rem"}}></div>
            {sessionStorage.getItem("token")  && sessionStorage.getItem("username") &&  <a id = "hamburgerName" style = {{cursor: "pointer", fontSize: "0.9rem", textDecoration: "none"}} href = { FANTASTIC_URL + "/profile/" + sessionStorage.getItem("user")} element={<UserProfile login={this.login} />}>@{sessionStorage.getItem("email")}</a>}
          </div>

        </div>
        <div id = "menuBottom">
          <a href = {FANTASTIC_URL + "/settings"} id = "hamburgerLink">
          <div id = "menuOptions">
            <img src = {setting}/>
            <h1>Setting & Privacy</h1>
          </div>
          </a>
          <a href = {FANTASTIC_URL + "/"} id = "hamburgerLink" onClick = {() => this.logout()}>
          <div id = "menuOptions">
            <img src = {logout}/>
            <h1>Logout</h1>
          </div>
          </a>
        </div>
      </div>
    )
  }

  footer = () => {
    return (
        <div id = "footer">
          <h1> About Us </h1>
          <div id="footer-info">
            <a href={"https://webdev.cse.buffalo.edu/hci/teams/fantastic/AboutUs.html"} id="mission"> Our Mission </a>
            <a href={"https://webdev.cse.buffalo.edu/hci/teams/fantastic/AboutUs.html"} id="team"> Meet the Team </a>
            <a href={"https://webdev.cse.buffalo.edu/hci/teams/fantastic/styleguide.html"} id="styleguide"> Style Guide </a>
              {/*FANTASTIC_URL + 'styleguide.html'*/}
          </div>
        </div>
    )
  }

  /*   
  userValid() {
    if (sessionStorage.getItem("token")) {
      this.setState({userData: {id: sessionStorage.getItem("user"), name: sessionStorage.getItem("username"), email: sessionStorage.getItem("email")}})
    }
  }
   */
  // As with all react files, render is in charge of determining what shows up on the screen,
  // and it gets called whenever an element in the state changes.  There are three main areas of the app, 
  // the navbar, the main content area, and a modal dialog that you can use for ... you know, modal
  // stuff.  It's declared at this level so that it can overlay the entire screen.
  render() {
    return (

      // the app is wrapped in a router component, that will render the
      // appropriate content based on the URL path.  Since this is a
      // single page app, it allows some degree of direct linking via the URL
      // rather than by parameters.  Note that the "empty" route "/", which has
      // the same effect as /posts, needs to go last, because it uses regular
      // expressions, and would otherwise capture all the routes.  Ask me how I
      // know this.
        <div onClick = {(e) => (this.changeAllBlur("div"), this.changeInputBox(e, "shorten"))} style = {{}}>
          {this.state.menuOverlay && this.menu()}
          <div id = {this.state.blur}>
          <Router basename={process.env.PUBLIC_URL}>
          {sessionStorage.getItem("user") && //Show navbar if user is logged in
          <>
                  <div id = "navBarBigScreen">
                    {!this.state.inputOverlay && !this.state.navABDisplay && <NavBarNormal id = "NavBar" changeAllBlur = {(a) => this.changeAllBlur(a)} inputOverlay = {this.state.inputOverlay} changeInputBox = {(e, a) => this.changeInputBox(e, a)}/>}
                    {this.state.inputOverlay && !this.state.navABDisplay && <NavBarInput id = "NavBar" inputShortenParent = {this.state.inputShorten} changeAllBlur = {() => this.changeAllBlur("nav")} inputOverlay = {this.state.inputOverlay} changeInputBox = {(e, a) => this.changeInputBox(e, a)}/>}
                    {!this.state.navABDisplay && <div id = "navTopBumper"></div>}
                  </div>

                  <div id = "navBarSmallScreen">
                    {this.state.navABDisplay && <NavBarAB id = "NavBar" userData = {this.state.userData} />}
                    <div id = "navTopBumper"></div>
                    {!this.state.navABDisplay && <div id = "navABTopBumper" onClick = {() => this.setState({navABDisplay: !this.state.navABDisplay})}> <div id = "navABimgDiv"><img src = {whiteCrave}/> </div></div>}
                    {!this.state.navABDisplay && <div id = "navABToggler" onClick = {() => this.setState({navABDisplay: !this.state.navABDisplay})}> <img src = {hamburgerMenu}/> </div>}
                  </div>
                  
          </>
          }

          <div className="App">
            <header className="App-header">

            {/* <Navbar toggleModal={e => toggleModal(this, e)} logout={this.logout}/> */}
              <div className="maincontent" id="mainContent">
                <Routes>
                  <Route path="/settings" element={<Settings login={this.login}/>} />
                  <Route path="/friends" element={<Friends login={this.login} />} />
                  <Route path="/groups" element={<Groups login={this.login} />} />
                  <Route path="/bookmarks" element={<Saved login={this.login} />} />
                  <Route path="/posts" element={<Posts doRefreshPosts={this.doRefreshPosts} login={this.login} apprefresh={this.state.refreshPosts} />} />
                  <Route path="/profile/:id" element={<UserProfile login={this.login} />} />
                  <Route path="/" element={<Posts userData = {this.state.userData} doRefreshPosts={this.doRefreshPosts} login={this.login} apprefresh={this.state.refreshPosts}/>} />
                  <Route path="/post/:id" element={<SinglePosting login={this.login}/>} />
                  <Route path="/message" element={<Message login={this.login}/>} />
                  <Route exact path="/search" element={<SearchPage login={this.login} userData = {this.state.userData}/>} />
                </Routes>
              </div>
            </header>
          </div>
          </Router>
            {this.footer()}
        </div>
        </div>
      )
    }
}

/*  BEGIN ROUTE ELEMENT DEFINITIONS */
// with the latest version of react router, you need to define the contents of the route as an element.  The following define functional components
// that will appear in the routes.  
const Saved = (props) => {
  // if the user is not logged in, show the login form.  Otherwise, show the settings page
  if (!sessionStorage.getItem("token")){
   return(
     <div>
     {/* <p>Crave</p> */}
     <LoginForm login={props.login}  />
     </div>
   );
 }
 return (
   <div className="settings" >
   <Bookmarks userid={sessionStorage.getItem("user")} />
 </div>
 );
}

const Settings = (props) => {
   // if the user is not logged in, show the login form.  Otherwise, show the settings page
   if (!sessionStorage.getItem("token")){
    return(
      <div id="loginPage" style={{ 
        backgroundImage: `url(${foodBackground})` 
      }}>
      {/* <p>Crave</p> */}
      <LoginForm login={props.login}  />
      </div>
    );
  }
  return (
    <div className="settings">
    <Profile userid={sessionStorage.getItem("user")} />
  </div>
  );
}

const Friends = (props) => {
   // if the user is not logged in, show the login form.  Otherwise, show the friends page
   if (!sessionStorage.getItem("token")){
    return(
      <div id="loginPage" style={{ 
        backgroundImage: `url(${foodBackground})` 
      }}>
      <p>Crave</p>
      <LoginForm login={props.login}  />
      </div>
    );
  }
   return (
    <div>
      <p>Friends</p>
        <FriendForm userid={sessionStorage.getItem("user")} />
        <FriendList userid={sessionStorage.getItem("user")} />
    </div>
   );
}

const Groups = (props) => {
  // if the user is not logged in, show the login form.  Otherwise, show the groups form
  if (!sessionStorage.getItem("token")){
   return(
     <div id="loginPage" style={{ 
      backgroundImage: `url(${foodBackground})` 
    }}>
     <p>Crave</p>
     <LoginForm login={props.login}  />
     </div>
   );
 }
  return (
   <div>
     <p>Join a Group!</p>
       <GroupList userid={sessionStorage.getItem("user")} />
   </div>
  );
}

const Posts = (props) => {
  
  // if the user is not logged in, show the login form.  Otherwise, show the post form
  if (!sessionStorage.getItem("token")){
    return(
      <div id="loginPage" style={{ 
        backgroundImage: `url(${foodBackground})` 
      }}>
      {/* <p>Crave</p> */}
    <LoginForm login={props.login}/>
      </div>
    );
  }
  else{
    return (
      <div>
      <br/>
      <PostForm userData = {props.userData} />
    </div>
    );
  }
}

const UserProfile = (props) => {
  // if the user is not logged in, show the login form.  Otherwise, show the requested profile page page
  if (!sessionStorage.getItem("token")){
   return(
     <div id="loginPage" style={{ 
      backgroundImage: `url(${foodBackground})` 
    }}>
     {/* <p>CSE 370 Social Media Test Harness</p> */}
     <LoginForm login={props.login}  />
     </div>
   );
  }
  else {
    const location = window.location.pathname; 
    const location_array = location.split("/");
    const requestedUserID = location_array[location_array.length - 1];
    return (
      <div>
        <Account userid={requestedUserID}/>
      </div>
    );
  }
}

const SinglePosting = (props) => {
  // if the user is not logged in, show the login form.  Otherwise, show the requested profile page page
  if (!sessionStorage.getItem("token")){
   return(
     <div id="loginPage" style={{ 
      backgroundImage: `url(${foodBackground})` 
    }}>
     {/* <p>CSE 370 Social Media Test Harness</p> */}
     <LoginForm login={props.login}  />
     </div>
   );
  }
  const location = window.location.pathname; 
  const location_array = location.split("/");
  const requestedPostID = location_array[location_array.length - 1];
  return (
    <SinglePost postid={requestedPostID}/>
  );
}
/* END ROUTE ELEMENT DEFINITIONS */

// export the app for use in index.js
export default App;
