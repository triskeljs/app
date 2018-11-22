/* global describe, it, beforeEach, assert, APP */

describe('directive [data-if]', function () {

  beforeEach(function () {
    while( document.body.firstChild ) {
      document.body.removeChild(document.body.firstChild)
    }
  })

  var _APP = APP.createApp()

  it('data-on:click', function (done) {
    var el

    _APP.render(document.body, [{
      $: 'div',
      attrs: {
        'data-on:click': '_runClick(this)',
      },
    }], {
      withNode: {
        initNode: function (_el) {
          el = _el
          setTimeout(function () {
            el.click()
          })
        },
      },
      data: {
        _runClick: function (_el) {
          assert.strictEqual(_el, el)
          done()
        },
      },
    })

  })

  it('data-on:click.then', function (done) {
    var el, clicked

    _APP.render(document.body, [{
      $: 'div',
      attrs: {
        'data-on:click': '_runClick(this)',
      },
    }], {
      withNode: {
        initNode: function (_el) {
          el = _el
          setTimeout(function () {
            el.click()
          })
        },
      },
      data: {
        _runClick: function (_el) {
          if( !clicked ) {
            clicked = true
            return {
              then: function () {
                setTimeout(function () {
                  el.click()
                })
              }
            }
          }
          assert.strictEqual(_el, el)
          done()
        },
      },
    })

  })

})
