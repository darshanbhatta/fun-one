import React from "react";
import Game from "../components/game";
import PropTypes from 'prop-types';
import { Redirect } from 'react-router'


const GameView = (props) => {
    return (
        <div className = "justify-content-center" style={{ maxWidth: "1200px", marginTop: "3%", margin: "auto" }}> 
            {props.location.state && <Game state={props.location.state.payload}></Game>}
            {!props.location.state && <Redirect to="/" />}
        </div>
    );
};

GameView.propTypes = {
    location: PropTypes.object,
}

export default GameView;