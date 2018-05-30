'use strict'

var axios = require('axios');

class AsyncExample {

    constructor() {
        this.factSources = [new RonSwanson(), new RonSwanson(), new ChuckNorris()];
        this.factSources.push(this.factSources[2]); //Just to have the same one twice
    }

    run() {
        for (let source of this.factSources) {
            this.requestInfoTo(source);
        }
    }

    requestInfoTo(factSource) {
        var self = this; // uggly trick to stay OO in closures
        console.log('About to make async data request from ' + factSource.url);
        factSource.getFanFact()
            .then((result) => { self.receiveFanFact(result) })
            .catch((error) => { console.log("Error " + error) });
        console.log('Finished making async data request from ' + factSource.url);
    }

    receiveFanFact(fact) {
        console.log('This should be fun ...');
        console.log(fact);
    }
}

class QuotesSource {

    constructor() {
        this.url = '';
        this.count = 0;
    }

    //Returns a Promise 
    getFanFact() {
        var self = this;
        return new Promise((resolve, reject) => {
            axios.get(this.url)
                .then((result) => { resolve(self.wrap(result.data)) })
                .catch((error) => { reject(error) })
        })
    }

    wrap(quotesAPIResult) {
        this.count = this.count + 1;
        return {
            data: this.extractQuoteFrom(quotesAPIResult),
            count: this.count,
            source: this.url
        }
    }

    //Abstract method
    extractQuoteFrom(chuckNorrisResult) { }

}

class RonSwanson extends QuotesSource {

    constructor() {
        super();
        this.url = 'https://ron-swanson-quotes.herokuapp.com/v2/quotes';
    }

    extractQuoteFrom(ronSwansonResult) {
        return ronSwansonResult[0];
    }

}

class ChuckNorris extends QuotesSource {

    constructor() {
        super();
        this.url = 'https://api.chucknorris.io/jokes/random';
    }

    extractQuoteFrom(chuckNorrisResult) {
        return chuckNorrisResult.value;
    }

}

new AsyncExample().run();