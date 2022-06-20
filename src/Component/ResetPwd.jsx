import React from "react";
import LoginForm from "./LoginForm";
import "../styles/Login_ResetForms.css";

export default class ResetPwdForm extends React.Component{
    constructor(props) {
        super(props);
        this.state = {
            email: "",
            token: "",
            pwd: "",
            errors: {},
            msgs: {},
            requested: false,
            reseted: false
        }
        this.passwordChangeForm = this.passwordChangeForm.bind(this);
        this.showPwdConfirmation = this.showPwdConfirmation.bind(this);
        this.checkPassword = this.checkPassword.bind(this);
    }

  showPwdConfirmation(){
     this.setState({
      reseted: true
    });
    this.render();
  }
  passwordChangeForm(){
    this.setState({
      requested: true
    });
    this.render();
  }
  // change handlers keep the state current with the values as you type them, so
  // the submit handler can read from the state to hit the API layer
  emailChangeHandler = event => {
    this.setState({
      email: event.target.value
    });
  };
  pwdChangeHandler = event => {
    this.setState({
      pwd: event.target.value
    });
  };
  tokenChangeHandler = event => {
    this.setState({
      token: event.target.value
    });
  };
  checkPassword = (password) => {
    let errors = {};
    // edit restrictions for password
    const upper = (str) => (isNaN(str) && str === str.toUpperCase());
    const lower = (str) => (isNaN(str) && str === str.toLowerCase());
    const number = (str) => !isNaN(str);

    var msg = "";

    if (password.length < 8 || password.length > 32) {
        msg += "Password must be length 8-32\n";
        errors["password_length"] = "• Password must be length 8-32\n";
    }
    if (!password.split("").some(upper)) {
        msg += "Password must include an uppercase\n";
        console.log(password.split("").some(upper) + " password does not contain upper" + password.split(""));
        errors["password_upper"] = "• Password must include an uppercase\n";
    }
    if (!password.split("").some(lower)) {
        msg += "Password must include a lowercase\n";
        errors["password_lower"] = "• Password must include a lowercase\n";
    }
    if (!password.split("").some(number)) {
        msg += "Password must include a number\n";
        errors["password_number"] = "• Password must include a number\n";
    }
    
    this.setState({
        errors: errors
    });
    if (msg === "") {
        return true;
    } else {
        return false;
    }
  }
  // when the user hits submit, process the request reset form through the API
  submitHandler = event => {
    //keep the form from actually submitting
    console.log("submitHandler was called")
    event.preventDefault();

    //make the request-reset api call to the authentication page
    //Sends an email to a user w/ a pwd reset token if such a user exists
    fetch(process.env.REACT_APP_API_PATH+"/auth/request-reset", {
      method: "post",
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        email: this.state.email
      }),
    })
    this.passwordChangeForm();
  };

  // when the user hits submit, process the pwd reset through the API
  pwdsubmitHandler = event => {
    //keep the form from actually submitting
    console.log("pwdsubmitHandler was called")
    event.preventDefault();

    //make the request-reset api call to the authentication page
    //Reset a user's password using a password reset token
    fetch(process.env.REACT_APP_API_PATH+"/auth/reset-password", {
      method: "post",
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        token: this.state.token,
        password: this.state.pwd
      })
    })
    if (this.checkPassword(this.state.pwd)){
      this.showPwdConfirmation();
    }
  };

  render(){
    if(this.state.reseted === true) {
      console.log("pwd change successful");
      return (
        <div>
          <LoginForm/>
        </div>
      )
    }
    else if (this.state.requested === true){
      console.log("User is now changing pwd");
      return (
        <div className="pwdChangeForm">
          <form onSubmit={this.pwdsubmitHandler}>
            <h1>Password Change Form</h1>
            <label>
              Reset Token
              <br />
             <input placeholder="Enter your reset token" type="text" onChange={this.tokenChangeHandler}/>
            </label> <br /><br/>
            <label>
              New Password
              <p>Must have: 8-32 length, an uppercase, a lowercase, a number</p>
              <br />
              <div id="pwdfield">
              <input placeholder="Enter a new password" type="text" onChange={this.pwdChangeHandler} />
              </div>
               </label> 
               <ul style={{ listStyleType: "none", paddingLeft: '0px', margin:'0px'}}>
                <li style={{color: 'red', fontSize: '12px', textAlign: 'center', width: '100%', float:'left'}}>{this.state.errors.password_length}</li>
                <li style={{color: 'red', fontSize: '12px', textAlign: 'center', width: '100%', float:'left'}}>{this.state.errors.password_upper}</li>
                <li style={{color: 'red', fontSize: '12px', textAlign: 'center', width: '100%', float:'left'}}>{this.state.errors.password_lower}</li>
                <li style={{color: 'red', fontSize: '12px', textAlign: 'center', width: '100%', float:'left'}}>{this.state.errors.password_number}</li>
                </ul>
               <br/><br/>
            <input id="resetPwdButton" type="submit" value="Reset Password" />
            </form>
        </div>
      )
    } else{
      return (
        <div className="requestForm">
            <form onSubmit={this.submitHandler}>
              <h1>Request Password Reset</h1>
              <label>Email </label> <br />
                <input placeholder="Enter a valid email" type="text" onChange={this.emailChangeHandler} />
              <br/><br />
              <input id="reqResetButton" type="submit" value="Submit Request" />
              <p>Check your email after submission for reset token!</p> 
              </form>
        </div>
        );
      }
  }
}