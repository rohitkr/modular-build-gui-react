import PublicMod from '../dependency';
class DependencyManager {
  constructor(treeJSON) {
    this.treeData = treeJSON;
    this.moduleData = treeJSON.modules;
    this.totalSize = 0;
  }
  isPublic(modulePath) {
    var i, pubModule, strToMatch;

    // write a function avoid redundancy
    if(modulePath.endsWith('mapCategory')){
      return true;
    }

    for (i in PublicMod) {
      // console.log('path:',PublicMod[i].path);
      // console.log('ModulePath:',modulePath);
      strToMatch = PublicMod[i].path.substr(2);
      // console.log('String to match: ',strToMatch);
      if (modulePath.indexOf(strToMatch) !== -1) {
        pubModule = this.getNode(modulePath);
        // console.log("ModulePath: ",modulePath);
        pubModule.displayName = PublicMod[i].displayName;
        pubModule.description = PublicMod[i].description; 
        pubModule.primaryIndex = PublicMod[i].category.categoryIndex;
        pubModule.secondaryIndex = PublicMod[i].category.subcategoryIndex;
        return true;
      }
    }
    // for (i in PublicMod) {
    //   if (new RegExp(PublicMod[i] + '.js').test(modulePath)) {
    //     pubModule = this.getNode(modulePath);
    //     pubModule.displayName = i;
    //     return true;
    //   }
    // }
    return false;
  }
  getNode(name) {
    let modules = this.moduleData,
      i = 0,
      l = modules.length;
    for (i = 0; i < l; i += 1) {
      if (modules[i].name === name) {
        return modules[i];
      }
    }
  }
  _deSelectIterator(name) {
    let node = this.getNode(name);
    // decrease the selectedDep count
    node.visitedCount = (node.visitedCount || 1) - 1;
    //console.log(name + " visited count: " + node.visitedCount);
    // if for the first time it is getting included
    if (this.isPublic(node.name) && node.visitedCount === 0 && node.isUserSelected && !node.disabled) {
      this.totalSize -= (node.size || 0);
      if (this.isPublic(node.name)) {
        // public nodes should be reset now
        // remove the disablity
        node.disabled = false;
        // make it un-checked
        node.checked = false;
      }
      return true;
    } else
    if (!(this.isPublic(node.name)) && node.visitedCount === 0) {
      // do the first inclusion procedure
      this.totalSize -= (node.size || 0);
      if (this.isPublic(node.name)) {
        // public nodes should be reset now
        // remove the disablity
        node.disabled = false;
        // make it un-checked
        node.checked = false;
      }
      return true;
    } else {
      if (this.isPublic(node.name) && node.isUserSelected && (node.visitedCount === 0 || node.visitedCount === 1)) {
        // call this for public nodes that are direct inclusion, should be enabled now
        node.disabled = false;
      } else if (this.isPublic(node.name) && (node.visitedCount === 0 || node.visitedCount === 1)) {
        // remove the disablity
        node.disabled = false;
        // make it un-checked
        node.checked = false;
      }
      // this node is not excluded, so don't need to iterate through children
      return false;
    }
  }
  _includePublicDep(name) {
    let node = this.getNode(name);
    // make it checked
    node.checked = true;

    // make it disabled, if it is a dependency for another module 
    if (node.visitedCount) {
      node.disabled = true;
    }
  }
  _selectIterator(name) {
    let node, isTraverseFurther = false;
    node = this.getNode(name);
    // intial the visitedCount count of node
    node.visitedCount = (node.visitedCount || 0);
    // if visitedCount is 0 then add its size 
    if (node.visitedCount === 0) {
      // console.log(name);
      this.totalSize += (node.size || 0);
      // increment the count
      node.visitedCount = node.visitedCount + 1;
      // console.log(name +" visited count: "+node.visitedCount);
      if (this.isPublic(node.name)) {
        this._includePublicDep(name);
      }
      isTraverseFurther = true;
    } else {
      // increment the count
      node.visitedCount = node.visitedCount + 1;
      // console.log(name +" visited count: "+node.visitedCount);
      // ** Special case **//
      // If the node is already included but it is a public one, then we might need to disable it
      if (this.isPublic(node.name)) {
        this._includePublicDep(name);
      }
      // Already included, so don't need to iterate through children
      isTraverseFurther = false;
    }

    //console.log(name + " visited count: " + node.visitedCount);
    return isTraverseFurther;
  }
  iterateDep(name, isSelect) {
    let modules = this.moduleData,
      i = 0,
      l = modules.length,
      mod,
      modName,
      reasons,
      ri, rl, modInName = {},
      traverseDeep;
    for (i = 0; i < l; i += 1) {
      mod = modules[i];
      modName = mod.name;
      reasons = mod.reasons;
      //added
      if (reasons && (modName !== name)) {
        ri = 0;
        rl = reasons.length;
        for (ri = 0; ri < rl; ri += 1) {
          if (reasons[ri].moduleName === name) {
            //added
            modInName[modName] = modules[i];
            traverseDeep = isSelect ? this._selectIterator(modName) : this._deSelectIterator(modName);
            // if(isSelect === true) {
            //   traverseDeep = this._selectIterator(modName);
            // } else {
            //   traverseDeep = this._deSelectIterator(modName);
            // }
            //change here
            if (traverseDeep === true) {
              this.iterateDep(modName, isSelect);
            }
          }
        }
      }
    }
  }
  nodeSelect(name) {
    let node = this.getNode(name);
    if (node) {
      node.visitedCount = 1;
      node.isUserSelected = true;
      node.checked = true;
      node.disabled = false;
      // console.log(name);
      this.totalSize += (node.size || 0);
      this.iterateDep(name, true);
      return true;
    }
  }
  nodeDeSelect(name) {
    let node = this.getNode(name),
      key,
      modules = this.moduleData;
    if (node) {
      node.visitedCount = 0;
      node.isUserSelected = false;
      node.disabled = false;
      node.checked = false;
      this.totalSize -= (node.size || 0);
      // iterate the de-selector among all children
      this.iterateDep(name, false);
      this.totalSize = 0;

      //iterate through all modules make visitedCount 0
      for (key in modules) {
        modules[key].visitedCount = 0;
      }
      //iterate through all checkbox of public modules
      for (key in modules) {
        node = modules[key];
        if (this.isPublic(node.name)) {
          if ((node.checked === true) && (node.disabled === true)) {
            node.disabled = false;
            if (!node.isUserSelected) node.checked = false;
          }
        }
      }
      //iterate through all checkbox of public modules
      for (key in modules) {
        node = modules[key];
        if (this.isPublic(node.name)) {
          if ((node.checked === true) && (node.disabled === false)) {
            this.nodeSelect(node.name);
          }
        }
      }
    }
  }
  //return all public modules
  getPublicModules() {

    function isNameAlreadyIncluded(displayName) {
      var k = 0;
      for (k = 0; k < publicModule.length; k++) {
        if (displayName === publicModule[k].displayName) {
          return true;
        }
      }
      return false;
    };
    let i = 0,
      node, key, moduleData = this.moduleData,
      publicModule = [];
    for (key in moduleData) {
      node = moduleData[key];
      if (this.isPublic(node.name) && !isNameAlreadyIncluded(node.displayName)) {
        publicModule[i] = node;
        i++;
      }
    }

    // for (var k in PublicMod) {
    //   var addObj = {};
    //   if (PublicMod[k].category.categoryName === 'map') {
    //     // added name that will be used for search
    //     addObj.name = PublicMod[k].displayName + 'mapCategory';
    //     addObj.isPublic = true;
    //     addObj.description = PublicMod[k].description;
    //     addObj.displayName = PublicMod[k].displayName;
    //     addObj.size = 0;
    //     addObj.isUserSelected = true;
    //     addObj.primaryIndex = PublicMod[k].category.categoryIndex;
    //     addObj.secondaryIndex = PublicMod[k].category.subcategoryIndex;
    //     publicModule.push(addObj);
    //   }
    // }

    // first sort on basis of primaryIndex then on basis of secondary Index
    publicModule.sort(function (a, b) {
      if (a.primaryIndex === b.primaryIndex) {
        return (a.secondaryIndex > b.secondaryIndex) ? 1 : -1;
      }
      return (a.primaryIndex > b.primaryIndex) ? 1 : -1;
    });
    return publicModule;
  }
  //select module by name
  selectModule(name) {
    // console.log('Selecting Module: ', name);
    if (name.endsWith('mapCategory')) {
      var dName = name.slice(0,-11);
      for (var i in this.moduleData) {
        if (this.moduleData[i].displayName === dName) {
          this.moduleData[i].checked = true;
          this.moduleData[i].disabled = false;
          this.moduleData[i].isUserSelected = true;
          //console.log('Selected Module: ',name);
          return this.getPublicModules();
        }
      }
    } else {
      this.nodeSelect(name);
      return this.getPublicModules();
    }
  }
  //deselect module by name
  deselectModule(name) {
    //console.log('DeSelecting Module: ', name);
    if (name.endsWith('mapCategory')) {
      var dName = name.slice(0,-11);
      for (var i in this.moduleData) {
        if (this.moduleData[i].displayName === dName) {
          this.moduleData[i].checked = false;
          this.moduleData[i].disabled = false;
          //console.log('DeSelected Module: ',name);
          return this.getPublicModules();
        }
      }
    } else {
      this.nodeDeSelect(name);
      return this.getPublicModules();
    }
  }
  //get current total size 
  getSize() {
    var kb = Math.round((this.totalSize + 740000 /*+ 1470000 */ ) / 1000 * 100) / 100,
      mb;
    mb = Math.round(kb / 1000 * 100) / 100;
    if (mb > 1)
      return mb.toString() + ' MB';
    else if (kb > 1)
      return kb.toString() + ' KB';
    else
      return (this.totalSize + 740000 /*+ 1470000 */ ) + ' bytes';
  }
  //list of current public modules selected
  getModules() {
    let publicModules = this.getPublicModules(),
      key, selectedModule = [],
      i = 0;

    for (key in publicModules) {
      if (publicModules[key].checked) {
        selectedModule[i] = publicModules[key];
        i++;
      }
    }
    return selectedModule;
  }
  //list of userselected modules
  getUserSelectedModules(shortName) {
    let publicModules = this.getPublicModules(),
      key, selectedModuleName = [],
      i = 0;
    //console.log(publicModules);
    for (key in publicModules) {
      if ((publicModules[key].checked === true) && (publicModules[key].isUserSelected === true)) {
        if (shortName) {
          selectedModuleName[i] = publicModules[key].displayName;
        } else {
          selectedModuleName[i] = publicModules[key].name;
        }
        i++;
      }
    }
    //console.log(selectedModuleName);
    return selectedModuleName;
  }
  //find cyclic dependencies and print the cyclic path
  // path array contains the path of cyclic dependent modules
  isCyclicGraph(startName, currentModule, path) {
    let i, reasons = currentModule.reasons,
      iterModule;
    currentModule.visited = true;
    for (i = 0; i < reasons.length; i++) {
      if (reasons[i].moduleName === startName) {
        return true;
      }
      if (reasons[i].moduleName) {
        iterModule = this.getNode(reasons[i].moduleName);
        if (iterModule && !iterModule.visited) {
          if (this.isCyclicGraph(startName, iterModule, path)) {
            path[path.length] = iterModule.name;
            return true;
          }
        }
      }
    }
    return false;
  }

  printCyclic() {
    let modules = this.moduleData,
      i, j, startModule, path = [];

    for (j = 0; j < modules.length; j++) {
      modules[j].visited = false;
    }

    for (i = 0; i < modules.length; i++) {
      startModule = modules[i];
      path = [];
      path[0] = startModule.name;
      if (this.isCyclicGraph(startModule.name, startModule, path)) {
        console.log("Cyclic at: " + startModule.name);
        path[path.length] = startModule.name;
        console.log("Cyclic Path : " + path);
      }
      for (j = 0; j < modules.length; j++) {
        modules[j].visited = false;
      }
    }
  }
};

export default DependencyManager;