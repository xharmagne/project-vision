import * as d3 from "d3";
import data from "./data.js";
import company from "./company.svg";

document.addEventListener("DOMContentLoaded", function(event) {
  const svg = d3.select("svg");
  const width = window.innerWidth;
  const height = window.innerHeight;

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
        .distance(120)
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

  let link = svg
    .append("g")
    .attr("class", "links")
    .selectAll("line")
    .data(graph.transactions)
    .enter()
    .append("line")
    .attr("stroke-width", 8)
    .on("click", linkClicked);

  let node = svg
    .append("g")
    .attr("class", "nodes")
    .selectAll("circle")
    .data(graph.accounts)
    .enter()
    .append("circle")
    .attr("r", 20)
    .attr("fill", function(d) {
      return color(d.group);
    })

    .on("click", nodeClicked)
    .call(
      d3
        .drag()
        .on("start", dragstarted)
        .on("drag", dragged)
        .on("end", dragended)
    );

  function linkClicked(d, i) {
    if (d3.event.defaultPrevented) return; // dragged

    d3
      .select(this)
      .transition()
      .style("stroke", "black")
      .transition()
      .style("stroke", "#999");

    var x = (d.source.x + d.target.x) / 2;
    var y = (d.source.y + d.target.y) / 2;

    d3
      .select("#info")
      .style("visibility", "visible")
      .style("top", y > window.innerHeight / 2 ? y - 20 - 70 : y + 20)
      .style("left", x > window.innerWidth / 2 ? x - 20 - 150 : x + 20)
      .text(`${d.description} — $${d.amount}`);
  }

  function nodeClicked(d, i) {
    if (d3.event.defaultPrevented) return; // dragged

    d3
      .select(this)
      .transition()
      .style("fill", "black")
      .attr("r", 40)
      .transition()
      .attr("r", 20)
      .style("fill", color(d.group));

    d3
      .select("#info")
      .style("visibility", "visible")
      .style("top", d.y > window.innerHeight / 2 ? d.y - 20 - 70 : d.y + 20)
      .style("left", d.x > window.innerWidth / 2 ? d.x - 20 - 150 : d.x + 20)
      .text(d.name);
  }

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
