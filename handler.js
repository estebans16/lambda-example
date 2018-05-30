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
  constructor(name) {
    this._name = name.charAt(0).toUpperCase() + name.slice(1);
    this.providers = ['proveedor1', 'proveedor2'];
  }

  set name(name) {
    this._name = name.charAt(0).toUpperCase() + name.slice(1);
  }

  set providers(providers) {
    this._providers = providers;
  }

  get name() {
    return this._name;
  }

  get providers(){
    return this._providers 
  }

  to_json(){
    var a = {
              "name": this.name,
              "providers": this.providers
            };
    return a;
  }

  run(){
    //analizar pedido
    console.log("arranque a analizar");
  }
}

class DatabaseHandling{
  constructor() {
    this.aws = require('aws-sdk');
    this.lambda = new this.aws.Lambda({ 
      region: 'us-east-1' //change to your region
    });
    this.count = 0;
    this.docClient = new this.aws.DynamoDB.DocumentClient({region: 'us-east-1'});
  }

  find_agent(name) {
    console.log('find_agent');
    let params = {
      TableName: 'agents',
      Key: {
        "name": name
      }
    };
    var self = this;
    this.docClient.get(params, function(error, data){
      if (error) {
        // console.log("GetItem error:", error);
        self.error(error);
      }else {
        // console.log("GetItem succeeded:", JSON.stringify(data, null));
        self.success(data);
      }
    });
    console.log('despues del promise');
  };
  

  success(data) {
    this.count = this.count + 1;
    console.log(data);
    var agent = new Agent(data.Item.name);
    return agent.run();
  }

  error(error){
    console.log(error);
    console.log('programa finalizado');
  }
}

module.exports.start_agent = function(event, context, callback) {
  console.log('agent Received event:', JSON.stringify(event, null, 2));
  const database = new DatabaseHandling();
  const requestBody = JSON.parse(event.body);
  const name = requestBody.data;
  database.find_agent(name);
  console.log('finaliza el start');
  callback(null, responses.success('fin'));
};


module.exports.readDynamo = function(event, context, callback) {
  console.log('function readDynamo started');
  console.log(event);
  var AWS = require('aws-sdk');
  var docClient = new AWS.DynamoDB.DocumentClient({region: 'us-east-1'})
  const requestBody = JSON.parse(event.body);
  const name = requestBody.data;
  console.log(name);
  let params = {
      TableName: 'agents',
      Key: {
        "name": name
      }
  };
  docClient.get(params, function(error, data){
    if (error) {
      callback(error, null);
    }else {
      console.log(data);
      callback(null, new Agent(data.Item.name));
    }
  });
}