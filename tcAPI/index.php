<?php

$_SERVER["REQUEST_METHOD"] = "POST";
$_POST['upload'] = '100';
$_POST['download'] = '100';
$_POST["packetLoss"] = '100';
$_POST['latency'] = '100';
$_POST['jitter'] = '100';

/******************************************************************************
 * File Name: index.php
 * Author: Mark Giles
 * Date Created: 1/19/2017
 * Last Modified: 1/25/2017
 * Description:
 *      This file is used to implement the traffic controller messages received
 *      from the SDWAN demonstration dashboard. The messages received are simple
 *      in nature and contain the metrics related to traffic error injection 
 *      and rate limiting. Each of the parameters provided correspond to a Linux
 *      instruction for use with the tc Linux application. The attributes are
 *      captured and then executed on the server implementing this file using
 *      the shell_exec command.
 ******************************************************************************/

/*******************************************************************************
 * Class: EthernetInterface()
 * Description: Contains the attributes related to a single Linux interface. 
 *      These attributes include rate limiting and error injection settings to
 *      be implemented.
 * Parameters:
 *      $name (string) - name of the Linux interface (ex: eth0)
 *      $rate (number) - rate limit to be applied in mbps.
 *      $packetLoss (number) - percentage of packets to drop in this interface.
 *      $latency (number) - latency added to packets on this interface in
 *          milliseconds.
 *      $jitter (number) - variation in latency added on this interface in
 *          milliseconds.
 * Methods:
 *      setName($name) - changes the object's name attribute to the name
 *          provided.
 *      setRate($rate) - changes the object's rate attribute to the rate
 *          provided.
 *      setPacketLoss($packetLoss) - changes the object's packet loss
 *          percentage to the percentage provided.
 *      setLatency($latency) - changes the object's latency in milliseconds to
 *          the number provided.
 *      setJitter($jitter) - changes the objects jitter in milliseconds to the
 *          number provided.
 *      getName() - returns the value of the object's name attribute.
 *      getRate() - returns the value of the object's rate attribute.
 *      getPacketLoss() - returns the value of the object's packet loss
 *          attribute.
 *      getLatency() - returns the value of the object's latency attribute.
 *      getJitter() - returns the value of the object's jitter attribute.
 ******************************************************************************/
final class EthernetInterface {
    private $name;          // linux interface name (ex: eth0)
    private $rate;          // rate limit in mbps
    private $packetLoss;    // percentage packet loss
    private $latency;       // latency added to interface in milliseconds
    private $jitter;        // jitter added to interface in milliseconds
    
    // Mutator methods for object attributes
    public function setName($name) {
        $this->name = $name;
        return 0;
    }
    public function setRate($rate) {
        $this->rate = $rate;
        return 0;
    }
    public function setPacketLoss($packetLoss) {
        $this->packetLoss = $packetLoss;
        return 0;
    }
    public function setLatency($latency) {
        $this->latency = $latency;
        return 0;
    }
    public function setJitter($jitter) {
        $this->jitter = $jitter;
        return 0;
    }
    // Accessor methods for object attributes
    public function getName() {
        return $this->name;
    }
    public function getRate() {
        return $this->rate;
    }
    public function getPacketLoss() {
        return $this->packetLoss;
    }
    public function getLatency() {
        return $this->latency;
    }
    public function getJitter() {
        return $this->jitter;
    }
}

/*******************************************************************************
 * Class: TrafficController()
 * Description: Controls the rate limiting and error injection implementation
 *      for the provided interfaces.
 * Parameters:
 *      $interfaces (array[Object EthernetInterface]) - contains an array of
 *          ethernet interface objects.
 * Methods:
 *      addInterface($interface) - adds the provided interface to the object's
 *          interfaces array.
 *      clear() - clears all traffic controller settings on all of the object's
 *          interfaces.
 *      rateLimit() - implements the rate limit settings on all of the object's
 *          interfaces.
 *      inject() - injects error traffic control settings on all of the
 *          object's interfaces.
 *      update() - primary control method that clears, sets, and implements
 *          traffic control settings provided through the web message.
 ******************************************************************************/
class TrafficController {
    private $interfaces = array();      // array of ethernet interface objects
    private $download;                  // download speed in mbps
    private $upload;                    // upload speed in mbps
    
    public function getDownload() {
        return $this->download;
    }
    public function getUpload() {
        return $this->upload;
    }
    public function setDownload($download) {
        $this->download = $download;
    }
    public function setUpload($upload) {
        $this->upload = $upload;
    }
    public function addInterface($interface) {
        array_push($this->interfaces, $interface);
        return 0;
    }
    public function clear() {
        foreach($this->interfaces as $interface) {
            $command = "";
            $command = "sudo tc qdisc del dev " . $interface->getName() . "root 2>&1";
            //shell_exec($command);
        }
        return 0;
    }
    public function rateLimit() {
        $command = "";
        $command = "sudo tc qdisc add dev " . $this->interfaces[0]->getName() . "root handle 1:0 tbf";
        $command .= " rate " . $this->getDownload() . "kbit buffer 1600 limit 3000";
        $command .= " 2>&1";
        //shell_exec($command);
        
        $command = '';
        $command = "sudo tc qdisc add dev " . $this->interfaces[1]->getName() . "root handle 1:0 tbf";
        $command .= " rate " . $this->getUpload() . "kbit buffer 1600 limit 3000";
        $command .= " 2>&1";
        //shell_exec($command);
        
        return 0;
    }
    public function inject() {
        foreach($this->interfaces as $interface) {
            $command = "";
            $command = "sudo tc qdisc add dev " . $interface->getName() . "parent 1:0 handle 10: netem";
            $command .= " delay " . $interface->getLatency() . "ms";
            $command .= " " . $interface->getJitter() . "ms";
            $command .= " loss " . $interface->getPacketLoss() . "%";
            $command .= " 2>&1";
            //shell_exec($command);
        }
        return 0;
    }
    public function update() {
        $this->clear();
        $this->rateLimit();
        $this->inject();
        return 0;
    }
}

// if the method is post, we will implement the settings provided.
if ($_SERVER['REQUEST_METHOD'] == "POST") {
        // initialize traffic controller object
        $tc = new TrafficController();
        $tc->setDownload($_POST['download']);
        $tc->setUpload($_POST['upload']);
        // initialize ethernet interfaces with provided parameters
        $eth0 = new EthernetInterface();
        $eth0->setName("eth0");
        $eth0->setRate($_POST['upload']);
        $eth0->setPacketLoss($_POST['packetLoss']);
        $eth0->setLatency($_POST['latency']);
        $eth0->setJitter($_POST['jitter']);

        $eth1 = new EthernetInterface();
        $eth1->setName("eth1");
        $eth1->setRate($_POST['download']);
        $eth1->setPacketLoss($_POST['packetLoss']);
        $eth1->setLatency($_POST['latency']);
        $eth1->setJitter($_POST['jitter']);
    
        // add the interfaces to the traffic controller interfaces array
        $tc->addInterface($eth0);
        $tc->addInterface($eth1);
        // store and implement information provided on all interfaces
        $tc->update();
}