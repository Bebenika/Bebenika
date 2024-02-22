addEventListener("mousemove", function (ev) {
    Bbnk.lastMouseX = ev.clientX;
    Bbnk.lastMouseY = ev.clientY;
    if (Bbnk.DragImage !== undefined) {
        let dx = ev.clientX - Bbnk.DragImage.EV.clientX;
        let dy = ev.clientY - Bbnk.DragImage.EV.clientY;
        Bbnk.DragImage.X = Bbnk.DragImage.StX + dx;
        Bbnk.DragImage.Y = Bbnk.DragImage.StY + dy;
        return;
    }
    var r = window.devicePixelRatio;
    //r = 1;// Bbnk.getScreenScale();

    if (Bbnk.CurrentMouseMoveElement === null) return;
    if (Bbnk.CurrentMouseMoveElement === undefined) return;
    var vv = Bbnk.CurrentMouseMoveElement;
    var pos = vv.MouseDownPos;
    let zoom = Bbnk.getBrowserZoomLevel() / 100;
    let carpan =  Bbnk.getScreenScale();
    var move = {
        dx: ((pos.e.screenX - ev.screenX) / r) * carpan,
        dy: ((pos.e.screenY - ev.screenY) / r) * carpan,
        dPos: pos,
        ev: ev
    };
    vv.RunAction("onMouseMoveReport", move);


});
addEventListener("mouseup", function (ev) {
    if (Bbnk.DragID !== undefined) {
        Bbnk.DragImage.displayEnable = false;

        Bbnk.DragID.dragEnd({ ev: ev });
        //Bbnk.DragImage.dispose();
        //Bbnk.DragImage = undefined;
        return;
    }
    var v = Bbnk.CurrentMouseMoveElement;
    Bbnk.CurrentMouseMoveElement = undefined;
    if (v !== undefined) {
        v.runAction("onMouseUpForViever");
    }

});

document.addEventListener('keydown', (event) => {
    if (Bbnk.pressedKeys === undefined) Bbnk.pressedKeys = {};
    Bbnk.pressedKeys[event.key] = true; // Basılı tuşu kaydet
});

// Klavyede bir tuştan el çekildiğinde
document.addEventListener('keyup', (event) => {
    if (Bbnk.pressedKeys === undefined) Bbnk.pressedKeys = {};
    delete Bbnk.pressedKeys[event.key]; // Tuşu sil
});

class Bbnk extends Object {

    static _actuelObjects = {};
    static _idCounter = 0;
    static addObject(obj) {
        //Bır bbnk create edilince _actuelObjects e eklenir
        obj.$fields.ID = this._idCounter.toString(16); //Hernesnenin Bir ID si var
        while (obj.$fields.ID.length < 16) obj.$fields.ID = "0" + obj.$fields.ID;
        obj.$fields.ID = "Bbnk_" + obj.$fields.ID;
        this._actuelObjects[obj.ID] = obj;
        this._idCounter++;
    }
    static removeObject(obj) {
        //ispose edilince _actuelObjects den silinir
        if (this._actuelObjects[obj.ID] !== undefined) delete this._actuelObjects[obj.ID];
    }
    static OptionsCheck(options) {
        if (typeof options !== "object") options = {};
        return options;
    }
    static funcIdCounter = 0;
    static get funcId() {
        return "func_"+this.funcIdCounter.toString(16);

    }
    static New(classname, options) {

        let c;
        if (typeof classname === "function") {
            c = classname;
        }
        if (c===undefined) c= Bbnk[classname];
        if (c === undefined) c = Bbnk;
        let res = new c(options);
        res.AddPropertys();
        res.ApplyPropertys();
        if (res.ContextMenuList !== undefined) {
            let x = res.ContextMenuList;
        }
        if (res.InitContextmenu!==undefined) res.InitContextmenu();
        res.RunInit();
       
        return res;
    }
    static deepEqual(obj1, obj2) {
        try {
            if ((obj1 === null) && (obj2 !== null)) return false;
            if ((obj2 === null) && (obj1 !== null)) return false;
            if ((obj1 === undefined) && (obj2 !== undefined)) return false;
            if ((obj2 === undefined) && (obj1 !== undefined)) return false;
            if (obj1 === obj2) {
                return true; // Aynı referansa sahiplerse doğrudan true dön
            } 
            let t1 = typeof obj1;
            let t2 = typeof obj2;
            if (t1 !== t2) return false;

            if (t1 === "object") {
                let keys1 = Object.keys(obj1), keys2 = Object.keys(obj2);
                if (keys1.length != keys2.length) {
                    return false; // Nesnelerin özellik sayıları farklıysa, false dön
                }
                for (let key of keys1) {
                    if (!keys2.includes(key) || !deepEqual(obj1[key], obj2[key])) {
                        return false; // Karşılık gelen özellikler eşit değilse, false dön
                    }

                }
                return true;
            }
            return obj1.toString() == obj2.toString();
        } catch (e) {
            let x = 0;
        }
    }
    static isDOMElement(obj) {
        return !!(obj && obj.nodeType === 1);
    }
    static get NullContainer() {
        if (Bbnk._nullContainer === undefined) {
            Bbnk._nullContainer = Bbnk.New("Dom");
        }
        return Bbnk._nullContainer;
    }
    static getAllProperties(obj) {
        let props = [];
        do {
            Object.getOwnPropertyNames(obj).forEach(prop => {
                if (props.indexOf(prop) === -1) {
                    props.push(prop);
                }
            });
            obj = Object.getPrototypeOf(obj);
        } while (obj);
        return props;
    }


    static isArray(obj) {
        return Object.prototype.toString.call(obj) === '[object Array]';
    }
    static contain(s, part, options) {
        if (this.isArray(part)) {
            let cm = "";
            if (options !== undefined) {
                cm = "";
            }
            for (let i = 0; i < part.length; i++) {
                let px = part[i];
                let res = this.contain(s, px);

                if (cm === "") {
                    if (res === true) return true;
                }
            }
            return false;
        } else {
            let index = s.indexOf(part);
            if (index !== -1) return true;
            return false;
        }
    }

    static isContainNumber(v) {
        let t = typeof v;
        if (t === "number") return true;
        t = v.toString();
        let vc = 0;
        let nc = 0;
        for (let x = 0; x < t.length; x++) {

            let i = t[x];
            if (!this.contain("0123456789,.+-", i)) return false;
            if (this.contain(",", i)) {
                vc++;
            }
            if (this.contain(".", i)) {
                nc++;
            }


            if (this.contain("+-", i)) {
                if (t.indexOf(i.toString()) !== 0) return false;
            }
        }
        if (nc > 1) return false;
        if (vc > 1) return false;
        return true;
    }

    static endwith(v, value) {
        if (value === undefined) return false;
        let source = v;
        let src = source.toString();
        let s = src.substring((src.length - value.length), src.length) === value;
        return s;
    }
    static startwith(v, value) {
        if (value === undefined) return false;
        let source = v;
        let src = source.toString();
        let ss = src.substring(0, value.length);
        let s = ss === value;
        return s;
    }
    static toPx(v) {
        let value = v;
        if (value === undefined) return undefined
        if (value.toString() === "") return "";

        if (value === undefined) return "";
        if (!this.endNumers(value)) return value;
        if (this.endwith(value, "%")) return value;
        let s = this.toInt(value) + "px";
        return s;
    }
    static endNumers(v) {
        let source = v;
        let lst = "0123456789";
        let src = source.toString();
        let s = src.toString().substring((src.length - 1), src.length);
        let x = lst.indexOf(s);
        return x !== -1;
    }
    static toInt(v) {
        let value = v;
        if (value.toString().indexOf("%") !== -1) return value;
        if (this.endwith(value, "px")) value = value.replace("px", "");
        if (this.endwith(value, "pt")) value = value.replace("pt", "");
        if (value === "") return 0;
        if (value === undefined) return "";
        if (!this.isContainNumber(value)) return value;
        let res = parseInt(value);
        return res;
    }
    static toNum(v) {
        let value = v;
        if (value.toString().indexOf("%") !== -1) return value;
        if (this.endwith(value, "px")) value = value.replace("px", "");
        if (this.endwith(value, "pt")) value = value.replace("pt", "");
        if (value === "") return 0;
        if (value === undefined) return "";
        if (!this.isContainNumber(value)) return value;
        let res = parseFloat(value);
        return res;
    }

    static getScreenScale() {
        // CSS pikselleri kullanarak genişliği al
        var screenWidth = window.screen.width * window.devicePixelRatio;
        // Fiziksel pikselleri kullanarak genişliği al
        var physicalScreenWidth = window.screen.width;

        // Ekran ölçeklendirme faktörünü hesapla
        var scale = screenWidth / physicalScreenWidth;

        return scale;
    }

    static getBrowserZoomLevel() {
        var standardDpi = 72; // Standart ekranlar için varsayılan DPI
        var dpi = (window.devicePixelRatio * standardDpi);
        var zoomLevel = (dpi / standardDpi) * 100; // Zoom seviyesini yüzde olarak hesapla
        //return zoomLevel;

        if ('visualViewport' in window) {
            // visualViewport API'sini destekleyen tarayıcılarda
             zoomLevel = window.visualViewport.scale * 100; // Zoom seviyesini yüzde olarak alır
           
        } else {
            // API desteklenmiyorsa alternatif bir yöntem kullanılmalı
        }
        return; zoomLevel;
    }   

    static get MaxZIndex() {
        function getmaxzindex(element, options) {
            options.cnt++;
            let z = options.index;
            try {

                if (element.style !== undefined) {
                    let zz = Bbnk.getCurrentStyle(element, "z-Index");
                    if (zz !== "") {
                        let x = 0;
                    }
                    if (zz === "auto") {
                        zz = "";
                    }
                    if (zz === '2147483647') {
                        zz = "";
                    }

                    z = Bbnk.toInt(zz);
                }
            } catch (e) {
                Bbnk.addAxception(e);
            }
            if (z > options.index) {
                options.index = z;
            }
            for (let i = 0; i < element.childNodes.length; i++) {
                try {
                    let e = element.childNodes[i];
                    if ((e !== null) && (e !== undefined)) {

                        try {
                            getmaxzindex(e, options);
                        } catch (e) {
                            Bbnk.addAxception(e);
                        }
                    }
                } catch (e) {
                    Bbnk.addAxception(e);
                }
            }
        }
        let b = {
            index: 0,

            cnt: 0
        }
        getmaxzindex(document.body, b);
        return b.index + 1;
    }
    static getCurrentStyle(element, styleProp) {
        if (element.currentStyle) {
            return element.currentStyle[styleProp];
        } else if (window.getComputedStyle) {
            return window.getComputedStyle(element, null).getPropertyValue(styleProp);
        }
        return null;
    }
    static getComputedStyle(element, styleProp) {
        let cs = element.getCurrentStyle(element, styleProp);
        return sc.content;
    }
    static getScrrenOffset(el) {

        let b = el.getBoundingClientRect();

        return { top: b.top, left: b.left };
    }















