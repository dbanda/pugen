// This is called with the results from from FB.getLoginStatus().
function statusChangeCallback(response) {
    console.log('statusChangeCallback');
    console.log(response.status);
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
// (function(d, s, id) {
//     var js, fjs = d.getElementsByTagName(s)[0];
//     if (d.getElementById(id)) return;
//     js = d.createElement(s);
//     js.id = id;
//     js.src = "sdk.js";
//     fjs.parentNode.insertBefore(js, fjs);
// }(document, 'script', 'facebook-jssdk'));

// Here we run a very simple test of the Graph API after login is
// successful.  See statusChangeCallback() for when this call is made.
function testAPI() {
    console.log('Welcome!  Fetching your information.... ');
    FB.api('/me', {
        fields: 'name, email, public_key'
    }, function(response) {
        console.log(response);
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
        url: "http://dalitsob.com/pugen/",
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
        $(".glyphicon-refresh").removeClass("glyphicon-refresh-animate");
        if (data.success){
            $("#password").val(data.success);
            $("#message").html("password generated");
            $("#password").removeAttr("readonly");
            $(".copybtn").hide();
            $(".acceptbtn").show();
        }else{
            $("#message").html("error generating password");
        }

    })
}

function submitLogin(chromeData) {
    console.log("submit login");
    var formData = new FormData($('form')[0]);

    $.ajax({
            type: "GET",
            url: "https://www.facebook.com/dialog/oauth?client_id=814216818699536&redirect_uri=http://dalitsob.com/pugen/users/fblogin",
        }).done(function(data) {
            //alert(JSON.stringify(data));
            if (data.session) {
                $('#status').html(
                    'Thanks for logging in via FB, ' + data.name + '! ' ); //+ JSON.stringify(chromeData))
            } else {

                $('#status').html(
                    'Looks like you are a new user with data:' + JSON.stringify(chromeData) +
                    'Paste your public key for encryption in the text area below')
                $("#publicKeyTextArea").show();
                //alert(JOSN.strigify(data));
                $('body').html(data);
                $('#myModel').addClass("block");
                $.ajax({
                    type: "POST",
                    url: "users/login",
                    data: {
                        id: chromeData.id,
                        public_key: response.public_key,

                    }
                }).done(function(data) {
                    $("#publicKeyTextArea").hide();
                    console.log(data);
                    console.log('Successful login for: ' + response.name);
                    document.getElementById('status').innerHTML =
                        'Thanks for logging in, ' + response.name + '!';
                });
            }
        })
}

function accept() {
    console.log("accept");
    $.ajax({
        type: "POST",
        url: "http://dalitsob.com/pugen/accept",
    }).done(function(data) {
        console.log("accept: " + data);
        $('#password').val(data);
        $('#message').html('Password successfuly encrypted and stored. <br> Password copied to clipboard!');
    });

};


var retrieveBtn = $('.retrieveBtn');
retrieveBtn.click(function(argument) {
    // alert("retriving");
    $.ajax({
        type: "GET",
        url: "http://dalitsob.com/pugen/retrievelist",
    }).done(function(data) {
        // alert(JSON.stringify(data));
        var list = $(".retrievelist");
        if (data.success) {
            //alert(JSON.stringify(data.arr[0]))
            if(data.arr.length > 0){
                list.html('');
                list.toggleClass("activeretrivelist");
                $(".container").toggleClass("openlist");
                $("#hacker-list").toggle();
            }
            for (var i = data.arr.length - 1; i >= 0; i--) {
                //alert("" + JSON.stringify(data.arr[i].id));
                var id = data.arr[i].id;
                id = encodeURIComponent(id);
                var li = $('<li/>')
                    .appendTo(list)
                var a = $('<a class="sitename"/>')
                    .attr('href', '#')
                    .html(data.arr[i].site)
                    .appendTo(li);

                (function function_name(id) {
                    a.click(function(arg) {
                        // chrome.downloads.download({
                        //     url: "http://dalitsob.com/pugen/retrieve/" + id
                        // }, function(id) {
                        //     chrome.downloads.open(id)
                        //     alert(id);
                        // });


                        $.ajax({
                            type: "GET",
                            url: "http://dalitsob.com/pugen/retrieve/" + id
                        }).done(function(pgpMessage) {
                            //alert(JSON.stringify(data));
                            list.removeClass("activeretrivelist");
                            $(".container").removeClass("openlist");
                            $("#hacker-list").hide();

                            chrome.storage.local.get(['privateKey', 'passphrase'], function(data) {
                                var privateKey = data.privateKey;
                                var passphrase = data.passphrase;

                                if (privateKey && passphrase) {

                                } else {
                                    privateKey = $("#pgpTextArea").val();
                                    passphrase = $("#passphrase").val();
                                }

                                //alert(pgpMessage);
                                var armored = openpgp.key.readArmored(privateKey);
                                if (armored.err){
                                    alert(armored.err + " \n" + "please reenter passphrase and private key");
                                    chrome.storage.local.set({
                                    'privateKey': null,
                                    'passphrase': null
                                    }, function() {
                                        $("#pgpTextArea").show();
                                        $("#pgpTextArea").attr("placeholder", "paste private key");

                                        $("#passphrase").show();
                                        $("#passphrase").attr("placeholder", "enter passphrase and press enter");

                                    })
                                    return
                                }
                                privateKey = armored.keys[0];
                                privateKey.decrypt(passphrase);
                                pgpMessage = openpgp.message.readArmored(pgpMessage);
                                //alert(JSON.stringify(privateKey));
                                //alert(JSON.stringify(pgpMessage));
                                openpgp.decryptMessage(privateKey, pgpMessage).then(function(plaintext) {
                                    // success
                                    $("#site").val(JSON.parse(plaintext).site)
                                    $("#password").val(JSON.parse(plaintext).password);
                                    $("#password").attr("readonly", "readonly");
                                    $(".copybtn").show();
                                    $(".acceptbtn").hide();
                                    var btn = $(".copybtn");
                                    btn.click(function(argument) {
                                        // body...
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
                                            $('#status').html('copied password to clipboard');
                                            
                                        } catch (err) {
                                            console.log('Oops, unable to copy');
                                        }

                                        // Remove the selections - NOTE: Should use   
                                        // removeRange(range) when it is supported  
                                        window.getSelection().removeAllRanges();
                                    });
                                    //alert(plaintext);
                                }).catch(function(error) {
                                    // failure
                                });
                            })

                        })
                    })
                })(id)


            }

            var options = {
                valueNames: [ 'sitename']
            };

            var hackerList = new List('hacker-list', options);
        }
        //alert(JSON.stringify(data));
        console.log(data);
    })


})


