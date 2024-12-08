// Legend data
let legendData = [
    { label: "Boys", color: "#233165" },
    { label: "Girls", color: "#E9A7A4" }
];

// SVG container for legend
let legendWidth = 1000;
let legendHeight = 40;

let legendSvg = d3.select("#legend")
    .append("svg")
    .attr("width", legendWidth)
    .attr("height", legendHeight);

// Create groups for each legend item
let legendGroup = legendSvg.selectAll(".legend-item")
    .data(legendData)
    .enter()
    .append("g")
    .attr("class", "legend-item")
    .attr("transform", (d, i) => `translate(${i * 100}, 0)`); // Adjust spacing between items

// Add circles to represent colors
legendGroup.append("circle")
    .attr("cx", 2*legendWidth/5) // X position
    .attr("cy", 20) // Y position
    .attr("r", 8) // Circle radius
    .attr("fill", d => d.color); // Circle color

// Add text labels
legendGroup.append("text")
    .attr("x",  2*legendWidth/5 + 16) // Position relative to circle
    .attr("y", 25) // Align with circle
    .style("font-size", "12px")
    .style("font-family", "Oswald")
    .text(d => d.label);
