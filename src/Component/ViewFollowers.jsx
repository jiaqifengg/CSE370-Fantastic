import React from "react";
import "./ViewFollowers.css";
import PropTypes from "prop-types";
import uploadPic from "../assets/file_upload.png";

// This component is an example of a modal dialog.  The content can be swapped out for different uses, and
// should be passed in from the parent class.
export default class ViewFollowers extends React.Component {
  constructor(props){
    super(props);
    this.state = {
      // post_text => The actual post content
        followed_usernames:[],
        following_usernames: [],
        mostrecentusername: "",
        following_ids: [],
    }
    this.FollowerList = this.FollowerList.bind(this);
    this.Fetch_find_all_following_and_all_followers = this.Fetch_find_all_following_and_all_followers.bind(this);
  }
  componentDidMount() {
    this.Fetch_find_all_following_and_all_followers();
}

onClose = e => {
    this.props.onClose && this.props.onClose(e);
  };
  submitHandler = (e) => {
    e.preventDefault()
    if (this.state.imageFile) {
      this.uploadTextPhotoPost()
    }
    else {
      this.uploadTextPost()
    }
  };

  Fetch_find_all_following_and_all_followers(){
    const location = window.location.pathname; 
    const location_array = location.split("/");
    const requestedUserID = location_array[location_array.length - 1];
    fetch(process.env.REACT_APP_API_PATH+"/connections?fromUserID="+requestedUserID, {
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
            let ind = 0;
            let templist = [];
            let list2 = [];
            for(ind = 0; ind<result[1]; ind++){
              if (result[0][ind]["attributes"]["type"] === "follow"){
                templist.push(result[0][ind]["toUser"]["attributes"]["username"]);
                list2.push(result[0][ind]["toUser"]["id"]);
              }
            }
              this.setState({
                following_usernames: templist || [],
                following_ids: list2 || []
              });
            }
            else{
              this.state.following_usernames = [];
              this.state.following_ids = []

          }
        },
        error => {
          alert("Error!");
        }
      );
      fetch(process.env.REACT_APP_API_PATH+"/connections?toUserID="+requestedUserID, {
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
              let ind = 0;
              let tempusername = "";
              let tempphoto = "";
              let templist = [];
              let list2 = [];
              // If there are no attributes then the username will be the username from the email 
              //console.log("locator" + result[0]);
              for(ind = 0; ind<result[1]; ind++){
                if (result[0][ind]["attributes"]["type"] === "follow"){
                list2.push(result[0][ind]["fromUser"]["id"]);
                console.log(result[0][ind]["fromUser"]["id"]);
                templist.push(result[0][ind]["fromUser"]["attributes"]["username"]);
                }
              }
                this.setState({
                    followed_ids: list2 || [],
                    followed_usernames: templist || []
                });
                }
              else{
            }

          },
          error => {
            alert("Error!");
          }
        ); 
  }
  FollowerList() {
    const holder = this.state.followed_usernames;
    const listfollowers = holder.map((holder) =>
      <div id="Follower_List_Content" key={holder}>
          <a id="follower_following_list" href={"https://webdev.cse.buffalo.edu/hci/teams/fantastic/profile/" + this.state.followed_ids[this.state.followed_usernames.indexOf(holder)]}>{"@"+holder}</a>
      </div>
    );
    return (
      <ul>{listfollowers}</ul>
    );
  }
  render() {
    if (!this.props.show) {
      return null;
    }
    return (
        <div id="viewFollow" className="viewFollow">
        <div className="viewFollow-content">
        <span className="close" onClick={this.onClose}>
            &times;
          </span>
          <h1>Followers List</h1>
            <div className="label">
              {this.FollowerList()}
            </div>

        </div>
        </div>
    );
    // {this.state.followed_usernames}

  }
}
ViewFollowers.propTypes = {
    onClose: PropTypes.func.isRequired,
    show: PropTypes.bool.isRequired
  };
  