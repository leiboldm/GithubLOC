console.log("hi");
function showCatFact() {
	console.log("here");
	var url = "http://catfacts-api.appspot.com/api/facts";
	var xhr = new XMLHttpRequest();
	xhr.open("GET", url);
	xhr.onreadystatechange = function() {
	    if (xhr.readyState == XMLHttpRequest.DONE) {
	        if (xhr.status == 200) {
	        	var factJSON = JSON.parse(xhr.responseText);
	        	document.body.querySelector("#catFact").innerHTML = factJSON["facts"][0];
	            console.log('Response: ' + xhr.responseText );
	        } else {
	            console.log('Error: ' + xhr.statusText );
	            document.body.querySelector("#catFact").innerHTML = 
	            	"Error getting cat fact. Something isn't working right meow.  Try again later";
	        }
	    }
	}
	xhr.send();
}
document.getElementById("catFactButton").addEventListener("click", function() {
	showCatFact();
});