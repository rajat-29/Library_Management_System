 var table;

 $(document).ready(function() {
    table = $('#authors').DataTable({
      "processing": true,
      "serverSide": true,
      "ajax": {
        "url": "/admin/showauthor",
        "type": "POST",
      },
      "columns": [
      {
        "data" : "name"
      },
      {
        "data" : "createDate"
      },
      {
        "data" : null
      },
      ],
      "columnDefs": [{
                "targets": -1,

                "render": function (data, type, row, meta) {
                   return '<span class="btn btn-primary btn-sm emailbtn actionbtns" id="updateAuthor" data-toggle="modal" data-target="#updateModal"><i class="fas fa-edit"></i></span><span class="btn btn-danger btn-sm emailbtn actionbtns" id="delete" onclick=deleteAuthor("'+row._id+'")><i class="fas fa-trash"></i></span>';    
          }
            }],
    });
  });

  function deleteAuthor(ides)
  {
  $(document).on("click", "#delete", function() {
    d = $(this).parent().parent()[0].children;
  $.confirm({
      title: 'Delete Author!',
      content: "Are you sure you want to delete " + d[0].innerHTML,
      draggable: true,
      buttons: {
        Yes: {
             btnClass: 'btn-success any-other-class',
              action: function () {
               btnClass: 'btn-red any-other-class'
               var filename = '/admin/author/' + ides;
            
               var request = new XMLHttpRequest();
               request.open('DELETE',filename);
               request.send()
               request.addEventListener("load",function(event)
              {
                  table.ajax.reload(null, false);
              });  
          }
      },
        No: {
            btnClass: 'btn-danger any-other-class',
             action: function () {      
          }
      },
      }
    });
})
}


$(document).on("click", "#updateAuthor", function() {
    d = $(this).parent().parent()[0].children;
    console.log(d);
    checkName = d[1].innerHTML
    $('#username').val(d[0].innerHTML);
    $('#createDate').val(d[1].innerHTML);
})


function updateuserdetails()
{
  var username = document.getElementById("username");
  var statusName = document.getElementById("statusName");


    var obj1 = Object()
    
      obj1.name = username.value;
      obj1.createDate = checkName
      var request = new XMLHttpRequest();
      request.open('POST', '/admin/updateAuthorDetails');
      request.setRequestHeader("Content-Type","application/json");
      request.send(JSON.stringify(obj1))
      request.addEventListener("load",function()
          {
          });
          table.ajax.reload(null, false);
}