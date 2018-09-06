

module.exports = function (APP, TEXT, directive_ns) {

  APP.directive(directive_ns + '-bind', function (node_el, node, render_options, _with_node) {

    var parsed = TEXT.parseExpression(node.attrs[ directive_ns + '-bind']);

    this.watchData(function () {
      var result = parsed.processFilters( TEXT.eval(parsed.expression, render_options.data) );

      APP.render(node_el, typeof result === 'string' ? [{ text: result }] : result);
    });

  });

};
