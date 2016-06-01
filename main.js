(function(){
	console.log("This codes runs");

	var valid_file_extensions = ["js", "cpp", "cc", "py", "php", "c", "java", "html", "xml", "json",
		"swift", "bash", "sh", "pl", "rb", "cs", "m", "h", "hpp", "aspx", "asp", "lua", "prl", "dart"];

	function addOrCreate(dict_in, key_in, value_in) {
		if (key_in in dict_in) {
			dict_in[key_in] += value_in;
		} else {
			dict_in[key_in] = value_in;
		}
	}

	function getCount(str, find) {
		return str.split(find).length - 1;
	}

	function httpGetAsync(theUrl, callback)
	{
	    var xmlHttp = new XMLHttpRequest();
	    xmlHttp.onreadystatechange = function() { 
	        if (xmlHttp.readyState == 4 && xmlHttp.status == 200) {
	            callback(xmlHttp.responseText);
	        }
	    }
	    xmlHttp.open("GET", theUrl, true); // true for asynchronous 
	    xmlHttp.send(null);
	}

	// mapping from file extension to lines of code
	var ext_to_count_map = {};

	function getLocFromUrl(url, file_ext) {
		function callback(data) {
			var loc = data.match(/\d+ lines/g);
			if (loc.length > 1) console.log("Fuck");
			var loc = Number(loc[0].replace("lines", ""));
			addOrCreate(ext_to_count_map, file_ext, loc);
			console.log(ext_to_count_map);
		}
		httpGetAsync(url, callback);
	}

	var file_links = document.getElementsByClassName("js-navigation-open");
	console.log("file_links length = " + String(file_links.length));
	for (var i = 0; i < file_links.length; i++) {
		var link = file_links[i];
		var title = link.title;
		console.log(link, title);
		if (title === "" || typeof(title) !== typeof("str")) continue;
		var file_ext = title.split(".");
		file_ext = file_ext[file_ext.length - 1];
		if (valid_file_extensions.indexOf(file_ext) != -1) {
			var url = link.href;
			console.log(url, file_ext);
			getLocFromUrl(url, file_ext);
		}
	}
})();
