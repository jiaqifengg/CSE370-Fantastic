import { React, useState, useEffect, useRef } from "react";
import "./Message.css";
import newMessage from '../assets/newMessage.png'

const FANTASTIC_URL = window.location.hostname === "localhost" ? "" : "/hci/teams/fantastic";
const userID = sessionStorage.getItem("user")
const userEmail = sessionStorage.getItem("email")
  /*   {"name": String(userID),
    "name": "7|29",
    "attributes": {
      "type": "message",
      "user": {
        "baronhua@buffalo.edu": 29,
        "test@test.com": 7
      },
      "log": [
        {
          "email": "test@test.com",
          "message": "hello!",
          "time": "temporaryTime"
        },
        {
          "email": "baronhua@buffalo.edu",
          "message": "how are you doing?",
          "time": "temporaryTime"
        },
        {
          "email": "baronhua@buffalo.edu",
          "message": "third message",
          "time": "temporaryTime"
        }
      ]
    }
  }} */
let initialChatSchema = (uID, userObj) => {
    return ({
      "name": String(uID),
      "attributes": {
        "type": "message",
        "user": {
            /* "email": userObj.email,
            "userID": userObj.userID,
            "chatID": userObj.chatID,
            "picturePath": userObj.pp */ //"/hci/api/uploads/files/UwoidJUgl8enSIudqzWUnwg-mioQL9vTmsRZF5nmFTE.png"
        }
      }
    })
  }

let createInitialMiddleSchema = (recID, recEmail, chatID, pp, schema) => {
  schema.attributes.user[recEmail] = {"userID": recID, "chatID": chatID, "picturePath": pp}
  return schema
}

let makeChatName = (a, b) => {
  if (a < b) {
    return (String(a) + '|' + String(b))
  }
  else {
    return (String(b) + '|' + String(a))
  }
}

let createInitialLogSchema = (recID, recEmail, outMessage) => {
  let initLogSchema = {}
  let userInfo = {} 
  userInfo[userEmail] = userID
  userInfo[recEmail] = String(recID)
  initLogSchema["name"] = makeChatName(userID, recID)
  initLogSchema["attributes"] = {"type": "message",
                                 "user": userInfo,
                                 "log": [{"email": userEmail, "message": outMessage, "time": "temporaryTime"}]}
  return initLogSchema
}

let addToChatLogSchema = (email, message, schema) => {
  //Append with format {"email": "", "message": "", "time": ""}
  schema.attributes.log.push({"email": email, "message": message, "time": "temporaryTime"})
  return schema
} 

/* 

*/

