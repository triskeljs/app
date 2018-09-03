
var _ = require('./utils'),
    RenderApp = require('./render'),
    createConText = require('@triskel/con-text');

var addDirectiveIf = require('./directives/if.js'),
    addDirectiveRepeat= require('./directives/repeat.js'),
    addDirectiveOn= require('./directives/on.js'),
    addDirectiveBind= require('./directives/bind.js'),
    addDirectiveClass = require('./directives/class.js');

function createApp(options) {
  options = options || {};

  var add_directives = _.extend({
        if: true,
        repeat: true,
        bind: true,
        on: true,
        'class': true,
      }, options.add_directives || {}),
      directive_ns = options.directive_ns || 'data',
      render_options = {};

  var app = new RenderApp(render_options);

  // Data envelope for RenderApp

  var APP = Object.create(app),
      TEXT = createConText(APP);

  APP.directive = function (directive, initNode, with_node) {

    app.directive(directive, function () {
      // this.watchData = watchData;
      initNode.apply(this, arguments);
    }, with_node);

  };

  // preset directives

  APP.withNode(function (node) {
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

  if( add_directives.if ) addDirectiveIf(APP, TEXT, directive_ns);
  if( add_directives.repeat ) addDirectiveRepeat(APP, TEXT, directive_ns);
  if( add_directives.bind ) addDirectiveBind(APP, TEXT, directive_ns);
  if( add_directives.on ) addDirectiveOn(APP, TEXT, directive_ns);
  if( add_directives['class'] ) addDirectiveClass(APP, TEXT, directive_ns);

  APP.render = function (_parent, _nodes, render_options) {

    render_options = Object.create(render_options || {});

    var this_app = Object.create(app),
        data = render_options.data || {},
        data_listeners = [],
        watchData = function (onData) {
          data_listeners.push(onData);
          onData(data);
        };

    this_app.watchData = watchData;

    var inserted_nodes = app.render.apply(this_app, arguments);

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

  return APP;
}

var app = createApp();

app.createApp = createApp;

module.exports = app;
