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
    const requestBody = JSON.parse(event.body);
    callback(null, responses.success(requestBody));
  }
  catch (error) {
    callback(null, responses.error(error));
  }
};


module.exports.writeDynamo = function(event, context, callback) {
  console.log('function writeDynamo started');
  var AWS = require('aws-sdk');
  var docClient = new AWS.DynamoDB.DocumentClient({region: 'us-east-1'})
  var params = {
    Item: {
      date: Date.now(),
      message: event.message
    },
    TableName: 'guestbook'
  };

  docClient.put(params, function(error, data){
    if (error) {
      callback(error, null);
    }else {
      callback(null, data);
    }
  });

}

module.exports.readDynamo = function(event, context, callback) {
  console.log('function readDynamo started');
  var AWS = require('aws-sdk');
  var docClient = new AWS.DynamoDB.DocumentClient({region: 'us-east-1'})
  let scanningParameters = {
    TableName: 'guestbook',
    Limit: 100
  };

  docClient.scan(scanningParameters, function(error, data){
    if (error) {
      callback(error, null);
    }else {
      callback(null, data);
    }
  });


  /*let params = {
    TableName: 'guestbook',
    Limit: 100
  };

  docClient.get(params, function(error, data){
    if (error) {
      callback(error, null);
    }else {
      callback(null, data);
    }
  });*/

}