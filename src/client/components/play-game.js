import React from "react";
import {
    Container,
    Row,
} from "reactstrap";
import {Link} from "react-router-dom";


const PlayGame = () => {
    return (
        <div>
            <Container className="themed-container" fluid={true}>
            <span className = "play-game-span" >Start Playing</span>
            <Row xs="1" className = "play-game-row">
                <Link className = "btn btn-main spacing" to="/play">Play</Link>
                <Link className = "btn btn-main spacing" to="/create">Create Game</Link>
                <Link className = "btn btn-main spacing" to="/join">Join Game</Link>
            </Row>
            </Container>
        </div>
    );
};

export default PlayGame;
