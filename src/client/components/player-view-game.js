import React, { Component } from 'react'
import {baseURL} from "../config";

import {
    Container,
    Row,
} from "reactstrap";
import PropTypes from 'prop-types';
import Crown from '../assets/img/crown.js';
import SocketContext from '../util/socket-context'
import { withAlert } from "react-alert";
import ReactTooltip from 'react-tooltip'
import { withRouter } from 'react-router';


const PlayerItem = props => {
    PlayerItem.propTypes = {
        item: PropTypes.object,
        id: PropTypes.number,
        currentIndex: PropTypes.string,
        name: PropTypes.string,
        lastIndex: PropTypes.number,
    }
    const { item, id, currentIndex, name, lastIndex } = props;
    const shortName = item.username.charAt(0).toUpperCase();
    const renderedName = `${item.username} ${name === item.username ? "(You)" : ""}`;
    return (
        <div style = {{marginRight: lastIndex === id ? "0px" : "20px"}}>
            <div data-tip data-for={"Tooltip-" + id} style={{ marginTop: id === 0 ? "-30px" : "0px", marginBottom: "5px" }}>
                {id === 0 && <Crown></Crown>}
                <div className="player-circle" style={{ background: currentIndex === id ? "#00B172" : "#6100FF", border: name === item.username ? "2px solid #6100ff" : "2px solid #FFFFFF" }}>
                    {shortName}
                </div>
                <ReactTooltip id={"Tooltip-" + id} type='dark' style={{ fontSize: "12px !important" }}>
                    {renderedName}
                </ReactTooltip>
            </div>
            <div style = {{maxHeight: "120px"}}>            
                {[...Array(item.cardCount)].map((e, i) => <Row className="justify-content-center" key = {i}><img className = "backCard" src = {`${baseURL}/img/cards/card_back.png`}></img></Row>)}   </div>
            </div>

    );
};
class PlayerView extends Component {
    constructor(props) {
        super(props);
    }

    render() {
        return (
            <div style = {{height: "200px",overflowY: "scroll"}}>
                <Container className="themed-container" fluid={true}>
                    <Row className="justify-content-center">
                        {this.props.players.map((item, i) => {
                            return <PlayerItem name={this.props.name} key={i} item={item} id={i} lastIndex = {this.props.players.length - 1} currentIndex={this.props.currentIndex} />;
                        })}
                    </Row>
                </Container>
            </div>
        );
    }
}

PlayerView.propTypes = {
    players: PropTypes.array,
    alert: PropTypes.object,
    socket: PropTypes.object,
    name: PropTypes.string,
    history: PropTypes.object,
    currentIndex: PropTypes.number,
};

const PlayerViewWithSocket = props => (
    <SocketContext.Consumer>
        {socket => <PlayerView {...props} socket={socket} />}
    </SocketContext.Consumer>
);

export default withRouter(withAlert()(PlayerViewWithSocket));
