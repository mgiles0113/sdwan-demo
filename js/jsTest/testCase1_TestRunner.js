/******************************************************************************
 * UNIT TESTS
 *****************************************************************************/

/******************************************************************************
 * Function - log(level, message)
 *****************************************************************************/
// logging level logs appropriately - loggingLevel = "error"
QUnit.test( "loggingLevel = error, levels set to all three options, message should be logged or not logged appropriately", function( assert ) {
    loggingLevel = "error";
    assert.ok( log('info', 'log message') === "logged", "Passed!" );
    assert.ok( log('debug', 'log message') === "logged", "Passed!" );
    assert.ok( log('error', 'log message') === "logged", "Passed!" );
});

// logging level logs appropriately - loggingLevel = "debug"
QUnit.test( "loggingLevel = debug, levels set to all three options, message should be logged or not logged appropriately", function( assert ) {
    loggingLevel = "debug";
    assert.ok( log('info', 'log message') === "logged", "Passed!" );
    assert.ok( log('debug', 'log message') === "logged", "Passed!" );
    assert.ok( log('error', 'log message') === "notLogged", "Passed!" );
});

// logging level logs appropriately - loggingLevel = "info"
QUnit.test( "loggingLevel = info, levels set to all three options, message should be logged or not logged appropriately", function( assert ) {
    loggingLevel = "info";
    assert.ok( log('info', 'log message') === "logged", "Passed!" );
    assert.ok( log('debug', 'log message') === "notLogged", "Passed!" );
    assert.ok( log('error', 'log message') === "notLogged", "Passed!" );
});

/******************************************************************************
 * Function - TrafficController()
 *****************************************************************************/
QUnit.test( "TrafficController object initialized and initial parameters set appropriately", function( assert ) {
    var testTC = new TrafficController();
    assert.ok( testTC.constructor.name === "TrafficController", "Passed!" );
    assert.ok( testTC.download === 0, "Passed!" );
    assert.ok( testTC.upload === 0, "Passed!" );
    assert.ok( testTC.jitter === 0, "Passed!" );
    assert.ok( testTC.latency === 0, "Passed!" );
    assert.ok( testTC.packetLoss === 0, "Passed!" );
});

QUnit.test( "TrafficController accessor and mutator functions work appropriately", function( assert ) {
    var testTC = new TrafficController();
    testTC.setDownload(100);
    assert.ok( testTC.getDownload() === 100, "Passed!" );
    testTC.setUpload(100);
    assert.ok( testTC.getUpload() === 100, "Passed!" );
    testTC.setJitter(100);
    assert.ok( testTC.getJitter(100) === 100, "Passed!" );
    testTC.setLatency(100);
    assert.ok( testTC.getLatency() === 100, "Passed!" );
    testTC.setPacketLoss(100);
    assert.ok( testTC.getPacketLoss(100) === 100, "Passed!" );
});

QUnit.test( "TrafficController validate function fails if any attributes are not set", function( assert ) {
    var testTC = new TrafficController();
    // valid settings...initial with added test url
    testTC.setUrl('testUrl');
    assert.ok( testTC.validate() === 0, "Passed!" );
    
    // invalid download should fail
    testTC.setDownload(-1);
    assert.ok( testTC.validate() === 1, "Passed!" );
    testTC.setDownload(1);
    
    // invalid upload should fail
    testTC.setUpload(-1);
    assert.ok( testTC.validate() === 1, "Passed!" );
    testTC.setUpload(1);
    
    // invalid jitter should fail
    testTC.setJitter(-1);
    assert.ok( testTC.validate() === 1, "Passed!" );
    testTC.setJitter(1);
    
    // invalid latency should fail
    testTC.setLatency(-1);
    assert.ok( testTC.validate() === 1, "Passed!" );
    testTC.setLatency(1);
    
    // invalid packet loss should fail
    testTC.setPacketLoss(-1);
    assert.ok( testTC.validate() === 1, "Passed!" );
    testTC.setPacketLoss(1);
    
    // invalid url should fail
    testTC.setUrl('');
    assert.ok( testTC.validate() === 1, "Passed!" );
});

QUnit.test( "TrafficController sendTCUpdate fails if not valid", function( assert ) {
    var testTC = new TrafficController();
    assert.ok( testTC.sendTCUpdate() === 1, "Passed!" );
});

