import React, { Component } from "react";
import SocketContext from '../util/socket-context'

class Game extends Component {
    constructor(props) {
        super(props);
    }

    render() {
        return (
            <div></div>
        );
    }

}

const GameWithSocketContext = props => (
    <SocketContext.Consumer>
        {socket => <Game {...props} socket={socket} />}
    </SocketContext.Consumer>
)

export default GameWithSocketContext;