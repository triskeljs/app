/* global describe, it, beforeEach, assert, APP */

describe('APP.component', function () {

  beforeEach(function () {
    while( document.body.firstChild ) {
      document.body.removeChild(document.body.firstChild)
    }
  })

  it('basic render', function () {

    var _APP = APP.createApp()

    _APP.component('my-div', function (el) {
      assert.strictEqual(el.nodeName, 'MY-DIV')
    })

    _APP.render(document.body, [{
      $: 'my-div'
    }], {
      data: {
        first_name: 'John',
      },
    })

    assert.strictEqual(document.body.innerHTML, '<my-div></my-div>')

    _APP.render(document.body, [{
      $: 'my-div', _: 'Hi {{ first_name }}!',
    }], {
      data: {
        first_name: 'John',
      },
    })

    assert.strictEqual(document.body.innerHTML, '<my-div><!-- text: Hi {{ first_name }}! -->Hi John!</my-div>')

  })

  it('rendering template', function () {

    var _APP = APP.createApp()

    _APP.component('my-div', {
      template: ['Hi {{ first_name }}!'],
    })

    _APP.render(document.body, [{
      $: 'my-div'
    }], {
      data: {
        first_name: 'John',
      },
    })

    assert.strictEqual(document.body.innerHTML, '<my-div><!-- text: Hi {{ first_name }}! -->Hi John!</my-div>')

  })

  it('rendering template overrides', function () {

    var _APP = APP.createApp()

    _APP.component('my-div', {
      template: ['Hi {{ last_name }}!'],
    })

    _APP.render(document.body, [{
      $: 'my-div', _: 'Hi {{ first_name }}!'
    }], {
      data: {
        first_name: 'John',
        last_name: 'Smith',
      },
    })

    assert.strictEqual(document.body.innerHTML, '<my-div><!-- text: Hi {{ last_name }}! -->Hi Smith!</my-div>')

  })

  it('rendering template with controller', function () {

    var _APP = APP.createApp()

    _APP.component('my-div', {
      template: ['Hi {{ first_name }}!'],
      controller: function (el) {
        assert.strictEqual(el.nodeName, 'MY-DIV')
      },
    })

    _APP.render(document.body, [{
      $: 'my-div'
    }], {
      data: {
        first_name: 'John',
      },
    })

    assert.strictEqual(document.body.innerHTML, '<my-div><!-- text: Hi {{ first_name }}! -->Hi John!</my-div>')

  })

  it('rendering template overrides with controller', function () {

    var _APP = APP.createApp()

    _APP.component('my-div', {
      template: ['Hi {{ last_name }}!'],
      controller: function (el) {
        assert.strictEqual(el.nodeName, 'MY-DIV')
      },
    })

    _APP.render(document.body, [{
      $: 'my-div', _: 'Hi {{ first_name }}!'
    }], {
      data: {
        first_name: 'John',
        last_name: 'Smith',
      },
    })

    assert.strictEqual(document.body.innerHTML, '<my-div><!-- text: Hi {{ last_name }}! -->Hi Smith!</my-div>')

  })

})
