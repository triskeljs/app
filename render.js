
var _ = require('./utils'),
    renderNodes = require('@triskel/render');

module.exports = RenderApp;

function RenderApp (_options) {
  var options = Object.create(_options || {});

  this.with_node_pipe = [];

  this.options = options;
}

RenderApp.prototype.render = function (parent_el, nodes, _options) {
  var app = this,
      render_options = _.extend( Object.create( app.options || {} ), _options || {} ),
      with_node_pipe = app.with_node_pipe;

  parent_el = parent_el || document.createElement('div');

  render_options.withNode = function (node) {
    var with_node = {},
        init_pipe = [],
        i, n, result_with_node;

    for( i = 0, n = with_node_pipe.length ; i < n ; i++ ) {
      result_with_node = with_node_pipe[i].call(app, node, with_node);
      if( result_with_node ) {
        if( result_with_node.initNode ) {
          if( typeof result_with_node.initNode !== 'function' ) {
            console.error('initNode should be a function', result_with_node.initNode ); // eslint-disable-line
            throw new Error('initNode should be a function');
          }
          init_pipe.push(result_with_node.initNode);
          // delete result_with_node.initNode; // will be overriden if init_pipe.length
        }

        with_node = _.extend( with_node, result_with_node );

        if( result_with_node.stop_pipe || result_with_node.replace_by_comment ) break;
      }
    }

    if( init_pipe.length ) {
      with_node.initNode = function () {
        for( var i = 0, n = init_pipe.length; i < n ; i++ ) {
          // init_pipe[i].call(node_el, node_el, node, with_node);
          init_pipe[i].apply(app, arguments);
        }
      };
    }

    return with_node;
  };

  return renderNodes(parent_el, nodes, render_options);

  // return parent.children;
};

RenderApp.prototype.withNode = function (withNode) {
  this.with_node_pipe.push(withNode);

  return this;
};

RenderApp.prototype.component = function (tag_name, options) {
  // Allowing multiple initNode
  // if( this.components[tag_name] ) throw new Error('Attempting to define component twice: ' + tag_name);
  //
  // this.components = this.components ||{};
  // this.components[tag_name] = initNode;
  var render_app = this;

  options = options || {};

  this.withNode(function (node) {

    if( node.$ === tag_name ) return _.extend( options.withNode && options.withNode(node) || {}, {
      initNode: options.controller && options.template ? function (node_el) {
        var _this = this, _args = arguments;

        if( typeof options.template === 'string' ) {
          node_el.innerHTML = options.template;

          return setTimeout(function () {
            options.controller.apply(_this, _args);
          });
        }

        render_app.render(node_el, options.template);
        options.controller.apply(_this, _args);

      } : ( options.controller || function (node_el) {
        if( typeof options.template === 'string' ) node_el.innerHTML = options.template;
        else render_app.render(node_el, options.template);
      }),
    });

  });

  return this;
};

RenderApp.prototype.directive = function (directive, initNode, withNode) {

  if( directive instanceof RegExp ) directive = directive.source;
  directive = '^' + directive.replace(/^\^|\$$/, '') + '$';

  var matchRE = new RegExp(directive),
      matchAttr = function (attr) {
        return matchRE.test(attr);
      };

  this.withNode(function (node, with_node) {
    var _attrs = node.attrs || {},
        attr_key = _attrs && _.find( Object.keys(_attrs), matchAttr),
        this_app = Object.create(this);

    if( node._directives_used && node._directives_used[attr_key] ) return;

    this_app.attr_key = attr_key;
    this_app.attr_value = _attrs[attr_key];

    if( attr_key ) {

      with_node = _.extend( withNode && withNode(node, attr_key) || {}, {
        initNode: function (node_el, _node, with_node, render_options) {
          _node = Object.create(_node);
          if( !_node._directives_used ) _node._directives_used = {};
          _node._directives_used[attr_key] = true;
          // initNode.apply(this_app, arguments);
          initNode.call(this_app, node_el, _node, with_node, Object.create(render_options || {}) );
        },
      });

      return with_node;

    }
  });

  return this;
};
