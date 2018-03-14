import * as d3 from "d3";
import data from "./data.json";
import data1 from "./data1.json";
import company from "./company.svg";
import person from "./person.svg";
import transaction from "./transaction.svg";

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
        .distance(250)
        .strength(1.5)
    )
    .force("charge", d3.forceManyBody())
    .force("center", d3.forceCenter(width / 2, height / 2));

  let transactionId = history.state ? history.state.transaction : null;

  if (!transactionId) {
    const match = /\btransaction=([^&]+)/gi.exec(location.search);
    if (match) {
      transactionId = match[1];
    } else {
      transactionId = "200160"; // default
    }
    history.replaceState(
      { transaction: transactionId },
      null,
      `?transaction=${transactionId}`
    );
  }

  // d3.json(`http://localhost:5000/intelligence/relationships?transaction=${transactionId}`, function(error, graph) {
  d3.json(`http://localhost:8080/${data}`, function(error, graph) {
    if (error) throw error;

    graph.transactions.forEach(t => {
      t.source = t.from;
      t.target = t.to;
    });

    let link = svg
      .append("g")
      .selectAll("line")
      .data(graph.transactions)
      .enter()
      .append("line")
      .attr("class", function(d) {
        const css = ["links"];
        if (d.id === graph.transaction.id) {
          css.push("focus");
        }
        if (d.score === 1) {
          css.push("suspect");
        }
        return css.join(" ");
      })
      .attr("stroke-width", 8)
      .on("mouseover", showQuickInfoForLink)
      .on("mouseout", hideQuickInfoForLink)
      .on("click", linkClicked);

    let node = svg
      .append("g")
      .attr("class", "nodes")
      .selectAll("circle")
      .data(graph.accounts)
      .enter()
      .append("path")
      .attr(
        "d",
        d3
          .symbol()
          .type(function(d) {
            return d.type === "Organisation"
              ? d3.symbolSquare
              : d3.symbolCircle;
          })
          .size(`${40 * 40}`)
      )
      .attr("fill", function(d) {
        return d.score === 1 ? "#f00" : color(d.group);
      })
      .on("mouseover", showQuickInfoForNode)
      .on("mouseout", hideQuickInfoForNode)
      .on("click", nodeClicked)
      .call(
        d3
          .drag()
          .on("start", dragstarted)
          .on("drag", dragged)
          .on("end", dragended)
      );

    function showQuickInfoForLink(d, i) {
      d3
        .select(this)
        .transition()
        .style("stroke", d.score === 1 ? "#880000" : "#333");

      var x = (d.source.x + d.target.x) / 2;
      var y = (d.source.y + d.target.y) / 2;

      d3
        .select("#info")
        .style("visibility", "visible")
        .style("top", y > window.innerHeight / 2 ? y - 20 - 70 : y + 20)
        .style("left", x > window.innerWidth / 2 ? x - 20 - 150 : x + 20)
        .text(`${d.description} — $${d.amount}`);
    }

    function hideQuickInfoForLink(d, i) {
      d3
        .select(this)
        .transition()
        .style("stroke", d.score === 1 ? "#f00" : "#999");

      hideQuickInfo();
    }

    function linkClicked(d, i) {
      if (d3.event.defaultPrevented) return; // dragged

      d3
        .select(this)
        .transition()
        .style("stroke", "black")
        .transition()
        .style("stroke", d.score === 1 ? "#f00" : "#999");

      var x = (d.source.x + d.target.x) / 2;
      var y = (d.source.y + d.target.y) / 2;

      d3.select("#details").style("right", 0);

      d3.select("#details_name").text("Transaction");

      d3.select("#details_img").attr("src", transaction);

      d3.select("#details_text1").text(d.amount);

      d3.select("#details_text2").text(d.description);

      drilldown(d.id);
    }

    function showQuickInfoForNode(d, i) {
      d3
        .select(this)
        .transition()
        .attr(
          "d",
          d3
            .symbol()
            .type(d.type === "Organisation" ? d3.symbolSquare : d3.symbolCircle)
            .size(`${60 * 60}`)
        );

      d3
        .select("#info")
        .style("visibility", "visible")
        .style("top", d.y > window.innerHeight / 2 ? d.y - 20 - 70 : d.y + 20)
        .style("left", d.x > window.innerWidth / 2 ? d.x - 20 - 150 : d.x + 20)
        .text(d.name);
    }

    function hideQuickInfoForNode(d, i) {
      d3
        .select(this)
        .transition()
        .attr(
          "d",
          d3
            .symbol()
            .type(d.type === "Organisation" ? d3.symbolSquare : d3.symbolCircle)
            .size(`${40 * 40}`)
        );

      hideQuickInfo();
    }

    function hideQuickInfo() {
      d3
        .select("#info")
        .style("visibility", "hidden")
        .text("");
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
        .style("fill", d.score === 1 ? "#f00" : color(d.group));

      d3.select("#details").style("right", 0);

      d3
        .select("#details_img")
        .attr("src", d.type === "Organisation" ? company : person);

      d3.select("#details_name").text(d.name);
      d3.select("#details_text1").text("");

      d3.select("#details_text2").text("");
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

      node.attr("transform", function(d) {
        return `translate(${d.x},${d.y})`;
      });
    }
  });

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

  function drilldown(transactionId) {
    console.log(transactionId);
    history.pushState(
      { transaction: transactionId },
      null,
      `?transaction=${transactionId}`
    );

    // TODO: update graph
  }
});
