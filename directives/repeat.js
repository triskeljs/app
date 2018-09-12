
module.exports = function (APP, TEXT, directive_ns) {

  // function _find(list, iteratee, this_arg) {
  //   for( var i = 0, n = list.length; i < n ; i++ ) {
  //     if( iteratee.call(this_arg, list[i]) ) return list[i];
  //   }
  // }

  function _findDataItem(list, data_item, seek_and_destroy) {
    for( var i = 0, n = list.length; i < n ; i++ ) {
      if( data_item === list[i].data_item ) {
        return seek_and_destroy ? list.splice(i,1)[0] : list[i];
      }
    }
  }

  APP.directive(directive_ns + '-repeat', function (close_comment, node, render_options, _with_node) {

    // @TODO stuff

    var APP_ = this,
        repeat_options = Object.create(render_options),
        parent_el = close_comment.parentElement,
        attr_value = this.attr_value,
        start_comment = document.createComment(' : ' + this.attr_key + ' : ' + attr_value + ' ' ),
        matched_expressions = attr_value.match(/(\w+?) in (.+)/);

    repeat_options.insert_before = close_comment;

    if( !matched_expressions ) throw new Error('data-repeat invalid expression: ' + attr_value );

    var list_key = matched_expressions[1].trim(),
        getList = TEXT.eval(matched_expressions[2]),
        previous_repeat = [];

    function _addListItem (data, data_item, insert_before) {
      var _data = Object.create(data),
          node_options = Object.create(repeat_options);

      _data[list_key] = data_item;
      node_options.data = _data;
      if( insert_before ) node_options.insert_before = insert_before;

      var rendered_handler = APP_.render(parent_el, [node], node_options);

      return {
        el: rendered_handler.inserted_nodes[0].el,
        rendered: rendered_handler,
        data_item: data_item,
        data: data,
      };
    }

    function _updateRenderedData (item, data, data_item) {
      var _data = Object.create(data);

      _data[list_key] = data_item;

      item.rendered.updateData(_data);
      return item;
    }

    parent_el.insertBefore(start_comment, close_comment);

    this.watchData(function (data) {
      var list = getList(data);

      if( !(list instanceof Array) ) throw new Error('expression \'' + matched_expressions[2] + '\' should return an Array');

      while( previous_repeat[0] && list.indexOf(previous_repeat[0].data_item) < 0 ) {
        parent_el.removeChild( previous_repeat.shift().el );
      }

      if( !previous_repeat.length ) {
        previous_repeat = list.map(function (data_item) {
          return _addListItem(data, data_item);
        });
        return;
      }

      var current_repeat = [],
          i = 0, n = list.length - 1,
          item_found;

      while( i < n && previous_repeat.length ) {
        item_found = _findDataItem(previous_repeat, list[i], true);
        current_repeat.push( item_found ?
          _updateRenderedData(item_found, data, list[i++]) :
          _addListItem(data, list[i++])
        );
      }

      if( previous_repeat.length ) previous_repeat.forEach(function (item) {
        parent_el.removeChild( item.el );
      });

      while( i < n ) current_repeat.push( _addListItem(data, list[i++]) );

      previous_repeat = current_repeat;

    });

  }, function () {
    return {
      replace_by_comment: ' / ' + this.attr_key + ' ',
    };
  });
};
