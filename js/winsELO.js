class WinsELO {
    constructor(parentElement, data) {
        this.parentElement = parentElement;
        this.data = data;

        // Set initial minTournaments value (default slider value)
        this.minTournaments = 5;

        // Initialize the visualization
        this.initVis();
    }

    initVis() {
        let vis = this;

        // Define margins and dimensions based on the parent element's size
        vis.margin = {top: 20, right: 50, bottom: 75, left: 50};
        vis.width = (document.getElementById(vis.parentElement).getBoundingClientRect().width) - vis.margin.left - vis.margin.right;
        vis.height = 400;

        // SVG drawing area
        vis.svg = d3.select(`#${vis.parentElement}`)
            .append("svg")
            .attr("width", vis.width + vis.margin.left + vis.margin.right)
            .attr("height", vis.height + vis.margin.top + vis.margin.bottom)
            .append("g")
            .attr("transform", `translate(${vis.margin.left},${vis.margin.top})`);

        vis.chartGroup = vis.svg.append("g");

        vis.wrangleData();
    }

    wrangleData() {
        let vis = this;

        // Group data by competitor
        let groupedData = d3.groups(vis.data, d => d.Code);

        // Process data for each competitor
        vis.competitorData = groupedData.map(([competitor, records]) => {
            // Filter records for valid Elo and Wins values
            let validRecords = records.filter(d => !isNaN(d.Elo) && !isNaN(d.Wins));

            // Count tournaments attended
            let tournamentsAttended = validRecords.length;

            // Calculate average wins across all tournaments
            let avgWins = d3.mean(validRecords, d => +d.Wins);

            // Find the ELO score specifically at the "Berk" tournament
            let berkRecord = validRecords.find(d => d.Tournament === "Berk");
            let berkELO = berkRecord ? +berkRecord.Elo : null;
            let gender = berkRecord ? berkRecord.Gender : "unknown";

            return {
                competitor,
                avgWins,
                berkELO,
                gender,
                tournamentsAttended
            };
        }).filter(d => d.tournamentsAttended >= vis.minTournaments && d.berkELO !== null); // Apply filters

        console.log("Filtered Competitor Data:", vis.competitorData);

        vis.updateVis();
    }

    updateVis() {
        let vis = this;

        // Remove the "No data available" text if it exists
        vis.chartGroup.selectAll(".no-data-text").remove();

        // Check if there is any data to visualize
        if (vis.competitorData.length === 0) {
            vis.chartGroup.selectAll("*").remove(); // Clear all elements
            vis.chartGroup.append("text")
                .attr("class", "no-data-text") // Add a class for easy identification
                .attr("x", vis.width / 2)
                .attr("y", vis.height / 2)
                .attr("text-anchor", "middle")
                .style("font-size", "16px")
                .style("fill", "black")
                .text("No data available for the selected filter.");
            return;
        }

        // Clear previous visualization elements if data exists
        vis.chartGroup.selectAll(".dot").remove();
        vis.chartGroup.selectAll(".x-axis").remove();
        vis.chartGroup.selectAll(".y-axis").remove();
        vis.chartGroup.selectAll(".x-axis-label").remove();
        vis.chartGroup.selectAll(".y-axis-label").remove();

        // Set up scales
        vis.xScale = d3.scaleLinear()
            .domain([
                d3.min(vis.competitorData, d => d.berkELO) * 0.9,
                d3.max(vis.competitorData, d => d.berkELO) * 1.1
            ])
            .range([0, vis.width]);

        vis.yScale = d3.scaleLinear()
            .domain([
                0,
                d3.max(vis.competitorData, d => d.avgWins) * 1.1
            ])
            .range([vis.height, 0]);

        // Bind data to circles
        const dots = vis.chartGroup.selectAll(".dot")
            .data(vis.competitorData, d => d.competitor); // Use competitor as the key

        // ENTER selection
        const enterDots = dots.enter()
            .append("circle")
            .attr("class", "dot")
            .attr("cx", d => vis.xScale(d.berkELO)) // Initial position
            .attr("cy", vis.height) // Start at the bottom of the chart
            .attr("r", 5)
            .attr("fill", d => d.gender === "girl" ? "#E9A7A4" : "#233165")
            .attr("opacity", 0.6);

        // UPDATE selection
        dots.merge(enterDots)
            .transition() // Transition for both new and updated elements
            .duration(1000)
            .attr("cx", d => vis.xScale(d.berkELO)) // Move to new x position
            .attr("cy", d => vis.yScale(d.avgWins)); // Move to new y position

        // EXIT selection
        dots.exit()
            .transition()
            .duration(500)
            .attr("opacity", 0) // Fade out
            .remove();

        // Add x-axis
        vis.chartGroup.append("g")
            .attr("class", "x-axis")
            .attr("transform", `translate(0,${vis.height})`)
            .call(d3.axisBottom(vis.xScale))
            .selectAll("text")
            .style("fill", "black")
            .style("font-family", "Oswald")

        // Add x-axis label
        vis.chartGroup.append("text")
            .attr("class", "x-axis-label")
            .attr("x", vis.width / 2)
            .attr("y", vis.height + vis.margin.bottom / 2)
            .attr("text-anchor", "middle")
            .style("font-size", "12px")
            .style("fill", "black")
            .style("font-family", "Oswald")
            .text("End of Year ELO");

        // Add y-axis
        vis.chartGroup.append("g")
            .attr("class", "y-axis")
            .call(d3.axisLeft(vis.yScale))
            .style("font-family", "Oswald");

        // Add y-axis label
        vis.chartGroup.append("text")
            .attr("class", "y-axis-label")
            .attr("x", -vis.height / 2)
            .attr("y", -vis.margin.left / 1.5)
            .attr("transform", "rotate(-90)")
            .attr("text-anchor", "middle")
            .style("font-size", "12px")
            .style("fill", "black")
            .style("font-family", "Oswald")
            .text("Average Wins Across Tournaments");
    }


}
