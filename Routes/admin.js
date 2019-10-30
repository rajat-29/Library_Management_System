let express = require('express');
var app = require('express').Router();
let path = require('path');

app.use(express.static(path.join(__dirname,'../public')));

var mongoose = require('mongoose');

var users = require('../Models/userSchema');
var category = require('../Models/categorySchema');
var books = require('../Models/BookSchema');
var authors = require('../Models/authorSchema');
var issueBookes = require('../Models/issueBookSchema');

var auth = require('../MiddleWares/auth');

app.post('/addnewuser',auth, function(req,res) {
     users.create(req.body,function(error,result)
      {
        if(error)
        throw error;
        else{}
      })
     res.send("data saved");
})

app.get('/add_category',auth, function(req,res) {
        res.render('add_category', {data: req.session});
})

app.get('/manage_category',auth, function(req,res) {
        res.render('manage_category', {data: req.session});
})

app.post('/addnewCategory',auth, function(req,res) {
     category.create(req.body,function(error,result)
      {
        if(error)
        throw error;
        else{}
      })
     res.send("data saved");
})

app.post('/showcategories' ,auth, function(req, res) {
    let query = {};
    let params = {};

    if(req.body.search.value)
        query.name = {"$regex" : req.body.search.value , "$options" : "i"};

    let sortingType;
    if(req.body.order[0].dir === 'asc')
        sortingType = 1;
    else
        sortingType = -1;

    if(req.body.order[0].column === '0')
        params = {skip : parseInt(req.body.start) , limit : parseInt(req.body.length), sort : {name : sortingType}};

    category.find(query , {} , params , function (err , data)
        {
            if(err)
                console.log(err);
            else {
                category.countDocuments(query, function(err , filteredCount)
                {
                    if(err)
                        console.log(err);
                    else {
                        category.countDocuments(function (err, totalCount)
                        {
                            if(err)
                                console.log(err);
                            else
                                res.send({"recordsTotal": totalCount,
                                    "recordsFiltered": filteredCount, data});
                        })
                    }
                });
            }
        })
})

app.delete('/category/:pro',auth,function(req,res) {
      var id = req.params.pro.toString();
      category.deleteOne({ "_id": id },function(err,result)
      {
          if(err)
          throw error
          else 
            res.send("data deleted SUCCESFULLY")
      });
 })

app.post('/updateCategoryDetails',auth, function(req,res) {  
        category.updateOne( { "createDate" : req.body.createDate}, {$set : req.body } , function(err,result)
        {
          if(err)
          throw err
          else 
            res.send("DATA UPDATED SUCCESFULLY")
        })
})

app.get('/add_book',auth, function(req,res) {
        res.render('add_book', {data: req.session});
})

app.post('/addnewbook',auth, function(req,res) {
     books.create(req.body,function(error,result)
      {
        if(error)
        throw error;
        else {}
      })
     res.send("data saved");
})

app.get('/manageBook',auth, function(req,res) {
        res.render('manage_books', {data: req.session});
})

app.get('/categoryOptions',auth,function (req, res)  {
    category.find({status: 'Active'}, function(error,result)
    {
        if(error)
        throw error;
        else
          res.send(JSON.stringify(result));
    })
})

app.get('/authorOptions',auth,function (req, res)  {
    authors.find( function(error,result)
    {
        if(error)
        throw error;
        else
          res.send(JSON.stringify(result));
    })
})

app.get('/add_author',auth, function(req,res) {
        res.render('add_author', {data: req.session});
})

app.get('/manage_author',auth, function(req,res) {
        res.render('manage_author', {data: req.session});
})

app.post('/addnewAuthor',auth, function(req,res) {
     authors.create(req.body,function(error,result)
      {
        if(error)
        throw error;
        else{}
      })
     res.send("data saved");
})

app.get('/add_students',auth, function(req,res) {
        res.render('add_students', {data: req.session});
})

app.post('/checkemail',auth,function (req, res) {
     users.findOne({email: req.body.email}, function(error,result)
      {
        if(error)
        throw error;

      if(!result)
        res.send("false");
      else 
          res.send("true");
      })
})

app.post('/sendMail',auth, function(request,response) {
      transporter.sendMail(request.body, (error, info) => {
        if(error) {
        } else {}
      })
})

app.get('/book_issue',auth, function(req,res) {
        res.render('book_issue', {data: req.session});
})

