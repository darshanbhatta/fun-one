import React, { Component } from "react";
import { Container, Row } from 'reactstrap';
import PropTypes from 'prop-types';
import { getCardImage } from '../util/game-utils';
import { baseURL } from "../config";
import SocketContext from '../util/socket-context'
import { confirmAlert } from 'react-confirm-alert';


class Hand extends Component {
    constructor(props) {
        super(props);
    }

    handleClick(card) {
        if (!card.selectedColor && card.color === "none") {
            confirmAlert({
                customUI: ({ onClose }) => {
                    return (
                        <div className='react-confirm-alert-body'>
                            <span>Please pick a color</span>
                            <Row className="justify-content-center">
                                <button style = {{background: "#00C3E5"}} className = "colorSelect" onClick={() => {card.selectedColor = "blue"; this.handleClick(card); onClose();}}>Blue</button>
                                <button style = {{background: "#F56462"}} className = "colorSelect" onClick={() => {card.selectedColor = "red"; this.handleClick(card); onClose();}}>Red</button>
                                <button style = {{background: "#F7E359"}} className = "colorSelect" onClick={() => {card.selectedColor = "yellow"; this.handleClick(card); onClose();}}>Yellow</button>
                                <button style = {{background: "#2FE29B"}} className = "colorSelect" onClick={() => {card.selectedColor = "green"; this.handleClick(card); onClose();}}>Green</button>
                            </Row>
                        </div>
                    );
                }
            });
        } else {
            this.props.socket.emit("gameMove", { move: true, card: card })
        }
    }

    renderCard(item, i) {
        return <img onClick={() => this.handleClick(item)} className="cardinGame" key={i} src={`${baseURL}${getCardImage(item.cardID)}`}></img>
    }

    render() {
        console.log(this.props.cards);
        return (
            <div>
                <Container style = {{marginTop: "20px"}}>
                    <Row className="justify-content-center">
                        {this.props.cards.map((item, i) => { return this.renderCard(item, i) })}
                    </Row>
                </Container>
            </div>
        );
    }

}

Hand.propTypes = {
    cards: PropTypes.array,
    socket: PropTypes.object,
}

const HandWithSocketContext = props => (
    <SocketContext.Consumer>
        {socket => <Hand {...props} socket={socket} />}
    </SocketContext.Consumer>
)

export default HandWithSocketContext;