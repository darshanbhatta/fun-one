import React from 'react';
import PropTypes from "prop-types";

const BackButton = (props) => (
    <div onClick = {props.onClick} className = "btn-back">
        <svg width="22" height="22" viewBox="0 0 22 22" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M21.6666 9.66667H5.43992L12.8933 2.21334L10.9999 0.333336L0.333252 11L10.9999 21.6667L12.8799 19.7867L5.43992 12.3333H21.6666V9.66667Z" fill="white" />
        </svg>
    </div>
);

BackButton.propTypes = {
    onClick: PropTypes.func,
}

export default BackButton;