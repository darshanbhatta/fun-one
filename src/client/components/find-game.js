import React, { Component } from 'react'
import {
    Container,
    Button,
    Row,
    Label,
    Alert
} from "reactstrap";
import { withRouter } from 'react-router';
import PropTypes from 'prop-types';
import SocketContext from '../util/socket-context'
import { withAlert } from "react-alert";
import BackButton from "../assets/img/arrow_back";


class FindGame extends Component {
    constructor(props) {
        super(props);
        this.state = {
            nickname: "",
            error: "",
            room: this.props.roomID ? this.props.roomID.substring(0, 4) : "",
        }

        this.updateRoom = this.updateRoom.bind(this);
        this.updateName = this.updateName.bind(this);
        this.onKeyPressNickname = this.onKeyPressNickname.bind(this);

        this.roomCodeRef = React.createRef();
        this.nicknameRef = React.createRef();
        
        this.props.socket.removeAllListeners("newPlayer");
        this.props.socket.on("newPlayer", (data) => {
            if (data.players) {
                data.name = this.state.nickname;
                this.props.history.push({ pathname: '/lobby', state: { data } });
            } else {
                this.props.alert.show(data.message, { type: "error" });
            }
        });
    }

    componentDidMount () {
        this.nicknameRef.current.focus();
    }

    onKeyPressNickname = (e) => {
        if (e.which === 13) {
            if (this.props.title === "Play") {
                this.findGame(this.props.socket, this.state.nickname);
            } else if (this.props.title === "Create Game") {
                this.createLobby(this.props.socket, this.state.nickname)
            } else {
                if (this.state.room) {
                    this.joinLobby(this.props.socket, this.state.nickname)
                } else {
                    this.props.alert.show("Please fill in your room code!", {type: "info"});
                    this.roomCodeRef.current.focus();
                }
            }
        }
    }

    updateRoom(event) {
        this.setState({ room: event.target.value, error: "" })
    }

    updateName(event) {
        this.setState({ nickname: event.target.value.replace(" ", ""), error: "" })
    }

    renderError() {
        const { error } = this.state;
        if (error) {
            return <Alert style={{ fontSize: "15px" }} color="danger">
                {error}
            </Alert>
        }
        return null;
    }

    joinLobby(socket, name) {
        if (this.validate(name, false) && this.validate(this.state.room, true)) {
            socket.emit("join", { room: this.state.room, name: this.state.nickname });
        }
    }

    createLobby(socket, name) {
        if (this.validate(name, false)) {
            socket.emit("createGame", { name: name });
        }
    }

    findGame(socket, name) {
        if (this.validate(name, false)) {
            socket.emit("find", { name: name });
        }
    }


    validate(data, isRoomCode) {
        let error = "";
        if (isRoomCode) {
            if (data.length !== 4) {
                error = 'Please enter a valid room code!';
            }
        } else {
            if (data.length === 0) {
                error = 'Please enter a nickname!';
            } else if (data.length > 30) {
                error = 'Too many characters in nickname, please use less than 30!'
            }
        }

        this.setState({
            error: error
        });

        return error === "";
    }

    goBack() {
        this.props.history.push({ pathname: '/' });
    }

    render() {
        return (
            <div>
                <Container className="themed-container" fluid={true}>
                    <BackButton onClick={() => this.goBack()}></BackButton>
                    <span style={{ marginLeft: "-55px" }} className="play-game-span">{this.props.title}</span>
                    <Row xs="1" className="play-game-row">
                        {this.renderError()}
                        <Label className="label" for="nickname" maxLength="30">Nickname</Label>
                        <input className="form-control" ref={this.nicknameRef} onKeyPress = {this.onKeyPressNickname} onChange={this.updateName} value={this.state.nickname} type="name" name="nickname" id="nickname" placeholder="" />
                        {this.props.title === "Play" && <div> <Button style={{ marginTop: "10px" }} color="main" onClick={() => this.findGame(this.props.socket, this.state.nickname)}>Find Game</Button> </div>}
                        {this.props.title === "Create Game" && <div> <Button style={{ marginTop: "10px" }} color="main" onClick={() => this.createLobby(this.props.socket, this.state.nickname)}>Create Game</Button> </div>}
                        {this.props.title === "Join Game" && <div>
                            <Label className="label" style={{ marginTop: "10px" }} for="room">Room Code</Label>
                            <input onKeyPress = {this.onKeyPressNickname} className="form-control" ref={this.roomCodeRef} onChange={this.updateRoom} type="name" name="room" id="room" maxLength="4" value={this.state.room}></input>
                            <Button style={{ marginTop: "10px" }} color="main" onClick={() => this.joinLobby(this.props.socket, this.state.nickname)}>Join Game</Button> </div>}
                    </Row>
                </Container>
            </div>
        );
    }
}

const FindGameWithSocket = props => (
    <SocketContext.Consumer>
        {socket => <FindGame {...props} socket={socket} />}
    </SocketContext.Consumer>
)


FindGame.propTypes = {
    title: PropTypes.string,
    socket: PropTypes.object,
    history: PropTypes.object,
    alert: PropTypes.object,
    roomID: PropTypes.string,
};

export default withRouter(withAlert()(FindGameWithSocket));
