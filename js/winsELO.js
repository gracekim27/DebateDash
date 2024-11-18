class WinsELO {
    constructor(parentElement, data) {
        this.parentElement = parentElement;
        this.data = data;

        // Initialize the visualization
        this.initVis();
    }

    initVis() {
        let vis = this;

        // Define margins and dimensions based on the parent element's size
        vis.margin = {top: 60, right: 20, bottom: 100, left: 50};
        vis.width = (document.getElementById(vis.parentElement).getBoundingClientRect().width / 2) - vis.margin.left - vis.margin.right;
        vis.height = (document.getElementById(vis.parentElement).getBoundingClientRect().width / 2) - vis.margin.top - vis.margin.bottom;

        // SVG drawing area
        vis.svg = d3.select(`#${vis.parentElement}`)
            .append("svg")
            .attr("width", vis.width + vis.margin.left + vis.margin.right)
            .attr("height", vis.height + vis.margin.top + vis.margin.bottom)
            .append("g")
            .attr("transform", `translate(${vis.margin.left},${vis.margin.top})`);


        // Create a group element with margins applied
        vis.chartGroup = vis.svg.append("g")
            .attr("transform", `translate(0, ${20})`);

        vis.wrangleData();
    }

    wrangleData() {
        let vis = this;

        // Group data by competitor and calculate average wins and ELO at Berk
        let groupedData = d3.groups(vis.data, d => d.Code);

        vis.competitorData = groupedData.map(([competitor, records]) => {
            // Calculate the average wins across all tournaments
            let avgWins = d3.mean(records, d => +d.Wins);

            // Find the ELO score specifically at the Berk tournament
            let berkRecord = records.find(d => d.Tournament === "Berk");
            let berkELO = berkRecord ? +berkRecord.Elo : null;
            let gender = berkRecord ? berkRecord.Gender : null;

            return { competitor, avgWins, berkELO, gender };
        }).filter(d => d.berkELO !== null); // Filter out competitors who didn't attend Berk

        console.log("Competitor Data:", vis.competitorData);

        vis.updateVis();
    }

    updateVis() {
        let vis = this;

        // Clear previous elements
        vis.chartGroup.selectAll("*").remove();

        // Set up x and y scales based on competitorData
        vis.xScale = d3.scaleLinear()
            .domain([d3.min(vis.competitorData, d => d.berkELO) * 0.9, d3.max(vis.competitorData, d => d.berkELO) * 1.1])
            .range([0, vis.width]);

        vis.yScale = d3.scaleLinear()
            .domain([0, d3.max(vis.competitorData, d => d.avgWins) * 1.1])
            .range([vis.height, 0]);

        // Draw scatter plot points for each competitor
        vis.chartGroup.selectAll(".dot")
            .data(vis.competitorData)
            .enter()
            .append("circle")
            .attr("class", "dot")
            .attr("cx", d => vis.xScale(d.berkELO))
            .attr("cy", d => vis.yScale(d.avgWins))
            .attr("r", 5)
            .attr("fill", d => d.gender === "girl" ? "pink" : "lightblue") // Set color based on gender
            .attr("opacity", 0.5);

        // Add x-axis with styling
        vis.chartGroup.append("g")
            .attr("class", "x-axis")
            .attr("transform", `translate(0,${vis.height})`)
            .call(d3.axisBottom(vis.xScale))
            .selectAll("text")
            .style("fill", "white");

        vis.chartGroup.select(".x-axis")
            .selectAll("path, line")
            .style("stroke", "white");

        // Add x-axis label
        vis.chartGroup.append("text")
            .attr("x", vis.width / 2)
            .attr("y", vis.height + vis.margin.bottom / 2)
            .attr("text-anchor", "middle")
            .style("font-size", "14px")
            .style("fill", "white")
            .style("font-family", "Arial")
            .text("ELO at Season End");

        // Add y-axis with styling
        vis.chartGroup.append("g")
            .attr("class", "y-axis")
            .call(d3.axisLeft(vis.yScale))
            .selectAll("text")
            .style("font-family", "Arial")
            .style("fill", "white");

        vis.chartGroup.select(".y-axis")
            .selectAll("path, line")
            .style("stroke", "white");

        // Add y-axis label
        vis.chartGroup.append("text")
            .attr("x", -vis.height / 2)
            .attr("y", -vis.margin.left / 1.5)
            .attr("transform", "rotate(-90)")
            .attr("text-anchor", "middle")
            .style("font-size", "14px")
            .style("fill", "white")
            .style("font-family", "Arial")
            .text("Average Wins Across Tournaments");
    }
}
