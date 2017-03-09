/******************************************************************************
 * File Name: testCase1.js
 * Author: Mark Giles
 * Date Created: 1/19/2017
 * Last Modified: 1/24/2017
 * Description:
 *      This file is used to control the view and the network based traffic
 *      control devices for a demonstration of the SDWAN product. Error
 *      injection metrics are tracked, displayed to the screen to inform the
 *      user, and sent to the traffic controllers (via REST API) for
 *      implementation.
 * 
 *      The TrafficController function serves an object used to contain
 *      metrics to be sent to traffic controllers for implementation. Once
 *      gathered, the information is sent via outboudn REST API message to
 *      instruct the controllers to implement the required errors.
 * 
 *      The metrics and demoButton functions serve objects that are used to
 *      track the same information so that it can be rendered to the screen
 *      appropriately. They are also used to control the timing loop that
 *      consistently changes settings, resets the demo when needed, and keeps
 *      the user informed.
 ******************************************************************************/
 
/******************************************************************************
 * UTILITIES
 *****************************************************************************/
 
// level of log messages that should be logged to the console.
// Available options are: 'error', 'debug', and 'info'
// All messages will be logged equal to or lower than the loggingLevel setting
var loggingLevel = 'info';

/**
* @desc
    Takes a level of logging and determines if the message will be logged to 
    the console.
* @param
    level (string)
        Current level of logging for the application.
    message (string)
        The message to be logged to the console based on the level.
* @return bool - logged or notLogged
*/
function log(level, message) {
    if ((loggingLevel === 'error') ||
        (loggingLevel === 'debug' && (level === 'debug' || level === 'info')) ||
        (loggingLevel === 'info' && level === 'info')) {
        console.log(level + ": " + message);

        return "logged";
    }

    return "notLogged";
}



/******************************************************************************
 * TRAFFIC CONTROLLER
 *****************************************************************************/

/**
  @desc TrafficController object used to configure and send update messages
        to a device in order to modify its network performance.

  @methods
    setDownload()
    setUpload()
    setJitter()
    setLatency()
    setPacketLoss()
    getDownload()
    getUpload()
    getJitter()
    getLatency()
    getPacketLoss()
    sendTCUpdate()

  @param
    download (number) - download speed in mbps for network simulation.
    upload (number) - upload speed in mbps for network simulation.
    jitter (number) - variance in network delay in milliseconds (ms).
    latency (number) - number in network delay in milliseconds (ms).
    packetLoss (number) - percentage of packets to be dropped by specified interface.
    url (string) - the url used to connect to the traffic controller.
*/
function TrafficController() {
    // Accessor methods to manually set TrafficController attributes
    this.download = 0;
    this.upload = 0;
    this.jitter = 0;
    this.latency = 0;
    this.packetLoss = 0;
    
    /**
    * @desc
        Sets the url used to connect to the traffic controller.
    * @param
        url (string)
            Url used to connect to the traffic controller.
    */
    this.setUrl = function(url) {
        this.url = url;
    };
    
    /**
    * @desc
        Sets the download parameter (mbps) for traffic control.
    * @param
        download (string)
            Download throughput (mbps) to be limited on the device.
    */
    this.setDownload = function(download) {
        this.download = download;
    };
    
    /**
    * @desc
        Sets the upload parameter (mbps) for traffic control.
    * @param
        upload (string)
            Upload throughput (mbps) to be limited on the device.
    */
    this.setUpload = function(upload) {
        this.upload = upload;
    };
    
    /**
    * @desc
        Sets the jitter parameter (ms) for traffic control.
    * @param
        jitter (string)
            Jitter setting (ms) for traffic control.
    */
    this.setJitter = function(jitter) {
        this.jitter = jitter;
    };
    
    /**
    * @desc
        Sets the latency parameter (ms) for traffic control.
    * @param
        jitter (string)
            Latency (ms)setting for traffic control.
    */
    this.setLatency = function(latency) {
        this.latency = latency;
    };
    
    /**
    * @desc
        Sets the packet loss parameter for traffic control.
    * @param
        packetLoss (string)
            Packet loss setting for traffic control.
    */
    this.setPacketLoss = function(packetLoss) {
        this.packetLoss = packetLoss;
    };

    // Mutator methods to access attributes of the TrafficController object

    /**
    * @desc
        Returns the url used to connect to this traffic controller.
    * @return string - Usrl used to connect to this traffic controller.
    */
    this.getUrl = function() {
        return this.url;
    };
    
    /**
    * @desc
        Returns the download value (mbps) of the TrafficController object.
    * @return number - download attribute value
    */
    this.getDownload = function() {
        return this.download;
    };

    /**
    * @desc
        Returns the upload value (mbps) of the TrafficController object.
    * @return number - upload attribute value
    */
    this.getUpload = function() {
        return this.upload;
    };

    /**
    * @desc
        Returns the jitter value (ms) of the TrafficController object.
    * @return number - jitter attribute value
    */
    this.getJitter = function() {
        return this.jitter;
    };

    /**
    * @desc
        Returns the latency value (ms) of the TrafficController object.
    * @return number - latency attribute value
    */
    this.getLatency = function() {
        return this.latency;
    };

    /**
    * @desc
        Returns the packet loss (%) value of the TrafficController object.
    * @return number - packet loss attribute value
    */
    this.getPacketLoss = function() {
        return this.packetLoss;
    };

    /**
    * @desc
        Checks to ensure that all parameters are configured and valid before
        allowing the message be sent to the traffic control device.
    * @return bool - 1 for valid and ready to submit, 0 otherwise
    */
    this.validate = function() {
        if (this.getDownload() < 0 ||
            this.getUpload() < 0 ||
            this.getJitter() < 0 ||
            this.getLatency() < 0 ||
            this.getPacketLoss() < 0) {
            return 1;
        }

        return 0;
    };

    /**
    * @desc
        Sends configuration message to specified host to change traffic 
        control settings.
    * @param
        packetLoss (string)
            TrafficController packet loss attribute.
    * @return bool - 1 for success or 0 for failure
    */
    this.sendTCUpdate = function() {
        // validate that all parameters are configured and ready to send
        if (this.validate() === 1) {
            log('error', 'TrafficController - sendTCUpdate(host): TC Object not validated, unable to send TC Update');
            
            // exit without sending update if object not valid
            return 1;
        }
        log('info', "TrafficController - sendTCUpdate(host): Sending updated configurations to " + this.url);
        log('info', "TrafficController - sendTCUpdate(host): Parameters Used: Download: " + this.download + 
                    ", Upload: " + this.upload +
                    ", Jitter: " + this.jitter +
                    ", Latency: " + this.latency +
                    ", Packet Loss: " + this.packetLoss);
        // send ajax message with parameters specified in the current object
        $.ajax({
            url: this.url,
            data: {
                download: this.download,
                upload: this.upload,
                jitter: this.jitter,
                latency: this.latency,
                packetLoss: this.packetLoss
            },
            dataType: 'html',
            success: function(message) {
                console.log('ajax s');
                console.log(message);
                // response if AJAX call to traffic controller is successful
                log('info', "TrafficController - sendTCUpdate(): TC Updated Successfully");
            },
            error: function(message) {
                console.log('ajax e');
                console.log(message);
                // response if AJAX call to traffic controller is unsuccessful
                log('info', "TrafficController - sendTCUpdate(): TC Update Failed");
            },
            type: 'POST'
        });
        return 0;
    };
}

