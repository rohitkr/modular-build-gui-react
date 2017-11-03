import mapSize from './mapSizeObj.json';
import PublicMod from '../dependency';

class MapManager {
    constructor() {
        // array will have all data, about maps
        this.mapModules = [];
        this.totalMapSize = 0;
        this.selectedMaps = [];
    }
    // assign modules in this.mapModules array
    getMaps() {
        // to calculate size of maps and make it compatible pushing it in stats array
        for (var k in PublicMod) {
            var addObj = {};
            if (PublicMod[k].category.categoryName === 'map') {
                // added name that will be used for search
                // addObj.name = publicModules[k].displayName + 'mapCategory';
                // addObj.name = PublicMod[k].category.subcategoryIndex;
                addObj.description = PublicMod[k].description;
                addObj.displayName = PublicMod[k].displayName;
                addObj.size = mapSize[PublicMod[k].displayName.toLowerCase()] * 1000;
                addObj.category = PublicMod[k].category.categoryName;
                // addObj.primaryIndex = publicModules[k].category.categoryIndex;
                // addObj.secondaryIndex = publicModules[k].category.subcategoryIndex;
                addObj.selected = PublicMod[k].selected;
                addObj.disable = PublicMod[k].disable;
                addObj.render = PublicMod[k].render;
                addObj.includeInCommand = PublicMod[k].includeInCommand;
                addObj.checked = false;
                addObj.disabled = false;
                this.mapModules.push(addObj);
            }
        }

        // first sort on basis of displayname 
        this.mapModules.sort(function (a, b) {
            if (a.displayName > b.displayName) {
                return 1;
            } else {
                return -1;
            }
        });

        for(k = 0;k < this.mapModules.length; k++) {
            this.mapModules[k].name = k+1;
        }

        return this.mapModules;
    }
    selectMap(name) {
        let index = parseInt(name) - 1;
        this.mapModules[index].checked = true;
        this.totalMapSize += (this.mapModules[index].size || 0);
        this.selectedMaps.push(this.mapModules[index].displayName);
    }
    deselectMap(name) {
        let index = parseInt(name) - 1;
        this.mapModules[index].checked = false;
        this.totalMapSize -= (this.mapModules[index].size || 0);
        let rmIndex = this.selectedMaps.indexOf(this.mapModules[index].displayName);
        if (rmIndex > -1) {
            this.selectedMaps.splice(rmIndex, 1);
        }
    }
    getMapSize() {
        return this.totalMapSize;
    }
    // returns a array of display Name of selected Map Modules
    getSelectedMaps() {
        return this.selectedMaps;
    }
};


export default MapManager;