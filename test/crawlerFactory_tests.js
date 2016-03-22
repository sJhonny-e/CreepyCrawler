var sinon = require('sinon');
var chai = require("chai");
var chaiAsPromised = require("chai-as-promised");
 
chai.use(chaiAsPromised);
var expect = chai.expect;

var CrawlersFactory = require('../lib/crawler').CrawlersFactory;
var Crawler = require('../lib/crawler').Crawler;

describe('CrawlerFactory', function() {
	var factory;
	var baseUrl = "http://yomom.com";
	beforeEach(function() {
		factory = new CrawlersFactory(baseUrl);
	});

	describe('#createCrawler()', function() {
		var map = { kuku: 'maluju'};
		it('should create a crawler for the given path', function() {
			var crawler = factory.createCrawler('path', map);
			expect(crawler).to.be.an.instanceof(Crawler);
			expect(crawler.baseUrl).to.eql(baseUrl);
			expect(crawler.url).to.eql('path');
			expect(crawler.subsiteMap).to.eql(map);
		});

		it('should mark the given path as crawled', function() {
			factory.createCrawler('path', map);
			
			expect(factory.crawledUrls).to.eql({path : true});
		});

		it('should not create a crawler for a crawled path', function() {
			factory.crawledUrls['path'] = true;
			expect(factory.createCrawler('path')).to.not.be.ok;
		});
	});
});