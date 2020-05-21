

module.exports = function (APP, TEXT, directive_ns) {

  APP.directive(directive_ns + '-bind', function (node_el, node, render_options, _with_node) {

    var parsed = TEXT.parseExpression(node.attrs[ directive_ns + '-bind'])
    var _getData = TEXT.eval(parsed.expression)
    var current_content = null
    var current_view = null

    this.watchData(function (_data) {
      var content = parsed.processFilters( _getData(_data), _data )

      if( typeof content !== 'string' && !(content instanceof Array) ) throw new TypeError('data-bind should return a String or an Array')

      if (current_content && content === current_content) {
        current_view.updateData(_data)
      } else {
        current_content = content

        current_view = APP.render(node_el, typeof content === 'string' ? [{ text: content }] : content, { data: _data })
      }
    })

  })

}
