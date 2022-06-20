import React from "react";
import "./Profile.css";
import profilePic_1 from "../assets/profilePic_1.png"
import profilehist from "../assets/profilehist.png"

// The Profile component shows data from the user table.  This is set up fairly generically to allow for you to customize
// user data by adding it to the attributes for each user, which is just a set of name value pairs that you can add things to
// in order to support your group specific functionality.  In this example, we store basic profile information for the user


var profile_picture_present = false;
const options = [
  {
    label: "Posts Viewable To Friends Only",
    value: "Friends",
  },
  {
    label: "Posts Viewable to Public",
    value: "Public",
  },
  {
    label: "Posts Private",
    value: "Private",
  },
];
 

export default class Profile extends React.Component {
  
  // The constructor will hold the default values for the state.  This is also where any props that are passed
  // in when the component is instantiated will be read and managed.  
  constructor(props){
    super(props);
    this.state = {
        followed_ids: [],
        following_ids: [],
        blocking_ids: [],
        blocked_ids:[],
        username: "",
        responseMessage: "",
        phone_number: "",
        userid: "",
        listType: props.listType,
        postMenu: false,
        postMenuID: -1,
        about_me: "",
        users_followed_ids: [],
        users_following_ids: [],
        user_bookmarks: [],
        display_name: "",
        Blocking_usernames:[],
        counter: 0

    }
    this.postingList = React.createRef();
    this.Fetch_and_Get_UPDATESSTATES = this.Fetch_and_Get_UPDATESSTATES.bind(this);
    this.Fetch_and_Patch = this.Fetch_and_Patch.bind(this);
    this.BlockingList = this.BlockingList.bind(this);
    this.Fetch_find_all_following_and_all_followers = this.Fetch_find_all_following_and_all_followers.bind(this);

}
BlockingList() {
  const holder = this.state.Blocking_usernames;
  const listblocked = holder.map((holder) =>
    <div id="Blocked_List_Content" key={holder}>
      <a id="blocked_list" href={"https://webdev.cse.buffalo.edu/hci/teams/fantastic/profile/" + this.state.blocking_ids[this.state.Blocking_usernames.indexOf(holder)]}>{"@"+holder}</a>
    </div>
  );
  if (!(this.state.blocked_ids == [])){
    return (
      <div className = "blocked-names-container">
        <ul>{listblocked}</ul>
      </div>
    );
  }
  else{
}
}

  // This is the function that will get called every time we change one of the fields tied to the user data source.
  // it keeps the state current so that when we submit the form, we can pull the value to update from the state.  Note that
  // we manage multiple fields with one function and no conditional logic, because we are passing in the name of the state
  // object as an argument to this method.  
  fieldChangeHandler(field, e) {
    this.setState({
      [field]: e.target.value
    });
  }

