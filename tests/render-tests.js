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

  it('render data', function () {

    APP.render(document.body, [{
      $: 'div', _: 'Hi {{ first_name }}!',
    }], {
      data: {
        first_name: 'John',
      },
    });

    assert.strictEqual(document.body.innerHTML, '<div><!-- text: Hi {{ first_name }}! -->Hi John!</div>');

  });

  it('update rendered data', function () {

    var view = APP.render(document.body, [{
      $: 'div', _: 'Hi {{ first_name }}!',
    }], {
      data: {
        first_name: 'John',
      },
    });

    assert.strictEqual(document.body.innerHTML, '<div><!-- text: Hi {{ first_name }}! -->Hi John!</div>');

    view.updateData({
      first_name: 'Jack',
    });

    assert.strictEqual(document.body.innerHTML, '<div><!-- text: Hi {{ first_name }}! -->Hi Jack!</div>');

  });

});
