/* global describe, it, beforeEach, assert, APP */

describe('directive [data-bind]', function () {

  beforeEach(function () {
    while( document.body.firstChild ) {
      document.body.removeChild(document.body.firstChild)
    }
  })

  var _APP = APP.createApp()
  _APP.defineFilter('bar', function (text) {
    return text + 'bar'
  })

  it('render error', function () {

    assert.throws( function () {

      _APP.render(document.body, [{
        $: 'div',
        attrs: {
          'data-repeat': ' item in list ',
        },
      }])

    }, TypeError )

  })

  it('render item in list', function () {

    _APP.render(document.body, [{
      $: 'div',
      attrs: {
        'data-repeat': ' item in list ',
      },
      _: '{{ item }}'
    }], {
      data: {
        list: [1,2,3,4,5,6],
      },
    })

    assert.strictEqual(document.body.innerHTML,
      `<!-- : data-repeat : item in list -->` +
      `<div data-repeat=" item in list "><!-- text: {{ item }} -->1</div>` +
      `<div data-repeat=" item in list "><!-- text: {{ item }} -->2</div>` +
      `<div data-repeat=" item in list "><!-- text: {{ item }} -->3</div>` +
      `<div data-repeat=" item in list "><!-- text: {{ item }} -->4</div>` +
      `<div data-repeat=" item in list "><!-- text: {{ item }} -->5</div>` +
      `<div data-repeat=" item in list "><!-- text: {{ item }} -->6</div>` +
      `<!-- / data-repeat -->`)

  })

  it('render $index in list', function () {

    _APP.render(document.body, [{
      $: 'div',
      attrs: {
        'data-repeat': ' item, $index in list ',
      },
      _: '{{ $index }}'
    }], {
      data: {
        list: [1,2,3,4,5,6],
      },
    })

    assert.strictEqual(document.body.innerHTML,
      `<!-- : data-repeat : item, $index in list -->` +
      `<div data-repeat=" item, $index in list "><!-- text: {{ $index }} -->0</div>` +
      `<div data-repeat=" item, $index in list "><!-- text: {{ $index }} -->1</div>` +
      `<div data-repeat=" item, $index in list "><!-- text: {{ $index }} -->2</div>` +
      `<div data-repeat=" item, $index in list "><!-- text: {{ $index }} -->3</div>` +
      `<div data-repeat=" item, $index in list "><!-- text: {{ $index }} -->4</div>` +
      `<div data-repeat=" item, $index in list "><!-- text: {{ $index }} -->5</div>` +
      `<!-- / data-repeat -->`)

  })

  it('render item, ($index) in list', function () {

    var _view = _APP.render(document.body, [{
      $: 'div',
      attrs: {
        'data-repeat': ' item, $index in list ',
      },
      _: '{{ $index }}'
    }], {
      data: {
        list: [1,2,3,4,5,6],
      },
    })

    assert.strictEqual(document.body.innerHTML,
      `<!-- : data-repeat : item, $index in list -->` +
      `<div data-repeat=" item, $index in list "><!-- text: {{ $index }} -->0</div>` +
      `<div data-repeat=" item, $index in list "><!-- text: {{ $index }} -->1</div>` +
      `<div data-repeat=" item, $index in list "><!-- text: {{ $index }} -->2</div>` +
      `<div data-repeat=" item, $index in list "><!-- text: {{ $index }} -->3</div>` +
      `<div data-repeat=" item, $index in list "><!-- text: {{ $index }} -->4</div>` +
      `<div data-repeat=" item, $index in list "><!-- text: {{ $index }} -->5</div>` +
      `<!-- / data-repeat -->`)

    _view.updateData({
      list: [6,5,4,3,2,1],
    })

    assert.strictEqual(document.body.innerHTML,
      `<!-- : data-repeat : item, $index in list -->` +
      `<div data-repeat=" item, $index in list "><!-- text: {{ $index }} -->0</div>` +
      `<div data-repeat=" item, $index in list "><!-- text: {{ $index }} -->1</div>` +
      `<div data-repeat=" item, $index in list "><!-- text: {{ $index }} -->2</div>` +
      `<div data-repeat=" item, $index in list "><!-- text: {{ $index }} -->3</div>` +
      `<div data-repeat=" item, $index in list "><!-- text: {{ $index }} -->4</div>` +
      `<div data-repeat=" item, $index in list "><!-- text: {{ $index }} -->5</div>` +
      `<!-- / data-repeat -->`)

  })

  it('render item, ($index) in list', function () {

    var _view = _APP.render(document.body, [{
      $: 'div',
      attrs: {
        'data-repeat': ' item, $index in list ',
      },
      _: '{{ item }}'
    }], {
      data: {
        list: [1,2,3,4,5,6],
      },
    })

    assert.strictEqual(document.body.innerHTML,
      `<!-- : data-repeat : item, $index in list -->` +
      `<div data-repeat=" item, $index in list "><!-- text: {{ item }} -->1</div>` +
      `<div data-repeat=" item, $index in list "><!-- text: {{ item }} -->2</div>` +
      `<div data-repeat=" item, $index in list "><!-- text: {{ item }} -->3</div>` +
      `<div data-repeat=" item, $index in list "><!-- text: {{ item }} -->4</div>` +
      `<div data-repeat=" item, $index in list "><!-- text: {{ item }} -->5</div>` +
      `<div data-repeat=" item, $index in list "><!-- text: {{ item }} -->6</div>` +
      `<!-- / data-repeat -->`)

    _view.updateData({
      list: [6,5,4,3,2,1],
    })

    assert.strictEqual(document.body.innerHTML,
      `<!-- : data-repeat : item, $index in list -->` +
      `<div data-repeat=" item, $index in list "><!-- text: {{ item }} -->6</div>` +
      `<div data-repeat=" item, $index in list "><!-- text: {{ item }} -->5</div>` +
      `<div data-repeat=" item, $index in list "><!-- text: {{ item }} -->4</div>` +
      `<div data-repeat=" item, $index in list "><!-- text: {{ item }} -->3</div>` +
      `<div data-repeat=" item, $index in list "><!-- text: {{ item }} -->2</div>` +
      `<div data-repeat=" item, $index in list "><!-- text: {{ item }} -->1</div>` +
      `<!-- / data-repeat -->`)

  })

})
