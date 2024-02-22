/// <reference path="bbnk.js" />
/// <reference path="editors.js" />
/// <reference path="propertys.js" />


Bbnk.Components = {};
Bbnk.Components.Div = class extends Bbnk.Dom {
    constructor(options) {
        super(options);
    }

    AddPropertys() {
        this.AddProperty("Border");
        this.AddProperty("Padding");
        this.AddProperty("Display");
    }
}
