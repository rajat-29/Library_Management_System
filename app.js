var express = require('express')
var path = require('path')
var app = express()
var session = require('express-session');
var ejs = require('ejs');
var mongodb = require('mongodb');
var mailer = require('nodemailer');
var MongoDataTable = require('mongo-datatable');
ObjectId = require('mongodb').ObjectID;
var MongoClient = mongodb.MongoClient;
var userdata = new Object();

// view engine setup

app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

app.use(express.static(path.join(__dirname,'/public'))) /*folder path*/

app.use(express.urlencoded({extended: true}))
app.use(express.json())									/*include express*/
app.use(session({
    secret: "xYzUCAchitkara",
    resave: false,
    saveUninitialized: true,
}))

var mongoose = require('mongoose');						/*include mongo*/
var mongoDB = 'mongodb://localhost/libraryManagement';

mongoose.set('useFindAndModify', false);
mongoose.connect(mongoDB,{ useNewUrlParser: true});

mongoose.connection.on('error',(err) => {					/*database connect*/
    console.log('DB connection Error');
})

mongoose.connection.on('connected',(err) => {
    console.log('DB connected');
})

// node mailler //
// add your email and password here for email //
let transporter = mailer.createTransport({
    service: 'gmail',
    auth: {
      user: '',
      pass: ''
    },
});

// user data base scehema //
var userSchema = new mongoose.Schema({					/*define structure of database*/
    name: String,
    uniId: String,
    email: String,
    password: String,
    phone: String,
    city: String,
    gender: String,
    dob: String,
    role: String,   
    status: String,
    flag: Number, 
})

// category data base schema //
var categorSchema = new mongoose.Schema({
    name: String,
    status: String,
    createDate: String,
})

// book data base schema //
var BookSchema = new mongoose.Schema({
    name: String,
    category: String,
    author: String,
    isbn: String,
    price: String,
})

// author data base schema //
var authorSchema = new mongoose.Schema({
    name: String,
    createDate: String,
})

var issueBookSchema = new mongoose.Schema({
    isbn: String,
    uniId: String,
    ReturnDate: String,
    studentName: String,
    bookName: String,
    fine: String,
})

var users = mongoose.model('students', userSchema);
var category = mongoose.model('categories', categorSchema);
var books = mongoose.model('books', BookSchema);
var authors = mongoose.model('authors', authorSchema);
var issueBookes = mongoose.model('issueBookes', issueBookSchema);

// login checking //
app.post('/checkLogin',function (req, res)  {

    req.session.isLogin = 0;
    var username = req.body.name;
    var pasword = req.body.password;
    users.findOne({email: username,password: pasword}, function(error,result)
    {
        if(error)
        throw error;

        if(!result) 
        {
            console.log('not exits');
            res.send("false");
        }
        else
        {
            //console.log(result)
              //console.log(req.body)
                req.session.isLogin = 1;
                req.session.email = req.body.name;
                req.session.password = req.body.password;
                req.session.uniId = result.uniId;

                userdata.name = result.name;
                userdata.email = result.email;         
                userdata.role = result.role;
                userdata.uniId = result.uniId;
                userdata.phone = result.phone;

                res.send("true");
            
        }
    })     
})

// admin side //
app.get('/home' , function(req,res) {        /*get data */
    if(req.session.isLogin) 
    {
        
            res.render('dashboard', {data: userdata});         
        
    } 
    else 
    {
        res.render('index');
    }
})

// render signup page
app.get('/signup_page', function(req,res) {
        res.render('signup_users', {data: userdata});
})

app.post('/addnewuser', function(req,res) {
     users.create(req.body,function(error,result)
      {
        if(error)
        throw error;
        else
        {
          console.log(result);
        }
      })
     res.send("data saved");
})

// render add category page
app.get('/add_category', function(req,res) {
    if(req.session.isLogin)
    {
        res.render('add_category', {data: userdata});
    }
    else
    {
        res.render('index');
    }
})

// render manage category page
app.get('/manage_category', function(req,res) {
    if(req.session.isLogin)
    {
        res.render('manage_category', {data: userdata});
    }
    else
    {
        res.render('index');
    }
})

