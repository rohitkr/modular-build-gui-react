import React, { Component } from 'react';
import axios from 'axios';
import Modules from './Modules';
import './App.css';
import ModuleManager from '../data/module';
import statsJSON from '../data/stats.json';
import mapSize from '../data/mapSizeObj.json';
import alreadySelected from './selected-modules';
import publicModules from '../dependency';

let moduleManager = new ModuleManager(statsJSON.children[0]);

var arr= statsJSON.children[0].modules;
for (var k in publicModules) {
    var addObj = {};
    if (publicModules[k].category.categoryName === 'map') {
      // added name that will be used for search
      addObj.name = publicModules[k].displayName + 'mapCategory';
      addObj.isPublic = true;
      addObj.description = publicModules[k].description;
      addObj.displayName = publicModules[k].displayName;
      addObj.size = mapSize[publicModules[k].displayName.toLowerCase()] * 1000;
      // console.log('Name: ',addObj.displayName, ' Size:  ',addObj.size);
      addObj.isUserSelected = true;
      addObj.primaryIndex = publicModules[k].category.categoryIndex;
      addObj.secondaryIndex = publicModules[k].category.subcategoryIndex;
      arr.push(addObj);
    }
    // } else if(alreadySelected[k]) {
    //   moduleManager.selectModule(alreadySelected[k]);
    //   addObj.name = alreadySelected[k];
    //   addObj.description = publicModules[k].description;
    //   addObj.displayName = publicModules[k].displayName;
    //   addObj.checked = true;
    //   addObj.disabled = true;
    // }
}

// set header post to make ajax request
axios.defaults.headers.post['Content-Type'] = 'application/x-www-form-urlencoded';

window.mm = moduleManager;
let modulesJSON = moduleManager.getPublicModules();
class App extends Component {
  style = {
    fontSize: ''
  }
  state = {
    showLoading: false,
    isChecked: false,
    showDownloadButton: false
  }
  handleFormSubmit = (event) => {
    event.preventDefault();

    let modulesArr = [];

    modulesArr = moduleManager.getUserSelectedModules(true);
    // console.log(modulesArr);
    if (!modulesArr.length) {
      console.warn('No modules selected.');
      return;
    }
    if (this.state.showLoading) {
      console.warn('Please wait...');
      return;
    }

    this.setState({showDownloadButton: false, showLoading: true});

    axios({
      url: '/build',
      method: 'post',
      headers: {"Content-type": "application/json"},
      data: {
        modularBuild: true,
        modules: modulesArr
      }
    })
    .then((response) => {
      console.log(response);
      // var blob = new Blob([response.data],{type: "octet/stream"});
      // var link = document.createElement('a');
      // link.href = window.URL.createObjectURL(blob);
      // link.download = "buildedModule.zip";
      // link.click();
      this.setState({showDownloadButton: true, showLoading: false});
    })
    .catch((error) => {
      this.setState({showDownloadButton: false, showLoading: false});
      console.log(error);
    });
  }
  clickHandler = (that, state) => {
    // console.log('That: ', that);
    // console.log('That Name: ',that.name);
    state.isChecked ? moduleManager.deselectModule(that.name) : moduleManager.selectModule(that.name);
    this.size = moduleManager.getSize();
    this.setState(({ isChecked }) => ({
      isChecked: !isChecked
    }));
  }
  render() {
    // this.size = moduleManager.getSize();
    // console.log('Rendered....');
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
            <div className={(this.state.showDownloadButton ? '' : 'hidden') + " row pt-10" }>
              <span><strong>Download:</strong></span> &nbsp; &nbsp; &nbsp;<a href="download" download className="" >package.zip</a>
            </div>
          </div>
          <div className="row">
              <form onSubmit={this.handleFormSubmit} action="/build" method="post">
                <div className="row pt-10">
                  <button className={
                      (this.state.showLoading ? 'disabled' : '' ) + " btn btn-default pull-left" 
                    } type="submit">
                    { this.state.showLoading ? <i style={this.style} className="fa fa-cog fa-spin"></i> : 'Build' }
                  </button>
                  {
                    this.state.showDownloadButton ?
                    <a href="download" className="btn btn-default pull-left mrg-left hidden" >Download</a>
                    : null
                  }
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