function Message(props) {
    let [msgInput, setMsgInput] = useState('')
    let [userInteracted, setUserInteracted] = useState(false) //{'email': {'id': etc}}  List of all users and respected userID + chatID
    let [userInteractedFiltered, setUserInteractedFiltered] = useState(false) //List of all searched users
    let [initMiddleSchema, setInitMiddleSchema] = useState([]) //Schema for patching
    let [chatDataSchema, setChatDataSchema] = useState(false) //Schema for message patching

    let [createOverlay, setCreateOverlay] = useState(false) //Is create new chat overlay open //True
    let [createUser, setCreateUser] = useState(false) //Did user click on a new user to talk to //baronhua@buffalo.edu
    let [createNewFace, setCreateNewFace] = useState(false) //Is that user someone the user already talked to //True
    //If answer is true, "email", true => New chat interface
    // true, "email", false => Bring up old messages
    let [allUsers, setAllUsers] = useState([])
    let [sortNewUsers, setSortNewUsers] = useState([])
    let [sortNewUsersFiltered, setSortNewUsersFiltered] = useState([])

    let [selectedUser, setSelectedUser] = useState(false)
    let [selectedMessage, setSelectedMessage] = useState(false)
    let [outgoingMessage, setOutgoingMessage] = useState(false)

    useEffect (() => {
      initAll()
      //deleteAll()
      fetchAllUsers([])
      fetchUserDataSchema(userID, true)
    }, [])

    useEffect (() => {
        setUserInteractedFiltered(userInteracted)
    }, [userInteracted])

    let deleteAll = () => {
      fetch(process.env.REACT_APP_API_PATH + `/groups`, {
        method: "GET",
        headers: {
            'Content-Type': 'application/json',
            'Authorization': "Bearer " + sessionStorage.getItem("token"),
        },
        })
        .then(res => res.json())
        .then(
            result => {
              for (let u of result[0]) {
                let id = u.id
                fetch(process.env.REACT_APP_API_PATH + `/groups/${id}`, {
                  method: "DELETE",
                  headers: {
                      'Content-Type': 'application/json',
                      'Authorization': "Bearer " + sessionStorage.getItem("token"),
                  },
                  })
                  .then(res => res.json())
                  .then(
                      result => {
                      }
                  )
              }
            }
        )
    }

    let initAll = () => {
      fetch(process.env.REACT_APP_API_PATH + `/users`, {
        method: "get",
        headers: {
            'Content-Type': 'application/json',
            'Authorization': "Bearer " + sessionStorage.getItem("token"),
        },
        })
        .then(res => res.json())
        .then(
            result => {
              for (let u of result[0]) {
                let id = u.id
                fetch(process.env.REACT_APP_API_PATH + `/groups?name=${id}`, {
                  method: "get",
                  headers: {
                      'Content-Type': 'application/json',
                      'Authorization': "Bearer " + sessionStorage.getItem("token"),
                  },
                  })
                  .then(res => res.json())
                  .then(
                      result => {
                        if (result[1] == 0) {
                          let schema = {
                            "name": String(id),
                            "attributes": {
                               "type": "message",
                               "user": {}
                               }
                            }
                          fetch(process.env.REACT_APP_API_PATH + `/groups`, {
                            method: "POST",
                            headers: {
                                'Content-Type': 'application/json',
                                'Authorization': "Bearer " + sessionStorage.getItem("token"),
                            },
                            body: JSON.stringify(schema)
                            })
                            .then(res => res.json())
                            .then(
                                result => {
                    
                                }
                            )
                        }
                      }
                  )
              }
            }
        )
    }

    let fetchUserDataSchema = (uID, init) => {
        // Need to implement adding to secondary user after fetchs
        if (sessionStorage.getItem("token")) {
            fetch(process.env.REACT_APP_API_PATH + `/groups?name=${uID}`, {
            method: "get",
            headers: {
                'Content-Type': 'application/json',
                'Authorization': "Bearer " + sessionStorage.getItem("token"),
            },
            })
            .then(res => res.json())
            .then(
                result => {
                    if (result[1] > 0) { //User has previously messaged others
                        let data = result[0][0]
                        if (userID == uID) {
                          setInitMiddleSchema(data) //Schema for patching
                          setUserInteracted(data.attributes.user)
                          if (init) {
                            fetchAllUsers(Object.keys(data.attributes.user))
                          }
                        }
                    }
                    /* else { //User has not previously messaged others
                      let initSchema = JSON.stringify(initialChatSchema(uID, {"email": userObj.email, "userID": userObj.userID, "chatID": userObj.chatID, "picturePath": ""}))
                      fetch(process.env.REACT_APP_API_PATH + "/groups", {
                          method: "POST",
                          headers: {
                            'Content-Type': 'application/json',
                            'Authorization': 'Bearer ' + sessionStorage.getItem("token")
                          },
                          body: initSchema
                        })
                        .then(res => res)
                        .then(
                          result => {
                            if (result) {

                            }
                          }
                        )
                    } */
                })
            }
    }

    let fetchAllUsers = (arr) => {
      fetch(process.env.REACT_APP_API_PATH + "/users", {
        method: "GET",
        headers: {
          'Content-Type': 'application/json',
          'Authorization': 'Bearer ' + sessionStorage.getItem("token")
        },
      })
      .then(res => res.json())
      .then(
        result => {
          if (result) {
            let re = result[0]
            let dic = {}
            for (let u of re) {
              dic[u.email] = {"id": u.id, "attributes": u.attributes}
            }
            setAllUsers(dic)

            let dicFiltered = {}
            for (let u of re) {
              if (!arr.includes(u.email) && u.email != userEmail) {
                dicFiltered[u.email] = {"id": u.id, "attributes": u.attributes}
              }
            }
            setSortNewUsers(dicFiltered)
            setSortNewUsersFiltered(dicFiltered)
          }
        }
      )
    }

    let filterUserList = (e) => {
        let key = e.target.value
        setUserInteractedFiltered(Object.keys(userInteracted).filter((email) => email.includes(key)).reduce((newObj, email) => { return Object.assign(newObj, { [email]: userInteracted[email] })}, {}))
    }

    let switchCreateMessageOff = (email) => {
      let user = {}
      user["email"] = email
      user["id"] = allUsers[email].id
      setCreateOverlay(false)
      setCreateNewFace(false)
      setCreateUser(false)
      setSelectedUser(user.email)
      grabExistingChat(user)
    }

    let displayUsers = () => {
        return (
            Object.keys(userInteractedFiltered).map((email) => {
                return(
                <a id = "messageUserMapper" onClick = {() => switchCreateMessageOff(email)}> 
                  {allUsers[email] && allUsers[email].attributes && <h1 >{allUsers[email].attributes.username ? allUsers[email].attributes.username : email}</h1>}
                  {allUsers[email] && !allUsers[email].attributes && <h1>{email}</h1>}
                </a>
                )
            })
        )
    }

    let setCreationOverlay = () => {
      setCreateOverlay(!createOverlay)
      setSelectedMessage(false)
      setSelectedUser(false)
      if (createNewFace) {
        setCreateNewFace(false)
      }
      if (createUser) {
        setCreateUser(false)
      }
    }

    let iterateUserDropdown = () => {
      return(
      Object.keys(sortNewUsersFiltered).map((email) => {
        return (
          <option key = {email} value = {email}>
            {sortNewUsers[email].attributes ? sortNewUsers[email].attributes.username : email}
          </option>
        )
      }) 
      )
    }

    let createSelector = (e) => {
      let user = {}
      user["email"] = e.target.value
      user["id"] = allUsers[e.target.value].id
      setCreateUser(user)
      if (!Object.keys(userInteracted).includes(e.target.value)) {
        setCreateNewFace(true)
      }
      else {
        setCreateNewFace(false)
        grabExistingChat(user)
      }
    }

    let filterNewUsers = (e) => {
      let key = e.target.value
      setSortNewUsersFiltered(Object.keys(sortNewUsers).filter((email) => email.includes(key)).reduce((newObj, email) => { return Object.assign(newObj, { [email]: sortNewUsers[email] })}, {}))
    }

    let newMessageChatBox = () => {
      return (
        <div >
          <p>You have no prior interactions with the user {createUser.email}</p>
          <input placeholder="Type your message" onChange = {(e) => setMsgInput(e.target.value)} onKeyDown={event => {
                if (event.key === 'Enter') {
                  initChatMaker()
                }}}></input>
          <button onClick = {() => (initChatMaker())} >Send message</button>
        </div>
      )
    }

    let addToMiddleSchemaPatch1 = (primary, secondary) => {
      fetch(process.env.REACT_APP_API_PATH + "/groups?name=" + String(primary.userID), {
        method: "GET",
        headers: {
          'Content-Type': 'application/json',
          'Authorization': 'Bearer ' + sessionStorage.getItem("token")
        },
      })
      .then(res => res.json())
      .then(
        result => {
          if (result[1] > 0) {
            let schema = result[0][0]
            let id = result[0][0].id
            schema.attributes.user[secondary.email] = {"userID": secondary.userID, "chatID": secondary.chatID, "picturePath": ""}
            addToMiddleSchemaPatch2(id, schema)
          }
        }
      )
    }

    let addToMiddleSchemaPatch2 = (user, schema) => {
      fetch(process.env.REACT_APP_API_PATH + "/groups/" + String(user), {
        method: "PATCH",
        headers: {
          'Content-Type': 'application/json',
          'Authorization': 'Bearer ' + sessionStorage.getItem("token")
        },
        body: JSON.stringify(schema)
      })
      .then(res => res.json())
      .then(
        result => {
          if (result) {
            fetchUserDataSchema(userID, false)
            setCreateOverlay(false)
            grabExistingChat({"email": String(createUser.email), "id": createUser.id})
          }
        }
      )

    }
    
    //initChatMaker (Creates log schema) => Need to patch the middlemanSchema
    let initChatMaker = () => {
      //msgInput, createUser, userID, userEmail
      //Middleman schema can only be updated once log is established
      //CreateUser is other user
      if (msgInput.length > 0) {
        //Need to patch on other user
        let logSchema = createInitialLogSchema(createUser.id, createUser.email, msgInput)

        //Creates new chat log or patches
        fetch(process.env.REACT_APP_API_PATH + "/groups", {
          method: "POST",
          headers: {
            'Content-Type': 'application/json',
            'Authorization': 'Bearer ' + sessionStorage.getItem("token")
          },
          body: JSON.stringify(logSchema)
        })
        .then(res => res.json())
        .then(
          result => {
            if (result) {
              let chatID = result.id
              let secondaryUser = {"email": createUser.email, "userID": String(createUser.id), "chatID": chatID, "picturePath": ""}
              let primaryUser = {"email": userEmail, "userID": String(userID), "chatID": chatID, "picturePath": ""}
              //let middleSchema = createInitialMiddleSchema(createUser.id, createUser.email, chatID, "", initMiddleSchema)
              addToMiddleSchemaPatch1(primaryUser, secondaryUser)
              addToMiddleSchemaPatch1(secondaryUser, primaryUser)
              setMsgInput("")
          }
        }
      )
    }
  }

    let grabExistingChat = (user) => {
      //user in format of {"email": "", "id": 1}
      let name = ''
      if (userID < user.id) {
        name = String(userID) + '%7C' + String(user.id)
      }
      else {
        name = String(user.id) + '%7C' + String(userID)
      }
      fetch(process.env.REACT_APP_API_PATH + "/groups?name=" + name, {
        method: "GET",
        headers: {
          'Content-Type': 'application/json',
          'Authorization': 'Bearer ' + sessionStorage.getItem("token")
        },
      })
      .then(res => res.json())
      .then(
        result => {
          if (result) {
            setChatDataSchema(result[0][0])
            setSelectedMessage(result[0][0].attributes.log)
            setSelectedUser(user.email)
          }
        })
    }

    let displayExistingChat = () => {
      return(
        selectedMessage.map((messages) => {
          return(
            <div>
              {messages.email == userEmail ? <div className = "messageBubble" id = "outgoingMessages"><h2>{messages.email} </h2> <h3>{messages.message}</h3></div> : <div className = "messageBubble" id = "incomingMessages"><h2>{messages.email}: </h2> <h3>{messages.message}</h3></div>}
            </div>
          )
        })
      )
    }

    let patchMessageLog = () => {
      document.getElementById("outgoingInput").value = ""
      let newSchema = addToChatLogSchema(userEmail, outgoingMessage, chatDataSchema)
      fetch(process.env.REACT_APP_API_PATH + "/groups/" + String(newSchema.id), {
        method: "PATCH",
        headers: {
          'Content-Type': 'application/json',
          'Authorization': 'Bearer ' + sessionStorage.getItem("token")
        },
        body: JSON.stringify(newSchema)
      })
      .then(res => res.json())
      .then(
        result => {
          if (result) {
            switchCreateMessageOff(selectedUser)
          }
        }
      ) 
    }

    return (
        <div id = "messageParentWrapper">

            <div id = "messageUserWrapper">
                <div id = "messageUserOptionsWrapper">
                    <input placeholder = "Search here" onChange = {filterUserList}/>
                    <img id = "newMessageIcon" src = {newMessage} onClick = {setCreationOverlay}/>
                </div>
                <div id = "messageUserListWrapper">
                    {userInteractedFiltered && displayUsers()}
                </div>
            </div>

            <div id = "messageChatWrapper">
              {createOverlay ? 
                <div id = "messageCreationOverlay">
                  <br/>
                  <input onChange = {filterNewUsers} id = "filterNewUserInput" placeholder = "Search for a new user to interact with"></input> 
                  <br/>
                  <br/>
                  <select size = "10" onChange = {createSelector} style = {{width: "60%"}}>
                    {iterateUserDropdown()}
                  </select>
                  {createUser && createOverlay && createNewFace && newMessageChatBox()}
                  {createUser && createOverlay && !createNewFace && selectedMessage && selectedUser && displayExistingChat()}
                </div> :
                <div id = "messageChatInfoOverlay">
                  <div id = "messageChatScroller">
                    {!selectedUser && !createUser && <h4>Please select an user or create a new chatlog</h4>}
                    {selectedUser && selectedMessage && displayExistingChat()}
                    </div>
                  {selectedUser && selectedMessage && <div id = "outgoingMessageDiv"><input id = "outgoingInput" placeholder = "Type your message here!" onChange = {(e) => setOutgoingMessage(e.target.value)} onKeyDown={event => {
                if (event.key === 'Enter') {
                  patchMessageLog()
                }}}></input><button onClick = {patchMessageLog} >Send message!</button></div>}
                </div>}
            </div>
        </div>
    );
}

