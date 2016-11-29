# Home Automation with the Raspberry Pi #

The title says it all!

The intent of this project is to empower a [Raspberry Pi](https://www.raspberrypi.org) 
to provide enhanced automation in conjunction with [SmartThings](https://www.smartthings.com) 
and other services like [IFTTT](https://ifttt.com).

This is a new project and in a huge state of flux.

## What are we accomplishing here? ##

The ultimate intention is to configure a Raspberry Pi so that in conjunction with a touchscreen display
it can become a console or control panel providing smart home automation and security controls, similar
to modern commercial home security systems today. Except this is open source and free! :-) 

The features described below are the vision. Most of it is not yet reality.

The Node.js app running on the Raspberry Pi will listen for incoming notifications and will trigger 
sounds and images on the screen. Furthermore, the configurable dashboard will display the current status
of various things on the network. A pin pad will be available for arming and disarming the state of the
security monitoring. The app is purely providing a user interface to a hub, though. 

Integration with the SmartThings hub is the key to the app being of any value. The "Pi Guardian" SmartApp 
must be installed and configured on your SmartThings deployment to provide the integration between 
SmartThings and the Raspberry Pi app.

Optionally, installing [Jasper](http://jasperproject.github.io) allows you to have voice control abilities. 
This may seem unnecessary if you use Amazon Echo, but it presently has restrictions and limitations that 
make it inconvenient for home security. Implementing local voice control gives complete control, albeit in 
a secondary system.

Also optional, installing [Shairport Sync](https://github.com/mikebrady/shairport-sync) allows the device to
double as an AirPlay speaker for whatever room it is placed in.

## Technologies used ##

  * Node.js with [Express](http://expressjs.com) and [Electron](http://electron.atom.io)
  * [Google Translate](https://translate.google.com) for TTS
  * [SmartThings](https://www.smartthings.com), along with the Pi Guardian SmartApp for triggering events
  * Optionally, [IFTTT](https://ifttt.com) for triggering or receiving events
  * Optionally, [Jasper](http://jasperproject.github.io) for voice control 
  * Optionally, [Shairport Sync](https://github.com/mikebrady/shairport-sync) for AirPlay functionality

## Installation Notes ##

These are not thorough notes and need some more vetting. 

### Materials ###

  * [Raspberry Pi 3 Model B](https://www.raspberrypi.org/products/raspberry-pi-3-model-b)
  * [Raspberry Pi touchscreen](https://www.raspberrypi.org/products/raspberry-pi-touch-display)
  * [SmartThings Hub](https://www.smartthings.com)
  * Any way you choose to mount it, for example, this [RS Premium Touchscreen Case](https://www.amazon.com/dp/B01GQFUWIC)
  * Speaker of your choice (a Bluetooth speaker to reduce amount of wires)
  * Obvious miscellaneous Raspberry Pi necessities, like a power cord and MicroSDHC card

Other optional equipment you may choose to acquire:

  * If using Jasper, a decent omnidirection microphone
  * Unrelated to this project, you may choose to acquire some [Amazon Echos](https://www.amazon.com/echo) or 
    [Dots](https://www.amazon.com/dot) for whole-house voice control

### Basic Instructions/Tech Notes ###

1. Download [Raspbian Jessie](https://www.raspberrypi.org/downloads/raspbian) and install on the Raspberry Pi.

2. Do some some configuration in the Preferences panel. 
   * In the Raspberry Pi Configuration panel, enable SSH and VNC. This makes the rest of setup easier.
   * Configure all the locale settings for your area.
   * Set up wi-fi so network connectivity is up and running.

3. Update the system.

   ```
   sudo apt-get update
   sudo apt-get upgrade
   ```

4. Install `xscreensaver`. This will be handy to avoid burn-in. Adjust settings as desired once installed.

   ```
   sudo apt-get install xscreensaver xscreensaver-gl-extra xscreensaver-data-extra
   ```

5. Install Node.js by following
   [these excellent instructions](http://thisdavej.com/beginners-guide-to-installing-node-js-on-a-raspberry-pi/#install-node)
   by Dave Johnson.

6. Install this home automation app and start it running!
   ```
   sudo apt-get install screen
   mkdir ~/Documents/node
   cd ~/Documents/node
   git clone https://github.com/joshuacurtiss/HomeAutomation-RaspberryPi.git homeautomation
   cd homeautomation
   screen -d -m node server
   ```
   You'll also want to place sound clips somewhere in your system and create a `production.js` config file
   that reflects the sound clip paths.

   Note that I'm not providing instructions for setting this app up as a service because the development of
   changing this app from a service to a GUI app that is run at login/startup is currently in process. I will 
   update these instructions accordingly as I make changes.

7. On the [SmartThings/dev](http://developer.smartthings.com) site, install the Pi Guardian SmartApp on
   your account and publish it "For Yourself". Then go into the SmartThings app on your mobile device and 
   install and configure Pi Guardian for your home.

8. Go open a door and hear the open sensor announcements!

### Installation of Miscellaneous Niceties ###

* Installing Shairport Sync

  Download and install Mike Brady's [Shairport Sync](https://github.com/mikebrady/shairport-sync) using 
  [these excellent instructions](http://www.chickensinenvelopes.net/2016/02/airplay-receiver-with-raspbian-jessie)
  by John Coxon. As if by magic, your Raspberry Pi will now double as an AirPlay speaker!

  After following the instructions, you should reboot your Raspberry Pi or call `sudo service service avahi-daemon restart`
  for things to take effect.

* Installing Jasper Project

  This is future. Still need to figure out how to install and configure this. The goal is to have your own "Jarvis" that
  can perform any spoken commands you want, and not relying on restrictions or limitations of Alexa.

  Install using [their instructions](http://jasperproject.github.io/documentation/installation).