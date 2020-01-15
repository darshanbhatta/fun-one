import React from 'react'
import PropTypes from "prop-types";
import SuccessIcon from "./success-icon";
import ErrorIcon from "./error-icon";
import CloseIcon from "./close-icon";
import InfoIcon from "./info-icon";

const alertStyle = {
    backgroundColor: '#6100FF',
    color: 'white',
    padding: '10px',
    borderRadius: '50px',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    boxShadow: '0px 2px 2px 2px rgba(0, 0, 0, 0.03)',
    fontFamily: 'Roboto',
    minWidth: '300px',
    boxSizing: 'border-box',
}

const buttonStyle = {
    marginLeft: '20px',
    border: 'none',
    backgroundColor: 'transparent',
    cursor: 'pointer',
    color: '#FFFFFF'
}

const AlertTemplate = ({ message, options, style, close }) => {
    return (
        <div style={{ ...alertStyle, ...style }}>
            {options.type === 'success' && <SuccessIcon />}
            {options.type === 'error' && <ErrorIcon />}
            {options.type === 'info' && <InfoIcon />}
            <span style={{ flex: 2, fontSize: '18px'}}>{message}</span>
            <div
                onClick={close}
                style={buttonStyle}
            >
                <CloseIcon></CloseIcon>
            </div>
        </div>
    )
}

AlertTemplate.propTypes = {
    message: PropTypes.string,
    options: PropTypes.object,
    style: PropTypes.object,
    close: PropTypes.func,
}

export default AlertTemplate