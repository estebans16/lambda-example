'use strict';

module.exports.hello = (event, context, callback) => {
  const response = {
    statusCode: 200,
    body: JSON.stringify({
      message: 'Hello'
    }),
  };

  callback(null, response);

  // Use this code if you don't use the http event with the LAMBDA-PROXY integration
  // callback(null, { message: 'Go Serverless v1.0! Your function executed successfully!', event });
};

module.exports.functionB = (event, context, callback) => {
  var aws = require('aws-sdk');
  var lambda = new aws.Lambda({
    region: 'us-east-1' //change to your region
  });

  var params = {
    FunctionName: "functionA", 
    InvocationType: "RequestResponse", 
    LogType: "Tail", 
    Payload: '{ "name" : "Esteban" }'
  };
  // Payload: JSON.stringify(event, null, 2)

  lambda.invoke(params, function(error, data) {
      if (error) {
        context.done('error ' + error, error);
      }
      if(data){
        context.succeed('functionB said '+ data.Payload);
      }
    }
  );
  // const response = {
  //   statusCode: 200,
  //   body: JSON.stringify({
  //     message: 'other'
  //   }),
  // };

  // callback(null, response);

  // Use this code if you don't use the http event with the LAMBDA-PROXY integration
  // callback(null, { message: 'Go Serverless v1.0! Your function executed successfully!', event });
};

module.exports.functionA = function(event, context) {
  console.log('function A Received event:', JSON.stringify(event, null, 2));
  context.succeed('Hello ' + event.name);
};

