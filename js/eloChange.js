class EloChange {
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
        vis.margin = {top: 20, right: 50, bottom: 40, left: 50};
        vis.width = (document.getElementById(vis.parentElement).getBoundingClientRect().width ) - vis.margin.left - vis.margin.right;
        vis.height = 350 - vis.margin.bottom - vis.margin.top;

        // SVG drawing area
        vis.svg = d3.select(`#${vis.parentElement}`)
            .append("svg")
            .attr("width", vis.width + vis.margin.left + vis.margin.right)
            .attr("height", vis.height + vis.margin.top + vis.margin.bottom)
            .append("g")
            .attr("transform", `translate(${vis.margin.left},${vis.margin.top})`);

        // Create a group for dynamic content (line chart)
        vis.chartGroup = vis.svg.append("g");

        // Define the tournament order
        vis.tournamentOrder = [
            "Greenhill", "MidAmerica", "Bronx", "Heart", "Apple Valley",
            "Glenbrooks", "HarvWest", "Emory", "Harvard", "Berk"
        ];

        vis.wrangleData();
    }

    wrangleData() {
        let vis = this;

        // Group data by competitor
        let groupedData = d3.groups(vis.data, d => d.Code);

        // Process data for each competitor
        vis.competitorData = groupedData.map(([competitor, records]) => {
            let gender = records[0]?.Gender || "unknown"; // Handle missing gender

            // Map all tournaments to create ordered structure
            let orderedRecords = vis.tournamentOrder.map(tournament => {
                // Find the record for the specific tournament
                let record = records.find(d => d.Tournament === tournament);
                return {
                    Tournament: tournament,
                    Elo: record ? +record.Elo : null, // Use null if no record exists
                    Competed: record && !isNaN(record.Wins) // True if Wins is not NA
                };
            });

            // Count only tournaments where the competitor actually competed
            let tournamentsAttended = orderedRecords.filter(d => d.Competed).length;

            // Debugging: log competitor and tournaments attended
            console.log("Competitor:", competitor, "Tournaments Attended:", tournamentsAttended);

            return {
                competitor,
                gender,
                records: orderedRecords,
                tournamentsAttended
            };
        }).filter(d => d.tournamentsAttended >= vis.minTournaments); // Apply the filter

        vis.updateVis();
    }



    updateVis() {
        let vis = this;

        // Clear previous elements (only for axes and labels)
        vis.chartGroup.selectAll(".x-axis").remove();
        vis.chartGroup.selectAll(".y-axis").remove();
        vis.chartGroup.selectAll(".x-axis-label").remove();
        vis.chartGroup.selectAll(".y-axis-label").remove();

        // Check if there is any data to visualize
        if (vis.competitorData.length === 0) {
            vis.chartGroup.selectAll("*").remove(); // Clear existing no-data text
            vis.chartGroup.append("text")
                .attr("class", "no-data-text")
                .attr("x", vis.width / 2)
                .attr("y", vis.height / 2)
                .attr("text-anchor", "middle")
                .style("font-size", "16px")
                .style("fill", "black")
                .text("No data available for the selected filter.");
            return;
        }

        // Remove no-data text if data is available
        vis.chartGroup.selectAll(".no-data-text").remove();

        // Define scales
        vis.xScale = d3.scalePoint()
            .domain(vis.tournamentOrder)
            .range([0, vis.width])
            .padding(0.5); // Space between points

        vis.yScale = d3.scaleLinear()
            .domain([
                d3.min(vis.competitorData, c => d3.min(c.records, r => r.Elo)) * 0.9,
                d3.max(vis.competitorData, c => d3.max(c.records, r => r.Elo)) * 1.1
            ])
            .range([vis.height, 0]);

        // Define line generator
        const line = d3.line()
            .x(d => vis.xScale(d.Tournament))
            .y(d => vis.yScale(d.Elo));

        // Bind data to lines
        const lines = vis.chartGroup.selectAll(".line")
            .data(vis.competitorData, d => d.competitor);

        // ENTER: Add new lines
        lines.enter()
            .append("path")
            .attr("class", "line")
            .attr("fill", "none")
            .attr("stroke", d => d.gender === 'boy' ? "#233165" : "#E9A7A4")
            .attr("stroke-width", 1)
            .attr("d", d => line(d.records))
            .attr("opacity", 0)
            .on("mouseover", function (event, d) {
                d3.select(this)
                    .attr("stroke-width", 5) // Thicker line on hover
                    .attr("opacity", 0.9); // Fully visible on hover

                vis.tooltip
                    .style("opacity", 1)
                    .style("left", `${event.pageX + 10}px`)
                    .style("top", `${event.pageY - 20}px`)
                    .html(`
                    <strong>${d.competitor}</strong><br>
                    Gender: ${d.gender}<br>
                    Tournaments Attended: ${d.records.filter(r => r.Competed).length}
                `);
            })
            .on("mouseout", function () {
                d3.select(this)
                    .attr("stroke-width", 1) // Restore original thickness
                    .attr("opacity", 0.5); // Restore original opacity

                vis.tooltip.style("opacity", 0);
            })
            .transition()
            .duration(1000)
            .attr("opacity", 0.5); // Transition to final opacity

        // UPDATE: Update existing lines
        lines.transition()
            .duration(1000)
            .attr("d", d => line(d.records))
            .attr("stroke", d => d.gender === 'boy' ? "#233165" : "#E9A7A4");

        // EXIT: Remove old lines
        lines.exit()
            .transition()
            .duration(500)
            .attr("opacity", 0)
            .remove();

        // Bind data to dots
        const dots = vis.chartGroup.selectAll(".dot-group")
            .data(vis.competitorData, d => d.competitor);

        // ENTER: Add dot groups for new competitors
        dots.enter()
            .append("g")
            .attr("class", "dot-group")
            .selectAll(".dot")
            .data(d => d.records)
            .enter()
            .append("circle")
            .attr("class", "dot")
            .attr("cx", d => vis.xScale(d.Tournament))
            .attr("cy", vis.height) // Start at the bottom
            .attr("r", 3)
            .attr("fill", (d, i, nodes) => d3.select(nodes[i].parentNode).datum().gender === 'boy' ? "#233165" : "#E9A7A4")
            .attr("opacity", 0)
            .transition()
            .duration(1000)
            .attr("cy", d => vis.yScale(d.Elo)) // Transition to final position
            .attr("opacity", 1);

        // UPDATE: Update existing dots
        dots.selectAll(".dot")
            .data(d => d.records)
            .transition()
            .duration(1000)
            .attr("cx", d => vis.xScale(d.Tournament))
            .attr("cy", d => vis.yScale(d.Elo))
            .attr("fill", (d, i, nodes) => d3.select(nodes[i].parentNode).datum().gender === 'boy' ? "#233165" : "#E9A7A4");

        // EXIT: Remove old dots
        dots.exit()
            .selectAll(".dot")
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
            .style("transform", `rotate(-15deg)`)
            .style("transform", 'translate(0,-50)')
            .style("font-family", "Oswald");

        // Add x-axis label
        vis.chartGroup.append("text")
            .attr("class", "x-axis-label")
            .attr("x", vis.width / 2)
            .attr("y", vis.height + 35)
            .attr("text-anchor", "middle")
            .style("font-size", "12px")
            .style("fill", "black")
            .style("font-family", "Oswald")
            .text("Tournaments");

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
            .text("ELO Rating");
    }

}
