(function() {

    var color = Mocha.reporters.Base.color;

    function log() {

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
