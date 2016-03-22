var sinon = require('sinon');
var chai = require("chai");
var chaiAsPromised = require("chai-as-promised");
 
chai.use(chaiAsPromised);
var expect = chai.expect;

var Crawler = require('../lib/crawler').Crawler;

var nock = require('nock');

describe('Crawler', function() {
	var crawler;
	var baseUrl = 'http://www.something.com';
	var path = '/kuku';
	var map = {};
	var factory = { createCrawler: function() {}};
	var crawlerSpy1 = { crawl: function() {}};
	var crawlerSpy2 = { crawl: function() {}};
	
	var httpRequest;
	var page = '<kuku href="shouldnt do anything">hello</kuku>' +
			'<a href="/this">zxc</a>' +
			'<a href="/and/that">zzz</a>' +
			'<a href="http://www.anotherDomain.com/and/that">zzz</a>';
	
	describe('#crawl()', function() {
		beforeEach(function() {
			httpRequest = nock(baseUrl)
				.get(path)
				.reply(200, page);

			sinon.spy(crawlerSpy1, 'crawl');
			sinon.spy(crawlerSpy2, 'crawl');

			sinon.stub(factory, 'createCrawler');
			factory.createCrawler.withArgs('/this').returns(crawlerSpy1);
			factory.createCrawler.withArgs('/and/that').returns(crawlerSpy2);
			
			crawler = new Crawler(baseUrl, path, map, factory);
		});

		afterEach(function() {	
			factory.createCrawler.restore();
			crawlerSpy1.crawl.restore();
			crawlerSpy2.crawl.restore();
		});

		it('should call http to get the current page', function() {
			crawler.crawl();
			expect(httpRequest.isDone()).to.be.ok;
		});

		it('should call the factory to create a new crawler for every internal link found', function() {
			return crawler.crawl()
				.then(function() {
					expect(factory.createCrawler.calledTwice).to.be.ok;
					expect(factory.createCrawler.calledWith('/this'));
					expect(factory.createCrawler.calledWith('/and/that'));
			});
		});

		it('should add a key to the map object for every new internal link found', function() {
			return crawler.crawl()
				.then(function() {
					expect(Object.keys(map).length).to.eql(2);
					expect(map['/this']).to.be.ok;
					expect(map['/and/that']).to.be.ok;
			});
		});

		it('should activate the returned crawlers', function() {
			return crawler.crawl()
				.then(function() {
					expect(crawlerSpy1.crawl.calledOnce).to.be.ok;
					expect(crawlerSpy2.crawl.calledOnce).to.be.ok;
			});
		});
	});
});	