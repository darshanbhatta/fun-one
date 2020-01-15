import React, { Component } from "react";
import Lobby from "../components/lobby";
import Chat from "../components/chat-component";
import PropTypes from 'prop-types';
import { Redirect } from 'react-router'

class LobbyPage extends Component {
    render() {
        return (
            <div className = "justify-content-center" style={{ maxWidth: "780px", marginTop: "3%", margin: "auto" }}>    
                {this.props.location.state && <Lobby state={this.props.location.state.data}></Lobby>}
                {this.props.location.state && <Chat state={this.props.location.state.data}></Chat>}
                {!this.props.location.state && <Redirect to="/" />}
            </div>
        )
    }
}

LobbyPage.propTypes = {
    location: PropTypes.object,
}

export default LobbyPage;