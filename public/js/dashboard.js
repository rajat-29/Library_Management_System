// add new categories
function addCategory()
{
    window.location = "/add_category";
}

function manageCategory()
{
    window.location = '/manage_category';
}

function manageAuthor()
{
    window.location = '/manage_author';
}

function addAuthor()
{
    window.location = '/add_author';
}

function issueBook()
{
    window.location = '/book_issue';
}

function manage_issue_books()
{
    window.location = '/manage_issue_books';
}
function addNewUser()
{
    window.location='/add_students';
}

function manageStudents()
{
    window.location = '/manage_students';
}

function openissuedBookSpecificUser()
{
    window.location = '/openissuedBookSpecificUser';
}

function updateUserProfile()
{
    window.location = '/updateUserProfile';
}


function valid()
{
    if(document.chngpwd.newpassword.value!= document.chngpwd.confirmpassword.value)
    {
        alert("New Password and Confirm Password Field do not match  !!");
        document.chngpwd.confirmpassword.focus();
        return false;
    }
    return true;
}

function fetchNumbers()
{
    var totalNoofUser = document.getElementById('totalNoofUser');
    var totalNoOfBook = document.getElementById('totalNoOfBook'); 
    var totalNoofCat = document.getElementById('totalNoofCat');
    var totalissuedBooks = document.getElementById('totalissuedBooks');
    var totalNoofAuthors = document.getElementById('totalNoofAuthors');
    var totalissuedBooksToUser = document.getElementById('totalissuedBooksToUser');


    //for total number of users
    var countdata;
    var request = new XMLHttpRequest();
    request.open('GET','/totalNoofUsers');
    request.send();
    request.onload = function()
    {
        countdata = JSON.parse(request.responseText);
        totalNoofUser.innerHTML = countdata;
    }

    //for total number of books
    var countbook;
    var request1 = new XMLHttpRequest();
    request1.open('GET','/totalNoofBooks');
    request1.send();
    request1.onload = function()
    {
        countbook = JSON.parse(request1.responseText);
        totalNoOfBook.innerHTML = countbook;
    }

    //for total number of categories
    var countcat;
    var request2 = new XMLHttpRequest();
    request2.open('GET','/totalNoofCat');
    request2.send();
    request2.onload = function()
    {
        countcat = JSON.parse(request2.responseText);
        totalNoofCat.innerHTML = countcat;
    }

    //for total number of books issued
    var countIssuedBooks;
    var request3 = new XMLHttpRequest();
    request3.open('GET','/totalissuedBooks');
    request3.send();
    request3.onload = function()
    {
        countIssuedBooks = JSON.parse(request3.responseText);
        totalissuedBooks.innerHTML = countIssuedBooks;
    }

    //for total number of authors
    var countAuthors;
    var request4 = new XMLHttpRequest();
    request4.open('GET','/totalNoofAuthors');
    request4.send();
    request4.onload = function()
    {
        countAuthors = JSON.parse(request4.responseText);
        totalNoofAuthors.innerHTML = countAuthors;
    }

    // total books issued to user
     var countBookstoUser;
    var request5 = new XMLHttpRequest();
    request5.open('GET','/totalissuedBooksToUser');
    request5.send();
    request5.onload = function()
    {
        countBookstoUser = JSON.parse(request5.responseText);
        totalissuedBooksToUser.innerHTML = countBookstoUser;
    }



}

function addBook()
{
    window.location = "/add_book";
}

function manageBook()
{
    window.location = '/manageBook'
}

function changePassword()
{
    window.location="/changePassword";
}

// render home page
function home_page()
{
    window.location = "/home";
}

// logout user
function openlogoutpage()
{
    $.confirm({
    theme: 'supervan',
    title: 'Confirm Logout!',
    content: 'Do you really want logout?',
    draggable: true,
    buttons: {
        Yes: {
            action: function () {
             window.location = "/logout_person";
        }
    },
        No: {
             action: function () {
            
        }
    },
    }
    });
}