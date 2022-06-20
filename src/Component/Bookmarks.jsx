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
import post_dots from "../assets/options/post-dots.png";
import EditPost from "./EditPost.jsx";

const FANTASTIC_URL = window.location.hostname === "localhost" ? "" : "/hci/teams/fantastic";
const API_URL = "https://webdev.cse.buffalo.edu";
export default class Bookmarks extends React.Component{

  constructor(props){
      super(props);
      this.state = {
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
          user_bookmarks: [],
          all_posts: [],
          show: false,
          
      }
      this.postingList = React.createRef();
      this.loadPosts = this.loadPosts.bind(this);
      this.showPopup = this.showPopup.bind(this);
      this.showEditModal = this.showEditModal.bind(this);
      this.hideEditModal = this.hideEditModal.bind(this);
      this.hidePopup = this.hidePopup.bind(this);
      this.user_bookmarks = this.load_bookmarks.bind(this);
      this.Fetch_for_Kelly = this.Fetch_for_Kelly.bind(this);
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
    this.setState({show: true})
  }
  hidePopup(){
    this.setState({show: false})
  }

  // This is the function that will get called the first time that the component gets rendered.  This is where we load the current
  // values from the database via the API, and put them in the state so that they can be rendered to the screen.  
  componentDidMount() {
    //this.Fetch_find_connection();
    if (sessionStorage.getItem("token")) {
        this.Fetch_for_Kelly(sessionStorage.getItem("user"));
        console.log("blocked" + this.state.blocked_ids);
        // fetch the user data, and extract out the attributes to load and display
        fetch(process.env.REACT_APP_API_PATH+"/users/"+sessionStorage.getItem("user"), {
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
                userid: result.id || "",
                email: result.email || "",
                phone_number: result.attributes.phone_number ||"",
                bookmarks: result.attributes.bookmarks || [],
                display_name: result.attributes.display_name || result.attributes.username,
                user_bookmarks: result.attributes.bookmarks || [],
                profile_picture: result.attributes.profile_picture || "https://webdev.cse.buffalo.edu/hci/api/uploads/files/VntOdSotvVlHchly99GsCvYcvc1i-qyHJeYVc1kYvO8.png",
                });
                this.loadPosts();
                document.title = "Bookmarks - @" + this.state.username;
            }
            },
        ); 
    }
  }

  Fetch_for_Kelly(UserID){
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
            for(ind = 0; ind<result[1]; ind++){
              console.log("user " + (result[0][ind]["fromUser"]["id"]) + " has a " + (result[0][ind]["attributes"]["type"]) +" to user " + (result[0][ind]["toUser"]["id"]));
              if (result[0][ind]["attributes"]["type"] === "follow"){
                tempidfollow.push(result[0][ind]["toUser"]["id"]);
              }
              else if(result[0][ind]["attributes"]["type"] === "block"){
                templist.push(result[0][ind]["toUser"]["id"]);
              }
              }
              this.setState({
                following_ids: tempidfollow || [], // people that the logged user follows
                blocking_ids: templist || [] // people that i have currently blocked 
              });
              console.log("this is a print out of who (current state_id) " + this.state.userid + " is following -> " + this.state.following_ids);
              console.log("this is a print out of who (current state_id) " + this.state.userid + " is blocking -> " + this.state.blocking_ids);
            }
        },
        error => {
          alert("Error!");
        }
      );
      
  }

  loadPosts(){
    if (sessionStorage.getItem("user") && this.state.userid){
      let url = process.env.REACT_APP_API_PATH+"/posts?sort=newest";
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
            const bookmarks_only = [];
            for(let i = 0; i < result[0].length; i++){

              if(postings[i].attributes !== null){
                let post_authorID = postings[i].authorID;
                if(!this.state.blocking_ids.includes(post_authorID)){
                  let post_type = postings[i].attributes.type || "";
                  if(post_type === "post" && this.state.user_bookmarks.includes(postings[i].id)){
                      bookmarks_only[String(postings[i].id)] = (postings[i]);
                  } 
                }
              }
            }
            this.setState({
              posts: bookmarks_only,
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

  load_bookmarks(thisPostInfo){
    // console.log("Loading Bookmarks!");
    // console.log(this.state.user_bookmarks);
    // console.log(this.state);
    let postID = thisPostInfo.id;
    if(this.state.user_bookmarks.includes(postID)){
      return(
        <div title="unsave" id={'bookmark-' + thisPostInfo.id} 
        onClick= {() => this.bookmark_post(thisPostInfo, "bookmarked", this.state.user_bookmarks)}>
          <img id={"bookmark-icon-" + thisPostInfo.id} src={bookmark_filled} alt={"unsave post by" + thisPostInfo.author.attributes.username}/>
        </div>
      )
    }else{
      return(
        <div title="save" id={'bookmark-' + thisPostInfo.id} 
        onClick= {() => this.bookmark_post(thisPostInfo, "inactive", this.state.user_bookmarks)}
        onMouseOver={e => e.currentTarget.firstChild.src = bookmark_filled} 
        onMouseLeave = {e => e.currentTarget.firstChild.src = bookmark}>
          <img id={"bookmark-icon-" + thisPostInfo.id} src={bookmark} alt={"save post by" + thisPostInfo.author.attributes.username}/>
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
        this.loadPosts();
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
        <div title="unlike" id={'heart-' + thisPostInfo.id} 
        onClick= {() => this.like_post(thisPostInfo, "liked", reaction_data)}>
          <img id={"heart-icon-" + thisPostInfo.id} src={like_filled} alt="like"></img>
          <p id="like-count">{liked_count}</p>
        </div>
      )
    }else{
      return(
        <div title="like" id={'heart-' + thisPostInfo.id} 
        onClick= {() => this.like_post(thisPostInfo, "inactive", reaction_data)}
        onMouseOver={e => e.currentTarget.firstChild.src = like_filled} 
        onMouseLeave = {e => e.currentTarget.firstChild.src = like_inactive}>
          <img id={"heart-icon-" + thisPostInfo.id} src={like_inactive} alt="like"></img>
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
      <><div title="comment" id={'comment-' + thisPostInfo.id}
        onMouseOver={e => e.currentTarget.firstChild.src = comment_filled}
        onMouseLeave={e => e.currentTarget.firstChild.src = comment}
        onClick={() => {
          if (thisPostInfo.id != null) {
            document.location = "post/" + thisPostInfo.id;
          }
        } }>
        <img id="comment-icon" src={comment} alt="view comments" />
        <p id="comment-count">{comment_count}</p>
      </div><div title="suggest" id={'suggestion-' + thisPostInfo.id}
        onMouseOver={e => e.currentTarget.firstChild.src = suggest_filled}
        onMouseLeave={e => e.currentTarget.firstChild.src = suggest}
        onClick={() => {
          if (thisPostInfo.id != null) {
            document.location = "post/" + thisPostInfo.id;
          }
        } }>
          <img id="suggestion-icon" src={suggest} alt="view suggestions" />
          <p id="suggest-count">{suggest_count}</p>
        </div></>
    )
  }

  load_post(thisPostInfo){
    let post_photo = thisPostInfo.attributes.photo || "";
    let pfp_photo = thisPostInfo.author.attributes.profile_picture || "";
    let post_title = thisPostInfo.attributes.post_title || "";
    let post_summary = thisPostInfo.attributes.post_summary || "";
    let post_content = thisPostInfo.content || "";
    let display_name = thisPostInfo.author.attributes.display_name || thisPostInfo.author.attributes.username;
    // console.log("load_post");
    // console.log(pfp_photo);
    // console.log(thisPostInfo);
    if(!pfp_photo){
      pfp_photo = "https://webdev.cse.buffalo.edu/hci/api/uploads/files/VntOdSotvVlHchly99GsCvYcvc1i-qyHJeYVc1kYvO8.png";
    }
    return(
      <div className="post-content">
        <div id="post-author">
          <div className="user-pfp">
            {pfp_photo && <img className="post-pfp" href={FANTASTIC_URL + "/profile/"+thisPostInfo.authorID}  src= {pfp_photo} alt={display_name + " profile picture"}/>}
          </div>
          <a href={FANTASTIC_URL + "/profile/"+thisPostInfo.authorID} id="display-name">{display_name}</a>
          <a href={FANTASTIC_URL + "/profile/"+thisPostInfo.authorID} id="tag-name">@{thisPostInfo.author.attributes.username}</a>
          {calculateTime(thisPostInfo)}
          {this.state.userid=== thisPostInfo.authorID && <img onClick = {(e) => (e.stopPropagation(), this.toggleMenu(e, true, thisPostInfo.id))} id="postOptions-icon" src={post_dots} alt="Post Options"/>}
          {this.state.postMenu && this.state.postMenuID=== thisPostInfo.id && <div id = "postMenu"><div id="edit" onClick={(e) => this.showEditModal(e, thisPostInfo.id, thisPostInfo)}><p>Edit</p></div><div onClick = {(e) => this.deletePost(e, thisPostInfo.id)}><h1>Delete</h1></div></div>}
        </div>
        <div className="single-post" id={thisPostInfo.id}>
          {post_title && <a href={"/post/"+ thisPostInfo.id} id="post-title">{post_title}</a>}
          {/* if there is a post summary*/}
          {post_summary && <>
            {post_summary && <p id="description">{post_summary}<br></br><a id="description-link" href={"/post/" + thisPostInfo.id}>View More</a></p>}
            {post_photo && <img id="post-img" src={API_URL + post_photo} alt={post_title + " photo"} />}
          </>}
          {/* else if there is not a post summary*/}
          {!post_summary && <>
            {post_content && <p id="description">{post_content}<br></br><a id="description-link" href={"/post/" + thisPostInfo.id}>View More</a></p>}
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
            <div>
                <h2>Bookmarks</h2>
            </div>
            <div className="user-posts">
              {this.state.showEdit && <EditPost showEdit={this.state.showEdit} onCloseEdit={this.hideEditModal} CurrentPostId={this.state.currentPostId} post={this.state.post} />}
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
              <p>{this.state.username} has no posts bookmarked!</p>
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