    constructor(options) {
        options = Bbnk.OptionsCheck(options);
        super(options);
        this.$fields = {};//Nesneni fieldeleri burada gizlenir(G,z onunce alinir)
        this.$fields.Parent = null;
        this.$fields.children = [];
        this.$fields.Actions = {

        }
        this.$fields.Propertys = {};
        this.$fields.Slaves = [];
        this.$fields.Master = null;
        this.$fields.relatedActions = [];
        Bbnk.addObject(this);
        this.$fields.Options = options;
    }
    get Options() {
        return this.$fields.Options;
    }
    RunInit() {
        if (typeof this.Options["Init"] === "function") {
            let fname = Bbnk.funcId;
            this[fname] = this.Options.Init;
            try {
                this[fname]();
            } catch (e) {
                let x = 0;
            }
            delete this[fname];
        }

        if (this.Options.Value !== undefined) this.Value = this.Options.Value;
        if (this.Options.Master !== undefined) this.Master = this.Options.Master;
        if (this.Options.Parent !== undefined) this.Parent = this.Options.Parent;
    }
    Clear() { //Nesnenin icini temizler

        


        this.Master = null;//Nesne Master inden ayriliyor
        while (this.Children.length > 0) {
            this.Children[0].Dispose();
        }
    }
    Dispose() {

        this.RunAction("onDisposing");
        //Target i bu olan action lar silindi
        while (this.$fields.relatedActions.length) {
            let action = this.$fields.relatedActions[0];

            let s = action.source.$fields.Actions[action.name];
            let index = s.indexOf(action);
            if (index !== -1) s.splice(index, 1);
            this.$fields.relatedActions.splice(0, 1);

        }


        //Kaynagi bu olan actionlar silindi 
        let keys = Object.keys(this.$fields.Actions);
        for (let i = 0; i < keys.length; i++) {
            let actions = this.$fields.Actions[keys[i]];
            while (actions.length > 0) {
                let action = actions[0];
                let index = action.source.$fields.relatedActions.indexOf(action);
                if (index !== -1)
                    action.source.$fields.relatedActions.splice(index, 1);
                actions.splice(0, 1);
            }

        }

        // Nesneye ait Slave nesnel serbest birakiliyor;
        while (this.$fields.Slaves.length > 0) {
            this.$fields.Slaves[0].Master = null;
        }

        this.Clear();
        this.Parent = null;
        Bbnk.removeObject(this);
        
    }
    get ID() { return this.$fields.ID; }
    get isBbnk() { return true; }
    //toString ayarlaniyor
    toString() {
        let res = "";
        let v1 = this.Value;
        let v2 = this.readValue();

        if (typeof v1 === "string") res = "\"" + v1.toString() + "\""; else res = v1.toString();

        if (this.isDirty === true) {
            
            if (typeof v1 === "string") v1 = "\"" + v1.toString() + "\""; else v1 = v1.toString();
            if (typeof v2 === "string") v2 = "\"" + v2.toString() + "\""; else v2 = v2.toString();
            res = "Dirty(" + v1 + " , " + v2 + ")";
        }
        return res;
    }
    //Parent Child yapisi Kuruluyor
    getChildren() {
        return this.$fields.children;
    }
    get Children() {
        return this.getChildren();
    }
    get Index() {
        if (this.$fields.Parent != null) {
            return this.$fields.Parent.$fields.children.indexOf(this);
        }
        return -1;
    }
    getParent() {
        return this.$fields.Parent;
    }
    setParent(value) {
      
        if (value === undefined) value = null;
        if (value !== null) {
            if (value.isBbnk !== true) value = null;
        } 

        let index = this.Index;
        if (index !== -1) {
            this.$fields.Parent.$fields.children.splice(index, 1);
        }
        this.$fields.Parent = value;
        if (this.$fields.Parent != null) {
            this.$fields.Parent.$fields.children.push(this);
        }

    }
    get Parent() {
        return this.getParent();
    }
    set Parent(value) {
        let old = this.Parent;
        this.setParent(value);
        this.RunAction("onSetParent", { oldParent: old, newParent: this.Parent });

        if (!Bbnk.deepEqual(old, this.Parent)) this.RunAction("onChangeParent", { oldParent: old, newParent: this.Parent });
        if (old !== this.Parent) {
            if (old !== null) {
                old.RunAction("onRemoveChild", this)
            }
            if (this.Parent != null) this.Parent.RunAction("onAddChild", this);
        }
    }
    // Value Mekanizmasi Kuruluyor
    readValue() {
        return this.$fields.actuelValue;
    }
    writeValue(value) {
        this.$fields.actuelValue = value;
    }
    getValue() {
        return this.$fields.value;
    }
    setValue(value) {
        this.$fields.value = value;
    }
    _getValue() {
        if (this.Master != null) return this.Master.Value;
        return this.getValue();
    }
    _refreshSlaves(newValue,oldValue) {
        for (let slave of this.$fields.Slaves) {
            slave.RunAction("onSetMasterValue", {
                newValue: newValue,
                oldValue:oldValue
            });
            if (!Bbnk.deepEqual(newValue, oldValue)) slave.RunAction("onChangedMasterValue", {
                newValue: newValue,
                oldValue: oldValue
            });
            slave._refreshSlaves(newValue, oldValue);
        }
    }
    _setValue(value) {
        if (this.Master != null) {
            this.Master._setValue(value);
            return;
        }
        let old = this.getValue();
        this.setValue(value);
        this.Apply();
        this._refreshSlaves(this.getValue(),old);
    }
    get isDirty() {
        return !Bbnk.deepEqual(this.getValue(), this.readValue());
    }
    get Value() {
        
        return this._getValue();
    }
    set Value(value) {
        this._setValue(value);
        
    }
    Apply() {
        let av = this.readValue();
        let v = this.getValue();
        if (!Bbnk.deepEqual(av, v)) {
            this.RunAction("onApply", { av: av, v: v });
            this.writeValue(v);
        }
    }
    Cancel() {
        let av = this.readValue();
        let v = this.getValue();
        if (!Bbnk.deepEqual(av, v)) {
            this.RunAction("onCancel", { av: av, v: v });
            this.setValue(av);
        }
    }
    // Object Action Mekanizmasi 
    AddAction() {
        let args=arguments
        let name;
        let target;
        let options=[];
        let action;
        //Yukarida tanimlanmis degiskenler args in iceriginden cikarilacak
        // Karsilastigi ilk string name yapilir
        // karsilastigi ilk Bbnk object target yapilir
        // karsilastigi ilk fonksiyon action yapilir 
        // digerleri options icinde biriktirilir
        for (let part of args) {
            let t = typeof part;
            let islendi = false;

            if (!islendi && (t === "string") && (name === undefined)) { name = part; islendi = true; }// action name bulunuyor 
            if (!islendi && (t === "object") && (target === undefined)) {
                if (part.isBbnk === true) {
                    target = part; // Action nun target i bulunuyor
                    islendi = true;
                }
            }
            if (!islendi && (t === "function") && (action === undefined)) { action = part; islendi = true; }// action function u  bulunuyor
            if (!islendi) {
                options.push(part);
            }
        }
        if (target === undefined) target = this; // bu action hangi nesnein uzerinde calisacagini belirler
        let actionItem = {
            target: target,
            name: name,
            action: action,
            options: options,
            source:this,
        }
        //Action item olusturuldu
        //Nesnenin  actionlari icinde aranir

        if (this.$fields.Actions[actionItem.name] === undefined) this.$fields.Actions[actionItem.name] = [];
        let actions = this.$fields.Actions[actionItem.name];
        actions.push(actionItem);
        actionItem.target.$fields.relatedActions.push(actionItem);//action nun hedefine bu action ekleniyor
                                                           //Hedfe dispose edilirlen bu action da silinmeli cunki 


    }
    RunAction(name, options) {
        let actionlist = this.$fields.Actions[name]
        if (actionlist === undefined) return;
        for (let action of actionlist) {

            try {
                let func = Bbnk.funcId;
                action.target[func] = action.action;
                action.target[func](options, action);
                delete action.target[func];
            } catch (e) {
                let x = 0;
            }

        }
    }
    //Master Slave Mekanizmasi Kuruluyor
    get Master() {
        return this.$fields.Master;
    }
    set Master(value) {
        if (value === undefined) value = null;
        if (value!==null) {
            if (value.isBbnk !== true) value = null;
        } 


        if (this.$fields.Master !== null) {
            let index = this.$fields.Master.$fields.Slaves.indexOf(this);
            this.$fields.Master.$fields.Slaves.splice(index, 1);
        }

        this.$fields.Master = value;
        if (this.$fields.Master !== null) {
            this.$fields.Master.$fields.Slaves.push(this);
        }
    }
    // Object Interval Mekanizmasi Kuruluyor
    get IntervalEnable() {
        return this.$fields.IntervalHandle !== undefined;
    }
    set IntervalEnable(value) {
        value = value === true;
        if (this.$fields.IntervalHandle != undefined) {
            clearInterval(this.$fields.IntervalHandle);
            this.$fields.IntervalHandle = undefined;
        }
        if (value === true) {
            this.$fields.IntervalHandle = setInterval(function (t) {
                t.RunAction("onInterval")
            }, this.IntervalTime, this);
        }
    }
    get IntervalTime() {
        if (this.$fields.IntervalTime === undefined) return 10000;
        return this.$fields.IntervalTime;
    }
    set IntervalTime(value) {
        this.$fields.IntervalTime = value;
        let old = this.IntervalEnable;
        this.IntervalEnable = false;
        this.IntervalEnable = old;
    }
    getText() {
        return this.Value.toString();
    }
    setText(value) {
        this.Value = value;
    }
    get Text() {
        return this.getText();
    }
    set Text(value) {
        this.setText(value);
    }



    AddProperty(name,init) {
        let p = Bbnk.PropertyCollection[name];
        if (p !== null) {
            let property = new p({ Init: init })
            this.$fields.Propertys[name] = property;
            property.Text = name;
            property.Target = this;
        }

    }
    AddPropertys() {
    }
    ApplyPropertys() {
        let keys = Object.keys(this.$fields.Propertys);
        for (let key of keys) {
            let property = this.$fields.Propertys[key];
            property.Apply();
        }
    }

    RunParent(name, data) {
        if (typeof this[name] === "function") {
            let res;
            try {
                res=this[name](data);
            } catch (e) {

            }
            return res;
        }
        if (this.Parent !== null)
            return this.Parent.RunParent(name, data);
    }

   
}
Bbnk.TimeOut = class extends Bbnk {
    constructor(time, target, action) {
        super();
        this.Time = time;
        this.Action = action;
        this.Target = target;
    }

    stop() {
        if (this.timeouthandle !== undefined) {
            clearTimeout(this.timeouthandle);
            this.timeouthandle = undefined;
        }
    }
    start(time) {
        this.stop();

        let t = this.Time;
        if (time !== undefined) t = time;
        this.timeouthandle = setTimeout(function (t) {
            if (t.Target != undefined) {
                let name = Bbnk.funcId;
                t.Target[name] = t.Action;
                try {
                    t.Target[name]();
                } catch (e) {

                }
                delete t.Target[name];
            }
        },t,this)
    }
    reset() {
        this.stop();
        this.start();
    }
}
Bbnk.Json = class extends Bbnk {
    constructor(options) {
        super(options);

    }

    getChildren() {
        let res = [];
        //let keys = Bbnk.getAllProperties(this.Value);
        let keys = Object.keys(this.Value);
        for (let key of keys) {
            try {
                let i = Bbnk.New("Json", { ItemText: key, Value: this.Value[key] })
                res.push(i);
            } catch (e) {
                let x = 0;
            }
        }
        return res;
    }
    getText() {
        return this.Options.ItemText;
    }
}

Bbnk.Property = class extends Bbnk {
    constructor(options) {
        super(options);
    }
    getText() {
        return this.$fields.Text;
    }
    setText(value) {
        this.$fields.Text = value;
    }
    get isProperty() { return true; }

    readValue() {
       
    }

    writeValue(value) {
       
    }

    get SumBox() {

    }

    get SumBoxText() {
        return "**dddddddddddddd***";
    }

    Probe() {
        let res = Bbnk.New("PropertyProbe", {
            Source:this,
        })
        return res
    }
    get EditorType() {
        return Bbnk.PropertyEditor;
    }
    Edit() {
        let e = Bbnk.New(this.EditorType,{
            Init: function () {
                this.Parent = Bbnk.Body;
            }
        });
        e.Title = "Editor " + this.Text;
        e.MakeModal();
    }

}
Bbnk.PropertyProbe = class extends Bbnk {
    constructor(options) {
        super(options);
        this.Source = this.Options.Source;
    }
    getText() {
        return this.Source.Text;
    }
    setText(value) {
        this.Source.Text = value;
    }
    get isProperty() { return true; }

    readValue() {
        return this.Source.readValue();
    }

    writeValue(value) {
        this.Source.writeValue(value);
    }
    getValue() {
        return this.Source.getValue();
    }
    setValue() {
        this.Source.setValue(value);
    }
    get SumBoxText() {
        return this.Source.SumBoxText;
    }

    get SumBox() {
        let d = Bbnk.New("Dom", {
            Property:this,
            Init: function () {
                this.AddClass("BbnkPropertySumBox");
               
               
                this.Icon = Bbnk.New("Dom", {
                    tagName: "i", Class: "bi bi-pen ItemIcon", Parent: this,
                    Init: function () {
                        this.AddClass("BbnkPropertySumBoxButton")
    
                    }
                })
                this.text = Bbnk.New("Dom", {
                    tagName: "div",
                    Parent: this,
                    Value: this.Options.Property.SumBoxText,
                    Class: "SumBoxText",
                    Init: function () {

                    }
                })
            }
        })
        d.Icon.AddAction("onMouseDown", this.Source, function (ev) {
            ev.cancelBubble = true;
            this.Edit();

        })
        return d;
    }

}

