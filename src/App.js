import React, { Component } from 'react';
import Game from './game/Game';
import { Box, Image, Grommet, Text, TextInput } from "grommet";
import { grommet } from "grommet/themes";

class App extends Component {
  constructor(props) {
    super(props);
    this.game = new Game();
    this.state = {
      ready: false,
      status: "Initializing",
      search: "",
      selecting: false
    }
  }

  componentDidMount() {
    this.game.init((ready, status) => {
      this.setState({
        ready: ready,
        status: status
      });
    });
  }

  updateSearch(event) {
    this.setState({
      search: event.target.value
    })
  }

  render() {
    const search = (
      <div style={{ position: "absolute", left: "32%", right: "32%", top: "22%"}}>
        <Grommet theme={grommet}>
            <Box>
              <TextInput ref={this.ref} value={this.state.search} onChange={(event) => this.updateSearch(event)} placeholder="Search..." />
            </Box>
        </Grommet>
      </div>
    );

    let result = (<h1>{this.state.status}</h1>);
    if (this.state.ready) {
      result = (
        <div>
          {this.state.selecting && search}
          <div ref={element => this.game.injectPixiContext(element)} />
        </div>
      );
    }

    return (
      <div>
        {result}
      </div>);
  }
}

export default App;
