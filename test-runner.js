var page = require("webpage").create();

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

});

page.onCallback = function(data) {
    data.message && console.log(data.message);
    data.exit && phantom.exit();
};