Bbnk.MenuItem = class extends Bbnk {
    static New(text, action, children) {
        let m = Bbnk.New(Bbnk.MenuItem, {
            text: text,
            action:action
        })
        if (Bbnk.isArray(children)) {
            if (children.length > 0) {
                if (Bbnk.isArray(children[0]) === true) {
                    for (let c of children[0]) {
                        c.Parent = m;
                    }
                }
            }
        }
        return m;
    }

    static NewSeperator() {
        return Bbnk.MenuItem.New("");
    }
    constructor(options) {
        super(options);
        if (Bbnk.isArray(this.Options.children) === true) {
            for (let c of this.Options.children) {
                c.Parent = this;
            }
        }
        
        this.Defaults = {
            Checkable: false,
            HasImage: false,
            Expandable:true
        };
    }
    RunInit() {
        super.RunInit();
        
    }
    getText() {
        return this.Options.text;
    }
    get Action() {
        return this.Options.action;
    }
}
// Bbnk Kutuphanesinde Bbnk Class ozellikleri ile 
//Dom lari kullanmak icin 
Bbnk.Dom = class extends Bbnk {
    constructor(options) {
        super(options);
        //Options da Element gelirse  o kullanilacak
        //Eger gelmez ise  Optionda gelen 
        // tagName ve tagType kullanilarak
        // Element olusturulur
        // Bunlarda gelmez ise 
        // tagName-- > div  
        // tagType-- > null olarak alinir
        if (this.Element === undefined) {
            if (this.Options.tagName == undefined) this.Options.tagName = "div";
            if (this.Options.tagType == undefined) this.Options.tagType = null;
            this.Options.element = document.createElement(this.Options.tagName);
            this.Options.element.type = this.Options.tagType;
        } else {

        }
        if (this.Element.$bbnk === undefined) {
            this.Element.$bbnk = this;
            //Dom element ile  Bbnk.Dom iliskilendirilir
        }

        this.$contextmenu = [];

        this.AddAction("onMouseMoveReport", function (movedata) {
            if (this.MoveTarget !== undefined) {
                this.RunAction("onMove", movedata);
                return;
            }
            let x = 0;
            if ((movedata.dx > 5) || (movedata.dy > 5)) {
                let x = 0;
            }

            if (this.MoveActionTarget === undefined) {
                this.X = movedata.dPos.X - movedata.dx;
                this.Y = movedata.dPos.Y - movedata.dy;
            }
            this.RunAction("onMove", movedata);

        }
        );
        this.AddAction("onChangedSize", function () {
            if (this.Split != undefined) {
                if (this.isMaxSplit) {
                    this.SplitPos = this.SplitMaxPos;
                }
                else this.SplitPos = this.SplitPos;
            }
        })
        // Dom un mouse eventleri yakalanir
        // uygun Action clistirilir

        this.Element.addEventListener('contextmenu', function (ev) {
            //return;
            if (Bbnk.pressedKeys !== undefined) {
                if (Bbnk.pressedKeys.Control === true)
                    return;
            }
            let e = ev.currentTarget.$bbnk;
            
            if (Bbnk.isArray(e.$Contextmenu) !== true) return;
            if (e.$Contextmenu.length === 0) return;
            ev.preventDefault();
            e.OpenContextmenu(ev);
            ev.cancelBubble = true;
        });
        this.Element.addEventListener('dragstart', function (ev) {
            ev.preventDefault();
        });
        this.Element.addEventListener("mousedown", function (ev) {
            let e = ev.currentTarget.$bbnk;
            e.BringToFront();
            if (e.isMoveable === true) {
                e.setMaxZindex();
                let cx = 0;
                let cy = 0;
                if (e.MoveTarget !== undefined) {

                    cx = e.MoveTarget.SX - e.MoveTarget.Parent.SX;
                    cy = e.MoveTarget.SY - e.MoveTarget.Parent.SY;
                }

                let tw = 0;
                let th = 0;
                let tx = 0;
                let ty = 0;
                if (e.MoveActionTarget != undefined) {
                    tw = e.MoveActionTarget.width;
                    th = e.MoveActionTarget.height;

                }
                if (e.ResizeMoveTarget != undefined) {

                    tx = e.ResizeMoveTarget.X;
                    ty = e.ResizeMoveTarget.Y;
                }
                e.MouseDownPos = {
                    e: ev,
                    SX: e.SX,
                    SY: e.SY,
                    TW: tw,
                    TH: th,
                    TX: tx,
                    TY: ty,
                    CX: cx,
                    CY: cy,
                    X: e.X,
                    Y: e.Y,
                    source: e
                }
                e.RunAction("onMouseDownForMoveView", e.MouseDownPos);
                Bbnk.CurrentMouseMoveElement = e;
                ev.cancelBubble = true;
                return;
            }
            try {

                ev.currentTarget.$bbnk.RunAction("onMouseDown", ev);

            } catch (e) {
                let x = 0;
            }


        })

        this.Element.addEventListener('mouseenter', function (ev) {
            ev.currentTarget.$bbnk.RunAction("onMouseEnter", ev);
        });
        this.Element.addEventListener('mouseleave', function (ev) {
            ev.currentTarget.$bbnk.RunAction("onMouseLeave", ev);
        });
        this.Element.addEventListener('mousemove', function (ev) {
            ev.currentTarget.$bbnk.RunAction("onMouseMove", ev);
        });
        this.ContextMenuTitle = "Dom Element Menu";

        this.AddClass("Bbnk");
    }

    //Bu ozellik chatGpt den alindi ama denenmedi
    StartObserver(config) {
        this.$fields.observer = new MutationObserver(this.ObserverCallback);
        let targetNode = this.Element;
        //const config = { attributes: true, childList: true, subtree: true };

        // Gözlemlemeyi başlat
        this.$fields.observer.observe(targetNode, config);
    }
    ObserverCallback(mutationsList, observer) {
        for (const mutation of mutationsList) {
            if (mutation.type === 'childList') {
                console.log('Bir çocuk eklendi veya kaldırıldı.');
            } else if (mutation.type === 'attributes') {
                console.log('Bir öznitelik değişti.');
            }
        }
    };

    //Bu ozellik chatGpt den alindi  element in size degisince
    //onChangedSize action u calistirilir

    StartResizeObserver() {
        this.resizerstarted = true;
        const resizeObserver = new ResizeObserver(entries => {
            for (let entry of entries) {
                const cr = entry.contentRect;
                entry.target.$bbnk.RunAction("onChangedSize");
            }
        });
        resizeObserver.observe(this.Element);
    }

    get stayVisibleWithinParent() {
        return this.$fields.stayVisibleWithinParent;
    }

    findFromParents(check) {
        let res;
        let n = Bbnk.funcId;
        this[n] = check;
        try {
            res = this[n]();
        } catch (e) {

        }
        delete this[n];
        if (res !== undefined) return res;
        if (this.Parent !== null) return this.Parent.findFromParents(check);
    }
    MakestayVisibleWithinParent() {
        if (this.Parent !== null) {
            let w = window.innerWidth - 5;
            let h = window.innerHeight - 5;
            if ((this.X + this.width) > w) this.X = w - this.width;
            if ((this.Y + this.height) > h) this.Y = h - this.height;
            if (this.X < 5) this.X = 5;
            if (this.Y < 5) this.Y = 5;
        }
    }
    set stayVisibleWithinParent(value) {
        value = value === true;
        if (this.stayVisibleWithinParentIntervalHandel !== undefined) {
            clearInterval(this.stayVisibleWithinParentIntervalHandel);
            this.stayVisibleWithinParentIntervalHandel = undefined;
        }
        this.$fields.stayVisibleWithinParent = value;
        if (value === true) {
            this.stayVisibleWithinParentIntervalHandel = setInterval(function (t) {
                t.MakestayVisibleWithinParent();

            },100,this)
        }
    }
    InsertBefore(newobj) {
        this.Parent.Element.insertBefore(newobj.Element, this.Element);
        return newobj;
    }
    getDock() {
        return this.$fields.Dock;
    }
    setDock(value) {
        this.$fields.Dock = value;
        if (this.Dock === "fill") {
            this.AddClass("BbnkDock-fill");
        } else {
            this.RemoveClass("BbnkDock-fill");
        }
    }
    get Dock() {
        return this.getDock();
    }
    set Dock(value) {
        this.setDock(value);
    }
    BringToFront() {
        if (this.MoveTarget !== undefined) {
            this.MoveTarget.BringToFront();
            return;
        }
        this.setMaxZindex();
    }

    RunInit() {
        super.RunInit();
        if (typeof this.Options.Class === "string")
            this.AddClass(this.Options.Class);
        if (typeof this.Options.Style === "string")
            this.AddStyle(this.Options.Class);
        this.initChildren();
    }
    toString() {
        return this.Element.nodeName;
    }
    initChildren() {
        let children = this.Children;
        for (let child of children) {
            child.initChildren();
        }
    }
    get Element() {
        return this.Options.element;
    }
    get isDom() { return true; }
    get $Contextmenu() {
        let res = [];
        this.AddContextMenuItems(res);
        return res;
    }
    get ContextMenuList() {
        let m = this.$fields["ContextMenu" + this.ID];
        if (m === undefined) {
            this.$fields["ContextMenu" + this.ID] = [];
             m = this.$fields["ContextMenu" + this.ID];
        }
        return m;
    }
    InitContextmenu() {
       
      /*  this.ContextMenuList.push(Bbnk.MenuItem.NewSeperator());*/
        //this.ContextMenuList.push(Bbnk.MenuItem.New("Base Element", "", [
        //    Bbnk.MenuItem.New("Info", function () {

        //    }),
        //    Bbnk.MenuItem.New("Help", function () {

        //    })

        //]));
        
    }
    AddContextMenuItems(menucontainer) {
        let ml = this.$fields["ContextMenu" + this.ID];        
        for (let m of ml ) {
            menucontainer.push(m);
        }
    }
    OpenPopUpMenu() {
        let m = Bbnk.New("Dom", {
            Class: "BbnkMenu",
            Parent: Bbnk.Body,
            Source: this,
            Init: function () {
                this.stayVisibleWithinParent = true;
                
                this.timeout = new Bbnk.TimeOut(500, this, function () {
                    this.Dispose();
                })

                this.AddAction("onMouseEnter", function () {
                    this.timeout.stop();
                })
                this.AddAction("onMouseLeave", function () {
                    this.timeout.start();
                })
                this.MakeMoveable = function () {
                    this.Title.isMoveable = true;
                    this.Element.style.position = "absolute";
                    this.Title.Form = this;
                    this.Title.style.cursor = "move";
                    this.Title.MoveTarget = this;
                    this.Title.AddAction("onMove", this, function (px) {
                        let x = 0;
                        this.X = px.dPos.CX - px.dx;
                        this.Y = px.dPos.CY - px.dy;
                        if (this.X < 0) this.X = 0;
                        if (this.Y < 0) this.Y = 0;
                        let w = this.Parent.width - 2;
                        let h = this.Parent.height - 2;
                        if (this.X + this.width > w) this.X = w - this.width;
                        if (this.Y + this.height > h) this.Y = h - this.height;

                    });
                }
                setTimeout(function (t) {
                    t.MakestayVisibleWithinParent();
                }, 10, this);

            }

        });
        return m;
    }
    OpenContextmenu(ev) {
        
        let m = this.OpenPopUpMenu();
        m.AA = ev;
        m.X = ev.clientX - 10;
        m.Y = ev.clientY - 10;


        let cml = this.$Contextmenu;
        m.Title=Bbnk.New("Dom", {
            Class: "BbnkMenuTitle",
            Parent: m,
            Value: this.ContextMenuTitle

        })
        try {
            m.MakeMoveable();
        } catch (e) {
            let x = 0;
        }
        for (let item of cml) {
            if (item.Text === "") {
                Bbnk.New("Dom", {
                    Parent: m,
                    Class: "MenuSeperator",
                })
            }
            else {
                let i = Bbnk.New("Item", {
                    isRoot: true, Parent: m, Value: item, ItemInit: function () {

                        if (this.Options.Defaults === undefined) {
                            this.Options.Defaults = {};

                        }
                        if (this.Options.Value !== undefined) {
                            if (this.Options.Value.Defaults !== undefined) {
                                let keys = Object.keys(this.Options.Value.Defaults);
                                for (var i = 0; i < keys.length; i++) {
                                    this.Options.Defaults[keys[i]] = this.Options.Value.Defaults[keys[i]];
                                }

                            }
                        }
                    }
                })
                i.pBody.AddClass("MenuItem");
            }
        }

        m.Target = this;
        m.EV = ev;
        setTimeout(function () {
            m.setMaxZindex();
        },100,m)
        
        m.ItemClick = function (data) {

            let menu = data[0].Value;
            if (menu.Children.length!==0) {
                data[0].Open = !data[0].Open;
                return;
            }

            //else {
            //    let n = Bbnk.funcId;
            //    this.Target[n] = data[0].Value.Action;
            //    try {
            //        let args = [];

            //        this.Target[n]({ d: data, ev: this.EV, target: this.Target });
            //    } catch (e) {

            //    }
            //    delete this.Target[n];

            //}
            let result = {};
            if (typeof menu.Action === "function") {
                try {
                    menu.Action({ result: result, d: data, ev: this.EV, target: this.Target });
                } catch (e) {
                    let x = 0;
                }
            }
            
            this.Target.RunAction("onItemClick", { result: result, d: data, ev: this.EV, target: this.Target });
            if (result.Close === true)
                this.Dispose();
            

            
        }
        ev.cancelBubble = true;

    }
    get isRoot() { return this.Options.isRoot === true; }
    // Parent ve Children  ozellikleri Dom ile uyumlu yapilir
    getParent() {
        if (!Bbnk.isDOMElement(this.Element)) return null;
        let res = this.Element.parentNode;
        if (res === null) return null;
        if (res === undefined) return null;
        if (!Bbnk.isDOMElement(res)) return null;
        if (res.$bbnk === undefined) return null;
        if (res.$bbnk === null) {
            res = Bbnk.New("Dom", { element: res });
        }
        res = res.$bbnk;
        if (res === Bbnk.NullContainer) return null;
        return res;
    }
    setParent(value) {
        if (value === undefined) value = null;
        if (value != null) {
            if (Bbnk.isDOMElement(value)){
                if (value.$bbnk === undefined) {
                    value = Bbnk.New("Dom", { element: value });
                }
            } else {
                if (value.isDom !== true) value = null;
            }
        }

        if (value === null) {
            Bbnk.NullContainer.Element.appendChild(this.Element);
        } else {
            value.Element.appendChild(this.Element);
        }
    }

    getChildren() {
        let childs = this.Element.childNodes;
        let res = [];
        for (let e of  childs) {
            if (e !== null) {
                if (e.$bbnk === undefined) {
                    e = Bbnk.New("Dom", { element: e });
                } else e = e.$bbnk;
            }
            res.push(e);
        }
        return res;
    }

    AddClass(value) {
        if (this.Element.classList === undefined) return;
        let a = value.split(' ');
        for (let cp of a) {
            if (!this.Element.classList.contains(cp)) {
                try {
                    if (cp !== "") {
                        
                            this.Element.classList.add(cp);
                    }
                } catch (e) {

                }
            }
        }
        
    }
    RemoveClass(value) {
        if (this.Element.classList === undefined) return;
        let a = value.split(' ');
        for (let cp of a) {
            if (this.Element.classList.contains(cp)) {                
                try {
                    if (cp !== "")
                        
                            this.Element.classList.remove(cp);
                } catch (e) {

                }
            }
        }

    }
    ClassSet(value, set) {
        if (typeof value === "boolean") value = (value === true) ? 1 : 0;
        this.AddClass(set[value]);
        for (var i = 0; i < set.length; i++) {
            if (i !== value) this.RemoveClass(set[i]);
        }
    }
    AddStyle(style) {
        if (typeof style !== "string") return;
        let parts = style.split(';');
        for (let part of parts) {
            let px = part.split(':');

            let styleName = "";
            let makeupper = false;
            for (var i = 0; i < px[0].length; i++) {
                
                if (px[0][i] !== '-') {
                    let c = px[0][i]
                    if (makeupper) c = c.toUpperCase();
                    styleName += c;
                    makeupper = false;
                } else {
                    makeupper = true;
                }
            }
            this.Element.style[styleName] = px[1];
        }
    }



    get DisplayEnable() {
        return !this.Element.classList.contains("BbnkDisplayHide")
    }

    set DisplayEnable(value) {
        if (value === true) {
            this.RemoveClass("BbnkDisplayHide");
        } else {
            this.AddClass("BbnkDisplayHide");
        }
    }

    readValue() {
        let e = this.Element;
        let tagName = e.nodeName.toUpperCase();
        if (e.value !== undefined) return e.value;
        if (tagName === "IMG") {
            return e.src;
        }
        return e.innerHTML;
    }
    writeValue(value) {
        let e = this.Element;
        let tagName = e.nodeName.toUpperCase();
        if (e.value !== undefined) {
            e.value = value;
            return;
        }
        if (tagName === "IMG") {
            e.src = value;
            return;
        }
        e.innerHTML = value;
    }


    //MakeModal() {
    //    this.ModalPanel1 = Bbnk.New("Dom", {
    //        Class: "BbnkModalPanel1",
    //        Parent: Bbnk.Body,
    //        Init: function () {

    //        }

    //    })
    //    this.ModalPanel2 = Bbnk.New("Dom", {
    //        Class: "BbnkModalPanel2",
    //        Parent: Bbnk.Body,
    //        Init: function () {


    //        }

    //    })
    //    this.ModalPanelContainer = Bbnk.New("Dom", {
    //        Class: "BbnkModalPanelContainer",
    //        Parent: this.ModalPanel2,
    //        Init: function () {


    //        }

    //    })
    //    this.Parent = this.ModalPanelContainer;
    //}


    setMaxZindex() {
        let zindex = Bbnk.MaxZIndex;
        if (zindex === undefined) zindex = 0;
        this.style.zIndex = zindex + 1;
    }
    _MakeModal() {
        this.$fields.ModalPanel = Bbnk.New("Dom", {
            Class: "BbnkModalPanel",
            Parent: Bbnk.Desktop,
            Init: function () {
                this.setMaxZindex();
            }
        });
        let x = this.SX;
        let y = this.SY;
        this.setMaxZindex();

        this.AddStyle("Position:absolute");
        this.Parent = Bbnk.Desktop;
    }
    MakeModal() {
        setTimeout(function (t) {
            t._MakeModal();
        },100,this)
    }
    Dispose() {
        if (this.$fields.ModalPanel !== undefined) {
            this.$fields.ModalPanel.Dispose();
            this.$fields.ModalPanel = undefined;
        }
        this.Parent = null;
        if (this.ModalPanel1 !== undefined) this.ModalPanel1.Dispose();
        if (this.ModalPanel2 !== undefined) this.ModalPanel2.Dispose();
        super.Dispose();
    }


    MakeMoveable() {
        this.isMoveable = true;
        this.AddStyle("position:absolute;");
        this.BringToFront = function () {
            try {
                this.MoveActionTarget.BringToFront();
            } catch (e) {

            }
        }
    }
    MakeResizeable(target) {
        if (this.resizer === undefined) {
            this.resizer = Bbnk.New("Dom", {
                Parent: this,
                Init: function () {
                    this.AddClass("bbnkResizer")
                    this.MakeMoveable();
                    

                    this.MoveActionTarget = target;
                    this.BringToFront = function () {
                        try {
                            this.MoveActionTarget.BringToFront();
                        } catch (e) {

                        }
                    }
                }
            });
           
            
            this.resizer.AddAction("onMove", this, function (a,b) {
                if (b.source.MoveActionTarget !== undefined) {
                    let t = b.source.MoveActionTarget;
                    t.width = a.dPos.TW - a.dx;
                    t.height = a.dPos.TH - a.dy;
                    return;
                }
                this.height = this.resizer.Y + this.resizer.height+2 ;
                this.width = this.resizer.X + this.resizer.width+2;

            });
        }
        this.AddClass("bbnkResizeable");
    }







    get style() {
        return this.Element.style;
    }
    getCurrentStyle(styleProp) {
        if (this.Element.currentStyle) {
            return this.Element.currentStyle[styleProp];
        } else if (window.getComputedStyle) {
            return window.getComputedStyle(this.Element, null).getPropertyValue(styleProp);
        }
        return null;
    }
    getComputedStyle(styleProp) {
        var compStyles = window.getComputedStyle(this.Element)
        var res = compStyles.getPropertyValue(styleProp);
        return res;
    }
    getBoundingClientRect() {
        return this.Element.getBoundingClientRect();
    }
    get BoundingClientRect() {
        let b = this.getBoundingClientRect();
        return b;
    }
    get SX() {
        var o = Bbnk.getScrrenOffset(this.Element);
        return o.left;
    }
    get SY() {
        var o = Bbnk.getScrrenOffset(this.Element);
        return o.top;
    }
    get X() {

        return Bbnk.toInt(this.getComputedStyle("left"));
    }
    set X(v) {

        var change = v !== this.X;
        this.style.left = Bbnk.toPx(v);

    }
    get Y() {

        return Bbnk.toInt(this.getComputedStyle("top"));
    }
    set Y(v) {

        var change = v !== this.X;
        this.style.top = Bbnk.toPx(v);

    }
    get B() {

        return Bbnk.toInt(this.getComputedStyle("bottom"));
    }
    set B(v) {

        this.style.bottom = Bbnk.toPx(v);
    }
    get R() {

        return Bbnk.toInt(this.getComputedStyle("right"));
    }
    set R(v) {

        this.style.right = Bbnk.toPx(v);
    }
    get height() {
        var res = this.getBoundingClientRect().height;
        return res;
    }
    set height(value) {
        this.Element.style.height = value + "px";
    }
    get width() {
        var res = this.getBoundingClientRect().width;
        return res;
    }
    set width(value) {
        this.Element.style.width = value + "px";
    }

    get Split () {
        return this.$fields.Split;
    }
    set Split (value) {
        this.Clear();
        
        let ok = false;
        if (typeof value !== "string") {
            value = undefined;
        } else {
            value = value.toUpperCase();
            if (value === "H") ok = true;
            if (value === "V") ok = true;
        }
        if (ok !== true) value = undefined;
        this.$fields.Split = value;
        if (this.$fields.Split !== undefined) {
            if (this.resizerstarted !== true) {
                this.StartResizeObserver();
            }
            this.AddStyle("overflow:hidden;");
            this.Panel1 = Bbnk.New("Dom",
                {
                    Parent: this,
                    Class: "BbnkSplitePanel BbnkSplitePanel1",
                    init: function () {

                    }

                }

            )
            this.Splitter = Bbnk.New("Dom",
                {
                    Parent: this,
                    Class: "BbnkSplitter",
                    Init: function () {
                        this.Panel1=this.SplitterPanel = Bbnk.New("Dom", {
                            Parent: this,
                            Class: "BbnkSpliterControlPanel",
                            Init: function () {
                                this.AddStyle("z-index:1000;");
                                setTimeout(function (t) {
                                    t.AddStyle("opacity: 1;");
                                    setTimeout(function (t) {
                                        t.style.opacity = "";
                                    }, 2000, t)
                                }, 100, this)
                                this.ContextMenuTitle = "Split Panel1 Menu";
                                
                            }
                        })
                        this.Panel2 = this.SplitterPanel = Bbnk.New("Dom", {
                            Parent: this,
                            Class: "BbnkSpliterControlPanel",
                            Init: function () {
                                this.AddStyle("z-index:1000; ");
                                this.ContextMenuTitle = "Splite Panel2 Menu";
                                setTimeout(function (t) {
                                    t.AddStyle("opacity: 1;");
                                    setTimeout(function (t) {
                                        t.style.opacity = "";
                                    }, 2000, t)
                                }, 100, this)
                                

                            }
                        })
                        this.ContextMenuTitle = "Spliter Menu";
                            this.ContextMenuList.push(Bbnk.MenuItem.NewSeperator());
                            this.ContextMenuList.push(Bbnk.MenuItem.New("Split Panel", "", [
                                Bbnk.MenuItem.New("Show Panel1", function () {

                                }),
                                Bbnk.MenuItem.New("Show Panel2", function () {

                                }),
                                Bbnk.MenuItem.New("Split %50", function () {

                                })
                            ]));

                    }

                }

            )
            this.SpliterPanel1 = this.Splitter.Panel1;
            this.SpliterPanel2 = this.Splitter.Panel2;
            this.SpliterPanel1.DisplayEnable = false;
            this.SpliterPanel2.DisplayEnable = false;
            this.Panel2 = Bbnk.New("Dom",
                {
                    Parent: this,
                    Class: "BbnkSplitePanel BbnkSplitePanel2",
                    init: function () {

                    }

                }

            )
        }
        this.Splitter.MakeMoveable();
        this.Splitter.MoveActionTarget = this.Splitter;
        switch (this.$fields.Split) {
            case "V":
                this.Splitter.AddAction("onMove", this, function (a,b) {
                    this.SplitPos = a.dPos.Y - (a.dy * 1);

                    
                })  
                this.SpliterPanel1.Icon1 = Bbnk.New("Dom", { tagName: "i", Class: "bi bi-align-top BbnkSpliterPanelButton", Parent: this.SpliterPanel1 });
                this.SpliterPanel1.Icon2 = Bbnk.New("Dom", { tagName: "i", Class: "bi bi-align-middle BbnkSpliterPanelButton", Parent: this.SpliterPanel1 })
                this.SpliterPanel1.Icon3 = Bbnk.New("Dom", { tagName: "i", Class: "bi bi-arrow-clockwise BbnkSpliterPanelButton", Parent: this.SpliterPanel1 })

                this.SpliterPanel2.Icon1 = Bbnk.New("Dom", { tagName: "i", Class: "bi bi-align-bottom BbnkSpliterPanelButton", Parent: this.SpliterPanel2 })
                this.SpliterPanel2.Icon2 = Bbnk.New("Dom", { tagName: "i", Class: "bi bi-align-middle BbnkSpliterPanelButton", Parent: this.SpliterPanel2 })
                this.SpliterPanel2.Icon3 = Bbnk.New("Dom", { tagName: "i", Class: "bi bi-arrow-clockwise BbnkSpliterPanelButton", Parent: this.SpliterPanel2 })


                break;
            case "H":
                this.Splitter.AddAction("onMove", this, function (a,b) {
                   
                    this.SplitPos = a.dPos.X- (a.dx*1);
                })   
                this.SpliterPanel1.AddStyle("flex-direction:column");
                this.SpliterPanel2.AddStyle("flex-direction:column");
                
                this.SpliterPanel1.Icon1 = Bbnk.New("Dom", { tagName: "i", Class: "bi bi-align-start BbnkSpliterPanelButton", Parent: this.SpliterPanel1 });
                this.SpliterPanel1.Icon2 = Bbnk.New("Dom", { tagName: "i", Class: "bi bi-align-center BbnkSpliterPanelButton", Parent: this.SpliterPanel1 })
                this.SpliterPanel1.Icon3 = Bbnk.New("Dom", { tagName: "i", Class: "bi bi-arrow-clockwise BbnkSpliterPanelButton", Parent: this.SpliterPanel1 })

                this.SpliterPanel2.Icon1 = Bbnk.New("Dom", { tagName: "i", Class: "bi bi-align-end BbnkSpliterPanelButton", Parent: this.SpliterPanel2 })
                this.SpliterPanel2.Icon2 = Bbnk.New("Dom", { tagName: "i", Class: "bi bi-align-center BbnkSpliterPanelButton", Parent: this.SpliterPanel2 })
                this.SpliterPanel2.Icon3 = Bbnk.New("Dom", { tagName: "i", Class: "bi bi-arrow-clockwise BbnkSpliterPanelButton", Parent: this.SpliterPanel2 })


                break;
        }
        this.Splitter.AddAction("onMouseEnter", this, function (a, b) {
            this.SpliterPanel1.DisplayEnable = true;
            this.SpliterPanel2.DisplayEnable = true;
            this.SpliterPanel1.AddClass("BbnkSpliterPanelShow");
            this.SpliterPanel2.AddClass("BbnkSpliterPanelShow");
            if (this.Splitter.TimeOutHandle !== undefined) {
                clearTimeout(this.Splitter.TimeOutHandle);
                this.Splitter.TimeOutHandle = undefined;
            }
        })

        this.AddAction("onMouseEnter", this, function (a, b) {
            this.SpliterPanel1.DisplayEnable = true;
            this.SpliterPanel2.DisplayEnable = true;
            this.SpliterPanel1.AddClass("BbnkSpliterPanelShow");
            this.SpliterPanel2.AddClass("BbnkSpliterPanelShow");
            if (this.Splitter.TimeOutHandle !== undefined) {
                clearTimeout(this.Splitter.TimeOutHandle);
                this.Splitter.TimeOutHandle = undefined;
            }
            this.Splitter.TimeOutHandle = setTimeout(function (t) {
                t.SpliterPanel1.DisplayEnable = false;
                t.SpliterPanel2.DisplayEnable = false;
                t.SpliterPanel1.RemoveClass("BbnkSpliterPanelShow");
                t.SpliterPanel2.RemoveClass("BbnkSpliterPanelShow");
            }, 500, this);
        })
        this.Splitter.AddAction("onMouseLeave", this, function (a, b) {
            
            if (this.Splitter.TimeOutHandle !== undefined) {
                clearTimeout(this.Splitter.TimeOutHandle);
                this.Splitter.TimeOutHandle = undefined;
            }
            this.Splitter.TimeOutHandle = setTimeout(function (t) {
                t.SpliterPanel1.DisplayEnable = false;
                t.SpliterPanel2.DisplayEnable = false;
                t.SpliterPanel1.RemoveClass("BbnkSpliterPanelShow");
                t.SpliterPanel2.RemoveClass("BbnkSpliterPanelShow");
            },1000,this);

        })
        this.SpliterPanel1.Icon1.AddAction("onMouseDown", this, function () {
            this.isMaxSplit = false;
            this.PrevPos = this.SplitPos;
            this.SplitPos = 0 - this.SplitWidth;
            this.SpliterPanel2.AddStyle("opacity: 1;")
            setTimeout(function (t) {
                t.AddStyle("opacity:;")
            }, 500, this.SpliterPanel2)
        })
        this.SpliterPanel1.Icon2.AddAction("onMouseDown", this, function () {
            this.isMaxSplit = false;
            this.PrevPos = this.SplitPos;
            this.SplitPos = (this.SplitMaxPos - this.SplitWidth) / 2;
            this.SpliterPanel1.AddStyle("opacity: 1;")
            this.SpliterPanel2.AddStyle("opacity: 1;")
            setTimeout(function (t) {
                t.SpliterPanel1.AddStyle("opacity:;")
                t.SpliterPanel2.AddStyle("opacity:;")
            }, 500, this)
        })
        this.SpliterPanel1.Icon3.AddAction("onMouseDown", this, function () {
            this.isMaxSplit = false;
            this.SplitPos = this.PrevPos;
            this.SpliterPanel1.AddStyle("opacity: 1;")
            this.SpliterPanel2.AddStyle("opacity: 1;")
            setTimeout(function (t) {
                t.SpliterPanel1.AddStyle("opacity:;")
                t.SpliterPanel2.AddStyle("opacity:;")
            }, 500, this)

        })
        this.SpliterPanel2.Icon1.AddAction("onMouseDown", this, function () {
            this.PrevPos = this.SplitPos;
            this.isMaxSplit = true;
            this.SplitPos = this.SplitMaxPos;
            this.SpliterPanel1.AddStyle("opacity: 1;")
            setTimeout(function (t) {
                t.AddStyle("opacity:;")
            }, 500, this.SpliterPanel1)
        })
        this.SpliterPanel2.Icon2.AddAction("onMouseDown", this, function () {
            this.isMaxSplit = false;
            this.PrevPos = this.SplitPos;
            this.SplitPos = (this.SplitMaxPos - this.SplitWidth) / 2;

            this.SpliterPanel1.AddStyle("opacity: 1;")
            this.SpliterPanel2.AddStyle("opacity: 1;")
            setTimeout(function (t) {
                t.SpliterPanel1.AddStyle("opacity:;")
                t.SpliterPanel2.AddStyle("opacity:;")
            }, 500, this)
        })
        this.SpliterPanel2.Icon3.AddAction("onMouseDown", this, function () {
            this.isMaxSplit = false;
            this.SplitPos = this.PrevPos;
            this.SpliterPanel1.AddStyle("opacity: 1;")
            this.SpliterPanel2.AddStyle("opacity: 1;")
            setTimeout(function (t) {
                t.SpliterPanel1.AddStyle("opacity:;")
                t.SpliterPanel2.AddStyle("opacity:;")
            }, 500, this)
        })
        this.SplitPos = this.SplitPos;
        this.RefreshSplit();
    }

    get PrevPos() {
        if (this.$fields.PrevPos === undefined) return this.SplitPos;
        return this.$fields.PrevPos;
    }
    set PrevPos(value) {
        this.$fields.PrevPos = value;
    }
    get SplitPos() {
        if (this.$fields.SplitPos === undefined) this.$fields.SplitPos = 50;
        return this.$fields.SplitPos;
    }
    get SplitMaxPos() {
        switch (this.$fields.Split) {
            case "H":
                return this.width;
                break;
            case "V":
                return this.height;
                break;
        }
    }
    set SplitPos(value) {
        if (value < (0 - this.SplitWidth)) value = 0 - this.SplitWidth;
        if (value > (this.SplitMaxPos)) {
            value = this.SplitMaxPos;
            this.isMaxSplit = true;
        }

        this.$fields.SplitPos = value;
        this.RefreshSplit();
    }
    get SplitWidth() {
        if (this.$fields.SplitWidth === undefined) this.$fields.SplitWidth = 3;
        return this.$fields.SplitWidth;
    }
    set SplitWidth(value) {
        this.$fields.SplitWidth = value;
        this.RefreshSplit();
    }
    RefreshSplit() {

        switch (this.$fields.Split) {
            case "V":

                if (this.SplitPos === "Page1") {
                    this.Panel1.AddStyle("let:0px;top:0px;right:0px;bottom:0px;");
                    this.Panel1.DisplayEnable = true;
                    this.Panel2.DisplayEnable = false;
                    this.Splitter.DisplayEnable = false;
                    return;
                }
                if (this.SplitPos === "Page2") {
                    this.Panel2.AddStyle("let:0px;top:0px;right:0px;bottom:0px;");
                    this.Panel2.DisplayEnable = true;
                    this.Panel1.DisplayEnable = false;
                    this.Splitter.DisplayEnable = false;
                    return;
                }
                this.Splitter.AddStyle("cursor:ns-resize");

                this.Panel1.AddStyle("left:0px;top:0px;right:0px;bottom:auto");
                this.Panel1.height = this.SplitPos; this.Panel1.width = "auto";

                this.Splitter.AddStyle("left:0px;top:auto;right:0px;bottom:auto");
                this.Splitter.Y = this.SplitPos;
                this.Splitter.height = this.SplitWidth; this.Splitter.width = "auto";
              
                this.Panel2.AddStyle("left:0px;right:0px;bottom:0px");
                this.Panel2.height = "auto"; this.Panel1.width = "auto";
                this.Panel2.Y = this.SplitPos + this.SplitWidth;

                this.SpliterPanel1.AddStyle("bottom:auto;top:auto");
                this.SpliterPanel2.AddStyle("bottom:auto;top:auto");
                this.SpliterPanel1.B = this.SplitWidth + 2;
                this.SpliterPanel2.Y = this.SplitWidth + 2;
                this.SpliterPanel1.X = 5;
                this.SpliterPanel2.X = 5;
                break;
            case "H":

                if (this.SplitPos === "Page1") {
                    this.Panel1.AddStyle("let:0px;top:0px;right:0px;bottom:0px;");
                    this.Panel1.DisplayEnable = true;
                    this.Panel2.DisplayEnable = false;
                    this.Splitter.DisplayEnable = false;
                    return;
                }
                if (this.SplitPos === "Page2") {
                    this.Panel2.AddStyle("let:0px;top:0px;right:0px;bottom:0px;");
                    this.Panel2.DisplayEnable = true;
                    this.Panel1.DisplayEnable = false;
                    this.Splitter.DisplayEnable = false;
                    return;
                }
                this.Splitter.AddStyle("cursor:ew-resize");

                this.Panel1.AddStyle("left:0px;top:0px;right:auto;bottom:0px");
                this.Panel1.width = this.SplitPos; this.Panel1.width = "auto";

                this.Splitter.AddStyle("left:auto;top:0px;right:auto;bottom:0px");
                this.Splitter.X = this.SplitPos;
                this.Splitter.width = this.SplitWidth; this.Splitter.width = "auto";

                this.Panel2.AddStyle("left:auto;right:0px;top:0px;bottom:0px");
                this.Panel2.height = "auto"; this.Panel1.width = "auto";
                this.Panel2.X = this.SplitPos + this.SplitWidth;

                this.SpliterPanel1.AddStyle("bottom:auto;top:auto;left:auto;right:auto;");
                this.SpliterPanel2.AddStyle("bottom:auto;top:auto;left:auto;right:auto;");
                
                this.SpliterPanel1.R = this.SplitWidth + 2;
                this.SpliterPanel2.X = this.SplitWidth + 2;
                this.SpliterPanel1.Y = 5;
                this.SpliterPanel2.Y = 5;
                
                break;
        }
    }

}