app.post('/addnewCategory', function(req,res) {
     category.create(req.body,function(error,result)
      {
        if(error)
        throw error;
        else
        {
          console.log(result);
        }
      })
     res.send("data saved");
})

//datatables on categories
app.post('/showcategories' , function(req, res) {
      let query = {};
    let params = {};

    if(req.body.search.value)
    {
        query.name = {"$regex" : req.body.search.value , "$options" : "i"};
    }

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
            else
            {
                category.countDocuments(query, function(err , filteredCount)
                {
                    if(err)
                        console.log(err);
                    else
                    {
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

//delete category
app.delete('/category/:pro',function(req,res) {
      var id = req.params.pro.toString();
      category.deleteOne({ "_id": id },function(err,result)
      {
          if(err)
          throw error
          else
          {
            console.log(result);
              res.send("data deleted SUCCESFULLY")
          }
      });
 })

// fetch select options of categories
app.get('/categoryOptions',function (req, res)  {
    category.find({status: 'Active'}, function(error,result)
    {
        if(error)
        throw error;
        else
        res.send(JSON.stringify(result));
    })
})

// render add book page //
app.get('/add_book', function(req,res) {
     if(req.session.isLogin)
     {
        res.render('add_book', {data: userdata});
     }
     else
     {
        res.render('index');
     }
})

// add book to database //
app.post('/addnewbook', function(req,res) {
     books.create(req.body,function(error,result)
      {
        if(error)
        throw error;
        else
        {
          console.log(result);
        }
      })
     res.send("data saved");
})

// render manage book page //
app.get('/manageBook', function(req,res) {
     if(req.session.isLogin)
     {
        res.render('manage_books', {data: userdata});
     }
     else
     {
        res.render('index');
     }
})

//datatables on categories
app.post('/showBooks' , function(req, res) {
  let query = {};
    let params = {};
    
    if(req.body.search.value)
    {
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
            else
            {
                books.countDocuments(query, function(err , filteredCount)
                {
                    if(err)
                        console.log(err);
                    else
                    {
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

//delete category
app.delete('/book/:pro',function(req,res) {
      var id = req.params.pro.toString();
      books.deleteOne({ "_id": id },function(err,result)
      {
          if(err)
          throw error
          else
          {
            console.log(result);
              res.send("data deleted SUCCESFULLY")
          }
      });
 })

// render add author page //
app.get('/add_author', function(req,res) {
     if(req.session.isLogin)
     {
        res.render('add_author', {data: userdata});
     }
     else
     {
        res.render('index');
     }
})

// render manage author page //
app.get('/manage_author', function(req,res) {
     if(req.session.isLogin)
     {
        res.render('manage_author', {data: userdata});
     }
     else
     {
        res.render('index');
     }
})

// add author to the database
app.post('/addnewAuthor', function(req,res) {
     authors.create(req.body,function(error,result)
      {
        if(error)
        throw error;
        else
        {
          console.log(result);
        }
      })
     res.send("data saved");
})

//datatables on authors
app.post('/showauthor' , function(req, res) {
      let query = {};
    let params = {};

    if(req.body.search.value)
    {
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

// fetch select options of author
app.get('/authorOptions',function (req, res)  {
    authors.find( function(error,result)
    {
        if(error)
        throw error;
        else
        res.send(JSON.stringify(result));
    })
})

//delete author
app.delete('/author/:pro',function(req,res) {
      var id = req.params.pro.toString();
      authors.deleteOne({ "_id": id },function(err,result)
      {
          if(err)
          throw error
          else
          {
            console.log(result);
              res.send("data deleted SUCCESFULLY")
          }
      });
 })

// render book issue page //
app.get('/book_issue', function(req,res) {
     if(req.session.isLogin)
     {
        res.render('book_issue', {data: userdata});
     }
     else
     {
        res.render('index');
     }
})

// render change password page
app.get('/changePassword', function(req,res) {
    if(req.session.isLogin) {
      res.render('changePassword', {data: userdata});
    
       } else {
      res.render('index');
     }
})

// change password to database //
app.post('/changePasswordDatabase' , function(req,res){
    password = req.body;
    if(password.oldpass != req.session.password)
    {
      res.send("Incorrect Old Password");
    } 
    else
    {
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

// logout the user and admin //
app.get('/logout_person', function(req,res) {
    req.session.isLogin = 0;
    req.session.destroy();
    res.render('index');
})

// find total number of users
app.get('/totalNoofUsers' , function(req, res) {
          users.countDocuments(function(e,count){
                res.send(JSON.stringify(count));
   });
})

// find total number of books
app.get('/totalNoofBooks' , function(req, res) {
          books.countDocuments(function(e,count){
                res.send(JSON.stringify(count));
     });
})

// find total number of category
app.get('/totalNoofCat' , function(req, res) {
          category.countDocuments(function(e,count){
                res.send(JSON.stringify(count));
   });
})

// find total number of issued Books
app.get('/totalissuedBooks' , function(req, res) {
          issueBookes.countDocuments(function(e,count){
                res.send(JSON.stringify(count));
   });
})

// find total number of Authors
app.get('/totalNoofAuthors' , function(req, res) {
          authors.countDocuments(function(e,count){
                res.send(JSON.stringify(count));
   });
})

// find total number of books issued to specific user
app.get('/totalissuedBooksToUser' , function(req, res) {
  
          issueBookes.countDocuments({uniId: req.session.uniId}, function(e,count){
                res.send(JSON.stringify(count));
   });
})

// issue new book
app.post('/issueNewBook' , function(req,res) {

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
                  else
                  {
                     details.bookName = result[0].name; 

                     issueBookes.create(details,function(error,result)
                      {
                        if(error)
                        throw error;
                        else
                        {
                          console.log(result);
                        }
                      })
                  }
              })
        }
    })

   res.send("data");
})

// render book issue manage page //
app.get('/manage_issue_books', function(req,res) {
     if(req.session.isLogin)
     {
        res.render('manage_issue_books', {data: userdata});
     }
     else
     {
        res.render('index');
     }
})

//datatables on issued books
app.post('/showIssuedBooks' , function(req, res) {

  let query = {};
  let params = {};

if(req.body.search.value)
    {
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

//delete issued book //
app.delete('/issuedBook/:pro',function(req,res) {
      var id = req.params.pro.toString();
      issueBookes.deleteOne({ "_id": id },function(err,result)
      {
          if(err)
          throw error
          else
          {
            console.log(result);
              res.send("data deleted SUCCESFULLY")
          }
      });
 })

// render student manage page //
app.get('/manage_students', function(req,res) {
     if(req.session.isLogin)
     {
        res.render('manage_students', {data: userdata});
     }
     else
     {
        res.render('index');
     }
})

//datatables on students
app.post('/showStudents' , function(req, res) {
  let query = {};
  let params = {};

  if(req.body.search.value)
  {
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

//delete students //
app.delete('/students/:pro',function(req,res) {
      var id = req.params.pro.toString();
      users.deleteOne({ "_id": id },function(err,result)
      {
          if(err)
          throw error
          else
          {
            console.log(result);
              res.send("data deleted SUCCESFULLY")
          }
      });
 })

// render add student page //
app.get('/add_students', function(req,res) {
     if(req.session.isLogin)
     {
        res.render('add_students', {data: userdata});
     }
     else
     {
        res.render('index');
     }
})

// check wheater email exits or not //
app.post('/checkemail',function (req, res) {

     var emailes = req.body.email;

     users.findOne({email: emailes}, function(error,result)
      {
        if(error)
        throw error;

      if(!result) {
        console.log(emailes);
        res.send("false");
      }
        else
        {
           res.send("true");
        }
      })
})

// send mail to users node mailler //
app.post('/sendMail', function(request,response) {
    console.log(request.body)
      transporter.sendMail(request.body, (error, info) => {
        if(error) {
          console.log(error)
        } else {
          console.log("Mail Sent" + info.response);
        }
      })
})

// check student name using uniId //
app.post('/checknameusingUniId',function (req, res) {

     var uniId = req.body.uniId;

     users.findOne({uniId: uniId}, function(error,result)
      {
        if(error)
        throw error;

      if(!result) {
        res.send("false");
      }
        else
        {
           res.send(JSON.stringify(result));
        }
      })
})

// check book name using isbn //
app.post('/checkbookusingIsbn',function (req, res) {

     var isbn = req.body.isbn;

     books.findOne({isbn: isbn}, function(error,result)
      {
        if(error)
        throw error;

      if(!result) {
        res.send("false");
      }
        else
        {
           res.send(result.name);
        }
      })
})

// to update categories details //
app.post('/updateCategoryDetails', function(req,res) {
  
  var obj = new Object();
  obj.name = req.body.name;
 // obj.status = req.body.status;
  console.log(obj);
        category.updateOne( { "createDate" : req.body.createDate}, {$set : req.body } , function(err,result)
        {
          if(err)
          throw err
          else
          {
            console.log('hello')
            res.send("DATA UPDATED SUCCESFULLY")
          }
        })
})


// to update author details //
app.post('/updateAuthorDetails', function(req,res) {
  
  var obj = new Object();
  obj.name = req.body.name;
 // obj.status = req.body.status;
  console.log(obj);
        authors.updateOne( { "createDate" : req.body.createDate}, {$set : req.body } , function(err,result)
        {
          if(err)
          throw err
          else
          {
            console.log('hello')
            res.send("DATA UPDATED SUCCESFULLY")
          }
        })
})

// to update book details //
app.post('/updateBookDetails', function(req,res) {
 
 // obj.status = req.body.status;
console.log(req.body.isbn)
        books.updateOne( { "isbn" : req.body.isbn}, {$set : req.body } , function(err,result)
        {
          if(err)
          throw err
          else
          {
            console.log('hello')
            res.send("DATA UPDATED SUCCESFULLY")
          }
        })
})

// to update book issued details //
app.post('/updateuserdetails', function(req,res) {
  //console.log(req.body);
        issueBookes.updateOne( { "isbh" : req.body.isbn}, {$set : req.body } , function(err,result)
        {
          if(err)
          throw err
          else
          {
            res.send("DATA UPDATED SUCCESFULLY")
          }
        })
})

// render specific user issued books page
app.get('/openissuedBookSpecificUser', function(req,res) {
    if(req.session.isLogin)
    {
        res.render('issuedBookSpecificUser', {data: userdata});
    }
    else
    {
        res.render('index');
    }
})

//datatables on book issued to specific user
app.post('/showIssuedBookSpecificUser' , function(req, res) {
    var flag;
          issueBookes.countDocuments({uniId: req.session.uniId},function(e,count){
      var start=parseInt(req.body.start);
      var len=parseInt(req.body.length);
      issueBookes.find({uniId: req.session.uniId
      }).skip(start).limit(len)
    .then(data=> {
       if (req.body.search.value)
                    {
                        data = data.filter((value) => {
                            flag = value.isbn.includes(req.body.search.value) || value.uniId.includes(req.body.search.value);
            return flag;
                        })
                    } 
 
      res.send({"recordsTotal": count, "recordsFiltered" : count, data})
     })
     .catch(err => {
      res.send(err)
     })
   });
})


// render specific user update profile page
app.get('/updateUserProfile', function(req,res) {
    if(req.session.isLogin)
    {
        res.render('updateUserProfile', {data: userdata});
    }
    else
    {
        res.render('index');
    }
})

// to update author details //
app.post('/updateUserProfileDetails', function(req,res) {

  console.log(req.body)

  userdata.name = req.body.name;
  userdata.email = req.body.email;
  userdata.phone = req.body.phone;
  
        users.updateOne( { "uniId" : req.session.uniId}, {$set : req.body } , function(err,result)
        {
          if(err)
          throw err
          else
          {
            console.log('hello')
            res.send("DATA UPDATED SUCCESFULLY")
          }
        })
})

// user deactivated //
app.get("/404" ,function(req,res) {
   res.render("404");
})

console.log("Running on port 8000");
app.listen(8000)