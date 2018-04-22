'use strict';

module.exports.hello = (event, context, callback) => {
  const response = {
    statusCode: 200,
    body: JSON.stringify({
      message: 'Hello'
    }),
  };

  callback(null, response);
};

module.exports.functionB = (event, context, callback) => {
  var aws = require('aws-sdk');
  var lambda = new aws.Lambda({
    region: 'us-east-1' //change to your region
  });

  var params = {
    FunctionName: "lambda-test-dev-functionA", 
    InvocationType: "RequestResponse", 
    LogType: "Tail", 
    Payload: '{ "name" : "Esteban" }'
  };
  var response = lambda.invoke(params, function(error, data) {
      if (error) {
        //context.done('error ' + error, error);
        callback(null, error);
      }
      if(data){
        //context.succeed('functionB said '+ data.Payload);
        const response = {
          statusCode: 200,
          body: JSON.stringify({
            message: data.Payload
          }),
        }
        callback(null, response);
      }
    }
  );
  /* const response = {
     statusCode: 200,
     body: JSON.stringify({
       message: 'other'
     }),
   };*/

   //callback(null, response['Payload']);

  // Use this code if you don't use the http event with the LAMBDA-PROXY integration
  // callback(null, { message: 'Go Serverless v1.0! Your function executed successfully!', event });
};

module.exports.functionA = function(event, context) {
  console.log('function A Received event:', JSON.stringify(event, null, 2));
  context.succeed('Hello ' + event.name);
};

const responseHeaders = {
    'Content-Type':'application/json',
    'Access-Control-Allow-Origin' : '*',        // Required for CORS support to work
    'Access-Control-Allow-Credentials' : true   // Required for cookies, authorization headers with HTTPS 
}

const responses = {
    success: (data={}, code=200) => {
        return {
            'statusCode': code,
            'headers': responseHeaders,
            'body': JSON.stringify(data)
        }
    },
    error: (error) => {
        return {
            'statusCode': error.code || 500,
            'headers': responseHeaders,
            'body': JSON.stringify(error)
        }
    }
}
module.exports.functionC = function(event, context, callback) {
  console.log('function C Received event:', JSON.stringify(event, null, 2));
  try {
    //context.succeed('CC ' + event.data);
    //context.succeed('CC ' + event.pathParameters);
    //context.succeed('CC2 ' + event.queryStringParameters);
    const requestBody = JSON.parse(event.body);
    //requestBody.data
    //.then(email => {
    // Create a ‘success’ response object containing the e-mail we 
    // got back from emailServices.getEmail()
      callback(null, responses.success(requestBody));
    //})
    //.catch(error => {
    //  callback(null, responses.error(error))
    //})
    //callback(null, responses.success(requestBody));
  }
  catch (error) {
    callback(null, responses.error(error));
    //console.log( error);
  }
};




module.exports.functionC = function(event, context) {
  console.log('function C Received event:', JSON.stringify(event, null, 2));
  context.succeed('CC ' + event.data);
};