Bbnk.DesktopItem = class extends Bbnk.Dom {

    constructor(options) {
        super(options);
        this.AddClass("BbnkDesktopItem");

        this.Element.setAttribute("title", "Icon Aciklama");
        this.image = Bbnk.New("Dom", {
            tagName:"img",
            Class: "BbnkDektopItemImage",
            Parent: this
            

        })
        this.text = Bbnk.New("Dom", {
            Class: "BbnkDektopItemText",
            Parent: this


        })
        this.Text = "Item Name";
        this.Image = "Bbnk/Images/Icons/FileSystem/folder.png";
    }
    RunInit() {
        super.RunInit();
        this.ContextMenuTitle = "Desktop Item";
        this.CreateContextMenuList();
        this.MakeMoveable();

    }

    CreateContextMenuList() {
        this.ContextMenuList.push(Bbnk.New(Bbnk.MenuItem, {
            text: "File Commands",
            Init: function () {
                Bbnk.New(Bbnk.MenuItem, {
                    text: "Open",
                    Value: "open",
                    Init: function () {
                        this.isTaskBarpos = true;

                    }
                }).Parent = this;
                Bbnk.New(Bbnk.MenuItem, {
                    text: "Delete",
                    Value: "delete",
                    Init: function () {
                        this.isTaskBarpos = true;

                    }
                }).Parent = this;
                Bbnk.New(Bbnk.MenuItem, {
                    text: "Rename",
                    Value: "rename",
                    Init: function () {

                        this.isTaskBarpos = true;
                    }
                }).Parent = this;
              

            }
        }));
       
    }
    get Image() {
        return this.image.Value;
    }
    set Image(value) {
        this.image.Value = value;
    }
    get Text() {
        return this.text.Value;
    }
    set Text(value) {
        this.text.Value = value;
    }
}


