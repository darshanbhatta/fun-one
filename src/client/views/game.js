import React from "react";
import Game from "../components/game";
import PropTypes from 'prop-types';


const GameView = (props) => {
    return (
        <div className = "justify-content-center" style={{ maxWidth: "1200px", marginTop: "3%", margin: "auto" }}>            
            <Game state={props.location.state.payload}></Game>
        </div>
    );
};

GameView.propTypes = {
    location: PropTypes.object,
}

export default GameView;