var reloadBtn = $('.reloadBtn');
reloadBtn.click(function(event) {
    exec();
    $(".glyphicon-refresh").addClass("glyphicon-refresh-animate");
    $("#message").html("I am working my NLP magic ...");
})

var submitLoginBtn = $('#submitlogin');
submitLoginBtn.click(function(event) {
    submitLogin();
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

getCurrentTabUrl(function(url) {
    $('#site').val(url);
})

$("#pgpTextArea").bind('input propertychange', function(argument) {
    // body...
    var privateKey = $("#pgpTextArea").val();
    chrome.storage.local.set({
        'privateKey': privateKey
    }, function() {
        // Notify that we saved.
        $("#pgpTextArea").val("");
        $("#pgpTextArea").attr("placeholder", "private key has been saved");
        console.log('Settings saved');
    });
});

$("#publicKeyTextArea").bind('input propertychange', function(argument) {
    // body...
    var publicKey = $("#publicKeyTextArea").val();
    chrome.storage.local.set({
        'publicKey': publicKey
    }, function() {
        // Notify that we saved.
        $("#publicKeyTextArea").val("");
        $("#publicKeyTextArea").attr("placeholder", "public key has been saved");
        console.log('Settings saved');
    });
});

$("#passphrase").keydown(function(e) {
    var key = e.which;
    if (key == 13) {
        var passphrase = $("#passphrase").val();
        chrome.storage.local.set({
            'passphrase': passphrase
        }, function() {
            // Notify that we saved.
            $("#passphrase").hide();
            $('#status').html('Settings saved');
        });
    }
});
$(".copybtn").hide();
$("#hacker-list").hide();
chrome.storage.local.get(['privateKey', 'passphrase'], function(data) {
        var privateKey = data.privateKey;
        var passphrase = data.passphrase;

        if (privateKey && passphrase) {
            $("#pgpTextArea").hide();
            $("#passphrase").hide()
        }
        // body...
        $("#publicKeyTextArea").hide();
        chrome.identity.getProfileUserInfo(function(data) {
            // alert(JSON.stringify(data));
            submitLogin(data);
        })
    })
