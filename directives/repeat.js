
module.exports = function (APP, TEXT, directive_ns) {
  APP.directive(directive_ns + '-repeat', function (close_comment, node, render_options, _with_node) {

    // @TODO stuff

    var parent_el = close_comment.parentElement,
        attr_value = this.attr_value,
        start_comment = document.createComment(' : ' + this.attr_key + ' : ' + attr_value + ' ' ),
        matched_expressions = attr_value.match(/(\w+?) in (.+)/);

    if( !matched_expressions ) throw new Error('data-repeat invalid expression: ' + attr_value );

    var list_key = matched_expressions[1].trim(),
        getList = TEXT.eval(matched_expressions[2]),
        previous_repeat = null;

    parent_el.insertBefore(start_comment, close_comment);

    this.watchData(function (data) {
      var list = getList(data),
          remove_el = start_comment.nextSibling;

      if( !(list instanceof Array) ) throw new Error('expression \'' + matched_expressions[2] + '\' should return an Array');

      while( remove_el !== close_comment ) {
        parent_el.removeChild(remove_el);
        remove_el = start_comment.nextSibling;
      }

      previous_repeat = list.map(function (data_item) {
        var _data = Object.create(data),
            repeat_options = Object.create(render_options);

        _data[list_key] = data_item;

        repeat_options.insert_before = close_comment;
        repeat_options.data = _data;

        return {
          data_item: data_item,
          data: data,
          rendered: APP.render(parent_el, [node], repeat_options),
        };
      });
    });

  }, function () {
    return {
      replace_by_comment: ' / ' + this.attr_key + ' ',
    };
  });
};
