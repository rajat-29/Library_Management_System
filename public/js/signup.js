var uniId = document.getElementById('uniId');
var stuname = document.getElementById('stuname');
var email2 = document.getElementById('email2');
var password2 = document.getElementById('password2');
var phone = document.getElementById('phone');

var submitbtn = document.getElementById('submitbtn');
var cancelbtn = document.getElementById('cancelbtn');

submitbtn.addEventListener("click",function() {

	if(uniId.value == '' || stuname.value || email2.value || password2.value || phone.value)
	{
		alert("Field is Empty");
		return;
	}

	var obj = new Object();
	obj.uniId = uniId.value;
	obj.name = stuname.value;
	obj.email = email2.value;
	obj.password = password2.value;
	obj.phone = phone.value;
	obj.role = "User"

	var request = new XMLHttpRequest();
    request.open('POST',"/addnewuser");
    request.setRequestHeader("Content-Type","application/json");
    request.send(JSON.stringify(obj))
    request.addEventListener("load",function() {
        console.log("Data Posted Successfully");
        alert("New User Is Registred");
    });  
    window.location = "/signup_page";
})

cancelbtn.addEventListener("click", function() {
	 window.location = "/home";
})


function email_avail()
{
	document.getElementById("email_info").style.display = 'visible';
	document.getElementById("email_info").style.display = 'block';
	document.getElementById("email_info").style.marginTop = '10px';
	document.getElementById("email_info").style.marginBottom = '10px';
	
	var obj1 = new Object();
	obj1.email = email2.value;
	
	var request = new XMLHttpRequest();
    request.open('POST',"/checkemail");
    request.setRequestHeader("Content-Type","application/json");
    request.send(JSON.stringify({email: email2.value}));
    request.addEventListener("load",function() {
    	var data = request.responseText;
    	if(data === 'true') {
    		display_email.innerHTML= "User " + obj1.email + " is already exist";
    	}
    	else {
            display_email.innerHTML= obj1.email + " is available";
    	}
    });  
}