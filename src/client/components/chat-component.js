import React, { Component } from 'react'
import { Container } from "reactstrap";
import PropTypes from 'prop-types';
import SocketContext from '../util/socket-context'
import { withRouter } from 'react-router';
import "../assets/css/chat.css";
import Send from "../assets/img/send";
import { withAlert } from "react-alert";

class Chat extends Component {
    constructor(props) {
        super(props);
        this.state = {
            message: "",
            messages: this.props.state.messages ? this.props.state.messages : [],
            username: this.props.state.name,
        }

        this.inputRef= React.createRef();


        this.props.socket.removeAllListeners("chat");
        this.props.socket.on("chat", (data) => {
            if (data.error) {
                this.props.alert.show(data.error, {type: "error"});
            } else {
                this.state.messages.push(data.message);
                this.setState({messages: this.state.messages});
            }
        });

        this.renderMessage = this.renderMessage.bind(this);
        this.sendMessage = this.sendMessage.bind(this);
    }

    sendMessage() {
        if (this.state.message) {
            this.props.socket.emit("chat", {message: this.state.message, name: this.state.username});
            this.inputRef.current.value = "";
            this.setState({message: ""});
        } else {
            this.props.alert.show("Please type a message before sending!", {type: "error"});
        }

    }

    handleChange(event) {
        this.setState({message: event.target.value});
    }
    
    onKeyPress = (e) => {
        if (e.which === 13) {
           e.preventDefault();
           this.sendMessage();
        }
    }

    renderMessage(message, i) {
        const isCurrentUser = message.author === this.state.username;
        return <div className={`d-flex justify-content-${isCurrentUser ? "end" : "start"} mb-3`} key = {i}>
            <div className={`msg_container_${isCurrentUser ? "you" : "other"}`}>
                {message.data}
                <span className={`msg_author_${isCurrentUser ? "you" : "other"}`}>{message.author}{isCurrentUser ? "(You)" : ""}</span>
            </div>
        </div>;
    }

    render() {
        return (
            <Container className="card" style={{ marginTop: "35px", height: "350px" }} fluid={true}>
                <div className="card-header msg_head">
                    <span className="play-game-span" >Chat</span>
                </div>
                <div className="card-body msg_card_body">
                    {this.state.messages.map((message, i) => {
                        return this.renderMessage(message, i);
                    })}
                </div>
                <div className="card-footer">
                    <div className="input-group">
                        <textarea onKeyPress = {this.onKeyPress} ref={this.inputRef} onChange={this.handleChange.bind(this)} spellCheck="true" className="form-control type_msg" placeholder="Type your message..."></textarea>
                        <div className="input-group-append">
                            <button onClick = {() => this.sendMessage()} className="input-group-text send_btn"><Send></Send></button>
                        </div>
                    </div>
                </div>
            </Container>
        );
    }
}

Chat.propTypes = {
    state: PropTypes.object,
    alert: PropTypes.object,
    socket: PropTypes.object,
    history: PropTypes.object,
}

const ChatWithSocket = props => (
    <SocketContext.Consumer>
        {socket => <Chat {...props} socket={socket} />}
    </SocketContext.Consumer>
)

export default withRouter(withAlert()(ChatWithSocket));