export default Message;


/* 
OG SCHEMA IN CASE WRONG PATCH:

{
      "id": 2,
      "name": "7",
      "attributes": {
        "type": "message",
        "user": {
          "baronhua@buffalo.edu": {
            "userID": 29,
            "chatID": 1
          }
        }
      }
    }

*/


/* 
[
  [
    {
      "id": 1,
      "name": "7|29",
      "attributes": {
        "type": "message",
        "user": {
          "baronhua@buffalo.edu": 29,
          "test@test.com": 7
        },
        "log": [
          {
            "email": "test@test.com",
            "message": "hello!",
            "time": "temporaryTime"
          },
          {
            "email": "baronhua@buffalo.edu",
            "message": "how are you doing?",
            "time": "temporaryTime"
          },
          {
            "email": "baronhua@buffalo.edu",
            "message": "third message",
            "time": "temporaryTime"
          },
          {
            "email": "baronhua@buffalo.edu",
            "message": "hello!",
            "time": "temporaryTime"
          },
          {
            "email": "baronhua@buffalo.edu",
            "message": "bye!",
            "time": "temporaryTime"
          }
        ]
      }
    },
    {
      "id": 2,
      "name": "7",
      "attributes": {
        "type": "message",
        "user": {
          "baronhua@buffalo.edu": {
            "userID": 29,
            "chatID": 1
          },
          "test9@test.com": {
            "userID": 19,
            "chatID": 24,
            "picturePath": ""
          },
          "dannybear@buffalo.edu": {
            "userID": 190,
            "chatID": 26,
            "picturePath": ""
          },
          "jiaqifen@buffalo.edu": {
            "userID": 1,
            "chatID": 27,
            "picturePath": ""
          },
          "test6@test.com": {
            "userID": 15,
            "chatID": 29,
            "picturePath": ""
          }
        }
      }
    },
    {
      "id": 24,
      "name": "7|19",
      "attributes": {
        "type": "message",
        "user": {
          "test@test.com": "7",
          "test9@test.com": "19"
        },
        "log": [
          {
            "email": "test@test.com",
            "message": "hello",
            "time": "temporaryTime"
          }
        ]
      }
    },
    {
      "id": 26,
      "name": "7|190",
      "attributes": {
        "type": "message",
        "user": {
          "test@test.com": "7",
          "dannybear@buffalo.edu": "190"
        },
        "log": [
          {
            "email": "test@test.com",
            "message": "buenos dias",
            "time": "temporaryTime"
          }
        ]
      }
    },
    {
      "id": 27,
      "name": "1|7",
      "attributes": {
        "type": "message",
        "user": {
          "test@test.com": "7",
          "jiaqifen@buffalo.edu": "1"
        },
        "log": [
          {
            "email": "test@test.com",
            "message": "asdasdas",
            "time": "temporaryTime"
          }
        ]
      }
    },
    {
      "id": 28,
      "name": "29",
      "attributes": {
        "type": "message",
        "user": {}
      }
    },
    {
      "id": 29,
      "name": "7|15",
      "attributes": {
        "type": "message",
        "user": {
          "test@test.com": "7",
          "test6@test.com": "15"
        },
        "log": [
          {
            "email": "test@test.com",
            "message": "hello!!!",
            "time": "temporaryTime"
          },
          {
            "email": "test6@test.com",
            "message": "bueno dias",
            "time": "temporaryTime"
          }
        ]
      }
    },
    {
      "id": 30,
      "name": "7",
      "attributes": {
        "type": "message",
        "user": {}
      }
    },
    {
      "id": 31,
      "name": "7",
      "attributes": {
        "type": "message",
        "user": {}
      }
    },
    {
      "id": 32,
      "name": "7",
      "attributes": {
        "type": "message",
        "user": {}
      }
    },
    {
      "id": 33,
      "name": "7",
      "attributes": {
        "type": "message",
        "user": {}
      }
    },
    {
      "id": 34,
      "name": "7",
      "attributes": {
        "type": "message",
        "user": {}
      }
    },
    {
      "id": 35,
      "name": "undefined",
      "attributes": {
        "type": "message",
        "user": {}
      }
    },
    {
      "id": 36,
      "name": "49",
      "attributes": {
        "type": "message",
        "user": {}
      }
    }
  ],
  14
]
*/