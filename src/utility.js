/*******************************************************************************
 * Copyright (c) 2015 IBM Corp.
 *
 * All rights reserved. This program and the accompanying materials
 * are made available under the terms of the Eclipse Public License v1.0
 * and Eclipse Distribution License v1.0 which accompany this distribution.
 *
 * The Eclipse Public License is available at
 *    http://www.eclipse.org/legal/epl-v10.html
 * and the Eclipse Distribution License is available at
 *   http://www.eclipse.org/org/documents/edl-v10.php.
 *
 * Contributors:
 *    James Sutton - Initial Contribution
 *******************************************************************************/

/*
Eclipse Paho MQTT-JS Utility
This utility can be used to test the Eclipse Paho MQTT Javascript client.
*/

// Create a client instance
client = null;
connected = false;
subcribed = false;
// Things to do as soon as the page loads
//document.getElementById("clientIdInput").value = 'js-utility-' + makeid();
enableCheckbox();

// called when the client connects
function onConnect(context) {
  // Once a connection has been made, make a subscription and send a message.
  console.log("Client Connected");
  var statusSpan = document.getElementById("connectionStatus");
  statusSpan.innerHTML = "Connected";
  connected = true;
  setFormEnabledState(true);
}

function onFail(context) {
  console.log("Failed to connect");
  var statusSpan = document.getElementById("connectionStatus");
  statusSpan.innerHTML = "Failed to connect";
  connected = false;
  subcribed = false;
  document.getElementById("clientConnectButton").innerHTML = "Connect";
  disableCheckbox();
}

// called when the client loses its connection
function onConnectionLost(responseObject) {
  if (responseObject.errorCode !== 0) {
    console.log("Connection Lost: " + responseObject.errorMessage);
  }
  var statusSpan = document.getElementById("connectionStatus");
  statusSpan.innerHTML = "Connection Lost";
  connected = false;
  subcribed = false;
  disableCheckbox();
}

// called when a message arrives
function onMessageArrived(message) {
  console.log('Message Recieved: Topic: ', message.destinationName, '. Payload: ', message.payloadString, '. QoS: ', message.qos);
  console.log(message);
  
  var arr = message.payloadString.split("|");

  document.getElementById("outputTemperature").value = arr[0];
  document.getElementById("outputHumidity").value = arr[1];
  document.getElementById("outputGas").value = arr[2];

  document.getElementById("fanStatus").checked = parseInt(arr[3]);
  document.getElementById("lightStatus").checked = parseInt(arr[4]);
  document.getElementById("mostorizerStatus").checked = parseInt(arr[5]);



  var date = new Date();
  var messageTime = "" + date.getHours() + ":" + date.getMinutes() + ":" + date.getSeconds() + "  " + date.getDate() + "/" + date.getMonth() + "/" + date.getYear();
  document.getElementById("outputLastSynchronize").value = messageTime;
}

function connectionToggle(){

  if(connected){
    disconnect();
  } else {
    connect();
  }
}

function subscribeToggle(){

  if(subcribed){
    unsubscribe();
    
  } else {
    subscribe();
  }
}


function connect(){

  // Those variable below can't be fixed by user
    var hostname = "m11.cloudmqtt.com";
    var port = "36416";
    var clientId = "IOT-Website";
    var path = "";
    var user = 'gbmswwpl';
    var pass = 'jZf8eSGw39X4';
    var keepAlive = 60;
    var timeout = 3;
    var tls = true;
    var cleanSession = true;
    var lastWillTopic = "";
    var lastWillQos = 0;
    var lastWillRetain = false;
    var lastWillMessage = "";

    if(path.length > 0){
      client = new Paho.MQTT.Client(hostname, Number(port), path, clientId);
    } else {
      client = new Paho.MQTT.Client(hostname, Number(port), clientId);
    }
    console.info('Connecting to Server: Hostname: ', hostname, '. Port: ', port, '. Path: ', client.path, '. Client ID: ', clientId);

    // set callback handlers
    client.onConnectionLost = onConnectionLost;
    client.onMessageArrived = onMessageArrived;


    var options = {
      invocationContext: {host : hostname, port: port, path: client.path, clientId: clientId},
      timeout: timeout,
      keepAliveInterval:keepAlive,
      cleanSession: cleanSession,
      useSSL: tls,
      onSuccess: onConnect,
      onFailure: onFail
    };



    if(user.length > 0){
      options.userName = user;
    }

    if(pass.length > 0){
      options.password = pass;
    }

    // connect the client
    client.connect(options);
    var statusSpan = document.getElementById("connectionStatus");
    statusSpan.innerHTML = 'Connecting...';
    
    enableCheckbox();
    //var msg = "synchronize"
}

