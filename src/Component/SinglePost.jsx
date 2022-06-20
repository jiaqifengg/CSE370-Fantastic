import React from "react";
import Post from "./Post.jsx"
import "../styles/standard.css" ;
import profilePic_0 from "../assets/profilePic_0.png";


const FANTASTIC_URL = window.location.hostname === "localhost" ? "" : "/hci/teams/fantastic";

export default class SinglePost extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            post: null,
            comments: [],
            postid: null,
            comment_count: 0,
            suggestion_count: 0,
            isLoaded: false,
            isLoaded2: false,
        };
        this.PostingList = React.createRef();
    }    
    // This is the function that will get called the first time that the component gets rendered.  This is where we load the current
    componentDidMount() {
        this.getParentPost();
        // console.log("working");
    }

    getCommentSuggestion() {
        let isLoaded2 = false;
        fetch(process.env.REACT_APP_API_PATH + `/posts?parentID=${this.state.post.id}&sort=newest`, {
            method: "GET",
            headers: {
            'Content-Type': 'application/json',
            'Authorization': 'Bearer '+sessionStorage.getItem("token")
            },
        })
        .then(res => res.json())
        .then(
            result => {
                let comment_count = 0;
                let suggestion_count = 0;
                let children = result[0];
                for (let i = 0; i < result[1]; i++) {
                    if (children[i].attributes) {
                        if (children[i].attributes.type === "suggestion") {
                            suggestion_count++;
                        }
                        if (children[i].attributes.type === "comment") {
                            comment_count++;
                        }
                    }
                }
                isLoaded2 = true;
            this.setState({suggestion_count, comment_count, isLoaded2});
        })
    }

    getParentPost() {
        let pathname = window.location.pathname;
        let location = pathname.split("/");
        let id = location[location.length - 1];

        // if the user is not logged in, we don't want to try loading posts, because it will just error out.  
        if (sessionStorage.getItem("token")){
            let url = process.env.REACT_APP_API_PATH+"/posts/" + id;
            // console.log("working");
            // if there is a parentid passed in, then we are trying to get all the comments for a particular post or comment, so
            // we will restrict the fetch accordingly.
            if (this.props && this.props.parentid){
            url += this.props.parentid;
            }
            fetch(url, {
            method: "get",
            headers: {
                'Content-Type': 'application/json',
                'Authorization': 'Bearer '+sessionStorage.getItem("token")
            },
            })
            .then(res => res.json())
            .then(
                result => {
                if (result) {
                    this.setState({
                    isLoaded: true,
                    post: result
                    });
                }; console.log(result);
                },
                error => {
                this.setState({
                    isLoaded: true,
                    error
                });
                }
            );
            }
    }

    render() {
        const parentPost = this.state.post;
        if (this.state.isLoaded && !this.state.isLoaded2) {
            this.getCommentSuggestion();
        }

        if (parentPost != null && parentPost.attributes != null && this.state.isLoaded2) {
            // if(!('type' in parentPost.attributes)){
            //     return(
            //         <div>
            //             Post not found.
            //         </div>
            //     );
            // }
            // console.log(parentPost);
            // console.log("post:", this.state.post);
            if (parentPost.attributes.type == "comment"){
                return(
                    <div>
                    No post found.
                    </div>
                );
            }
            
            // let comment_count = 0;
            // let suggestion_count = 0;
            // console.log(this.state.comment_count, this.state.suggestion_count);

            return(
                <div className="columns">
                    <div className="single-post-author-large" style={{flexDirection: "column", alignItems: "center"}} id="sidebar-left">
                        {/* <div style={{width: "80%", height: "0", paddingBottom: "80%", display: "block"}}> */}
                        <img style={{width: "80%", height: "auto", display: "block", borderRadius: "50%"}} src={this.state.post.author.attributes.profile_picture} alt="Crave Mascot"/>
                        {/* </div> */}
                        <div style={{width: "100%"}}>
                            <a href={FANTASTIC_URL + "/profile/"+this.state.post.author.id} id="display-name">{this.state.post.author.attributes.displayname || this.state.post.author.attributes.username}</a>
                            <a href={FANTASTIC_URL + "/profile/"+this.state.post.author.id} id="tag-name">@{this.state.post.author.attributes.username}</a>
                        </div>
                    </div>
                    <div id="main-content">
                        {/* Post id - {this.state.post.id} */}
                        <Post key={this.state.post.id} post={this.state.post} type={this.props.type} loadPosts={this.loadPosts} commentCount={this.state.comment_count} suggestionCount={this.state.suggestion_count}/>
                    </div>
                    <div id="sidebar-right"></div>
                </div>
            );
        } else {
            return(
                <div>
                    No post found.
                </div>
            );
        }
    }
}