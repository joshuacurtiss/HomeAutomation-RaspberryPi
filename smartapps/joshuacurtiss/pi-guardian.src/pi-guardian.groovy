/**
 *  Pi Guardian
 *
 *  Copyright 2016 Joshua Curtiss
 *
 *  Licensed under the Apache License, Version 2.0 (the "License"); you may not use this file except
 *  in compliance with the License. You may obtain a copy of the License at:
 *
 *      http://www.apache.org/licenses/LICENSE-2.0
 *
 *  Unless required by applicable law or agreed to in writing, software distributed under the License is distributed
 *  on an "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied. See the License
 *  for the specific language governing permissions and limitations under the License.
 *
 */
definition(
    name: "Pi Guardian",
    namespace: "joshuacurtiss",
    author: "Joshua Curtiss",
    description: "Integration with Pi Guardian app for Raspberry Pi.",
    category: "Safety & Security",
    iconUrl: "https://raw.githubusercontent.com/joshuacurtiss/HomeAutomation-RaspberryPi/master/logo/logo-1x.png",
    iconX2Url: "https://raw.githubusercontent.com/joshuacurtiss/HomeAutomation-RaspberryPi/master/logo/logo-2x.png",
    iconX3Url: "https://raw.githubusercontent.com/joshuacurtiss/HomeAutomation-RaspberryPi/master/logo/logo-3x.png",
    oauth: [displayName: "Pi Guardian", displayLink: "https://raw.githubusercontent.com/joshuacurtiss/HomeAutomation-RaspberryPi/master/logo/logo-3x.png"]
)


preferences {
	page(name: "pageOne", title: "Devices", nextPage: "pageTwo", uninstall: true) {
        section("Control/monitor the following devices:") {
            input "contact", "capability.contactSensor", title: "Where?", multiple: true, required: false
            input "presence", "capability.presenceSensor", title: "Which sensor?", multiple: true, required: false
            input "switches", "capability.switch", title: "Which switch?", multiple: true, required: false
            input "bulb", "capability.bulb", title: "Which bulbs?", multiple: true, required: false
            input "lock", "capability.lock", title: "Which locks?", multiple: true, required: false
        }
    }
    page(name: "pageTwo", title: "Intrusion/Alarm", install: true, uninstall: true) {
        section("These devices will trigger an intrusion:") {
            input "intrusionSwitch", "capability.switch", title: "Which switch?", multiple: true, required: false
            input "intrusionAlarm", "capability.alarm", title: "Which alarm?", multiple: true, required: false
        }
        section("If no code successfully cleared the intrusion:") {
        	paragraph "You can specify which switch or alarm is triggered after the intrusion was not cleared for the designated amount of time."
            input "noclearDelay", "number", title: "Wait how many seconds?", required: false
            input "noclearSwitch", "capability.switch", title: "Which switch?", multiple: true, required: false
            input "noclearAlarm", "capability.alarm", title: "Which alarm?", multiple: true, required: false
        }
    }
}

mappings {
  path("/devices") {
    action: [
      GET: "getDeviceStatus"
    ]
  }
  path("/clienturi") {
  	action: [
      GET: "getClientUri",
      POST: "addClientUri",
      DELETE: "removeClientUri"
    ]
  }
  path("/devices/:id") {
    action: [
      GET: "getDeviceStatus",
      POST: "setDeviceStatus"
    ]
  }
  path("/shm") {
    action: [
      GET: "getAlarmSystemStatus",
      POST: "setAlarmSystemStatus"
    ]
  }
  path("/shm/intrusion") {
    action: [
      GET: "getIntrusionStatus",
      POST: "setIntrusionStatus"
    ]
  }
}

/* App Setup */

def installed() {
	log.debug "Installed with settings: ${settings}"
	initialize()
}

def updated() {
	log.debug "Updated with settings: ${settings}"
	unsubscribe()
    subscribeAll()
}

def initialize() {
	state.uri=[]
    subscribeAll()
}

def subscribeAll() {
	subscribe(contact, "contact", generalDeviceEventHandler)
    subscribe(presence, "presence", generalDeviceEventHandler) 
    subscribe(switches, "switch", generalDeviceEventHandler)
    subscribe(bulb, "bulb", generalDeviceEventHandler)
    subscribe(lock, "lock", generalDeviceEventHandler)
    subscribe(location, "alarmSystemStatus", alarmStatusHandler)
    subscribe(intrusionSwitch, "switch", intrusionHandler)
    subscribe(intrusionAlarm, "alarm", intrusionHandler)
}

/* Utility Methods */

def getDevices() {
	return (contact + presence + switches + bulb + lock).findAll()
}

def getDeviceProps(device) {
	def con=device.currentValue("contact")
    def pres=device.currentValue("presence")
    def lock=device.currentValue("lock")
    def sw=device.currentValue("switch")
	return [
    	id:device.id, 
        device:device.name, 
        name:device.displayName, 
        value:pres?pres:(lock?lock:(sw?sw:con)),
        battery:device.currentValue("battery")
    ];
}

