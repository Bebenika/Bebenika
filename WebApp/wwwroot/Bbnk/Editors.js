/// <reference path="bbnk.js" />


Bbnk.Editor = class extends Bbnk.Dom {
    constructor(options) {
        super(options);
    }


    
    readValue() {
        if (this.Target === undefined) return null;
        if (this.Target === null) return null;
        if (this.Target.isBbnk !== true) return null;
        return this.Target.Value;
    }

    writeValue(value) {
        if (this.Target === undefined) return;
        if (this.Target === null) return;
        if (this.Target.isBbnk !== true) return;
        this.Target.Value=value;
    }


    getValue() {

    }
    setValue(value) {

    }




}

Bbnk.PropertyEditor = class extends Bbnk.Form {
    constructor(options) {
        super(options);
    }
}
Bbnk.PropertyGrid = class extends Bbnk.Form {

    constructor(options) {
        super(options)
    }

    readValue() {
        return this.$fields.formValue;
    }
    writeValue(value) {
        this.$fields.formValue = value;
    }

    getValue() {
        return this.$fields.Value;
    }
    setValue(value) {
        this.$fields.Value = value;
        if (this.Value === null) return;
        if (this.Value === undefined) return;
        if (this.Value.isBbnk!== true) return;
        let keys = Object.keys(this.Value.$fields.Propertys);
        let plist = [];
        for (let key of keys) {
            plist.push(this.Value.$fields.Propertys[key].Probe());
        }
        this.pChildrenBox.Clear();
        let root = Bbnk.New("", {
            Init: function () {
                this.getText = function () {
                    return "Propertys";
                }
            }
        });
        let item=Bbnk.New("Item", {
            Parent: this.pChildrenBox
        })
    
        for (var i = 0; i < plist.length; i++) {
            plist[i].Parent = root;
        }
        item.Value = root;
        let x = 0;
    }
}