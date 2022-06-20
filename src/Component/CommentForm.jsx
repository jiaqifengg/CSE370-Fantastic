import React from "react";
import "../App.css";
import "../styles/Comment.css";
import CommentListing from "./CommentList.jsx";
import { useEffect } from "react";

export default class CommentForm extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      post_text: "",
      postmessage: ""
    };
    this.postListing = React.createRef();
    
    this.listener = event => {
      if (event.code === "Enter" || event.code === "NumpadEnter") {
        event.preventDefault();
        this.submitHandler();
        document.getElementById('comment-textarea').textContent = "";
        document.getElementById('suggestion-textarea').textContent = "";
        this.setState({
          post_text: "",
        });
      }
    };
  }  

  componentDidMount() {
    document.addEventListener("keydown", this.listener);
  }

  componentWillUnmount() {
    document.removeEventListener("keydown", this.listener);
  }

  submitHandler = event => {
    //keep the form from actually submitting
    // event.preventDefault();

    // check if the content is empty before sending it
    if (this.state.post_text.replace(/\s/g,'') == "") {
      return;
    }

    let type = this.props.post_type;

    // let type = "comment";

    // if (this.props.post_type === "suggestion") {
    //   type = "suggestion";
    // }

    //make the api call to the authentication page
    fetch(process.env.REACT_APP_API_PATH+"/posts", {
      method: "post",
      headers: {
        'Content-Type': 'application/json',
        'Authorization': 'Bearer '+sessionStorage.getItem("token")
      },
      body: JSON.stringify({
        authorID: sessionStorage.getItem("user"),
        content: this.state.post_text,
        parentID: this.props.parent,
        thumbnailURL: "",
        type: "post",
        attributes: {
          type: type
        }
      })
    })
      .then(res => res.json())
      .then(
        result => {
          // update the count in the UI manually, to avoid a database hit
          this.props.onAddComment(this.props.commentCount + 1);
          this.postListing.current.loadPosts();
        },
        error => {
          alert("error!");
        }
      );
  };

  // event handler for textarea
  myChangeHandler = event => {
    this.setState({
      post_text: event.target.textContent
    });
  };

  render() {
    let form_id = "comment-textarea";
    if (this.props.post_type === "suggestion") {
      form_id = "suggestion-textarea";
    }

    return (
      <div className="comment-form">
        <form className="comment-form-form" onSubmit={this.submitHandler}>
          <div style={{display: "flex", justifyContent: "space-between", width: "100%"}}>
            <span id={form_id} type="submit" className="textarea" contentEditable="true" onInput={this.myChangeHandler}></span>
            {/* <div style={{display: "flex", flexDirection: "column", justifyContent: "flex-end"}}>
              <input style={{height: "25px", width: "60px"}} type="submit" value="submit" />
            </div> */}
          </div>
          
          {this.state.postmessage}
        </form>
        <CommentListing
          ref={this.postListing}
          parentid={this.props.parent}
          type="commentlist"
          post_type={this.props.post_type}
        />
      </div>
    );
  }
}
