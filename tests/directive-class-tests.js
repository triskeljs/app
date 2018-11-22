/* global describe, it, beforeEach, assert, APP */

describe('directive [data-if]', function () {

  beforeEach(function () {
    while( document.body.firstChild ) {
      document.body.removeChild(document.body.firstChild)
    }
  })

  var _APP = APP.createApp()

  it('errors', function () {

    assert.throws(function () {
      _APP.render(document.body, [{
        $: 'div',
        attrs: {
          'data-class': `[123]`,
        },
      }])
    }, TypeError)

  })

  it('class null', function () {

    _APP.render(document.body, [{
      $: 'div',
      attrs: {
        'data-class': `null`,
      },
    }])

    assert.strictEqual(document.body.innerHTML, '<div data-class="null"></div>')

  })

  it('class [null]', function () {

    _APP.render(document.body, [{
      $: 'div',
      attrs: {
        'data-class': `[null]`,
      },
    }])

    assert.strictEqual(document.body.innerHTML, '<div data-class="[null]"></div>')

  })

  it('class _foo-bar', function () {

    _APP.render(document.body, [{
      $: 'div',
      attrs: {
        'data-class': `{ _foo: '-bar' }`,
      },
    }])

    assert.strictEqual(document.body.innerHTML, '<div data-class="{ _foo: \'-bar\' }" class="_foo _foo-bar"></div>')

  })

  it('class _foo-bar _bar-foo', function () {

    _APP.render(document.body, [{
      $: 'div',
      attrs: {
        'data-class': `{ _foo: '-bar', _bar: '-foo' }`,
      },
    }])

    assert.strictEqual(document.body.innerHTML, '<div data-class="{ _foo: \'-bar\', _bar: \'-foo\' }" class="_foo _foo-bar _bar _bar-foo"></div>')

  })

  it('class _foo _bar', function () {

    _APP.render(document.body, [{
      $: 'div',
      attrs: {
        'data-class': `['_foo', '_bar']`,
      },
    }])

    assert.strictEqual(document.body.innerHTML, '<div data-class="[\'_foo\', \'_bar\']" class="_foo _bar"></div>')

  })

  it('class _foo [_bar]', function () {

    _APP.render(document.body, [{
      $: 'div',
      attrs: {
        'data-class': `['_foo', ['_bar']]`,
      },
    }])

    assert.strictEqual(document.body.innerHTML, '<div data-class="[\'_foo\', [\'_bar\']]" class="_foo _bar"></div>')

  })

  it('class _foo _foo-bar _bar', function () {

    _APP.render(document.body, [{
      $: 'div',
      attrs: {
        'data-class': `[{ _foo: '-bar' }, '_bar']`,
      },
    }])

    assert.strictEqual(document.body.innerHTML, '<div data-class="[{ _foo: \'-bar\' }, \'_bar\']" class="_foo _foo-bar _bar"></div>')

  })

})
