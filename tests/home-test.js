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