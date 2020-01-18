import React, { Component } from "react";
import SocketContext from '../util/socket-context'
import { Container, Col, Row } from 'reactstrap';
import BackButton from "../assets/img/arrow_back";
import PlayerView from "./player-view-game";
import { withAlert } from "react-alert";
import { confirmAlert } from 'react-confirm-alert';



import { baseURL } from "../config";
import { getCardImage } from "../util/game-utils";
import Hand from "./hand";
import PropTypes from "prop-types";

class Game extends Component {
    constructor(props) {
        console.log(props);
        super(props);

        this.state = this.props.state;
        this.state.round = 1;

        this.props.socket.on("gameData", (data) => {
            if (data.message) {
                this.props.alert.show(data.message, { type: "error" });
            } else if (!data.players) {
                console.log(data.player);
                this.setState({
                    player: data.player,
                });
                confirmAlert({
                    onClickOutside: () => { this.props.socket.emit("gameMove", { move: "skip" }); },
                    customUI: ({ onClose }) => {
                        return (
                            <div className='react-confirm-alert-body'>
                                <span>Do you want to play this card?</span>
                                <Row style={{ marginTop: "10px" }} className="justify-content-center">
                                    <Col>
                                        <img src={`${baseURL}${getCardImage(data.player.cards[data.player.cards.length - 1].cardID)}`}></img>
                                    </Col>
                                    <Col style = {{display: "flex", alignItems: "center", marginRight: "13px"}}>
                                        <button className = "drawCard" onClick={() => {
                                            const card = data.player.cards[data.player.cards.length - 1];
                                            if (!card.selectedColor && card.color === "none") {
                                                confirmAlert({
                                                    customUI: ({ onClose }) => {
                                                        return (
                                                            <div className='react-confirm-alert-body'>
                                                                <span>Please pick a color</span>
                                                                <Row className="justify-content-center">
                                                                    <button style={{ background: "#00C3E5" }} className="colorSelect" onClick={() => {
                                                                    card.selectedColor = "blue"; this.props.socket.emit("gameMove", { move: "playCard", card: card });
                                                                        onClose();
                                                                    }}>Blue</button>
                                                                    <button style={{ background: "#F56462" }} className="colorSelect" onClick={() => {
                                                                    card.selectedColor = "red"; this.props.socket.emit("gameMove", { move: "playCard", card: card });
                                                                        onClose();
                                                                    }}>Red</button>
                                                                    <button style={{ background: "#F7E359" }} className="colorSelect" onClick={() => {
                                                                    card.selectedColor = "yellow"; this.props.socket.emit("gameMove", { move: "playCard", card: card });
                                                                        onClose();
                                                                    }}>Yellow</button>
                                                                    <button style={{ background: "#2FE29B" }} className="colorSelect" onClick={() => {
                                                                    card.selectedColor = "green"; this.props.socket.emit("gameMove", { move: "playCard", card: card });
                                                                        onClose();
                                                                    }}>Green</button>
                                                                </Row>
                                                            </div>
                                                        );
                                                    }
                                                });
                                            } else {
                                                this.props.socket.emit("gameMove", { move: "playCard", card: card });
                                                onClose();
                                            }

                                        }}>Yes</button>
                                        <button className = "drawCard" onClick={() => { this.props.socket.emit("gameMove", { move: "skip" }); onClose(); }}>No</button>
                                    </Col>
                                </Row>
                            </div>
                        );
                    }
                });
            } else {
                this.setState({
                    players: data.players,
                    player: data.player,
                    turnIndex: data.turnIndex,
                    prevCard: data.prevCard,
                    round: this.state.round + 1,

                });
                this.props.alert.show(data.announce, { type: "info", timeout: 5000 });
            }

        });

    }

    render() {
        return (
            <Container className="themed-container-lobby" fluid={true}>
                <BackButton onClick={() => this.goBack()}></BackButton>
                <h2 style = {{marginRight: "40px"}}>{`Round ${this.state.round}`}</h2>
                <PlayerView players={this.state.players} name={this.state.name} currentIndex={this.state.turnIndex}></PlayerView>
                <Row style={{ marginTop: "20px" }} className="justify-content-center">
                    <img className = "drawCardMain" onClick={() => this.props.socket.emit("gameMove", { move: false })} src={`${baseURL}/img/cards/card_back.png`}></img>
                    <div style = {{margin: "10px"}}></div>
                    <img src={`${baseURL}${getCardImage(this.state.prevCard.cardID)}`}></img>
                </Row>
                <Hand cards={this.state.player.cards}></Hand>
            </Container>
        );
    }

}

Game.propTypes = {
    state: PropTypes.object,
    socket: PropTypes.object,
    alert: PropTypes.object,
}

const GameWithSocketContext = props => (
    <SocketContext.Consumer>
        {socket => <Game {...props} socket={socket} />}
    </SocketContext.Consumer>
)

export default withAlert()(GameWithSocketContext);