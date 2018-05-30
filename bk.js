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
}


class DatabaseHandling{
  constructor() {
    this.aws = require('aws-sdk');
    this.lambda = new aws.Lambda({ 
      region: 'us-east-1' //change to your region
    });
    this.count = 0;
    // var docClient = new AWS.DynamoDB.DocumentClient({region: 'us-east-1'})
    this.docClient = new aws.DynamoDB.DocumentClient({region: 'us-east-1'});
  }

  find_agent(name) {
    console.log('find_agent');
    let params = {
      AttributesToGet: 'name',
      TableName: 'agents',
      Key: {
        "name": name
      }
    };
    self = this;
    return new Promise((resolve, reject) => {
      this.docClient.get(params, function(error, data){
        if (error) {
          console.log("GetItem error:", error);
          return 'error';
        }else {
          console.log("GetItem succeeded:", JSON.stringify(data, null));
          agent1.name = data.name;
        }
      })
      .then((result) => { resolve(self.wrap(result.data)) })
      .catch((error) => { reject(error) })
    })
    console.log('despues del promise');
  }

  wrap(quotesAPIResult) {
    this.count = this.count + 1;
    console.log(quotesAPIResult);
    return {
        data: quotesAPIResult,
        count: this.count,
    }
  }

//   // find_agent(name){
//   //   var params = {
//   //     FunctionName: "lambda-test-dev-readDynamo", 
//   //     InvocationType: "RequestResponse", 
//   //     LogType: "Tail", 
//   //     Payload: '{ "data" : ' +  name  + '}'
//   //   };
//   //   var response = lambda.invoke(params, function(error, data) {
//   //       if (error) {
//   //         //context.done('error ' + error, error);
//   //         callback(null, error);
//   //       }
//   //       if(data){
//   //         //context.succeed('functionB said '+ data.Payload);
//   //         const response = {
//   //           statusCode: 200,
//   //           body: JSON.stringify({
//   //             message: data.Payload
//   //           }),
//   //         }
//   //         callback(null, response);
//   //       }
//   //     }
//   //   );

//   // }
}

module.exports.start_agent = function(event, context, callback) {
  console.log('agent Received event:', JSON.stringify(event, null, 2));
  const database = new DatabaseHandling();
  const requestBody = JSON.parse(event.body);
  const name = requestBody.data;
  database.find_agent(name);
  // const agent = new Agent('agente1');
  // console.log('viene agente');
  
  // const aws = require('aws-sdk');
  // const lambda = new aws.Lambda({ 
  //     region: 'us-east-1' //change to your region
  // });

  // var params = {
  //     FunctionName: "lambda-test-dev-readDynamo", 
  //     InvocationType: "RequestResponse", 
  //     LogType: "Tail", 
  //     Payload:  JSON.stringify( {"body": '{"data": "' + name + '"}'})
  // };
  // console.log("invoca a readDynamo");
  // lambda.invoke(params, function(error, data) {
  //   if (error) {
  //       //context.done('error ' + error, error);
  //     callback(null, error);
  //   }
  //   if(data){
  //     //context.succeed('functionB said '+ data.Payload);
  //     const response = {
  //       statusCode: 200,
  //       body: JSON.stringify({
  //         message: data.Payload
  //       }),
  //     }
  //     console.log('exito al invocar')
  //     callback(null, response);
  //   }
  // });
  // console.log("vuelve de invocar a readDynamo");
  // console.log(agent.to_json());
  // try {
    // const requestBody = JSON.parse(agent.to_json());
    callback(null, responses.success('fin'));
  // }
  // catch (error) {
    // callback(null, responses.error(error));
  // }
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