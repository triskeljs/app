
module.exports = function (APP, TEXT, directive_ns) {
  APP.directive(directive_ns + '-on:\\w+', function (node_el, node, render_options, _with_node) {
    var _this = this,
        event_name = this.attr_key.substr(directive_ns.length + 4),
        onTrigger = new Function('data', 'with(data) { return(' + this.attr_value + ') };'),
        data = render_options && render_options.data || {}; // '-on:'.length === 4

    node_el.addEventListener(event_name, function () {
      var result = onTrigger.call(node_el, data);
      _this.updateData();
      if( result && result.then instanceof Function ) result.then(function () {
        _this.updateData();
      }, function () {
        _this.updateData();
      });
    });

    _this.watchData(function (_data) {
      data = _data;
    });
  });
};