Bbnk.TaskBarItem = class extends Bbnk.Dom {
    constructor(options) {
        super(options);
        this.AddClass("BbnkTaskBarItem");
        this.Element.setAttribute("title", "Icon Aciklama");
     }
    RunInit() {
        super.RunInit();


    }

}
Bbnk.TaskBarLoginPanel = class extends Bbnk.Dom {
    constructor(options) {
        super(options);
        this.AddClass("BbnkDesktopItem BbnkLoginPanel");

        this.Element.setAttribute("title", "Icon Aciklama");
        this.image = Bbnk.New("Dom", {
            tagName: "img",
            Class: "BbnkDektopItemImage",
            Parent: this

        })
        this.text = Bbnk.New("Dom", {
            Class: "BbnkDektopItemText BbnkLoginText",
            Parent: this


        })
        this.Buttont = Bbnk.New(Bbnk.Button, {

            Parent: this,
            Init: function () {
                this.Value = "Login";
            }


        })
        this.Text = "Item Name";
        this.Image = "Bbnk/Images/Icons/FileSystem/folder.png";
    }
    RunInit() {
        super.RunInit();
        this.ContextMenuTitle = "Desktop Item";



    }
  
    get Image() {
        return this.image.Value;
    }
    set Image(value) {
        this.image.Value = value;
    }
    get Text() {
        return this.text.Value;
    }
    set Text(value) {
        this.text.Value = value;
    }

}
Bbnk.TaskBarPowerPanel = class extends Bbnk.Dom {
    constructor(options) {
        super(options);
        this.AddClass("BbnkDesktopItem BbnkPowerPanel");

       
        this.power = Bbnk.New("Dom", {
            tagName: "i",
            Class: "BbnkStartPoweIcon bi bi-power",
            Parent:this,
            Init: function () {
                
            }
        })
        this.power = Bbnk.New("Dom", {
            tagName: "i",
            Class: "BbnkStartPoweIcon bi bi-bootstrap-reboot",
            Parent: this,
            Init: function () {
                
            }
        })
        this.power = Bbnk.New("Dom", {
            tagName: "i",
            Class: "BbnkStartPoweIcon bi bi-pause-btn",
            Parent: this,
            Init: function () {
               
            }
        })
    }
    RunInit() {
        super.RunInit();
        this.ContextMenuTitle = "Desktop Item";



    }

    

}


Bbnk.StartMenuClass = class extends Bbnk.Dom {
    constructor(options) {
        super(options);
        this.timeout = new Bbnk.TimeOut(1000, this, function () {
            Bbnk.StartMenu.Dispose();
            Bbnk.StartMenu = undefined;
        });
        this.AddAction("onMouseEnter", function () { this.timeout.stop(); })
        this.AddAction("onMouseLeave", function () { this.timeout.start(); })
        this.timeout.start(1500);
        this.AddClass("BbnkTaskBarStartMenu");
        this.Parent = Bbnk.Body;
 
        this.StartResizeObserver();
        this.AddAction("onChangedSize", function () {
            this.RefreshSize();
        })
        let p = Bbnk.TaskBar.Position;
        this.setMaxZindex();
        Bbnk.TaskBar.setMaxZindex();

        switch (p) {
            case "bottom":
                this.X = 4;
                this.Y = window.innerHeight;
                break;
            case "top":
                this.X = window.innerWidth;
                this.Y = Bbnk.TaskBar.height + 4;
                break;
            case "left":
                this.X = 0 - this.width;
                this.Y = 4;
                break;
            case "right":
                this.X = window.innerWidth;
                this.Y = window.innerHeight - (this.height+4);
                break;
        }

        setTimeout(function (t) {
            
            t.AddClass("BbnkTaskBarStartMenux");

          
        }, 100, this)

        Bbnk.New(Bbnk.TaskBarLoginPanel, {
            Parent: this
        })
        Bbnk.New(Bbnk.TaskBarPowerPanel, {
            Parent: this
        })
    }
    RefreshSize() {
        let p = Bbnk.TaskBar.Position;
        switch (p) {
            case "bottom":
                this.X = 4;
                this.Y = Bbnk.TaskBar.SY - (this.height + 4);
                break;
            case "top":
                this.X = window.innerWidth - (this.width + 4);
                this.Y = Bbnk.TaskBar.height + 4;
                break;
            case "left":
                this.X = 4 + Bbnk.TaskBar.width;
                this.Y = 4;
                break;
            case "right":
                this.X = window.innerWidth - (this.width + 4 + Bbnk.TaskBar.width);
                this.Y = window.innerHeight - (this.height + 4);
                break;
        }
    }
    RunInit() {
        super.RunInit();


    }
}


