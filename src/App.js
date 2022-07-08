import { useState, useEffect } from 'react'
import { connect, StringCodec } from "nats.ws"
import Messages from "./Messages"

const sc = StringCodec(); //need to decode from binary nats payload

function App() {
  const [nc, setConnection] = useState(undefined);
  const [lastError, setError] = useState("");
  const [messages, setMessages] = useState([]);

  let key = 0;
  const addMessage = (err, msg) => {
    key++;
    const {subject, reply} = msg;
    const data = sc.decode(msg.data);
    const m = {subject, reply, data, key, time: new Date().toUTCString()};
    messages.unshift(m); //I know this is wrong but the guy who works at nats did it and when I fix it, it messes up other stuff. And in the interest of sharing quickly, I'm letting it go.
    const a = messages.slice(0, 10);
    setMessages(a);
    
    console.log(msg.subject);
  }

  useEffect(() => {
    if(nc === undefined) {
      connect({servers: ["ws://0.0.0.0:9090"], waitOnFirstConnect: true})
        .then((nc) => {
          setConnection(nc)
          nc.subscribe( ">", {callback: addMessage}) //n JavaScript clients (websocket, Deno, or Node) subscriptions work as an async iterator - clients simply loop to process messages as they become available.
        })
        .catch((err) => {
          setError("error connecting");
          console.error(err);
        })
    }
  });

  const state = nc ? "connected" : "not yet connected";

  return (
    <div className="container">
      <h1 className="header">{state}</h1>
      <h3>{lastError ? lastError : ""}</h3>
      {messages.length > 0 && lastError === ""
        ? (<Messages messages={messages} />)
        : ("No messages")
        }
      <br></br>
      <button onClick={() => {nc.publish("hello", sc.encode("again"))}}>publish</button>
    </div>
  );
}

export default App;
