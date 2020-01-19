import React, { useState } from "react";
import {
	Collapse,
	Navbar,
	NavbarToggler,
	NavbarBrand,
	Nav,
	NavItem,
	NavLink,
	Button,
} from "reactstrap";
import { withAlert } from "react-alert";
import PropTypes from 'prop-types';
import { baseURL } from "../config";

const NavBar = (props) => {
	const [isOpen, setIsOpen] = useState(false);
	const toggle = () => setIsOpen(!isOpen);

	const comingSoon = () => {
		props.alert.show("Coming soon...", {type: "info"});
	};

	return (
		<div style={{ marginLeft: "8%", marginRight: "8%", marginTop: "1%" }}>
			<Navbar color="#181737" dark expand="md">
				<NavbarBrand href="/"> <img src={`${baseURL}/img/logo.png`} style={{ width: 70 }} /></NavbarBrand>
				<NavbarToggler onClick={toggle} />
				<Collapse isOpen={isOpen} navbar>
					<Nav className="mr-auto" navbar>
						<NavItem>
							<a className = "nav-link" href="/rules" target="_blank" rel="noopener noreferrer">Rules</a>
						</NavItem>
						<NavItem>
							<NavLink onClick={comingSoon}>Leaderboard</NavLink>
						</NavItem>
					</Nav>
					<NavLink onClick={comingSoon}>Login</NavLink>
					{isOpen ?
						<Button color="main" onClick={comingSoon} style={{ margin: "auto" }}>Sign Up</Button> :
						<Button color="main" onClick={comingSoon} >Sign Up</Button>
					}
				</Collapse>
			</Navbar>
		</div>
	);
}

NavBar.propTypes = {
	alert: PropTypes.object
}

export default withAlert()(NavBar);
