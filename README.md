
# @triskel/app

Compact, reliable and customizable HTML minifier.

[![ᴋɪʟᴛ ᴊs](https://jesus.germade.es/assets/images/badge-kiltjs.svg)](https://github.com/kiltjs)
[![npm](https://img.shields.io/npm/v/@triskel/app.svg?maxAge=300)](https://www.npmjs.com/package/@triskel/app)
[![Build Status](https://travis-ci.org/triskeljs/app.svg?branch=master)](https://travis-ci.org/triskeljs/app)
[![Coverage Status](https://coveralls.io/repos/github/triskeljs/app/badge.svg)](https://coveralls.io/github/triskeljs/app)
[![dependencies Status](https://david-dm.org/triskeljs/app/status.svg?maxAge=300)](https://david-dm.org/triskeljs/app)
[![GitHub license](https://img.shields.io/badge/license-MIT-blue.svg)](LICENSE)


### Installation

``` sh
npm install @triskel/app --save-dev
```

### RenderApp

`RenderApp` creates an instance with a context for rendering

``` js
var APP = require('@triskel/app');
```

### TriskelApp instance:

> Methods

- APP.`render`( parent_node, Triskel Structured Nodes ([TSList]) )


- APP.`defineFilter`(filter_name `String`, filter `Function`)
  - `filter_name`, String name for identify filter
  - `filterFunction`(input_var /* usually a string */)


- APP.`eval`(expression `String`)
  returns a function that and evaluates data with passed expression

  ``` js
  APP.defineFilter('uppercase', function (text) {
    return text.toUpperCase();
  });

  var renderName = APP.eval(' person.first_name | uppercase ');

  renderName({ person: { first_name: 'John' } });
  // results: 'JOHN'
  ```

- APP.`withNode`(withNode `Function`)
  passed `withNode`(node `TSList Node`)

  TSList Node Types:

    - Node Element: `{ $: 'input', attrs: { required: '' } }`

    - Text Node: Strings in [TSList] are converted to `{ text: 'Lorem ipsum...' }`

    - Comment Node: `{ comments: 'This is a JS comment' }`

  Returned Object determines what to do with node to be rendered

  ``` js
  with_node Object {
    `replace_by_comment`: <String|false|undefined>,
    `initNode`: <Function (node_el HTMLElement, node Object, render_options Object, with_node Object)>
  }
  ```

  ``` js
  APP.withNode(function (node) {
    if( node.$ === 'div' ) return {
      replace_by_comment: 'replaced div: ' + node._,
    };
  });

  '<div>lorem ipsum...</div><span>foobar</span>'

  // resulting DOM:
  // <!--replaced div: lorem ipsum...--><span>foobar</span>
  ```

  ``` js
  APP.withNode(function (node) {
    if( node.attrs && node.attrs['data-click'] === 'log' ) return {
      initNode: function (button_el, node /* TSList Node */, render_options /* options passed to APP.render */) {
        button_el.addEventListener('click', function (e) {
          console.log('button clicked', button_el);
          });
      },
    };
  });

  // previous code will log in console every click for nodes with attribute [data-click=log]:
  // <div><button data-click="log"></button></div>
  ```

- APP.`component`(tag_name `String`, options `Object` or initNode `Function`)
  - options `Object`
    ``` js
    {
      'template': <TSlist>,
      `controller`: initNode `Function`,
      'data': <Object>, // Data to be rendered
    }
    ```

  > Component example

  ``` js
  APP.component('my-div', {
    template: [
      { $: 'ul', _: [
        { $: 'li', _: 'First name: {{ person.first_name }}' },
        { $: 'li', _: 'Last name: {{ person.last_name }}' },
        { $: 'li', _: 'Age: {{ person.birthday | ageDiff }}' },
      ] }
    ],
    data: {
      person: {
        first_name: 'John',
        last_name: 'Smith',
        birthday: '1980-01-01'
      }
    },
  });
  ```

- APP.`directive`(attribute_match `String`, initNode `Function`, withNode `Function`)
  - `attribute_match`: string received will be evaluated as /^attribute_match$/
  - withNode: Special withNode that receives:
    `this.attr_key` and `this.attr_value`

> Directive example

``` js
APP.directive('if-mobile', function (node_el) {

  if( this.attr_value === 'log' ) {
    console.log('node has being rendered')
  }

}, function withNode (node) {
  console.log(this.attr_key); // results: 'if-mobile'
  console.log(this.attr_value); // results: <value of attribute>

  if( matchMedia('(max-width: 768px)').matches ) return {
    replace_by_comment: 'if-mobile: ' + this.attr_value,
  };
});
```

[TSList]: https://triskeljs.github.io/#triskel-structured-list-tslist
