import React from "react";
import "./NavBar.css";
import "../styles/standard.css";
import profilePic_0 from "../assets/profilePic_0.png";
import like_inactive from "../assets/options/heart.png";
import like_filled from "../assets/options/heart-filled.png";
import comment from "../assets/options/comment.png";
import comment_filled from "../assets/options/comment-filled.png";
import bookmark from "../assets/options/bookmark.png";
import bookmark_filled from "../assets/options/bookmark-filled.png";
import suggest from "../assets/options/suggestion.png";
import suggest_filled from "../assets/options/suggestion-filled.png"
import post_dots from "../assets/options/post-dots.png"
import macaron from "../assets/macaron.jpg"
import EditPost from "./EditPost.jsx";
import ViewFollowers from "./ViewFollowers.jsx";
import ViewFollowing from "./ViewFollowing.jsx";

// import { useNavigate } from "react-router-dom";

var follow_or_followed = "Follow";
var number_of_followed = "0";
var number_of_following = "0";
var blocked_or_block = "Block";
const FANTASTIC_URL = window.location.hostname === "localhost" ? "" : "/hci/teams/fantastic";
const API_URL = "https://webdev.cse.buffalo.edu";
export default class Account extends React.Component{

  constructor(props){
      super(props);
      this.state = {
          Already_blocked: false,
          followed_ids: [],
          following_ids: [],
          blocking_ids: [],
          blocked_ids:[],
          blocked_usernames:[],
          blocking_usernames: [],
          blockid: "-1",
          connectionid: "-1",
          profile_picture: "",
          username: "",
          email: "",
          responseMessage: "",
          phone_number: "",
          userid: "",
          posts: {},
          showEdit: false,
          currentPostId: 0,
          post: {},
          listType: props.listType,
          postMenu: false,
          postMenuID: -1,
          bioMsg: "",
          display_name: "",
          Already_followed: false,
          profile_picture: "",
          //profile_picture_path: "https://webdev.cse.buffalo.edu/hci/api/uploads/files/VntOdSotvVlHchly99GsCvYcvc1i-qyHJeYVc1kYvO8.png", 
          user_bookmarks: [],
          all_posts: [],
          show_followers: false,
          show_following: false,
      }
      this.postingList = React.createRef();
      this.loadPosts = this.loadPosts.bind(this);
      this.showEditModal = this.showEditModal.bind(this);
      this.hideEditModal = this.hideEditModal.bind(this);
      this.Fetch_and_Get_UPDATESSTATES = this.Fetch_and_Get_UPDATESSTATES.bind(this);
      this.Fetch_and_Patch = this.Fetch_and_Patch.bind(this);
      this.Fetch_create_connection = this.Fetch_create_connection.bind(this);
      this.Fetch_delete_connection = this.Fetch_delete_connection.bind(this);
      this.showPopup = this.showPopup.bind(this);
      this.showOtherPopup = this.showOtherPopup.bind(this);
      this.hidePopup = this.hidePopup.bind(this);
      this.Fetch_find_all_following_and_all_followers = this.Fetch_find_all_following_and_all_followers.bind(this);

  }
  
  showEditModal(e, id, post){
    this.setState({
      showEdit: true,
      currentPostId: id,
      post: post})
  }
  hideEditModal(){
    this.setState({showEdit: false})
  }

  showPopup(){
    this.setState({show_followers: true})
  }
  showOtherPopup(){
    this.setState({show_following: true})
  }
  hidePopup(){
    this.setState({show_followers: false})
    this.setState({show_following: false})
  }

