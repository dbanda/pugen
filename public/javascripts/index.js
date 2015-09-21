    // This is called with the results from from FB.getLoginStatus().
   function statusChangeCallback(response) {
       console.log('statusChangeCallback');
       console.log(response);
       // The response object is returned with a status field that lets the
       // app know the current login status of the person.
       // Full docs on the response object can be found in the documentation
       // for FB.getLoginStatus().
       if (response.status === 'connected') {
           // Logged into your app and Facebook.
           testAPI();
       } else if (response.status === 'not_authorized') {
           // The person is logged into Facebook, but not your app.
           document.getElementById('status').innerHTML = 'Please log ' +
               'into this app.';
       } else {
           // The person is not logged into Facebook, so we're not sure if
           // they are logged into this app or not.
           document.getElementById('status').innerHTML = 'Please log ' +
               'into Facebook.';
       }
   }
    // This function is called when someone finishes with the Login
    // Button.  See the onlogin handler attached to it in the sample
    // code below.
   function checkLoginState() {
       FB.login(function(response) {
           console.log(response);
       }, {
           scope: 'user_friends'
       });


       FB.getLoginStatus(function(response) {
           statusChangeCallback(response);
       });
   }
   window.fbAsyncInit = function() {
       FB.init({
           appId: '814216818699536',
           cookie: true, // enable cookies to allow the server to access
           // the session
           xfbml: true, // parse social plugins on this page
           version: 'v2.4' // use version 2.2
       });
       // Now that we've initialized the JavaScript SDK, we call
       // FB.getLoginStatus().  This function gets the state of the
       // person visiting this page and can return one of three states to
       // the callback you provide.  They can be:
       //
       // 1. Logged into your app ('connected')
       // 2. Logged into Facebook, but not your app ('not_authorized')
       // 3. Not logged into Facebook and can't tell if they are logged into
       //    your app or not.
       //
       // These three cases are handled in the callback function.
       FB.getLoginStatus(function(response) {
           statusChangeCallback(response);
       });
   };
    // Load the SDK asynchronously
   (function(d, s, id) {
       var js, fjs = d.getElementsByTagName(s)[0];
       if (d.getElementById(id)) return;
       js = d.createElement(s);
       js.id = id;
       js.src = "//connect.facebook.net/en_US/sdk.js";
       fjs.parentNode.insertBefore(js, fjs);
   }(document, 'script', 'facebook-jssdk'));
    // Here we run a very simple test of the Graph API after login is
    // successful.  See statusChangeCallback() for when this call is made.
   function testAPI() {
       console.log('Welcome!  Fetching your information.... ');
       FB.api('/me', {
           fields: 'name, email, public_key'
       }, function(response) {

           //console.log(JSON.stringify(response));

           $.ajax({
               type: "POST",
               url: "users/login",
               data: {
                   id: response.id,
                   public_key: response.public_key,

               }
           }).done(function(data) {
               console.log(data);
               console.log('Successful login for: ' + response.name);
               document.getElementById('status').innerHTML =
                   'Thanks for logging in, ' + response.name + '!';
           });
       });
   }

   function exec() {
       console.log("exec");
       $.ajax({
           type: "POST",
           url: "",
           data: {
               phrase: $('#phrase').val(),
               keyword: $('#keyword').val(),
               site: $('#site').val(),
               p_rand: 0.1,
               max_length: $('#length').val(),
               min_length: 8,
               digits: 2
           }
       }).done(function(data) {
           console.log(data);
           $("#password").val(data);
           $(".glyphicon-refresh").removeClass("glyphicon-refresh-animate");
           $("#message").html("password generated");
       })
   }

   function accept() {
       console.log("accept");
       $.ajax({
           type: "POST",
           url: "accept",
       }).done(function(data) {
           console.log("accept: " + data);
           $('#password').val(data);
           $('#message').html('Password successfuly encrypted and stored. <br> Password copied to clipboard!');
       });

   };

   var reloadBtn = $('.reloadBtn');
   reloadBtn.click(function(event) {
    exec();
    $(".glyphicon-refresh").addClass("glyphicon-refresh-animate");
    $("#message").html("I am working my NLP magic ...");
   })

   var acceptbtn = document.querySelector('.acceptbtn');
   acceptbtn.addEventListener('click', function(event) {
       // Select the email link anchor text  
       accept();
       window.getSelection().removeAllRanges();
       var password = document.querySelector('#password');
       password.select();
       var range = document.createRange();
       range.selectNode(password);
       window.getSelection().addRange(range);

       try {
           // Now that we've selected the anchor text, execute the copy command  
           var successful = document.execCommand('copy');
           var msg = successful ? 'successful' : 'unsuccessful';
           console.log('Copy password command was ' + msg);
       } catch (err) {
           console.log('Oops, unable to copy');
       }

       // Remove the selections - NOTE: Should use   
       // removeRange(range) when it is supported  
       window.getSelection().removeAllRanges();
   });


   $('#site').val($(location).attr('href'));