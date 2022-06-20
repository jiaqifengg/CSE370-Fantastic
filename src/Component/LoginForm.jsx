import React from "react";
import RegisterForm from "./RegisterForm";
import "../styles/Login_ResetForms.css";
import ResetPwdForm from "./ResetPwd";
import craveLogo from "../assets/black-crave.png";
import PostForm from "./PostForm.jsx";

// the login form will display if there is no session token stored.  This will display
// the login form, and call the API to authenticate the user and store the token in
// the session.

export default class LoginForm extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      email: "",
      password: "",
      alanmessage: "",
      sessiontoken: "",
      showRegisterComponent: false,
      errors: {},
      showPwdRequest: false
    };
    this.refreshPostsFromLogin = this.refreshPostsFromLogin.bind(this);
    this.renderRegister = this.renderRegister.bind(this);
    this.renderPWDReset = this.renderPWDReset.bind(this);
  }

  componentDidMount(){
    document.title = "Crave - Login";
    //this.userValid()
}
  // once a user has successfully logged in, we want to refresh the post
  // listing that is displayed.  To do that, we'll call the callback passed in
  // from the parent.
  refreshPostsFromLogin(){
    this.props.login();
  }

  renderPWDReset(){
    this.setState({
      showPwdRequest: true
    });
    this.render();
  }
  
  renderRegister() {
    this.setState({
      showRegisterComponent: true
    });
    this.render();
  }

  // change handlers keep the state current with the values as you type them, so
  // the submit handler can read from the state to hit the API layer
  myChangeHandler = event => {
    this.setState({
      email: event.target.value
    });
  };

  passwordChangeHandler = event => {
    this.setState({
      password: event.target.value
    });
  };

  // when the user hits submit, process the login through the API
  submitHandler = event => {
    let errors = {};
    //keep the form from actually submitting
    event.preventDefault();

    //make the api call to the authentication page
    fetch(process.env.REACT_APP_API_PATH+"/auth/login", {
      method: "post",
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        email: this.state.email,
        password: this.state.password
      })
    })
      .then(res => res.text())
      .then(
        result => {
          try {
            result = JSON.parse(result)
          }
          catch {
            sessionStorage.removeItem("token");
            sessionStorage.removeItem("user");
            sessionStorage.removeItem("username");
            sessionStorage.removeItem("profilepicture");
            sessionStorage.removeItem("email");
            errors["login_failed"] = "Wrong login email and/or password!";
            this.setState({
              sessiontoken: "",
              alanmessage: result.message,
              errors: errors
            });
          }
          if (result.userID) {
            fetch(process.env.REACT_APP_API_PATH+"/file-uploads?uploaderID=" + result.userID, {
              method: "get",
              headers: {
                'Content-Type': 'application/json',
                'Authorization': "Bearer " + result.token,
              },
            })
              .then(res => res.json())
              .then(
                result => {
                  let res = result[0]
                  let pp = res.find(o => (o["attributes"] === "Profile Picture"))
                  sessionStorage.setItem("profilepicture", "https://webdev.cse.buffalo.edu" + pp.path);
                })

            fetch(process.env.REACT_APP_API_PATH+"/users/" + result.userID, {
              method: "get",
              headers: {
                'Content-Type': 'application/json',
                'Authorization': "Bearer " + result.token,
              },
            })
              .then(res => res.json())
              .then(
                result => {
                  let res = result
                  sessionStorage.setItem("email", res.email);
                  sessionStorage.setItem("username", res.attributes.username);
                })

            // set the auth token and user ID in the session state
            sessionStorage.setItem("token", result.token);
            sessionStorage.setItem("user", result.userID);

            // call refresh on the posting list
            this.refreshPostsFromLogin();

            this.setState({
              sessiontoken: result.token,
              alanmessage: result.token
            });
          
          } else {

            // if the login failed, remove any infomation from the session state
            sessionStorage.removeItem("token");
            sessionStorage.removeItem("user");
            sessionStorage.removeItem("username");
            sessionStorage.removeItem("profilepicture");
            sessionStorage.removeItem("email");
            errors["login_failed"] = "Wrong login email and/or password!";
            this.setState({
              sessiontoken: "",
              alanmessage: result.message,
              errors: errors
            });
            
          }
        }
      );
  };

  render() {
    // console.log("Rendering login, token is " + sessionStorage.getItem("token"));
    if (!sessionStorage.getItem("token")) {
      if (this.state.showPwdRequest) {
        return (
          <div>
            <ResetPwdForm/>
          </div>
        )
    }else if (this.state.showRegisterComponent) {
        return (
          <div>
            <RegisterForm/>
          </div>
        )
      }else {
        return (
        <div style={{display: 'flexbox', justifyContent: 'center'}}>
              <div id="phone-title">
                <h1 style={{textAlign: 'center', fontWeight: '900', fontSize: '60px'}}>Crave</h1>
              </div>
          <div className="flex-container">
          <div className="loginform">
            <label>LOGIN</label> <br/><br/>
              <form onSubmit={this.submitHandler}>
                <label>
                  Email
                  <br />
                  <input placeholder="Enter an Email" type="text" onChange={this.myChangeHandler} />
                </label> <br/><br />
                <label>
                  Password
                  </label>
                  <br />
                  <input placeholder="Enter a password" type="password" onChange={this.passwordChangeHandler} />
                  <ul style={{ listStyleType: "none", paddingLeft: '0px', margin:'0px'}}>
                    <li>{this.state.errors.login_failed}</li>
                    </ul>
                <br /><br/>
                <input id="loginButton" type="submit" value="Login" />
                <br />
                <br />
                <input onClick={this.renderPWDReset} id="reqButton" type="button" value="Forgot password?" />
                <br />
                <br />
                <label>
                  Don't have an account? Register below!
                </label>
                <br/> <br/>
                <input onClick={this.renderRegister} id="registerButton" type="button" value="Register" />
                <p>{this.state.alanmessage}</p>
              </form>
          </div>
            <div className="crave_logo">
              <div>
              <img className="logo" src={craveLogo} alt="Crave Logo"/>
              <h3>Crave it? Make it!</h3>
              </div>
              
            </div>
          </div>
            </div>
        );
      }
    } else {
      if (this.state.email) {
        return (
            <div>
              <PostForm/>
            </div>)
        // <p>Welcome, {this.state.email}</p>;
      } else {
        return <p>{this.state.alanmessage}</p>;
      }
    }
  }
}