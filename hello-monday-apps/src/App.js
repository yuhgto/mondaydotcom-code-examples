import React from 'react';
import './App.css';
import monday from 'monday-sdk-js';

class App extends React.Component {

  constructor(props) {
    super(props);
    this.state = {
      settings: {},
      name: "",
    }
  }

  // initialize component with settings
  componentDidMount() {
    // TODO: set up event listeners
    monday.listen("settings", res => {
      this.setState({ settings: res.data });
    });
    monday.api(`query { me { name } }`)
      .then(res => {
        this.setState({name: res.data.me.name});
      });
  }

  render() {
    return (
      <div
        className="App" style={{background: (this.state.settings.background)}}
        >
        Hello, {this.state.name}!
      </div>
    );
  }
}

export default App;