  Fetch_find_all_following_and_all_followers(UserID){
    const location = window.location.pathname; 
    const location_array = location.split("/");
    const requestedUserID = location_array[location_array.length - 1];
    fetch(process.env.REACT_APP_API_PATH+"/connections?fromUserID="+UserID, {
      method: "get",
      headers: {
        'Content-Type': 'application/json',
        'Authorization': 'Bearer '+sessionStorage.getItem("token")
      }
    })
      .then(res => res.json())
      .then(
        result => {
          if (result) {
            // If there are no attributes then the username will be the username from the email 
            //console.log("locator" + result[0]);
            let ind = 0;
            let templist = [];
            let tempidfollow = [];
            let tempidlist = [];
            let tempbanlist = [];
            for(ind = 0; ind<result[1]; ind++){
              console.log("user " + (result[0][ind]["fromUser"]["attributes"]["username"]) + " has a " + (result[0][ind]["attributes"]["type"]) +" to user " + (result[0][ind]["toUser"]["attributes"]["username"]));
              if (result[0][ind]["attributes"]["type"] == "follow"){
                tempidfollow.push(result[0][ind]["fromUser"]["id"]);
              }
              else if(result[0][ind]["attributes"]["type"] == "block"){
                if (!(templist.includes(result[0][ind]["fromUser"]["id"]))){
                  templist.push(result[0][ind]["toUser"]["id"]);
                  tempbanlist.push(result[0][ind]["toUser"]["attributes"]["username"]);
                }
                //tempbanlist.push(result[0][ind]["fromUser"]["id"]);
              }

              }
              this.setState({
                following_ids: tempidfollow || [],
                blocking_ids: templist || [],
                Blocking_usernames: tempbanlist || []
              });
            }
        },
        error => {
          alert("Error!");
        }
      );
      
  }
  // This is the function that will get called the first time that the component gets rendered.  This is where we load the current
  // values from the database via the API, and put them in the state so that they can be rendered to the screen.  
  componentDidMount() {
    this.Fetch_find_all_following_and_all_followers(sessionStorage.getItem("user"));
    // fetch the user data, and extract out the attributes to load and display
    this.Fetch_and_Get_UPDATESSTATES("get",sessionStorage.getItem("user"));
    fetch(process.env.REACT_APP_API_PATH+"/file-uploads/"+ sessionStorage.getItem("user"), {
      method: "get",
      headers: {
        'Content-Type': 'application/json',
        'Authorization': 'Bearer '+sessionStorage.getItem("token")
      }
    })
      .then(res => res.json())
      .then(
        result => {
          if (result) {
            this.state.profile_picture = ""
            for(let i = 0; i < result[0].length; i++){
              if(result[0][i]["uploaderID"] == sessionStorage.getItem("user")){
                if(result[0][i]["attributes"] == "Profile Picture"){
                  sessionStorage.setItem("profilepicture", "https://webdev.cse.buffalo.edu/" + result[0][i]["path"])
                  profile_picture_present = true;
                  this.setState({
                    // IMPORTANT!  You need to guard against any of these values being null.  If they are, it will
                    // try and make the form component uncontrolled, which plays havoc with react
                    profile_picture: "https://webdev.cse.buffalo.edu/" + result[0][i]["path"] || "",
                  });
                }
              }
            }
            if (profile_picture_present == false){ //sets a default picture
              sessionStorage.setItem("profilepicture", "https://webdev.cse.buffalo.edu/hci/api/uploads/files/VntOdSotvVlHchly99GsCvYcvc1i-qyHJeYVc1kYvO8.png")
              this.state.profile_picture = "https://webdev.cse.buffalo.edu/hci/api/uploads/files/VntOdSotvVlHchly99GsCvYcvc1i-qyHJeYVc1kYvO8.png"
          }
          }
        },
        error => {
          profile_picture_present = false;
        }
      );
  }
  
  deleteHandler = event => {
    event.preventDefault();
    fetch(process.env.REACT_APP_API_PATH+"/users/"+sessionStorage.getItem("user")+"?relatedObjectsAction=delete", {
      method: "DELETE",
      headers: {
        'Content-Type': 'application/json',
        'Authorization': 'Bearer '+sessionStorage.getItem("token")
      },
      body: JSON.stringify({
        attributes: {
          username: this.state.username,
        }
      })
    })
      .then(res => res.json())
      .then(
        result => {
          this.setState({
            responseMessage: result.Status
          });
        },
        error => {
          
        }
      )
      .then(sessionStorage.setItem("token", null));
      sessionStorage.removeItem("token");
      sessionStorage.removeItem("user");
      sessionStorage.removeItem("username");
      sessionStorage.removeItem("profilepicture")
      sessionStorage.removeItem("email")
  };

