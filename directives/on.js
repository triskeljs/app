
module.exports = function (APP, TEXT, directive_ns) {
  APP.directive(directive_ns + '-on:\\w+', function (node_el, node, render_options, _with_node) {
    var event_name = this.attr_key.substr(directive_ns.length + 4),
        onTrigger = new Function('data', 'with(data) { return(' + this.attr_value + ') };'),
        data = render_options && render_options.data || {},
        _updateData = (function (updateData) {
          return function () { updateData(data); };
        })( this.parent ? this.parent.updateData : this.updateData );

    node_el.addEventListener(event_name, function () {
      var result = onTrigger.call(node_el, data);
      _updateData();
      if( result && result.then instanceof Function ) result.then(_updateData, _updateData);
    });

    this.watchData(function (_data) {
      data = _data;
    });
  });
};