Bbnk.TaskBarClass = class extends Bbnk.Dom {
    constructor(options) {
        super(options);
        this.AddClass("BbnkTaskBar");
        this.CreateContextMenuList();
        this.StartResizeObserver();
        this.AddAction("onChangedSize", function () {
            this.Bbnk.Body.resize();
        })
        this.AddAction("onItemClick", function (a,b) {
            a.result.Close = true;
            if (a.d[0].Value.isTaskBarpos === true) {
                Bbnk.TaskBar.Position = a.d[0].Value.Value;
            }
            let x = 0;
        })
        this.Start = Bbnk.New("Dom", {
            Parent: this,
            Class: "BbnkTaskBarStart",
            Value: "BBNK",
            Init: function () {
                this.AddAction("onMouseDown", function () {
                    if (Bbnk.StartMenu !== undefined) {
                        Bbnk.StartMenu.Dispose();
                        Bbnk.StartMenu = undefined;
                    }
                    Bbnk.StartMenu = Bbnk.New(Bbnk.StartMenuClass, {

                        Init: function () {

                           
                           
                            
                        }

                    })
                    
                })

               
            }
        })
        this.TasksPanel = Bbnk.New("Dom", {
            Parent: this,
            Class: "BbnkTasksPanel",
            Value: "",
            Init: function () {

            }
        })
        this.RightPanel = Bbnk.New("Dom", {
            Parent: this,
            Class: "BbnkTaskBarRightPanel",
            Value: "",
            Init: function () {

            }
        })

        

    }
    RunInit() {
        super.RunInit();
        this.AddItem();
        this.Position = "bottom";

    }
    CreateContextMenuList() {
        this.ContextMenuList.push(Bbnk.New(Bbnk.MenuItem, {
            text: "Task Bar Position",
            Init: function () {
                Bbnk.New(Bbnk.MenuItem, {
                    text: "Top",
                    Value:"top",
                    Init: function () {
                        this.isTaskBarpos = true;

                    }
                }).Parent = this;
                Bbnk.New(Bbnk.MenuItem, {
                    text: "Left",
                    Value: "left",
                    Init: function () {
                        this.isTaskBarpos = true;

                    }
                }).Parent = this;
                Bbnk.New(Bbnk.MenuItem, {
                    text: "Right",
                    Value: "right",
                    Init: function () {

                        this.isTaskBarpos = true;
                    }
                }).Parent = this;
                Bbnk.New(Bbnk.MenuItem, {
                    text: "Bottom",
                    Value: "bottom",
                    Init: function () {
                        this.isTaskBarpos = true;

                    }
                }).Parent = this;

            }
        }));
        this.ContextMenuList.push(Bbnk.New(Bbnk.MenuItem, {
            text: "Task Manager",
            Value: "TaskManager",
            Init: function () {


            }
        }))
    }
    get Position() {
        if (this.$fields.Position === undefined) this.$fields.Position = "bottom";
        return this.$fields.Position;
    }
    set Position(value) {
        this.$fields.Position = value;
        Bbnk.Body.resize();
    }

    AddItem(options) {
        options = Bbnk.OptionsCheck(options);
        options.Parent = this.TasksPanel;
        let i = Bbnk.New("TaskBarItem", options);


        return i;
    }
}

Bbnk.MakeFileContainer=function(obj){
    obj.CreateContextMenuList=function() {
        this.ContextMenuList.push(Bbnk.New(Bbnk.MenuItem, {
            text: "New",
            Init: function () {
                Bbnk.New(Bbnk.MenuItem, {
                    text: "Folder",
                    action: function (a,b) {
                        Bbnk.New(Bbnk.DesktopItem, {
                            Parent: a.target,
                            Init: function () {
                                this.X = a.ev.clientX;
                                this.Y = a.ev.clientY;
                            }
                        })
                        a.result.Close = true;
                    },
                    Init: function () {


                    }
                }).Parent = this;
                Bbnk.New(Bbnk.MenuItem, {
                    text: "File",
                    Init: function () {
                        Bbnk.New(Bbnk.MenuItem, {
                            text: "Text File",
                            Init: function () {


                            }
                        }).Parent = this;
                        Bbnk.New(Bbnk.MenuItem, {
                            text: "Javascript File",
                            Init: function () {


                            }
                        }).Parent = this;

                    }
                }).Parent = this;

            }
        }));
    }
}
Bbnk.DesktopClass = class extends Bbnk.Dom {
    constructor(options) {
        super(options);
        this.AddClass("BbnkDesktop");
        Bbnk.MakeFileContainer(this);
        this.ContextMenuTitle = "";
        this.AddAction("onItemClick", function (a,b) {
            let x = 0;
        })
    }
    RunInit() {
        super.RunInit();
        this.CreateContextMenuList();
        this.AddAction("onItemClick", function (a, b) {
            let item = a.d[0];
            let result = a.result;

            let x = 0;
            result.Close= true;
        })
  
    }

    ItemClick() {
        let x = 0;
    }

}

//Genel amaclı Item
//Treevıew ıcın de ıtem olabılecek 
//expand ve collaps özelliğine sahip
//
// Genel kullanim icin item Tanimlanir 
// Treeview itemi baz alindi ama duzenlenebilir
Bbnk.Item = class extends Bbnk.Dom {
    constructor(options) {
        super(options);
        this.InitIcons();
        this.AddClass("BbnkItem");
        let Item = this;
        this.pBody = Bbnk.New("Dom", {
            Class: "BbnkItemBody",
            Init: function () {

            }
        });
        this.InitElements();   

        if (typeof this.Options.ItemInit === "function") {

            let n = Bbnk.funcId;
            this[n] = this.Options.ItemInit;
            try {                
                this[n]();
            } catch (e) {

            }
            delete this[n];
        }
        if (this.Options.Defaults !== undefined) {
            let keys = Object.keys(this.Options.Defaults);
            for (let i = 0; i < keys.length; i++) {
                this[keys[i]] = this.Options.Defaults[keys[i]];
            }
        }

        this.InitPanels();
        this.Startup();
        this.isReady = true;
        this.RefreshItem();
    }
    createContextmenu(menucontainer) {
        super.createContextmenu(menucontainer);
        if (this.$fields.contextmenu === undefined) {
            let res = [];
            res.push(Bbnk.New(Bbnk.MenuItem, {
                text: "Item",
                children: [
                    Bbnk.MenuItem.New("Expand"),
                    Bbnk.MenuItem.New("Collaps"),
                    Bbnk.MenuItem.New("Close"),
                ]
            }))
            this.$fields.contextmenu = res;
        }
        for (let m of this.$fields.contextmenu) {
            menucontainer.push(m);
        }
    }
    toString() {
        return this.Text;
    }
    Startup() {
        this.Open = false;
        this.Checked = true;
        //this.Expandable = true;
        //this.Checkable = true;
        //this.HasImage = true;
    }
    InitElements() {
        this.pExpand = Bbnk.New("Dom", {

            Class: "BbnkItemBodyPart",
            Init: function () {
                this.Icon = Bbnk.New("Dom", { tagName: "i", Class: "bi  ItemIcon", Parent: this })

            }
        });
        this.pImage = Bbnk.New("Dom", {
            tagName: "img",
            Class: "BbnkItemBodyPart ItemImage",
            Init: function () {
                this.Value = "images/users/betul.png";
            }
        });
        this.pCheck = Bbnk.New("Dom", {
            Class: "BbnkItemBodyPart",
            Init: function () {
                this.Icon = Bbnk.New("Dom", { tagName: "i", Class: "bi  ItemIcon", Parent: this })
            }
        });
        this.pText = Bbnk.New("Dom", {
            Class: "BbnkItemBodyPart ItemText",
            Init: function () {
                this.Value = "Item Text";
            }
        });
        this.pSumBox = Bbnk.New("Dom", {
            Class: "BbnkItemBodyPart ItemSumBox",
            Init: function () {
                this.Value = "";
            }
        });
        this.pChildrenBox = Bbnk.New("Dom", {
            Class: "BbnkItemChildrenBox",
            Init: function () {

            }
        });
      
        this.pChildrenBox.BringToFront = function () {
            this.Parent.BringToFront();
        }

        this.pExpand.AddAction("onMouseDown", this, function (a, b) {
            a.cancelBubble = true;
            this.Open = !this.Open;

        })
        this.pCheck.AddAction("onMouseDown", this, function (a, b) {
            a.cancelBubble = true;
            this.Checked = !this.Checked;

        })

        this.Expandable = true;
        this.Checkable = true;
        this.HasImage = true;
    }
    InitIcons() {
        this.OpenIcons = ["bi-caret-right", "bi-caret-down"];
        this.CheckIcons = ["bi-app", "bi-check-square"];
    }
    InitPanels() {
        this.pBody.Parent = this;
        this.pExpand.Parent = this.pBody;
        this.pCheck.Parent = this.pBody;
        this.pImage.Parent = this.pBody;
        this.pText.Parent = this.pBody;
        this.pSumBox.Parent = this.pBody;

        this.pChildrenBox.Parent = this;

        this.pBody.AddAction("onMouseDown", this, function (ev) {
            let r = this.RunParent("ItemClick", [this, "click",ev]);
        });
    }
    RunInit() {
        super.RunInit();
        this.RefreshItem();
    }
    get SumBox() {
        if (this.Value === undefined) return null;
        if (this.Value === null) return null;
        if (this.Value.isBbnk !== true) return null;
        return this.Value.SumBox;
    }
    RefreshItem() {
        if (this.isReady !== true) return;
        let children = [];
        let text = "*";
        let sumbox = null;
        let SumBox = this.SumBox;
        if (SumBox !== undefined) {
            if (SumBox !== null) {
                if (SumBox.isBbnk === true) {
                    sumbox = SumBox;
                }
            }
        }

        this.pSumBox.DisplayEnable = sumbox !== null;
        if (sumbox != null) {
            this.pSumBox.Clear();
            sumbox.Parent = this.pSumBox;
        } else {
            this.pSumBox.Clear();
        }
        if ((this.Value !== undefined) && (this.Value !== null)) {
            if (this.Value.isBbnk) {
                children = this.Value.Children;
                text = this.Value.Text;
            }
        }

        this.pExpand.DisplayEnable = this.Expandable && (children.length > 0);
        this.pCheck.DisplayEnable = this.Checkable;
        this.pImage.DisplayEnable = this.HasImage;
        this.pText.Value = text;
        this.pExpand.Icon.ClassSet(this.Open, this.OpenIcons);
        this.pCheck.Icon.ClassSet(this.Checked, this.CheckIcons);
    }
    get Open() {
        return this.pChildrenBox.DisplayEnable === true;
    }
    set Open(value) {
        this.pChildrenBox.DisplayEnable = value === true;
        this.pChildrenBox.Clear();
        if ((this.Value !== undefined) && (this.Value !== null)) {
            try {
                let c = this.Value.Children;
                for (let child of c) {
                    Bbnk.New("Item", {
                        Value: child,
                        Parent: this.pChildrenBox,
                        Init: function () {


                        }
                    })
                }
            } catch (e) {
                let x = 0;
            }
        }
        this.RefreshItem();
    }
    getChecked() {
        return this.$fields.Checked === true;
    }
    setChecked(value) {
        this.$fields.Checked = value === true;
    }
    get Checked() {
        return this.getChecked();
    }
    set Checked(value) {
        this.setChecked(value === true);
        this.RefreshItem();
    }


    
    get Expandable() {

        return this.findFromParents(function () {
           
            if (this.isRoot === true) {
                return this.pExpand.Expandable;
            }
        }) === true;
    }
    set Expandable(value) {
        this.pExpand.Expandable = value === true;
        this.RefreshItem();
    }

    get Checkable() {
       

        return this.findFromParents(function () {

            if (this.isRoot === true) {
                return this.pCheck.Checkable;
            }
        }) === true;
    }
    set Checkable(value) {
        this.pCheck.Checkable = value === true;
        this.RefreshItem();
    }
    get HasImage() {
        return this.findFromParents(function () {

            if (this.isRoot === true) {
                return this.pImage.HasImage;
            }
        }) === true;
    }
    set HasImage(value) {
        this.pImage.HasImage = value === true;
        this.RefreshItem();
    }
    readValue() {
        return this.$fields.Value;
    }
    writeValue(value) {
        this.$fields.Value = value;
    }
  
    setValue(value) {
        super.setValue(value);
        this.RefreshItem();
    }
}

// TreeView Elementi olusturuldu
Bbnk.TreeView = class extends Bbnk.Dom {
    constructor(options) {
        super(options);
        this.AddClass("BbnkTreeView");
        this.Root = Bbnk.New("Item", {
            Value: this.Options.Root,
            Parent: this,
            Init: function () {
               
            }
        })
    }
}