function disconnect(){
    console.info('Disconnecting from Server');
    client.disconnect();
    var statusSpan = document.getElementById("connectionStatus");
    statusSpan.innerHTML = 'Disconnected';
    connected = false;
    subcribed = false;
    document.getElementById("clientConnectButton").innerHTML = "Connect";
    document.getElementById("subscribeButton").innerHTML = "Subscribe";
    document.getElementById("subscriptionStatus").innerHTML = "Unsubscribing";
    disableCheckbox();
}

// Sets various form controls to either enabled or disabled
function setFormEnabledState(enabled){

    // Connection Panel Elements
    if(enabled){
      document.getElementById("clientConnectButton").innerHTML = "Disconnect";
    } else {
      document.getElementById("clientConnectButton").innerHTML = "Connect";
    }    

}

function publish(aMessage){

    var topic = "command";
    var qos = 0;
    var message = aMessage;
    var retain = true;
    console.info('Publishing Message: Topic: ', topic, '. QoS: ' + qos + '. Message: ', message);
    message = new Paho.MQTT.Message(message);
    message.destinationName = topic;
    message.qos = qos;
    message.retained = retain;
    client.send(message);
}


function subscribe(){
    if(connected == true){
        var topic = "event";
        var qos = 0;
        console.info('Subscribing to: Topic: ', topic, '. QoS: ', qos);
        client.subscribe(topic, {qos: Number(qos)});
        subcribed = true;
    	publish("synchronize");
        document.getElementById("subscribeButton").innerHTML = "Unsubscribe";
        document.getElementById("subscriptionStatus").innerHTML = "Subscribing";
    }else{
        alert("You must connect to server first!");
    }
}

function unsubscribe(){
    var topic = "event";
    console.info('Unsubscribing from ', topic);
    client.unsubscribe(topic, {
         onSuccess: unsubscribeSuccess,
         onFailure: unsubscribeFailure,
         invocationContext: {topic : topic}
     });
    

}


function unsubscribeSuccess(context){
    console.info('Successfully unsubscribed from ', context.invocationContext.topic);
    subcribed = false;
    document.getElementById("subscribeButton").innerHTML = "Subscribe";
    document.getElementById("subscriptionStatus").innerHTML = "Unsubscribing";
}

function unsubscribeFailure(context){
    console.info('Failed to  unsubscribe from ', context.invocationContext.topic);
}

// // Just in case someone sends html
// function safe_tags_regex(str) {
//    return str.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
// }

// function makeid()
// {
//     var text = "";
//     var possible = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";

//     for( var i=0; i < 5; i++ )
//         text += possible.charAt(Math.floor(Math.random() * possible.length));

//     return text;
// }


function changeStatus(){
    var fanStatus = document.getElementById("fanStatus").checked;
    var lightStatus = document.getElementById("lightStatus").checked;
    var mostorizerStatus = document.getElementById("mostorizerStatus").checked;

    var message = "";

    if(fanStatus == true){
      message = message + "1|";
    }else{
      message = message + "0|";
    }

    if(lightStatus == true){
      message = message + "1|";
    }else{
      message = message + "0|";
    }

    if(mostorizerStatus == true){
      message = message + "1";
    }else{
      message = message + "0";
    }

    publish(message);
}


function enableCheckbox() {
    document.getElementById("fanStatus").disabled = false;
    document.getElementById("lightStatus").disabled = false;
    document.getElementById("mostorizerStatus").disabled = false;
}

function disableCheckbox() {
    document.getElementById("fanStatus").disabled = true;
    document.getElementById("lightStatus").disabled = true;
    document.getElementById("mostorizerStatus").disabled = true;
}


function setInterval() {
  if(connected == true){
    var intervalTime = prompt("Please enter interval time (second):", "10");
    if (intervalTime == null || intervalTime == "") {
        //alert("Interval time is empty");
    } else {
      if(isNaN(intervalTime)){
        alert("Interval time must be a number");
      }else{
        publish("interval=" + intervalTime);
      }
    }
  }else{
    alert("You must connect to server first!");
  }
}


function synchronize(){
    if(connected == true){
        publish("synchronize");
    }else{
        alert("You must connect to server first!");
    }
}