import React from "react";
import "../App.css";
import CommentForm from "./CommentForm.jsx";
import helpIcon from "../assets/delete.png";
import commentIcon from "../assets/comment.svg";
import likeIcon from "../assets/thumbsup.png";
import like_inactive from "../assets/options/heart.png";
import like_filled from "../assets/options/heart-filled.png";
import comment from "../assets/options/comment.png";
import comment_filled from "../assets/options/comment-filled.png";
import bookmark from "../assets/options/bookmark.png";
import bookmark_filled from "../assets/options/bookmark-filled.png";
import suggest from "../assets/options/suggestion.png";
import suggest_filled from "../assets/options/suggestion-filled.png";
import post_dots from "../assets/options/post-dots.png"
import macaron from "../assets/macaron.jpg"
import profilePic_0 from "../assets/profilePic_0.png";


/* This will render a single post, with all of the options like comments, delete, tags, etc.  In the harness, it's only called from PostingList, but you could
  also have it appear in a popup where they edit a post, etc. */
export default class Post extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      showCommentModal: true,
      showSuggestionModal: false,
      comments: this.props.commentCount,
      suggestions: this.props.suggestionCount,
      postMenuID: -1,
      postMenu: false,
      attr: {},
      id: "",
      email: "",
      post: this.props.post,
      is_loaded: false,
    };
    this.post = React.createRef();
  }
  
  componentDidMount() {
    console.log("PropSuggestions: ", this.props.suggestionCount, "PropComments: ", this.props.commentCount);
    console.log("Suggestions: ", this.state.suggestions, "Comments: ", this.state.comments);
    // if (this.props.commentCount !== this.state.comments && this.state.comments === 0) {
    //   this.setState({comments: this.props.commentCount}, () => console.log(this.state.comments));
    // }
    // if (this.props.suggestionCount !== this.state.suggestions && this.state.suggestions === 0) {
    //   this.setState({suggestions: this.props.suggestionCount}, () => console.log(this.state.suggestions));
    // }

    function removeSessionData() {
      sessionStorage.removeItem("token");
      sessionStorage.removeItem("user");
      sessionStorage.removeItem("username");
      sessionStorage.removeItem("profilepicture");
      sessionStorage.removeItem("email")
      console.log("Deleted session")
    }

    // get user data if logged in
    const auth_token = sessionStorage.getItem("token");
    const user_id = sessionStorage.getItem("user");

    if (auth_token) {
      fetch(process.env.REACT_APP_API_PATH + "/users/" + user_id, {
        method: "GET",
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${auth_token}`,
        },
      })
    .then(res => res.json())
    .then(result => {
        if (result) {
          if (result.attributes){
            let id = result.id;
            let email = result.email;
            let attr = {
              "username": result.attributes.username || "",
              "about_me": result.attributes.about_me || "",
              "phone_number": result.attributes.phone_number ||"",
              "users_followed_ids": result.attributes.users_followed_ids || [],
              "users_following_ids": result.attributes.users_following_ids || [],
              "bookmarks": result.attributes.bookmarks || [],
              "displayname": result.attributes.displayname || result.attributes.username,
              "profile_picture": result.attributes.profile_picture || "https://webdev.cse.buffalo.edu/hci/api/uploads/files/aPVq0p2Ums6FEpiYCeY9F-U1w35K0RhHfxVHifBgXHc.png"
            };
            this.setState({
              // IMPORTANT!  You need to guard against any of these values being null.  If they are, it will
              // try and make the form component uncontrolled, which plays havoc with react
              attr,
              id: id,
              email: email,
            }, 
            // () => console.log(this.state.attr, this.state.id, this.state.email)
            );
          } else {
            removeSessionData();
          }
        }
        else {
          removeSessionData();
        }
    })
    }

    fetch(process.env.REACT_APP_API_PATH+"/posts/" + this.state.post.id, {
      method: "GET",
      headers: {
        'Content-Type': 'application/json',
        'Authorization': 'Bearer '+sessionStorage.getItem("token")
      },
    })
    .then(res => res.json())
    .then(
      result => {
        this.setState({post: result, is_loaded: true});
      }, () => console.log(this.state.post))
  }

  showCommentModal = e => {
    this.setState({
      showCommentModal: !this.state.showCommentModal,
      showSuggestionModal: false
    });
  };

  showSuggestionModal = e => {
    this.setState({
      showSuggestionModal: !this.state.showSuggestionModal,
      showCommentModal: false
    });
  };

  setCommentCount = newcount => {
    this.setState({
      comments: newcount
    });
  };

  setSuggestionCount = newcount => {
    this.setState({
      suggestions: newcount
    });
  };

  getCommentCount() {
    if (!this.state.comments || this.state.comments === "0") {
      return 0;
    }
    return parseInt(this.state.comments);
  }

  getSuggestionCount() {
    if (!this.state.suggestions || this.state.suggestions === "0") {
      return 0;
    }
    return parseInt(this.state.suggestions);
  }

  // this will toggle the CSS classnames that will either show or hide the comment block
  showHideComments() {
    if (this.state.showCommentModal) {
      return "comments show";
    }
    return "comments hide";
  }

   // this will toggle the CSS classnames that will either show or hide the suggestion block
   showHideSuggestions() {
    if (this.state.showSuggestionModal) {
      return "comments show";
    }
    return "comments hide";
  }

  deletePost(postID) {
    //make the api call to post
    fetch(process.env.REACT_APP_API_PATH + "/posts/" + postID, {
      method: "DELETE",
      headers: {
        'Content-Type': 'application/json',
        'Authorization': 'Bearer '+sessionStorage.getItem("token")
      }
      })
      .then(
        result => {
          this.props.loadPosts();
        },
        error => {
          alert("error!"+error);
        }
      );
  }

  // we only want to expose the delete post functionality if the user is
  // author of the post
  showDelete(){
    if (this.props.post.author.id === sessionStorage.getItem("user")) {
      return(
      <img
        src={helpIcon}
        className="sidenav-icon deleteIcon"
        alt="Delete Post"
        title="Delete Post"
        onClick={e => this.deletePost(this.props.post.id)}
      />
    );
    }
    return "";
  }

  load_likes(thisPostInfo) {
    let liked = false;
    let liked_count = 0;
    let reaction_data = {};

    const reacts = thisPostInfo.reactions;
    const userid = sessionStorage.getItem("user");
    
    // post has reactions
    if(reacts.length !== 0){
      // check if user has liked the post 
      for(let i = 0; i < reacts.length; i++){
        if(reacts[i].name === "like") {
          if(reacts[i].reactorID === parseInt(userid)){
            liked = true;
            reaction_data = reacts[i];
          }
          liked_count += 1; 
        }
      }
    }
    if(reacts.length === 0 || liked_count === 0){
      liked_count = ""; 
    }
    // console.log("This post is liked " + liked);
    if(liked){
      // console.log("Liked");
      return(
        <div className="iconDiv" title="like" id={'heart-' + thisPostInfo.id} 
        onClick= {() => this.like_post(thisPostInfo, "liked", reaction_data)}>
          <img id={"heart-icon-" + thisPostInfo.id} src={like_filled} alt="like"></img>
          <p id="like-count">{liked_count}</p>
        </div>
      )
    }else{
      // console.log("Not liked");
      return(
        <div className="iconDiv" title="like" id={'heart-' + thisPostInfo.id} 
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
      let isLiked = false;
      // Check if user already liked the post
      for (let i = 0; i < this.state.post.reactions.length; i++) {
        if (this.state.post.reactions[i].reactorID === parseInt(sessionStorage.getItem("user"))) {
          isLiked = true;
          console.log(this.props.post, parseInt(sessionStorage.getItem("user")));
        }
      }

      // If user didn't like the post
      if (!isLiked) {
        fetch(process.env.REACT_APP_API_PATH + "/post-reactions", {
        method: "POST",
        headers: {
          'Content-Type': 'application/json',
          'Authorization': 'Bearer ' + sessionStorage.getItem("token")
        },
        body: JSON.stringify({
          postID: thisPostInfo.id,
          reactorID: sessionStorage.getItem("user"),
          name: "like",
          value: 0,
          attributes: {}
        })
      })
      .then(res => res.json())
      .then(
        result => {
          if (result) {
            console.log("Reaction number " + result.id + " successfully liked!");
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
                this.setState({post: result})
              });
          }
      })
      }
    }else if(status === "liked"){
      // Delete reaction -> unlike post 
      // reactionInfo should not be be empty
      fetch(process.env.REACT_APP_API_PATH+"/post-reactions/" + reactionInfo.id, {
        method: "DELETE",
        headers: {
          'Content-Type': 'application/json',
          'Authorization': 'Bearer ' + sessionStorage.getItem("token")
        },
      })
      .then(res => res)
      .then(
        result => {
          if (result) {
            console.log("Reaction number " + reactionInfo.id + " successfully deleted/unliked!");
            fetch(process.env.REACT_APP_API_PATH+"/posts/" + thisPostInfo.id, {
              method: "GET",
              headers: {
                'Content-Type': 'application/json',
                'Authorization': 'Bearer ' + sessionStorage.getItem("token")
              },
            })
            .then(res => res.json())
            .then(
              result => {
                this.setState({post: result})
              })
          }
      })
    }
  }

  load_bookmarks(thisPostInfo){
    if (!this.state.attr.bookmarks){
      return(
        <div className="iconDiv" title="save" id={'bookmark-' + thisPostInfo.id} 
        onClick= {() => this.bookmark_post(thisPostInfo, "inactive", this.state.attr.bookmarks)}
        onMouseOver={e => e.currentTarget.firstChild.src = bookmark_filled} 
        onMouseLeave = {e => e.currentTarget.firstChild.src = bookmark}>
        <img id={"bookmark-icon-" + thisPostInfo.id} src={bookmark} alt="bookmark"/>
        </div>
      )
    }
    let postID = thisPostInfo.id;
    let currBookmarks = this.state.attr.bookmarks;
    if(currBookmarks.includes(postID)){
      return(
        <div title="save" id={'bookmark-' + thisPostInfo.id} 
        onClick= {() => this.bookmark_post(thisPostInfo, "bookmarked", this.state.attr.bookmarks)}>
        <img id={"bookmark-icon-" + thisPostInfo.id} src={bookmark_filled} alt="bookmark"/>
        </div>
      )
    }else{
      return(
        <div className="iconDiv" title="save" id={'bookmark-' + thisPostInfo.id} 
        onClick= {() => this.bookmark_post(thisPostInfo, "inactive", this.state.attr.bookmarks)}
        onMouseOver={e => e.currentTarget.firstChild.src = bookmark_filled} 
        onMouseLeave = {e => e.currentTarget.firstChild.src = bookmark}>
        <img id={"bookmark-icon-" + thisPostInfo.id} src={bookmark} alt="bookmark"/>
        </div>
      )
    }
  }
  
  // Add or remove bookmark from user's attributes when user clicks on a bookmark icon on a post
  bookmark_post(thisPostInfo, status) {
    if(status === "inactive"){
      // Add bookmark to user attributes
      let bookmarks = this.state.attr.bookmarks;
      let attr = this.state.attr;
      bookmarks.push(this.props.post.id);
      attr.bookmarks = bookmarks;
      this.setState({attr});
    } else {
      // Remove bookmark from user attributes
      let bookmarks = this.state.attr.bookmarks;
      let attr = this.state.attr;
      const index = bookmarks.indexOf(thisPostInfo.id);
      if(index !== -1){
        bookmarks.splice(index, 1);
        attr.bookmarks = bookmarks;
        this.setState({attr});
      }
    }
    fetch(process.env.REACT_APP_API_PATH+"/users/"+sessionStorage.getItem("user"), {
      method: "PATCH",
      headers: {
        'Content-Type': 'application/json',
        'Authorization': 'Bearer '+sessionStorage.getItem("token")
      },
      body: JSON.stringify({
        attributes: this.state.attr
      })
    })
    .then(res => res)
    .then(
      result => {
        if (result) {
          if (status === "bookmarked") {
            console.log("Removed bookmark " + thisPostInfo.id + " successfully!");
          } else {
            console.log("Added bookmark " + thisPostInfo.id + " successfully!");
          }
        }
    })
  }

  load_comments(thisPostInfo){
    // console.log(this.state.comments);
    if (this.state.showCommentModal) {
    return(
      <div className="iconDiv" title="comment" id={'comment-' + thisPostInfo.id}
        onClick={e => this.showCommentModal()}>
        {this.showCommentModal ? <img id="comment-icon" src={comment_filled} alt="View Comments"/> : <img id="comment-icon" src={comment} alt="View Comments"/>}
        <p id="comment-count">{this.state.comments}</p>
      </div>
    )} else {
      return(
      <div className="iconDiv" title="comment" id={'comment-' + thisPostInfo.id}
        onMouseOver={e => e.currentTarget.firstChild.src = comment_filled}
        onMouseLeave={e => e.currentTarget.firstChild.src = comment}
        onClick={e => this.showCommentModal()}>
       <img id="comment-icon" src={comment} alt="View Comments"/>
        <p id="comment-count">{this.state.comments}</p>
      </div>)
    }
  }

  load_suggestions(thisPostInfo) {
    if (this.state.showSuggestionModal) {
    return(
      <div className="iconDiv" title="suggest" id={'suggestion-' + thisPostInfo.id}
        onClick={e => this.showSuggestionModal()}>
        {this.state.showSuggestionModal ? <img id="suggestion-icon" src={suggest_filled} alt="suggest" /> : <img id="suggestion-icon" src={suggest} alt="suggest" />}
        <p id="suggest-count">{this.state.suggestions}</p>
      </div>
    )} else {
      return(
        <div className="iconDiv" title="suggest" id={'suggestion-' + thisPostInfo.id}
          onMouseOver={e => e.currentTarget.firstChild.src = suggest_filled}
          onMouseLeave={e => e.currentTarget.firstChild.src = suggest}
          onClick={e => this.showSuggestionModal()}>
          <img id="suggestion-icon" src={suggest} alt="suggest" />
          <p id="suggest-count">{this.state.suggestions}</p>
        </div>
      )
    }
  }

  calculateTime(thisPost){
    const monthNames = ["January", "February", "March", "April", "May", "June",
    "July", "August", "September", "October", "November", "December"];
    const time_created = thisPost.created;
    const parsedDate = new Date(time_created);
    let time_diff = Math.ceil(((new Date().getTime()) - parsedDate)/1000);
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
      // return (<p id="time-tag"> • {parsedDate}</p>);
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

  render() {
    const post = this.props.post
    const FANTASTIC_URL = window.location.hostname === "localhost" ? "" : "/hci/teams/fantastic";
    const API_URL = "https://webdev.cse.buffalo.edu";
    // console.log(this.state.comments, this.state.suggestions);
    // console.log(this.props)
    let {commentCount, suggestionCount} = this.props;
    // console.log(commentCount, suggestionCount);
    // console.log('photo' in post.attributes);
    if (this.state.is_loaded) {
      return (
          <div class="one-post" key={post.id}>
            <div class="post-content">
              <div id="post-author">
                        <div className="single-post-author-mini">
                            {/* <img className="single-post-pfp" style={{display: "block", borderRadius: "50%"}} src={this.state.post.author.attributes.profile_picture} alt="Crave Mascot"/> */}
                            {this.state.post.author.attributes.profile_picture ? <img className="single-post-pfp" style={{display: "block", borderRadius: "50%"}} src={this.state.post.author.attributes.profile_picture} alt="Crave Mascot"/> : <img className="single-post-pfp" style={{display: "block", borderRadius: "50%"}} src={profilePic_0} alt="Crave Mascot"/>}

                            <div style={{width: "100%"}}>
                                <a href={FANTASTIC_URL + "/profile/"+this.state.post.author.id} id="display-name">{this.state.post.author.attributes.displayname || this.state.post.author.attributes.username}</a><br />
                                <a href={FANTASTIC_URL + "/profile/"+this.state.post.author.id} id="tag-name">@{this.state.post.author.attributes.username}</a>
                            </div>
                        </div>
                <h1>
                  {this.props.post.attributes.post_title}
                  {this.calculateTime(post)}
                </h1>
                {/* {String(sessionStorage.getItem("user")) == String(post.author.id) && <img style={{width: "1em", height: "auto"}} onClick = {(e) => (e.stopPropagation(), this.toggleMenu(e, true, post.id))} id="postOptions-icon" src={post_dots}/>}
                {this.state.postMenu && String(this.state.postMenuID) == String(post.id) && <div id = "postMenu">
                  <div id="edit" onClick={(e) => this.showEditModal(e, post.id)}><p>Edit</p></div>
                  <div onClick = {(e) => this.deletePost(e, post.id)}><h1>Delete</h1></div>
                </div>} */}
              </div>
              <div class="single-post">
                { ('photo' in post.attributes && post.attributes['photo'] != "") ? <img id="post-img" src={API_URL + post.attributes.photo} alt="macaron"/>: null}
                {/* <img id="post-img" src={API_URL + post.attributes.photo} alt="macaron"/> */}
                <p style={{fontSize:"28px", textAlign: "justify"}} alt="post-summary">{this.props.post.attributes.post_summary}</p>
                <p style={{fontSize:"18px", textAlign: "justify"}} alt="post-detail">{this.props.post.content}</p>
                <br />
              </div>
            </div>
            <div class="user-options">
                {this.load_likes(this.state.post)}
                {this.load_comments(this.state.post)}
                {this.load_suggestions(this.state.post)}
                {this.load_bookmarks(post)}
            </div>
            <div className={this.showHideComments()}>
              <CommentForm
                onAddComment={this.setCommentCount}
                parent={this.props.post.id}
                commentCount={this.getCommentCount()}
                post_type="comment"
              />
            </div>
            <div className={this.showHideSuggestions()}>
              <CommentForm
                onAddComment={this.setSuggestionCount}
                parent={this.props.post.id}
                commentCount={this.getSuggestionCount()}
                post_type="suggestion"
              />
            </div>
          </div>
      );
    } else {
      return(
      <div>Loading...</div>
      )
    }
  }
}