  Fetch_and_Patch(method, id){
    fetch(process.env.REACT_APP_API_PATH+"/users/"+id, {
      method: "PATCH",
      headers: {
        'Content-Type': 'application/json',
        'Authorization': 'Bearer '+sessionStorage.getItem("token")
      },
      body: JSON.stringify({
        attributes: {
          users_following_ids: this.state.users_following_ids,
          users_followed_ids: this.state.users_followed_ids,
          username: this.state.username,
          about_me: this.state.about_me,
          phone_number: this.state.phone_number,
          profile_picture: this.state.profile_picture,
          email: this.state.email,
          phone_number: this.state.phone_number,
          user_bookmarks: this.state.user_bookmarks,
          userid: this.state.userid,
          display_name: this.state.display_name,
        }
      })
    })
      .then(res => res.json())
      .then(
        result => {
          this.setState({
            responseMessage: result.Status
          });
        },
        error => {
          alert("error!");
        }
      );
  }

  Fetch_and_Get_UPDATESSTATES(method, id){
    fetch(process.env.REACT_APP_API_PATH+"/users/"+id, {
      method: "get",
      headers: {
        'Content-Type': 'application/json',
        'Authorization': 'Bearer '+sessionStorage.getItem("token")
      }
    })
      .then(res => res.json())
      .then(
        result => {
          if (result) {
            // If there are no attributes then the username will be the username from the email 
              //this.setState({
                // IMPORTANT!  You need to guard against any of these values being null.  If they are, it will
                // try and make the form component uncontrolled, which plays havoc with react
                this.setState({username: result.attributes.username || ""})
                this.setState({about_me: result.attributes.about_me || ""})
                this.setState({userid: id || ""})
                this.setState({email: result.attributes.email || ""})
                this.setState({users_followed_ids: result.attributes.users_followed_ids || []})
                this.setState({users_following_ids: result.attributes.users_following_ids || []})
                this.setState({phone_number: result.attributes.phone_number || ""})
                this.setState({user_bookmarks: result.attributes.user_bookmarks || []})
                this.setState({display_name: result.attributes.display_name || ""})
                this.setState({profile_picture: result.attributes.profile_picture || ""})

              //});
              document.title = "Settings - " + this.state.username;
            }
        },
        error => {
          alert("Error!");
        }
      ); 
  }

  // This is the function that will get called when the submit button is clicked, and it stores
  // the current values to the database via the api calls to the user and user_preferences endpoints
  submitHandler = event => {
    // this.state.users_following_ids = [];
    // this.state.users_followed_ids = [];
    event.preventDefault();
      this.Fetch_and_Patch("Patch", sessionStorage.getItem("user"))
      alert("Settings Successfully Updated!");
     
  }
  submitHandlerfile = event => {
    const formData = new FormData();
    const fileField = document.querySelector('input[type="file"]');
    //keep the form from actually submitting, since we are handling the action ourselves via
    //the fetch calls to the API
    formData.append('uploaderID', sessionStorage.getItem("user"));
    formData.append('attributes', JSON.stringify("Profile Picture"));
    formData.append('file', fileField.files[0]);
    event.preventDefault();
    fetch(process.env.REACT_APP_API_PATH+"/file-uploads?uploaderID="+ sessionStorage.getItem("user"), {
      method: "get",
      headers: {
        'Content-Type': 'application/json',
        'Authorization': 'Bearer '+sessionStorage.getItem("token")
      }
    })
      .then(res => res.json())
      .then(
        result => {
          let res = result[0]
          for (let img of res) {
            if (img.attributes == "Profile Picture") {
              fetch(process.env.REACT_APP_API_PATH+"/file-uploads/" + img.id, {
                method: "delete",
                headers: {
                  'Content-Type': 'application/json',
                  'Authorization': 'Bearer '+ sessionStorage.getItem("token")
                }
              })
            }
          }
          fetch("https://webdev.cse.buffalo.edu/hci/api/api/fantastic/file-uploads",{
            method:'POST',
            headers:{
              'Authorization':'Bearer '+ sessionStorage.getItem("token")
              // 'Content-Type':'multipart/form-data'
            },
            body: formData
          })
          
          .then(response => response.json())
          .then(result => {
            sessionStorage.setItem("profilepicture", "https://webdev.cse.buffalo.edu" + result.path);
            this.setState({profile_picture: "https://webdev.cse.buffalo.edu" + result.path || ""})
            
              fetch("https://webdev.cse.buffalo.edu/hci/api/api/fantastic/users/" + sessionStorage.getItem("user"), {
                method: "PATCH",
                headers: {
                  'Content-Type': 'application/json',
                  'Authorization': 'Bearer '+sessionStorage.getItem("token")
                },
                body: JSON.stringify({
                  attributes: {
                    username: this.state.username,
                    users_following_ids: this.state.users_following_ids,
                    users_followed_ids: this.state.users_followed_ids,
                    username: this.state.username,
                    about_me: this.state.about_me,
                    phone_number: this.state.phone_number,
                    profile_picture: this.state.profile_picture,
                    email: this.state.email,
                    user_bookmarks: this.state.user_bookmarks,
                    userid: this.state.userid,
                    display_name: this.state.display_name,
                  }
                })
              })
          })
          .catch(error => {
            console.error('Error:', error);
          })

          ;
        })
        
}

