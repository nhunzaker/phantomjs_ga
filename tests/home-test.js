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
      $("a.twitter").click();

      assert.called(spy);
      assert.calledWith(spy, [
          '_trackEvent', 'Outbound Links', 'Click', 'Twitter'
      ]);
    });

    it ("tracks clicks on the newsletter", function() {
      $(".footer__newsletter__hdr").click()

        assert.called(spy);
        assert.calledWith(spy, ['_trackEvent', 'Newsletter']);
    });

    it ("tracks clicks on careers links", function() {
        $("a[href*=careers]").click()

        assert.called(spy);
        assert.calledWith(spy, [
            '_trackEvent', 'Careers', 'Click Link'
        ]);
    });

});
