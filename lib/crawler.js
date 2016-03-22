var Q = require('q');
var utils = require('./utils');

function Crawler(baseUrl, url, subsiteMap, factory) {
	this.url = url;
	this.baseUrl = baseUrl;
	this.subsiteMap = subsiteMap;
	this.factory = factory;
}

Crawler.prototype.crawl = function() {
	var me = this;
    return utils.request(this.baseUrl, this.url)
    	.then(function($) {
    		var promises = [];
    		// find all links and create new crawlers for them, as necessary
    		$('a').each(function () {
    			var currUrl = $(this).attr('href');
    			var promise = handleSingleUrl.call(me, currUrl);
				if (promise) promises.push(promise);
    		});
    		// if (promises.length) console.log('now crawling ', promises.length,' URLs of ', me.url);
    		return Q.all(promises);
    	}, function(err) {
    		// console.log('got an error from request: ', err);
    	})
    	.catch(function(err){
    		// console.log('got an error from Q.all thingie:', err);
    	});
};

function handleSingleUrl(currUrl) {
	if (!currUrl || !isInternalUrl.call(this, currUrl)) {
		// console.log(currUrl,' is not internal; discontinuing');
		return;
	}
	
	currUrl = cleanUrl.call(this, currUrl);
	
	var subsite = {};
	var newCrawler = this.factory.createCrawler(currUrl, subsite);
	if (!newCrawler) return; 

	this.subsiteMap[currUrl] = subsite;	// put this url's submap into the paret page's map
	return newCrawler.crawl();
}

function cleanUrl(url) {
	url.replace(this.baseUrl, '');	// convert all URLs to relative
	if (url.indexOf('#') > -1) url = url.substring(0, url.indexOf('#'));
	if (url.indexOf('?') > -1) url = url.substring(0, url.indexOf('?'));
	return url.trim();
}

function isInternalUrl(url) {
	return url.startsWith(this.baseUrl) || utils.isRelativeUrl(url);
}



/*
Factory
TODO: move to a separate file
*/

function CrawlersFactory(baseUrl) {
	this.baseUrl = baseUrl;
	this.crawledUrls = {};
	this.siteMap = {};
}

CrawlersFactory.prototype.createCrawler = function(relativeUrl, subsiteMap) {
	if (this.crawledUrls[relativeUrl]) {
		// console.log('already crawled ', relativeUrl, ', not continuing.');
		return;
	}
	// console.log('creating a new crawler for ', relativeUrl,'; so far crawled ', Object.keys(this.crawledUrls).length, ' pages');
	this.crawledUrls[relativeUrl] = true;

	return new Crawler(this.baseUrl, relativeUrl, subsiteMap, this);	
};


module.exports.CrawlersFactory = CrawlersFactory;
module.exports.Crawler = Crawler;	// actually, this doesn't need to be exported; it's just done so we can test the class