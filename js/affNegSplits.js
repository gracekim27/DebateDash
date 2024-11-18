class AffNegSplits {
    constructor(parentElement, data) {
        this.parentElement = parentElement;
        this.data = data;

        // Initialize the visualization
        this.initVis();
    }

    initVis() {
        let vis = this;

        // Define margins and dimensions based on the parent element's size
        vis.margin = { top: 60, right: 10, bottom: 120, left: 50 }; // Increased bottom margin for legend
        vis.width = (document.getElementById(vis.parentElement).getBoundingClientRect().width / 3 + 10) - vis.margin.left - vis.margin.right;
        vis.height = 500; // Adjust as needed based on the number of rows and layout

        // SVG drawing area
        vis.svg = d3.select(`#${vis.parentElement}`)
            .append("svg")
            .attr("width", vis.width + vis.margin.left + vis.margin.right)
            .attr("height", vis.height + vis.margin.top + vis.margin.bottom);

        // Create a group for static elements (title and legend)
        vis.staticGroup = vis.svg.append("g")
            .attr("transform", `translate(${vis.margin.left},${vis.margin.top})`);

        // Add Legend below the pie charts
        let legend = vis.staticGroup.append("g")
            .attr("class", "legend")
            .attr("transform", `translate(${vis.width / 2 - 100}, ${vis.height})`);

        // Legend for "Aff Wins"
        legend.append("rect")
            .attr("x", 80)
            .attr("y", 0)
            .attr("width", 15)
            .attr("height", 15)
            .attr("fill", "#40e36b"); // Color for "Aff Wins"

        legend.append("text")
            .attr("x", 105)
            .attr("y", 12)
            .attr("font-size", "12px")
            .attr("fill", "white")
            .text("Aff Wins")
            .style("font-family", "Arial");

        // Legend for "Neg Wins"
        legend.append("rect")
            .attr("x", 0) // Spacing between legends
            .attr("y", 0)
            .attr("width", 15)
            .attr("height", 15)
            .attr("fill", "#e34040"); // Color for "Neg Wins"

        legend.append("text")
            .attr("x", 20)
            .attr("y", 12)
            .attr("font-size", "12px")
            .attr("fill", "white")
            .text("Neg Wins")
            .style("font-family", "Arial");

        // Create a group for dynamic content (pie charts) that will be cleared and redrawn
        vis.chartGroup = vis.svg.append("g")
            .attr("transform", `translate(${vis.margin.left},${vis.margin.top})`);

        vis.wrangleData();
    }

    wrangleData() {
        let vis = this;

        // Process data to extract relevant fields for pie charts
        vis.processedData = vis.data.map(d => ({
            Tournament: d.Tournament,
            affWinPercentage: +d["Aff Win %"],
            negWinPercentage: +d["Neg Win %"]
        }));

        console.log(vis.processedData);

        vis.updateVis();
    }

    updateVis() {
        let vis = this;

        // Clear previous dynamic content before re-rendering
        vis.chartGroup.selectAll("*").remove();

        // Ensure radius is set before defining arc
        vis.radius = 30;

        // Define pie layout and arc generator
        const pie = d3.pie()
            .value(d => d.value)
            .sort(null);

        const arc = d3.arc()
            .innerRadius(0)
            .outerRadius(vis.radius);

        // Define color scale
        vis.color = d3.scaleOrdinal(["#40e36b", "#e34040"]); // Colors for Aff and Neg

        // Custom layout based on specified column and row arrangement
        const layout = [
            ["Greenhill", "MidAmerica", "Bronx"],
            ["Heart", "Apple Valley", "Glenbrooks"],
            ["HarvWest", "Emory", "Harvard", "Berk"]
        ];

        // Iterate over layout array to arrange pie charts
        layout.forEach((column, colIndex) => {
            column.forEach((tournamentName, rowIndex) => {
                // Find the data for the current tournament
                let d = vis.processedData.find(item => item.Tournament === tournamentName);
                if (!d) return; // Skip if no data is found for this tournament

                // Prepare pie chart data
                let pieData = pie([
                    { label: "Aff Win %", value: d.affWinPercentage },
                    { label: "Neg Win %", value: d.negWinPercentage }
                ]);

                // Calculate x and y positions for each pie chart
                let x = colIndex * vis.radius * 5;  // Adjust for column spacing
                let y = rowIndex * vis.radius * 3.5;  // Adjust for row spacing

                // Create a group for each tournament pie chart
                let tournamentGroup = vis.chartGroup.append("g")
                    .attr("transform", `translate(${x + vis.radius * 2}, ${y + vis.radius * 2})`);

                // Append tournament label above the pie chart
                tournamentGroup.append("text")
                    .attr("x", 0)
                    .attr("y", -vis.radius - 10)
                    .attr("text-anchor", "middle")
                    .attr("font-size", "12px")
                    .style("fill", "white")
                    .style("font-family", "Arial")
                    .text(d.Tournament);

                // Draw the pie chart slices
                tournamentGroup.selectAll("path")
                    .data(pieData)
                    .enter()
                    .append("path")
                    .attr("d", arc)
                    .attr("fill", (sliceData, idx) => vis.color(idx))
                    .attr("stroke", "white")
                    .attr("stroke-width", 1);
            });
        });
    }
}