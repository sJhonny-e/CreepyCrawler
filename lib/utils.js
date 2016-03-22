var http = require('http');
var https = require('https');
var cheerio = require('cheerio');
var Q = require('q');

function request(baseUrl, url) {
    // console.time(url + '_request');	// measure request performance

    var client = baseUrl.indexOf('https://') > -1 ? https : http;
    // baseUrl = baseUrl.replace('http://www.','').replace('https://www.', '');

	var deferred = Q.defer();
	
	// console.log('going for ', baseUrl + url);
	var req = client.get(baseUrl + url, function(response) {
        var body = '';
        response.on('data', function(d) {
            body += d;
        });
        response.on('end', function() {
        	// uncomment the below to measure performance
            // console.timeEnd(url + '_request');
            // console.time(url + '_cheerio');
            var x = cheerio.load(body);
            // console.timeEnd(url + '_cheerio');
            deferred.resolve(x);
        });
    });

    req.on('error', function(e) {
    	console.error('ERROR!! for url ',baseUrl + url,' the error is:', e);
    	deferred.reject(e);	// TODO: actually handle error
    });

    return deferred.promise;
}

function isRelativeUrl(url) {
	return !url.startsWith('http://') && !url.startsWith('https://');
}

module.exports = {
	isRelativeUrl: isRelativeUrl,
	request: request
};