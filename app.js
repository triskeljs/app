
var _ = require('./utils'),
    RenderApp = require('./render'),
    createConText = require('@trisquel/con-text');

function createApp(options) {
  options = options || {};

  var add_directives = _.extend({
        if: true,
        repeat: true,
        on: true,
      }, options.add_directives || {}),
      directive_ns = options.directive_ns || 'data',
      render_options = {};

  var app = new RenderApp(render_options);

  // var scope = {},
  //     scope_listeners = [],
  //     watchScope = function (onData) {
  //       scope_listeners.push(onData);
  //       onData(scope);
  //     };

  // Data envelope for RenderApp

  var data_app = Object.create(app),
      con_text = createConText(data_app);

  // data_app.watchScope = watchScope;
  //
  // data_app.updateScope = function (_scope) {
  //   if( _scope ) scope = _scope;
  //   scope_listeners.forEach(function (listener) {
  //     listener(scope);
  //   });
  // };

  data_app.directive = function (directive, initNode, with_node) {

    app.directive(directive, function () {
      // this.watchScope = watchScope;
      initNode.apply(this, arguments);
    }, with_node);

  };

  // preset directives

  data_app.withNode(function (node) {
    if( typeof node.text === 'string' ) return {
      initNode: function (el) {
        // console.log('node.text', this, arguments);
        var renderText = con_text.interpolate(node.text);

        if( el.parentElement && /{{.*}}/.test(node.text) ) el.parentElement.insertBefore( document.createComment(' text: ' + node.text + ' '), el );

        this.watchScope(function (scope) {
          var text = renderText(scope);
          if( text !== el.textContent ) el.textContent = text;
        });
      }
    };
  });

  if( add_directives.if ) {
    data_app.directive(directive_ns + '-if', function (close_comment, node, _with_node, render_options) {

      // @TODO stuff

      var parent_el = close_comment.parentElement,
          attr_value = this.attr_value,
          start_comment = document.createComment(' : ' + this.attr_key + ' : ' + attr_value + ' ' ),
          if_options = Object.create(render_options),
          assertExpression = con_text.eval(attr_value),
          inserted_node = null;

      parent_el.insertBefore(start_comment, close_comment);

      if_options.insert_before = close_comment;
      // if_options.skip_init = [node];

      this.watchScope(function (scope) {
        if( assertExpression(scope) ) {
          if( inserted_node ) return;

          if_options.insert_before = close_comment;
          if_options.scope = scope;

          var inserted_nodes = data_app.render(parent_el, [node], if_options).inserted_nodes;
          // inserted_node = close_comment.previousElementSibling;
          inserted_node = inserted_nodes[0].el;
        } else {
          if( inserted_node ) parent_el.removeChild(inserted_node);
        }
      });

    }, function (node, attr_key) {
      return {
        replace_by_comment: ' / ' + attr_key + ' '
      };
    });
  }

  if( add_directives.repeat ) {
    data_app.directive(directive_ns + '-repeat', function (close_comment, node, _with_node, render_options) {

      // @TODO stuff

      var parent_el = close_comment.parentElement,
          attr_value = this.attr_value,
          start_comment = document.createComment(' : ' + this.attr_key + ' : ' + attr_value + ' ' ),
          matched_expressions = attr_value.match(/(\w+?) in (.+)/);

      if( !matched_expressions ) throw new Error('data-repeat invalid expression: ' + attr_value );

      var list_key = matched_expressions[1].trim(),
          getList = con_text.eval(matched_expressions[2]);

      // parent_el.replaceChild(comment_end, el);
      parent_el.insertBefore(start_comment, close_comment);

      this.watchScope(function (scope) {
        var list = getList(scope),
            // aux_el = document.createElement('div'),
            remove_el = start_comment.nextSibling;

        while( remove_el !== close_comment ) {
          parent_el.removeChild(remove_el);
          remove_el = start_comment.nextSibling;
        }

        if( !(list instanceof Array) ) throw new Error('expression \'' + matched_expressions[2] + '\' should return an Array');

        list.forEach(function (data_item) {
          var _scope = Object.create(scope),
              repeat_options = Object.create(render_options);

          _scope[list_key] = data_item;

          repeat_options.insert_before = close_comment;
          // repeat_options.skip_init = [node];
          repeat_options.scope = _scope;

          data_app.render(parent_el, [node], repeat_options);
        });
      });

    }, function (node, attr_key) {
      return {
        replace_by_comment: ' / ' + attr_key + ' ',
      };
    });
  }

  if( add_directives.on ) {
    data_app.directive(directive_ns + '-on:\\w+', function (node_el, node, _with_node, render_options) {
      var event_name = this.attr_key.substr(directive_ns.length + 4),
          onTrigger = new Function('scope', 'with(scope) { return (' + this.attr_value + '); };'),
          scope = render_options && render_options.scope || {}; // '-on:'.length === 4

      node_el.addEventListener(event_name, function () {
        onTrigger(scope);
      });

      this.watchScope(function (_scope) {
        scope = _scope;
      });

      // console.log( directive_ns + '-on:\\w+', this, arguments, 'event: ' + event_name );
    });
  }

  data_app.render = function (_parent, _nodes, render_options) {

    render_options = render_options || {};

    var this_app = Object.create(app),
        scope = render_options.data || render_options.scope || {},
        scope_listeners = [],
        watchScope = function (onData) {
          scope_listeners.push(onData);
          onData(scope);
        };

    this_app.watchScope = watchScope;

    // if( render_options && render_options.scope ) scope = render_options.scope;

    var inserted_nodes = app.render.apply(this_app, arguments);

    return {
      updateScope: function (_scope) {
          if( _scope ) scope = _scope;
          scope_listeners.forEach(function (listener) {
            listener(scope);
          });
      },
      inserted_nodes: inserted_nodes,
    };

  };

  return data_app;
}

var app = createApp();

app.createApp = createApp;

module.exports = app;
