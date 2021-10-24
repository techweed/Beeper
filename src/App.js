import React, {useRef, useState} from "react";
import "./App.css";

import firebase from "firebase/compat/app";
import "firebase/compat/firestore";
import "firebase/compat/auth";
import "firebase/compat/analytics";

import {useAuthState} from "react-firebase-hooks/auth";
import {useCollectionData} from "react-firebase-hooks/firestore";

firebase.initializeApp({
  apiKey: "AIzaSyABH8-5bGyDmUSt--hvLbVGoXyFAvWA0yQ",
  authDomain: "beeper-dd377.firebaseapp.com",
  projectId: "beeper-dd377",
  storageBucket: "beeper-dd377.appspot.com",
  messagingSenderId: "1027492538837",
  appId: "1:1027492538837:web:1aa6861d0e67c8af92f55c",
  measurementId: "G-S5VNZWKRQ4",
});

const auth = firebase.auth();
const firestore = firebase.firestore();

function App() {
  // if signedin this will return an object otherwise null
  const [user] = useAuthState(auth);

  return (
    <div className="App">
      <header>
        <h1>Beeper</h1>
        <SignOut />
      </header>

      <section>{user ? <ChatRoom /> : <SignIn />}</section>
    </div>
  );
}

function SignIn() {
  //popup signin window
  const signInWithGoogle = () => {
    const provider = new firebase.auth.GoogleAuthProvider();
    auth.signInWithPopup(provider);
  };

  return (
    <>
      <button className="sign-in" onClick={signInWithGoogle}>
        Sign in with Google
      </button>
      <p>Chat with strangers from all around the world</p>
    </>
  );
}

function SignOut() {
  return (
    auth.currentUser && (
      <button className="sign-out" onClick={() => auth.signOut()}>
        Sign Out
      </button>
    )
  );
}

function ChatRoom() {
  const dummy = useRef();
  // refernce a firestore colletion
  const messagesRef = firestore.collection("messages");
  //queryy the recent messages
  const query = messagesRef.orderBy("createdAt").limit(25);
  //listen to data with a hook, reacts in realtime
  const [messages] = useCollectionData(query, {idField: "id"});

  const [formValue, setFormValue] = useState("");

  const sendMessage = async (e) => {
    //prevent refesh of page on submit
    e.preventDefault();

    const {uid, photoURL} = auth.currentUser;
    // create new document in firestore
    await messagesRef.add({
      text: formValue,
      createdAt: firebase.firestore.FieldValue.serverTimestamp(),
      uid,
      photoURL,
    });

    setFormValue("");
    dummy.current.scrollIntoView({behavior: "smooth"});
  };

  return (
    <>
      <main>
        {messages &&
          messages.map((msg) => <ChatMessage key={msg.id} message={msg} />)}

        <span ref={dummy}></span>
      </main>

      <form onSubmit={sendMessage}>
        {/* bind state to form input  */}
        <input
          value={formValue}
          onChange={(e) => setFormValue(e.target.value)}
          placeholder="Message"
        />

        <button type="submit" disabled={!formValue}>
          Send
        </button>
      </form>
    </>
  );
}

function ChatMessage(props) {
  const {text, uid, photoURL} = props.message;

  //distinguish between send and received messages
  const messageClass = uid === auth.currentUser.uid ? "sent" : "received";

  return (
    <>
      <div className={`message ${messageClass}`}>
        <img
          src={
            photoURL || "https://api.adorable.io/avatars/23/abott@adorable.png"
          }
          alt="user"
        />
        <p>{text}</p>
      </div>
    </>
  );
}

export default App;
