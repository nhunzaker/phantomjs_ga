describe("Viget Home Test", function() {

    var spy;
    var assert = sinon.assert;

    beforeEach(function() {
        spy = sinon.spy(window._gaq, "push");
    });

    afterEach(function() {
        spy.restore();
    });

    it ("tracks outbound links", function() {

        var link = $("a[href='http://www.pointlesscorp.com/']");

        link.click();

        assert.called(spy);
        assert.calledWith(spy, [
            '_trackEvent', 'Outbound Links', 'Click', 'Pointless Corp.'
        ]);

    });

    it ("tracks clicks on the news items section", function() {

        var link = $(".grouping-homepage-news-items a").first();

        var data = link.data("track-event").split(",");
        data.unshift("_trackEvent");

        link.click();

        assert.called(spy);
        assert.calledWith(spy, data);

    });

    it ("tracks clicks on careers links", function() {

        var link = $("[a[href*='about#careers']").first();

        link.click();

        assert.called(spy);
        assert.calledWith(spy, [
            '_trackEvent', 'Careers', 'Click Link'
        ]);

    });

});
