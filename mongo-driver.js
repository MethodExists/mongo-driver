/*
mongo-driver
*/

"use strict";

var mongoclient   = require("mongodb").MongoClient,
    check         = require("check-types"),
    when          = require("when"),
    node          = require("when/node"),
    driver        = exports,
    readPreference = require("mongodb").ReadPreference;


/*

*/
driver.connect = function(connection) {


  var connect = node.lift(mongoclient.connect),
      db = {};

  /*
  find
  */
  db.find = function(collection, query, options){

    check.assert.unemptyString(collection,
      "Invalid collection param, must be non empty string");
    check.assert.object(query,
      "Invalid query param, must be object");
    if (options) {
      check.assert.object(options, "Invalid options param, must be object");
    }

    options = options || {};

    var fields = options.fields || {};
    if (options.fields) {
      delete options.fields;
    }

    var defer = when.defer();

    this._mongodb.collection(collection).find(query, fields, options).toArray(function (err, res) {
      if (err) {
        defer.reject(err);
      }
      else {
        defer.resolve(res);
      }
    });

    return defer.promise;
  };

  /*
  findOne
  */
  db.findOne = function(collection, query, options){

    check.assert.string(collection,
      "Invalid collection param, must be non empty string");
    check.assert.unemptyString(collection,
      "Invalid collection param, must be non empty string");
    check.assert.object(query,
      "Invalid query param, must be object");
    if(options) {
      check.assert.object(options,
        "Invalid options param, must be object");
    }

    options = options || {};

    var fields = options.fields || {};
    if (options.fields) {
      delete options.fields;
    }

    var defer = when.defer();

    this._mongodb.collection(collection).
      findOne(query, fields, options, function (err, res) {
        if (err) {
          defer.reject(err);
        }
        else {
          defer.resolve(res);
        }
    });

    return defer.promise;

  };

  /*
  count
  */
  db.count = function(collection, query, options){

    check.assert.unemptyString(collection,
      "Invalid collection param, must be non empty string in mongo-driver count");
    check.assert.object(query,
      "Invalid query param, must be object in mongo-driver count");
    if (options) {
      check.assert.object(options, "Invalid options param, must be object in mongo-driver count");
    }

    options = options || {};

    var fields = options.fields || {};
    if (options.fields) {
      delete options.fields;
    }


    var defer = when.defer();

    this._mongodb.collection(collection).find(query, fields, options).count(function (err, res) {
      if (err) {
        defer.reject(err);
      }
      else {
        defer.resolve(res);
      }
    });

    return defer.promise;
  };


  /*
  distinct
  */
  db.distinct = function(collection, field, query){

    check.assert.unemptyString(collection,
      "Invalid collection param, must be non empty string in mongo-driver distinct");
    check.assert.object(query,
      "Invalid query param, must be object in mongo-driver distinct");

    var defer = when.defer();

    this._mongodb.collection(collection).distinct(field, query, function (err, res) {
      if (err) {
        defer.reject(err);
      }
      else {
        defer.resolve(res);
      }
    });

    return defer.promise;
  };

  /*
    aggregate
  */
  db.aggregate = function( collection, array ){

    check.assert.unemptyString(collection,
      "Invalid collection param, must be non empty string in mongo-driver count");

    var defer = when.defer();

    this._mongodb.collection(collection).aggregate(array, {"readPreference": readPreference.PRIMARY}, function(err, res){
      if (err) {
        defer.reject(err);
      }
      else {
        defer.resolve(res);
      }
    });

    return defer.promise;
  };

  /*

  */
  db.insert = function(collection, docs){

    check.assert.unemptyString(collection,
      "Invalid collection param, must be non empty string");
    if (!check.object(docs) && !check.array(docs)){
      throw new Error("Invalid docs param, must be an array or an object");
    }

    var defer = when.defer();

    this._mongodb.collection(collection).insert(docs, {w:1}, function(err, data){
      if (err) {
        defer.reject(err);
      }
      else {
        defer.resolve(data.ops);
      }
    });

    return defer.promise;
  };

  /*

  */
  db.update = function(collection, query, body, options){

    check.assert.unemptyString(collection,
      "Invalid collection param, must be non empty string");
    check.assert.object(query,
      "Invalid query param, must be object");
    check.assert.object(body,
      "Invalid body param, must be object");
    if (options) {
      check.assert.object(options, "Invalid options param, must be object");
    }

    var defer = when.defer();

    this._mongodb.collection(collection).update(query, body, options, function(err, data){
      if (err) {
        defer.reject(err);
      }
      else {
        defer.resolve(data.result.nModified);
      }
    });

    return defer.promise;
  };

  /*

  */
  db.multiUpdate = function(collection, query, body){

    check.assert.unemptyString(collection,
      "Invalid collection param, must be non empty string");
    check.assert.object(query,
      "Invalid query param, must be object");
    check.assert.object(body,
      "Invalid body param, must be object");

    var defer = when.defer(),
        options = {
            w:1,
            multi: true
          };

    if (!("$set" in body)) {
      body = {"$set": body};
    }

    this._mongodb.collection(collection).update(query, body, options, function(err, data){
      if (err) {
        defer.reject(err);
      }
      else {
        defer.resolve(data.result.nModified);
      }
    });

    return defer.promise;
  };

  /*

  */
  db.save = function(collection, document){

    check.assert.unemptyString(collection,
      "Invalid collection param, must be non empty string");
    check.assert.object(document,
      "Invalid document param, must be object");

    var defer = when.defer(),
        options = {
            safe:true
          };

    this._mongodb.collection(collection).save(document, options, function(err, data){
      if (err) {
        defer.reject(err);
      }
      else {
        defer.resolve(
          data.ops && data.ops[0] ?
            data.ops[0] :
            data.result.nModified
        );
      }
    });

    return defer.promise;
  };

  /*

  */
  db.saveComplete = function(collection, document){

    check.assert.unemptyString(collection,
      "Invalid collection param, must be non empty string");
    check.assert.object(document,
      "Invalid document param, must be object");
    if (!document.hasOwnProperty("_id")) {
      throw new Error("Invalid document param, must have _id");
    }

    return this.save(collection, document).
      then(function(){
        return document; //overriding the returning.
      });
  };

  /*

  */
  db.saveUpdates = function(collection, document){

    check.assert.unemptyString(collection,
      "Invalid collection param, must be non empty string");
    check.assert.object(document,
      "Invalid document param, must be object");
    if (!document.hasOwnProperty("_id")) {
      throw new Error("Invalid document param, must have _id");
    }

    var savedId = document._id;

    delete document._id;

    return this.update(
      collection,
      {
        _id: savedId
      },
      {
        "$set": document
      },
      {
        w: 1
      }
    );
  };

  /*

  */
  db.removeSingle = function(collection, document){

    check.assert.unemptyString(collection,
      "Invalid collection param, must be non empty string");
    check.assert.object(document,
      "Invalid document param, must be object");

    if (!document.hasOwnProperty("_id")) {
      throw new Error("Invalid document param, must have _id");
    }

    var defer = when.defer(),
        query = {
            _id : document._id
          },
        options = {
            w : 1
          };

    this._mongodb.collection(collection).remove(query, options, function(err, data){
      if (err) {
        defer.reject(err);
      }
      else {
        defer.resolve(data.result.n);
      }
    });

    return defer.promise;
  };

  /*

  */
  db.removeMultiple = function(collection, query){

    check.assert.unemptyString(collection,
      "Invalid collection param, must be non empty string");
    check.assert.object(query,
      "Invalid query param, must be object");

    var defer = when.defer(),
        options = {
          w: 1
        };

    this._mongodb.collection(collection).remove(query, options, function(err, data){
      if (err) {
        defer.reject(err);
      }
      else {
        defer.resolve(data.result.n);
      }
    });

    return defer.promise;
  };

  //connect with mongodb via native driver and return db custom object.
  return connect(connection).then(function(mongodb){

    db._mongodb = mongodb;

    return db;

  });

};
