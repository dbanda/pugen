var fs = require('fs');
var request = require("request");
var hyph = fs.readFileSync('./routes/mhyph.UTF-8.txt').toString().split('\n');
var opt;
var svo_array;
var goodwords;
function gen (req, next) {
	svo_array =[];
	goodwords =0;
	var phrase = req.body.phrase;
	var keyword = req.body.keyword;
	var url = req.body.site;
	var max_length = 8;
	var min_length = 5;

	// console.log("generating pword");


	var Tagger = require("./node-stanford-postagger/postagger").Tagger;
	var tagger = new Tagger({
	  port: "9000",
	  host: "localhost"
	});
	
	// console.log('tagger aquired');	

	url = url.replace(/^\w+:\/\//, "").replace(/\/.+$/,"");
	var site = url;
	if(url.split('.').length >= 3){
		site = url.split('.')[1];
	}
	if(url.split('.').length == 2){
		site = url.split('.')[0];
	}
	
	// console.log('running POS tagger');
	tagger.tag(phrase, function(err, resp) {
	  if (err){
	  	return // console.error(err);
	  } 
	  
	  var taggedPhrase = resp[0];
	  var POS = taggedPhrase.split(/[\s_]/);
	  var wordDict ={};
	  wordDict['NN'] = [site,keyword];
	  // wordDict['LS'] = ["."]


	  for (var i = POS.length - 1; i > 0; i--) {
	  	if (i > 0 && POS[i] == POS[i-1] && POS[i] == ','){
	  		i--;
	  		continue;
	  	}
	  	if (wordDict[POS[i]]){
	  		wordDict[POS[i]].push(POS[i-1]);
	  	}else{
	  		wordDict[POS[i]] = [POS[i-1]];
	  	}
	  	i--;
	  	
	  };

	  //SVO
	  var tagset = {
		subjects: ["NN", "NNS","NNPS","PRP"],
		verbs: ["VB", "VBD", "VBG", "VBN", "VBP","VBZ","TO"],
		adverb: ["RB","RBR", "RBS","WRB","RP"],
		number: ["CC"],
		adj: ["JJR", "JJS", "JJ", "WP", "WP$", "PRP$"],
		other: ["CC","DT","EX","FW","IN","UH"],
		punc: ["LS","SYM"]
	  }

	  opt = {
	  	p_rand: req.body.p_rand,
	  	max_length: req.body.max_length || 15,
	  	min_length: req.body.min_length || 8,
	  	digits: req.body.digits,
	  	site: site,
		keyword: keyword,
	  	padding: 0,
	  }

	  // console.log("POS: " + JSON.stringify(POS));
	  // console.log("phrase: " + JSON.stringify(taggedPhrase));
	  // console.log("dict: "+ JSON.stringify(wordDict));
	  // console.log("opt: "+ JSON.stringify(opt));
	  svo(tagset, wordDict,opt,0,function function_name () {
	  	// body...
	  	svo_array = svo_array.sort(function(a,b){
		  	return a.score-b.score;
		  })

	  	// console.log("svo_array: " + JSON.stringify(svo_array));
	  	var svo_phrase = svo_array[svo_array.length-1].pword; 



		  // console.log("svo: " + JSON.stringify(svo_phrase));
		  
		  next(svo_phrase);
	  });


	});


}
function getWord (tagset, wordDict,type) {
	//check 
	for (var i = tagset[type].length - 1; i >= 0; i--) {
		var tag = tagset[type][i]
		if(wordDict[tag]){
			var word = "";
			while (word == ""){
				var i = Math.floor(Math.random() * tagset[type].length);
				var tag = tagset[type][i];
				if(wordDict[tag]){
					var i = Math.floor(Math.random() * wordDict[tag].length)
					word = wordDict[tag][i]
					// // console.log(JSON.stringify(wordDict[tag]) + " :chosed " + word );
				}
			}
			return word
		}
	};
	// // console.log("not subj " + type);
	return "";
}
function svo (tagset, wordDict,opt,attempt,next) {
	// console.log("svo call: "+attempt);
	var subj = getWord(tagset, wordDict,"subjects");
	var verb = getWord(tagset, wordDict,"verbs");
	var obj = getWord(tagset, wordDict,"subjects");
	var other = getWord(tagset, wordDict,"other");
	//var punc = getWord(tagset, wordDict,"punc");
	//var adverb = getWord(tagset, wordDict,"adverb");
	if (Math.random() > 0.5){
		adverb = getWord(tagset, wordDict,"adverb");
	}else{
		adverb = ""
	}

	opt.padding = Math.floor((opt.max_length-opt.min_length)*attempt/100.0);
	var short_prob = attempt/300
	// console.log(short_prob+ " attempt ", attempt);

	var svo_string = swap(shorten(subj,short_prob),opt.p_rand);
	// console.log("------------------------------------------")
	// console.log("start: "+subj+ " : " + svo_string);
	var bag = ["", obj, verb];
	for (var i = bag.length - 1; i >= 0; i--) {
		var punc = "";
		if (rand(0.5)){
			//var sigmoid = (2/(1+Math.exp(100*((i-1)/bag.length-1))));
			var sigmoid  = (2/(1+Math.exp(100*((i-1)/3))))
			p_num = 0.99*Math.max(Math.min(sigmoid,1),0);
			//p_num = 0.99
			// // console.log(p_num + "i: " + sigmoid + " "+rand(p_num));
			if(svo_string.replace(/\D/g, "").length > opt.digits) p_num = 1; 
			if(rand(p_num)) {punc = getWord(tagset, wordDict,"punc");}
			else{punc = Math.floor(Math.random() * (10*opt.digits-10)) + 10	}
		}else{
			punc = ""; 
		}
		if(bag[i] == obj){
			var adj = getWord(tagset, wordDict,"adj");
			if (rand(0.5) && adj)bag[i] = adj
		}
		
		svo_string = svo_string+punc+ swap(shorten(bag[i], short_prob),opt.p_rand);
		// // console.log(svo_string);
	};
	// console.log(svo_string +" attempt "+attempt);
	if (attempt > 600 && svo_string){
		console.log("maximum calls made. returning whatever i have");
		rhymeScore(svo_string,next);
		return
	}

	if (attempt > 650 && svo_string == ""){
		console.log("maximum calls made. returning whatever i have");
		res.json("hmm.. Sorry I can't find an answer");
		return
	}

	if (goodwords >= 10){
		console.log("enough words found!");
		rhymeScore(svo_string,next);
		return
	}

	if (attempt < 200){
		if (subj ==obj ||not_valid(svo_string,opt)) return svo(tagset, wordDict,opt,++attempt,next);
	}else{
		if (not_valid(svo_string,opt)) return svo(tagset, wordDict,opt,++attempt,next);
	}
	// console.log("gen candidate pword: " + svo_string);
	rhymeScore(svo_string,function () {});
	return svo(tagset, wordDict,opt,attempt-10,next)
}
function not_valid (str, opt) {
	// console.log("not_valid call");
	if(str.length < Math.max(opt.max_length-opt.padding,opt.min_length) || str.length > opt.max_length){
		// console.log(str+ "is too short " + Math.max(opt.max_length-opt.padding,opt.min_length) );
		return true;
	} 
	if(str.replace(/\D/g, "").length < opt.digits) return true;
	if(str.replace(/\D/g, "").length > opt.digits+2) return true;
	// console.log("not valid return");
	return false

}

function shorten (word, p) {
	p = Math.max(0,Math.min(p,1));
	//// console.log(word);
	if(word.toLowerCase() == opt.site.toLowerCase()){
		// console.log('shortening url: '+word); 
		if (rand(p)){
			// console.log(p +" short: " +  word.slice(0, (1-p)*word.length)+'.')
			return word.slice(0, Math.max(3, (1-p)*word.length))+'.'
		}
	}
	if(word.toLowerCase() == opt.keyword.toLowerCase()){
		// console.log('shortening keyword: '+word); 
		if (rand(p)){
			// console.log("short: " +  word.slice(0, (1-p)*word.length)+'.')
			return word.slice(0, Math.max(3, (1-p)*word.length))+'.'
		}
		// console.log("weird");
	}

	for (var i = hyph.length - 1; i >= 0; i--) {
		//// console.log("looking up syllables")
		var hyphword = hyph[i].replace(/•/g,"").replace(/\W+/,"");
	 	if ( hyphword.toLowerCase() == word.toLowerCase()){
	 		// console.log("shortend: " + hyph[i] + " : " + word)
	 		var syllables = hyph[i].replace(/[^A-Za-z0-9_•]+/g, "").split("•");
	 		// console.log("syllables: " +JSON.stringify(syllables));
	 		p = 1-p;
	 		var j = Math.floor(p*(syllables.length-1));
	 		
	 		var shortword = "";
	 		for (var i = 0; i <= j; i++) {
	 			shortword = shortword + syllables[i];
	 		};
	 		// console.log("must go to 0 " + p  + " : "+ shortword.length+ ": "+ shortword);
	 		return shortword
	 	}
	 }; 
	 // console.log("returning short word");
	return word;
}
function swap (word, p) {
	for (var i = word.length - 1; i >= 0; i--) {
		for (var j = word.length - 1; j >= 0; j--) {
			if(j>i){
				var before = word.substring(0,i);
				var after = word.substring(j,word.length);

				var subs = word.substring(i,j);
				if (rand(p)) subs.replace(/[oO]/,"0");
				if (rand(p)) subs.replace(/[Aa]/,"4");
				if (rand(p)) subs.replace(/l/,"1");
				if (rand(p)) subs.replace(/a/,"@");
				if (rand(p)) subs.replace(/n/,"/\\/");
				if (rand(p)) subs.replace(/[sS]/,"$");

				if(j-i == 1){
					if (rand(p)){subs = subs.toUpperCase()}
					else{subs = subs.toLowerCase()};
				}	
				word = before + subs + after;		
			}
			
		};
	};
	return word;
}

function rand (p) {
	if (Math.random() < p){
		return true
	}else{
		return false;
	}
}

function rhymeScore(pword,next) {
	
	// console.log("rhyme scoring: " + pword);	
	word = pword.replace(/\d/g,"");
	goodwords++
   	request("http://rhymebrain.com/talk?function=getRhymes&word=" + encodeURIComponent(word),
   	         function(err, response, body) {
   	         	if(err){// console.error(err)
   	         	}
   	           data = JSON.parse(body);
		       // // console.log(" rhymebrain: " + JSON.stringify(data));
		       // console.log(word +" count:"+ data.length);
		       var score = 0;

		       for (var i = data.length - 1; i >= 0; i--) {
		       	score += data[i].freq * data[i].score
		       };
		    
		       // console.log(word +" score: "+ score);
		       bundle = {
		       	pword: pword,
		       	score: score
		       }
		       // console.log("rhymescoring: " + pword);
		       svo_array.push(bundle);
		       next()
	});
   return
};

module.exports = gen;
