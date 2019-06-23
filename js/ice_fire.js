
var margin = {top: 40, right: 0, bottom: 0, left: 0},
    width = 500,
    height = 400 - margin.top - margin.bottom,
    width_bis = 500,
    height_bis = 400 - margin.top - margin.bottom,
    //formatNumber = d3_v3.format(",d"),
    formatNumber = function(val) {return val},
    transitioning;

var x = d3_v3.scale.linear()
    .domain([0, width])
    .range([0, width]);

var y = d3_v3.scale.linear()
    .domain([0, height])
    .range([0, height]);

var svg = d3_v3.select("body").select("#treemap").append("svg")
    .attr("width", width + margin.left + margin.right)
    .attr("height", height + margin.bottom + margin.top)
    .style("margin-left", -margin.left + "px")
    .style("margin.right", -margin.right + "px")
    .append("g")
    .attr("transform", "translate(" + margin.left + "," + margin.top + ")")
    .style("shape-rendering", "crispEdges");

//$("svg").css({top: 200, left: 100, position:'absolute'});
//$("svg_2").css({top: 200, left: 20, position:'relative'});

var dataset = svg.append("g")
        .attr("class", "dataset");

dataset.append("rect")
        .attr("y", -margin.top/2-20)
        .attr("ry", 8)
        .attr("width", width/2)
        .attr("height", margin.top/2)
        .on("click", characters_data);

dataset.append("text")
        .attr("x", 6)
        .attr("y", 6 - margin.top/2-2-20)
        .attr("dy", ".75em")
        .text("Dataset Characters");;

dataset.append("rect")
        .attr("y", -margin.top/2-20)
        .attr("ry", 8)
        .attr("x",margin.left+width/2)
        .attr("width", width/2)
        .attr("height", margin.top/2)
        .on("click", books_data);

dataset.append("text")
        .attr("x", 6 - margin.left+width/2)
        .attr("y", 6 - margin.top/2-2-20)
        .attr("dy", ".75em")
        .text("Dataset Books");


var grandparent = svg.append("g")
    .attr("class", "grandparent");

grandparent.append("rect")
    .attr("y", -margin.top/2)
    .attr("ry", 8)
    .attr("width", width)
    .attr("height", margin.top/2);

grandparent.append("text")
    .attr("x", 6)
    .attr("y", 6 -margin.top/2-2)
    .attr("dy", ".75em");

characters_data();

