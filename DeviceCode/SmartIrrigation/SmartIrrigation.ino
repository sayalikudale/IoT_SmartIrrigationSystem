#include "secrets.h"
#include <ESP8266WiFi.h>
#include <PubSubClient.h>


BearSSL::X509List client_crt(AWS_CERT_CRT);
BearSSL::PrivateKey client_key(AWS_CERT_PRIVATE);
BearSSL::X509List rootCert(AWS_CERT_CA);


#define SensorPin A0 
#define motorPin 5  // pinout for motor signal


float sensorValue = 0;
float threshholdLimit = 430;
bool motorOn = false ;
unsigned long interval;
unsigned long motorOnTime;
unsigned long lastPublish;
int msgCount;

WiFiClientSecure wiFiClient;
void msgReceived(char* topic, byte* payload, unsigned int len);
PubSubClient pubSubClient(AWS_IOT_ENDPOINT, 8883, msgReceived, wiFiClient); 

void setup() {
  
  Serial.begin(115200);
  Serial.println();
  pinMode(LED_BUILTIN, OUTPUT);   // initialize digital pin LED_BUILTIN as an output.
  pinMode(motorPin, OUTPUT);   // initialize digital pin motorPin as an output.

  Serial.print("Connecting to ");
  Serial.print(WIFI_SSID);
  WiFi.begin(WIFI_SSID, WIFI_PASSWORD);
  WiFi.waitForConnectResult();
  Serial.print(", WiFi connected, IP address: "); 
  Serial.println(WiFi.localIP());

  // get current time, otherwise certificates are flagged as expired
  setCurrentTime();

  wiFiClient.setClientRSACert(&client_crt, &client_key);
  wiFiClient.setTrustAnchors(&rootCert);

  interval = 15000; // 15 secs initial interval to read sensor; (For testing purpose it is short; later can be increased to hour)
}


void loop() {
String msg;

  pubSubClientConnect();

  if (millis() - lastPublish > interval) {
    
    //read sensor analog signals
    float sensorValue = analogRead(SensorPin);
    msg+= F("{\"moisture\": ");
    msg += String(sensorValue, 2);
    msg += F("}");
    
    if(!motorOn){
      // motor is not on; publish the soil moisture
    pubSubClient.publish("soilMoisture", msg.c_str());
    Serial.println("Published: ");
    } else if(sensorValue <= threshholdLimit){
      // motor is on and soil moisture reached to threshhold; 
      //turn off the motor and publish the command
      
      Serial.println("pump off");
      digitalWrite(LED_BUILTIN, LOW);
      digitalWrite(motorPin, LOW);
      motorOn = false;
      interval = 15000;  
      String motorOffMsg;
      motorOffMsg+= F("{\"message\": ");
      motorOffMsg += "Automatically turning off motor";
      motorOffMsg += F("}");
      pubSubClient.publish("ledOff",motorOffMsg.c_str());
    }
    Serial.println(msg);
    lastPublish = millis();
  }
}

/*
 * Triggered when subsciribed messages are published.
 * Subscribed messages are ledOn, ledOff
 * When ledOn topic received turn the led and motor pin on
 * When ledOff topic received turn the led and motor pin off
 */
void msgReceived(char* topic, byte* payload, unsigned int length) {
  Serial.print("Message received on ");
  Serial.print(topic); 
  Serial.print(": ");
  String msg = "";

  for (int i = 0; i < length; i++) {
     msg += ((char)payload[i]);
  }
  Serial.println(msg);
   if (strcmp(topic, "ledOn") == 0)
  {
    Serial.println("turn pump on");
    digitalWrite(LED_BUILTIN, HIGH);
    digitalWrite(motorPin, HIGH);
    motorOn = true;
    // change the interval to 5 sec to continuosly monitor the change in moisture value
    interval = 5000;
  }

  if (strcmp(topic, "ledOff") == 0)
  {
    Serial.println("turn pump off");
    digitalWrite(LED_BUILTIN, LOW);
    digitalWrite(motorPin, LOW);
    motorOn = false;
    interval = 15000;
  }
  Serial.println(msg);
}

void pubSubClientConnect() {
  if ( ! pubSubClient.connected()) {
    Serial.print("PubSubClient connecting to: ");
    Serial.print(AWS_IOT_ENDPOINT);
    while (!pubSubClient.connected()) {
      Serial.print(".");
      pubSubClient.connect("Sayali_Garden");
    }
    Serial.println(" connected");
    pubSubClient.subscribe("ledOn");
    pubSubClient.subscribe("ledOff");

  }
  pubSubClient.loop();
}

void setCurrentTime() {
  configTime(3 * 3600, 0, "pool.ntp.org", "time.nist.gov");
  Serial.print("Waiting for NTP time sync: ");
  time_t now = time(nullptr);
  while (now < 8 * 3600 * 2) {
    delay(500);
    Serial.print(".");
    now = time(nullptr);
  }
  Serial.println("");
  struct tm timeinfo;
  gmtime_r(&now, &timeinfo);
  Serial.print("Current time: "); 
  Serial.print(asctime(&timeinfo));
}
