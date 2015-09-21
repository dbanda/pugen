var fs = require('fs');
var hyph = fs.readFileSync('./routes/mhyph.UTF-8.txt').toString().split('\n');
var opt;
function gen (req, next) {
	var phrase = req.body.phrase;
	var keyword = req.body.keyword;
	var url = req.body.site;
	var max_length = 8;
	var min_length = 5;

	var words = keyword.split();

	var Tagger = require("./node-stanford-postagger/postagger").Tagger;
	var tagger = new Tagger({
	  port: "9000",
	  host: "localhost"
	});

	url = url.replace(/^\w+:\/\//, "").replace(/\/.+$/,"");
	var site = url;
	if(url.split('.').length >= 3){
		site = url.split('.')[1];
	}
	if(url.split('.').length == 2){
		site = url.split('.')[0];
	}
	

	tagger.tag(phrase, function(err, resp) {
	  if (err){
	  	return console.error(err);
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
	  	max_length: req.body.max_length,
	  	min_length: req.body.min_length,
	  	digits: req.body.digits,
	  	site: site,
	  	padding: 0,
	  }

	  console.log("POS: " + JSON.stringify(POS));
	  console.log("phrase: " + JSON.stringify(taggedPhrase));
	  console.log("dict: "+ JSON.stringify(wordDict));
	  console.log("opt: "+ JSON.stringify(opt));
	  var svo_phrase = svo(tagset, wordDict,opt,0);


	  console.log("svo: " + JSON.stringify(svo_phrase));
	  
	  next(svo_phrase);
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
					// console.log(JSON.stringify(wordDict[tag]) + " :chosed " + word );
				}
			}
			return word
		}
	};
	// console.log("not subj " + type);
	return "";
}
function svo (tagset, wordDict,opt,attempt) {
	var subj = getWord(tagset, wordDict,"subjects");
	var verb = getWord(tagset, wordDict,"verbs");
	var obj = getWord(tagset, wordDict,"subjects");
	var other = getWord(tagset, wordDict,"other");
	//var punc = getWord(tagset, wordDict,"punc");
	//var adverb = getWord(tagset, wordDict,"adverb");
	if (Math.random() > 0.5){
		adverb = getWord(tagset, wordDict,"adverb");
	}else{
		adverb = "";
	}

	opt.padding = Math.floor((opt.max_length-opt.min_length)*attempt/100.0);
	var short_prob = (0.4 + attempt/100.0) % 3.0;
	//console.log(short_prob+ " attempt ", attempt);

	var svo_string = swap(shorten(subj,short_prob),opt.p_rand);
	// console.log("------------------------------------------")
	// console.log("start: "+subj+ " : " + svo_string);
	var bag = ["", obj, verb];
	for (var i = bag.length - 1; i >= 0; i--) {
		var punc = "";
		if (rand(0.5)){
			var sigmoid = (2/(1+Math.exp(100*(i/bag.length-1))))-1;
			p_num = 0.99*Math.max(sigmoid,1);
			p_num = 0.99
			if(svo_string.replace(/\D/g, "").length > opt.digits) p_num = 1; 
			if(rand(p_num)) {punc = getWord(tagset, wordDict,"punc");}
			else{punc = Math.floor(Math.random() * (10*opt.digits-10)) + 10}
		}else{
			punc = ""; 
		}
		if(bag[i] == obj){
			var adj = getWord(tagset, wordDict,"adj");
			if (rand(0.5) && adj)bag[i] = adj
		}
		
		svo_string = svo_string+punc+ swap(shorten(bag[i], short_prob),opt.p_rand);
		// console.log(svo_string);
	};
	if (attempt > 2000)return svo_string;
	if (subj ==obj ||not_valid(svo_string,opt)) return svo(tagset, wordDict,opt,attempt+1);
	return svo_string;
}
function not_valid (str, opt) {
	if(str.length < Math.max(opt.max_length-opt.padding,opt.min_length) || str.length > opt.max_length) return true;
	if(str.replace(/\D/g, "").length < opt.digits) return true;
	if(str.replace(/\D/g, "").length > opt.digits+2) return true;

}

function shorten (word, p) {
	p = Math.max(p,1);
	//console.log(word);
	if(word.toLowerCase() == opt.site.toLowerCase()){
		//console.log("must not be null "+p + opt.site.toLowerCase());
		if (rand(p)){
			//console.log("short: " +  word.slice(0, (1-p)*word.length)+'.')
			return word.slice(0, Math.max(3, (1-p)*word.length))+'.'
		}
	}
	for (var i = hyph.length - 1; i >= 0; i--) {
		var hyphword = hyph[i].replace(/•/g,"").replace(/\W+/,"");
	 	if ( hyphword.toLowerCase() == word.toLowerCase()){
	 		//console.log("shortend: " + hyph[i] + " : " + word)
	 		var syllables = hyph[i].replace(/[^A-Za-z0-9_•]+/g, "").split("•");
	 		//console.log(JSON.stringify(syllables));
	 		p = 1-p;
	 		var j = Math.floor(p*syllables.length);
	 		
	 		var shortword = "";
	 		for (var i = 0; i <= j; i++) {
	 			shortword = shortword + syllables[i];
	 		};
	 		// console.log("must go to 0 " + p  + " : "+ shortword.length+ ": "+ shortword);
	 		return shortword
	 	}
	 }; 
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
module.exports = gen;