function characters_data(){

  svg.selectAll(".depth").remove();

d3_v3.csv("data/TreeMap_cloud/df_treemap_bis", function(data) {

console.log("Before:");
console.log(data);

var root = {"key":"Characters",
            "values":d3_v3.nest()
                       .key(function (d) { return d.parent; })
                       .entries(data)
            }

console.log("After:");
console.log(root);

var data_input = data;
drawWordCloud(accumulate_words(data_input));

var treemap = d3_v3.layout.treemap()
    .children(function(d, depth) { return depth ? null : d.values; })
    .value(function(d) { return d.value; }) // ok
    .sort(function(a, b) { return a.value - b.value; }) //ok
    .ratio(height / width * 0.5 * (1 + Math.sqrt(5)))
    .round(false);

  initialize(root);
  accumulate(root);
  layout(root);
  display(root);

  function initialize(root) {
    root.x = root.y = 0;
    root.dx = width;
    root.dy = height;
    root.depth = 0;
  }

  // Aggregate the values for internal nodes. This is normally done by the
  // treemap layout, but not here because of our custom implementation.
  function accumulate(d) {
    return d.values
        ? d.value = d.values.reduce(function(p, v) { return p + accumulate(v); }, 0) //ok
        : +d.value; //ok1
  }
  function accumulate_words(d){
    var final = d[0].value_bis
    for(i=1;i<d.length;i++){
      final = final + ", " + d[i].value_bis
    }
    return final
  }

  // Compute the treemap layout recursively such that each group of siblings
  // uses the same size (1×1) rather than the dimensions of the parent cell.
  // This optimizes the layout for the current zoom state. Note that a wrapper
  // object is created for the parent node for each group of siblings so that
  // the parent’s dimensions are not discarded as we recurse. Since each group
  // of sibling was laid out in 1×1, we must rescale to fit using absolute
  // coordinates. This lets us use a viewport to zoom.
  function layout(d) {
    if (d.values) {
      treemap.nodes({values: d.values});
      d.values.forEach(function(c) {
        c.x = d.x + c.x * d.dx;
        c.y = d.y + c.y * d.dy;
        c.dx *= d.dx;
        c.dy *= d.dy;
        c.parent = d;
        layout(c);
      });
    }
  }

  function display(d) {
    grandparent
        .datum(d.parent)
        .on("click", function (d){
          transition(d);
          clic_rect(d);
        })
        .select("text")
        .text(name_grandp(d));

    var g1 = svg.insert("g", ".grandparent")
        .datum(d)
        .attr("class", "depth");

    var g = g1.selectAll("g")
        .data(d.values)
        .enter().append("g");

    g.filter(function(d) { return d.values; })
        .classed("children", true)
        .on("click", transition);

    g.selectAll(".child")
        .data(function(d) { return d.values || [d]; })
        .enter().append("rect")
        .attr("class", "child")
        .call(rect);

    function clic_rect(d) {
      if ((d == null) || (d.parent == null)){
        drawWordCloud(accumulate_words(data));
      }
      else {
        if (d.key != null){
          word_filter = (Object.values(d.key)).join('')
        } else {
          word_filter = (Object.values(d.name)).join('')
        }
        data_filter = data.filter(function(row) {
            return row['parent'].key == word_filter ;
        })
        if (data_filter.length == 0){
          data_filter = data.filter(function(row) {
              return row['name'] == word_filter ;
          })
        }
        data_input = data_filter

        drawWordCloud(accumulate_words(data_input));
      }
      //if (d.values==null){
      //  drawWordCloud(accumulate_words(data_input));
      //}

      //console.log(d.parent);
      //plot_word_cloud(data_filter)
      //drawWordCloud(accumulate_words(data_filter));
      //console.log(accumulate_words(data_filter));
      //console.log(d.key || d.name);
      }

    g.append("rect")
        .attr("class", "parent")
        .call(rect)
        .on("click", function(d){ clic_rect(d);})
        .append("title")
        .text(function(d) { return formatNumber(+d.value); });

    g.append("foreignObject")
        .call(rect)
            /* open new window based on the json's URL value for leaf nodes */
            /* Firefox displays this on top
            .on("click", function(d) {
              if(!d.children){
                window.open(d.url);
            }
          })*/
        .attr("class","foreignobj")
        .append("xhtml:div")
        .attr("dy", ".75em")
        .attr("dx", ".95em")
        .html(function(d) { return name_child(d);})
        .attr("class","textdiv"); //textdiv class allows us to style the text easily with CSS


    //drawWordCloud(accumulate_words(data_input));

    function transition(d) {
      if (transitioning || !d) return;
      transitioning = true;

      var g2 = display(d),
          t1 = g1.transition().duration(750),
          t2 = g2.transition().duration(750);

      // Update the domain only after entering new elements.
      x.domain([d.x, d.x + d.dx]);
      y.domain([d.y, d.y + d.dy]);

      // Enable anti-aliasing during the transition.
      svg.style("shape-rendering", null);

      // Draw child nodes on top of parent nodes.
      svg.selectAll(".depth").sort(function(a, b) { return a.depth - b.depth; });

      // Fade-in entering text.
      g2.selectAll("text").style("fill-opacity", 0);
      g2.selectAll("foreignObject div").style("display", "none");

      // Transition to the new view.
      t1.selectAll("text").call(text).style("fill-opacity", 0);
      t2.selectAll("text").call(text).style("fill-opacity", 1);
      t1.selectAll("rect").call(rect);
      t2.selectAll("rect").call(rect);

      /* Foreign object */
      t1.selectAll(".textdiv").style("display", "none"); /* added */
      t1.selectAll(".foreignobj").call(foreign); /* added */
      t2.selectAll(".textdiv").style("display", "block"); /* added */
      t2.selectAll(".foreignobj").call(foreign); /* added */

      // Remove the old node when the transition is finished.
      t1.remove().each("end", function() {
        svg.style("shape-rendering", "crispEdges");
        transitioning = false;
      });

    }

    return g;
  }

  function text(text) {
    text.attr("x", function(d) { return x(d.x) + 6; })
        .attr("y", function(d) { return y(d.y) + 6; });
  }

  function rect(rect) {
    rect.attr("x", function(d) { return x(d.x); })
        .attr("y", function(d) { return y(d.y); })
        .attr("rx",8)
        .attr("ry",8)
        .attr("width", function(d) { return x(d.x + d.dx) - x(d.x); })
        .attr("height", function(d) { return y(d.y + d.dy) - y(d.y); });
  }

  function foreign(foreign){
			foreign.attr("x", function(d) { return x(d.x); })
			.attr("y", function(d) { return y(d.y); })
			.attr("width", function(d) { return x(d.x + d.dx) - x(d.x); })
			.attr("height", function(d) { return y(d.y + d.dy) - y(d.y); });
		}


  function name_grandp(d) {
    return d.parent
        ? name_grandp(d.parent) + " -> " + d.key
        : d.key;
  }

  function name_child(d) {
    if (d.name != null){
    name = Object.values(d.name).join('');
    name = name.split('_')[1];
    }
    if (d.key != null){
    key = Object.values(d.key).join('');
    key = key.fontsize(2);
    }
    return d.name
        ? name
        : key;
  }

  function concat_s(d) {
    return d.children
        ? d.value_bis + concat_s(d.children)
        : d.value_bis;
  }

  function plot_word_cloud(d) {
    drawWordCloud(accumulate_words(d));
  }

  function words_prepro(d) {
    var word_count = {};
    var words = d.replace(/[()\[\]\']/g, '').split(', ');
    for (i = 0; i < words.length; i++) {
      if (i % 2 == 0) {
        var word = words[i]
      }
      else {
        if (word_count[word] !=null){
          word_count[word]=word_count[word] + words[i]/1
        }
        else{
          word_count[word]=words[i]/1
        }
      }
    }
    return word_count;
  }
 //var test = "[(victarion, 44), (eye, 33), (balon, 24)]"
  //console.log(words_prepro(test));

  //drawWordCloud(text_string);

  // Constructs a new cloud layout instance. It run an algorythm to find the position of words that suits your requirements
  function drawWordCloud(text_string){

          var word_count = words_prepro(text_string);
          var chart = echarts.init(document.getElementById('cloud'));
          var data = [];
            for (var name in word_count) {
                data.push({
                    name: name,
                    value: Math.sqrt(word_count[name])
                })
            }
            var maskImage = new Image();
            var option = {
                series: [ {
                    type: 'wordCloud',
                    sizeRange: [10, 100],
                    rotationRange: [-90, 90],
                    rotationStep: 45,
                    gridSize: 2,
                    shape: 'pentagon',
                    maskImage: maskImage,
                    drawOutOfBound: false,
                    textStyle: {
                        normal: {
                            color: function () {
                                return 'rgb(' + [
                                    Math.round(Math.random() * 160),
                                    Math.round(Math.random() * 160),
                                    Math.round(Math.random() * 160)
                                ].join(',') + ')';
                            }
                        },
                        emphasis: {
                            color: 'red'
                        }
                    },
                    data: data.sort(function (a, b) {
                        return b.value  - a.value;
                    })
                } ]
            };
            maskImage.onload = function () {
                option.series[0].maskImage
                chart.setOption(option);
            }
            maskImage.src = '../img/shape_3.png';
            window.onresize = function () {
                chart.resize();
            }

        }
})
};

function books_data(){

  svg.selectAll(".depth").remove();

  d3_v3.csv("data/TreeMap_cloud/df_treemap", function(data) {

  console.log("Before:");
  console.log(data);

  var root = {"key":"Books",
              "values":d3_v3.nest()
                         .key(function (d) { return d.parent; })
                         .entries(data)
              }

  console.log("After:");
  console.log(root);

  var data_input = data
  drawWordCloud(accumulate_words(data_input));

  var treemap = d3_v3.layout.treemap()
      .children(function(d, depth) { return depth ? null : d.values; })
      .value(function(d) { return d.value; }) // ok
      .sort(function(a, b) { return a.value - b.value; }) //ok
      .ratio(height / width * 0.5 * (1 + Math.sqrt(5)))
      .round(false);

    initialize(root);
    accumulate(root);
    layout(root);
    display(root);

    function initialize(root) {
      root.x = root.y = 0;
      root.dx = width;
      root.dy = height;
      root.depth = 0;
    }

    // Aggregate the values for internal nodes. This is normally done by the
    // treemap layout, but not here because of our custom implementation.
    function accumulate(d) {
      return d.values
          ? d.value = d.values.reduce(function(p, v) { return p + accumulate(v); }, 0) //ok
          : +d.value; //ok1
    }
    function accumulate_words(d){
      var final = d[0].value_bis
      for(i=1;i<d.length;i++){
        final = final + ", " + d[i].value_bis
      }
      return final
    }

    // Compute the treemap layout recursively such that each group of siblings
    // uses the same size (1×1) rather than the dimensions of the parent cell.
    // This optimizes the layout for the current zoom state. Note that a wrapper
    // object is created for the parent node for each group of siblings so that
    // the parent’s dimensions are not discarded as we recurse. Since each group
    // of sibling was laid out in 1×1, we must rescale to fit using absolute
    // coordinates. This lets us use a viewport to zoom.
    function layout(d) {
      if (d.values) {
        treemap.nodes({values: d.values});
        d.values.forEach(function(c) {
          c.x = d.x + c.x * d.dx;
          c.y = d.y + c.y * d.dy;
          c.dx *= d.dx;
          c.dy *= d.dy;
          c.parent = d;
          layout(c);
        });
      }
    }

    function display(d) {
      grandparent
          .datum(d.parent)
          .on("click", function (d){
            transition(d);
            clic_rect(d);
          })
          .select("text")
          .text(name_grandp(d));

      var g1 = svg.insert("g", ".grandparent")
          .datum(d)
          .attr("class", "depth");

      var g = g1.selectAll("g")
          .data(d.values)
          .enter().append("g");

      g.filter(function(d) { return d.values; })
          .classed("children", true)
          .on("click", transition);

      g.selectAll(".child")
          .data(function(d) { return d.values || [d]; })
          .enter().append("rect")
          .attr("class", "child")
          .call(rect);

      function clic_rect(d) {
        if ((d == null) || (d.parent == null)){
          drawWordCloud(accumulate_words(data));
        }
        else {
          if (d.key != null){
            word_filter = (Object.values(d.key)).join('')
          } else {
            word_filter = (Object.values(d.name)).join('')
          }
          data_filter = data.filter(function(row) {
              return row['parent'].key == word_filter ;
          })
          if (data_filter.length == 0){
            data_filter = data.filter(function(row) {
                return row['name'] == word_filter ;
            })
          }
          data_input = data_filter

          drawWordCloud(accumulate_words(data_input));
        }
        //if (d.values==null){
        //  drawWordCloud(accumulate_words(data_input));
        //}

        //console.log(d.parent);
        //plot_word_cloud(data_filter)
        //drawWordCloud(accumulate_words(data_filter));
        //console.log(accumulate_words(data_filter));
        //console.log(d.key || d.name);
        }

      g.append("rect")
          .attr("class", "parent")
          .call(rect)
          .on("click", function(d){ clic_rect(d);})
          .append("title")
          .text(function(d) { return formatNumber(+d.value); });

      g.append("foreignObject")
          .call(rect)
              /* open new window based on the json's URL value for leaf nodes */
              /* Firefox displays this on top
              .on("click", function(d) {
                if(!d.children){
                  window.open(d.url);
              }
            })*/
          .attr("class","foreignobj")
          .append("xhtml:div")
          .attr("dy", ".75em")
          .attr("dx", ".95em")
          .html(function(d) { return name_child(d);})
          .attr("class","textdiv"); //textdiv class allows us to style the text easily with CSS


      //drawWordCloud(accumulate_words(data_input));

      function transition(d) {
        if (transitioning || !d) return;
        transitioning = true;

        var g2 = display(d),
            t1 = g1.transition().duration(750),
            t2 = g2.transition().duration(750);

        // Update the domain only after entering new elements.
        x.domain([d.x, d.x + d.dx]);
        y.domain([d.y, d.y + d.dy]);

        // Enable anti-aliasing during the transition.
        svg.style("shape-rendering", null);

        // Draw child nodes on top of parent nodes.
        svg.selectAll(".depth").sort(function(a, b) { return a.depth - b.depth; });
          // Fade-in entering text.
        g2.selectAll("text").style("fill-opacity", 0);
        g2.selectAll("foreignObject div").style("display", "none");

        // Transition to the new view.
        t1.selectAll("text").call(text).style("fill-opacity", 0);
        t2.selectAll("text").call(text).style("fill-opacity", 1);
        t1.selectAll("rect").call(rect);
        t2.selectAll("rect").call(rect);

        /* Foreign object */
  		  t1.selectAll(".textdiv").style("display", "none"); /* added */
  		  t1.selectAll(".foreignobj").call(foreign); /* added */
  		  t2.selectAll(".textdiv").style("display", "block"); /* added */
  		  t2.selectAll(".foreignobj").call(foreign); /* added */

        // Remove the old node when the transition is finished.
        t1.remove().each("end", function() {
          svg.style("shape-rendering", "crispEdges");
          transitioning = false;
        });

      }

      return g;
    }

    function text(text) {
      text.attr("x", function(d) { return x(d.x) + 6; })
          .attr("y", function(d) { return y(d.y) + 6; });
    }

    function rect(rect) {
      rect.attr("x", function(d) { return x(d.x); })
          .attr("y", function(d) { return y(d.y); })
          .attr("rx",8)
          .attr("ry",8)
          .attr("width", function(d) { return x(d.x + d.dx) - x(d.x); })
          .attr("height", function(d) { return y(d.y + d.dy) - y(d.y); });
    }

    function foreign(foreign){
  			foreign.attr("x", function(d) { return x(d.x); })
  			.attr("y", function(d) { return y(d.y); })
  			.attr("width", function(d) { return x(d.x + d.dx) - x(d.x); })
  			.attr("height", function(d) { return y(d.y + d.dy) - y(d.y); });
  		}

    function name_grandp(d) {
      return d.parent
          ? name_grandp(d.parent) + " -> " + d.key
          : d.key;
    }

    function name_child(d) {
      if (d.name != null){
      name = Object.values(d.name).join('');
      name = name.substr(1).fontsize(2);
      }
      return d.name
          ? name
          : d.key;

    }

    function concat_s(d) {
      return d.children
          ? d.value_bis + concat_s(d.children)
          : d.value_bis;
    }

    function plot_word_cloud(d) {
      drawWordCloud(accumulate_words(d))
    }

    function words_prepro(d) {
      var word_count = {};
      //word_count[" "]=0;
      var words = d.replace(/[()\[\]\']/g, '').split(', ');
      for (i = 0; i < words.length; i++) {
        if (i % 2 == 0) {
          //console.log(i % 2);
          var word = words[i]
        }
        else {
          if (word_count[word] !=null){
            word_count[word]=word_count[word] + words[i]/1
          }
          else{
            word_count[word]=words[i]/1
          }
        }
      }
      return word_count;
    }
   //var test = "[(victarion, 44), (eye, 33), (balon, 24)]"
    //console.log(words_prepro(test));

    //drawWordCloud(text_string);

    // Constructs a new cloud layout instance. It run an algorythm to find the position of words that suits your requirements
    function drawWordCloud(text_string){

            var word_count = words_prepro(text_string);
            var chart = echarts.init(document.getElementById('cloud'));
            var data = [];
              for (var name in word_count) {
                  data.push({
                      name: name,
                      value: Math.sqrt(word_count[name])
                  })
              }
              var maskImage = new Image();
              var option = {
                  series: [ {
                      type: 'wordCloud',
                      sizeRange: [10, 100],
                      rotationRange: [-90, 90],
                      rotationStep: 45,
                      gridSize: 2,
                      shape: 'pentagon',
                      maskImage: maskImage,
                      drawOutOfBound: false,
                      textStyle: {
                          normal: {
                              color: function () {
                                  return 'rgb(' + [
                                      Math.round(Math.random() * 160),
                                      Math.round(Math.random() * 160),
                                      Math.round(Math.random() * 160)
                                  ].join(',') + ')';
                              }
                          },
                          emphasis: {
                              color: 'red'
                          }
                      },
                      data: data.sort(function (a, b) {
                          return b.value  - a.value;
                      })
                  } ]
              };
              maskImage.onload = function () {
                  option.series[0].maskImage
                  chart.setOption(option);
              }
              maskImage.src = '../img/shape_3.png';
              window.onresize = function () {
                  chart.resize();
              }

          }
  });
};
