import React from "react";
import FindGame from "../components/find-game";
import PropTypes from 'prop-types';


const Play = (props) => {
        return (
        <div className = "justify-content-center" style={{ maxWidth: "780px", marginTop: "3%", margin: "auto" }}>    
            <FindGame roomID = { props.match ?  props.match.params.roomID : ""} title = {props.title}></FindGame>
        </div>
        );
};

Play.propTypes = {
    title: PropTypes.string,
    match: PropTypes.object,
}

export default Play;