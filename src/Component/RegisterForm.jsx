import React from "react";
import { Navigate } from 'react-router';

import "../styles/Register.css";

import LoginForm from "./LoginForm";
import craveLogo from "../assets/black-crave.png";

export default class RegisterForm extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            fields: {
                username: "",
                email: "",
                password: ""
            },
            errors: {},
            successmsg: "",
            formValid: true,
            showLoginComponent: false,
            firstLoad: true,
        };
        this.renderLogin = this.renderLogin.bind(this);
    }

    componentDidMount(){
        document.title = "Crave - Register";
        //this.userValid()
    }
    // handler will update state values when user changes input content
    handleChange(field, e) {
        let fields = this.state.fields;
        fields[field] = e.target.value;
        this.setState({fields});
    }

    // render login component
    renderLogin() {
        this.setState({
          showLoginComponent: true
        });
        this.render();
    }

    handleValidation() {
        let fields = this.state.fields;
        let errors = {};
        let formValid = true;
        
        // check if email field is empty
        if (this.state.fields.email === "") {
            errors["email"] = "*Please enter an email*";
            formValid = false;
        }

        // check password if valid
        const upper = (str) => (isNaN(str) && str === str.toUpperCase());
        const lower = (str) => (isNaN(str) && str === str.toLowerCase());
        const number = (str) => !isNaN(str);
        
        let password = this.state.fields.password;
        if (password.length < 8 || password.length > 32) {
            errors["password_length"] = "*Password must be length 8-32*\n";
            formValid = false;
        }
        if (!password.split("").some(upper)) {
            errors["password_upper"] = "*Password must include an uppercase*\n";
            formValid = false;
        }
        if (!password.split("").some(lower)) {
            errors["password_lower"] = "*Password must include a lowercase*\n";
            formValid = false;
        }
        if (!password.split("").some(number)) {
            errors["password_number"] = "*Password must include a number*\n";
            formValid = false;
        }

        // check if username is valid and unique
        let usrname = this.state.fields.username.toLowerCase();
        fields["username"] = usrname;
        let validUsername = /^[0-9a-z]+$/.test(usrname);

        if (!validUsername || this.state.fields.username.length < 3) {
            errors["username"] = "*Username should contain (3+ characters [0-9a-z])*";
            formValid = false;
            this.setState({errors, formValid}, () => {console.log(this.state.errors); this.registerUser()});
        } else {
            // fetch users to check if username is unique
            fetch(process.env.REACT_APP_API_PATH+"/users", {
                method: "get"
            })
            .then( res => res.json())
            .then( result => {
                let users = result[0]
                for (let i = 0; i < users.length; i++) {
                    if (users[i].attributes != null && "username" in users[i].attributes) {
                        if (users[i].attributes.username === usrname) {
                            errors["username"] = "Username already in use";
                            formValid = false;
                        }
                    }
                }
            })
            .then( () => {
                this.setState({errors, formValid, firstLoad: false}, () => {this.registerUser()});
            })
        }
    }

    registerUser() {
        if (!this.state.formValid) {
            return;
        }
        //make the api call to the authentication page
        fetch(process.env.REACT_APP_API_PATH+"/auth/signup", {
            method: "post",
            headers: {
            'Content-Type': 'application/json',
            },
            body: JSON.stringify({
            email: this.state.fields.email,
            password: this.state.fields.password,
            attributes: {
                username: this.state.fields.username,
                displayname: this.state.fields.username,
                bookmarks: [],
            }
            })
        })
        .then(res => res.json())
        .then(
            result => {
                let errors = this.state.errors;

                console.log(result);
                if (result.userID) {
                    console.log("Registered successfully!")

                    this.setState({
                        successmsg: "Thank you for registering, " + String(this.state.fields.username) + "!"
                    });
                    


                } else {
                console.log("Failed to register.")
                errors["email"] = "Please use a different email address.";
                this.setState({
                    errors,
                    successmsg: ""
                    });
                }
            },
            error => {
                let errors = this.state.errors;
                errors["email"] = "Please use a different email address.";
                this.setState({
                    errors,
                    successmsg: ""
                });
            //   alert("Something went wrong. Please use a different email address.");
            }
        );
    }

    // when the user submits the register form, process it through the api
    submitHandler = event => {
        //keep the form from actually submitting
        event.preventDefault();

        // before making the api call to signup, we want to check if the username provided was unqiue and not empty
        // then we want to check whether they inputted a valid password
        // finally we want to make the api call to signup providing the email, password, and username
        this.handleValidation();

    };

    render() {
        // console.log(this.state.errors)
        if (this.state.successmsg != "") {
            return(
                <div className="container">
                <div className="success-alert">
                    <span style={{color: 'black', fontSize: '20px', textAlign: 'center', width: '100%'}}>{this.state.successmsg}</span>
                </div>
                <LoginForm></LoginForm>
            </div>
            )
        }

        if (!sessionStorage.getItem("token")) {
            if (this.state.showLoginComponent) {
                return (
                    <div>
                        <LoginForm/>
                    </div>
                )
            } else {
                return (
                    <div style={{display: 'flexbox', justifyContent: 'center'}}>
                    <div id="phone-title">
                        <h1 style={{textAlign: 'center'}}>Crave</h1>
                    </div>


                    {this.state.successmsg != ""
                    ?
                    <div className="container">
                        <div className="success-alert">
                            <span style={{color: 'black', fontSize: '20px', textAlign: 'left', width: '100%'}}>{this.state.successmsg}</span>
                        </div>
                    </div>
                    
                    :
                    null
                    }
                     
                    <div className="flex-container">
                        {/* Left */}
                            <div className="form-container">


                            <div className="form-header">
                                <div>
                                <p style={{fontFamily: 'Montserrat', fontSize: '36px', fontWeight: 'bold', margin: "0", textAlign: 'left'}}>Register</p>
                                <p style={{margin: "0", marginTop: "1em"}} className="login-redirect-link">Have an Account? <a style={{textDecoration: 'underline',color: 'blue', fontSize: '16px', textAlign: 'left'}} id="login-btn" href="/hci/teams/fantastic/" onClick={this.renderLogin}>Log in</a></p>
                                </div>
                                
                            </div>



                            <div style={{display: 'flex', flexDirection: 'column', height: 'auto', maxWidth: '15em'}} className="div-form">
                            <form onSubmit={this.submitHandler}>
                                <label style={{fontSize: '24px', float: 'left'}}>
                                Username
                                </label>
                                <br />
                                <input autoFocus placeholder="Enter a username" type="text" onChange={this.handleChange.bind(this, "username")} />
                                <span style={{color: 'red', fontSize: '16px', textAlign: 'left', width: '100%', float:'left'}}>{this.state.errors.username}</span>
                                <br />
                                <label style={{fontSize: '24px', float: 'left'}}>
                                Email
                                </label>
                                <br />
                                <input placeholder="Enter an email address" type="text" onChange={this.handleChange.bind(this, "email")} />
                                <span style={{color: 'red', fontSize: '16px', textAlign: 'left', width: '100%', float:'left'}}>{this.state.errors.email}</span>
                                <br />
                                <label style={{fontSize: '24px', float: 'left'}}>
                                Password
                                </label>
                                <br />
                                <input placeholder="Enter a password" type="password" onChange={this.handleChange.bind(this, "password")} />

                                    {Object.keys(this.state.errors).length == 0 && this.state.firstLoad

                                    ?

                                <div>
                                    <h6 style={{fontFamily: 'Montserrat', margin: '1em 0px 0.5em 0px', textAlign: 'left'}}>Password Requirements</h6>
                                    <ul style={{margin: '0px', paddingLeft: '0px'}}>
                                        <li style={{fontFamily: 'Montserrat', color: 'black', fontSize: '16px', textAlign: 'left', width: '100%', float:'left', margin: '0px', listStylePosition: 'inside'}}>8-32 characters</li>
                                        <li style={{fontFamily: 'Montserrat', color: 'black', fontSize: '16px', textAlign: 'left', width: '100%', float:'left', margin: '0px', listStylePosition: 'inside'}}>Include an uppercase</li>
                                        <li style={{fontFamily: 'Montserrat', color: 'black', fontSize: '16px', textAlign: 'left', width: '100%', float:'left', margin: '0px', listStylePosition: 'inside'}}>Include a lowercase</li>
                                        <li style={{fontFamily: 'Montserrat', color: 'black', fontSize: '16px', textAlign: 'left', width: '100%', float:'left', margin: '0px', listStylePosition: 'inside'}}>Include a number</li>
                                    </ul>
                                </div>

                                    :

                                    <div>
                                        {/* <h6 style={{margin: '1em 0px 0.5em 0px', textAlign: 'left'}}>Password Requirements</h6> */}
                                        <ul style={{paddingLeft: '0px', margin:'0px', listStyleType: 'none'}}>
                                        {'password_length' in this.state.errors ? <li style={{color: 'red', fontSize: '16px', textAlign: 'left', width: '100%', float:'left', margin: '0px', listStylePosition: 'inside'}}>{this.state.errors.password_length}</li> : null}
                                        {'password_upper' in this.state.errors ? <li style={{color: 'red', fontSize: '16px', textAlign: 'left', width: '100%', float:'left', margin: '0px', listStylePosition: 'inside'}}>{this.state.errors.password_upper}</li> : null}
                                        {'password_lower' in this.state.errors ? <li style={{color: 'red', fontSize: '16px', textAlign: 'left', width: '100%', float:'left', margin: '0px', listStylePosition: 'inside'}}>{this.state.errors.password_lower}</li> : null}
                                        {'password_number' in this.state.errors ? <li style={{color: 'red', fontSize: '16px', textAlign: 'left', width: '100%', float:'left', margin: '0px', listStylePosition: 'inside'}}>{this.state.errors.password_number}</li> : null}
                                        </ul>
                                    </div>

                                }
                                    
                                
                               
                                <input id="register-btn" type="submit" value="Sign Up" />
                            </form>
                    </div>
                    </div>


                        {/* Right */}
                        <div id="slogan" className="title">
                            <div style={{display: "block"}}>
                                <div className="crave_logo">
                                    <img style={{width: "30vw"}} className="logo" src={craveLogo} alt="Crave Logo"/>
                                </div>
                                    <h3>
                                        <span style={{fontSize: "42px", textAlign: "center"}}>Join now!</span> <br/> You crave it? Make it!
                                    </h3>
                            </div>
                           
                        </div>
                    </div>
                    </div>
                    );
            }
        } else {
            console.log("Returning welcome message");
            if (this.state.username) {
                return <p>Welcome, {this.state.username}</p>;
            } else {
                return <p>{this.state.alanmessage}</p>;
            }
        }
    }
}