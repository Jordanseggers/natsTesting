import Message from "./Message"

const Messages = ({ messages }) => {
  return (
    <>
      {messages.map((m) => (
        <Message key={m.key} msg={m} />
      ))}
    </>
  )
}

export default Messages