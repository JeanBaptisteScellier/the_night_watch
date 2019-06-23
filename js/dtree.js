var dict = {'ch0541362': 'tar',
           'c281': 'tar',
           'ch0158597': 'tar',
           'ch0171388': 'tar',
           'c280': 'tar',
           'c279': 'sta',
           'c63': 'tar',
           'ch0155777': 'sta',
           'ch0304492': 'sta',
           'c1': 'tar',
           'c282': 'tar',
           'ch0155775': 'tar',
           'ch0251737': 'tul',
           'ch0251736': 'tul',
           'ch0300949': 'tul',
           'ch0540082': 'tul',
           'ch0145135': 'sta',
           'ch0154681': 'sta',
           'ch0158604': 'sta',
           'ch0234897': 'sta',
           'ch0233141': 'sta',
           'ch0158596': 'sta',
           'ch0305007': 'sta',
           'ch0158137': 'lan',
           'ch0321004': 'sta',
           'c284': 'sta',
           'ch0153996': 'sta',
           'c28': 'sta',
           'ch0543804': 'sta',
           'ch0155776': 'lan',
           'ch0159526': 'lan',
           'ch0300040': 'bar',
           'ch0156278': 'lan',
           'ch0251974': 'tyr',
           'ch0238585': 'mar',
           'ch0506400': 'mar',
           'ch0256424': 'tyr',
           'ch0242185': 'lan',
           'ch0158527': 'lan',
           'ch0146096': 'lan',
           'ch0384328': 'tyr',
           'ch0231428': 'tyr',
           'ch0468006': 'mar'
};

function drawTree(family, character) {
  if (character != null){
    if (character in dict){
      new_family = dict[character]
    } else {
      return;
    }
  } else {
    new_family = family;
  }
  document.getElementById("menu").style.display = 'none';
  var el = document.getElementById('graph_2');
  if (el.firstChild != null){
    el.removeChild(el.firstChild);
  }
      treeJson = d3.json("../data/tree/" + new_family + ".json", function(error, treeData) {
        dTree.init(treeData,
      {
        target: "#graph_2",
        debug: true,
        height: 800,
        width: 1400,
        callbacks: {
          textRenderer: function(name, extra, textClass, idMain, idDetail, id) {
            if (extra != ""){
              link = "<a class='bio' href='https://www.imdb.com" + extra + "'>See more</a>";
            } else {
              link = "";
            }
            res = "<div align='center' style='display:table-cell' id="+ idMain + " class='" + textClass + "'><b>" + name + "</b></div>" ;
            res += "<div style='display:none' id="+ idDetail + " class='" + textClass + "'><div class='firstinfo variable-linkage' id='" + id + "'>";
            if (name.length>0){
              res += " <img src='/img/" + name + ".jpg' width='30' height='30'>" ;
            } else {
              res += " <img src='/img/Unknown.jpg' width='30' height='30'>" ;
            }
            res += "<div class='profileinfo'><h1>" + name + "</h1>" + link + "</div></div></div>" ;
            return res
          }
        }
      }
    );
    });
    document.getElementById("graph_2").style.display = 'block';
  }

  function clearTree() {
  document.getElementById("graph_2").style.display = 'none';
  document.getElementById("menu").style.display = 'block';
}

var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ('value' in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } }

(function (global, factory) {
  typeof exports === 'object' && typeof module !== 'undefined' ? module.exports = factory() : typeof define === 'function' && define.amd ? define(factory) : global.dTree = factory();
})(this, function () {
  'use strict';

  var TreeBuilder = (function () {

    var case_margin = 40;
    var detail_box_size = 200;

    function TreeBuilder(root, siblings, opts) {
      _classCallCheck(this, TreeBuilder);

      TreeBuilder.DEBUG_LEVEL = opts.debug ? 1 : 0;

      this.root = root;
      this.siblings = siblings;
      this.opts = opts;

      // flatten nodes
      this.allNodes = this._flatten(this.root);

      // Calculate node size
      var visibleNodes = _.filter(this.allNodes, function (n) {
        return !n.hidden;
      });
      this.nodeSize = opts.callbacks.nodeSize(visibleNodes, opts.nodeWidth, opts.callbacks.textRenderer);
    }

    _createClass(TreeBuilder, [{
      key: 'create',
      value: function create() {

        var opts = this.opts;
        var allNodes = this.allNodes;
        var nodeSize = this.nodeSize;

        var width = opts.width + opts.margin.left + opts.margin.right;
        var height = opts.height + opts.margin.top + opts.margin.bottom;

        //make an SVG
        var svg = this.svg = d3.select(opts.target).append('svg').attr('width', width).attr('height', height).append('g').attr('transform', 'translate(' + width / 2 + ',' + (opts.margin.top + 100) + ')');

        // Compute the layout.
        this.tree = d3.tree().nodeSize([nodeSize[0] * 2, opts.callbacks.nodeHeightSeperation(nodeSize[0], nodeSize[1])]);

        this.tree.separation(function separation(a, b) {
          if (a.data.hidden || b.data.hidden) {
            return 0.3;
          } else {
            return 0.6;
          }
        });

        this._update(this.root);
      }
    }, {
      key: '_update',
      value: function _update(source) {

        var opts = this.opts;
        var allNodes = this.allNodes;
        var nodeSize = this.nodeSize;

        var treenodes = this.tree(source);
        var links = treenodes.links();

        this.svg.append('foreignObject').attr('x', "-45px").attr('y', "-100px").attr('width', "100px").attr('height', "60px").attr('onclick', "clearTree()").html(function (d) {return '<div class="menu" style="height:100%;width:100%;"><div align="center" style="display:table-cell; cursor:pointer;" class="nodeText">Main</div></div>'});

        // Create the link lines.
        this.svg.selectAll('.link').data(links).enter()
        // filter links with no parents to prevent empty nodes
        .filter(function (l) {
          return !l.target.data.noParent;
        }).append('path').attr('class', opts.styles.linage).attr('d', this._elbow);

        var nodes = this.svg.selectAll('.node').data(treenodes.descendants()).enter();
        this._linkSiblings();

        // Draw siblings (marriage)
        this.svg.selectAll('.sibling').data(this.siblings).enter().append('path').attr('class', opts.styles.marriage).attr('d', _.bind(this._siblingLine, this));

        // Create the node rectangles.
        nodes.append('foreignObject').filter(function (d) {
          return d.data.hidden ? false : true;
        }).attr('x', function (d) {
          return d.x - d.cWidth / 2 + 'px';
        }).attr('y', function (d) {
          return d.y - d.cHeight / 2 + 'px';
        }).attr('width', function (d) {
          return d.cWidth + 'px';
        }).attr('height', function (d) {
          return d.cHeight + 'px';
        }).attr('id', function (d) {
          return d.data.id;
        }).attr('class', function (d) {
          return "variable-linkage";
        }).html(function (d) {
          return opts.callbacks.nodeRenderer(d.data.name, d.x, d.y, nodeSize[0], nodeSize[1], d.data.extra, d.data.id, d.data['class'], d.data.textClass, opts.callbacks.textRenderer);
        }).on("mouseover", function(d){
          $('.variable-linkage#' + d.data.id).attr('style', 'cursor:pointer');
          $('.variable-linkage#' + d.data.id).attr('width', detail_box_size + 'px').attr('height', d.cHeight + (case_margin / 2) + 'px').attr('x', d.x - (d.cWidth / 2) - ((detail_box_size - d.cWidth) / 2) + 'px').attr('y', d.y - d.cHeight / 2 - ((d.cHeight + (case_margin / 2) - d.cHeight) / 2) + 'px');
          $('#main' + d.data.id).attr('style', 'display:none');
          $('#detail' + d.data.id).attr('style', 'display:block');
          while(parseInt($('#detail' + d.data.id + ' .profileinfo h1').width()) > 120) { 
            $('#detail' + d.data.id + ' .profileinfo h1').css('font-size', (parseInt($('#detail' + d.data.id + ' .profileinfo h1').css('font-size')) - 1) + "px" ); 
          } 
        }).on("mouseout", function(d){
          $('.variable-linkage#' + d.data.id).attr('width', d.cWidth + 'px').attr('height', d.cHeight + 'px').attr('x', d.x - d.cWidth / 2 + 'px').attr('y', d.y - d.cHeight / 2 + 'px');
          $('#main' + d.data.id).attr('style', 'display:table-cell');
          $('#detail' + d.data.id).attr('style', 'display:none');
        }).on('click', function (d) {
          if (d.data.hidden) {
            return;
          }
          //starts here
          d3.json("./data/graph_1_data.json", function(error, relationships) {
            var char_id = d.data.id.toString();
            var index = char_id.indexOf('_');
            if (index != -1){
              char_id = char_id.substr(0, index)
            }
            d3.selectAll(".linkg").classed('link-grey', false);
            d3.selectAll(".linkg").classed('link-selected', false);
            d3.selectAll(".nodeg").classed('clicked', false);
            d3.select(".nodeg#" + char_id).classed("clicked", d3.select(".nodeg#" + char_id).classed("clicked") ? false : true);
            d3.selectAll(".linkg").classed('link-grey', true);
            d3.selectAll(".linkg#" + char_id).classed('link-selected', true);
          });


        });
      }
    }, {
      key: '_flatten',
      value: function _flatten(root) {
        var n = [];
        var i = 0;

        function recurse(node) {
          if (node.children) {
            node.children.forEach(recurse);
          }
          if (!node.id) {
            node.id = ++i;
          }
          n.push(node);
        }
        recurse(root);
        return n;
      }
    }, {
      key: '_elbow',
      value: function _elbow(d, i) {
        if (d.target.data.noParent) {
          return 'M0,0L0,0';
        }
        var ny = d.target.y + (d.source.y - d.target.y) * 0.50;

        var linedata = [{
          x: d.target.x,
          y: d.target.y
        }, {
          x: d.target.x,
          y: ny
        }, {
          x: d.source.x,
          y: d.source.y
        }];

        var fun = d3.line().curve(d3.curveStepAfter).x(function (d) {
          return d.x;
        }).y(function (d) {
          return d.y;
        });
        return fun(linedata);
      }
    }, {
      key: '_linkSiblings',
      value: function _linkSiblings() {

        var allNodes = this.allNodes;

        _.forEach(this.siblings, function (d) {
          var start = allNodes.filter(function (v) {
            return d.source.id == v.data.id;
          });
          var end = allNodes.filter(function (v) {
            return d.target.id == v.data.id;
          });
          d.source.x = start[0].x;
          d.source.y = start[0].y;
          d.target.x = end[0].x;
          d.target.y = end[0].y;
          console.log(end[0])
          var marriageId = start[0].data.marriageNode != null ? start[0].data.marriageNode.id : end[0].data.marriageNode.id;
          var marriageNode = allNodes.find(function (n) {
            return n.data.id == marriageId;
          });
          d.source.marriageNode = marriageNode;
          d.target.marriageNode = marriageNode;
        });
      }
    }, {
      key: '_siblingLine',
      value: function _siblingLine(d, i) {

        var ny = d.target.y + (d.source.y - d.target.y) * 0.50;
        var nodeWidth = this.nodeSize[0];
        var nodeHeight = this.nodeSize[1];

        // Not first marriage
        if (d.number > 0) {
          ny -= nodeHeight * 8 / 10;
        }

        var linedata = [{
          x: d.source.x,
          y: d.source.y
        }, {
          x: d.source.x + nodeWidth * 6 / 10,
          y: d.source.y
        }, {
          x: d.source.x + nodeWidth * 6 / 10,
          y: ny
        }, {
          x: d.target.marriageNode.x,
          y: ny
        }, {
          x: d.target.marriageNode.x,
          y: d.target.y
        }, {
          x: d.target.x,
          y: d.target.y
        }];

        var fun = d3.line().curve(d3.curveStepAfter).x(function (d) {
          return d.x;
        }).y(function (d) {
          return d.y;
        });
        return fun(linedata);
      }
    }], [{
      key: '_nodeHeightSeperation',
      value: function _nodeHeightSeperation(nodeWidth, nodeMaxHeight) {
        return nodeMaxHeight + 25 + case_margin;
      }
    }, {
      key: '_nodeSize',
      value: function _nodeSize(nodes, width, textRenderer) {
        var maxWidth = 0;
        var maxHeight = 0;
        var tmpSvg = document.createElement('svg');
        document.body.appendChild(tmpSvg);

        _.map(nodes, function (n) {
          var container = document.createElement('div');
          container.setAttribute('class', n.data['class']);
          container.style.visibility = 'hidden';
          container.style.maxWidth = width + 'px';

          var text = textRenderer(n.data.name, n.data.extra, n.data.textClass);
          container.innerHTML = text;

          tmpSvg.appendChild(container);
          //var height = container.offsetHeight + case_margin;
          var height = 20 + case_margin;
          tmpSvg.removeChild(container);

          maxHeight = Math.max(maxHeight, height);
          n.cHeight = height;

          if (n.data.hidden) {
            n.cWidth = 0;
          } else {
            n.cWidth = width;
          }
        });
        document.body.removeChild(tmpSvg);

        return [width, maxHeight];
      }
    }, {
      key: '_nodeRenderer',
      value: function _nodeRenderer(name, x, y, height, width, extra, id, nodeClass, textClass, textRenderer) {
        var node = '';
        node += '<div ';
        node += 'style="height:100%;width:100%;" ';
        node += 'class="' + nodeClass  + '"';
        node += 'id="' + id + '">\n';
        node += textRenderer(name, extra, textClass, 'main' + id, 'detail' + id, id);
        node += '</div>';
        return node;
      }
    }, {
      key: '_textRenderer',
      value: function _textRenderer(name, extra, textClass) {
        var node = '';
        node += '<p ';
        node += 'align="center" ';
        node += 'class="' + textClass + '">\n';
        node += name;
        node += '</p>\n';
        return node;
      }
    }, {
      key: '_debug',
      value: function _debug(msg) {
        if (TreeBuilder.DEBUG_LEVEL > 0) {
          console.log(msg);
        }
      }
    }]);

    return TreeBuilder;
  })();

  var dTree = {

    VERSION: '2.2.1',

    init: function init(data) {
      var options = arguments.length <= 1 || arguments[1] === undefined ? {} : arguments[1];

      var opts = _.defaultsDeep(options || {}, {
        target: '#graph_2',
        debug: false,
        width: 600,
        height: 600,
        callbacks: {
          nodeClick: function nodeClick(name, extra, id) {},
          nodeRightClick: function nodeRightClick(name, extra, id) {},
          nodeHeightSeperation: function nodeHeightSeperation(nodeWidth, nodeMaxHeight) {
            return TreeBuilder._nodeHeightSeperation(nodeWidth, nodeMaxHeight);
          },
          nodeRenderer: function nodeRenderer(name, x, y, height, width, extra, id, nodeClass, textClass, textRenderer) {
            return TreeBuilder._nodeRenderer(name, x, y, height, width, extra, id, nodeClass, textClass, textRenderer);
          },
          nodeSize: function nodeSize(nodes, width, textRenderer) {
            return TreeBuilder._nodeSize(nodes, width, textRenderer);
          },
          nodeSorter: function nodeSorter(aName, aExtra, bName, bExtra) {
            return 0;
          },
          textRenderer: function textRenderer(name, extra, textClass) {
            return TreeBuilder._textRenderer(name, extra, textClass);
          }
        },
        margin: {
          top: 10,
          right: 15,
          bottom: 10,
          left: 15
        },
        nodeWidth: 100,
        styles: {
          node: 'node',
          linage: 'linage',
          marriage: 'marriage',
          text: 'nodeText'
        }
      });

      var data = this._preprocess(data, opts);
      var treeBuilder = new TreeBuilder(data.root, data.siblings, opts);
      treeBuilder.create();
    },

    _preprocess: function _preprocess(data, opts) {

      var siblings = [];
      var id = 0;

      var root = {
        name: '',
        id: id++,
        hidden: true,
        children: []
      };

      var reconstructTree = function reconstructTree(person, parent) {

        // convert to person to d3 node
        var node = {
          name: person.name,
          id: person.id,
          hidden: false,
          children: [],
          extra: person.extra,
          textClass: person.textClass ? person.textClass : opts.styles.text,
          'class': person['class'] ? person['class'] : opts.styles.node
        };

        // hide linages to the hidden root node
        if (parent == root) {
          node.noParent = true;
        }

        // apply depth offset
        for (var i = 0; i < person.depthOffset; i++) {
          var pushNode = {
            name: '',
            id: id++,
            hidden: true,
            children: [],
            noParent: node.noParent
          };
          parent.children.push(pushNode);
          parent = pushNode;
        }

        // sort children
        dTree._sortPersons(person.children, opts);

        // add "direct" children
        _.forEach(person.children, function (child) {
          reconstructTree(child, node);
        });

        parent.children.push(node);

        //sort marriages
        dTree._sortMarriages(person.marriages, opts);

        // go through marriage
        _.forEach(person.marriages, function (marriage, index) {

          var m = {
            name: '',
            id: id++,
            hidden: true,
            noParent: true,
            children: [],
            extra: marriage.extra
          };

          var sp = marriage.spouse;

          var spouse = {
            name: sp.name,
            id: sp.id,
            hidden: false,
            noParent: true,
            children: [],
            textClass: sp.textClass ? sp.textClass : opts.styles.text,
            'class': sp['class'] ? sp['class'] : opts.styles.node,
            extra: sp.extra,
            marriageNode: m
          };

          parent.children.push(m, spouse);

          dTree._sortPersons(marriage.children, opts);
          _.forEach(marriage.children, function (child) {
            reconstructTree(child, m);
          });

          siblings.push({
            source: {
              id: node.id
            },
            target: {
              id: spouse.id
            },
            number: index
          });
        });
      };

      _.forEach(data, function (person) {
        reconstructTree(person, root);
      });

      return {
        root: d3.hierarchy(root),
        siblings: siblings
      };
    },

    _sortPersons: function _sortPersons(persons, opts) {
      if (persons != undefined) {
        persons.sort(function (a, b) {
          return opts.callbacks.nodeSorter(a.name, a.extra, b.name, b.extra);
        });
      }
      return persons;
    },

    _sortMarriages: function _sortMarriages(marriages, opts) {
      if (marriages != undefined && Array.isArray(marriages)) {
        marriages.sort(function (marriageA, marriageB) {
          var a = marriageA.spouse;
          var b = marriageB.spouse;
          return opts.callbacks.nodeSorter(a.name, a.extra, b.name, b.extra);
        });
      }
      return marriages;
    }

  };

  return dTree;
});
//# sourceMappingURL=dTree.js.map