  // This is the function that will get called the first time that the component gets rendered.  This is where we load the current
  // values from the database via the API, and put them in the state so that they can be rendered to the screen.  
  componentDidMount() {
    const location = window.location.pathname; 
    const location_array = location.split("/");
    const requestedUserID = location_array[location_array.length - 1];
    //this.Fetch_find_connection();
    this.Fetch_find_all_following_and_all_followers(requestedUserID);
    console.log("blocked" + this.state.blocked_ids);
    // fetch the user data, and extract out the attributes to load and display
    fetch(process.env.REACT_APP_API_PATH+"/users/"+requestedUserID, {
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
            this.setState({
              // IMPORTANT!  You need to guard against any of these values being null.  If they are, it will
              // try and make the form component uncontrolled, which plays havoc with react
              username: result.attributes.username || "",
              bioMsg: result.attributes.about_me || "",
              userid: requestedUserID || "",
              email: result.email || "",
              phone_number: result.attributes.phone_number ||"",
              bookmarks: result.attributes.bookmarks || [],
              display_name: result.attributes.display_name || result.attributes.username,
              user_bookmarks: result.attributes.bookmarks || [],
              profile_picture: result.attributes.profile_picture || "https://webdev.cse.buffalo.edu/hci/api/uploads/files/VntOdSotvVlHchly99GsCvYcvc1i-qyHJeYVc1kYvO8.png",

            });
            this.loadPosts();
            document.title = this.state.display_name + " - @" + this.state.username;
          }
        },
        error => {
          alert("Error!");
        }
      ); 
   
  }

  follow_button_status(){
    if (this.state.Already_followed == true){
      follow_or_followed = "Un-Follow";
    }
    else{
      follow_or_followed = "Follow";
    }
  }


  loadPosts(){
    if (sessionStorage.getItem("user") && this.state.userid){
      let url = process.env.REACT_APP_API_PATH+"/posts?authorID=";
      if(this.state.userid && this.props){
        url += this.state.userid;
      }
      fetch(url,{
        method: "get",
        headers: {
          'Content-Type': 'application/json',
          'Authorization': 'Bearer '+sessionStorage.getItem("token")
        }
      })
      .then(res => res.json())
      .then(
        result => {
          if(result){
            const postings = result[0];
            const posts_only = [];
            let comm_count = 0;
            for(let i = 0; i < result[0].length; i++){
              if(postings[i].attributes !== null){
                let post_type = postings[i].attributes.type || "";
                if(post_type === "post"){
                  posts_only[String(postings[i].id)] = (postings[i]);
                }else if(post_type == "comment"){
                  comm_count += 1; 
                }  
              }
            }
            this.setState({
              posts: posts_only,
              all_posts: postings
            })
          }
        },
        error => {
          this.setState({
            error
          });
        }
      )
    } 
  }

  toggleMenu(e, bool, id) {
    if (this.state.postMenu && this.state.postMenuID !== -1 && id && bool) {
      this.setState({postMenuID: id})
    }
    else if (this.state.postMenu && this.state.postMenuID !== -1) {
      this.setState({postMenu: false})
      this.setState({postMenuID: -1})
    }
    else {
      this.setState({postMenuID: id})
      this.setState({postMenu: true})
    }
  } 
  
  deletePost(e, id) {
    fetch(process.env.REACT_APP_API_PATH+"/posts/" + id, {
      method: "DELETE",
      headers: {
        'Content-Type': 'application/json',
        'Authorization': 'Bearer ' + sessionStorage.getItem("token")
      }
    })
      .then(res => res)
      .then(
        result => {
          if (result) {
            window.location.reload()
          }
      })
  }

  Fetch_and_Patch(method, id){
    fetch(process.env.REACT_APP_API_PATH+"/users/"+id, {
      method: "PATCH",
      headers: {
        'Content-Type': 'application/json',
        'Authorization': 'Bearer '+sessionStorage.getItem("token")
      },
      body: JSON.stringify({
        attributes: {
          username: this.state.username,
          about_me: this.state.bioMsg,
          profile_picture: this.state.profile_picture,
          email: this.state.email,
          phone_number: this.state.phone_number,
          bioMsg: this.state.bioMsg,
          bookmarks: this.state.bookmarks,
          display_name: this.state.display_name,
          user_bookmarks: this.state.user_bookmarks
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
            if (result.attributes){
              this.setState({
                // IMPORTANT!  You need to guard against any of these values being null.  If they are, it will
                // try and make the form component uncontrolled, which plays havoc with react
                username: result.attributes.username || "",
                bioMsg: result.attributes.about_me || "",
                userid: id || "",
                email: result.email || "",
                phone_number: result.attributes.phone_number ||"",
                bookmarks: result.attributes.bookmarks || [],
                display_name: result.attributes.display_name || "",
                user_bookmarks: result.attributes.user_bookmarks || []
              });
              this.loadPosts();
            }else{
              // if there are no attributes then at least set the username as the email username 
              this.setState({
                username: "",
                bioMsg: "",
                userid: "",
                email: "",
                followed_ids: [],
                following_ids: [],
                phone_number: "",
                bookmarks : [],
                display_name:  "",
                user_bookmarks: []
              }, this.loadPosts());
            }
          }
        },
        error => {
          alert("Error!");
        }
      ); 
  }
  Fetch_create_connection(type, toid, fromid){
    //.getItem("user")
    fetch(process.env.REACT_APP_API_PATH+"/connections", {
      method: "POST",
      headers: {
        'Content-Type': 'application/json',
        'Authorization': 'Bearer '+sessionStorage.getItem("token")
      },
      body: JSON.stringify({
        "fromUserID": fromid,
        "toUserID": toid,
        attributes: {
          "type": type
        }
      })
    })
    .then(res => res.json())
        .then(
          result => {
            if (result) {
              // If there are no attributes then the username will be the username from the email 
              if ((result.attributes) && (type == "follow")){
                this.setState({connectionid: result.id});
              }
              else if ((result.attributes) && (type == "block")){
                this.setState({blockid: result.id});
              }
          }
          else{
            console.log("lets give this another go");
          }
        }
        );
  }
  
  Fetch_delete_connection(id_of_conntection){
    fetch(process.env.REACT_APP_API_PATH+"/connections/" +id_of_conntection, {
      method: "DELETE",
      headers: {
        'Content-Type': 'application/json',
        'Authorization': 'Bearer '+sessionStorage.getItem("token")
      }
    })
    
  }

  followHandler = event => {
    const location = window.location.pathname; 
    const location_array = location.split("/");
    const requestedUserID = location_array[location_array.length - 1];


    
    if (this.state.Already_followed == false){
      follow_or_followed = "Un-Follow";
      this.state.Already_followed = true;
      event.preventDefault();
      this.Fetch_create_connection("follow", requestedUserID, sessionStorage.getItem("user"));
      number_of_followed += 1;
      this.state.following_ids.push(sessionStorage.getItem("user"))
      if (this.state.Already_blocked == true){
        blocked_or_block = "Block";
        this.state.Already_blocked = false;
        event.preventDefault();
        this.Fetch_delete_connection(this.state.blockid);
        this.state.blocking_ids.splice((this.state.blocking_ids.indexOf(sessionStorage.getItem("user"))), 1);
      }
      }
    else{
      follow_or_followed = "Follow";
      this.state.Already_followed = false;
      event.preventDefault();
      this.Fetch_delete_connection(this.state.connectionid);
      number_of_followed -= 1;
      this.state.following_ids.splice((this.state.following_ids.indexOf(sessionStorage.getItem("user"))), 1);
    } 
  };
  blockHandler = event => {
    const location = window.location.pathname; 
    const location_array = location.split("/");
    const requestedUserID = location_array[location_array.length - 1];
    if (this.state.Already_blocked == false){
      if(this.state.Already_followed == true){
        follow_or_followed = "Follow";
        this.state.Already_followed = false;
        event.preventDefault();
        this.Fetch_delete_connection(this.state.connectionid);
        number_of_followed -= 1;
        this.state.following_ids.splice((this.state.following_ids.indexOf(sessionStorage.getItem("user"))), 1);
      }
      blocked_or_block = "Un-Block";
      this.state.Already_blocked = true;
      event.preventDefault();
      this.Fetch_create_connection("block", requestedUserID, sessionStorage.getItem("user"));
      this.state.blocked_ids.push(sessionStorage.getItem("user"))
        }
    else{
      blocked_or_block = "Block";
      this.state.Already_blocked = false;
      event.preventDefault();
      this.Fetch_delete_connection(this.state.blockid);
      this.state.blocking_ids.splice((this.state.blocking_ids.indexOf(sessionStorage.getItem("user"))), 1);
    } 
  }

  load_bookmarks(thisPostInfo){
    // console.log("Loading Bookmarks!");
    // console.log(this.state.user_bookmarks);
    // console.log(this.state);
    let postID = thisPostInfo.id;
    if(this.state.user_bookmarks.includes(postID)){
      return(
        <div title="save" id={'bookmark-' + thisPostInfo.id} 
        onClick= {() => this.bookmark_post(thisPostInfo, "bookmarked", this.state.user_bookmarks)}>
          <img id={"bookmark-icon-" + thisPostInfo.id} src={bookmark_filled} alt="bookmark"/>
        </div>
      )
    }else{
      return(
        <div title="save" id={'bookmark-' + thisPostInfo.id} 
        onClick= {() => this.bookmark_post(thisPostInfo, "inactive", this.state.user_bookmarks)}
        onMouseOver={e => e.currentTarget.firstChild.src = bookmark_filled} 
        onMouseLeave = {e => e.currentTarget.firstChild.src = bookmark}>
          <img id={"bookmark-icon-" + thisPostInfo.id} src={bookmark} alt="bookmark"/>
        </div>
      )
    }
  }
  
  // Update bookmarks array in current state
  // Then POST API call to update bookmarks
  bookmark_post(thisPostInfo, status, currBookmarks) {
    if(status === "inactive"){
      // POST Reaction -> bookmark the post
      this.state.user_bookmarks.push(thisPostInfo.id);
      fetch(process.env.REACT_APP_API_PATH+"/users/"+sessionStorage.getItem("user"), {
        method: "PATCH",
        headers: {
          'Content-Type': 'application/json',
          'Authorization': 'Bearer '+sessionStorage.getItem("token")
        },
        body: JSON.stringify({
          email: this.state.email,
          attributes: {
            users_followed_ids: this.state.users_followed_ids,
            users_following_ids: this.state.users_following_ids,
            username: this.state.username,
            bookmarks: currBookmarks,
            profile_picture: this.state.profile_picture,
            about_me: this.state.bioMsg,
            phone_number: this.state.phone_number,
            email: this.state.email,
            display_name: this.state.display_name
          }
        })
      })
      .then(res => res)
      .then(
        result => {
          if (result) {
            console.log("Bookmarked post " + thisPostInfo.id + " successfully!");
          }
      })
    }else if(status === "bookmarked"){
      // Delete reaction -> unlike post 
      // reactionInfo should not be be empty
      const index = this.state.user_bookmarks.indexOf(thisPostInfo.id);
      if(index !== -1){
        this.state.user_bookmarks.splice(index, 1);
        this.setState({
          user_bookmarks: this.state.user_bookmarks
        })
      }
      fetch(process.env.REACT_APP_API_PATH+"/users/"+sessionStorage.getItem("user"), {
        method: "PATCH",
        headers: {
          'Content-Type': 'application/json',
          'Authorization': 'Bearer '+sessionStorage.getItem("token")
        },
        body: JSON.stringify({
          email: this.state.email,
          attributes: {
            users_followed_ids: this.state.users_followed_ids,
            users_following_ids: this.state.users_following_ids,
            username: this.state.username,
            bookmarks: currBookmarks,
            profile_picture: this.state.profile_picture,
            about_me: this.state.bioMsg,
            phone_number: this.state.phone_number,
            email: this.state.email,
            display_name: this.state.display_name
          }
        })
      })
      .then(res => res)
      .then(
        result => {
          if (result) {
            console.log("Un-bookarked post " + thisPostInfo.id + " successfully!");
          }
      })
    }
  }

  
  load_likes(thisPostInfo) {
    // console.log("We are in reactions");
    // console.log(thisPostInfo.reactions);
    let liked = false;
    let liked_count = 0; 
    let reaction_data = {}
    if(thisPostInfo.reactions.length !== 0){
      // user has liked this post 
      const reacts = thisPostInfo.reactions; // this is an array 
      for(let i = 0; i < reacts.length; i++){
        // console.log(reacts[i]);
        if(reacts[i].name === "like"){
          if((reacts[i].reactorID + '0') === (sessionStorage.getItem("user") + '0')){
            liked = true;
            reaction_data = reacts[i];
         //   console.log("here here");
         //   console.log(reacts[i]);
          }
          liked_count += 1; 
        }
      }
    }
    if(thisPostInfo.reactions.length === 0 || liked_count === 0){
      liked_count = ""; 
    }
   // console.log("This post is liked " + liked);
    if(liked){
      return(
        <div title="like" id={'heart-' + thisPostInfo.id} 
        onClick= {() => this.like_post(thisPostInfo, "liked", reaction_data)}>
          <img id={"heart-icon-" + thisPostInfo.id} src={like_filled} alt={"unlike post by " + thisPostInfo.author.attributes.username} ></img>
          <p id="like-count">{liked_count}</p>
        </div>
      )
    }else{
      return(
        <div title="like" id={'heart-' + thisPostInfo.id} 
        onClick= {() => this.like_post(thisPostInfo, "inactive", reaction_data)}
        onMouseOver={e => e.currentTarget.firstChild.src = like_filled} 
        onMouseLeave = {e => e.currentTarget.firstChild.src = like_inactive}>
          <img id={"heart-icon-" + thisPostInfo.id} src={like_inactive} alt={"like post by " + thisPostInfo.author.attributes.username}></img>
          <p id="like-count">{liked_count}</p>
        </div>
      )
    }
  }

  // Make API call to Like a Post
  // then reload the posts again with the updated "like" reactions so call loadPosts() again
  like_post(thisPostInfo, status, reactionInfo){
    if(status === "inactive"){
      // POST Reaction -> like the post
      fetch(process.env.REACT_APP_API_PATH+"/post-reactions", {
        method: "POST",
        headers: {
          'Content-Type': 'application/json',
          'Authorization': 'Bearer '+sessionStorage.getItem("token")
        },
        body: JSON.stringify({
          postID: thisPostInfo.id,
          reactorID: sessionStorage.getItem("user"),
          name: "like",
          value: 0,
          attributes: {}
        })
      })
      .then(res => res)
      .then(
        result => {
          if (result) {
            //console.log("Reaction number " + reactionInfo.id + " successfully liked!");
            fetch(process.env.REACT_APP_API_PATH+"/posts/" + thisPostInfo.id, {
              method: "GET",
              headers: {
                'Content-Type': 'application/json',
                'Authorization': 'Bearer '+sessionStorage.getItem("token")
              },
            })
            .then(res => res.json())
            .then(
              result => {
                let newState = {...this.state.posts}
                newState[String(thisPostInfo.id)] = result
                this.setState({posts: newState})
              })
          }
      })
    }else if(status === "liked"){
      // Delete reaction -> unlike post 
      // reactionInfo should not be be empty
      fetch(process.env.REACT_APP_API_PATH+"/post-reactions/" + reactionInfo.id, {
        method: "DELETE",
        headers: {
          'Content-Type': 'application/json',
          'Authorization': 'Bearer '+sessionStorage.getItem("token")
        },
      })
      .then(res => res)
      .then(
        result => {
          if (result) {
            fetch(process.env.REACT_APP_API_PATH+"/posts/" + thisPostInfo.id, {
              method: "GET",
              headers: {
                'Content-Type': 'application/json',
                'Authorization': 'Bearer '+sessionStorage.getItem("token")
              },
            })
            .then(res => res.json())
            .then(
              result => {
                //console.log("AAAAAAAAA", result.reactions.length)
                let newState = {...this.state.posts}
                newState[String(thisPostInfo.id)] = result
                this.setState({posts: newState})
              })
          }
      })
    }
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
            number_of_following = 0
            // If there are no attributes then the username will be the username from the email 
            //console.log("locator" + result[0]);
            let ind = 0;
            // number_of_following = result[1];
            let templist = [];
            let tempidfollow = [];
            let tempidlist = [];
            let tempbanlist = [];
            console.log("before for loop " + result[1]);
            for(ind = 0; ind<result[1]; ind++){
              console.log("user " + (result[0][ind]["fromUser"]["attributes"]["username"]) + " has a " + (result[0][ind]["attributes"]["type"]) +" to user " + (result[0][ind]["toUser"]["attributes"]["username"]));
              if (result[0][ind]["attributes"]["type"] == "follow"){
                tempidfollow.push(result[0][ind]["fromUser"]["id"]);
                number_of_following+=1;
              }
              else if(result[0][ind]["attributes"]["type"] == "block"){
                console.log("found a block");
                templist.push(result[0][ind]["fromUser"]["id"]);
                //tempbanlist.push(result[0][ind]["fromUser"]["id"]);
              }
              }
              this.setState({
                following_ids: tempidfollow || [],
                //blocking_usernames: tempbanlist || [],
                blocking_ids: templist || []
              });
            }
            else{
            number_of_following = 0;
          }
        },
        error => {
          alert("Error!");
        }
      );
      fetch(process.env.REACT_APP_API_PATH+"/connections?toUserID="+UserID, {
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
              let templist = [];
              let tempbanlist =[];
              let list3 =[];
              let list4 =[];
              let nodups = [];
              number_of_followed = 0;
              // If there are no attributes then the username will be the username from the email 
              //console.log("locator" + result[0]);
              // number_of_followed = result[1];
              for(ind = 0; ind<result[1]; ind++){
                console.log("user " + (result[0][ind]["fromUser"]["attributes"]["username"]) + " has a " + (result[0][ind]["attributes"]["type"]) +" to user " + (result[0][ind]["toUser"]["attributes"]["username"]));
                if (result[0][ind]["attributes"]["type"] == "block"){
                  list4.push(result[0][ind]["fromUser"]["id"]);
                }
                else if(result[0][ind]["attributes"]["type"] == "follow"){
                  number_of_followed += 1;
                  list3.push(result[0][ind]["fromUser"]["id"]);
                }
                if(result[0][ind]["fromUser"]["id"] == sessionStorage.getItem("user")){
                  if(result[0][ind]["attributes"]["type"] == "block"){
                    this.state.Already_blocked = true;
                    blocked_or_block = "Un-Block";
                    this.state.blockid = result[0][ind]["id"];
                  }
                  if(result[0][ind]["attributes"]["type"] == "follow"){
                    this.state.Already_followed = true;
                    follow_or_followed = "Un-Follow";
                    this.state.connectionid = result[0][ind]["id"];
                  }
                  //to look for banned connections as well
                }
                }
                this.setState({
                    followed_ids: list3 || [],
                    blocked_ids: list4 || []
                });
                console.log("these are the blocked ids" + this.state.blocked_ids);
                }
              else{
              number_of_followed = 0;
            }
          },
        ); 
  }

  load_comment_suggest(thisPostInfo){
    let suggest_count = 0;
    let comment_count = 0;
    let postings = this.state.all_posts;
    for(let i = 0; i < postings.length; i++){
      // console.log(postings[i]);
      if(postings[i].attributes !== null){
        let post_type = postings[i].attributes.type || "";
        // console.log(postings[i].id + " The post type is: " + post_type);
        if(thisPostInfo.id === postings[i].parentID){
          if(post_type === "comment"){
            comment_count += 1;
          }else if(post_type === "suggest"){
            comment_count += 1; 
          }
        }
      }
    }
    if(comment_count === 0){
      comment_count = "";
    }
    if(suggest_count === 0){
      suggest_count = "";
    }
    return(
      <>
      <a href = {thisPostInfo.id ? FANTASTIC_URL + '/post/' + thisPostInfo.id : ""}>
      <div title="comment" id={'comment-' + thisPostInfo.id}
        onMouseOver={e => e.currentTarget.firstChild.src = comment_filled}
        onMouseLeave={e => e.currentTarget.firstChild.src = comment}
/*         onClick={() => {
          if (thisPostInfo.id != null) {
            location.href = 'post/' + thisPostInfo.id;
          }
        } } */>
          
        <img id="comment-icon" src={comment} alt="comment" />
        <p id="comment-count">{comment_count}</p>
      </div>
      </a>

      <a href = {thisPostInfo.id ? FANTASTIC_URL + '/post/' + thisPostInfo.id : ""}>
      <div title="suggest" id={'suggestion-' + thisPostInfo.id}
        onMouseOver={e => e.currentTarget.firstChild.src = suggest_filled}
        onMouseLeave={e => e.currentTarget.firstChild.src = suggest}
        /* onClick={() => {
          if (thisPostInfo.id != null) {
            document.location = "post/" + thisPostInfo.id;
          }
        } } */>
          <img id="suggestion-icon" src={suggest} alt="suggest" />
          <p id="suggest-count">{suggest_count}</p>
        </div>
        </a>
        </>
    )
  }

  load_post(thisPostInfo){
    let post_photo = thisPostInfo.attributes.photo || "";
    let pfp_photo = thisPostInfo.author.attributes.profile_picture  || "";
    let post_title = thisPostInfo.attributes.post_title || "";
    let post_summary = thisPostInfo.attributes.post_summary || "";
    let post_content = thisPostInfo.content || "";
    if(!pfp_photo){
      pfp_photo = profilePic_0;
    }
    return(
      <div className="post-content">
        <div id="post-author">
          <div className="user-pfp">
            {pfp_photo && <img className="post-pfp" href={FANTASTIC_URL + "/profile/"+this.state.userid} src={pfp_photo} alt={this.state.display_name + " profile picture"}/>}
          </div>
          <a href={FANTASTIC_URL + "/profile/"+this.state.userid} id="display-name">{this.state.username}</a>
          <a href={FANTASTIC_URL + "/profile/"+this.state.userid} id="tag-name">@{this.state.username}</a>
          {calculateTime(thisPostInfo)}
          {sessionStorage.getItem("user") == thisPostInfo.authorID && <img onClick = {(e) => (e.stopPropagation(), this.toggleMenu(e, true, thisPostInfo.id))} id="postOptions-icon" src={post_dots} alt="Post Options"/>}
          {this.state.postMenu && this.state.postMenuID === thisPostInfo.id && <div id = "postMenu"><div id="edit" onClick={(e) => this.showEditModal(e, thisPostInfo.id, thisPostInfo)}><p>Edit</p></div><div onClick = {(e) => this.deletePost(e, thisPostInfo.id)}><h1>Delete</h1></div></div>}
        </div>
        <div className="single-post" id={thisPostInfo.id}>
          {post_title && <a href={"/post/"+ thisPostInfo.id} id="post-title">{post_title}</a>}
          {/* if there is a post summary then show summary and photo*/}
          {post_summary && <>
            {post_summary && <p id="description">{post_summary}<br></br><a id="description-link" href={FANTASTIC_URL + "/post/" + thisPostInfo.id}>View More</a></p>}
            {post_photo && <img id="post-img" src={API_URL + post_photo} alt={post_title + " photo"} />}
          </>}
          {/* else if there is not a post summary then show the content and photo*/}
          {!post_summary && <>
            {post_content && <p id="description">{post_content}<br></br><a id="description-link" href={FANTASTIC_URL + "/post/" + thisPostInfo.id}>View More</a></p>}
            {post_photo && <img id="post-img" src={API_URL + post_photo} alt={post_title + " photo"} />}
          </>}
        </div>
      </div>
    )
  }

  render(){
      return(
        <div className="columns" onClick = {(e) => this.toggleMenu(e, false, -1)}>
          <div id="sidebar-left">
          </div>
          <div id="main-content">
          <ViewFollowers onClose={this.hidePopup} show={this.state.show_followers}/>
          <ViewFollowing onClose={this.hidePopup} show={this.state.show_following}/>
            {this.state.showEdit && <EditPost showEdit={this.state.showEdit} onCloseEdit={this.hideEditModal} CurrentPostId={this.state.currentPostId} post={this.state.post}/>}
            <div class="user-data"> 
            {/* this was //profile_picture_path before */}
            <div id="profile-picture">
              <img class="user-img" src={this.state.profile_picture} alt={this.state.username}/>
            </div>
              <p id="display-name">{this.state.display_name}</p>
              <p id="tag-name">@{this.state.username}</p>
              <p id="user-bio">{this.state.bioMsg}</p>
              {sessionStorage.getItem("user") !== this.state.userid &&
              <button id="follow-btn" onClick={this.followHandler}>{follow_or_followed}</button>
              }
              {sessionStorage.getItem("user") !== this.state.userid &&
              <button id="block-btn" onClick={this.blockHandler}>{blocked_or_block}</button>
              }
            </div>
            <div id="user-analytics">
              <div id="posts-count">
                <p id="data-title">Posts</p>
                <p id="amount">{Object.keys(this.state.posts).length}</p>
              </div>
              <div id="followers-count">
                <p id="data-title">Followers</p>
                <button id="amount_button" onClick={this.showPopup}>{number_of_followed}</button>
                {/* <p id="amount">{number_of_followed}</p> */}
              </div>
              <div id="following-count">
                <p id="data-title">Following</p>
                <button id="amount_button" onClick={this.showOtherPopup}>{number_of_following}</button>
              </div>
            </div>
            <div className="user-posts" id = "profilePosts">
              {/* ---------------------------------------------------------- */}
              {Object.keys(this.state.posts).length > 0 &&
                Object.values(this.state.posts).reverse().map(post => (
                    <div class="one-post" key={post.id}>
                      {this.load_post(post)}
                      <div class="user-options">
                          {this.load_likes(post)}
                          {this.load_comment_suggest(post)}
                          {this.load_bookmarks(post, this.state.user_bookmarks)}
                          {/* <div title="save" id={'bookmark-' + post.id} onClick= {() => bookmark_post(post, this.state.userid)}>
                            <img id={"bookmark-icon-" + post.id} src={bookmark} alt="bookmark"/>
                          </div> */}
                      </div>
                    </div>
                  ))
              }
              {this.state.posts.length === 0 &&
              <p>{this.state.username} has not made any posts!</p>
              }
              {/* ---------------------------------------------------------- */}
          </div>
          </div>
          <div id="sidebar-right">
          </div>
        </div>
      );
  }
}


