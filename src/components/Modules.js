import React, { Component } from 'react';
import Checkbox from './Checkbox';

class Modules extends Component {

  state = {
    isChecked: false
  }

  constructor () {
    super();    
    // this.modulesObj = Object.assign({}, modulesJSON);
    this.modulesObj = {};
  }

  onCheckboxClick = (that, state) => {
    // Get the update modules and Modify the modules
    this.setState(({ isChecked }) => ({
      isChecked: !isChecked
    }));

    this.props.clickHandler(that, state);

  }

  createCheckbox = (module) => {
    let checked = module.checked;

    return (
      <Checkbox
        module={module}
        description={module.description}
        checked={checked}
        /*checked={this.state.checked}*/
        disabled={module.disabled}
        name={module.name}
        displayName={module.displayName}
        checkboxClickHandler={this.onCheckboxClick}
        key={module.name}
      />
    );
  }

  drawCheckboxes = () => {
    // this.checkboxes = modulesArr.map(v => this.createCheckbox(v.name, v.description));
    return (this.checkboxes);
  }

  render () {
    this.modulesJSON = this.props.modulesJSON;
    this.checkboxes = this.modulesJSON.map(module => this.createCheckbox(module));

    return (
      <div className="row">
        {this.checkboxes}
      </div>
    );
  }
}

export default Modules;