/* global describe, it, beforeEach, assert, APP */

describe('rendering HTML', function () {

  beforeEach(function () {
    while( document.body.firstChild ) {
      document.body.removeChild(document.body.firstChild);
    }
  });

  it('render error', function () {

    assert.throws(function () {
      APP.render(document.body, [{}]);
    }, TypeError);

  });

});
