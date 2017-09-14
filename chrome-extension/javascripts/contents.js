function inject(input) {
    
    var username = $('<username></username>');
    console.log(username);
    $(input).parent().parent().prepend(username);
    username.css('position', 'relative');
    $.get(chrome.extension.getURL('javascripts/pop.html'), function(data) {
        var pop = $(data)
        console.log("lodded pop next drawing lock", pop)
            // pop.css('position', 'absolute')
        var img = $(pop[0])
        img.css('position', 'absolute')
        img.css('z-index', '2147483647')
        img.css('max-width', '100px')
        var p = $(pop[1])
        p.css('position', 'fixed')
        img.attr('src', chrome.extension.getURL('javascripts/icon.png'))
        p.hide()
        console.log(img)

        p.click(function() {
            alert("p clicked 2")
            getChanges()
            
            var password = p.find('#password')[0]
            alert(JSON.stringify(password))
            password.select();
            p.toggle()
            

            try {
                // Now that we've selected the anchor text, execute the copy command  
                var successful = document.execCommand('copy');
                var msg = successful ? 'successful' : 'unsuccessful';
                console.log('Copy password command was ' + msg);
                p.find('#message').html('copied password to clipboard');
                alert("copied password")

            } catch (err) {
                console.log('Oops, unable to copy');
                alert("failed select")
            }

        })
        img.click(function() {
            var oldClick = $('body')[0].onclick

            $('body')[0].onclick = function() {
                console.log('clicked body')
                p.show();
                $('body')[0].onclick = function(){
                    p.hide();
                    $('body')[0].onclick = oldClick
                }
            }
            
            $('body').prepend(p)
            p.show()
            var password = p.find('#password')[0]

            var passwordText = customPassworsd()
            p.find('#password').val(passwordText)
            window.getSelection().removeAllRanges();
            // var password = document.querySelector('#password');
            password.select();
            var range = document.createRange();
            range.selectNode(password);
            window.getSelection().addRange(range);

            password.select()

            try {
                // Now that we've selected the anchor text, execute the copy command  
                var successful = document.execCommand('copy');
                var msg = successful ? 'successful' : 'unsuccessful';
                console.log('Copy password command was ' + msg);
                p.find('#message').html('copied password to clipboard');
                alert("copied password")

            } catch (err) {
                console.log('Oops, unable to copy');
            }
        })
        var btn = p.find('button');
        btn.hide();
        btn.click(function() {
                // body...
                fill(customPassworsd)
            })
            // pop.css('left', '110%')
            // pop.css('top', '-10px')
            // pop.css('width', '250px')
        username.append(img)
        // $('body').prepend(p)
    }, 'html')

}

    // chrome.runtime.onMessage.addListener(
    //   function(request, sender, sendResponse) {
    //     if (request.type == "getUrls"){
    //       getUrls(request, sender, sendResponse)
    //     }
    // });

// inject($('input')[0])
// 
// 



setTimeout( function() {
    $('body').prepend($('<p></p>'))
    var passwords = $('input[type=password]')
    console.log("number of password fields detected: ", passwords.length)

    function fill(data) {
        for (var i = passwords.length - 1; i >= 0; i--) {
            $(passwords[i]).val(data)
        }
    }

    if (passwords.length > 0) {
        inject($(passwords[0]), passwords)
            // fill(customPassworsd());
    }
}, 3000)


// var generatePassword = require("password-generator");
var maxLength = 18;
var minLength = 12;
var uppercaseMinCount = 3;
var lowercaseMinCount = 3;
var numberMinCount = 2;
var specialMinCount = 2;
var pronouncable = true

var UPPERCASE_RE = /([A-Z])/g;
var LOWERCASE_RE = /([a-z])/g;
var NUMBER_RE = /([\d])/g;
var SPECIAL_CHAR_RE = /([\?\-])/g;
var NON_REPEATING_CHAR_RE = /([\w\d\?\-])\1{2,}/g;

function isStrongEnough(password) {
    var uc = password.match(UPPERCASE_RE);
    var lc = password.match(LOWERCASE_RE);
    var n = password.match(NUMBER_RE);
    var sc = password.match(SPECIAL_CHAR_RE);
    var nr = password.match(NON_REPEATING_CHAR_RE);
    return password.length >= minLength &&
        !nr &&
        uc && uc.length >= uppercaseMinCount &&
        lc && lc.length >= lowercaseMinCount &&
        n && n.length >= numberMinCount &&
        sc && sc.length >= specialMinCount;
}

function customPassworsd() {
    var password = "";
    var randomLength = Math.floor(Math.random() * (maxLength - minLength)) + minLength;
    // while (!isStrongEnough(password)) {
    password = generatePassword(randomLength, pronouncable, /[\w\d\?\-]/);
    // s}
    password += (Math.pow(10, numberMinCount) + Math.floor(Math.random() * (9 * Math.pow(10, numberMinCount))))
    return password;
}

// console.log(customPassworsd())
// fill(customPassworsd())
console.log($('input'))
    // $('input').val('input')
console.log(chrome.extension.getURL('pop.html'))


function getChanges() {
    chrome.storage.sync.get(
        function(data) {
            maxLength = data.maxLength
            minLength = data.minLength
            uppercaseMinCount = data.uppercaseMinCount
            lowercaseMinCount = data.lowercaseMinCount
            numberMinCount = data.numberMinCount
            specialMinCount = data.specialMinCount
            pronounceable = false
            console.log("got changes: ", data)

            $('#maxLength').val(maxLength)
            $('#minLength').val(minLength)
            $('#uppercaseMinCount').val(uppercaseMinCount)
            $('#lowercaseMinCount').val(lowercaseMinCount)
            $('#numberMinCount').val(numberMinCount)
            $('#specialMinCount').val(specialMinCount)
            $('#pronounceable').val(pronounceable)

            // updateCheckbox()
            // updateCheckbox()
            if(!pronounceable){
                $('#pronounceable').removeAttr('checked')
            }
            alert(data)
        })
}

