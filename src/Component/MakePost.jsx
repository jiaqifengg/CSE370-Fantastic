import React from "react";
import "../styles/MakePost.css";
import PropTypes from "prop-types";


// This component is an example of a modal dialog.  The content can be swapped out for different uses, and
// should be passed in from the parent class.
export default class MakePost extends React.Component {
  constructor(props){
    super(props);
    this.state = {
      // post_text => The actual post content
      post_text: "",
      post_title: "",
      post_summary: "",
      privacy: "everyone",
      //post_message used to display if post was successful or not from status of fetch call
      post_message: "",
      //To hold the photos the user wants to upload with the post
      photo: "",
      success_msg: {},
      error: {},
      imagePreview: false,
      imageFile: false,
    }
    
  }
  //For ref: https://developer.mozilla.org/en-US/docs/Web/API/Fetch_API/Using_Fetch#uploading_a_file
  uploadTextPhotoPost = () => {
    const formData = new FormData();
    //const fileField = document.querySelector('input[type="file"]');
    //keep the form from actually submitting, since we are handling the action ourselves via
    //the fetch calls to the API
    formData.append('uploaderID', sessionStorage.getItem("user"));
    formData.append('attributes', JSON.stringify("Post Content Image"));
    formData.append('file', this.state.imageFile);
    fetch(process.env.REACT_APP_API_PATH+"/file-uploads", {
      method: 'POST',
      headers: {
        //'Content-Type': 'multipart/form-data',
        'Authorization': 'Bearer '+sessionStorage.getItem("token")
      },
      body: formData
    })
        .then(response => response.json())
        .then(result => {
          this.setState({
            photo: result.path
          }, () => this.uploadTextPost());
        })
        .catch(error => {
          console.error('Error: img not uploaded:', error);
        });
  }

  onClose = e => {
    this.props.onClose && this.props.onClose(e);
  };

   // the handler for submitting a new post.  This will call the API to create a new post.
  // while the test harness does not use images, if you had an image URL you would pass it
  // in the attributes field.  Posts also does double duty as a message; if you want in-app messaging
  // you would add a recipientUserID for a direct message, or a recipientGroupID for a group chat message.
  // if the post is a comment on another post (or comment) you would pass in a parentID of the thing
  // being commented on.  Attributes is an open ended name/value segment that you can use to add 
  // whatever custom tuning you need, like category, type, rating, etc.
  uploadTextPost = () => {
    let success = {};
    let errors = {};
    //make the api call to post
    fetch(process.env.REACT_APP_API_PATH+"/posts", {
      method: "post",
      headers: {
        'Content-Type': 'application/json',
        'Authorization': 'Bearer '+sessionStorage.getItem("token")
      },
      body: JSON.stringify({
        authorID: sessionStorage.getItem("user"),
        content: this.state.post_text,
        attributes: {
          type: "post",
          post_title: this.state.post_title,
          post_summary: this.state.post_summary,
          photo: this.state.photo,
          privacy: this.state.privacy
        }
      })
    })
      .then(res => res.json())
      .then(
        result => {
          this.setState({
            post_message: result.Status
          });
          success["good_post"] = "Post was successful";
          this.setState({
            success_msg: success
          }, () => this.onClose())
        },
        error => {
          errors["post_failed"] = "Post Submission Failed!";
          this.setState({
            error: errors
          })
        }
      );
  }

  submitHandler = (e) => {
    e.preventDefault()
    if (this.state.imageFile) {
      this.uploadTextPhotoPost()
    }
    else {
      this.uploadTextPost()
    }
  };

  myChangeHandler = event => {
    this.setState({
      post_text: event.target.value
    });
  };

  postSummaryChangeHandler = event => {
    this.setState({
        post_summary: event.target.value
    })
  }

  postTitleChangeHandler = event => {
    this.setState({
      post_title: event.target.value
    })
  }

  dropdownHandler = event => {
    this.setState({
      privacy: event.target.value
    })
  }
  uploadImage = e => {
    this.setState({
      imagePreview : URL.createObjectURL(e.target.files[0]),
      imageFile : e.target.files[0]
    })
  }

  render() {
    // console.log("Modal Show is " + this.props.show);
    if (!this.props.show) {
      return null;
    }
    return (
      <div id="makePost" className="makePost">
        <div className="makePost-content">
          <span className="close" onClick={this.onClose}>
            &times;
          </span>
          <div id="modalcontent">{this.props.children}</div>
          <div id="postForm">
          <form onSubmit={this.submitHandler}>
            <br/>
          <label>Post A Recipe!</label><br/>
            <div id="post-Title">
              <input placeholder="Post Title" type="text" onChange={this.postTitleChangeHandler} />
            </div>
            <div id="post-sum">
            <label>Post Summary (Optional)</label> <br/>
              <textarea placeholder="Provide a summary of your recipe." onChange={this.postSummaryChangeHandler} />
            </div>
            <div id="post-details">
              <label>Post Details <span className="required">&#42; (Required)</span>
                <textarea placeholder="List ingredients and instructions." onChange={this.myChangeHandler} />
              </label>
            </div>
            <div id="privacy">
            <label for="privacyOptions">Post Privacy: </label>
            <select name="privacy" id="privacy" value={this.state.privacy} onChange={this.dropdownHandler}>
              <optgroup>
              <option value="everyone">Everyone</option>
              <option value="followers">Followers</option>
              </optgroup>
              </select>
              </div>
            {/*UPLOAD IMAGE SECTION*/}
            <div id="upload-pics">
              <label>Upload Pics </label> <p> (Only JPEG/JPG/PNG)</p>
                {this.state.imagePreview && <img style = {{height: "80px"}} src = {this.state.imagePreview} alt="file"/>}
                <input type="file" onChange = {this.uploadImage}/> <br/>
            </div>

            <div id="postButton">
              <input type="submit" value="Post" />
            </div>
            <div id="success">
              {this.state.success_msg.good_post}
            </div>
            <div id="failed">
              {this.state.error.post_failed}
            </div>
          </form>
          </div>
        </div>
      </div>
    );
  }
}

MakePost.propTypes = {
  onClose: PropTypes.func.isRequired,
  show: PropTypes.bool.isRequired
};