Bbnk.Form = class extends Bbnk.Item {
    constructor(options) {
        super(options)
        this.ResizersEnable = false;
        this.AddAction("onMouseEnter", function (ev) {
            ev.cancelBubble = true;
            this.ResizersEnable = true;
            if (Bbnk.currentResizeElement !== this) {
                if (Bbnk.currentResizeElement !== undefined)
                    Bbnk.currentResizeElement.ResizersEnable = false;
            }
            Bbnk.currentResizeElement = this;
            if (this.ResizerTimeouthandle !== undefined) {
                clearTimeout(this.ResizerTimeouthandle);
                this.ResizerTimeouthandle = undefined;
            }
        })
        this.AddAction("onMouseLeave", function (ev) {
            ev.cancelBubble = true;

            Bbnk.currentResizeElement = undefined;
            if (this.ResizerTimeouthandle !== undefined) {
                clearTimeout(this.ResizerTimeouthandle);
                this.ResizerTimeouthandle = undefined;
            }
            this.ResizerTimeouthandle = setTimeout(function (t) {
                t.ResizersEnable = false;
            }, 1000, this)
        })
        this.AddAction("onMouseMove", function (ev) {

            if (Bbnk.currentResizeElement === undefined) {
                Bbnk.currentResizeElement = this;
                Bbnk.currentResizeElement.ResizersEnable = true;
                ev.cancelBubble = true;
            }


        })
        this.StartResizeObserver();
        this.AddAction("onChangedSize", function () {
            this.RefreshItem();
        })
    }
    RunInit() {
        super.RunInit();
        //ContextMenu
        if (typeof this.Options.ContextMenu === "function") {
            let n = Bbnk.funcId;
            this[n] = this.Options.ContextMenu;
            try {
                this[n]();
                
            } catch (e) {

            }
            delete this[n];
        }
        if (typeof this.Options.HeaderMenu === "function") {
            let n = Bbnk.funcId;
            this[n] = this.Options.HeaderMenu;
            try {
                let menu = this[n]();
                this.HeaderMenu = this.pChildrenBox.InsertBefore(menu);
                this.HeaderMenu.AddAction("onItemClick", this, function (a, b) {
                    this.RunAction("onItemClick", b)
                })
            } catch (e) {

            }
            delete this[n];
        }
        if (typeof this.Options.width === "number")
            this.pChildrenBox.width = this.Options.width;
        if (typeof this.Options.height === "number")
            this.pChildrenBox.height = this.Options.height;
        if (typeof this.Options.X === "number")
            this.X = this.Options.X;
        if (typeof this.Options.Y === "number")
            this.Y = this.Options.Y;
        if (typeof this.Options.Dock === "string") {
            this.Dock = this.Options.Dock;
        }
        if (typeof this.Options.Split === "string") {
            this.pChildrenBox.Split = this.Options.Split;
        }
        if (this.Options.Moveable ===true) {
            this.MakeMoveable();
        }
        if (this.Options.Resizeable === true) {
            this.MakeResizeable();
        }

        if (typeof this.Options.Title === "string") {
            this.Title = this.Options.Title;
        }

        setTimeout(function (t) {
            t.pChildrenBox.SplitPos = t.Options.SplitPos;
        }, 100, this);
    }
    Startup() {
        this.Open = true;
        this.Checked = false;
        this.Expandable = true;
        this.Checkable = false;
        this.HasImage = false;
        this.Closeable = true;
    }
    InitElements() {
        super.InitElements();
        
        this.pClose = Bbnk.New("Dom", {
            Class: "BbnkItemBodyPart CloseIcon",
            Init: function () {
                this.Icon = Bbnk.New("Dom", { tagName: "i", Class: "bi  bi-x-square ItemIcon", Parent: this })
            }
        });
        this.pClose.AddAction("onMouseDown", this, function (a, b) {
            a.cancelBubble = true;
            this.Close();

        })
        this.Closeable = true;

    }
    Close() {
        this.Dispose();
    }
    InitIcons() {
        this.OpenIcons = ["bi-caret-down", "bi-caret-right"];
        this.CheckIcons = ["bi-app", "bi-check-square"];
    }
    InitPanels() {
        this.pBody.Parent = this;

        //this.pCheck.Parent = this.pBody;
        //this.pImage.Parent = this.pBody;
        this.pText.Parent = this.pBody;
        this.pExpand.Parent = this.pBody;
        this.pClose.Parent = this.pBody;
        this.pChildrenBox.Parent = this;
    }
    RefreshItem() {
        if (this.isReady !== true) return;

        if (this.Open) {
            this.pBody.RemoveClass("BbnkFormCloseHeader");
            this.RemoveClass("BbnkCloseForm");
        } else {
            this.pBody.AddClass("BbnkFormCloseHeader");
            this.AddClass("BbnkCloseForm");
        }

        this.pExpand.DisplayEnable = this.Expandable;
        this.pCheck.DisplayEnable = this.Checkable;
        this.pImage.DisplayEnable = this.HasImage;
        this.pClose.DisplayEnable = this.Closeable && this.Open;
        this.pText.Value = this.Title;
        this.pExpand.Icon.ClassSet(this.Open, this.OpenIcons);
        this.pCheck.Icon.ClassSet(this.Checked, this.CheckIcons);

        if (this.Resizers !== undefined) {
            let showresizers = this.Open && this.ResizersEnable;
            for (var i = 0; i < this.Resizers.length; i++) {
                this.Resizers[i].DisplayEnable = showresizers;
            }
        }

        if (this.Dock == "fill") {
            let w = (this.width) - 2;
            let h = this.pChildrenBox.SY-this.SY ;
            h = this.height - (h +0);
            this.pChildrenBox.width = w;
            this.pChildrenBox.height = h;
        }
    }
    get ResizersEnable() {
        return this.$fields.ResizersEnable === true;
    }
    set ResizersEnable(value) {
        this.$fields.ResizersEnable = value === true;
        this.RefreshItem();
    }
    get Closeable() {
        return this.pExpand.Closeable === true;
    }
    set Closeable(value) {
        this.pExpand.Closeable = value === true;
        this.RefreshItem();
    }
    get Open() {
        return this.pChildrenBox.DisplayEnable === true;
    }
    set Open(value) {
        this.pChildrenBox.DisplayEnable = value === true;

        this.RefreshItem();
    }
    get Title() {
        if (this.$fields.Title === undefined) this.$fields.Title = "------";
        return this.$fields.Title;
    }
    set Title(value) {
        this.$fields.Title = value;
        this.RefreshItem();
    }
    get HasHeader() {
        return this.pBody.DisplayEnable;
    }
    set HasHeader(value) {
        this.pBody.DisplayEnable = value === true;
    }
    MakeResizeable() {
        if (this.Resizers === undefined) {
            this.Resizers = [];
            let resizer = Bbnk.New("Dom", {
                Parent: this,
                Init: function () {
                    this.AddClass("BbnkResizer")
                    this.AddStyle("right:-6px;bottom:-6px;cursor:nwse-resize;");
                    this.MakeMoveable();
                 
                }
            });
            resizer.MoveActionTarget = this.pChildrenBox;
            resizer.AddAction("onMove", this, function (a, b) {
               
                let t = b.source.MoveActionTarget;
                t.width = a.dPos.TW - a.dx;
                t.height = a.dPos.TH - a.dy;
        

            });
            this.Resizers.push(resizer);


            resizer = Bbnk.New("Dom", {
                Parent: this,
                Init: function () {
                    this.AddClass("BbnkResizer")
                    this.AddStyle("left:-6px;top:-6px;cursor:nwse-resize;");
                    this.MakeMoveable();
               
                }
            });
            resizer.MoveActionTarget = this.pChildrenBox;
            resizer.ResizeMoveTarget = this;
            resizer.AddAction("onMove", this, function (a, b) {
        
                let t = b.source.MoveActionTarget;
                t.width = a.dPos.TW + a.dx;
                t.height = a.dPos.TH + a.dy;
                this.X = a.dPos.TX - a.dx;
                this.Y = a.dPos.TY - a.dy;  
            });
            this.Resizers.push(resizer);

            resizer = Bbnk.New("Dom", {
                Parent: this,
                Init: function () {
                    this.AddClass("BbnkResizer")
                    this.AddStyle("left:-6px;bottom:50%;cursor:ew-resize;");
                    this.MakeMoveable();

                }
            });
            resizer.MoveActionTarget = this.pChildrenBox;
            resizer.ResizeMoveTarget = this;
            resizer.AddAction("onMove", this, function (a, b) {

                let t = b.source.MoveActionTarget;
                t.width = a.dPos.TW + a.dx;
                //t.height = a.dPos.TH + a.dy;
                this.X = a.dPos.TX - a.dx;
                //this.Y = a.dPos.TY - a.dy;
            });
            this.Resizers.push(resizer);

            resizer = Bbnk.New("Dom", {
                Parent: this,
                Init: function () {
                    this.AddClass("BbnkResizer")
                    this.AddStyle("left:-6px;bottom:-6px;cursor:nesw-resize;");
                    this.MakeMoveable();

                }
            });
            resizer.MoveActionTarget = this.pChildrenBox;
            resizer.ResizeMoveTarget = this;
            resizer.AddAction("onMove", this, function (a, b) {

                let t = b.source.MoveActionTarget;
                t.width = a.dPos.TW + a.dx;
                t.height = a.dPos.TH - a.dy;
                this.X = a.dPos.TX - a.dx;
                //this.Y = a.dPos.TY - a.dy;
            });
            this.Resizers.push(resizer);


            resizer = Bbnk.New("Dom", {
                Parent: this,
                Init: function () {
                    this.AddClass("BbnkResizer")
                    this.AddStyle("bottom:-6px;left:50%;cursor:ns-resize");
                    this.MakeMoveable();

                }
            });
            resizer.MoveActionTarget = this.pChildrenBox;
            resizer.ResizeMoveTarget = this;
            resizer.AddAction("onMove", this, function (a, b) {

                let t = b.source.MoveActionTarget;
                //t.width = a.dPos.TW + a.dx;
                t.height = a.dPos.TH - a.dy;
                //this.X = a.dPos.TX - a.dx;
                //this.Y = a.dPos.TY - a.dy;
            });
            this.Resizers.push(resizer);



            resizer = Bbnk.New("Dom", {
                Parent: this,
                Init: function () {
                    this.AddClass("BbnkResizer")
                    this.AddStyle("right:-6px;bottom:50%;cursor:ew-resize");
                    this.MakeMoveable();

                }
            });
            resizer.MoveActionTarget = this.pChildrenBox;
            resizer.ResizeMoveTarget = this;
            resizer.AddAction("onMove", this, function (a, b) {

                let t = b.source.MoveActionTarget;
                t.width = a.dPos.TW - a.dx;
                //t.height = a.dPos.TH - a.dy;
                //this.X = a.dPos.TX - a.dx;
                //this.Y = a.dPos.TY - a.dy;
            });
            this.Resizers.push(resizer);




            resizer = Bbnk.New("Dom", {
                Parent: this,
                Init: function () {
                    this.AddClass("BbnkResizer")
                    this.AddStyle("right:-6px;top:-6px;cursor:nesw-resize");
                    this.MakeMoveable();

                }
            });
            resizer.MoveActionTarget = this.pChildrenBox;
            resizer.ResizeMoveTarget = this;
            resizer.AddAction("onMove", this, function (a, b) {

                let t = b.source.MoveActionTarget;
                t.width = a.dPos.TW - a.dx;
                t.height = a.dPos.TH + a.dy;
                //this.X = a.dPos.TX - a.dx;
                this.Y = a.dPos.TY - a.dy;
            });
            this.Resizers.push(resizer);



            resizer = Bbnk.New("Dom", {
                Parent: this,
                Init: function () {
                    this.AddClass("BbnkResizer")
                    this.AddStyle("right:50%;top:-6px;cursor:ns-resize");
                    this.MakeMoveable();

                }
            });
            resizer.MoveActionTarget = this.pChildrenBox;
            resizer.ResizeMoveTarget = this;
            resizer.AddAction("onMove", this, function (a, b) {

                let t = b.source.MoveActionTarget;
                //t.width = a.dPos.TW - a.dx;
                t.height = a.dPos.TH + a.dy;
                //this.X = a.dPos.TX - a.dx;
                this.Y = a.dPos.TY - a.dy;
            });
            this.Resizers.push(resizer);
        }

        this.AddClass("BbnkResizeable");
;
    }
    MakeMoveable() {
        this.pBody.isMoveable = true;
        this.Element.style.position = "absolute";
        this.pBody.Form = this;
        this.pBody.style.cursor = "move";
        this.pBody.MoveTarget = this;
        this.pBody.AddAction("onMove", this, function (px) {
            let x = 0;
            this.X = px.dPos.CX - px.dx;
            this.Y = px.dPos.CY - px.dy;
            if (this.X < 0) this.X = 0;
            if (this.Y < 0) this.Y = 0;
            let w = this.Parent.width-2;
            let h = this.Parent.height-2;
            if (this.X + this.width > w) this.X = w - this.width;
            if (this.Y + this.height > h) this.Y = h - this.height;

        });
    }

    setDock(value) {
        super.setDock(value);
    }
    
}
Bbnk.HeaderMenu = class extends Bbnk.Dom {
    constructor(options) {
        super(options);
        this.AddClass("BbnkHeaderMenu");
        this.Parts = [];
        this.StartResizeObserver();
        this.AddAction("onChangedSize", function () {
            this.RefreshMenuSize();
        })

        //0
        this.Parts.push(Bbnk.New("Dom", {
            Class: "HeaderMenuPart HeaderMenuLeftFix",
            Parent: this,
            Init: function () {
                this.Image = Bbnk.New("Dom", {
                    tagName: "img", Class: "", Parent: this,
                    Init: function () {
                        this.AddStyle("height:24px;");
                        this.Value = "images/users/betul.png";
                    }
                });
            }
        }))
        //1
        this.Parts.push(Bbnk.New("Dom", {
            Class: "HeaderMenuPart HeaderMenuMidle HeaderMenuEmpty",
            Parent: this,
            Init: function () {
               
            }
        }))

        //2
        this.Parts.push(Bbnk.New("Dom", {
            Class: "HeaderMenuPart HeaderMenuMidle",
            Parent: this,
            Init: function () {
            
            }
        }))
        //3
        this.Parts.push(Bbnk.New("Dom", {
            Class: "HeaderMenuPart HeaderMenuMidle HeaderCombo",
            Parent: this,
            Init: function () {
                this.Txt = Bbnk.New("Dom", {  Class: "HeaderMenuComboText", Parent: this });
                this.Icon = Bbnk.New("Dom", { tagName: "i", Class: "bi bi-caret-down-square  ItemIcon", Parent: this });
                
            }
        }))
        //4
        this.Parts.push(Bbnk.New("Dom", {
            Class: "HeaderMenuPart HeaderMenuRight",
            Parent: this,
            Init: function () {
              
            }
        }))
        //5
        this.Parts.push(Bbnk.New("Dom", {
            Class: "HeaderMenuPart HeaderCombo",
            Parent: this,
            Init: function () {
                
                this.Txt = Bbnk.New("Dom", {  Class: "HeaderMenuComboText", Parent: this });
                this.Icon = Bbnk.New("Dom", { tagName: "i", Class: "bi bi-caret-down-square  ItemIcon", Parent: this });
            }
        }))
        //6
        this.Parts.push(Bbnk.New("Dom", {
            Class: "HeaderMenuPart HeaderMenuRightFix",
            Parent: this,
            Init: function () {
                this.Icon = Bbnk.New("Dom", { tagName: "i", Class: "bi bi-list  ItemIcon", Parent: this })


            }
        }))
        this.Logo = this.Parts[0];
        this.Menu = this.Parts[2];
        this.MenuCombo = this.Parts[3];
        this.RightMenu = this.Parts[4];
        this.RightMenuCombo = this.Parts[5];
        this.RightButton = this.Parts[6];
        this.MenuComboText = "MENU";
        this.RightMenuComboText = "INFO";

        this.MenuCombo.AddAction("onMouseDown", this, function (ev) {
            ev.cancelBubble = true;
            let m = this.OpenPopUpMenu();
            
            m.AddClass("HeaderListCombo");
            m.style.minWidth = this.MenuCombo.width + "px";
            m.X = this.MenuCombo.SX;
            m.Y = this.MenuCombo.SY + this.MenuCombo.height + 4;
            m.height = 100;
            this.Menu.Parent = m;
            this.Menu.show = true;
            this.Menu.AddClass("HeaderMenu-column");
            this.RefreshMenuSize();
            m.AddAction("onDisposing", this, function () {
                this.Menu.show = false;
                this.Menu.RemoveClass("HeaderMenu-column");
                this.MenuCombo.InsertBefore(this.Menu);
                this.RefreshMenuSize();
            })
            m.timeout.start();
        })
        this.RightMenuCombo.AddAction("onMouseDown", this, function (ev) {
            ev.cancelBubble = true;
            let m = this.OpenPopUpMenu();
            m.AddClass("HeaderListCombo");
       
            m.style.minWidth = this.RightMenuCombo.width + "px";
            m.X = this.RightMenuCombo.SX;
            m.Y = this.RightMenuCombo.SY + this.RightMenuCombo.height + 4;
            m.height = 100;
            this.RightMenu.Parent = m;
            this.RightMenu.show = true;
            this.RightMenu.AddClass("HeaderMenu-column");
            this.RefreshMenuSize();
            m.AddAction("onDisposing", this, function () {
                this.RightMenu.show = false;
                this.RightMenu.RemoveClass("HeaderMenu-column");
                this.RightMenuCombo.InsertBefore(this.RightMenu);
                this.RefreshMenuSize();
            })
            m.timeout.start();
        })
        this.RightButton.AddAction("onMouseDown", this, function (ev) {
            ev.cancelBubble = true;
            let m = this.OpenPopUpMenu();
            m.AddClass("HeaderListCombo");
            m.style.minWidth = (this.width - 10)+"px";
            m.X = this.SX+4;
            m.Y = this.RightButton.SY + this.RightButton.height + 4;
    
            this.RightMenu.Parent = m;
            this.RightMenu.show = true;
            this.RightMenu.AddClass("HeaderMenu-column");

            this.Menu.Parent = m;
            this.Menu.show = true;
            this.Menu.AddClass("HeaderMenu-column");

            this.RefreshMenuSize();
            m.AddAction("onDisposing", this, function () {
                this.RightMenu.show = false;
                this.RightMenu.RemoveClass("HeaderMenu-column");
                this.RightMenuCombo.InsertBefore(this.RightMenu);

                this.Menu.show = false;
                this.Menu.RemoveClass("HeaderMenu-column");
                this.MenuCombo.InsertBefore(this.Menu);

                this.RefreshMenuSize();
            })
            m.timeout.start();
        })

       
    }
    get MenuComboText(){
        return this.MenuCombo.Txt.Value;
    }
    set MenuComboText(value) {
        this.MenuCombo.Txt.Value=value;
    }
    get RightMenuComboText() {
        return this.RightMenuCombo.Txt.Value;
    }
    set RightMenuComboText(value) {
        this.RightMenuCombo.Txt.Value = value;
    }
    RefreshMenuSize() {
       
        let w = this.width;
        let steps = [900, 700,500, 200];
        let mode = steps.length;
        for (var i = 0; i < steps.length; i++) {
            if (w > steps[i]) { mode = i; break; }
        }
        //this.Parts[0].Value = mode.toString() + " " + Math.floor( this.width);
        this.Parts[6].DisplayEnable = mode > 2;
        this.Parts[1].DisplayEnable = this.Parts[6].DisplayEnable;
        this.Parts[4].DisplayEnable = mode <1;
        this.Parts[5].DisplayEnable = !this.Parts[4].DisplayEnable && !this.Parts[6].DisplayEnable;

        this.Parts[2].DisplayEnable = mode<2;
        this.Parts[3].DisplayEnable = !this.Parts[2].DisplayEnable && !this.Parts[6].DisplayEnable;
        if (mode > 3) this.Parts[6].DisplayEnable = false;
        this.Logo.DisplayEnable = this.Logo.Image.Value !== null;
        if (this.RightMenu.show === true) this.RightMenu.DisplayEnable = true;
        if (this.Menu.show === true) this.Menu.DisplayEnable = true;

    }
    ItemClick(data) {
        let x = 0;
        this.RunAction("onItemClick", data);
    }
}
Bbnk.ImageTextCombo = class extends Bbnk.Dom {
    constructor(options) {
        super(options);
        this.AddClass("ImageTextCombo");
        this.image = Bbnk.New("Dom", {
            Parent:this,
            Class:"HeaderMenuRightItem-Image",
            tagName: "img",
            Value:"images/users/betul.png"
        })
        this.Txt = Bbnk.New("Dom", {
            Parent: this,
            Class: "HeaderMenuRightItem-Text",
            Value: "Label"
        })
        this.Icon = Bbnk.New("Dom", { tagName: "i", Class: "bi bi-caret-down-square  ItemIcon", Parent: this });

        this.isCombo = false;
        this.Image = null;
    }
    getText() {
        return this.Txt.Value;
    }
    setText(value) {
        this.Txt.Value = value;
    }
    get Image() {
        return this.image.Value;
    }
    set Image(value) {
        this.image.Value = value;
        this.ImageEnable = this.image.Value !== null;
    }

    get ImageEnable() { return this.image.DisplayEnable; }
    set ImageEnable(value) { this.image.DisplayEnable=value===true; }

    get isCombo() { return this.icon.DisplayEnable; }
    set isCombo(value) { this.Icon.DisplayEnable = value === true; }

}
Bbnk.Button = class extends Bbnk.ImageTextCombo {
    constructor(options) {
        super(options);
        this.isCombo = false;
    }
   
}
Bbnk.Combo = class extends Bbnk.ImageTextCombo {
    constructor(options) {
        super(options);
        this.isCombo = true;
        this.Items = [];
        this.Icon.AddAction("onMouseDown", this, function (ev) {

            let m = this.OpenPopUpMenu();
            m.xtimeout = this.Parent.Parent.timeout;
            m.AddAction("onMouseEnter", m, function (ev){
                let x = 0;
                this.xtimeout.stop();
            });
            m.AddAction("onDisposeing", m, function (ev){
                let x = 0;
                this.xtimeout.start();
            });
            m.AddClass("BbnkComboMenu");
           
            m.X = this.SX;
            m.Y = this.SY + this.height + 3;

            for (let item of this.Items) {
                if (item.Text === "") {
                    Bbnk.New("Dom", {
                        Parent: m,
                        Class: "MenuSeperator",
                    })
                }
                else {
                    let i = Bbnk.New("Item", {
                        isRoot: true, Parent: m, Value: item, ItemInit: function () {

                            if (this.Options.Defaults === undefined) {
                                this.Options.Defaults = {};

                            }
                            if (this.Options.Value !== undefined) {
                                if (this.Options.Value.Defaults !== undefined) {
                                    let keys = Object.keys(this.Options.Value.Defaults);
                                    for (var i = 0; i < keys.length; i++) {
                                        this.Options.Defaults[keys[i]] = this.Options.Value.Defaults[keys[i]];
                                    }

                                }
                            }
                        }
                    })
                    i.pBody.AddClass("MenuItem");
                }
            }

            m.Target = this;
            m.ItemClick = function (data) {

                let menu = data[0].Value;
                if (typeof menu.Action !== "function") {
                    data[0].Open = !data[0].Open;
                   
                } else {
                    let n = Bbnk.funcId;
                    this.Target[n] = data[0].Value.Action;
                    try {
                        this.Target[n]();
                    } catch (e) {

                    }
                    delete this.Target[n];

                }

                //this.Target.RunAction("onItemClick", { d: data });
                this.Target.RunParent("ItemClick",data)
                this.Dispose();
            }

        })
    }
    AddItem(item) {
        this.Items.push(item);
    }
}
Bbnk.CreateSelector = class extends Bbnk.Form {
    constructor(options) {
        super(options);
        this.AddClass("isForm");
        this.MakeMoveable();
        this.X = this.Data.ev.clientX;
        this.Y = this.Data.ev.clientY;
        this.pChildrenBox.AddStyle("min-height:10px;min-width:30px;");
        this.EdtBody = Bbnk.New("Dom", {
            Parent: this.pChildrenBox,

            Init: function () {
                this.AddStyle("border:1px solid black;border-radius:3px;margin:2px;padding:2px;");
                this.AddStyle("background-color:#B7E0F9;color:black;");
                this.AddStyle("display:flex;align-items:center;justify-content:center;");
                
            }

        })
        this.Buttons = Bbnk.New("Dom", {
            Parent:this.pChildrenBox,
           
            Init: function () {
                this.AddStyle("border:1px solid black;border-radius:3px;margin:2px;padding:2px;");
                this.AddStyle("background-color:#FAE0C3;color:black;");
                this.AddStyle("min-height:20px;");
            }

        })
        let lst = this.Data.target.GetCreateItemList();
        let lstdiv = Bbnk.New("Dom", {
            Style: "max-height:300px;boder:1px solid red;margin:5px;adding:5px;",
        });
        for (var i = 0; i < lst.length; i++) {
            Bbnk.New("Item", {
                isRoot: true,
                Class:"isTreeItem",
                Parent: lstdiv,
                Value: lst[i],
                Init: function () {
                    let x = 0;
                    this.HasImage = false;
                    this.Checkable = false;
                }
            })
        }
        lstdiv.Parent = this.EdtBody;
    }
    get Data() {
        return this.Options.Data;
    }
    ItemClick(data) {
        let x = 0;
        let Data = this.Data;
        let a = Bbnk.New("Form", {
            Class:"isForm",
            Parent: Data.target,
            Init: function () {
                this.X = Data.ev.clientX;
                this.Y = Data.ev.clientY;
                this.pChildrenBox.width = 200;
                this.pChildrenBox.height = 100;
                this.MakeMoveable();
                this.MakeResizeable();
            }
        })    

        this.Dispose();
    }
}
Bbnk.CreaterEditor = class extends Bbnk.Form {
    constructor(options) {
        super(options);
        this.AddClass("isForm");
        this.MakeMoveable();
        this.X = 100;
        this.Y = 100;
        this.pChildrenBox.AddStyle("min-height:10px;min-width:30px;");
        this.EdtBody = Bbnk.New("Dom", {
            Parent: this.pChildrenBox,

            Init: function () {
                this.AddStyle("border:1px solid black;border-radius:3px;margin:2px;padding:2px;");
                this.AddStyle("background-color:#B7E0F9;color:black;");
                
            }

        })
        this.Buttons = Bbnk.New("Dom", {
            Parent: this.pChildrenBox,

            Init: function () {
                this.AddStyle("border:1px solid black;border-radius:3px;margin:2px;padding:2px;");
                this.AddStyle("background-color:#FAE0C3;color:black;");
                this.AddStyle("min-height:20px;");
            }

        })
    }
}



