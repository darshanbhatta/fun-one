import React, { Component } from 'react'
import {
    Container,
    Row,
    Button
} from "reactstrap";
import PropTypes from 'prop-types';
const randomColor = require('randomcolor'); // import the script
import Crown from '../assets/img/crown.js';
import SocketContext from '../util/socket-context'
import { withAlert } from "react-alert";
import ReactTooltip from 'react-tooltip'


const PlayerItem = props => {
    PlayerItem.propTypes = {
        item: PropTypes.string,
        id: PropTypes.number,
        color: PropTypes.string,
        name: PropTypes.string,
    }
    const { item, id, color, name } = props;
    const shortName = item.charAt(0).toUpperCase();
    const renderedName = `${item} ${name === item ? "(You)" : ""}`;
    return (
        <div data-tip data-for={"Tooltip-" + id} style={{ marginTop: id === 0 ? "-30px" : "0px" }}>
            {id === 0 && <Crown></Crown>}
            <div className="player-circle" style={{ background: color, border: name === item ? "2px solid #6100ff" : "2px solid #FFFFFF"}}>
                {shortName}
            </div>
            <ReactTooltip id={"Tooltip-" + id} type='dark' style = {{fontSize: "12px !important"}}>
                    {renderedName}
            </ReactTooltip>
        </div>

    );
};
class PlayerView extends Component {
    constructor(props) {
        super(props);

        this.state = { message: "Start Game", seconds: 5 }

        this.props.socket.removeAllListeners("startGame");
        this.props.socket.on("startGame", (data) => {
            if (data.message) {
                this.props.alert.show(data.message, {type: "info"});
            } else {
                this.setState({ message: "Game starting in 5", seconds: 5 });
                this.timer = setInterval(this.countDown, 1000);
            }
        });
        this.countDown = this.countDown.bind(this);
    }

    render() {
        return (
            <div>
                <Container className="themed-container" fluid={true}>
                    <Row className="justify-content-center">
                        {this.props.players.map((item, i) => {
                            return <PlayerItem name={this.props.name} key={i} item={item} id={i} color={randomColor()} />;
                        })}
                    </Row>
                    <Button disabled={this.props.players.length === 1 || this.props.name !== this.props.players[0]} onClick={() => this.startGame()} style={{ marginTop: "20px" }} color="main" >{this.state.message}</Button>
                </Container>
            </div>
        );
    }

    startGame() {
        this.props.socket.emit("startGame");
    }

    countDown() {
        const seconds = this.state.seconds - 1;
        this.setState({
            message: `Game starting in ${seconds}`,
            seconds: seconds,
        });
        if (seconds == 0) {
            clearInterval(this.timer);
            this.props.alert.show("Game started!!!");
        }
    }
}

PlayerView.propTypes = {
    players: PropTypes.array,
    alert: PropTypes.object,
    socket: PropTypes.object,
    name: PropTypes.string,
};

const PlayerViewWithSocket = props => (
    <SocketContext.Consumer>
        {socket => <PlayerView {...props} socket={socket} />}
    </SocketContext.Consumer>
);

export default withAlert()(PlayerViewWithSocket);
