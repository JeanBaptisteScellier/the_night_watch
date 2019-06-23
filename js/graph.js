// Definition of general variables
var diameter = 850,
	radius = diameter / 2,
	innerRadius = radius - 120;

var cluster = d3.cluster()
    .size([360, innerRadius]);

var line = d3.radialLine()
    .curve(d3.curveBundle.beta(1))
    .radius(d => d.y)
    .angle(d => d.x / 180 * Math.PI);

var svg = d3.select("div#graph_1").append("svg")
    .attr("width", diameter)
    .attr("height", diameter)
  .append("g")
    .attr("transform", "translate(" + radius + "," + radius + ")");

var linkg = svg.append("g").attr("class", "linkgs").selectAll(".linkg"),
    nodeg = svg.append("g").selectAll(".nodeg");
    
d3.json("./data/graph_1_data.json", function(error, relationships) {
  if (error) throw error;
  var root = relationshipHierarchy(relationships);
  cluster(root);

  nodeg = nodeg
    .data(root.leaves())
    .enter().append("text")
      .attr("class","nodeg")
      .attr("id", d => d.data.character_id)
      .attr("fill", function function_name(d) {
        var color;
        if (d.data.gender === "F") {
          color = "#f368e0";
        }
         else if(d.data.gender === "M") {
          color = "#2e86de";
         } else {
          if(d.data.gender === "D") {
            color = "#ffa801";
          }
         }
        return color;
      })
      .attr("dy", "0.31em")
      .attr("transform", function(d) { return "rotate(" + (d.x - 90) + ")translate(" + (d.y + 8) + ",0)" + (d.x < 180 ? "" : "rotate(180)"); })
      .attr("text-anchor", function(d) { return d.x < 180 ? "start" : "end"; })
      .text(function(d) { return d.data.name; });

    linkg
    .data(relationshipLinks(root.leaves(), relationships, "character_parents"))
    .enter().append("path")
      .each(function(d) { d.source = d[0], d.target = d[d.length - 1]; })
      .attr("class", "linkg")
      .attr("id", d => d.source.data.character_id)
      .attr("d", line);

  d3.select("#relation")
    .on("change", updateGraph);

  d3.selectAll("html").on("click", function function_name(d) {
    var tooltipWithContent = d3.selectAll(".nodeg");
    function equalToEventTarget() {
        return this == d3.event.target;
    }

    var outside = tooltipWithContent.filter(equalToEventTarget).empty();
    if (outside) {
      d3.selectAll(".linkg").classed('link-grey', false);
      d3.selectAll(".linkg").classed('link-selected', false);
      d3.selectAll(".nodeg").classed('clicked', false);
      }
  })
  // cette fonction sera remplacée
  d3.selectAll(".nodeg").on("click", function function_name(d) {
    var char_id = d.data.character_id;

    d3.selectAll(".linkg").classed('link-grey', false);
    d3.selectAll(".linkg").classed('link-selected', false);
    d3.selectAll(".nodeg").classed('clicked', false);
    d3.select(this).classed("clicked", d3.select(this).classed("clicked") ? false : true);
    d3.selectAll(".linkg").classed('link-grey', true);
    d3.selectAll(".linkg#" + char_id).classed('link-selected', true);
  })
  // ---> end of function

  $(".nodeg").on("click", function update_all() {
    var char_id = $(this).attr("id");
    drawTree(null, char_id);
  })
  


  function updateGraph() {
    d3.selectAll(".nodeg").classed('clicked', false);
    d3.selectAll(".linkg").remove();
    var form = document.getElementById("relation");
    for(var i=0; i<form.length; i++){
        if(form[i].checked){
          form_val = form[i].id;}}

    linkg
    .data(relationshipLinks(root.leaves(), relationships, form_val))
    .enter().append("path")
      .each(function(d) { d.source = d[0], d.target = d[d.length - 1]; })
      .attr("class", "linkg")
      .attr("id", d => d.source.data.character_id)
      .attr("d", line);

  }

})

function relationshipLinks(nodes, relationships, relation) {
  var map = {},
      links = [];

  nodes.forEach(function(d) {
    //console.log(d.data.name)
    map[d.data.name] = d;
  });
  // For each import, construct a link from the source to target node.
  nodes.forEach(function(d) {
    var name = d.data.name;
    if (d.data[relation].length !== 0) {
      d.data[relation].forEach(function(i) {
          links.push(map[d.data.name].path(map[i]));
        });
    }
  });

  return links;
}


function relationshipHierarchy(relationships) {
  var map = {};

  function createMap(relationship) {
    var house = relationship.house;
    var masterNode = map[house];
    if (!masterNode) {
      masterNode = map[house] = {name: house, children: []};
    }
    map[house].children.push(relationship);
  }

  function returnDict(a){
    return map[a];
  }

  relationships.forEach(d => createMap(d));
  var finalMap = {name: "", children: [{name:"root", children: Array.from(Object.keys(map), d => returnDict(d))}]};
  return d3.hierarchy(finalMap);
}

$("nav a").on("click", function function_name(argument) {
  var target = $(this).attr("href");
  scrollTo($(target));
})

$(".lead a").on("click", function function_name(argument) {
  var target = $(this).attr("href");
  scrollTo($(target));
})

function scrollTo( target ) {
        if( target.length ) {
            $("html, body").stop().animate( { scrollTop: target.offset().top }, 500);
        }
    }