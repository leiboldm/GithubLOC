var GithubLOCmain = function(){
	var valid_file_extensions = ["js", "cpp", "cc", "py", "php", "c", "java", "html", "xml", "json",
		"swift", "bash", "sh", "pl", "rb", "cs", "m", "h", "hpp", "aspx", "asp", "lua", "prl", "dart",
		"pxd", "pyx", "yml", "yaml", "gitignore", "md", "mk", "bat", "scala", "win", "r", "css", "sql",
		"vb", "s", "asm", "d", "pas", "dpr", "as", "cfc", "hs", "clj", "cbl", "el", "lisp", "f90"];

	function addOrCreate(dict_in, key_in, value_in) {
		if (key_in in dict_in) {
			dict_in[key_in] += value_in;
		} else {
			dict_in[key_in] = value_in;
		}
	}

	// mapping from file extension to lines of code
	var ext_to_count_map = {};
	var link_to_file_map = {};

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

	function getLocFromLink(link, file_ext) {
		function callback(data) {
			var loc = data.match(/\d+ lines/g);
			if (!loc || loc.length == 0) {
				console.log("File " + url + " too big to display lines of code");
				return;
			}
			var loc = Number(loc[0].replace("lines", ""));
			console.log(link.href + " " + String(loc));
			addOrCreate(ext_to_count_map, file_ext, loc);
			drawLocData();
			// idk why, but this appears to work better than just just setting link.innerHTML
			document.getElementById(link.id).innerHTML = link.title + " <span style='color:#888'>| " + loc + " lines</span>";
			link_to_file_map[link.href] = data;
		}
		httpGetAsync(link.href, callback);
	}

	function stringifyDict(dict) {
		var str_arr = [];
		for (key in dict) {
			str_arr.push(key + "(" + String(dict[key]) + ")");
			str_arr.sort();
		}
		return str_arr.join(",  ");
	}

	var links = document.getElementsByClassName("js-navigation-open");
	var hoverifiedLinks = [];
	Array.prototype.forEach.call(links,
		function(link) {
			hoverifiedLinks.push(new Link(link));
		}
	);

	// parses only the code file out of [htmlStr] by writing it into shadow DOM
	// and querying for the element with the class "file"
	function get_code(htmlStr) {
		var temp_div = document.createElement("div");
		temp_div.style.display = "none";
		var shadow = temp_div.createShadowRoot();
		shadow.innerHTML = htmlStr;
		var file = shadow.querySelector(".file");
		console.log(file);
		var code = file.outerHTML;
		temp_div.remove();
		return code;
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
			getLocFromLink(link, file_ext);
		}
	}

	function create_hover(e, link) {
		var hover_view = document.createElement("div");
		hover_view.id = link.href;
		var link_data = get_code(link_to_file_map[link.href]);
		hover_view.innerHTML = 
			"<div style='background: white; border:1px solid black; border-radius: 5px;'>"
			+ link_data + "</div>";
		hover_view.style.position = "fixed";
		hover_view.style.overflow = "scroll";
		hover_view.style.zIndex = 1000000;
		hover_view.querySelectorAll("td").forEach(function(elt) {
			elt.style.paddingTop = "0px";
			elt.style.paddingBottom = "0px";
			elt.style.lineHeight = "14px";
			elt.style.border = "0px";
		});
		hover_view.querySelector(".file").style.margin = "0px";
		link.appendChild(hover_view);
		position_hover(e, hover_view);
		return hover_view;
	}

	function position_hover(e, elt) {
		var eltHeight = elt.clientHeight;
		var windowHeight = window.innerHeight;
		var top = 0;
		if (eltHeight < windowHeight) {
			if (e.clientY - (eltHeight / 2) > 0) {
				top = e.clientY - eltHeight / 2;
			}
		} else {
			elt.style.height = windowHeight.toString() + "px";
		}
		var rect = elt.parentElement.getBoundingClientRect();
		var left = rect.left + rect.width;
		elt.style.left = left.toString() + "px";
		elt.style.top = top.toString() + "px";
	}

	// class
	function Link(link) {
		var elt = link;
		var hoverElt = null; // set to div on creation
		var hovered = false;
		var hoverHovered = false;
		var scrollY = 0;
		var that = this;

		window.addEventListener("scroll", function(e) {
			if (hoverElt) {
				var curr_top = Number(hoverElt.style.top.replace("px", ""));
				var new_top = curr_top - (window.scrollY - that.scrollY);
				scrollY = window.scrollY;
				hoverElt.style.top = new_top.toString() + "px";
			}
		});

		elt.addEventListener("mousemove", function(e) {
			hovered = true;
			if (!hoverElt) {
				createHoverElt(e);
				scrollY = window.scrollY;
			}
		});
		elt.addEventListener("mouseout", function(e) {
			console.log("mouseout " + elt.href);
			hovered = false;
			removeHoverElt();
		});

		var createHoverElt = function(mouseEvent) {
			console.log("createHover " + elt.href);
			hoverElt = create_hover(mouseEvent, elt);
			hoverElt.addEventListener("mousemove", function(e) {
				hoverHovered = true;
			});
			hoverElt.addEventListener("mouseout", function(e) {
				hoverHovered = false;
				removeHoverElt();
			});
			console.log(hoverElt);
		}

		var removeHoverElt = function() {
			setTimeout(function() {
				if (!hovered && !hoverHovered && hoverElt) {
					hoverElt.remove();
					hoverElt = null;
				}
			}, 100);
		}
	}
};

GithubLOCmain();

// Executed when the page history changes (i.e: user clicks on a link).
// Repeatedly checks the page's progress bar to see if the page is fully loaded
// before executing the counting function
var GithubLOCHistoryChangeCallback = function() {
	var interval = setInterval(function() {
		var p = document.getElementsByClassName("progress");
		if (p && p.length) p = p[0];
		if (p.style.width.indexOf("100%") != -1) {
			clearInterval(interval);
			GithubLOCmain();
		}
	}, 300);
}

window.history.onpushstate = GithubLOCHistoryChangeCallback;
window.onpopstate = GithubLOCHistoryChangeCallback;

// a little bit of nonsense to create an onpushstate event
(function(history){
  var pushState = history.pushState;
  history.pushState = function(state) {
        var ret = pushState.apply(history, arguments);
        if (typeof history.onpushstate == "function") {
          	history.onpushstate({state: state});
        }
        return ret;
  }
})(window.history);