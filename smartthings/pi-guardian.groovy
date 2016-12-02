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
	section("Notify when doors open:") {
		input "contact", "capability.contactSensor", title: "Where?", multiple: true, required: false
	}
	section("Notify when presence sensors arrive:") {
		input "presence", "capability.presenceSensor", title: "Which sensor?", multiple: true, required: false
	}
    section("Intrusion detection:") {
    	input "intrusionSwitch", "capability.switch", title: "Which switch?", multiple: true, required: false
        input "intrusionAlarm", "capability.alarm", title: "Which alarm?", multiple: true, required: false
    }
    section("API endpoint:") {
    	input "uri", "text", title: "URL:"
    }
}

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
	log.debug "Subscribe to ${contact} and ${presence}"
	subscribe(contact, "contact.open", contactOpenHandler)
    subscribe(presence, "presence", presenceHandler) 
    subscribe(location, "alarmSystemStatus", alarmStatusHandler)
    subscribe(intrusionSwitch, "switch", intrusionHandler)
    subscribe(intrusionAlarm, "alarm", intrusionHandler)
}

def contactOpenHandler(evt) {
    def params = [
        uri: "${settings.uri}/notification/openclosesensor",
        body: [
            device: evt.displayName,
            action: evt.value
        ]
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

def presenceHandler(evt) {
	if (evt.value == "present") {
		def params = [
        	uri: "${settings.uri}/notification/presence",
            body: [
            	device: evt.displayName,
                action: "arrived"
            ]
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
}

def alarmStatusHandler(evt) {
    try {
        httpGet("${settings.uri}/notification/shm/${evt.value}") { resp ->
			log.debug "${resp.status}: ${resp.data}"
		}
    } catch (e) {
        log.error "something went wrong: $e"
    }
}

def intrusionHandler(evt) {
    try {
        httpGet("${settings.uri}/notification/intrusion/${evt.value=='off'?evt.value:'on'}") { resp ->
			log.debug "${resp.status}: ${resp.data}"
		}
    } catch (e) {
        log.error "something went wrong: $e"
    }
}