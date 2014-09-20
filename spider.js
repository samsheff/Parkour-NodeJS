var elastical = require('elastical');
var client = new elastical.Client("127.0.0.1:9200");

var Tarantula = require('tarantula');
var tarantula = new Tarantula(brain);

var brain = {

    legs: 8,

    shouldVisit: function(uri) {
        return true;
        client.get('web', uri, function (err, doc, res) {
          if (err) {
            console.log(err);
          } else if (!err && doc._id === uri) {
           return false;
          } else {
           return true;
          }; 
        });
    },

    visit: function ($, uri) {
	var elements = $('a').toArray();
	var uris = new Array(elements.length);
	var element;
	var uri;
    var body = $('body').text(),
        title = $('title').text();

    client.index('web', 'page', {
        _id: uri,
        title: title,
        body : body,
        uri: uri            
    }, function (err, res) {
        if (!err) {
          console.log("Page Saved: ", uri);
        } else {
          console.log("Error Saving Page: ", err);
        };
    });

	for (var i = 0; i < elements.length; i++) {
		element = elements[i];
		uri = $(element).attr('href');
		uris[i] = uri;
	}
	return uris;
    }      
};

tarantula.on('request', function (task) {
});

tarantula.on('uris', function (task, newCount) {
	console.log(
		'V:' + tarantula.visited,
		'T:' + tarantula.uris.length,
		'Q:' + (tarantula.uris.length - tarantula.visited),
		'+' + newCount
	);
});

tarantula.on('error', function (task, errorCode, errorMessage) {
	console.error(errorCode, task.uri, 'from', task.parent);
	if (errorCode == 'ERR') {
		console.error(errorMessage);
	}
});

console.log('Crawling… ');
tarantula.start(["http://www.github.com/samsheff"]);
