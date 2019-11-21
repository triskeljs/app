/* global describe, it, beforeEach, assert, APP */

describe('rendering HTML', function () {

  beforeEach(function () {
    while( document.body.firstChild ) {
      document.body.removeChild(document.body.firstChild)
    }
  })

  it('render error', function () {

    assert.throws(function () {
      APP.render(document.body, [{}])
    }, TypeError)

    assert.throws(function () {
      APP.render(document.body, [{ foo: 'bar' }])
    }, TypeError)

    assert.throws(function () {
      APP.render(document.body, [{ $: 'foo' }], {
        withNode: function () {
          return {
            initNode: 123
          }
        }
      })
    }, TypeError)

  })

  it('render options.withNode', function () {

    var with_node_called = false

    APP.render(document.body, [{
      $: 'div', _: 'Hi {{ first_name }}!',
    }], {
      withNode: function () {
        with_node_called = true
      },
    })

    assert.strictEqual(with_node_called, true)

  })

  it('render data', function () {

    APP.render(document.body, [{
      $: 'div', _: 'Hi {{ first_name }}!',
    }], {
      data: {
        first_name: 'John',
      },
    })

    assert.strictEqual(document.body.innerHTML, '<div><!-- text: Hi {{ first_name }}! -->Hi John!</div>')

  })

  it('render data getter', function () {

    var _data = {
      first_name: 'John',
    }

    var _view = APP.render(document.body, [{
      $: 'div', _: 'Hi {{ first_name }}!',
    }], {
      data: _data,
    })

    assert.strictEqual(document.body.innerHTML, '<div><!-- text: Hi {{ first_name }}! -->Hi John!</div>')
    assert.strictEqual(_data, _view.data)

  })

  it('render data setter', function () {

    var _view = APP.render(document.body, [{
      $: 'div', _: 'Hi {{ first_name }}!',
    }], {
      data: {
        first_name: 'John',
      },
    })

    assert.strictEqual(document.body.innerHTML, '<div><!-- text: Hi {{ first_name }}! -->Hi John!</div>')

    _view.data = {
      first_name: 'Johnny',
    }

    assert.strictEqual(document.body.innerHTML, '<div><!-- text: Hi {{ first_name }}! -->Hi Johnny!</div>')

  })

  it('render data (special_html_char)', function () {

    APP.render(document.body, [{
      $: 'div', _: 'Hi&nbsp;{{ first_name }}!',
    }], {
      data: {
        first_name: 'John',
      },
    })

    assert.strictEqual(document.body.innerHTML, '<div><!-- text: Hi&nbsp;{{ first_name }}! -->Hi&nbsp;John!</div>')

  })

  it('update rendered data', function () {

    var view = APP.render(document.body, [{
      $: 'div', _: 'Hi {{ first_name }}!',
    }], {
      data: {
        first_name: 'John',
      },
    })

    assert.strictEqual(document.body.innerHTML, '<div><!-- text: Hi {{ first_name }}! -->Hi John!</div>')

    view.updateData()
    
    assert.strictEqual(document.body.innerHTML, '<div><!-- text: Hi {{ first_name }}! -->Hi John!</div>')
    
    view.updateData({
      first_name: 'Jack',
    })

    assert.strictEqual(document.body.innerHTML, '<div><!-- text: Hi {{ first_name }}! -->Hi Jack!</div>')

  })

})

it('render outside dom', function () {

  var render_ctrl = APP.render(null, [{
    $: 'v-div',
  }])

  assert.strictEqual(render_ctrl.inserted_nodes.length, 1)
  assert.strictEqual(render_ctrl.inserted_nodes[0].el.nodeName, 'V-DIV')

})
