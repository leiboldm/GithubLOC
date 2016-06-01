(function(){
	var valid_file_extensions = ["js", "cpp", "cc", "py", "php", "c", "java", "html", "xml", "json",
		"swift", "bash", "sh", "pl", "rb", "cs", "m", "h", "hpp", "aspx", "asp", "lua", "prl", "dart"];

	function addOrCreate(dict_in, key_in, value_in) {
		if (key_in in dict_in) {
			dict_in[key_in] += value_in;
		} else {
			dict_in[key_in] = value_in;
		}
	}

	// mapping from file extension to lines of code
	var ext_to_count_map = {};

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

	function getLocFromUrl(url, file_ext) {
		function callback(data) {
			var loc = data.match(/\d+ lines/g);
			if (loc.length == 0) {
				console.log("Fuck");
				return;
			}
			var loc = Number(loc[0].replace("lines", ""));
			console.log(url + " " + String(loc));
			addOrCreate(ext_to_count_map, file_ext, loc);
			drawLocData();
		}
		httpGetAsync(url, callback);
	}

	function stringifyDict(dict) {
		var str_arr = [];
		for (key in dict) {
			str_arr.push(key + "(" + String(dict[key]) + ")");
			str_arr.sort();
		}
		return str_arr.join(",  ");
	}

	var display_id = "GithubLOC-loc-display";
	function drawLocData() {
		var commit_tease = document.getElementsByClassName("commit-tease")[0];
		var locDisplay = document.getElementById(display_id);
		if (!locDisplay) {
			var locDisplay = document.createElement("div");
			locDisplay.id = display_id;
			commit_tease.appendChild(locDisplay);
		}

		locDisplay.innerHTML = "Lines of code: " + stringifyDict(ext_to_count_map);

	}

	var file_links = document.getElementsByClassName("js-navigation-open");
	for (var i = 0; i < file_links.length; i++) {
		var link = file_links[i];
		var title = link.title;
		if (title === "" || typeof(title) !== typeof("str")) continue;
		var file_ext = title.split(".");
		file_ext = file_ext[file_ext.length - 1];
		if (valid_file_extensions.indexOf(file_ext) != -1) {
			var url = link.href;
			getLocFromUrl(url, file_ext);
		}
	}
})();
