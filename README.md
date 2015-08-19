# mongo-driver
A basic mongodb native driver which works with promises instead of callbacks.

## Basic usage
```
var driver = require("mongo-driver");
driver.connect("mongodb://localhost:27017/test").
then(function(db){
  db.find(
    "client",
    {
      name: /^a/i   //compare field name when starts with "a"
    },
    {
      fields: {
        name: 1,
        age: 1,
        occupation: 1
      }
    }
  )
});
```


## connect()
Starts the connection with database and returns a mongo database class instance.

## Params
connection *string* (`"mongodb://host:port/dbname"`)

## Returns
- promise of db object instance of mongo database class.


### Basic usage
```
var driver = require("mongo-driver");
driver.connect("mongodb://localhost:27017/test").
then(function(db){
  //do operations with db...
  db.find(...);
  db.update(...);
  ...
});
```


## find()
it find one or many records according with a criteria and fields definition

### Params
- collection   *string* collection name
- query        *object* key/value pair where key is field, and value is the criteria for search
- options      *object* key/value pair which can contain:
  - fields     *object* key/value pair where key is field and value can be 1|true or 0|false
  - limit      *number* rows limit for querying
  - skip       *number* offset, this says from where it is going to retrieve rows.
  - sort       *array*  array of arrays, where ['field', 'asc'|'desc'].
### Returns
- promise of [document] array of documents that match with query

### Basic usage
```
db.find(
  "client",
  {
    name: /john/i
  },
  {
    fields: {
      name: 1,
      age: 1,
      occupation: 1
    }
  }
).then(function(items){
  //items is an array of matched documents.
});
```


## findOne()
Fetches the first document that matches the query according with a criteria and fields definition

### Params
- collection   *string* collection name
- query        *object* key/value pair where key is field, and value is the criteria for search
- options      *object* key/value pair which can contain:
  - fields     *object* key/value pair where key is field and value can be 1|true or 0|false
  - limit      *number* rows limit for querying
  - skip       *number* offset, this says from where it is going to retrieve rows.
  - sort       *array*  array of arrays, where ['field', 'asc'|'desc'].
### Returns
- promise of [document] that match with query or null if there's no match

### Basic usage
```
db.findOne(
  "client",
  {
    name: /john/i
  },
  {
    fields: {
      name: 1,
      age: 1,
      occupation: 1
    }
  }
).then(function(item){
  //item is the first object of matched documents.
});
```


## count()
return number of documents that a query matches

### Params
- collection   *string* collection name
- query        *object* key/value pair where key is field, and value is the criteria for search
- options      *object* key/value pair which can contain:
  - fields     *object* key/value pair where key is field and value can be 1|true or 0|false
  - limit      *number* rows limit for querying
  - skip       *number* offset, this says from where it is going to retrieve rows.
  - sort       *array*  array of arrays, where ['field', 'asc'|'desc'].
### Returns
- promise of [int] count of documents matched by query

### Basic usage
```
db.count(
  "client", {name: /john/i}, { fields: { name: 1, age: 1} } ).then(
  function(count){
    //count of matched documents.
});
```


## insert()
inserts a mongo document, this maps with mongo-native driver insert, but with a promise.

### Params
- collection    *string*                 collection name
- docs          *document*|[*document*]  document or array of documents that will be inserted

### Returns
- promise of [object] an array of inserted documents

### Basic usage
```
db.insert(
  "book",
  {
    title: "nodejs 101",
    authors: ["Some node guru"]
  }
).then(function(docs){
  //docs is an array of documents that were inserted but with the generated _id.
});

//or insert an array of books

db.insert(
  "book",
  [
    {
      title: "nodejs 101",
      authors: ["Some node guru"]
    },
    {
      title: "ruby on rails with turbo",
      authors: ["some fancy", "dev"]
    }
  ]
).then(function(docs){
  //docs is an array of documents that were inserted but with the generated _id.
});
```


## update()
updates one document according with query

### Params
- collection   *string*  collection name
- query        *object*  key/value pair where key is field name and value is the criteria
- body         *object*  key/value pair where key is field name
                          note: if you not provide $set: {}, body will override
                          current document body.
