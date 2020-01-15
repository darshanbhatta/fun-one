import React from "react";
import Game from "../components/game";

const GameView = () => {
    return (
        <div className = "justify-content-center" style={{ maxWidth: "780px", marginTop: "3%", margin: "auto" }}>            
            <Game></Game>
        </div>
    );
};

export default GameView;