// let navigate = useNavigate();
// iterate through the post's reactions and see if the current logged user has liked the post or not

function calculateTime(thisPost){
  const monthNames = ["January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December"];
  const time_created = thisPost.created;
  const parsedDate = new Date(time_created);
  let time_diff = Math.ceil(((new Date().getTime()) - parsedDate)/1000);
  // console.log("The time diff is " + time_diff);
  if(time_diff < 60){
    return (<p id="time-tag"> • {time_diff}s</p>);
  }else if(time_diff > 60 && time_diff < 120){
    return (<p id="time-tag"> • 1 min</p>);
  }else if(time_diff > 120 && time_diff < (60 * 60)){
    const mins = Math.ceil(time_diff/60);
    return (<p id="time-tag"> • {mins} minutes </p>);
  }else if(time_diff >= (60 * 60) && time_diff < (120 * 60)){ // 
    return (<p id="time-tag"> • 1 hr</p>);
  }else if(time_diff >= 120 * 60 && time_diff <= (24 * 60 *60)){
    const hr = Math.ceil(time_diff/3600);
    return (<p id="time-tag"> • {hr} hrs</p>);
  }else{
    const month = parsedDate.getUTCMonth();
    const day = parsedDate.getUTCDate();
    const year = parsedDate.getUTCFullYear();
    return (<p id="time-tag"> • {monthNames[month]} {day}, {year}</p>);
  }
}