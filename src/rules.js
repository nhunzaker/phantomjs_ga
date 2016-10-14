(function($) {

    // Track clicks on outbound links
    $("body").delegate("a", "click", function(e) {
        if (this.hostname === 'viget.com') return;

        e.preventDefault();

        _gaq.push([
            '_trackEvent', 'Outbound Links', 'Click', this.textContent.trim()
        ]);

        setTimeout(function(url) {
            document.location = url;
        }, 100, this.href);
    });

    // Track clicks on the news items section
    $("a.footer__newsletter__hdr").click(function(e) {
        e.preventDefault();

        _gaq.push(['_trackEvent', 'Newsletter']);

        setTimeout(function(url) {
            document.location = url;
        }, 100, this.href);
    });

    // Tracks links to careers
    $("a[href*=careers]").click(function(e) {
        e.preventDefault();

        _gaq.push(['_trackEvent', 'Careers', 'Click Link']);

        setTimeout(function(url) {
            document.location = url;
        }, 100, this.href);
    });

}(window.jQuery));