- options      *object*  key/value pair which can contain:
  - w          *number*  write concern (most used value=1), check mongo db doc.
  - multi      *bool*    if just one or many documents were be updated
### Returns
- promise of count      *number*  the number of updated records.

### Basic usage:
```
  db.update(
    "book",
    {
      title: "The hitchhiker's guide to the galaxy"
    },
    {
      "$set": {
        authors: ["Douglas Adams", "Eoin Colfer"]
      }
    },
    {
      w:1,
      multi: true
    }
  ).then(function(count){
    //the number of records updated
  });
```


## multiUpdate()
It updates many documents matching with query.
  mongo values multi:true and $set: body are forced so body won't override documents
  but only will change specified fields

### Params
- collection   *string*  collection name
- query        *object*  key/value pair where key is name of the field
                          and value is the criteria for search
- body         *object*  key/value pair where key is name of the field
### Returns
- promise of count      *number*  the number of updated records

### Basic usage
```
db.multiUpdate(
  "book",
  {
    title: /o\'reilly/i
  },
  {
    category: "Software"
  }
).then(function(count){
  //the number of records updated
});
```


## save()
Saves a document.
If _id is provided in document body, then document is updated, otherwise, it is inserted.
It maps to mongo-native driver function, but with a promise.

### Params
- collecction  *string* collection name
- document     *object* the document body. (it can have _id)

### Returns
- promise of nrModified   *number* | *object*

Returns promise of 0 if document was not modified.
Returns promise of 1 if document was modified
Returns promise of document object if document was inserted

### Basic usage
```
//saving a non existing document
db.save(
  "book",
  {
    title: "Javascript 101",
    authors: ["java ninja dev"]

).then(function(obj){
  console.log(obj._id);
});

//saving an existing document
db.save(
  "book",
  {
    _id: ObjectId("5384b969e9e034da154e67fa"),
    title: "jQuery for newbies",
    author: "some jQuery guru"
  }
).then(function(nrModified){
  // number of modified records (0 or 1)
});
```


## saveComplete()
for save one document, it forces document param to have _id.
  it overrides existing document body for new one.

### Params
- collection   *string* collection name
- document     *object* key/value pair where key is field name, it must have _id field.

### Returns
- promise of document   *object* returns the same document it was delivered

### Basic usage
```
db.saveComplete(
  "book",
  {
    _id: ObjectId("5384b969e9e034da154e67fa"),
    title: "jQuery for newbies",
    author: "some jQuery guru"
  }
).then(function(doc){
  //doc is the document that was provided
});
```


## saveUpdates()
for save one document, it forces document param to have _id.
  it only replaces provided fields for existing document.

### Params
- collection   *string* collection name
- document     *object* key/value pair where key is field name, it must have _id field.

### Returns
- promise of updateResult

### Basic usage
```
db.saveUpdates(
  "book",
  {
    _id: ObjectId("5384b969e9e034da154e67fa"),
    category: "software development"
  }
);
```


## removeSingle()
it removes a single document from database, _id must be provided

### Params
- collection   *string* collection name
- document     *object* key/value pair where key is field name, it must have _id field.

### Returns
- promise of count *number* (1 if record was removed)

### Basic usage
```
db.removeSingle(
  "book",
  {
    _id: ObjectId("5384b969e9e034da154e67fa")
  }
).then(function(count){
  //count equals 1 if document was removed
});
```


## removeMultiple()
it removes all documents that match with query

### Params
- collection   *string* collection name
- query        *object* key/value pair where key is the field name,
                          and value is the criteria for search

### Returns
- promise of count      *number* number of records that were removed from database

### Basic usage
```
//remove just one document (same as removeSingle)
db.removeMultiple(
  "book",
  {
    _id: ObjectId("5384b969e9e034da154e67fa")
  }
).then(function(count){
   //count equals 1 if document was removed
});

//remove many records, the ones that match with category criteria
db.removeMultiple(
  "book",
  {
    category: "Programming"
  }
).then(function(count){
   //count is the name of documents that were removed
});
```
