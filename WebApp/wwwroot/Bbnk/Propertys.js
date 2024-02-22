/// <reference path="bbnk.js" />
Bbnk.PropertyCollection = {};
Bbnk.PropertyCollection.Border = class extends Bbnk.Property {
    constructor(options) {
        super(options);
        this.DefaultValue = "border:1px solid red;";
        this.Value = this.DefaultValue;
    }

    readValue() {
        
        let x = 0;
    }
    writeValue(value) {
        if (this.Target === undefined) return;
        let s = value;
        this.Target.AddStyle(s);
    }
    Apply() {
        this.writeValue(this.Value);
    }

}
Bbnk.PropertyCollection.Padding = class extends Bbnk.Property {
    constructor(options) {
        super(options);
        this.DefaultValue = "20";
        this.Value = this.DefaultValue;
    }

    readValue() {

        let x = 0;
    }
    writeValue(value) {
        if (this.Target === undefined) return;
        let s = "padding:" + value + "px;";
        this.Target.AddStyle(s);
    }
    Apply() {
        this.writeValue(this.Value);
    }

}
Bbnk.PropertyCollection.Display = class extends Bbnk.Property {
    constructor(options) {
        super(options);
        this.DefaultValue = "inline-block";
        this.Value = this.DefaultValue;
    }

    readValue() {

        let x = 0;
    }
    writeValue(value) {
        if (this.Target === undefined) return;
        let s = "display:" + value + ";";
        this.Target.AddStyle(s);
    }
    Apply() {
        this.writeValue(this.Value);
    }

}
