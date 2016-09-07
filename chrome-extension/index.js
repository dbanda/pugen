// var generatePassword = require("password-generator");
var maxLength = 18;
var minLength = 12;
var uppercaseMinCount = 3;
var lowercaseMinCount = 3;
var numberMinCount = 2;
var specialMinCount = 2;
var pronounceable = true

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
    console.log('password random length: ', randomLength)

    password = generatePassword(randomLength, pronounceable, /[\w\d\?\-]/);
    if (!pronounceable) {
        while (!isStrongEnough(password)) {
            password = generatePassword(randomLength, pronounceable, /[\w\d\?\-]/);
    // password += (Math.pow(10, numberMinCount) + Math.floor(Math.random() * (9 * Math.pow(10, numberMinCount))))
        }
    }
    return password;
}

function getChanges() {
    chrome.storage.sync.get(
        function(data) {
            maxLength = data.maxLength
            minLength = data.minLength
            uppercaseMinCount = data.uppercaseMinCount
            lowercaseMinCount = data.lowercaseMinCount
            numberMinCount = data.numberMinCount
            specialMinCount = data.specialMinCount
            pronounceable = data.pronounceable
            console.log("got changes: ", data)

            $('#maxLength').val(maxLength)
            $('#minLength').val(minLength)
            $('#uppercaseMinCount').val(uppercaseMinCount)
            $('#lowercaseMinCount').val(lowercaseMinCount)
            $('#numberMinCount').val(numberMinCount)
            $('#specialMinCount').val(specialMinCount)
            $('#pronounceable').val(pronounceable)

            updateCheckbox()
            updateCheckbox()
            if(!pronounceable){
                $('#pronounceable').removeAttr('checked')
            }
        })
}

function saveChanges() {
    // Save it using the Chrome extension storage API.
    chrome.storage.sync.set({
            maxLength: maxLength,
            minLength: minLength,
            uppercaseMinCount: uppercaseMinCount,
            lowercaseMinCount: lowercaseMinCount,
            numberMinCount: numberMinCount,
            specialMinCount: specialMinCount,
            pronounceable: pronounceable

        },
        function() {
            // Notify that we saved.
            // message('Settings saved');
            $('#msg').text('Settings saved')
        });
}

$('#btnGen').click(
    function() {
        console.log("generating password")
        maxLength = +$('#maxLength').val() || 18;
        minLength = +$('#minLength').val() || 12;
        uppercaseMinCount = +$('#uppercaseMinCount').val() || 3;
        lowercaseMinCount = +$('#lowercaseMinCount').val() || 3;
        numberMinCount = +$('#numberMinCount').val() || 2;
        specialMinCount = +$('#specialMinCount').val() || 2;
        pronounceable = ($('#pronounceable').val() == 'true')

        console.log("params: ", maxLength, minLength, uppercaseMinCount, lowercaseMinCount, numberMinCount, specialMinCount, pronounceable)
        var pword = customPassworsd()

        password = $('#password')
        password.val(pword)

        var range = document.createRange();
        range.selectNode(password[0]);
        window.getSelection().addRange(range);

        try {
            // Now that we've selected the anchor text, execute the copy command  
            var successful = document.execCommand('copy');
            var msg = successful ? 'successful' : 'unsuccessful';
            console.log('Copy password command was ' + msg);
            $('#msg').text('password copied to clipboard')
            p.find('#message').html('copied password to clipboard');

        } catch (err) {
            console.log('Oops, unable to copy');
        }
    })
$('#btnSav').click(
    function() {
        console.log("saving password")
        maxLength = +$('#maxLength').val() || 18;
        minLength = +$('#minLength').val() || 12;
        uppercaseMinCount = +$('#uppercaseMinCount').val() || 3;
        lowercaseMinCount = +$('#lowercaseMinCount').val() || 3;
        numberMinCount = +$('#numberMinCount').val() || 2;
        specialMinCount = +$('#specialMinCount').val() || 2;
        pronounceable = $('#pronounceable').val() == 'true'
        saveChanges();
    })
function updateCheckbox () {
    
    var p = $('#pronounceable').val() == 'true'
    console.log(p)
    if (p) {
        

        $('#pronounceable').val(false)

        $('#maxLength').attr('disabled', false)
        $('#minLength').attr('disabled', false)
        $('#uppercaseMinCount').attr('disabled', false) 
        $('#lowercaseMinCount').attr('disabled', false) 
        $('#numberMinCount').attr('disabled', false) 
        $('#specialMinCount').attr('disabled', false) 

        console.log('checkbox now false')

        $('#maxLength').css('color', 'black')
        $('#minLength').css('color', 'black')
        $('#uppercaseMinCount').css('color', 'black') 
        $('#lowercaseMinCount').css('color', 'black') 
        $('#numberMinCount').css('color', 'black') 
        $('#specialMinCount').css('color', 'black')

    }else {
        $('#pronounceable').val(true)

        $('#maxLength').attr('disabled', true)
        $('#minLength').attr('disabled', true)
        $('#uppercaseMinCount').attr('disabled', true) 
        $('#lowercaseMinCount').attr('disabled', true) 
        $('#numberMinCount').attr('disabled', true) 
        $('#specialMinCount').attr('disabled', true) 

        $('#maxLength').css('color', 'red')
        $('#minLength').css('color', 'red')
        $('#uppercaseMinCount').css('color', 'red') 
        $('#lowercaseMinCount').css('color', 'red') 
        $('#numberMinCount').css('color', 'red') 
        $('#specialMinCount').css('color', 'red')

        console.log('checkbox now true')
    }
}

getChanges();
$('#pronounceable').change(updateCheckbox)


