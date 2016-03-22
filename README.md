#Creepycrawler - a simple website crawler  
A small console app which will crawl a given domain and output a JSON map of it.  
The program will start with the given URL, and for every internal (= same domain) link found, will create a map for that link, and so on.  
The map, in JSON form, will be written to a file.  
You can use services such as [json editor online](http://jsoneditoronline.org/) to view the resulting map easily.  

##Installation
###Prerequisites
`node` and `npm`
###Installation
Clone this repo, and execute `npm install`

##Running tests
`npm test`

##Running the app
`npm start <domain>`  
i.e `npm start https://www.google.com`  
*Note: depending on the size of the site, this can take a while.

##Debugging
You can uncomment the logging statements in `lib\utils` and `lib\crawler` to get a better understanding on what's going on.  

##About
###How it works
The `Crawler` object uses node's `http` and the `cheerio` library to fetch web pages and crawl them.  
For each internal link it finds, it calls the `CrawlersFactory` to create a new crawler, starting from the given link's address, so that crawling continues recursively.  
the `CrawlersFactory` will create a new instance of the `Crawler` class only if the given link has not been visited before.  

The Logic was separated betwen the `Crawler` (responsibel for actually crawling the page) and the `CrawlersFactory` (checks whether a specific path needs to be crawled, and creates the appropriate crawler for it) to allow for better modularization, and better testability.  
###Why NodeJS
Javascript's asynchronous nature seems to fit very well with a task which can benefit from parallelism, such as this.  
Creating this program in a way that each URL is run in parallel is just natural with JS, and would not have been as straight-forward using other technologies (even C#'s `async-await`).  
Profiling the program as it runs shows significant CPU usage throughout execuion time, which tells us that the program is not idling waiting for responses.  
In addition, the single control thread means that we don't have to do anything special to synchronize shared resources (in our case- the `crawledUrls` and `siteMap` objects)
###What could have been done better  
* Performance - it takes quite a while to crawl through an entire website (~8 minutes for ~1.1k unique pages), I didn't have the time to get to the bottom of this. Timing statements can be found in `utils.request` for anyone who wishes to analyze the source of the latency.  
Also, memory profiling shows a considerable increase in memory consumption as the program runs.   
* Scalability - right now all information is stored in-memory; for huge amounts of data this will not be viable.
* `Crawler` and `CrawlersFactory` should be in separate files; Since they're both dependent on each other, it's not possible for the to `require` each other (would create a circular dependency). Solutions to this exist, again- I just ran out of time...  
* Sorting of the different URLs - currently, URLs are sorted under the first page which has lined to them, which is not necessarily the logical order; It would probably be better to sort them under a common prefix (i.e '/en-us/' -> '/en-us/faq' -> 'en-us/faq/what-is-this' etc..)
* Better error handling
* Better logging (debug logs)