# Testing Google Analytics with PhantomJS

Ensuring that information is being tracked by Google Analytics can be one of the most frustrating parts of integrating the tool into to a website. For my most recent engagement we needed to provide analytics support for a wide variety of sites, each with different environments. There was a constant worry that some rules would collide with others or not fire correctly given the context of other scripts on the page. 

Navigating page-by-page to ensure stability can provide solid verification that code working properly. However manually performing this task is time consuming and daunting when a nontrivial amount of pages is added to the list.

Queue [PhantomJS](http://phantomjs.org/), a headless WebKit browser designed for page automation and browser-based JavaScript testing. When coupled with [SinonJS](http://sinonjs.org/) to spy on Google Analytics, and the [Mocha](http://visionmedia.github.com/mocha/) testing framework, the difference between testing single pages and twenty at a time became marginal. 

Moving past purely anecdotal evidence, I'd like to go over some of the technologies we used and provide a basic tutorial of our methodology.

### What is a headless browser?

PhantomJS is a headless browser, which means that it runs without a graphic interface. It can navigate as if it were Google Chrome or Safari without actually having to open a window. This is a great boon to JavaScript testing as it provides a browser-based environment with a simple API to automate page navigation and event handling.

``` javascript
page.open("http://google.com");

page.onError = function(e) {
	console.log("Something went horribly wrong!", e);
};
```

### SinonJS

[SinonJS](http://sinonjs.org/) is a testing library that provides spies to Javascript testing. Spies can track activity surrounding targeted bits of code. They help to verify that the correct methods are being called and, if so, whether or not they behaved as expected. 

In our tests we'll trigger an event that activates Google Analytics and use a spy to see if the correct method was fired. We'll also use them to confirm that the correct parameters were pushed up to Google Analytics, which will provide some additional comfort that cross-pollution between events is not occuring.

``` javascript
var spy = sinon.spy(_gaq, "push");

_gaq.push(['_trackEvent', 'Header Links', 'Click');

console.log(spy.called) // => true
```

### Mocha

Mocha is a JavaScript testing framework authored by the ever proliferate [TJ Holowaychuck](http://tjholowaychuk.com/) for [Node.js](http://nodejs.org/) and browser based testing. Its syntax is similar to [Jasmine](http://pivotal.github.com/jasmine/) in a lot of ways, and in some cases the two are often mistaken for one another. I am particularly fond of Mocha for its flexibility and it is generally the tool I use for orchestrating testing on my projects. 

It also gives us some great syntax for use in our tests:

``` javascript

describe("Sample test", function() {

	it ("should perform a sanity check", function() {
		assert(true, "You are insane");
	});

});

```

Later in this article we'll delve deeper into Mocha, creating a custom reporter for which will help us to communicate the results of our tests back to PhantomJS. 

## The code

For clarity, I have hosted the final result of this article on [Github](https://github.com/nhunzaker/phantomjs_ga). I am working with the following folder setup:

phantomjs_ga
 - test-runner.js 
 - lib
 		- mocha.js
    - sinon.js
 - src
    - reporter.js
    - rules.js
 - tests
    - home-test.js


### Building the sample rules

The first task we need to complete is to add some events to the page that we want to track. For simplicity, we'll add a basic rule to the body of the document:

**src/rules.js**
``` javascript
(function() {
    
    $("body").click(function() {
        _gaq.push(['_trackEvent', 'Click Body']);
    });

}());
```

Pretty straightforward. Whenever the body is clicked, push the event to Google Analytics.


### Creating the tests

Now that we know what we want to track, let's build a test that evaluates if we were successful:

**tests/home-test.js**
``` javascript
describe("Viget Home Test", function() {

    var spy;
		var assert = sinon.assert;

    beforeEach(function() {
        spy && spy.restore();
        spy = sinon.spy(window._gaq, "push");
    });  
    
    it ("tracks clicks on the body", function() {

        $("body").click();

        assert.calledOnce(spy);
        assert.calledWith(spy, ['_trackEvent', 'Click Body']);

    });
    
});
```

In the code above, we generate a suite of tests for the Viget homepage. Here's what's going on:

Line 3: An empty variable for our spy. At the beginning of each test this spy will be regenerated, so we need to provide a variable with this level of scope here.

Line 4: The assertion library used for testing the results. This is set of functions provided by SinonJS.

Lines 6-9: Before each test a spy is generated to monitor activity around `_gaq.push()`. This spy is reset for each test so that it has a fresh copy to work with.

Line 11: Add the test, providing a label that describes the expected behavior.

Lines 13-16: JavaScript is used to click the body tag and then asserts are run to evaluate the activity around the `push` method of `_gaq`. A check is also made to confirm it was called with the correct methods.


### The Custom Reporter

In order for the output from the tests to be seen in the command line, a method of communicating between the browser and PhantomJS must be created. We'll use this custom reporter to evaluate the results of our tests:

**src/reporter.js**
```
(function() {

    var color = Mocha.reporters.Base.color;

    function log () {

        var args = Array.apply(null, arguments);

        if (window.callPhantom) {
            window.callPhantom({ message: args.join(" ") });
        } else {
            console.log( args.join(" ") );
        }

    }
    
    var Reporter = function(runner){
        
        Mocha.reporters.Base.call(this, runner);

        var out = [];
        
        runner.on('start', function() {
            out.push([ "Testing",  window.location.href, "\n"]);
        });

        runner.on('suite', function(suite) {
            out.push([suite.title]);
        });

        runner.on("pass", function(test) {
            out.push([ color('checkmark', '  ✓ '), test.title, "\n" ]);
        });
        
        runner.on('fail', function(test, err) {
            out.push([ color('fail', '  × '), color('fail', test.title), ":\n    ", err ,"\n"]);
        });
        
        runner.on("end", function() {
            
            while (out.length) {
                log.apply(null, out.shift());
            }
            
            if (window.callPhantom) {
                window.callPhantom({ exit: true });
            }
            
        });

    };
    
    mocha.setup({
        ui: 'bdd',
        ignoreLeaks: true,
        reporter: Reporter
    });

}());
```

There is a lot of library specific logic occurring within this file, so I will be brief with its description. The important take away from this script is that it monitors events that occur when Mocha conducts testing. When it has completed, the reporter calls out to PhantomJS (within the log function on line 5) and PhantomJS then logs out the results.


### Building the PhantomJS test runner

If you don't have PhantomJS installed, there's an [excellent guide](http://phantomjs.org/download.html) on their website. You'll want to make sure that you have the latest version (1.7 at the publication of this article) as it provides a new method of communicating between the page and PhantomJS that we use in our reporter.

Personally, I installed it using [Homebrew](http://mxcl.github.com/homebrew/):

`brew install phantomjs`

The following code will be used to run our tests:

**test-runner.js**
``` javascript
var page = require("webpage").create();

page.onCallback = function(data) {
    data.message && console.log(data.message);
    data.exit && phantom.exit();
};

page.open("http://www.viget.com", function(status) {
    
    if (status !== 'success') {
        console.error("Failed to open", page.frameUrl);
        phantom.exit();
    }

    page.injectJs("lib/mocha.js");
    page.injectJs("lib/sinon.js");

    page.injectJs("src/reporter.js");
    page.injectJs("src/rules.js");

    page.injectJs("tests/home-test.js");
    
    page.evaluate(function() {
        
        // Undefine GA
	      window._gat = undefined;
        window._gaq = [['_setAccount', 'UA-00000000-1']];
        
        // Run tests
        window.mocha.run();
    });
    

    page.render("captures/viget.com.png");

});

```

This is a lot to take in all at once. Thinking in terms of regular browser use, here's what happens:

line 1: Create a new tab. 

line 3: Navigate to http://www.viget.com

lines 5-8: Could we successfully connect? If not, notify the user and exit PhantomJS

lines 10-16: Add the JavaScript that runs our tests to the page

lines 18-26: `page.evaluate` lets us run JavaScript on the current page. Here we unset the current Google Analytics setup so that we don't accidentally push our results. Once this has all been configured, we run our tests on line 26.

lines 30-33: PhantomJS 1.7 provides the ability to send messages from the client back to PhantomJS. This activity can be seen within the `log` function of the custom test reporter. Here we define a function to handle the event that is fired when this function is called.


### Give it a spin

With all of this complete, testing can begin. The following command can be run to test the rules we've created:

`phantomjs sample-test-runner.js`

You should see the following output:

```
Testing http://viget.com/ 

Viget Home Test
  ✓  tracks clicks on the body 
```

## Take aways from PhantomJS testing

Testing Google Analytics in this fashion provides a faster method of verifying correct information is being tracked on a page. The code in this article was simplified for brevity, however JavaScript remains the central language in all aspects of it. These methodologies provide exciting opportunities for the advancing the quality of tests for JavaScript applications. Extrapolating out this code to other forms of JavaScript testing should not be difficult, and it provides an example of how far JavaScript development has come in the past few years.