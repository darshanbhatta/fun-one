import React, { Component } from "react";
import {
  BrowserRouter as Router,
  Switch,
  Route,
} from "react-router-dom";
import './app.css';
import NavBar from "./components/nav-bar";
import Footer from "./components/footer";
import Home from "./views/home";
import Play from "./views/play";
import LobbyPage from "./views/lobby_page";
import SocketContext from './util/socket-context';
import socketIOClient from "socket.io-client";
const socket = socketIOClient(`${window.location.hostname}:4001`);

class App extends Component {
  render() {
    return (
      <SocketContext.Provider value={socket}>
      <Router>
        <div>
        <NavBar></NavBar>
          {/*
            A <Switch> looks through all its children <Route>
            elements and renders the first one whose path
            matches the current URL. Use a <Switch> any time
            you have multiple routes, but you want only one
            of them to render at a time
          */}
          <Switch>
            <Route exact path="/">
              <Home/>
            </Route>
            <Route path="/play">
              <Play title = {"Play"}></Play>
            </Route>
            <Route path="/create">
              <Play title = {"Create Game"} socket = {this.socket}></Play>
            </Route>
            <Route path="/join/:roomID?" render={(props) => <Play {... props} title = {"Join Game"}></Play>}>
            </Route>
            <Route path="/lobby" component={LobbyPage}/>
          </Switch>
          <Footer></Footer>
        </div>
      </Router>
      </SocketContext.Provider>
    );
  }
}

export default App;