  // This is the function that draws the component to the screen.  It will get called every time the
  // state changes, automatically.  This is why you see the username and firstname change on the screen
  // as you type them.
  render() {
    return (
      <>
      <div id="Encompassing_Settings">
      <div className="rectangleone">
      Profile
      </div>
      <form onSubmit={this.submitHandler} className="profileform">
      <div id="Encompass-Username">
          <div className = "fontset">Display Name
        <input
          className="username_enter"
          type="text"
          placeholder="Enter Display Name Here!"
          onChange={e => this.fieldChangeHandler("display_name", e)}
          value={this.state.display_name}
          />
          </div>
          </div>
          <div id="Encompass-AboutMe">
          <div className = "fontset_about_me"> About Me </div>
          <textarea

            placeholder="Write a Message about Yourself!"
            className="aboutme_enter"
            onChange={e => this.fieldChangeHandler("about_me", e)}
            value={this.state.about_me}
          />

          </div>
          <div id="Encompass-Date">
          <div className = "fontset">&nbsp;&nbsp;Date of Birth
        <input
          placeholder="07/20/2000"
          className="email_enter"
          type="text"
          onChange={e => this.fieldChangeHandler("email", e)}
          value={this.state.email}
          />
          </div>
          </div>
          <div id="Encompass-Phone">
            
           <div className = "fontset">Phone Number</div>
          <input
            placeholder="631-742-3021"
            className="phone_enter"
            type="text"
            onChange={e => this.fieldChangeHandler("phone_number", e)}
            value={this.state.phone_number}
          />
          </div>

        <input className="Submit_Changes" type="submit" value="Submit Changes" style = {{cursor: "pointer"}}/>
        {this.state.responseMessage}
      </form>
      <br></br>
      <div className="rectanglefour">
        Profile Picture Upload
      </div>
      <div id="ImageContainer">
        <img src={this.state.profile_picture} alt={"Your Personal Profile Picture"} className="image_adjust" />
      </div>
      <br></br>
      <form onSubmit={this.submitHandlerfile} className="Picture_form">
      <input type="file"></input>
        <button className="Submit_Changes" type="submit" value="submit" style = {{cursor: "pointer"}}>Upload Photo</button>
      </form>
      <br></br>
      <br></br>
      <div className="blocked_Banner">
        Blocked Users
      </div>
      <div className="label">
        {this.BlockingList()}
      </div>
      <br></br>
      <br></br>
      <div id="delete-form">
        <form onSubmit={this.deleteHandler}>
          <button className ="Delete_Account" type="Submit" value="Submit" >Delete Account Button</button>
          {this.state.responseMessage}
        </form>
      </div>
      </div>
      </>
    );
  }
}
