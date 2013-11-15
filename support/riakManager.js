/**
 * Fetch riak client.
 *
 * @Author tim.tang
 */

var riak= require('riak-js'),
    fs = require('fs'),
    path = require('path'),

var RiakManager = function(){
    this.riakClient = makeRiakClient();
};

function makeRiakClient(){
    var riakConf = JSON.parse(fs.readFileSync(path.resolve(__dirname, '../conf/riak-conf.json'), 'UTF-8'));
    riakClient = riak.getClient(riakConf);
    return riakClient;
}

var riakManager = new RiakManager(),
    riakClient = riakManager.riakClient;

/* Pulbic Riak Manager APIs */
module.exports = riakManager;
