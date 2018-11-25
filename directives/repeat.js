
module.exports = function (APP, TEXT, directive_ns) {

  function _findDataItem(list, data_item, seek_and_destroy) {
    for( var i = 0, n = list.length; i < n ; i++ ) {
      if( data_item === list[i].data_item ) {
        return seek_and_destroy ? list.splice(i,1)[0] : list[i]
      }
    }
  }

  // function _forEach (list, _each) {
  //   if( list instanceof Array ) list.forEach(_each)
  //   else for( var key in list ) _each(list[key], key)
  // }

  APP.directive(directive_ns + '-repeat', function (close_comment, node, render_options, _with_node) {

    // @TODO stuff

    var APP_ = this,
        repeat_options = Object.create(render_options),
        parent_el = close_comment.parentElement,
        attr_value = this.attr_value,
        start_comment = document.createComment(' : ' + this.attr_key.trim() + ' : ' + attr_value.trim() + ' ' ),
        matched_expressions = attr_value.match(/(\w+?(, *.+ *)?) in (.+)/)

    // console.log('matched_expressions', matched_expressions)

    repeat_options.insert_before = close_comment

    if( !matched_expressions ) throw new Error('data-repeat invalid expression: ' + attr_value )

    var index_key = null,
        list_key = matched_expressions[1].replace(/, *(.+) */, function (_matched, _key) {
          // console.log('index_key', _key)
          index_key = _key
          return ''
        }).trim(),
        getList = TEXT.eval(matched_expressions[3]),
        previous_repeat = []

    // console.log('index_key', index_key)

    function _addListItem (data, data_item, index, _insert_before) {
      var _data = Object.create(data),
          node_options = Object.create(repeat_options)

      _data[list_key] = data_item
      if(index_key) _data[index_key] = index

      node_options.data = _data
      // if( _insert_before ) node_options.insert_before = _insert_before

      var rendered_handler = APP_.render(parent_el, [node], node_options)

      return {
        el: rendered_handler.inserted_nodes[0].el,
        rendered: rendered_handler,
        data_item: data_item,
        data: _data,
      }
    }

    function _updateRenderedData (item, data, data_item, index) {
      var _data = Object.create(data)

      _data[list_key] = data_item
      if(index_key) _data[index_key] = index

      // console.log('_updateRenderedData', data_item, index)

      parent_el.insertBefore(item.el, close_comment)
      item.rendered.updateData(_data)
      return item
    }

    parent_el.insertBefore(start_comment, close_comment)

    this.watchData(function (data) {
      var list = getList(data),
          index = 0
          // current_repeat = []

      // if( !list || typeof list !== 'object' ) throw new TypeError('expression \'' + matched_expressions[3] + '\' should return an Array or an Object')

      // _forEach(list, function (data_item, i) {
      //   current_repeat.push( previous_repeat[i] ?
      //     _updateRenderedData(previous_repeat[i], data, data_item, index++) :
      //     _addListItem(data, data_item, index++)
      //   )
      // })

      // while( previous_repeat[index] ) {
      //   parent_el.removeChild( previous_repeat[index++].el )
      // }

      // previous_repeat = current_repeat

      if( !(list instanceof Array) ) throw new TypeError('expression \'' + matched_expressions[3] + '\' should return an Array')

      while( previous_repeat[0] && list.indexOf(previous_repeat[0].data_item) < 0 ) {
        parent_el.removeChild( previous_repeat.shift().el )
      }

      if( !previous_repeat.length ) {
        previous_repeat = list.map(function (data_item) {
          return _addListItem(data, data_item, index++)
        })
        return
      }

      var current_repeat = [],
          i = 0, n = list.length,
          item_found

      while( i < n && previous_repeat.length ) {
        item_found = _findDataItem(previous_repeat, list[i], true)
        // if( item_found ) console.log('item_found', item_found)
        current_repeat.push( item_found ?
          _updateRenderedData(item_found, data, list[i++], index++) :
          _addListItem(data, list[i++], index++)
        )
      }

      if( previous_repeat.length ) previous_repeat.forEach(function (item) {
        parent_el.removeChild( item.el )
      })

      while( i < n ) current_repeat.push( _addListItem(data, list[i++], index++) )

      previous_repeat = current_repeat

    })

  }, function () {
    return {
      replace_by_comment: ' / ' + this.attr_key.trim() + ' ',
    }
  })
}
