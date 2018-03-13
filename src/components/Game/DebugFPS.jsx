import React from 'react';
import {render, createPortal} from 'react-dom';

class DebugFPS extends React.Component {

  constructor(props) {
    super(props);

    this.el = document.createElement('div');
    this.el.className = 'debugFPS';
    this.el.innerHTML = 'FPS: ';

    this.state = {
      degugFPS: 0
    }
  }

  componentDidMount() {
    document.body.appendChild(this.el);
  }

  componentWillUnmount() {
    document.body.removeChild(this.el);
  }

  updateFPS = (fps) => {
    this.setState({degugFPS: fps});
  }

  render() {
    return createPortal(
      this.state.degugFPS,
      this.el,
    );
  }
}

export default DebugFPS;
