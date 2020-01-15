import React from "react";
import {
} from "reactstrap";


const Footer = () => {
    return (
        <div>
            <footer className = "page-footer font-small pt-4">
                <div className = "footer-copyright text-center py-3">
                    <span>Created By&nbsp;</span>
                    <a href="https://darshanbhatta.com" target="_blank" rel="noopener noreferrer" style = {{color: "white"}}>Darshan Bhatta</a>
                    <br></br>
                    <a href="/terms" style = {{color: "#9E9EAB", fontSize: "14px"}} target="_blank" rel="noopener noreferrer" >Terms of Service & Private Policy</a>
                </div>
            </footer>
        </div>
    );
};

export default Footer;