/**
* @desc
    Metrics object used to track details related to the demonstration. 
    Details include traffic controller settings and display messages.
*/
function Metrics() {
    // milliseconds between each phase of the demonstration
    this.delay = 1000;
    // status text element for displaying current status information
    this.statusText = document.getElementById('statusText');
    // span element to hold packet loss percentage
    this.totalPacketLoss = document.getElementById('totalPacketLoss');
    // latency number to show current injected latency
    this.totalLatency = document.getElementById('totalLatency');
    // jitter number to show current injected jitter
    this.totalJitter = document.getElementById('totalJitter');
    // actual text content to be shown in the status text element
    this.status = '';
    // traffic controller object for the first traffic controller
    this.tc1 = new TrafficController('https://sdwan-demo2017-justinrice.c9users.io/sd-wan-master/tcAPI');
    // traffic controller object for the second traffic controller
    this.tc2 = new TrafficController('https://sdwan-demo2017-justinrice.c9users.io/sd-wan-master/tcAPI');
    // set all variables for the metrics object using the parameters provided
    this.set = function(statusText, wanMetrics) {
        // the metrics status text changed to the text provided
        this.status = statusText;
        // set all traffic controller parameters on tc1
        this.tc1.setPacketLoss(wanMetrics.wan1.packetLoss);
        this.tc1.setLatency(wanMetrics.wan1.latency);
        this.tc1.setJitter(wanMetrics.wan1.jitter);
        this.tc1.setUpload(wanMetrics.wan1.upload);
        this.tc1.setDownload(wanMetrics.wan1.download);
        // set all traffic controller parameters on tc2
        this.tc2.setPacketLoss(wanMetrics.wan2.packetLoss);
        this.tc2.setLatency(wanMetrics.wan2.latency);
        this.tc2.setJitter(wanMetrics.wan2.jitter);
        this.tc2.setUpload(wanMetrics.wan2.upload);
        this.tc2.setDownload(wanMetrics.wan2.download);
    };
    // send all saved parameters
        // view elements are rendered to the screen
        // traffic controller elements are sent to the api for error injection
    this.update = function() {
        // change elements on the screen
        this.statusText.textContent = this.status;
        this.totalPacketLoss.textContent = this.tc1.getPacketLoss() + " %";
        this.totalLatency.textContent = this.tc1.getLatency() + " ms";
        this.totalJitter.textContent = this.tc1.getJitter() + " ms";
        // send updates to traffic controllers
        this.tc1.sendTCUpdate();
        this.tc2.sendTCUpdate();
    }
};

