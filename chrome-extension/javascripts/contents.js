function inject(input) {
    
    var username = $('<username></username>');
    console.log(username);
    $(input).parent().parent().prepend(username);
    username.css('position', 'relative');
    $.get(chrome.extension.getURL('javascripts/pop.html'), function(data) {
        var pop = $(data)
        console.log(pop)
            // pop.css('position', 'absolute')
        var img = $(pop[0])
        img.css('position', 'absolute')
        var p = $(pop[1])
        p.css('position', 'fixed')
        img.attr('src', chrome.extension.getURL('javascripts/icon.png'))
        p.hide()
        console.log(img)

        p.click(function() {
            p.toggle()

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


            p.show()
            var password = p.find('#password')[0]

            var passwordText = customPassworsd()
            p.find('#password').val(passwordText)
            fill(passwordText)
            window.getSelection().removeAllRanges();
            // var password = document.querySelector('#password');
            password.select();
            var range = document.createRange();
            range.selectNode(password);
            window.getSelection().addRange(range);

            try {
                // Now that we've selected the anchor text, execute the copy command  
                var successful = document.execCommand('copy');
                var msg = successful ? 'successful' : 'unsuccessful';
                console.log('Copy password command was ' + msg);
                p.find('#message').html('copied password to clipboard');

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
        $('body').prepend(p)
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

var passwords = $('input[type=password]')

function fill(data) {
    for (var i = passwords.length - 1; i >= 0; i--) {
        $(passwords[i]).val(data)
    }
}

if (passwords.length > 0) {
    inject($(passwords[0]), passwords)
        // fill(customPassworsd());
}

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
