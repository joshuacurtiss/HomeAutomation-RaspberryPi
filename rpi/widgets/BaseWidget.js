class BaseWidget {
    constructor(id, name) {
        this._id=id;
        this._name=name;
        this._value="";
        this._battery=null;
    }
    get id() {return this._id;}
    set id(newid) {if(newid) this._id=newid;}
    get name() {return this._name;}
    set name(newName) {if(newName) this._name=newName;}
    get value() {return this._value;}
    set value(newValue) {if(newValue) this._value=newValue;}
    get battery() {return this._battery;}
    set value(newBattery) {if(newBattery) this._battery=newBattery;}
/*
    handleEvent
    get eventNotificationPacket (or separate out the properties)
        - comment
        - screen
        - message
        - speak
        - chime
    initHTML
    updateHTML
    action
*/
}

BaseWidget.TYPE="Base Widget";
BaseWidget.VALUES=["on","off"]

module.exports=BaseWidget;