//Test Amacli  Data 
let data = {
    Adi: "",
    Soyadi: "",
    List: [
        { x: 10, y: 20 },
        {x:3,y:30}
    ]
}
addEventListener("resize", function () {
    Bbnk.Body.resize();
})
addEventListener("load", function () {
    Bbnk.Document = Bbnk.New("Dom", { element: document });
    Bbnk.Body = document.body.$bbnk;
    Bbnk.Body.resize = function () {
        let h,w;
        let p = Bbnk.TaskBar.Position;
        if (p=== "bottom") {
            Bbnk.TaskBar.AddStyle("left:0px;right:0px;bottom:0px;top:auto;width:auto;height:auto");
            Bbnk.Desktop.AddStyle("left:0px;right:0px;bottom:auto;top:0px;width:auto;height:auto");
            Bbnk.TaskBar.AddStyle("flex-direction:row;");
        }
        if (p === "top") {
            Bbnk.TaskBar.AddStyle("left:0px;right:0px;bottom:auto;top:0px;width:auto;height:auto");
            Bbnk.Desktop.AddStyle("left:0px;right:0px;bottom:0px;top:auto;width:auto;height:auto");   
            Bbnk.TaskBar.AddStyle("flex-direction:row-reverse;");
        }

        if (p === "left") {
            Bbnk.Desktop.AddStyle("left:auto;right:0px;bottom:0px;top:0px;width:auto;height:auto");
            Bbnk.TaskBar.AddStyle("left:0px;right:auto;bottom:0px;top:0px;width:auto;height:auto");
            Bbnk.TaskBar.AddStyle("flex-direction:column;");
        }
        if (p === "right") {
            Bbnk.Desktop.AddStyle("left:0px;right:auto;bottom:0px;top:0px;width:auto;height:auto");
            Bbnk.TaskBar.AddStyle("left:auto;right:0px;bottom:0px;top:0px;width:auto;height:auto");

            w = window.innerWidth - (Bbnk.TaskBar.width + 0);
            Bbnk.Desktop.width = w;
            Bbnk.TaskBar.AddStyle("flex-direction:column-reverse;");
        }
        setTimeout(function () {
            if (p === "bottom") {
                h = window.innerHeight - (Bbnk.TaskBar.height + 0);
                Bbnk.Desktop.height = h;
    
            }
            if (p === "top") {
                h = window.innerHeight - (Bbnk.TaskBar.height + 0);
                Bbnk.Desktop.height = h;
        
            }

            if (p === "left") {
                 w = window.innerWidth - (Bbnk.TaskBar.width + 0);
                Bbnk.Desktop.width = w;
                Bbnk.TaskBar.AddStyle("flex-direction:column;");
            }
            if (p === "right") {
               w = window.innerWidth - (Bbnk.TaskBar.width + 0);
                Bbnk.Desktop.width = w;
      
            }
        },100)
    }
   

    Bbnk.Desktop = Bbnk.New("DesktopClass", {
        Parent: Bbnk.Body,

        Init: function () {
            
        }
    });
    Bbnk.New("TaskBarClass", {

        Parent:Bbnk.Body,
        Init: function () {
            Bbnk.TaskBar = this;
        }
    })
    this.setTimeout(function () {
        Bbnk.Body.resize();
    },100)
   
    //Bbnk.Desktop.ContextMenuTitle = "Desktop Actions";

  
    

})