(function () {
  'use strict';

  // https://stackoverflow.com/questions/1661197/what-characters-are-valid-for-javascript-variable-names/9337047#9337047

  var ecma_keywords = {};

  'null,true,false,undefined,arguments,break,case,catch,class,const,continue,debugger,default,delete,do,else,export,extends,finally,for,function,if,import,in,instanceof,new,return,super,switch,this,throw,try,typeof,var,void,while,with,yield'.split(',').forEach(function (key) {
    ecma_keywords[key] = true;
  });

  var match_var = /\.?[a-zA-Z_$][0-9a-zA-Z_$]*( *:)?/g;

  function _evalExpression (expression, options) {
    var matches = [],
        used_vars = Object.create(ecma_keywords);

    options = options || {};
    if( options.globals ) options.globals.forEach(function (key) {
      used_vars[key] = true;
    });

    if( typeof expression !== 'string' ) throw new TypeError('expression should be a String');

    ( expression
        .replace(/''|'(.*?[^\\])'/g, '\'\'')
        .replace(/""|"(.*?[^\\])"/g, '""')
        .match(match_var) || []
    ).forEach(function (key) {
      if( key[0] === '.' || /:$/.test(key) || used_vars[key] ) return

      used_vars[key] = true;

      matches.push(key);
    });

    used_vars = null;

    var runExpression = Function.apply(null, matches.concat('return (' + expression + ');') );

    return function (scope) {
      if( !scope ) scope = {};

      return runExpression.apply(null, matches.map(function (key) { return scope[key] }) )
    }
  }

  var _eval = function (expression, scope, options) {
    if( scope === undefined ) return _evalExpression(expression, options)

    return _evalExpression(expression, options)(scope)
  };

  var interpolateProcessor = function (expressionProcessor) {
    return function interpolateText (text, _scope) {
      var texts = text.split(/{{.*?}}/),
          expressions = ( text.match(/{{.*?}}/g) ||[] ).map(function (expression) {
            return expressionProcessor( expression.replace(/^{{|}}$/g, '') )
          });

      function getResult (scope) {
        return texts.reduce(function (result, text, i) {
          return result + text + ( expressions[i] ? expressions[i](scope) : '' )
        }, '')
      }

      if( _scope === undefined ) return getResult

      return getResult(_scope)

    }
  };

  var conText_1 = conText;

  function conText (_TEXT) {
    var filter_definitions = {};

    _TEXT = _TEXT || {};

    function defineFilter (name, filterFn) {
      filter_definitions[name] = filterFn;
    }

    function processFilter (name, input, scope) {
      if( !filter_definitions[name] ) throw new Error('filter \'' + name + '\' is not defined')

      return filter_definitions[name](input, scope)
    }

    function evalFilter (filter_key) {
      filter_key = filter_key.trim();

      if( !/:/.test(filter_key) ) {
        return function (input) {
          return processFilter( filter_key, input )
        }
      }

      filter_key = filter_key.split(/:(.+)/);
      return (function (filter_name, getData ) {
        return function (input, scope) {
          return processFilter( filter_name, input, getData(scope || {}) )
        }
      })( filter_key[0], _eval(filter_key[1]) )
    }

    function evalFilters (filters_list) {
      var filters_funcs = filters_list.map(evalFilter);

      if( !filters_list.length ) return function (result) { return result }

      return function (result, scope) {
        scope = scope || {};
        for( var i = 0, n = filters_funcs.length ; i < n ; i++ ) {
          result = filters_funcs[i](result, scope);
        }

        return result
      }
    }

    function parseExpression ( expression ) {
      var filters_list = expression.split(' | ');

      expression = filters_list.shift();

      return {
        expression: expression,
        has_filters: filters_list.length > 0,
        processFilters: evalFilters(filters_list),
      }
    }

    function evalExpression (expression, _scope, _filters_scope) {
      var parsed = parseExpression(expression),
          getValue = _eval( parsed.expression ),
          processFilters = parsed.processFilters;

      if( _scope === undefined ) {
        if( !parsed.has_filters ) return getValue

        return function (scope, filters_scope) {
          scope = scope || {};
          try{
            return processFilters( getValue(scope), filters_scope || scope )
          } catch(err) {
            console.error('error in expression: \'' + expression + '\''); // eslint-disable-line
            throw err
          }
        }
      }

      return processFilters( getValue(_scope), _filters_scope || _scope )
    }

    _TEXT.interpolate = interpolateProcessor(evalExpression);

    _TEXT.eval = evalExpression;
    _TEXT.parseExpression = parseExpression;

    _TEXT.defineFilter = defineFilter;
    _TEXT.processFilter = processFilter;

    _TEXT.evalFilter = evalFilter;
    _TEXT.evalFilters = evalFilters;

    _TEXT.createConText = conText;

    return _TEXT
  }

  function _appendChildren (parent_el, nodes, ns_scheme, options, _withNode, inits_list) {
    var inserted_nodes = [],
        insert_before = options.insert_before;

    options.insert_before = null;

    nodes.forEach(function (node) {

      if( typeof node === 'string' ) node = { text: node };
      if( options.remove_comments && node && typeof node === 'object' && 'comments' in node ) return;

      var with_node = _withNode(node) ||{};
      var node_el;

      if( with_node.replace_by_comment ) node_el = document.createComment(with_node.replace_by_comment);
      else node_el = _create(node, parent_el, ns_scheme, options, _withNode, inits_list, with_node.replace_text);

      if( with_node.onCreate instanceof Function ) with_node.onCreate.call(node_el, node_el, node, options, with_node);

      if( insert_before ) parent_el.insertBefore(node_el, insert_before);
      else parent_el.appendChild( node_el );

      if( with_node.initNode ) inits_list.push(function () {
        with_node.initNode.call(node_el, node_el, node, options, with_node);
      });

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

  function _create(node, _parent, ns_scheme, options, _withNode, inits_list, replace_text) {
    var node_el;

    if( 'text' in node ) return document.createTextNode( replace_text === undefined ? node.text : replace_text );
    if( 'comments' in node ) return document.createComment(node.comments);

    if( !node.$ ) throw new TypeError('unknown node format');

    ns_scheme = ns_scheme || ns_tags[node.$];
    if( ns_scheme ) node_el = document.createElementNS(ns_scheme, node.$);
    else node_el = document.createElement(node.$);

    if( node.attrs ) {
      for( var key in node.attrs ) node_el.setAttribute(key, node.attrs[key] instanceof Function ? node.attrs[key](options, node) : node.attrs[key] );
    }

    if( '_' in node ) _appendChildren(node_el, node._ instanceof Array ? node._ : [node._], ns_scheme, options, _withNode, inits_list);

    return node_el;
  }

  function renderNodes (parent, nodes, options) {
    options = Object.create(options || {});
    var _withNode = options.withNode || function () {};

    options.withNode = null;

    if( typeof options.withNode !== 'function' ) options.withNode = function () {};

    if( !options.insert_before && options.keep_content !== true ) {
      while( parent.firstChild )
        parent.removeChild(parent.firstChild);
    }

    var inits_list = [],
        inserted_nodes = _appendChildren(parent, nodes, null, options, _withNode, inits_list);

    inits_list.forEach(function (initFn) { initFn(); });

    return inserted_nodes;
  }

  var render_cjs = renderNodes;

  function _extend(dest, src) {
    for( var key in src ) dest[key] = src[key];
    return dest
  }

  function _find(list, iteratee, this_arg) {
    for( var i = 0, n = list.length; i < n ; i++ ) {
      if( iteratee.call(this_arg, list[i]) ) return list[i]
    }
    return null
  }

  var utils = {
    extend: _extend,
    find: _find,
  };

  function _noop () {}

  var render = RenderApp;

  function RenderApp (_options) {
    // var options = Object.create(_options || {})

    this.with_node_pipe = [];

    this.options = _options ||{};
  }

  RenderApp.prototype.simpleRender = render_cjs;

  function _isInList(list, item) {
    for( var i = list.length - 1; i >= 0 ; i-- ) {
      if( item === list[i] ) return true
    }
    return false
  }

  RenderApp.prototype.render = function (parent_el, nodes, _options) {
    if( nodes instanceof Array === false ) throw new TypeError('render nodes should be an Array')

    _options = _options || {};
    var APP = Object.create(this),
        render_options = utils.extend( Object.create( APP.options || {} ), _options ),
        with_node_pipe = APP.with_node_pipe,
        detach_queue = [],
        _processDetachQueue = function (detached_nodes) {
          for( var i = detach_queue.length - 1 ; i >= 0 ; i-- ) {
            if( _isInList(detached_nodes, detach_queue[i].el) ) {
              detach_queue[i].listener.call(detach_queue[i].el);
              detach_queue.splice(i, 1);
            }
          }
          if( detach_queue.length === 0 ) mutation_observer.disconnect();
        },
        mutation_observer = 'MutationObserver' in window ? new MutationObserver(function(mutations) {

          mutations.forEach(function(mutation) {
            _processDetachQueue(mutation.removedNodes);
          });

        }) : { observe: _noop, disconnect: _noop };

    function _onDetach (listener) {
      if( !detach_queue.length ) mutation_observer.observe(parent_el, { childList: true, subtree: true });
      detach_queue.push({ el: this, listener: listener });
    }

    parent_el = parent_el || document.createElement('div');

    var safe_render_options = Object.create(render_options);
    safe_render_options.withNode = null;

    render_options.withNode = function (node) {
      var with_node = {},
          init_pipe = [],
          i, n, result_with_node,
          _with_node_pipe = with_node_pipe;

      if( _options.withNode ) {
        _with_node_pipe = _with_node_pipe.slice();
        _with_node_pipe.unshift(_options.withNode);
      }

      for( i = 0, n = _with_node_pipe.length ; i < n ; i++ ) {
        result_with_node = _with_node_pipe[i] instanceof Function ?
          _with_node_pipe[i].call(APP, node, safe_render_options, with_node) :
          _with_node_pipe[i];

        if( result_with_node ) {
          if( result_with_node.replace_by_comment ) return result_with_node

          if( result_with_node.initNode ) {
            if( typeof result_with_node.initNode !== 'function' ) {
              console.error('initNode should be a function', result_with_node.initNode ); // eslint-disable-line
              throw new TypeError('initNode should be a Function')
            }

            init_pipe.push(result_with_node.initNode);
            // delete result_with_node.initNode; // will be overriden if init_pipe.length
          }

          with_node = utils.extend( with_node, result_with_node );
        }
      }

      if( init_pipe.length ) {
        with_node.initNode = function (node_el) {
          var _this = Object.create(APP);
          _this.onDetach = _onDetach.bind(node_el);

          for( var i = 0, n = init_pipe.length; i < n ; i++ ) {
            // init_pipe[i].call(node_el, node_el, node, with_node);
            init_pipe[i].apply(_this, arguments);
          }
        };
      }

      return with_node
    };

    return render_cjs(parent_el, nodes, render_options)
  };

  RenderApp.prototype.withNode = function (withNode) {
    this.with_node_pipe.push(withNode);
    return this
  };

  RenderApp.prototype.component = function (tag_name, options, template_options) {
    var render_app = this;

    if( options instanceof Function ) options = { controller: options };
    else if( !options || typeof options !== 'object' ) {
      throw new TypeError('options should be a plain object (or a controller function)')
    }

    template_options = template_options ? Object.create(template_options) : {};
    if( !template_options.data && options.data ) template_options.data = options.data;
    
    render_app.withNode(function (node) {

      if( node.$ !== tag_name ) return

      var _with_node = options.withNode && options.withNode.apply(render_app, arguments) || {},
          _initNode = _with_node.initNode;

      return utils.extend( _with_node, {
        initNode: options.controller && options.template ? function (node_el, _node, render_options) {
          var _this = Object.create(this), _args = arguments;

          if( !template_options.data && render_options.data ) template_options.data = render_options.data;
          var template_ctrl = render_app.render(node_el, options.template, template_options);

          _this.updateData = template_ctrl.updateData;
          _this.watchData(function () {
            template_ctrl.updateData();
          });

          if( _initNode instanceof Function ) _initNode.apply(_this, arguments);
          options.controller.apply(_this, _args);
        } : function (node_el, _node, render_options) {
          var _this = Object.create(this),
              _template_ctrl;
          
          if( options.template ) {
            if( !template_options.data && render_options.data ) template_options.data = render_options.data;
            _template_ctrl = render_app.render(node_el, options.template, template_options);
            _this.updateData = _template_ctrl.updateData;
            _this.watchData(function () {
              _template_ctrl.updateData();
            });
          }

          if( _initNode instanceof Function ) _initNode.apply(_this, arguments);
          if( options.controller instanceof Function ) options.controller.apply(_this, arguments);
        },
      })

    });

    return this
  };

  function _autoWithNode (withNode) {
    if( withNode instanceof Function ) return withNode
    if( withNode && typeof withNode === 'object' ) return function () {
      return withNode
    }
  }

  RenderApp.prototype.directive = function (directive, initNode, withNode) {

    if( directive instanceof RegExp ) directive = '^' + directive.source.replace(/^\^|\$$/g, '') + '$';
    directive = '^' + directive.replace(/^\^|\$$/, '') + '$';

    var matchRE = new RegExp(directive),
        matchAttr = function (attr) {
          return matchRE.test(attr)
        },
        _withNode = _autoWithNode(withNode);

    this.withNode(function (node, _render_options) {
      var _attrs = node.attrs || {},
          attr_key = _attrs && utils.find( Object.keys(_attrs), matchAttr);

      if( !attr_key ) return
      if( node._using_directive === attr_key ) return

      var this_app = Object.create(this);

      this_app.attr_key = attr_key;
      this_app.attr_value = _attrs[attr_key];

      return utils.extend( _withNode && _withNode.apply(this_app, arguments) || {}, {
        initNode: function (node_el, _node, render_options, _with_node) {
          if( _with_node.replace_by_comment ) {
            _node = Object.create(_node);
            _node._using_directive = attr_key;
          }

          initNode.call(this_app, node_el, _node, render_options, _with_node );
        },
      })

    });

    return this
  };

  var _if = function (APP, TEXT, directive_ns) {
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
            return
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
      }
    });
  };

  var repeat = function (APP, TEXT, directive_ns) {

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
          matched_expressions = attr_value.match(/(\w+?(, *.+ *)?) in (.+)/);

      // console.log('matched_expressions', matched_expressions)

      repeat_options.insert_before = close_comment;

      if( !matched_expressions ) throw new Error('data-repeat invalid expression: ' + attr_value )

      var index_key = null,
          list_key = matched_expressions[1].replace(/, *(.+) */, function (_matched, _key) {
            // console.log('index_key', _key)
            index_key = _key;
            return ''
          }).trim(),
          getList = TEXT.eval(matched_expressions[3]),
          previous_repeat = [];

      // console.log('index_key', index_key)

      function _addListItem (data, data_item, index, _insert_before) {
        var _data = Object.create(data),
            node_options = Object.create(repeat_options);

        _data[list_key] = data_item;
        if(index_key) _data[index_key] = index;

        node_options.data = _data;
        // if( _insert_before ) node_options.insert_before = _insert_before

        var rendered_handler = APP_.render(parent_el, [node], node_options);

        return {
          el: rendered_handler.inserted_nodes[0].el,
          rendered: rendered_handler,
          data_item: data_item,
          data: _data,
        }
      }

      function _updateRenderedData (item, data, data_item, index) {
        var _data = Object.create(data);

        _data[list_key] = data_item;
        if(index_key) _data[index_key] = index;

        // console.log('_updateRenderedData', data_item, index)

        parent_el.insertBefore(item.el, close_comment);
        item.rendered.updateData(_data);
        return item
      }

      parent_el.insertBefore(start_comment, close_comment);

      this.watchData(function (data) {
        var list = getList(data),
            index = 0;
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
          parent_el.removeChild( previous_repeat.shift().el );
        }

        if( !previous_repeat.length ) {
          previous_repeat = list.map(function (data_item) {
            return _addListItem(data, data_item, index++)
          });
          return
        }

        var current_repeat = [],
            i = 0, n = list.length,
            item_found;

        while( i < n && previous_repeat.length ) {
          item_found = _findDataItem(previous_repeat, list[i], true);
          // if( item_found ) console.log('item_found', item_found)
          current_repeat.push( item_found ?
            _updateRenderedData(item_found, data, list[i++], index++) :
            _addListItem(data, list[i++], index++)
          );
        }

        if( previous_repeat.length ) previous_repeat.forEach(function (item) {
          parent_el.removeChild( item.el );
        });

        while( i < n ) current_repeat.push( _addListItem(data, list[i++], index++) );

        previous_repeat = current_repeat;

      });

    }, function () {
      return {
        replace_by_comment: ' / ' + this.attr_key.trim() + ' ',
      }
    });
  };

  var on = function (APP, TEXT, directive_ns) {
    APP.directive(directive_ns + '-on:\\w+', function (node_el, node, render_options, _with_node) {
      var _render_app = this.render_app,
          event_name = this.attr_key.substr(directive_ns.length + 4),
          onTrigger = new Function('data', 'with(data) { return(' + this.attr_value + ') };'),
          data = render_options && render_options.data || {},
          _updateData = function () {
            _render_app.updateData();
          };

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

  var bind = function (APP, TEXT, directive_ns) {

    APP.directive(directive_ns + '-bind', function (node_el, node, render_options, _with_node) {

      var parsed = TEXT.parseExpression(node.attrs[ directive_ns + '-bind']);

      this.watchData(function () {
        var result = parsed.processFilters( TEXT.eval(parsed.expression, render_options.data) );

        if( typeof result !== 'string' && !(result instanceof Array) ) throw new TypeError('data-bind should return a String or an Array')

        APP.render(node_el, typeof result === 'string' ? [{ text: result }] : result);
      });

    });

  };

  function _getClassFromItem (class_item) {
    if( !class_item ) return ''
    if( typeof class_item === 'string' ) return class_item
    if( class_item instanceof Array ) return _getClassesFromArray(class_item)
    if( class_item && typeof class_item === 'object' ) return _getClassesFromObject(class_item)
    throw new TypeError('directive class values should be Array, plain Objects or Strings')
  }

  function _getClassesFromObject (o) {
    var result = '';
    for( var key in o ) {
      if( o[key] ) {
        result += ( result ? ' ' : '' ) + key;
        if( o[key] !== true ) result += ' ' + key + o[key];
      }
    }
    return result
  }

  function _getClassesFromArray (classes_array) {
    return classes_array.map(function (class_item) {
      return _getClassFromItem(class_item)
    }).join(' ')
  }

  var _class = function (APP, TEXT, directive_ns) {

    APP.directive(directive_ns + '-class', function (node_el, node, _render_options, _with_node) {
      var getClassesObject = TEXT.eval(node.attrs[directive_ns + '-class']),
          original_classes = node_el.className || '',
          previus_classes = '';

      this.watchData(function (data) {
        var classes_object = getClassesObject(data) || {};

        var generated_classes = classes_object instanceof Array ?
          _getClassesFromArray(classes_object) :
          ( classes_object && typeof classes_object === 'object' ? _getClassesFromObject(classes_object) : '' );

        if( generated_classes === previus_classes ) return
        previus_classes = generated_classes;

        node_el.className = original_classes + (original_classes ? ' ' : '') + generated_classes;
      });
    });

  };

  function createApp(options) {
    options = options || {};

    var add_directives = utils.extend({
          if: true,
          repeat: true,
          bind: true,
          on: true,
          'class': true,
        }, options.add_directives || {}),
        directive_ns = options.directive_ns || 'data',
        render_options = {};

    var app = new render(render_options);

    // Data envelope for RenderApp

    var APP = Object.create( app ),
        TEXT = conText_1(APP);

    // APP.directive = function (directive, initNode, with_node) {
    //
    //   app.directive(directive, function () {
    //     // this.watchData = watchData;
    //     initNode.apply(this, arguments);
    //   }, with_node);
    //
    // };

    // preset directives

    var special_chars = {
      nbsp: ' ', hellip: '…', quot: '"',
    };

    APP.withNode(function (node) {
      var text_node = typeof node === 'string' ? node : node.text;

      if( text_node ) return {
        replace_text: '',
        initNode: function (el) {
          // console.log('node.text', arguments)
          var renderText = TEXT.interpolate(text_node);

          if( el.parentElement && /{{.*}}/.test(text_node) ) el.parentElement.insertBefore( document.createComment(' text: ' + text_node + ' '), el );

          this.watchData(function (data) {
            var text = renderText(data).replace(/&([a-z]+);/g, function (matched, special_char) {
              return special_chars[special_char] || matched
            });
            if( text !== el.textContent ) el.textContent = text;
          });
        }
      }
    });

    if( add_directives.if ) _if(APP, TEXT, directive_ns);
    if( add_directives.repeat ) repeat(APP, TEXT, directive_ns);
    if( add_directives.bind ) bind(APP, TEXT, directive_ns);
    if( add_directives.on ) on(APP, TEXT, directive_ns);
    if( add_directives['class'] ) _class(APP, TEXT, directive_ns);

    function _renderApp (_parent, _nodes, render_options) {

      render_options = Object.create(render_options || {});

      var APP_ = Object.create(this),
          // parent_app = render_options.parent_app || {},
          data = render_options.data || {},
          data_listeners = [],
          watchData = function (onData) {
            data_listeners.push(onData);
            onData(data);
          },
          updateData = function (_data) {
            if( _data ) data = _data;
            data_listeners.forEach(function (listener) {
              listener(data);
            });
          };

      APP_.render_app = APP_.render_app || APP_;
      APP_.watchData = watchData;
      APP_.updateData = updateData;
      APP_.render = _renderApp.bind(APP_);

      Object.defineProperty(APP_, 'data', {
        get: function () {
          return data
        },
      });

      var inserted_nodes = app.render.apply(APP_, arguments);

      return {
        get data () {
          return data
        },
        set data (_data) {
          updateData(_data);
        },
        updateData: updateData,
        inserted_nodes: inserted_nodes,
      }

    }

    APP.render = _renderApp.bind(APP);

    return APP
  }

  var APP = createApp();

  APP.createApp = createApp;

  var app = APP;

  window.conText = conText_1;
  window.evalExpression = _eval;
  window.interpolateProcessor = interpolateProcessor;

  window.renderNodes = render_cjs;

  window.APP = app;

}());
