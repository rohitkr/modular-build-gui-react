import React, { Component } from 'react';

class Checkbox extends Component {
  state = {
    isChecked: false,
  }
  constructor () {
    super();
    this.test = '';
  }
  onCheckboxChange = () => {
    const { checkboxClickHandler } = this.props;

    // this.props.isChecked = false;
    // const isChecked = this.props.checked;

    this.setState(({ isChecked }) => ({
      isChecked: !isChecked
    }));

    checkboxClickHandler(this.props, this.state);
    
  }
  render () {
    const name = this.props.name;
    const shortName = this.props.displayName;
    const description = this.props.description;
    const isDisabled = this.props.disabled;
    const isChecked = this.props.checked;
    // const { isChecked } = this.state;

    return (
      <div className="row pt-10">
        <div className="col-6 col-md-4">
          {/* Sample heading content if any */}
        </div>
        <div className="col-6 col-xs-4">
          <label>
            <input type="checkbox"
              value={name}
              checked={isChecked}
              disabled={isDisabled}
              onChange={this.onCheckboxChange}
            ></input>
            &nbsp;
            &nbsp;
            {shortName}
          </label>
        </div>
        <div className="col-6 col-md-4">
          {description}
        </div>
      </div>
    );
  }
}

export default Checkbox;