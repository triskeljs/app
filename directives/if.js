
module.exports = function (APP, TEXT, directive_ns) {
  APP.directive(directive_ns + '-if', function (close_comment, node, render_options, _with_node) {

    // @TODO stuff

    var APP_ = this,
        parent_el = close_comment.parentElement,
        attr_value = APP_.attr_value,
        start_comment = document.createComment(' : ' + this.attr_key + ' : ' + attr_value + ' ' ),
        if_options = Object.create(render_options),
        assertExpression = TEXT.eval(attr_value),
        rendered_handler = null, inserted_node = null;

    parent_el.insertBefore(start_comment, close_comment);

    if_options.insert_before = close_comment;

    this.watchData(function (data) {
      if( assertExpression(data) ) {
        if( inserted_node ) {
          if( !parent_el.contains(inserted_node) ) parent_el.insertBefore(inserted_node, close_comment);
          rendered_handler.updateData(data);
          return;
        }

        if_options.insert_before = close_comment;
        if_options.data = data;

        rendered_handler = APP_.render(parent_el, [node], if_options);
        inserted_node = rendered_handler.inserted_nodes[0].el;
      } else if( parent_el.contains(inserted_node) ) {
        parent_el.removeChild(inserted_node);
      }
    });

  }, function () {
    return {
      replace_by_comment: ' / ' + this.attr_key + ' '
    };
  });
};
