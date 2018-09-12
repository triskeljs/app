
module.exports = function (APP, TEXT, directive_ns) {
  APP.directive(directive_ns + '-on:\\w+', function (node_el, node, render_options, _with_node) {
    var event_name = this.attr_key.substr(directive_ns.length + 4),
        onTrigger = new Function('data', 'with(data) { ' + this.attr_value + ' };'),
        data = render_options && render_options.data || {}; // '-on:'.length === 4

    node_el.addEventListener(event_name, function () {
      onTrigger.call(node_el, data);
    });

    this.watchData(function (_data) {
      data = _data;
    });
  });
};
