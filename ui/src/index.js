import * as d3 from "d3";
import data from "./data.js";
import company from "./company.svg";

document.addEventListener("DOMContentLoaded", function(event) {
  const svg = d3.select("svg");
  const width = svg.attr("width");
  const height = svg.attr("height");

  let color = d3.scaleOrdinal(d3.schemeCategory20);

  let simulation = d3
    .forceSimulation()
    .force(
      "link",
      d3
        .forceLink()
        .id(function(d) {
          return d.accountNumber;
        })
        .distance(80)
        .strength(1)
    )
    .force("charge", d3.forceManyBody())
    .force("center", d3.forceCenter(width / 2, height / 2));

  // d3.json("http://localhost:8081/data.json", function(error, graph) {
  //   if (error) throw error;

  const graph = data;
  graph.transactions.forEach(t => {
    t.source = t.from;
    t.target = t.to;
  });

  console.log("t", graph);

  let link = svg
    .append("g")
    .attr("class", "links")
    .selectAll("line")
    .data(graph.transactions)
    .enter()
    .append("line")
    .attr("stroke-width", 1);

  let node = svg
    .append("g")
    .attr("class", "nodes")
    .selectAll("circle")
    .data(graph.accounts)
    .enter()
    .append("circle")
    .attr("r", 10)
    .attr("fill", function(d) {
      return color(d.group);
    })
    // .attr("fill", "url(#company)")
    .call(
      d3
        .drag()
        .on("start", dragstarted)
        .on("drag", dragged)
        .on("end", dragended)
    );

  node.append("title").text(function(d) {
    return d.name;
  });

  simulation.nodes(graph.accounts).on("tick", ticked);

  simulation.force("link").links(graph.transactions);

  function ticked() {
    link
      .attr("x1", function(d) {
        return d.source.x;
      })
      .attr("y1", function(d) {
        return d.source.y;
      })
      .attr("x2", function(d) {
        return d.target.x;
      })
      .attr("y2", function(d) {
        return d.target.y;
      });

    node
      .attr("cx", function(d) {
        return d.x;
      })
      .attr("cy", function(d) {
        return d.y;
      });
  }
  // });

  function dragstarted(d) {
    if (!d3.event.active) simulation.alphaTarget(0.3).restart();
    d.fx = d.x;
    d.fy = d.y;
  }

  function dragged(d) {
    d.fx = d3.event.x;
    d.fy = d3.event.y;
  }

  function dragended(d) {
    if (!d3.event.active) simulation.alphaTarget(0);
    d.fx = null;
    d.fy = null;
  }
});