/**
* @desc
    HTML element and relevant settings for the button used to interact with the
    demonstraion.
*/
function DemoButton() {
    // tracks whether the button can be pressed
    this.active = 1;
    // the html DOM element itself
    this.element = document.getElementById('btn');
    // tracks the number of times the button is clicked (only counts if active)
    this.clickCount = 0;
    // tracks the number of times to loop during error injection
    this.loopCount = 0;
    // disables the button so it cannot be pressed
    this.disable = function() {
        this.element.className = "btn inactive";
        this.active = 0;
    };
    // enables the button so it can be pressed
    this.enable = function() {
        this.element.className = "btn active";
        this.active = 1;
    };
};

// create the demo button for interaction
var db = new DemoButton();
// initialize the demo metrics
var m = new Metrics();

// when the demo button is pressed while active
function nextStep() {
    // if the button is not active, return without proceeding
    if (!db.active) {
        return 1;
    }
    // increment the number of times the button is clicked
    db.clickCount++;
    log('info', 'demoClick(): Demo button clicked. Current click count: ' + db.clickCount);
    // initial click modifications
    if (db.clickCount === 1) {
        db.element.textContent = "Continue";
        // set the metric parameters
        m.set("Initialize a phone call between the two sites and click 'Continue'", {
            wan1 : {
                packetLoss : 0,
                latency : 30,
                jitter : 0,
                download : 50,
                upload : 10,
            },
            wan2 : {
                packetLoss : 0,
                latency : 30,
                jitter : 0,
                download : 10,
                upload : 1,
            }
        });
        // update the parameters on screen and on traffic controllers
        m.update();
    } else if (db.clickCount === 2) {
        // disable button after second click
        db.disable();
        // update information stored in metrics object
        db.element.textContent = "Running";
        m.set("Demo currently running...", {
            wan1 : {
                packetLoss : 0,
                latency : 30,
                jitter : 0,
                download : 50,
                upload : 10,
            },
            wan2 : {
                packetLoss : 0,
                latency : 30,
                jitter : 0,
                download : 10,
                upload : 1
            }
        });
        // update parameters on screen and on traffic controllers
        m.update();
        // begin loop for remainder of demo settings
        var loopInterval = setInterval(function() {
            // set incrementing metric object parameters
            m.set("Demo currently running...", {
                wan1 : {
                    packetLoss : m.tc1.getPacketLoss() + 5,
                    latency : m.tc1.getLatency() + 22,
                    jitter : m.tc1.getJitter() + 20,
                    download : 50,
                    upload : 10
                },
                wan2 : {
                    packetLoss : m.tc1.getPacketLoss() + 5,
                    latency : m.tc1.getLatency() + 22,
                    jitter : m.tc1.getJitter() + 20,
                    download : 10,
                    upload : 1
                }
            });
            // update parameters on screen and on traffic controllers
            m.update();
            // increment loop counter to enable exit after 10 loop iterations
            db.loopCount++;
            // final stage and loop exit
            if (db.loopCount === 10) {
                // final stage, set demo complete display information
                db.element.textContent = "Reset";
                // set metric object information
                m.set("Demo complete, click 'Reset' to start over...", {
                    wan1 : {
                        packetLoss : 0,
                        latency : 30,
                        jitter : 0,
                        download : 50,
                        upload : 10
                    },
                    wan2 : {
                        packetLoss : 0,
                        latency : 30,
                        jitter : 0,
                        download : 10,
                        upload : 1
                    }
                });
                // send metric object information to screen and traffic controllers
                m.update();
                // enable the button for pressing
                db.enable();
                // stop the loop
                clearInterval(loopInterval);
            }
        }, m.delay);
    } else if (db.clickCount === 3) {
        // after reset, allows user to reset demo parameters without refreshing page
        db.element.textContent = "Start Test";
        // set metric object parameters to defaults
        m.set('Click the "Start Test" button to the left to begin the demo.', {
            wan1 : {
                packetLoss : 0,
                latency : 0,
                jitter : 0,
                download : 50,
                upload : 10,
            },
            wan2 : {
                packetLoss : 0,
                latency : 0,
                jitter : 0,
                download : 10,
                upload : 1,
            }
        });
        // send metric object parameters to screen and traffic controllers
        m.update();
        // reset click count and loop count for new demo
        db.clickCount = 0;
        db.loopCount = 0;
    }

    return 0;
}

// wait for button click
db.element.addEventListener("click", function( event ) {
    nextStep();
}, false);