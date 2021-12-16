Steps to Run Device code
1. Install Arduino IDE.
2. Copy the SmartIrrigation folder to the default code directory of arduino.
3. Open smartIrrigation Sketch in Arduino.
4. Change the credentials in secret.h file.
	1. Add WIFI ID and WIFI password.
	2. Get AWS IoT end point from aws account.
5. Create a new Thing named "Garden".
6. Download the certificate of thing.
7. open the Root CA 1 certificate as text file and copy the content and paste it to AWS_CERT_CA parameter in 
	the secrets.h file.
8. open the device CERT as text file and copy the content and paste it to AWS_CERT_CRT parameter in 
	the secrets.h file.
9. open the device private key as text file and copy the content and paste it to AWS_CERT_PRIVATE parameter in 
	the secrets.h file.
10. Compile the sketch.
11. Connect ESP 8266 device via USB port. 
12. Open Tools --> Boards --> Board Manager --> Search ESP 8266 board -- Download 
	and install it.
13. Open Tools --> Boards --> NodeMCU 1.0 (ESP 12 E Module)
14. Open Tools --> Upload Speed --> 115200.
15. Open Tools --> Manage Libraries --> Search for PubSubClient by Nick O' Garry and install it
16. Upload the Sketch. 