QUnit.test( "TrafficController sendTCUpdate succeeds if valid", function( assert ) {
    var testTC = new TrafficController();
    testTC.setUrl('testUrl');
    assert.ok( testTC.sendTCUpdate() === 0, "Passed!" );
});

/******************************************************************************
 * Function - Metrics()
 *****************************************************************************/
 QUnit.test( "Metrics initialized and contains initial parameters", function( assert ) {
    var m = new Metrics();
    m.delay = 1000;
    assert.ok( m.delay === 1000, "Passed!" );
    assert.ok( m.status === '' , "Passed!" );
    assert.ok( m.tc1.constructor.name === "TrafficController", "Passed!" );
    assert.ok( m.tc2.constructor.name === "TrafficController", "Passed!" );
});

QUnit.test( "Metrics set method appropriately applies attribute values", function( assert ) {
    var m = new Metrics();
    m.set('test status', {
        wan1 : {
            packetLoss : 10,
            latency : 11,
            jitter : 12,
            download : 13,
            upload : 14,
        },
        wan2 : {
            packetLoss : 20,
            latency : 21,
            jitter : 22,
            download : 23,
            upload : 24,
        }
    });
    
    // status text was set appropriately by metrics object
    assert.ok( m.status === "test status", "Passed!" );
    // traffic controller 1 attributes set appropriately by metrics object
    assert.ok( m.tc1.getPacketLoss() === 10, "Passed!" );
    assert.ok( m.tc1.getLatency() === 11, "Passed!" );
    assert.ok( m.tc1.getJitter() === 12, "Passed!" );
    assert.ok( m.tc1.getDownload() === 13, "Passed!" );
    assert.ok( m.tc1.getUpload() === 14, "Passed!" );
    // traffic controller 2 attributes set appropriately by metrics object
    assert.ok( m.tc2.getPacketLoss() === 20, "Passed!" );
    assert.ok( m.tc2.getLatency() === 21, "Passed!" );
    assert.ok( m.tc2.getJitter() === 22, "Passed!" );
    assert.ok( m.tc2.getDownload() === 23, "Passed!" );
    assert.ok( m.tc2.getUpload() === 24, "Passed!" );
});

QUnit.test( "Metrics update method renders attributes to screen and sends message to TCUpdate", function( assert ) {
    var m = new Metrics();
    m.set('test status', {
        wan1 : {
            packetLoss : 10,
            latency : 11,
            jitter : 12,
            download : 13,
            upload : 14,
        },
        wan2 : {
            packetLoss : 20,
            latency : 21,
            jitter : 22,
            download : 23,
            upload : 24,
        }
    });

    m.update();
    assert.ok( m.statusText.textContent === 'test status', "Passed!" );
    assert.ok( m.totalPacketLoss.textContent = m.tc1.getPacketLoss() + " %");
    assert.ok( m.totalLatency.textContent = m.tc1.getLatency() + " ms");
    assert.ok( m.totalJitter.textContent = m.tc1.getJitter() + " ms");    
});

/******************************************************************************
 * Function - DemoButton()
 *****************************************************************************/
QUnit.test( "DemoButton initializes and has initial attributes", function( assert ) {
    var db = new DemoButton();
    assert.ok( db.active === 1, "Passed!" );
    assert.ok( db.clickCount === 0, "Passed!" );
    assert.ok( db.loopCount === 0, "Passed!" );
});

QUnit.test( "DemoButton member methods function appropriately", function( assert ) {
    var db = new DemoButton();
    assert.ok( db.active === 1, "Passed!" );
    db.disable();
    assert.ok( db.active === 0, "Passed!" );
    db.enable();
    assert.ok( db.active === 1, "Passed!" );
});

/******************************************************************************
 * Function - nextStep()
 *****************************************************************************/
 QUnit.test( "nextStep function first step works appropriately", function( assert ) {
    db.disable();
    assert.ok( nextStep() === 1, "Passed!" );
    db.enable();
    assert.ok( nextStep() === 0, "Passed!" );
    assert.ok( db.clickCount === 1, "Passed!" );
    assert.ok( nextStep() === 0, "Passed!" );
    assert.ok( db.clickCount === 2, "Passed!" );
    assert.ok( db.active === 0, "Passed!" );
    db.enable();
    db.clickCount = 3;
    assert.ok( db.clickCount === 3, "Passed!" );
    assert.ok( nextStep() === 0, "Passed!" );
});