def getAlarmSystemStatusProps(shm) {
	return [id:shm.locationId.toString()+"-"+shm.name,value:shm.value,device:shm.name,name:shm.displayName,battery:null]
}

def getEventProps(evt) {
	return [id:evt.id.toString(), type:evt.name, value:evt.value, device:evt.device?getDeviceProps(evt.device):null]
}

def findDevice(id) {
	return getDevices().findAll{it.id==id}[0]
}

/* Web API */

def addClientUri() {
	if( state.uri.find {it.uri==params.uri} ) {
		log.debug "The URI ${params.uri} already exists in the list."
        return [success:false];
	} else {
        log.debug "Adding URI ${params.uri}"
        state.uri << [uri:params.uri, fails:0, successes:0]
	    return [success:true]
    }
}

def getClientUri() {
	return state.uri
}

def removeClientUri(uri) {
	if(!uri) uri=request.JSON?.uri
    def match=state.uri.find {it.uri==uri}
    if( uri && match ) {
    	log.debug "Deleting ${uri}"
        state.uri=state.uri - match
    } else if( uri ) { 
    	log.debug "The URI ${uri} was not in the list."
    } else {
    	log.debug "Clearing all URIs."
		state.uri=[]
    }
}

def getDeviceStatus() {
	def id=params.id
	def res=[]
    getDevices().each {if(id==null||id==it.id) res << getDeviceProps(it)}
    // If asking for all devices, also include the SHM
    if( id==null ) res << getAlarmSystemStatus()
	if( id==null ) return res
    else if( res.length ) return res[0]
    else return [:]
}

def setDeviceStatus() {
	def id=params.id
    def action=request.JSON?.action
    def device=findDevice(id)
    device."$action"()
}

def getAlarmSystemStatus() {
    def shm=location.currentState("alarmSystemStatus")
    if( shm ) return getAlarmSystemStatusProps(shm)
}

def setAlarmSystemStatus(mode) {
	if(!mode) mode=request.JSON?.value
    if( mode=="off" || mode=="away" || mode=="stay" )
		sendLocationEvent(name:"alarmSystemStatus", value:mode)
}

def getIntrusionStatus() {
    def val="off"
    if( intrusionSwitch && intrusionSwitch.currentValue("switch")[0]!="off" ) val="on"
    if( intrusionAlarm && intrusionAlarm.currentValue("alarm")[0]!="off" ) val="on"
    return [value:val]
}

def setIntrusionStatus(mode) {
    if(!mode) mode=request.JSON?.value
    log.debug mode
    if( mode=="on" ) {
	    // First, turn on intrusion notifiers
	    if( intrusionSwitch ) intrusionSwitch.on()
	    if( intrusionAlarm ) intrusionAlarm.both()
        // Set timer to check status after the delay period
    	log.debug "Intrusion is on! I will wait $noclearDelay seconds and check on things."
        runIn(noclearDelay, checkIntrusionStatus)
    } else {
    	// First, turn off intrusion notifiers
    	if( intrusionSwitch ) intrusionSwitch.off()
        if( intrusionAlarm ) intrusionAlarm.off()
        // Next, turn off the alarms, in case they were on
        if( noclearSwitch ) noclearSwitch.off()
        if( noclearAlarm ) noclearAlarm.off()
    }
}

def checkIntrusionStatus() {
	def intr=getIntrusionStatus()
    if( intr.value=="on" ) {
    	log.debug "Kicking off the alarms!!!"
        if( noclearSwitch ) noclearSwitch.on()
        if( noclearAlarm ) noclearAlarm.both()
    }
}

/* Event Handlers */

def generalDeviceEventHandler(evt) {
	def params = [
        uri: "/${evt.name}",
        body: getEventProps(evt)
    ]
    broadcastPostJson(params)
}

def alarmStatusHandler(evt) {
	def params = [
    	uri: "/shm",
        body: getAlarmSystemStatus()
    ]
    broadcastPostJson(params)
}

def intrusionHandler(evt) {
	def intr=getIntrusionStatus()
	def params = [
    	uri: "/intrusion",
        body: intr
    ]
    broadcastPostJson(params)
    setIntrusionStatus(intr.value)
}

def broadcastPostJson(params) {
	def origUri=params.uri
    for( u in state.uri ) {
		params.uri=u.uri+origUri
	    try {
    	    log.debug "$params.uri $params.body"
        	httpPostJson(params) { resp ->
            	if( resp.status==200 ) {
                	u.put("successes",u.successes+1)
                    u.put("fails",0)
                }
            	log.debug "${resp.status}: ${resp.data} and there have been ${u.successes} successes."
	        }
    	} catch (e) {
            u.put("fails",u.fails+1);
        	log.error "Something went wrong: $e and it has failed ${u.fails} time(s)."
            if( u.fails >= 20 ) {
            	log.debug "I'm removing ${u.uri} from the list for having too many failures."
                removeClientUri(u.uri)
            }
    	}
    }
}
