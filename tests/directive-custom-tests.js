/* global describe, it, beforeEach, assert, APP */

describe('directive (custom)', function () {

  beforeEach(function () {
    while( document.body.firstChild ) {
      document.body.removeChild(document.body.firstChild)
    }
  })

  var _APP = APP.createApp()

  it('directive matched', function () {

    var directive_rendered = false

    _APP.directive('foo-bar', function () {
      directive_rendered = true
    })

    _APP.render(document.body, [{
      $: 'div',
      attrs: {
        'foo-bar': ' foo ',
      },
    }])

    assert.strictEqual( directive_rendered, true )

  })

  it('directive RegExp', function () {

    var directive_rendered = false

    _APP.directive(/foo-bar/, function () {
      directive_rendered = true
    })

    _APP.render(document.body, [{
      $: 'div',
      attrs: {
        'foo-bar': ' foo ',
      },
    }])

    assert.strictEqual( directive_rendered, true )

  })

  it('directive replace_by_comment', function () {

    var directive_rendered = false

    _APP.directive(/foo-bar/, function () {
      directive_rendered = true
    }, {
      replace_by_comment: ' foobar '
    })

    _APP.render(document.body, [{
      $: 'div',
      attrs: {
        'foo-bar': ' foo ',
      },
    }])

    assert.strictEqual( directive_rendered, true )
    assert.strictEqual( document.body.innerHTML, '<!-- foobar -->' )

  })

})
