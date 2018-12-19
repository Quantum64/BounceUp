import React, { Component } from 'react';
import './App.css';
import Game from './game/Game';

class App extends Component {
  constructor(props) {
    super(props);
    this.game = new Game();
  }

  render() {
    return (
      <div ref={element => this.game.injectPixiContext(element)} />
    );
  }
}

export default App;
