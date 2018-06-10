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
  constructor(name, providers) {
    this._name = name.charAt(0).toUpperCase() + name.slice(1);
    this.providers = providers;
    this.aws = require('aws-sdk');
    this.lambda = new this.aws.Lambda({ 
      region: 'us-east-1' //change to your region
    });
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
    console.log(this._name);
    if (this._name == 'Agente1') {
      console.log("arranque a analizooo");
      var params = {
        FunctionName: "lambda-test-dev-start_agent", 
        InvocationType: "RequestResponse", 
        LogType: "Tail", 
        Payload:  JSON.stringify( {"body": '{"data": "' + 'agente2' + '"}'})
      };
      console.log("invoca a agente2");
      this.lambda.invoke(params, function(error, data) {
        if (error) {
          console.log(error);
            //context.done('error ' + error, error);
          // callback(null, error);
        }
        if(data){
          //context.succeed('functionB said '+ data.Payload);
          const response = {
            statusCode: 200,
            body: JSON.stringify({
              message: data.Payload
            }),
          }
          console.log('exito al invocar')
          // callback(null, response);
        }
      });
    }
  }

  eso(){
    console.log("anda o no anda");
  }
}

// class Message{
//   constructor(from, to, data){
//     this.from = from;
//     this.to = to;
//     this.body = data;
//   }
// }

// class CallForProposal extends Message {
//   constructor(from, to, count){
//     super(from, to, {"count": count} )
//   }
// }

// class Propose extends Message {
//   constructor(from, to, count, price, periods){
//     super(from, to, {"count": count, "price": price, "periods": periods })
//   }
// }



class DatabaseHandling{
  constructor(callback) {
    this.aws = require('aws-sdk');
    this.lambda = new this.aws.Lambda({ 
      region: 'us-east-1' //change to your region
    });
    this.docClient = new this.aws.DynamoDB.DocumentClient({region: 'us-east-1'});
    this.callback = callback;
  }

  find_agent(name) {
    console.log('find_agent');
    let params = {
      TableName: 'agents',
      Key: {
        "name": name
      }
    };
    // var self = this;
    let promise = new Promise((resolve, reject) => {
      this.docClient.get(params, function(error, data){
        if (error) {
          // self.error(error);
          reject(error);
        }else {
          // self.success(data);
          resolve(data);
        }
      });
    });
    return promise;
  };
  
  // success(data) {
  //   console.log(data);
  //   if (data.Item != undefined){
  //     var agent = new Agent(data.Item.name);
  //     agent.run();
  //     console.log('Agente encontrado');
  //     //this.callback(null, responses.success('Agente encontrado'));
  //   }else{
  //     console.log('Agente no encontrado');
  //     //this.callback(null, responses.error('Agente no encontrado'));
  //   }

  // }

  // error(error){
  //   console.log(error);
  //   console.log('programa finalizado');
  //   this.callback(null, responses.error('programa finalizado'));
  // }
}

module.exports.start_agent = function(event, context, callback) {
  console.log('agent Received event:', JSON.stringify(event, null, 2));
  const database = new DatabaseHandling(callback);
  const requestBody = JSON.parse(event.body);
  const name = requestBody.data;
  database.find_agent(name).then(data => new Agent(data.Item.name, data.Item.providers).eso());
  console.log('finaliza el start');
};