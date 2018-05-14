'use strict';

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

class Agent{
  constructor(aname) {
    this.name = aname;
    this.providers = ['proveedor1', 'proveedor2'];
  }

  to_json(){
    var a = {
              "name": this.name,
              "providers": this.providers
            };
    return a;
  }
}

class DatabaseHandling{
  constructor() {
    this.aws = require('aws-sdk');
    this.docClient = new this.aws.DynamoDB.DocumentClient({region: 'us-east-1'});
  }
   
  find_agent(name) {
    console.log('lerooo');
    let params = {
      AttributesToGet: 'name',
      TableName: 'agents',
      Key: {
        "name": name
      }
    };
    agent = this.docClient.get(params, function(error, data){
      if (error) {
        console.log("GetItem error:", error);
        // callback(error, null);
        return 'error';
      }else {
        console.log("GetItem succeeded:", JSON.stringify(data, null));
        return data;
        // callback(null, data);
      }
    })
    console.log(agent);
    return agent;
  }
}

module.exports.start_agent = function(event, context, callback) {
  console.log('agent Received event:', JSON.stringify(event, null, 2));
  const database = new DatabaseHandling();
  const requestBody = JSON.parse(event.body);
  const agent = database.find_agent(requestBody.data);
  // const agent = new Agent('agente1');
  console.log('viene agente');
  console.log(agent);
  try {
    // const requestBody = JSON.parse(agent.to_json());
    callback(null, responses.success(agent));
  }
  catch (error) {
    callback(null, responses.error(error));
  }
};
