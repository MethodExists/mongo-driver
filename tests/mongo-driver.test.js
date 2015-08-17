"use strict";
/* jshint  node: true, undef: true, unused: true */

var ChaiJS = require("chai"),
    chaiAsPromised = require("chai-as-promised");

ChaiJS.use(chaiAsPromised);

var expect = ChaiJS.expect;

ChaiJS.should();

var driver  = require("../mongo-driver"),
    check   = require("check-types");

describe("mongo-driver", function(){

  var conn = "mongodb://localhost:27017/test",
      db;

  describe("connection", function(){


    it("throws error if connection is malformed", function(){
      var conns = [
        "",
        "537f6fd2d11fa3c6054a8068",
        "some nonesense"
      ];
      conns.forEach(function(e){
        driver.connect(e).should.be.rejected;
      });
    });

    it("does not reject when url includes username and password", function(done){
      driver.connect("mongodb://me_development:unoDosNahTr3s@localhost:27017").should.be.rejectedWith('Authentication failed').notify(done);
    });


    // TIMEOUT PROBLEM TEST FAILING SOMETIMES TODO: FIX
    // it("throws error if cannot reach host", function(done){
    //   this.timeout(3000);
    //   var conn = "mongodb://www.nonexistenthost.com:27017/test?socketTimeoutMS=1000&connectTimeoutMS=1000";
    //   driver.connect(conn, {}).should.be.rejected.notify(done);
    // });

    it("throws error if wrong port", function(done){
      this.timeout(3000);
      var connstr = "mongodb://localhost:8080/test?socketTimeoutMS=1000&connectTimeoutMS=1000";
      driver.connect(connstr).should.be.rejected.notify(done);
    });

    it("connect succesfuly with: " + conn, function(done){
      driver.connect(conn).
        then(function(_db){
          db = _db; //passing to global reference (trick)
          return _db;
        }).
        should.eventually.contain.keys("find","insert").
          notify(done);
    });

  });

  describe("features", function(){

    var removeItems = function(done){
      //clean all records of book collection.
      db._mongodb.collection("book").
        remove(
          {},
          {w:1},
          function(err){
            if (err) {
              done(err);
            }
            else {
              done();
            }
          }
        );
    };

    //clean the database before and after the tests
    before(removeItems);
    after(removeItems);

    describe("insert", function(){

      it("throws error if no collection provided", function(){
        expect( db.insert ).to.throw(Error, /invalid\s+collection/i );
      });

      it("throws error if collection is not a string", function(){
        expect( db.insert.bind(db, 4) ).
          to.throw(Error, /invalid\s+collection/i );
        expect( db.insert.bind(db, true) ).
          to.throw(Error, /invalid\s+collection/i );
        expect( db.insert.bind(db, "") ).
          to.throw(Error, /invalid\s+collection/i );
        expect( db.insert.bind(db, {}) ).
          to.throw(Error, /invalid\s+collection/i );
        expect( db.insert.bind(db, []) ).
          to.throw(Error, /invalid\s+collection/i );
        expect( db.insert.bind(db, new Date()) ).
          to.throw(Error, /invalid\s+collection/i );
      });

      it("throws error if not documented provided", function(){
        expect( db.insert.bind(db, "book") ).
          to.throw(Error, /invalid\s+docs/i );
      });

      it("throws error if document is not object or array", function(){
        expect( db.insert.bind(db, "book", "somestring") ).
          to.throw(Error, /invalid\s+docs/i );
        expect( db.insert.bind(db, "book", 4) ).
          to.throw(Error, /invalid\s+docs/i );
        expect( db.insert.bind(db, "book", true) ).
          to.throw(Error, /invalid\s+docs/i );
        expect( db.insert.bind(db, "book", new Date()) ).
          to.throw(Error, /invalid\s+docs/i );
      });

      it("should insert a document", function(done){
        db.insert(
          "book",
          {
            title: "The pragmatic programmer",
            authors: ["Andy Hunt", "David Thomas"]
          }
        ).should.eventually.be.an("array").notify(done);
      });

      it("should insert many documents", function(done){
        var p = db.insert(
          "book",
          [
            {
              title: "The Lord of the rings",
              authors: ["J.R.R. Tolkien"]
            },
            {
              title: "Dra-cool-la",
              authors: ["Bram Stoker"]
            },
            {
              title: "Harry Potter",
              authors: ["J.K. Rowling"]
            },
            {
              title: "47 Ronin",
              authors: ["Stan Sakai"]
            }
          ]
        );
        p.should.eventually.be.an("array").
          should.eventually.have.length(4).notify(done);
      });

    });

    describe("find", function(){

      it("throws error if no collection provided", function(){
        expect( db.find ).to.throw(Error, /invalid\s+collection/i );
      });

      it("throws error if collection is not a string", function(){
        expect( db.find.bind(db, 4) ).
          to.throw(Error, /invalid\s+collection/i );
        expect( db.find.bind(db, true) ).
          to.throw(Error, /invalid\s+collection/i );
        expect( db.find.bind(db, "") ).
          to.throw(Error, /invalid\s+collection/i );
        expect( db.find.bind(db, {}) ).
          to.throw(Error, /invalid\s+collection/i );
        expect( db.find.bind(db, []) ).
          to.throw(Error, /invalid\s+collection/i );
        expect( db.find.bind(db, new Date()) ).
          to.throw(Error, /invalid\s+collection/i );
      });

      it("throws error if no query provided", function(){
        expect( db.find.bind(db, "book") ).
          to.throw(Error, /invalid\s+query/i );
      });

      it("throws error if query is not object", function(){
        expect( db.find.bind(db, "book", "somestring") )
          .to.throw(Error, /invalid\s+query/i );
        expect( db.find.bind(db, "book", 4) )
          .to.throw(Error, /invalid\s+query/i );
        expect( db.find.bind(db, "book", true) )
          .to.throw(Error, /invalid\s+query/i );
        expect( db.find.bind(db, "book", []) )
          .to.throw(Error, /invalid\s+query/i );
        expect( db.find.bind(db, "book", new Date()) )
          .to.throw(Error, /invalid\s+query/i );
      });

      it("throws error if options is not object", function(){
        expect( db.find.bind(db, "book", {}, "somestring") )
          .to.throw(Error, /invalid\s+options/i );
        expect( db.find.bind(db, "book", {}, 4) )
          .to.throw(Error, /invalid\s+options/i );
        expect( db.find.bind(db, "book", {}, true) )
          .to.throw(Error, /invalid\s+options/i );
        expect( db.find.bind(db, "book", {}, []) )
          .to.throw(Error, /invalid\s+options/i );
        expect( db.find.bind(db, "book", {}, new Date()) )
          .to.throw(Error, /invalid\s+options/i );
      });

      it("throws empty array if no matches", function(done){
        db.find(
          "book",
          {
            title: "nonexisting"
          }
        ).
          should.eventually.be.an("array").
          should.eventually.have.length.of(0).notify(done);
      });

      it("should find some documents", function(done){
        var p = db.find(
          "book",
          {
            title: /lord/i
          }
        );
        p.should.eventually.be.an("array").
          should.eventually.have.length.of.at.least(1).notify(done);

      });

    });

    describe("findOne", function(){

      it("throws error if no collection provided", function(){
        expect( db.findOne ).to.throw(Error, /invalid\s+collection/i );
      });

      it("throws error if collection is not a string", function(){
        expect( db.findOne.bind(db, 4) ).
          to.throw(Error, /invalid\s+collection/i );
        expect( db.findOne.bind(db, true) ).
          to.throw(Error, /invalid\s+collection/i );
        expect( db.findOne.bind(db, "") ).
          to.throw(Error, /invalid\s+collection/i );
        expect( db.findOne.bind(db, {}) ).
          to.throw(Error, /invalid\s+collection/i );
        expect( db.findOne.bind(db, []) ).
          to.throw(Error, /invalid\s+collection/i );
        expect( db.findOne.bind(db, new Date()) ).
          to.throw(Error, /invalid\s+collection/i );
      });

      it("throws error if no query provided", function(){
        expect( db.findOne.bind(db, "book") ).
          to.throw(Error, /invalid\s+query/i );
      });

      it("throws error if query is not object", function(){
        expect( db.findOne.bind(db, "book", "somestring") )
          .to.throw(Error, /invalid\s+query/i );
        expect( db.findOne.bind(db, "book", 4) )
          .to.throw(Error, /invalid\s+query/i );
        expect( db.findOne.bind(db, "book", true) )
          .to.throw(Error, /invalid\s+query/i );
        expect( db.findOne.bind(db, "book", []) )
          .to.throw(Error, /invalid\s+query/i );
        expect( db.findOne.bind(db, "book", new Date()) )
          .to.throw(Error, /invalid\s+query/i );
      });

      it("throws error if options is not object", function(){
        expect( db.findOne.bind(db, "book", {}, "somestring") )
          .to.throw(Error, /invalid\s+options/i );
        expect( db.findOne.bind(db, "book", {}, 4) )
          .to.throw(Error, /invalid\s+options/i );
        expect( db.findOne.bind(db, "book", {}, true) )
          .to.throw(Error, /invalid\s+options/i );
        expect( db.findOne.bind(db, "book", {}, []) )
          .to.throw(Error, /invalid\s+options/i );
        expect( db.findOne.bind(db, "book", {}, new Date()) )
          .to.throw(Error, /invalid\s+options/i );
      });

      it("throws null if no matches", function(done){
        db.findOne(
          "book",
          {
            title: "nonexisting"
          }
        ).
          should.eventually.equal(null).notify(done);
      });

      it("should find one document", function(done){
        var p = db.findOne(
          "book",
          {
            title: /lord/i
          }
        );
        p.should.eventually.be.an("object").notify(done);

      });

    });

    describe("count", function(){

      it("throws error if no collection provided", function(){
        expect( db.count ).to.throw(Error, /invalid\s+collection/i );
      });

      it("throws error if collection is not a string", function(){
        expect( db.count.bind(db, 4) ).
          to.throw(Error, /invalid\s+collection/i );
        expect( db.count.bind(db, true) ).
          to.throw(Error, /invalid\s+collection/i );
        expect( db.count.bind(db, "") ).
          to.throw(Error, /invalid\s+collection/i );
        expect( db.count.bind(db, {}) ).
          to.throw(Error, /invalid\s+collection/i );
        expect( db.count.bind(db, []) ).
          to.throw(Error, /invalid\s+collection/i );
        expect( db.count.bind(db, new Date()) ).
          to.throw(Error, /invalid\s+collection/i );
      });

      it("throws error if no query provided", function(){
        expect( db.count.bind(db, "book") ).
          to.throw(Error, /invalid\s+query/i );
      });

      it("throws error if query is not object", function(){
        expect( db.count.bind(db, "book", "somestring") )
          .to.throw(Error, /invalid\s+query/i );
        expect( db.count.bind(db, "book", 4) )
          .to.throw(Error, /invalid\s+query/i );
        expect( db.count.bind(db, "book", true) )
          .to.throw(Error, /invalid\s+query/i );
        expect( db.count.bind(db, "book", []) )
          .to.throw(Error, /invalid\s+query/i );
        expect( db.count.bind(db, "book", new Date()) )
          .to.throw(Error, /invalid\s+query/i );
      });

      it("throws error if options is not object", function(){
        expect( db.count.bind(db, "book", {}, "somestring") )
          .to.throw(Error, /invalid\s+options/i );
        expect( db.count.bind(db, "book", {}, 4) )
          .to.throw(Error, /invalid\s+options/i );
        expect( db.count.bind(db, "book", {}, true) )
          .to.throw(Error, /invalid\s+options/i );
        expect( db.count.bind(db, "book", {}, []) )
          .to.throw(Error, /invalid\s+options/i );
        expect( db.count.bind(db, "book", {}, new Date()) )
          .to.throw(Error, /invalid\s+options/i );
      });

      it("returns 0 if no matches", function(done){
        db.count(
          "book",
          {
            title: "nonexisting"
          }
        ).
          should.eventually.be.a("number").
          should.eventually.be.equal(0).notify(done);
      });

      it("should count some documents", function(done){
        var p = db.count(
          "book",
          {
            title: /lord/i
          }
        );
        p.should.eventually.be.an("number").
          should.eventually.be.equal(1).notify(done);

      });

    });

    describe("distinct", function(){


      it("should get results", function(done){
        var p = db.distinct(
          "book",
          "title",
          {}
        );

        p.should.eventually.be.an("array").to.be.deep.
          eql(
            [ "The pragmatic programmer",
              "The Lord of the rings",
              "Dra-cool-la",
              "Harry Potter",
              "47 Ronin" ]
        ).notify(done);
      });

      it("works with query", function(done) {
        var p = db.distinct(
          "book",
          "title",
          {authors: "J.R.R. Tolkien"}
        );

        p.should.eventually.be.an("array").to.be.deep.
          eql(
            [
              "The Lord of the rings"
            ]
        ).notify(done);
      });
    });

    describe("update", function(){

      it("throws error if no collection provided", function(){
        expect( db.update ).to.throw(Error, /invalid\s+collection/i );
      });

      it("throws error if collection is not a string", function(){
        expect( db.update.bind(db, 4) ).
          to.throw(Error, /invalid\s+collection/i );
        expect( db.update.bind(db, true) ).
          to.throw(Error, /invalid\s+collection/i );
        expect( db.update.bind(db, "") ).
          to.throw(Error, /invalid\s+collection/i );
        expect( db.update.bind(db, {}) ).
          to.throw(Error, /invalid\s+collection/i );
        expect( db.update.bind(db, []) ).
          to.throw(Error, /invalid\s+collection/i );
        expect( db.update.bind(db, new Date()) ).
          to.throw(Error, /invalid\s+collection/i );
      });

      it("throws error if no query provided", function(){
        expect( db.update.bind(db, "book") ).
          to.throw(Error, /invalid\s+query/i );
      });

      it("throws error if query is not object", function(){
        expect( db.update.bind(db, "book", "somestring") )
          .to.throw(Error, /invalid\s+query/i );
        expect( db.update.bind(db, "book", 4) )
          .to.throw(Error, /invalid\s+query/i );
        expect( db.update.bind(db, "book", true) )
          .to.throw(Error, /invalid\s+query/i );
        expect( db.update.bind(db, "book", []) )
          .to.throw(Error, /invalid\s+query/i );
        expect( db.update.bind(db, "book", new Date()) )
          .to.throw(Error, /invalid\s+query/i );
      });

      it("throws error if no body provided", function(){
        expect( db.update.bind(db, "book", {}) ).
          to.throw(Error, /invalid\s+body/i );
      });

      it("throws error if body is not object", function(){
        expect( db.update.bind(db, "book", {}, "somestring") )
          .to.throw(Error, /invalid\s+body/i );
        expect( db.update.bind(db, "book", {}, 4) )
          .to.throw(Error, /invalid\s+body/i );
        expect( db.update.bind(db, "book", {}, true) )
          .to.throw(Error, /invalid\s+body/i );
        expect( db.update.bind(db, "book", {}, []) )
          .to.throw(Error, /invalid\s+body/i );
        expect( db.update.bind(db, "book", {}, new Date()) )
          .to.throw(Error, /invalid\s+body/i );
      });

      it("throws error if options is not object", function(){
        expect( db.update.bind(db, "book", {}, {}, "somestring") )
          .to.throw(Error, /invalid\s+options/i );
        expect( db.update.bind(db, "book", {}, {}, 4) )
          .to.throw(Error, /invalid\s+options/i );
        expect( db.update.bind(db, "book", {}, {}, true) )
          .to.throw(Error, /invalid\s+options/i );
        expect( db.update.bind(db, "book", {}, {}, []) )
          .to.throw(Error, /invalid\s+options/i );
        expect( db.update.bind(db, "book", {}, {}, new Date()) )
          .to.throw(Error, /invalid\s+options/i );
      });

      it("should update a book", function(done){
        var p = db.update(
          "book",
          {
            title: "Dra-cool-la"
          },
          {
            "$set": {
              title: "Dracula"
            }
          },
          {}
        );
        p.should.eventually.be.a("number").
          should.eventually.be.at.least(1).notify(done);
      });

    });

    describe("multiUpdate", function(){

      it("throws error if no collection provided", function(){
        expect( db.multiUpdate ).to.throw(Error, /invalid\s+collection/i );
      });

      it("throws error if collection is not a string", function(){
        expect( db.multiUpdate.bind(db, 4) ).
          to.throw(Error, /invalid\s+collection/i );
        expect( db.multiUpdate.bind(db, true) ).
          to.throw(Error, /invalid\s+collection/i );
        expect( db.multiUpdate.bind(db, "") ).
          to.throw(Error, /invalid\s+collection/i );
        expect( db.multiUpdate.bind(db, {}) ).
          to.throw(Error, /invalid\s+collection/i );
        expect( db.multiUpdate.bind(db, []) ).
          to.throw(Error, /invalid\s+collection/i );
        expect( db.multiUpdate.bind(db, new Date()) ).
          to.throw(Error, /invalid\s+collection/i );
      });

      it("throws error if no query provided", function(){
        expect( db.multiUpdate.bind(db, "book") ).
          to.throw(Error, /invalid\s+query/i );
      });

      it("throws error if query is not object", function(){
        expect( db.multiUpdate.bind(db, "book", "somestring") )
          .to.throw(Error, /invalid\s+query/i );
        expect( db.multiUpdate.bind(db, "book", 4) )
          .to.throw(Error, /invalid\s+query/i );
        expect( db.multiUpdate.bind(db, "book", true) )
          .to.throw(Error, /invalid\s+query/i );
        expect( db.multiUpdate.bind(db, "book", []) )
          .to.throw(Error, /invalid\s+query/i );
        expect( db.multiUpdate.bind(db, "book", new Date()) )
          .to.throw(Error, /invalid\s+query/i );
      });

      it("throws error if no body provided", function(){
        expect( db.multiUpdate.bind(db, "book", {}) ).
          to.throw(Error, /invalid\s+body/i );
      });

      it("throws error if body is not object", function(){
        expect( db.multiUpdate.bind(db, "book", {}, "somestring") )
          .to.throw(Error, /invalid\s+body/i );
        expect( db.multiUpdate.bind(db, "book", {}, 4) )
          .to.throw(Error, /invalid\s+body/i );
        expect( db.multiUpdate.bind(db, "book", {}, true) )
          .to.throw(Error, /invalid\s+body/i );
        expect( db.multiUpdate.bind(db, "book", {}, []) )
          .to.throw(Error, /invalid\s+body/i );
        expect( db.multiUpdate.bind(db, "book", {}, new Date()) )
          .to.throw(Error, /invalid\s+body/i );
      });

      it("should update many documents", function(done){
        var p = db.multiUpdate(
          "book",
          {
            title: /(lord[\s\w]+rings)|(47[\s\w]+ronin)|(potter)/i
          },
          {
            category: "Science Fiction"
          }
        );
        p.should.eventually.be.a("number").
          should.eventually.equals(3).notify(done);
      });

    });

    describe("save", function(){

      it("throws error if no collection provided", function(){
        expect( db.save ).to.throw(Error, /invalid\s+collection/i );
      });

      it("throws error if collection is not a string", function(){
        expect( db.save.bind(db, 4) ).
          to.throw(Error, /invalid\s+collection/i );
        expect( db.save.bind(db, true) ).
          to.throw(Error, /invalid\s+collection/i );
        expect( db.save.bind(db, "") ).
          to.throw(Error, /invalid\s+collection/i );
        expect( db.save.bind(db, {}) ).
          to.throw(Error, /invalid\s+collection/i );
        expect( db.save.bind(db, []) ).
          to.throw(Error, /invalid\s+collection/i );
        expect( db.save.bind(db, new Date()) ).
          to.throw(Error, /invalid\s+collection/i );
      });

      it("throws error if no document provided", function(){
        expect( db.save.bind(db, "book") ).
          to.throw(Error, /invalid\s+document/i );
      });

      it("throws error if document is not object", function(){
        expect( db.save.bind(db, "book", "somestring") )
          .to.throw(Error, /invalid\s+document/i );
        expect( db.save.bind(db, "book", 4) )
          .to.throw(Error, /invalid\s+document/i );
        expect( db.save.bind(db, "book", true) )
          .to.throw(Error, /invalid\s+document/i );
        expect( db.save.bind(db, "book", []) )
          .to.throw(Error, /invalid\s+document/i );
        expect( db.save.bind(db, "book", new Date()) )
          .to.throw(Error, /invalid\s+document/i );
      });

      it("should save a document, since doesn't exist, should insert", function(done){
        var p = db.save(
          "book",
          {
            title: "The Hobbit",
            authors: ["J.R.R. Tolkien"]
          }
        );
        p.should.eventually.be.an("object").
          should.eventually.contain.keys("title", "authors", "_id").notify(done);
      });

      it("should update existing document", function(done){
        var book,
            p;
        db.find(
          "book",
          {
            title: /dracula/i
          }
        ).then(function(books){
          if (check.array(books) && books.length > 0 ) {
            book = books[0];
            book.category = "Horror";
          }
          p = db.save(
            "book",
            book
          );
          p.should.eventually.be.an("number").
            should.eventually.equals(1).notify(done);
        });
      });

      it("works when you save with _id unmodified", function(done) {
        var p;
        db.find(
          "book",
          {
            title: /dracula/i
          }
        ).then(function(books){
          p = db.save(
            "book",
            books[0]
          );
          p.should.eventually.be.an("number").
            should.eventually.equals(0).notify(done);
        });

      });

    });

    describe("saveComplete", function(){

      it("throws error if no collection provided", function(){
        expect( db.saveComplete ).to.throw(Error, /invalid\s+collection/i );
      });

      it("throws error if collection is not a string", function(){
        expect( db.saveComplete.bind(db, 4) ).
          to.throw(Error, /invalid\s+collection/i );
        expect( db.saveComplete.bind(db, true) ).
          to.throw(Error, /invalid\s+collection/i );
        expect( db.saveComplete.bind(db, "") ).
          to.throw(Error, /invalid\s+collection/i );
        expect( db.saveComplete.bind(db, {}) ).
          to.throw(Error, /invalid\s+collection/i );
        expect( db.saveComplete.bind(db, []) ).
          to.throw(Error, /invalid\s+collection/i );
        expect( db.saveComplete.bind(db, new Date()) ).
          to.throw(Error, /invalid\s+collection/i );
      });

      it("throws error if no document provided", function(){
        expect( db.saveComplete.bind(db, "book") ).
          to.throw(Error, /invalid\s+document/i );
      });

      it("throws error if document is not object", function(){
        expect( db.saveComplete.bind(db, "book", "somestring") )
          .to.throw(Error, /invalid\s+document/i );
        expect( db.saveComplete.bind(db, "book", 4) )
          .to.throw(Error, /invalid\s+document/i );
        expect( db.saveComplete.bind(db, "book", true) )
          .to.throw(Error, /invalid\s+document/i );
        expect( db.saveComplete.bind(db, "book", []) )
          .to.throw(Error, /invalid\s+document/i );
        expect( db.saveComplete.bind(db, "book", new Date()) )
          .to.throw(Error, /invalid\s+document/i );
      });

      it("should save and validate a document", function(done){
        this.timeout(4000);
        var book,
            p;
        db.find(
          "book",
          {
            title: /dracula/i
          }
        ).then(function(books){
          if (check.array(books) && books.length > 0 ) {
            book = books[0];
            delete book.category;
            book.published = 1897;
          }
          p = db.saveComplete(
            "book",
            book
          );
          p.should.eventually.be.an("object").
            should.eventually.contain.keys("_id", "title", "published").
            should.eventually.not.contain.keys("category").
            notify(done);
        });
      });

    });

    describe("saveUpdates", function(){

      it("throws error if no collection provided", function(){
        expect( db.saveUpdates ).to.throw(Error, /invalid\s+collection/i );
      });

      it("throws error if collection is not a string", function(){
        expect( db.saveUpdates.bind(db, 4) ).
          to.throw(Error, /invalid\s+collection/i );
        expect( db.saveUpdates.bind(db, true) ).
          to.throw(Error, /invalid\s+collection/i );
        expect( db.saveUpdates.bind(db, "") ).
          to.throw(Error, /invalid\s+collection/i );
        expect( db.saveUpdates.bind(db, {}) ).
          to.throw(Error, /invalid\s+collection/i );
        expect( db.saveUpdates.bind(db, []) ).
          to.throw(Error, /invalid\s+collection/i );
        expect( db.saveUpdates.bind(db, new Date()) ).
          to.throw(Error, /invalid\s+collection/i );
      });

      it("throws error if no document provided", function(){
        expect( db.saveUpdates.bind(db, "book") ).
          to.throw(Error, /invalid\s+document/i );
      });

      it("throws error if document is not object", function(){
        expect( db.saveUpdates.bind(db, "book", "somestring") )
          .to.throw(Error, /invalid\s+document/i );
        expect( db.saveUpdates.bind(db, "book", 4) )
          .to.throw(Error, /invalid\s+document/i );
        expect( db.saveUpdates.bind(db, "book", true) )
          .to.throw(Error, /invalid\s+document/i );
        expect( db.saveUpdates.bind(db, "book", []) )
          .to.throw(Error, /invalid\s+document/i );
        expect( db.saveUpdates.bind(db, "book", new Date()) )
          .to.throw(Error, /invalid\s+document/i );
      });

      it("should save only the fields specified of document", function(done){
        var bookId,
            p;
        db.find(
          "book",
          {
            title: /lord[\s\w]+rings/i
          },
          {
            _id: 1
          }
        ).then(function(books){
          if (check.array(books) && books.length > 0 ) {
            bookId = books[0]._id;
            p = db.saveUpdates(
              "book",
              {
                _id: bookId,
                published: 1954
              }
            ).then(function(){
              return db.find(
                "book",
                {
                  _id: bookId
                }
              ).then(function(docs){
                return docs[0]; //return the first doc
              });
            });
            p.should.eventually.be.an("object").
              should.eventually.contain.keys("_id", "published", "category", "title").
              notify(done);
          }
        });
      });

    });

    describe("removeSingle", function(){

      it("throws error if no collection provided", function(){
        expect( db.removeSingle ).to.throw(Error, /invalid\s+collection/i );
      });

      it("throws error if collection is not a string", function(){
        expect( db.removeSingle.bind(db, 4) ).
          to.throw(Error, /invalid\s+collection/i );
        expect( db.removeSingle.bind(db, true) ).
          to.throw(Error, /invalid\s+collection/i );
        expect( db.removeSingle.bind(db, "") ).
          to.throw(Error, /invalid\s+collection/i );
        expect( db.removeSingle.bind(db, {}) ).
          to.throw(Error, /invalid\s+collection/i );
        expect( db.removeSingle.bind(db, []) ).
          to.throw(Error, /invalid\s+collection/i );
        expect( db.removeSingle.bind(db, new Date()) ).
          to.throw(Error, /invalid\s+collection/i );
      });

      it("throws error if no document provided", function(){
        expect( db.removeSingle.bind(db, "book") ).
          to.throw(Error, /invalid\s+document/i );
      });

      it("throws error if document is not object", function(){
        expect( db.removeSingle.bind(db, "book", "somestring") )
          .to.throw(Error, /invalid\s+document/i );
        expect( db.removeSingle.bind(db, "book", 4) )
          .to.throw(Error, /invalid\s+document/i );
        expect( db.removeSingle.bind(db, "book", true) )
          .to.throw(Error, /invalid\s+document/i );
        expect( db.removeSingle.bind(db, "book", []) )
          .to.throw(Error, /invalid\s+document/i );
        expect( db.removeSingle.bind(db, "book", new Date()) )
          .to.throw(Error, /invalid\s+document/i );
      });

      it("should remove just one document", function(done){

        var book,
            p;

        db.find(
          "book",
          {
            title: /harry\s+potter/i
          },
          {
            _id: 1
          }
        ).then(function(books){
          if (check.array(books) && books.length > 0 ){
            book = books[0];
            p = db.removeSingle(
              "book",
              book
            );
            p.should.eventually.be.a("number").
              should.eventually.equals(1).notify(done);
          }
        });

      });

    });

    describe("removeMultiple", function(){

      it("throws error if no collection provided", function(){
        expect( db.removeMultiple ).to.throw(Error, /invalid\s+collection/i );
      });

      it("throws error if collection is not a string", function(){
        expect( db.removeMultiple.bind(db, 4) ).
          to.throw(Error, /invalid\s+collection/i );
        expect( db.removeMultiple.bind(db, true) ).
          to.throw(Error, /invalid\s+collection/i );
        expect( db.removeMultiple.bind(db, "") ).
          to.throw(Error, /invalid\s+collection/i );
        expect( db.removeMultiple.bind(db, {}) ).
          to.throw(Error, /invalid\s+collection/i );
        expect( db.removeMultiple.bind(db, []) ).
          to.throw(Error, /invalid\s+collection/i );
        expect( db.removeMultiple.bind(db, new Date()) ).
          to.throw(Error, /invalid\s+collection/i );
      });

      it("throws error if no query provided", function(){
        expect( db.removeMultiple.bind(db, "book") ).
          to.throw(Error, /invalid\s+query/i );
      });

      it("throws error if query is not object", function(){
        expect( db.removeMultiple.bind(db, "book", "somestring") )
          .to.throw(Error, /invalid\s+query/i );
        expect( db.removeMultiple.bind(db, "book", 4) )
          .to.throw(Error, /invalid\s+query/i );
        expect( db.removeMultiple.bind(db, "book", true) )
          .to.throw(Error, /invalid\s+query/i );
        expect( db.removeMultiple.bind(db, "book", []) )
          .to.throw(Error, /invalid\s+query/i );
        expect( db.removeMultiple.bind(db, "book", new Date()) )
          .to.throw(Error, /invalid\s+query/i );
      });

      it("should remove many documents", function(done){

        var p;

        p = db.removeMultiple(
          "book",
          {
            authors: /tolkien/i
          }
        );
        p.should.eventually.be.a("number").
          should.eventually.equals(2).notify(done);

      });

    });

    // describe("aggregate", function(){
    //   it("should print aggregated documents", function(){
    //     var a = db.aggregate( "checklist", [ { $group: { _id: "$is_published", count: { $sum: 1 } } }] );
    //     a.then(console.log);
    //   });
    // });

  });

});
