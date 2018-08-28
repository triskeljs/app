
var _ = require('./utils'),
    RenderApp = require('./render'),
    createConText = require('@triskel/con-text'),
    triggerEvent = 'CustomEvent' in window ? function (node, event_name, options) {
      var event = new CustomEvent(event_name, options);
      element.dispatchEvent(event);
      return event;
    } : function (node, event_name, options) {
      var event = document.createEvent('HTMLEvents');
      if( options && 'detail' in options ) event.detail = options.detail;
      event.initEvent(eventName, true, true);
      element.dispatchEvent(event);
      return event;
    };

var addDirectiveIf = require('./directives/if.js'),
    addDirectiveRepeat= require('./directives/repeat.js'),
    addDirectiveOn= require('./directives/on.js'),
    addDirectiveClass = require('./directives/class.js');

function createApp(options) {
  options = options || {};

  var add_directives = _.extend({
        if: true,
        repeat: true,
        on: true,
        'class': true,
      }, options.add_directives || {}),
      directive_ns = options.directive_ns || 'data',
      render_options = {};

  var app = new RenderApp(render_options);

  // Data envelope for RenderApp

  var data_app = Object.create(app),
      TEXT = createConText(data_app);

  data_app.directive = function (directive, initNode, with_node) {

    app.directive(directive, function () {
      // this.watchData = watchData;
      initNode.apply(this, arguments);
    }, with_node);

  };

  // preset directives

  data_app.withNode(function (node) {
    if( typeof node.text === 'string' ) return {
      initNode: function (el) {
        // console.log('node.text', this, arguments);
        var renderText = TEXT.interpolate(node.text);

        if( el.parentElement && /{{.*}}/.test(node.text) ) el.parentElement.insertBefore( document.createComment(' text: ' + node.text + ' '), el );

        this.watchData(function (data) {
          var text = renderText(data);
          if( text !== el.textContent ) el.textContent = text;
        });
      }
    };
  });

  if( add_directives.if ) addDirectiveIf(data_app, TEXT, directive_ns);
  if( add_directives.repeat ) addDirectiveRepeat(data_app, TEXT, directive_ns);
  if( add_directives.on ) addDirectiveOn(data_app, TEXT, directive_ns);
  if( add_directives['class'] ) addDirectiveClass(data_app, TEXT, directive_ns);

  data_app.render = function (_parent, _nodes, render_options) {

    render_options = render_options || {};

    var this_app = Object.create(app),
        data = render_options.data || {},
        data_listeners = [],
        watchData = function (onData) {
          data_listeners.push(onData);
          onData(data);
        };

    this_app.watchData = watchData;

    var inserted_nodes = app.render.apply(this_app, arguments);

    if( render_options.detached_events && !_parent.__listening_detached__ ) (function () {

      // preventing trigger several times
      _parent.__listening_detached__ = true;

      new MutationObserver(function(mutations) {

        mutations.forEach(function(mutation) {
          [].forEach.call(mutation.removedNodes, function (node) {
            triggerEvent(node, 'detached');
          });
        });

      }).observe(document.body, { childList: true, subtree: true });

    })();

    return {
      updateData: function (_data) {
          if( _data ) data = _data;
          data_listeners.forEach(function (listener) {
            listener(data);
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
