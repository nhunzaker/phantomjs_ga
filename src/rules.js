(function($) {
    
    // Track clicks on outbound links
    $("body").delegate("a", "click", function(e) {
        
        if (this.hostname === 'viget.com') return;

        e.preventDefault();
        
        _gaq.push([
            '_trackEvent', 'Outbound Links', 'Click', this.text
        ]);

        setTimeout(function(url) {
            document.location = url;
        }, 100, this.href);

    });

    // Track clicks on the news items section
    $(".grouping-homepage-news-items a").click(function(e) {

        e.preventDefault();
        
        var data = $(this).data("track-event").split(",");
        data.unshift('_trackEvent');
        
        _gaq.push(data);

        setTimeout(function(url) {
            document.location = url;
        }, 100, this.href);

    });

    // Tracks links to careers
    $("a[href*='about#careers']").click(function(e) {

        e.preventDefault();

        _gaq.push(['_trackEvent', 'Careers', 'Click Link']);

        setTimeout(function(url) {
            document.location = url;
        }, 100, this.href);

    });
    
}(window.jQuery));