import React from "react";
import "../styles/EditPost.css";
import PropTypes from "prop-types";

//This modal/ pop up used for user to edit their existing post
export default class EditPost extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            // post_text => The actual post content
            post_text: "",
            post_title: "",
            post_sum: "",
            privacy: "everyone",
            //post_message used to display if post was successful or not from status of fetch call
            response_msg: "",
            //To hold the photos the user wants to upload with the post
            photo: "",
            success_msg: {},
            errors: {},
            imagePreview: false,
            imageFile: false,
        };
    }
    onCloseEdit = e => {
        this.props.onCloseEdit && this.props.onCloseEdit(e);
    };
    
    componentDidMount() {
        this.setState({
            post_text: this.props.post.content,
            post_sum: this.props.post.attributes.post_summary,
            post_title: this.props.post.attributes.post_title,
            photo: this.props.post.attributes.photo,
            privacy: this.props.post.attributes.privacy
        });
    }

    //Edit post by fetch PATCH post call here
    editPhotoTextPost = event => {
        const formData = new FormData();
        const fileField = document.querySelector('input[type="file"]');

        formData.append('uploaderID', sessionStorage.getItem("user"));
        formData.append('attributes', JSON.stringify("Post Content Image"));
        formData.append('file', fileField.files[0]);
        fetch("https://webdev.cse.buffalo.edu/hci/api/api/fantastic/file-uploads",{
            method:'POST',
            headers:{
                'Authorization':'Bearer '+ sessionStorage.getItem("token")
            },
            body: formData
        }).then(response => response.json())
            .then(result => {
                this.setState({
                    photo: result.path
                }, () => this.editTextPost());
            })
            .catch(error => {
                console.error('Error:', error);
            })
    }
    editTextPost() {
        let success = {};
        fetch(process.env.REACT_APP_API_PATH + "/posts/" + this.props.CurrentPostId, {
            method: "PATCH",
            headers: {
                'Content-Type': 'application/json',
                'Authorization': 'Bearer ' + sessionStorage.getItem("token")
            },
            body: JSON.stringify({
                content: this.state.post_text,
                attributes: {
                    type: "post",
                    post_title: this.state.post_title,
                    post_summary: this.state.post_sum,
                    photo: this.state.photo,
                    privacy: this.state.privacy
                }
            })
        }).then(res => res)
            .then(
                result => {
                    this.setState({response_msg: result.Status});
                    if (result) {
                        success["post_updated"] = "Post updated!";
                        this.setState({success_msg: success}, this.onCloseEdit());
                    }
                }, error => {
                    error["post_failed"] = "Post update failed!";
                    this.setState({errors: error});
                })
    }
    submitHandler = (e) => {
        e.preventDefault();
        if (this.state.imageFile){
            this.editPhotoTextPost();
        }
        else{
            this.editTextPost();
        }
    };

    FieldChangeHandler(field, e)  {
        this.setState({
            [field]: e.target.value
        });

    };

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
        if (!this.props.showEdit) {
            return null;
        }
        return (
            <div id="editPost" className="editPost">
                <div className="editPost-content">
          <span className="close" onClick={this.onCloseEdit}>
            &times;
          </span>
                <div id="editcontent">{this.props.children}</div>
                <div id="editForm">
                    <form onSubmit={this.submitHandler}><br/>
                    <label>Edit Post</label><br/>
                    <div id="post-Title">
                        <input type="text"
                            onChange={e => this.FieldChangeHandler("post_title", e)}
                            defaultValue={this.props.post.attributes.post_title} />
                    </div>
                    <div id="post-sum">
                    <label>Post Summary (Optional)</label> <br/>
                        <textarea defaultValue={this.props.post.attributes.post_summary}
                        onChange={e => this.FieldChangeHandler("post_sum", e)} />
                    </div>
                    <div id="post-details">
                        <label>Post Details <span className="required">&#42; (Required)</span>
                            <textarea defaultValue={this.props.post.content}
                             onChange={e => this.FieldChangeHandler("post_text", e)} />
                         </label>
                    </div>
                <div id="privacy">
                <label for="privacyOptions">Post Privacy: </label>
                <select name="privacy" id="privacy" defaultValue={this.props.post.attributes.privacy} onChange={this.dropdownHandler}>
                <optgroup>
                <option value="everyone">Everyone</option>
                <option value="followers">Followers</option>
                </optgroup>
                </select>
                </div>
                {/*UPLOAD IMAGE SECTION*/}
                     <div id="upload-pics">
                       <label>Upload Pics</label>  <p> (Only JPEG/JPG/PNG)</p>
                            {this.state.photo && <img style = {{height: "80px"}} src={"https://webdev.cse.buffalo.edu" + this.props.post.attributes.photo} alt="file"/>}
                            <input type="file" onChange={this.uploadImage}/> <br/>
                     </div>
                    <div id="postButton">
                        <input type="submit" value="Update" />
                     </div>
                     <div id="success">
                        {this.state.success_msg.post_updated}
                        </div>
                    <div id="failed">
                        {this.state.errors.post_failed}
                    </div>
                     </form>
                    </div>
                </div>
            </div>
        );
    }
}
EditPost.propTypes = {
    onCloseEdit: PropTypes.func.isRequired,
    showEdit: PropTypes.bool.isRequired,
    CurrentPostId: PropTypes.number.isRequired,
    post: PropTypes.any
};