var Db          = require('mongodb').Db;
var Connection  = require('mongodb').Connection;
var Server      = require('mongodb').Server;
var BSON        = require('mongodb').BSON;
var ObjectID    = require('mongodb').ObjectID;

var Provider    = Provider || {};

Provider.config = {
    init: function(database, host, port) {
        this.db = new Db(database, new Server(host, port, {safe: false}, {auto_reconnect: true}, {}));
        this.db.open(function(){});
    },
    getCollection: function(collection, callback) {
        this.db.collection(collection, function(error, selected_collection) {
            if( error ) {
                callback(error);
            } else {
                callback(null, selected_collection);
            }
        });
    }
};

Provider.query = {
    get: function(collection, search_object, settings, callback) {
        Provider.config.getCollection(collection, function(error, selected_collection) {
            if( error ) callback(error)
            else {
                var sort    = {};
                var limit   = 100;

                if(settings.length != 'undefined') {
                    if(settings.sort) {
                        sort = settings.sort;
                    }
                    if(settings.limit) {
                        limit = settings.limit;
                    }
                }

                selected_collection.find(search_object).sort(sort).limit(limit).toArray(function(error, results) {
                    if( error ) {
                        callback(error);
                    } else {
                        callback(null, results);
                    }
                });
            }
        });
    },
    getById: function(collection, search_object, callback) {
        Provider.config.getCollection(collection, function(error, selected_collection) {
            if( error ) callback(error)
            else {
                selected_collection.find({_id: ObjectID(search_object.id.toString())}).toArray(function(error, results) {
                    if( error ) {
                        callback(error);
                    } else {
                        callback(null, results);
                    }
                });
            }
        });
    },
     : function(collection, data, callback) {
        Provider.config.getCollection(collection, function(error, selected_collection) {

            if( error )  {
                callback(error);
            } else {
                if(typeof(data.length) == 'undefined') {
                    data = [data];
                }

                for( var i = 0; i < data.length; i++ ) {
                    data             = data[i];
                    data.created_at  = new Date();
                }

                selected_collection.insert(data, function() {
                    callback(null, data);
                });
            }

        });
    }
};

exports.Provider = Provider;

