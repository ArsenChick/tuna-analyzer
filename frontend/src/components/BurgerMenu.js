import React from "react";

import "./../scss/top_bar/burger_menu.scss";


class BurgerMenu extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      menuActive: false,
    }
  }

  render () {
    return (
      <div
        className= {`top-bar-icon ${this.state.menuActive ? 'active' : ''}`}
        onClick={() => this.state.menuActive ? this.setState(false) : this.setState(true)
      }>
        <span>
        </span>
      </div>
    );
  }
}

export default BurgerMenu;