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
    const shortName = name.replace(/(.*)\/fusioncharts\./, '');
    const description = this.props.description;
    const isDisabled = this.props.disabled;
    const isChecked = this.props.checked;
    // const { isChecked } = this.state;

    return (
      <div className="row pt-10">
        <div className="col-sm-5 col-md-3 col-lg-9">
          <label>
            <input type="checkbox"
              value={name}
              checked={isChecked}
              disabled={isDisabled}
              onChange={this.onCheckboxChange}
            ></input>
            &nbsp;
            {shortName}
          </label>
        </div>
        <div className="col-sm-5 col-md-9 col-lg-10">
          {description}
        </div>
      </div>
    );
  }
}

export default Checkbox;