import React, { Component } from 'react'
import {
    Container,
    Button,
    Row,
    Col
} from "reactstrap";
import PlayerView from "./player-view";
import PropTypes from 'prop-types';
import SocketContext from '../util/socket-context'
import { withAlert } from "react-alert";
import { confirmAlert } from 'react-confirm-alert';
import '../assets/css/confirm-alert.css';
import { withRouter } from 'react-router';
import BackButton from "../assets/img/arrow_back";


class Lobby extends Component {
    constructor(props) {
        super(props);
        this.props.socket.emit("isInARoom");
        this.state = {
            players: this.props.state.players,
        }
        this.props.socket.removeAllListeners("newPlayer");
        this.props.socket.on("newPlayer", (data) => {
            if (data.players) {
                this.setState({ players: data.players })
            }
        });

        this.props.socket.on("isInARoom", (data) => {
            if(!data) {
                this.props.history.push({ pathname: '/' });
            }
        });

    }

    componentDidMount() {
        window.addEventListener('beforeunload', this.keepOnPage);
      }
      
      componentWillUnmount() {
        window.removeEventListener('beforeunload', this.keepOnPage);
      }
      
      keepOnPage(e) {
        var message = 'Warning!\n\nNavigating away from this page will make you leave the current game!';
        e.returnValue = message;
        return message;
      }

    copyToClipboard = () => {
        if (this.state.players.length < 10) {
            const dummy = document.createElement("input");
            document.body.appendChild(dummy);
            dummy.setAttribute('value', `${window.location.origin}/join/${this.props.state.room}`);
            dummy.select();
            document.execCommand("copy");
            document.body.removeChild(dummy);
            this.props.alert.show("Copied!", { type: "success" });
        } else {
            this.props.alert.show("This room is full!", { type: "error" });
        }
    };

    goBack() {
        confirmAlert({
            message: 'Are you sure you want to leave?',
            buttons: [
                {
                    label: 'Yes',
                    onClick: () => {
                        this.props.socket.emit("playerLeave");
                        this.props.history.push({ pathname: '/' });
                    }
                },
                {
                    label: 'No',
                    onClick: () => { }
                }
            ]
        });
    }

    render() {
        return (
            <div>
                <Container className="themed-container-lobby" fluid={true}>
                    <BackButton onClick={() => this.goBack()}></BackButton>
                    <span style={{ marginLeft: "-40px" }} className="play-game-span">Game Lobby</span>
                    <Row style={{ marginTop: "10px" }}>
                        <Col>
                            <span style={{ padding: "0.375rem 0.75rem", float: "left" }}>Room Code: {this.props.state.room}</span>
                        </Col>
                        <Col><Button onClick={this.copyToClipboard} style={{ float: "right" }} color="main">Share Invite</Button></Col>
                    </Row>
                    <Row xs="1" className="play-game-row" style = {{marginTop: "0px"}}>
                        <span>{this.state.players.length} {this.state.players.length === 1 ? "player" : "players"} joined</span>
                        <PlayerView name = {this.props.state.name} players={this.state.players}></PlayerView>
                    </Row>
                </Container>
                <div className="footer-container">{window.location.origin}/join/{this.props.state.room}</div>
            </div>
        );
    }
}

Lobby.propTypes = {
    state: PropTypes.object,
    alert: PropTypes.object,
    socket: PropTypes.object,
    history: PropTypes.object,
}

const LobbyWithSocket = props => (
    <SocketContext.Consumer>
        {socket => <Lobby {...props} socket={socket} />}
    </SocketContext.Consumer>
)

export default withRouter(withAlert()(LobbyWithSocket));
