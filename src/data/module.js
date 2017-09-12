class DependencyManager {
  constructor(treeJSON) {
    this.treeData = treeJSON;
    this.moduleData = treeJSON.modules;
    this.totalSize = 0;
  }
  isPublic(modulePath) {
    return !!modulePath.match(/mantle\/renderer-javascript\/charts\//ig);
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
      if (reasons && (modName != name)) {
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
    let i = 0,
      node, key, moduleData = this.moduleData,
      publicModule = [];

    for (key in moduleData) {
      node = moduleData[key];
      if (this.isPublic(node.name)) {
        publicModule[i] = node;
        i++;
      }
    }
    return publicModule;
  }
  //select module by name
  selectModule(name) {
    this.nodeSelect(name);
    return this.getPublicModules();
  }
  //deselect module by name
  deselectModule(name) {
    this.nodeDeSelect(name);
    return this.getPublicModules();
  }
  //get current total size 
  getSize() {
    var kb = (this.totalSize / 1024).toPrecision(4),
      mb;
    mb = (kb / 1024).toPrecision(4);
    if (mb > 1)
      return mb.toString()+' MB';
    else if (kb > 1)
      return kb.toString()+' KB';
    else
      return this.totalSize+' bytes';
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
};

export default DependencyManager;
