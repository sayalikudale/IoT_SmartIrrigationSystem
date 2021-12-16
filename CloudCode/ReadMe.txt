Steps to Run Cloud code
1. Create new Lambda function 'processIrrigationData' with basic configurations.
2. Copy the code from lambda_function_ processIrrigationData.py to the newly created lambda function.
3. Deploy the lambda function.
4. Add following policies using inline policy json option to the lambda role of lambda function processIrrigationData:
	1. S3 put policy.
		{
    	"Version": "2012-10-17",
   		 "Statement": [
      	  {
            "Sid": "VisualEditor0",
            "Effect": "Allow",
            "Action": "s3:PutObject",
            "Resource": "*"
       	    }
            ]
           }
    2. s3 get policy.
		{
    	"Version": "2012-10-17",
   		 "Statement": [
      	  {
            "Sid": "VisualEditor0",
            "Effect": "Allow",
            "Action": "s3:GetObject",
            "Resource": "*"
       	    }
            ]
           }
    3. iot publish policy.
		{
    	"Version": "2012-10-17",
   		 "Statement": [
      	  {
            "Sid": "VisualEditor0",
            "Effect": "Allow",
            "Action": "iot:Publish",
            "Resource": "*"
       	    }
            ]
           }
    4. send email policy.
		{
    	"Version": "2012-10-17",
   		 "Statement": [
      	  {
            "Sid": "VisualEditor0",
            "Effect": "Allow",
            "Action":"ses:SendEmail",
            "Resource": "*"
       	    }
            ]
           }
           
5. Create new Lambda function 'saveIrrigationConfigData' with basic configurations.
6. Copy the code from lambda_function_ saveIrrigationConfigData.py to the newly created lambda function.
7. Deploy the lambda function.
8. Add following policies using inline policy json option to the lambda role of lambda function processIrrigationData:
	1. S3 put policy.
		{
    	"Version": "2012-10-17",
   		 "Statement": [
      	  {
            "Sid": "VisualEditor0",
            "Effect": "Allow",
            "Action": "s3:PutObject",
            "Resource": "*"
       	    }
            ]
           }

9. Create new a new rule to trigger processIrrigationData lambda function on topic soilMoisture. 
10. Use the below rule query:
	SELECT * from soilMoisture
11. In the action use option Send a message to Lambda function and use lambda function as processIrrigationData.
12. Create new a new rule to trigger saveIrrigationConfigData lambda function on topic updateConfig. 
13. Use the below rule query:
	SELECT * from updateConfig
14. In the action use option Send a message to Lambda function and use lambda function as saveIrrigationConfigData.

