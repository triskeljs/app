/* global describe, it, beforeEach, assert, APP */

describe('directive [data-if]', function () {

  beforeEach(function () {
    while( document.body.firstChild ) {
      document.body.removeChild(document.body.firstChild)
    }
  })

  var _APP = APP.createApp()
  _APP.defineFilter('bar', function (text) {
    return text + 'bar'
  })

  it('undefined var', function () {

    _APP.render(document.body, [{
      $: 'div',
      attrs: {
        'data-if': ' foo ',
      },
    }])

    assert.strictEqual(document.body.innerHTML, '<!-- : data-if :  foo  --><!-- / data-if -->')

  })

  it('foo = true', function () {

    _APP.render(document.body, [{
      $: 'div',
      attrs: {
        'data-if': ' foo ',
      },
    }], {
      data: {
        foo: true
      },
    })

    assert.strictEqual(document.body.innerHTML, '<!-- : data-if :  foo  --><div data-if=" foo "></div><!-- / data-if -->')

  })

  it('foo = false', function () {

    _APP.render(document.body, [{
      $: 'div',
      attrs: {
        'data-if': ' foo ',
      },
    }], {
      data: {
        foo: false
      },
    })

    assert.strictEqual(document.body.innerHTML, '<!-- : data-if :  foo  --><!-- / data-if -->')

  })

  it('foo = false then foo = true', function () {

    var _view = _APP.render(document.body, [{
      $: 'div',
      attrs: {
        'data-if': ' foo ',
      },
    }], {
      data: {
        foo: false
      },
    })

    assert.strictEqual(document.body.innerHTML, '<!-- : data-if :  foo  --><!-- / data-if -->', 'foo = false')

    _view.updateData({
      foo: true
    })

    assert.strictEqual(document.body.innerHTML, '<!-- : data-if :  foo  --><div data-if=" foo "></div><!-- / data-if -->', 'foo = true')

  })

  it('foo = false then foo = false', function () {

    var _view = _APP.render(document.body, [{
      $: 'div',
      attrs: {
        'data-if': ' foo ',
      },
    }], {
      data: {
        foo: false
      },
    })

    assert.strictEqual(document.body.innerHTML, '<!-- : data-if :  foo  --><!-- / data-if -->', 'foo = false')

    _view.updateData({
      foo: false
    })

    assert.strictEqual(document.body.innerHTML, '<!-- : data-if :  foo  --><!-- / data-if -->', 'foo = false')

  })

  it('foo = true then foo = false', function () {

    var _view = _APP.render(document.body, [{
      $: 'div',
      attrs: {
        'data-if': ' foo ',
      },
    }], {
      data: {
        foo: true
      },
    })

    assert.strictEqual(document.body.innerHTML, '<!-- : data-if :  foo  --><div data-if=" foo "></div><!-- / data-if -->', 'foo = true')
    
    _view.updateData({
      foo: false
    })
    
    assert.strictEqual(document.body.innerHTML, '<!-- : data-if :  foo  --><!-- / data-if -->', 'foo = false')

  })

  it('foo = true then foo = true', function () {

    var _view = _APP.render(document.body, [{
      $: 'div',
      attrs: {
        'data-if': ' foo ',
      },
    }], {
      data: {
        foo: true
      },
    })

    assert.strictEqual(document.body.innerHTML, '<!-- : data-if :  foo  --><div data-if=" foo "></div><!-- / data-if -->', 'foo = true')
    
    _view.updateData({
      foo: true
    })
    
    assert.strictEqual(document.body.innerHTML, '<!-- : data-if :  foo  --><div data-if=" foo "></div><!-- / data-if -->', 'foo = true')

  })

  it('foo = true then foo = false then foo = true', function () {

    var _view = _APP.render(document.body, [{
      $: 'div',
      attrs: {
        'data-if': ' foo ',
      },
    }], {
      data: {
        foo: true
      },
    })

    assert.strictEqual(document.body.innerHTML, '<!-- : data-if :  foo  --><div data-if=" foo "></div><!-- / data-if -->', 'foo = true')

    _view.updateData({
      foo: false
    })
    
    assert.strictEqual(document.body.innerHTML, '<!-- : data-if :  foo  --><!-- / data-if -->', 'foo = false')
    
    _view.updateData({
      foo: true
    })
    
    assert.strictEqual(document.body.innerHTML, '<!-- : data-if :  foo  --><div data-if=" foo "></div><!-- / data-if -->', 'foo = true')

  })

  it('foo.bar = undefined', function () {

    _APP.render(document.body, [{
      $: 'div',
      attrs: {
        'data-if': ' foo.bar ',
      },
    }], {
      data: {
        foo: {
        },
      },
    })

    assert.strictEqual(document.body.innerHTML, '<!-- : data-if :  foo.bar  --><!-- / data-if -->')

  })

  it('foo.bar = false', function () {

    _APP.render(document.body, [{
      $: 'div',
      attrs: {
        'data-if': ' foo.bar ',
      },
    }], {
      data: {
        foo: {
          bar: false,
        },
      },
    })

    assert.strictEqual(document.body.innerHTML, '<!-- : data-if :  foo.bar  --><!-- / data-if -->')

  })

  it('foo.bar = true', function () {

    _APP.render(document.body, [{
      $: 'div',
      attrs: {
        'data-if': ' foo.bar ',
      },
    }], {
      data: {
        foo: {
          bar: true
        }
      },
    })

    assert.strictEqual(document.body.innerHTML, '<!-- : data-if :  foo.bar  --><div data-if=" foo.bar "></div><!-- / data-if -->')

  })

})
