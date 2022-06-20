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
import profilePic_0 from "../assets/profilePic_0.png";


/* This will render a single post, with all of the options like comments, delete, tags, etc.  In the harness, it's only called from PostingList, but you could
  also have it appear in a popup where they edit a post, etc. */
export default class Post extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      showCommentModal: false,
      comments: this.props.post.commentCount,
      showTags: this.props.post.reactions.length > 0,
      post: this.props.post,
    };
    this.post = React.createRef();
  }

  showCommentModal = e => {
    this.setState({
      showCommentModal: !this.state.showCommentModal,
    });
  };

  setCommentCount = newcount => {
    this.setState({
      comments: newcount
    });
  };

  getCommentCount() {
    if (!this.state.comments || this.state.comments === "0") {
      return 0;
    }
    return parseInt(this.state.comments);
  }

  // this will toggle the CSS classnames that will either show or hide the comment block
  showHideComments() {
    if (this.state.showCommentModal) {
      return "comments show";
    }
    return "comments hide";
  }

  showModal = e => {
    this.setState({
      showModal: !this.state.showModal
    });
  };

  showTags = e => {
    this.setState({
      showTags: !this.state.showTags
    });
  };

  setCommentCount = newcount => {
    this.setState({
      comments: newcount
    });
  };

  getCommentCount() {
    if (!this.state.comments || this.state.comments === "0") {
      return 0;
    }
    return parseInt(this.state.comments);
  }

  // this is the simplest version of reactions; it's only mananging one reaction, liking a post.  If you unlike the post, 
  // it deletes the reaction.  If you like it, it posts the reaction.  This will almost certainly be made more complex
  // by you, where you will account for multiple different reactions.  Note that in both cases, we reload the post afterwards to
  // show the updated reactions.

  tagPost(tag, thisPostID){
     if (this.props.post.reactions.length > 0){
      //make the api call to post
      fetch(process.env.REACT_APP_API_PATH+"/post-reactions/"+this.props.post.reactions[0].id, {
        method: "DELETE",
        headers: {
          'Content-Type': 'application/json',
          'Authorization': 'Bearer '+sessionStorage.getItem("token")
        },
      })
        .then(
          result => {
            this.props.loadPosts();
          },
          error => {
            alert("error!"+error);
          }
        );
     }else{
     //make the api call to post
     fetch(process.env.REACT_APP_API_PATH+"/post-reactions", {
      method: "POST",
      headers: {
        'Content-Type': 'application/json',
        'Authorization': 'Bearer '+sessionStorage.getItem("token")
      },
      body: JSON.stringify({
        reactorID: sessionStorage.getItem("user"),
        postID: thisPostID,
        name: "like"
      })
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
  }

  // this will toggle the CSS classnames that will either show or hide the comment block
  showHideTags() {
    if (this.state.showTags) {
      if (this.props.post.reactions.length > 0){
        console.log("Had a reaaction");
        return "tags show tag-active"
      }
      return "tags show";
    }
    return "tags hide";
  }


  deletePost(postID) {
    //make the api call to post
    fetch(process.env.REACT_APP_API_PATH+"/posts/"+postID, {
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

  load_comments(thisPostInfo){
    // console.log(this.state.comments);
    return(
      <div className="iconDiv" title="comment" id={'comment-' + thisPostInfo.id}
        onMouseOver={e => e.currentTarget.firstChild.src = comment_filled}
        onMouseLeave={e => e.currentTarget.firstChild.src = comment}
        onClick={e => this.showCommentModal()}>
        <img id="comment-icon" src={comment} alt="View Comments"/>
        <p id="comment-count">{this.state.comments}</p>
      </div>
    )
  }

  calculateTime(thisPost){
    const monthNames = ["January", "February", "March", "April", "May", "June",
    "July", "August", "September", "October", "November", "December"];
    const time_created = thisPost.created;
    const parsedDate = new Date(time_created);
    let time_diff = Math.ceil(((new Date().getTime()) - parsedDate)/1000);
    if(time_diff < 60){
      return (`${time_diff}s`);
    }else if(time_diff > 60 && time_diff < 120){
      return (`1 min`);
    }else if(time_diff > 120 && time_diff < (60 * 60)){
      const mins = Math.ceil(time_diff/60);
      return (`${mins} minutes`);
    }else if(time_diff >= (60 * 60) && time_diff < (120 * 60)){ // 
      return (`1 hr`);
    }else if(time_diff >= 120 * 60 && time_diff <= (24 * 60 *60)){
      const hr = Math.ceil(time_diff/3600);
      return (`${hr} hrs`);
    }else{
      const month = parsedDate.getUTCMonth();
      const day = parsedDate.getUTCDate();
      const year = parsedDate.getUTCFullYear();
      return (`${monthNames[month]} ${day}, ${year}`);
      // return (<p id="time-tag"> • {parsedDate}</p>);
    }
  }

  render() {

    return (
      <div className="commentbody" style={{width: "100%"}}>
        <div
          key={this.props.post.id}
          className={[this.props.type, "postbody"].join(" ")}
          style={{flexDirection: "row", paddingBottom: "0", justifyContent: "flex-start"}}
        >
          {/* <div className="deletePost">
            <div style={{display: "flex", justifyContent: "flex-start", alignItems: "center"}}>
              <img style={{width: "2em", height: "2em", borderRadius: "2em"}} src={this.props.post.author.attributes.profile_picture} alt="" />
              <p style={{marginLeft: "1em"}}><strong>@{this.props.post.author.attributes.username}</strong> • <span>{this.calculateTime(this.props.post)}</span></p>
            </div>
           
            {this.showDelete()}
          </div> */}

          
            <div style={{marginRight: "3em"}}>
              { this.props.post.author.attributes.profile_picture ? <img style={{width: "3em", height: "3em", borderRadius: "2em"}} src={this.props.post.author.attributes.profile_picture} alt=""/> : <img style={{width: "3em", height: "3em", borderRadius: "2em"}} src={profilePic_0} alt=""/> }
            </div>

            <div style = {{width: "100%"}}>
              <div style={{display: "flex", justifyContent: "flex-start", alignItems: "center"}}>
                <p><strong>@{this.props.post.author.attributes.username}</strong> • <span>{this.calculateTime(this.props.post)}</span></p>
              </div>

              <div style={{marginBottom: "2em"}}>
                {this.props.post.content}
              </div>

              <div class="user-options">
                  {this.load_likes(this.state.post)}
                  {this.load_comments(this.state.post)}
              </div>

              <div className={this.showHideComments()}>
                <CommentForm
                  onAddComment={this.setCommentCount}
                  parent={this.props.post.id}
                  commentCount={this.getCommentCount()}
                  post_type="comment"
                />
              </div>
            </div>
            
           
            {/* {this.showDelete()} */}
                 


          {/* <br /> */}
          {/* <div class="user-options">
            {this.load_likes(this.state.post)}
            {this.load_comments(this.state.post)}
          </div>
          <div className={this.showHideComments()}>
              <div style={{display: "flex"}}>
                <div style={{paddingLeft: "1em"}}></div>
                <CommentForm
                  onAddComment={this.setCommentCount}
                  parent={this.props.post.id}
                  commentCount={this.getCommentCount()}
                  post_type="comment"
                />

              </div>
              
            </div> */}
        </div>
      </div>
    );
  }
}
