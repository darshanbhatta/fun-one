import React from 'react';
import ReactDOM from 'react-dom';
import App from './App';
import 'bootstrap/dist/css/bootstrap.css';
import "typeface-roboto";
import { transitions, positions, Provider as AlertProvider } from 'react-alert'
import AlertTemplate from './util/alert-template'



const options = {
    // you can also just use 'bottom center'
    position: positions.TOP_CENTER,
    timeout: 2000,
    offset: "90px",
    // you can also just use 'scale'
    transition: transitions.SCALE
}

const Root = () => (
    <AlertProvider template={AlertTemplate} {...options}>
      <App />
    </AlertProvider>
  )

ReactDOM.render(<Root></Root>, document.getElementById('root'));
