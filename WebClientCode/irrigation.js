window.onload = function() {
    startConnect();
  };

function getEndpoint() { 
        const REGION = "us-west-2";   
    
        const IOT_ENDPOINT = "XXXXXXXXamazonaws.com";  
    
        //  AWS access key ID 
        const KEY_ID = "AKXXXXXXXXXXXXO"; 
    
        //  AWS secret access key 
        const SECRET_KEY = "sXXXXXXXXDxn"; 
    
        // date & time 
        const dt = (new Date()).toISOString().replace(/[^0-9]/g, ""); 
        const ymd = dt.slice(0,8); 
        const fdt = `${ymd}T${dt.slice(8,14)}Z` 
        
      const scope = `${ymd}/${REGION}/iotdevicegateway/aws4_request`; 
        const ks = encodeURIComponent(`${KEY_ID}/${scope}`); 
        let qs = `X-Amz-Algorithm=AWS4-HMAC-SHA256&X-Amz-Credential=${ks}&X-Amz-Date=${fdt}&X-Amz-SignedHeaders=host`; 
        const req = `GET\n/mqtt\n${qs}\nhost:${IOT_ENDPOINT}\n\nhost\n${p4.sha256('')}`; 
        qs += '&X-Amz-Signature=' + p4.sign( 
            p4.getSignatureKey( SECRET_KEY, ymd, REGION, 'iotdevicegateway'), 
            `AWS4-HMAC-SHA256\n${fdt}\n${scope}\n${p4.sha256(req)}`
        ); 
        return `wss://${IOT_ENDPOINT}/mqtt?${qs}`; 
    }  
    
    function p4(){} 
    p4.sign = function(key, msg) { 
        const hash = CryptoJS.HmacSHA256(msg, key); 
        return hash.toString(CryptoJS.enc.Hex); 
    }; 
    p4.sha256 = function(msg) { 
        const hash = CryptoJS.SHA256(msg); 
        return hash.toString(CryptoJS.enc.Hex); 
    }; 
    p4.getSignatureKey = function(key, dateStamp, regionName, serviceName) { 
        const kDate = CryptoJS.HmacSHA256(dateStamp, 'AWS4' + key); 
        const kRegion = CryptoJS.HmacSHA256(regionName, kDate); 
        const kService = CryptoJS.HmacSHA256(serviceName, kRegion); 
        const kSigning = CryptoJS.HmacSHA256('aws4_request', kService); 
        return kSigning; 
    };
    
    function getClient(success) { 
        if (!success) success = ()=> console.log("connected"); 
        const _client = initClient(); 
        const connectOptions = { 
          useSSL: true, 
          timeout: 3, 
          mqttVersion: 4, 
          onSuccess: success 
        }; 
        _client.connect(connectOptions); 
        return _client;  
    } 

function startConnect() {
    // Generate a random client ID
    clientID = "clientID-" + parseInt(Math.random() * 100);

    host = getEndpoint();
    console.log(host);
    port = 9001;
    // Fetch the hostname/IP address and port number from the form
    // Initialize new Paho client connection
    client = new Paho.MQTT.Client(host,  clientID);
    // Set callback handlers
    client.onConnectionLost = onConnectionLost;
    client.onMessageArrived = onMessageArrived;

    // Connect the client, if successful, call onConnect function
    client.connect({ 
        onSuccess: onConnect,
    });
}

// Called when the client connects
function onConnect() {
    console.log("connected");
    // Fetch the MQTT topic from the form
    topic = "soilMoisture";
    // Subscribe to the requested topic
    client.subscribe(topic);
    console.log("Subscribing to soilMoisture topic");

    // Subscribe to the requested topic
    client.subscribe("weatherInfo");
    console.log("Subscribing to weatherInfo topic");

     // Subscribe to the requested topic
     client.subscribe("ledOn");
     console.log("Subscribing to ledOn topic");

     client.subscribe("ledOff");
     console.log("Subscribing to ledOff topic");
}

// Called when the client loses its connection
function onConnectionLost(responseObject) {
    console.log("onConnectionLost: Connection Lost");
    if (responseObject.errorCode !== 0) {
        console.log("onConnectionLost: " + responseObject.errorMessage);
    }
}

// Called when a message arrives
function onMessageArrived(message) {
    if(message.destinationName == 'soilMoisture'){
        jsonObj = JSON.parse(message.payloadString);
        document.getElementById("moistureLevel").innerHTML = '<span>' + jsonObj.moisture + '</span><br/>';
    }

     if(message.destinationName == 'weatherInfo'){
        weatherJson = JSON.parse(message.payloadString);
        document.getElementById("weatherInfo").innerHTML = '<span> Temprature : ' + (parseFloat(weatherJson.temp) - 273.15).toFixed(2) + '</span><br/><span> Feels like : ' + (parseFloat(weatherJson.feels_like) - 273.15).toFixed(2) + '</span><br/><span> Humidity : ' + weatherJson.humidity + '</span><br/><span> Rain : ' + weatherJson.weather[0].description + '</span><br/>';
        
        rainForecast = "";
        if(weatherJson.rainForecast){
            rainForecast = "Yes"

        }else{
            rainForecast = "No"
        }
        
        document.getElementById("rainForecast").innerHTML = '<span> '+ rainForecast +'<br/>';   
    }

     if(message.destinationName == 'ledOn'){
       var d = new Date();
        document.getElementById("irrigationTime").innerHTML = '<span> ' + d + '</span>';
        document.getElementById("motorSwitch").checked = true;
        document.getElementById("motorOnMsg").innerHTML = '<span style="background-color:#90ee90;"> ' + "Motor is on" + '</span>';
        
    }

    if(message.destinationName == 'ledOff'){
             document.getElementById("motorSwitch").checked = false;
             document.getElementById("motorOnMsg").innerHTML = '<span> ' + "" + '</span>';

    }

}

//motor toggle 
function toggleMotor(){
    if (document.getElementById('motorSwitch').checked) {
         const publishData = { 
            "message":"motor turn on"}; 
        let payloadText = JSON.stringify(publishData); 
        let message1 = new Paho.MQTT.Message(payloadText); 
        message1.destinationName ="ledOn"; 
        message1.qos = 0; 
        client.send(message1); 
    } else {
         const publishData = { 
            "message":"motor turn off"}; 
        let payloadText = JSON.stringify(publishData); 
        let message1 = new Paho.MQTT.Message(payloadText); 
        message1.destinationName ="ledOff"; 
        message1.qos = 0; 
        client.send(message1); 
    
    }
}

//motor toggle 
function submitConfig(){
    threshhold = document.getElementById("threshhold").value;
    weatherSensing = true;
    if (document.getElementById('weatherSensing').checked) {
        weatherSensing = true;
    } else {
        weatherSensing = false;
    }
    var payload = new Object();
    payload.threshhold = threshhold;
    payload.weatherSensing = weatherSensing;
    var jsonString= JSON.stringify(payload);

    let config = new Paho.MQTT.Message(jsonString); 
    config.destinationName ="updateConfig"; 
    config.qos = 0; 
    client.send(config); 
}

// Called on window closed
function startDisconnect() {
    client.disconnect();
    document.getElementById("messages").innerHTML += '<span>Disconnected</span><br/>';
}

window.onbeforeunload = closingCode;
function closingCode(){
    startDisconnect();
}