app.post('/issueNewBook' ,auth, function(req,res) {
  var details = new Object();
  details.isbn = req.body.isbn;
  details.uniId = req.body.uniId;
  details.ReturnDate = req.body.ReturnDate;
  details.fine = 0;

  users.find({uniId: req.body.uniId}, function(error,result)
    {
        if(error)
        throw error;
        else
        {
          details.studentName = result[0].name;
             books.find({isbn: req.body.isbn}, function(error,result)
             {
                  if(error)
                    throw error;
                  else {
                     details.bookName = result[0].name; 
                     issueBookes.create(details,function(error,result)
                      {
                        if(error)
                        throw error;
                        else
                        {}
                      })
                  }
              })
        }
    })
   res.send("data");
})

app.post('/checknameusingUniId',auth,function (req, res) {
     var uniId = req.body.uniId;
     users.findOne({uniId: uniId}, function(error,result)
      {
        if(error)
        throw error;

      if(!result) 
        res.send("false");
      else
           res.send(JSON.stringify(result));
      })
})

app.post('/checkbookusingIsbn',auth,function (req, res) {
     books.findOne({isbn: req.body.isbn}, function(error,result)
      {
        if(error)
        throw error;

      if(!result) 
        res.send("false");
      else 
           res.send(result.name);
      })
})

app.post('/changePasswordDatabase' ,auth, function(req,res){
    password = req.body;

    if(password.oldpass != req.session.password)
      res.send("Incorrect Old Password");
    else {
      users.updateOne({"email" : req.session.email},{$set: { "password" : password.newpass}} ,
        function(error,result)
        {
          if(error)
            throw error;
          else
            req.session.password = password.newpass;
        })
      res.send("Password Changed Successfully")
    }
})

app.get('/changePassword',auth, function(req,res) {
      res.render('changePassword', {data: req.session});
})

app.post('/showStudents' ,auth, function(req, res) {
  let query = {};
  let params = {};

  if(req.body.search.value) {
    query.name = {"$regex" : req.body.search.value , "$options" : "i"};
  }

  let sortingType;
  if(req.body.order[0].dir === 'asc')
    sortingType = 1;
  else
    sortingType = -1;

    if(req.body.order[0].column === '0')
        params = {skip : parseInt(req.body.start) , limit : parseInt(req.body.length), sort : {uniId : sortingType}};
    else if(req.body.order[0].column === '1')
        params = {skip : parseInt(req.body.start) , limit : parseInt(req.body.length), sort : {name : sortingType}};

        users.find(query , {} , params , function (err , data)
        {
            if(err)
                console.log(err);
            else
            {
                users.countDocuments(query, function(err , filteredCount)
                {
                    if(err)
                        console.log(err);
                    else
                    {
                        users.countDocuments(function (err, totalCount)
                        {
                            if(err)
                                console.log(err);
                            else
                                res.send({"recordsTotal": totalCount,
                                    "recordsFiltered": filteredCount, data});
                        })
                    }
                });
            }
        })
})

app.delete('/students/:pro',auth,function(req,res) {
      var id = req.params.pro.toString();
      users.deleteOne({ "_id": id },function(err,result)
      {
          if(err)
          throw error
          else
              res.send("data deleted SUCCESFULLY")
      });
 })

 app.post('/showauthor' ,auth, function(req, res) {
    let query = {};
    let params = {};

    if(req.body.search.value){
        query.name = {"$regex" : req.body.search.value , "$options" : "i"};
    }

    let sortingType;
    if(req.body.order[0].dir === 'asc')
        sortingType = 1;
    else
        sortingType = -1;

    if(req.body.order[0].column === '0')
        params = {skip : parseInt(req.body.start) , limit : parseInt(req.body.length), sort : {name : sortingType}};
   
    authors.find(query , {} , params , function (err , data)
        {
            if(err)
                console.log(err);
            else
            {
                authors.countDocuments(query, function(err , filteredCount)
                {
                    if(err)
                        console.log(err);
                    else
                    {
                        authors.countDocuments(function (err, totalCount)
                        {
                            if(err)
                                console.log(err);
                            else
                                res.send({"recordsTotal": totalCount,
                                    "recordsFiltered": filteredCount, data});
                        })
                    }
                });
            }
        })
})

app.delete('/author/:pro',auth,function(req,res) {
      var id = req.params.pro.toString();
      authors.deleteOne({ "_id": id },function(err,result)
      {
          if(err)
          throw error
          else 
              res.send("data deleted SUCCESFULLY")
      });
 })

app.post('/updateAuthorDetails',auth, function(req,res) {
        authors.updateOne( { "createDate" : req.body.createDate}, {$set : req.body } , function(err,result)
        {
          if(err)
          throw err
          else  
            res.send("DATA UPDATED SUCCESFULLY")
        })
})

