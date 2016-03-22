var CrawlersFactory = require('./crawler.js').CrawlersFactory;
var fs = require('fs');

var baseUrl = process.argv[2];
if (!baseUrl) {
	console.log('usage: node main.js <startUrl>');
	return;
}

if (!baseUrl.startsWith('http://') && !baseUrl.startsWith('https://')) {
	baseUrl = 'http://' + baseUrl;
}
var factory = new CrawlersFactory(baseUrl);

var siteMap = {};
var crawler = factory.createCrawler('/', siteMap);
crawler.crawl()
	.then(function(res) {
		var fileName = baseUrl.replace('http://', '')
			.replace('https://', '').replace('/','_');
		return fs.writeFile(fileName + '-siteMap.json', JSON.stringify(siteMap));
	}, function(err) {
		console.log('got the error handler in main', err);
	})
	.catch(function(err) {
		console.log('caught exception in main', err);
	});