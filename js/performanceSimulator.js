class PerformanceSimulator {

    constructor(parentElement, data) {
        this.parentElement = parentElement;
        this.data = data;

        // Initialize the visualization
        this.initVis();
    }

    initVis() {
        let vis = this;

        // Define margins and dimensions based on the parent element's size
        vis.margin = {top: 60, right: 20, bottom: 10, left: 50}; // Increased top margin for title
        vis.width = (document.getElementById(vis.parentElement).getBoundingClientRect().width / 3) - vis.margin.left - vis.margin.right;
        vis.height = (document.getElementById(vis.parentElement).getBoundingClientRect().width / 3) - vis.margin.top - vis.margin.bottom;

        // SVG drawing area
        vis.svg = d3.select(`#${vis.parentElement}`)
            .append("svg")
            .attr("width", vis.width + vis.margin.left + vis.margin.right)
            .attr("height", vis.height + vis.margin.top + vis.margin.bottom)
            .append("g")
            .attr("transform", `translate(${vis.margin.left},${vis.margin.top})`);


        // Wrangle data to calculate required statistics
        vis.wrangleData();
    }

    wrangleData() {
        let vis = this;

        let filteredData = vis.data.filter(d => d.Tournament === "Berk");

        // Calculate total boys and girls within the filtered data
        let boysData = filteredData.filter(d => d.Gender === "boy");
        let girlsData = filteredData.filter(d => d.Gender === "girl");

        vis.totalBoys = boysData.length;
        vis.totalGirls = girlsData.length;

        // Calculate average wins and average ELO for the filtered data
        vis.avgWins = d3.mean(filteredData, d => +d.Wins);
        vis.avgELO = d3.mean(filteredData, d => +d.Elo);

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
