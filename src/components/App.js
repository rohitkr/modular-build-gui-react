import React, { Component } from 'react';
import axios from 'axios';
import Modules from './Modules';
import './App.css';
import ModuleManager from '../data/module';
import statsJSON from '../data/stats.json';

let moduleManager = new ModuleManager(statsJSON.children[0]);
// set header post to make ajax request
axios.defaults.headers.post['Content-Type'] = 'application/x-www-form-urlencoded';

window.mm = moduleManager;
let modulesJSON = moduleManager.getPublicModules();

class App extends Component {
  state = {
    isChecked: false
  }
  handleFormSubmit = (event) => {
    event.preventDefault();

    let modulesArr = [];

    modulesArr = moduleManager.getUserSelectedModules(true);

    if (!modulesArr.length) {
      console.warn('No modules selected.');
      return;
    }
    axios({
      url: '/build',
      method: 'post',
      headers: {"Content-type": "application/json"},
      data: {
        modularBuild: true,
        modules: modulesArr
      }
    })
    .then(function (response) {
      console.log(response);
    })
    .catch(function (error) {
      console.log(error);
    });

  }
  downloadFile = (event) => {
    window.open('download')
    // axios({
    //   url: '/download',
    //   method: 'get',
    //   headers: {"Content-type": "application/json"},
    //   data: {
    //     modularBuild: true,
    //     modules: 'build.zip'
    //   }
    // })
    // .then(function (response) {
    //   console.log(response);
    // })
    // .catch(function (error) {
    //   console.log(error);
    // });

  }
  clickHandler = (that, state) => {
    state.isChecked ? moduleManager.deselectModule(that.name) : moduleManager.selectModule(that.name);
    this.size = moduleManager.getSize();
    this.setState(({ isChecked }) => ({
      isChecked: !isChecked
    }));
    
  }
  render() {
    return (
      <div className="App">
        <div className="App-header">
          <img src="http://www.fusioncharts.com/theme/xlogo_white.png.pagespeed.ic.LaEgo95vdH.webp" alt="FusionCharts" width="174" height="29" className="logo-white" data-pagespeed-url-hash="279388548" />
          <h2>Welcome to FusionCharts Modular Build</h2>
        </div>

        <div className="container">
          <div className="row">
            <div className="col-xl-12">
              <h4><strong>FusionCharts modular build</strong> allows you to create custom build as per your requirement.
              Please select the modules from the checkbox which you will be using in your project and click on the build button.
              <br/>You will get the FusionCharts build file containing only the modules that you have selected.</h4>
            </div>
          </div>


            <div className="row">
                <form onSubmit={this.handleFormSubmit} action="/build" method="post">
                  <div className="row pt-10">
                    <button className="btn btn-default pull-left" type="submit">Build</button>
                    <a href="javascript:void(0)" className="btn btn-default pull-left" onClick={this.downloadFile} >Download</a>
                    <span className="pull-right">Total Size: {this.size}</span>
                  </div>
                  <input type="hidden" value="This is a sample hidden input element" id="hiddeninp"/>
                  <Modules modulesJSON={modulesJSON} clickHandler={this.clickHandler} />
                </form>
            </div>
        </div>

      </div>
    );
  }
}

export default App;
