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
    iconUrl: "https://s3.amazonaws.com/smartapp-icons/Convenience/Cat-Convenience.png",
    iconX2Url: "https://s3.amazonaws.com/smartapp-icons/Convenience/Cat-Convenience@2x.png",
    iconX3Url: "https://s3.amazonaws.com/smartapp-icons/Convenience/Cat-Convenience@2x.png",
    oauth: [displayName: "Pi Guardian", displayLink: ""])


preferences {
	section("Control/monitor the following devices:") {
		input "contact", "capability.contactSensor", title: "Where?", multiple: true, required: false
		input "presence", "capability.presenceSensor", title: "Which sensor?", multiple: true, required: false
    	input "switches", "capability.switch", title: "Which switch?", multiple: true, required: false
        input "bulb", "capability.bulb", title: "Which bulbs?", multiple: true, required: false
        input "lock", "capability.lock", title: "Which locks?", multiple: true, required: false
	}
    section("Intrusion detection:") {
    	input "intrusionSwitch", "capability.switch", title: "Which switch?", multiple: true, required: false
        input "intrusionAlarm", "capability.alarm", title: "Which alarm?", multiple: true, required: false
    }
    section("API endpoint:") {
    	input "uri", "text", title: "URL:"
    }
}

mappings {
  path("/devices") {
    action: [
      GET: "getDeviceStatus"
    ]
  }
  path("/devices/:id") {
    action: [
      GET: "getDeviceStatus",
      POST: "setDeviceStatus"
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
	initialize()
}

def initialize() {
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

def getDeviceProps(device,valueprop="") {
	return [id:device.id, device:device.name, name:device.displayName, value:device.currentValue(valueprop), battery:device.currentValue("battery")];
}

def getEventProps(evt) {
	return [id:evt.id, type:evt.name, value:evt.value, device:getDeviceProps(evt.device,evt.name)]
}

def findDevice(id) {
	return getDevices().findAll{it.id==id}[0]
}

/* Web API */

def getDeviceStatus() {
	def id=params.id
	def res=[]
    contact.each {if(id==null||id==it.id) res << getDeviceProps(it,"contact")}
    presence.each {if(id==null||id==it.id) res << getDeviceProps(it,"presence")}
    switches.each {if(id==null||id==it.id) res << getDeviceProps(it,"switch")}
    bulb.each {if(id==null||id==it.id) res << getDeviceProps(it,"switch")}
    lock.each {if(id==null||id==it.id) res << getDeviceProps(it,"lock")}
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

/* Event Handlers */

def generalDeviceEventHandler(evt) {
	def params = [
        uri: "${settings.uri}/${evt.name}",
        body: getEventProps(evt)
    ]
	try {
    	log.debug "$params.uri $params.body"
        httpPostJson(params) { resp ->
            log.debug "${resp.status}: ${resp.data}"
        }
    } catch (e) {
        log.debug "something went wrong: $e"
    }
}

def alarmStatusHandler(evt) {
	def params = [
    	uri: "${settings.uri}/shm",
        body: getEventProps(evt)
    ]
	try {
        log.debug "$params.uri $params.body"
        httpPostJson(params) { resp ->
            log.debug "${resp.status}: ${resp.data}"
        }
    } catch (e) {
        log.error "something went wrong: $e"
    }
}

def intrusionHandler(evt) {
	def params = [
    	uri: "${settings.uri}/intrusion",
        body: getEventProps(evt)
    ]
    try {
        log.debug "$params.uri $params.body"
        httpPostJson(params) { resp ->
            log.debug "${resp.status}: ${resp.data}"
        }
    } catch (e) {
        log.error "something went wrong: $e"
    }
}