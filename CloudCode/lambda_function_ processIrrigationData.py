import json
import boto3
import time
import urllib3

s3 = boto3.client('s3')
client = boto3.client('iot-data', region_name='us-west-2')
ses_client = boto3.client("ses", region_name="us-west-2")
CHARSET = "UTF-8"

def lambda_handler(event, context):
    # send irrigation time in message
    
    configFile = s3.get_object(Bucket='irrigation-data-bucket',Key='config_data.json')
    config_Data = configFile['Body'].read().decode('utf-8')
    config_dict = json.loads(config_Data)

    # get this data from db 
    testWeatherPrediction = config_dict["weatherSensing"]
    isRainPrediction = False

    if testWeatherPrediction :
	#Bellevue location coordinates
        latitude = str(47.610149)
        longitude = str(-122.201515)
        url = "https://api.openweathermap.org/data/2.5/onecall?lat={}&lon={}&exclude=minutely,daily,alerts&appid=85e122ea9da6fcb38f6e98d8e45dbdb9".format(latitude, longitude)
        http = urllib3.PoolManager()
        api_response = http.request('GET',url)
        weather_report = json.loads(api_response.data.decode('utf-8'))
        
        current = weather_report["current"]
        forecasted=weather_report["hourly"]
        # check rain prediction in next 12 hour
        for weather in forecasted[:12]:
            data = weather["weather"]   
            if data[0]["main"] == "Rain" :
                isRainPrediction = True
        
        if (isRainPrediction) :
           current["rainForecast"] = True
        else :
            current["rainForecast"] = False
        
        # Publish current weather to UI
        response = client.publish(
            topic = 'weatherInfo',
            qos = 0,
            payload=json.dumps(current))
            
            
    response = ""
    # isRainPrediction = False
     # Publish the on motor message
    if (int(event['moisture']) > int(config_dict["threshhold"]) and isRainPrediction == False) :
        # print("led on")
        # message_text = int(irrigationTime) * 60 * 1000
        message_text ="soil moisture crossed threshhold value"
        # print(message_text)
        response = client.publish(
            topic = 'ledOn',
            qos = 0,
            payload=json.dumps(message_text))
        
    elif (isRainPrediction == True  and (int(event['moisture']) > int(config_dict["threshhold"]))) :
        # publish message on web/client/ to convey the no watering due to rain prediction
        HTML_EMAIL_CONTENT = """
        <html>
        <body>
            <p>Dear User, </p>
            <p>Irrigation cycle for the plant is skipped, because of the possibility of rain in next 12 hours. </p>
            <p>You can manually start irrigation from website or Change the config values to disable the weather sensing while irrigation. </p>
            <p> Happy planting!! </p>
            </body>
        </html>
        """
        response = ""
        response = ses_client.send_email(
        Destination={
            "ToAddresses": [
                "sayalik@uw.edu",
            ],
        },
        Message={
            "Body": {
                "Html": {
                    "Charset": CHARSET,
                    "Data": HTML_EMAIL_CONTENT,
                }
            },
            "Subject": {
                "Charset": CHARSET,
                "Data": "Irrigation Cycle skipped",
            },
        },
        Source="sayalik@uw.edu",)
            
    return response
        