app.post('/showBooks' ,auth, function(req, res) {
  let query = {};
  let params = {};
    
    if(req.body.search.value) {
        query.name = {"$regex" : req.body.search.value , "$options" : "i"};
    }

    let sortingType;
    if(req.body.order[0].dir === 'asc')
        sortingType = 1;
    else
        sortingType = -1;

    if(req.body.order[0].column === '0')
        params = {skip : parseInt(req.body.start) , limit : parseInt(req.body.length), sort : {name : sortingType}};
   
    books.find(query , {} , params , function (err , data)
        {
            if(err)
                console.log(err);
            else {
                books.countDocuments(query, function(err , filteredCount)
                {
                    if(err)
                        console.log(err);
                    else {
                        books.countDocuments(function (err, totalCount)
                        {
                            if(err)
                                console.log(err);
                            else
                                res.send({"recordsTotal": totalCount,
                                    "recordsFiltered": filteredCount, data});
                        })
                    }
                });
            }
        })
})

app.get('/manage_students',auth,function(req,res) {
        res.render('manage_students', {data: req.session});
})

app.delete('/book/:pro',auth,function(req,res) {
      var id = req.params.pro.toString();
      books.deleteOne({ "_id": id },function(err,result)
      {
          if(err)
          throw error
          else 
              res.send("data deleted SUCCESFULLY")
      });
})

app.post('/updateBookDetails',auth, function(req,res) {
  books.updateOne( { "isbn" : req.body.isbn}, {$set : req.body } , function(err,result)
  {
    if(err)
      throw err
    else 
      res.send("DATA UPDATED SUCCESFULLY")
  })
})



app.delete('/issuedBook/:pro',auth,function(req,res) {
      var id = req.params.pro.toString();
      issueBookes.deleteOne({ "_id": id },function(err,result)
      {
          if(err)
          throw error
          else
              res.send("data deleted SUCCESFULLY")
      });
 })

app.post('/showIssuedBooks' ,auth, function(req, res) {

  let query = {};
  let params = {};

    if(req.body.search.value){
        query.uniId = {"$regex" : req.body.search.value , "$options" : "i"};
    }

   let sortingType;
    if(req.body.order[0].dir === 'asc')
        sortingType = 1;
    else
        sortingType = -1;

        if(req.body.order[0].column === '0')
        params = {skip : parseInt(req.body.start) , limit : parseInt(req.body.length), sort : {uniId : sortingType}};
   
        issueBookes.find(query , {} , params , function (err , data)
        {
            if(err)
                console.log(err);
            else
            {
                issueBookes.countDocuments(query, function(err , filteredCount)
                {
                    if(err)
                        console.log(err);
                    else
                    {
                        issueBookes.countDocuments(function (err, totalCount)
                        {
                            if(err)
                                console.log(err);
                            else
                                res.send({"recordsTotal": totalCount,
                                    "recordsFiltered": filteredCount, data});
                        })
                    }
                });
            }
        })
})

app.get('/manage_issue_books',auth, function(req,res) {
        res.render('manage_issue_books', {data: req.session});
})

app.post('/updateuserdetails',auth, function(req,res) {
        issueBookes.updateOne( { "isbh" : req.body.isbn}, {$set : req.body } , function(err,result)
        {
          if(err)
          throw err
          else
            res.send("DATA UPDATED SUCCESFULLY")
        })
})

app.get('/logout_person',auth, function(req,res) {
    req.session.isLogin = 0;
    req.session.destroy();
    res.render('index');
})

app.get('/totalNoofUsers' ,auth, function(req, res) {
          users.countDocuments(function(e,count){
                res.send(JSON.stringify(count));
   });
})

app.get('/totalNoofBooks' ,auth, function(req, res) {
          books.countDocuments(function(e,count){
                res.send(JSON.stringify(count));
     });
})

app.get('/totalNoofCat' ,auth, function(req, res) {
          category.countDocuments(function(e,count){
                res.send(JSON.stringify(count));
   });
})

app.get('/totalissuedBooks' ,auth, function(req, res) {
          issueBookes.countDocuments(function(e,count){
                res.send(JSON.stringify(count));
   });
})

app.get('/totalNoofAuthors' ,auth, function(req, res) {
          authors.countDocuments(function(e,count){
                res.send(JSON.stringify(count));
   });
})

app.get('/totalissuedBooksToUser' ,auth, function(req, res) {
          issueBookes.countDocuments({uniId: req.session.uniId}, function(e,count){
                res.send(JSON.stringify(count));
   });
})

module.exports = app;