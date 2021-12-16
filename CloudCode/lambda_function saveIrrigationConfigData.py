import json
import boto3

s3 = boto3.client('s3')
def lambda_handler(event, context):
    # TODO implement
    # print(str(event['threshhold']))
    bucket = 'irrigation-data-bucket'
    file_name = 'config_data.json'
    
    uploadByteStream = bytes(json.dumps(event).encode('UTF-8'))
    
    s3.put_object(Bucket=bucket, Key=file_name, Body=uploadByteStream)
    print("config data updated")
