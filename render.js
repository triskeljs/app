
var _ = require('./utils'),
    renderNodes = require('@triskel/render');

module.exports = RenderApp;

function RenderApp (_options) {
  var options = Object.create(_options || {});

  this.with_node_pipe = [];

  this.options = options;
}

function _isInList(list, item) {
  for( var i = list.length - 1; i >= 0 ; i-- ) {
    if( item === list[i] ) return true;
  }
  return false;
}

RenderApp.prototype.render = function (parent_el, nodes, _options) {
  var app = this,
      render_options = _.extend( Object.create( app.options || {} ), _options || {} ),
      with_node_pipe = app.with_node_pipe,
      detach_queue = [],
      _processDetachQueue = function (detached_nodes) {
        for( var i = detach_queue.length - 1 ; i >= 0 ; i-- ) {
          if( _isInList(detach_queue[i].el) ) {
            detach_queue[i].listener.call(detach_queue[i].el);
            detach_queue.splice(i, 1);
          }
        }
        if( detach_queue.length === 0 ) mutation_observer.disconnect();
      },
      mutation_observer = 'MutationObserver' in window ? new MutationObserver(function(mutations) {

        mutations.forEach(function(mutation) {
          _processDetachQueue(mutation.removedNodes);
        });

      }) : { observe: function () {}, disconnect: function () {} };

  function _onDetach (listener) {
    if( !detach_queue.length ) mutation_observer.observe(parent_el, { childList: true, subtree: true });
    detach_queue.push({ el: this, listener: listener });
  }

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
      with_node.initNode = function (node_el) {
        var _this = Object.create(app);
        _this.onDetach = _onDetach.bind(node_el);

        for( var i = 0, n = init_pipe.length; i < n ; i++ ) {
          // init_pipe[i].call(node_el, node_el, node, with_node);
          init_pipe[i].apply(_this, arguments);
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

  if( options === undefined ) options = {};

  if( options instanceof Function ) options = { controller: options };
  else if( !options || typeof options !== 'object' ) {
    throw new TypeError('options should be a plain object (or a controller function)');
  }

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


function _autoWithNode (withNode) {
  if( withNode instanceof Function ) return withNode;
  if( withNode && typeof withNode === 'object' ) return function () {
    return withNode;
  };
}

RenderApp.prototype.directive = function (directive, initNode, withNode) {

  if( directive instanceof RegExp ) directive = directive.source;
  directive = '^' + directive.replace(/^\^|\$$/, '') + '$';

  var matchRE = new RegExp(directive),
      matchAttr = function (attr) {
        return matchRE.test(attr);
      },
      _withNode = _autoWithNode(withNode);

  this.withNode(function (node, with_node) {
    var _attrs = node.attrs || {},
        attr_key = _attrs && _.find( Object.keys(_attrs), matchAttr),
        this_app = Object.create(this);

    if( node._directives_used && node._directives_used[attr_key] ) return;

    this_app.attr_key = attr_key;
    this_app.attr_value = _attrs[attr_key];

    if( attr_key ) {

      with_node = _.extend( _withNode && _withNode(node, attr_key) || {}, {
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
