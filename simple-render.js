
function _appendChildren (parent_el, nodes, ns_scheme, options, inits_list) {
  var inserted_nodes = [],
      insert_before = options.insert_before;

  options.insert_before = null;

  nodes.forEach(function (node) {

    var skip_node = options.skip_init && options.skip_init.indexOf(node) >= 0;

    var with_node = !skip_node && options.withNode(node) ||{};
    var node_el;

    if( with_node.replace_by_comment ) node_el = document.createComment(with_node.replace_by_comment);
    else node_el = _create(node, parent_el, ns_scheme, options, inits_list);

    if( insert_before ) parent_el.insertBefore(node_el, insert_before);
    else parent_el.appendChild( node_el );

    if( with_node.initNode ) inits_list.push(function () {
      with_node.initNode.call(node_el, node_el, node, with_node, options);
    });

    if( !skip_node && options.initNode instanceof Function ) inits_list.push(options.initNode);
    // if( options.initNode instanceof Function ) options.initNode(node_el, node);

    inserted_nodes.push({
      el: node_el,
      options: node,
      with_node: with_node,
    });

  });

  return inserted_nodes;
}

var ns_tags = {
  svg: 'http://www.w3.org/2000/svg',
  xbl: 'http://www.mozilla.org/xbl',
  xul: 'http://www.mozilla.org/keymaster/gatekeeper/there.is.only.xul',
};

function _create(node, _parent, ns_scheme, options, inits_list) {
  var node_el;
  if( node.$ ) {
    ns_scheme = ns_scheme || ns_tags[node.$];
    if( ns_scheme ) node_el = document.createElementNS(ns_scheme, node.$);
    else node_el = document.createElement(node.$);

    if( node.attrs ) {
      for( var key in node.attrs ) node_el.setAttribute(key, node.attrs[key]);
    }
    if( node._ instanceof Array ) _appendChildren(node_el, node._, ns_scheme, options, inits_list);
    else if( node._ ) node_el.innerHTML = node._;
  } else if( node.text ) return document.createTextNode(node.text);

  return node_el;
}

module.exports = function renderNodes (parent, nodes, options) {
  options = Object.create(options || {});

  if( typeof options.withNode !== 'function' ) options.withNode = function () {};

  if( !options.insert_before && options.keep_content !== true ) {
    while( parent.firstChild )
      parent.removeChild(parent.firstChild);
  }

  var inits_list = [],
      inserted_nodes = _appendChildren(parent, nodes, null, options, inits_list);

  inits_list.forEach(function (initFn) { initFn(); });

  return inserted_nodes;
};
