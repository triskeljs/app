
function _getClassFromItem (class_item) {
  if( !class_item ) return ''
  if( typeof class_item === 'string' ) return class_item
  if( class_item instanceof Array ) return _getClassesFromArray(class_item)
  if( class_item && typeof class_item === 'object' ) return _getClassesFromObject(class_item)
  throw new TypeError('directive class values should be Array, plain Objects or Strings')
}

function _getClassesFromObject (o) {
  var result = ''
  for( var key in o ) {
    if( o[key] ) {
      result += ( result ? ' ' : '' ) + key
      if( o[key] !== true ) result += ' ' + key + o[key]
    }
  }
  return result
}

function _getClassesFromArray (classes_array) {
  return classes_array.map(function (class_item) {
    return _getClassFromItem(class_item)
  }).join(' ')
}

module.exports = function (APP, TEXT, directive_ns) {

  APP.directive(directive_ns + '-class', function (node_el, node, _render_options, _with_node) {
    var getClassesObject = TEXT.eval(node.attrs[directive_ns + '-class']),
        original_classes = node_el.className || '',
        previus_classes = ''

    this.watchData(function (data) {
      var classes_object = getClassesObject(data) || {}

      var generated_classes = classes_object instanceof Array ?
        _getClassesFromArray(classes_object) :
        ( classes_object && typeof classes_object === 'object' ? _getClassesFromObject(classes_object) : '' )

      if( generated_classes === previus_classes ) return
      previus_classes = generated_classes

      node_el.className = original_classes + (original_classes ? ' ' : '') + generated_classes
    })
  })

}
