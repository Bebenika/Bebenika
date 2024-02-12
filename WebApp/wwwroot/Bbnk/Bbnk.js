

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

        let c = Bbnk[classname];
        if (c === undefined) c = Bbnk;
        let res = new c(options);
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


    constructor(options) {
        options = Bbnk.OptionsCheck(options);
        super(options);
        this.$fields = {};//Nesneni fieldeleri burada gizlenir(G,z onunce alinir)
        this.$fields.Parent = null;
        this.$fields.children = [];
        this.$fields.Actions = {

        }
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

        //Target i bu olan action lar silindi
        while (this.$fields.relatedActions.length) {
            let action = this.$fields.relatedActions[0];

            let s = action.source.$fields.Actions[action.name];
            let index = s.indexOf(action);
            if (index !== -1) s.splice(index, 1);
            this.$fields.relatedActions.splice(0, 1);
            let x = this.toString();
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
        while (this.$fields.Slaves.length>0) {
            this.$fields.Slaves[0].Master = null;
        }

        this.Master = null;//Nesne Master inden ayriliyor
        while (this.Children.length > 0) {
            this.Children[0].Dispose();
        }
    }

    Dispose() {
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
    AddAction(...args) {
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
                options.pus(part);
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
        let actionlist = this.$fields.Actions[name];
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



        // Dom un mouse eventleri yakalanir
        // uygun Action clistirilir
        this.Element.addEventListener("mousedown", function (ev) {
            ev.currentTarget.$bbnk.RunAction("onMouseDown",ev);

        })
    }

    //Bu ozellik chatGpt den alindi ama denenmedi
    StartObserver(config) {
        this.$fields.observer = new MutationObserver(this.ObserverCallback);
        let  targetNode = this.Element;
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
        const resizeObserver = new ResizeObserver(entries => {
            for (let entry of entries) {
                const cr = entry.contentRect;
                entry.target.$bbnk.RunAction("onChangedSize");
            }
        });
        resizeObserver.observe(this.Element);
    }
 
    RunInit() {
        super.RunInit();
        if (typeof this.Options.Class === "string")
            this.AddClass(this.Options.Class);
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
        let a = value.split(' ');
        for (let cp of a) {
            if (!this.Element.classList.contains(cp)) {
                try {
                    if (cp !== "") this.Element.classList.add(cp);
                } catch (e) {

                }
            }
        }
        
    }
    RemoveClass(value) {
        let a = value.split(' ');
        for (let cp of a) {
            if (this.Element.classList.contains(cp)) {                
                try {
                    if (cp !== "") this.Element.classList.remove(cp);
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
        if (e.value !== undefined) return value;
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
        this.AddClass("BbnkItemBody");
        let Item = this;
        this.pBody = Bbnk.New("Dom", {
            Class: "BbnkItem",
            Init: function () {

            }
        });
        this.InitElements();
        

        this.pExpand.AddAction("onMouseDown", this, function (a, b) {
            a.cancelBubble = true;
            this.Open = !this.Open;
           
        })
        this.pCheck.AddAction("onMouseDown", this, function (a, b) {
            a.cancelBubble = true;
            this.Checked = !this.Checked;
           
        })
        this.InitPanels();
        this.Startup();
 
    }
    toString() {
        return this.Text;
    }
    Startup() {
        this.Open = false;
        this.Checked = false;
        this.Expandable = true;
        this.Checkable = false;
        this.HasImage = false;
    }
    InitElements() {
        this.pExpand = Bbnk.New("Dom", {

            Class: "BbnkItemPanel",
            Init: function () {
                this.Icon = Bbnk.New("Dom", { tagName: "i", Class: "bi  ItemIcon", Parent: this })

            }
        });
        this.pImage = Bbnk.New("Dom", {
            tagName: "img",
            Class: "BbnkItemPanel ItemImage",
            Init: function () {
                this.Value = "images/users/betul.png";
            }
        });
        this.pCheck = Bbnk.New("Dom", {
            Class: "BbnkItemPanel",
            Init: function () {
                this.Icon = Bbnk.New("Dom", { tagName: "i", Class: "bi  ItemIcon", Parent: this })
            }
        });
        this.pText = Bbnk.New("Dom", {
            Class: "ItemText",
            Init: function () {
                this.Value = "Item Text";
            }
        });
        this.pChildrenBox = Bbnk.New("Dom", {
            Class: "BbnkItemChildrenBox",
            Init: function () {

            }
        });
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
        this.pChildrenBox.Parent = this;
    }

    RunInit() {
        super.RunInit();
        
    }
    RefreshItem() {
        let children = [];
        let text = "*";
        if ((this.Value !== undefined) && (this.Value !== null)) {
            if (this.Value.isBbnk) {
                children = this.Value.Children;
                text = this.Value.Text;
            }
        }
        
        this.pExpand.DisplayEnable = this.Expandable && (children.length>0);
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
            let c = this.Value.Children;
            for (let child of c) {
                Bbnk.New("Item", {
                    Value: child,
                    Parent: this.pChildrenBox,
                    Init: function () {


                    }
                })
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
        return this.pExpand.Expandable === true;
    }
    set Expandable(value) {
        this.pExpand.Expandable = value === true;
        this.RefreshItem();
    }

    get Checkable() {
        return this.pCheck.Checkable === true;
    }
    set Checkable(value) {
        this.pCheck.Checkable = value === true;
        this.RefreshItem();
    }
    get HasImage() {
        return this.pImage.HasImage === true;
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
        //
        
     
    }
    Startup() {
        this.AddClass("BbnkForm");
        this.pBody.Element.className = "BbnkFormHeader";
        this.pChildrenBox.Element.className = "BbnkFormChildrenBox";
        this.Open = false;
        this.Checked = false;
        this.Expandable = true;
        this.Checkable = false;
        this.HasImage = false;
        this.Closeable = true;
    }
    InitElements() {
        this.pExpand = Bbnk.New("Dom", {

            Class: "BbnkItemPanel",
            Init: function () {
                this.Icon = Bbnk.New("Dom", { tagName: "i", Class: "bi  ItemIcon", Parent: this })

            }
        });
        this.pImage = Bbnk.New("Dom", {
            tagName: "img",
            Class: "BbnkItemPanel ItemImage",
            Init: function () {
                this.Value = "images/users/betul.png";
            }
        });
        this.pCheck = Bbnk.New("Dom", {
            Class: "BbnkItemPanel",
            Init: function () {
                this.Icon = Bbnk.New("Dom", { tagName: "i", Class: "bi  ItemIcon", Parent: this })
            }
        });
        this.pClose = Bbnk.New("Dom", {
            Class: "BbnkItemPanel",
            Init: function () {
                this.Icon = Bbnk.New("Dom", { tagName: "i", Class: "bi  bi-x-square ItemIcon", Parent: this })
            }
        });
        this.pText = Bbnk.New("Dom", {
            Class: "ItemText",
            Init: function () {
                this.Element.style.width = "100%";
                this.Value = "Item Text";
            }
        });
   
        this.pChildrenBox = Bbnk.New("Dom", {
            Class: "BbnkItemChildrenBox",
            Init: function () {

            }
        });
    }
    InitIcons() {
        this.OpenIcons = ["bi-caret-down","bi-caret-right"];
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


        if (this.Open) {
            this.pBody.RemoveClass("BbnkFormCloseHeader");
            this.RemoveClass("BbnkCloseForm");
        } else {
            this.pBody.AddClass("BbnkFormCloseHeader");
            this.AddClass("BbnkCloseForm");
        }

        this.pExpand.DisplayEnable = this.Expandable ;
        this.pCheck.DisplayEnable = this.Checkable;
        this.pImage.DisplayEnable = this.HasImage;
        this.pClose.DisplayEnable = this.Closeable&&this.Open;
        this.pText.Value = this.Title;
        this.pExpand.Icon.ClassSet(this.Open, this.OpenIcons);
        this.pCheck.Icon.ClassSet(this.Checked, this.CheckIcons);
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

addEventListener("load", function () {
    Bbnk.Document = Bbnk.New("Dom", {element:document});
    Bbnk.Body = document.body.$bbnk;
    //let x = Bbnk.New("Bbnk", {
    //    Init: function () {
    //        this.Value = "Deneme";
    //    }
    //})
    //Bbnk.New("TreeView", {  // Treview Yapilandiriliyor
    //                        // herhangi bir nesneden Bbnk tabanli Json nesnesi uretilir
    //    Root: Bbnk.New("Json", { ItemText: "x", Value: Bbnk }),
    //    Parent:Bbnk.Body
    //})

    let f = Bbnk.New("Form", {
        Parent:Bbnk.Body,
        Init: function () {
            this.Title = "Form Title";
            this.Expandable = false;
            this.Open = true;
            Bbnk.New("TreeView", {  // Treview Yapilandiriliyor
                                    // herhangi bir nesneden Bbnk tabanli Json nesnesi uretilir
                Root: Bbnk.New("Json", { ItemText: "window", Value: window }),
                Parent:this.pChildrenBox
            })
        }
    })
})