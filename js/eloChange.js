class EloChange {
    constructor(parentElement, data) {
        this.parentElement = parentElement;
        this.data = data;

        // Initialize the visualization
        this.initVis();
    }

    initVis() {
        let vis = this;

        // Define margins and dimensions based on the parent element's size
        vis.margin = { top: 60, right: 10, bottom: 80, left: 50 };
        vis.width = (document.getElementById(vis.parentElement).getBoundingClientRect().width / 2) - vis.margin.left - vis.margin.right;
        vis.height = 500;

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
            // Get gender from the first record (assuming it's consistent for each competitor)
            let gender = records[0].Gender;

            // Order the records by the specified tournament order and filter to keep only relevant tournaments
            let orderedRecords = vis.tournamentOrder.map(tournament => {
                let record = records.find(d => d.Tournament === tournament);
                return {
                    Tournament: tournament,
                    Elo: record ? +record.Elo : null
                };
            }).filter(d => d.Elo !== null); // Filter out tournaments with no ELO data

            return {
                competitor,
                gender,
                records: orderedRecords
            };
        });

        vis.updateVis();
    }

    updateVis() {
        let vis = this;

        // Clear previous elements
        vis.chartGroup.selectAll("*").remove();

        // Define scales
        vis.xScale = d3.scalePoint()
            .domain(vis.tournamentOrder)
            .range([0, vis.width])
            .padding(0.5); // Space between points

        vis.yScale = d3.scaleLinear()
            .domain([d3.min(vis.competitorData, c => d3.min(c.records, r => r.Elo)) * 0.9,
                d3.max(vis.competitorData, c => d3.max(c.records, r => r.Elo)) * 1.1])
            .range([vis.height, 0]);

        // Define line generator
        const line = d3.line()
            .x(d => vis.xScale(d.Tournament))
            .y(d => vis.yScale(d.Elo));

        // Draw lines for each competitor
        vis.chartGroup.selectAll(".line")
            .data(vis.competitorData)
            .enter()
            .append("path")
            .attr("class", "line")
            .attr("fill", "none")
            .attr("stroke", d => d.gender === 'boy' ? "steelblue" : "pink") // Set color based on gender
            .attr("stroke-width", 1.5)
            .attr("d", d => line(d.records))
            .attr("opacity", 0.5);

        // Draw circles at each data point
        vis.chartGroup.selectAll(".dot-group")
            .data(vis.competitorData)
            .enter()
            .append("g")
            .attr("class", "dot-group")
            .selectAll(".dot")
            .data(d => d.records)
            .enter()
            .append("circle")
            .attr("class", "dot")
            .attr("cx", d => vis.xScale(d.Tournament))
            .attr("cy", d => vis.yScale(d.Elo))
            .attr("r", 3)
            .attr("fill", (d, i, nodes) => d3.select(nodes[i].parentNode).datum().gender === 'boy' ? "steelblue" : "pink")
            .attr("opacity", 0.5); // Match dot color to line

        // Add x-axis
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
            .text("Tournaments");

        // Add y-axis
        vis.chartGroup.append("g")
            .attr("class", "y-axis")
            .call(d3.axisLeft(vis.yScale))
            .selectAll("text")
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
            .style("font-family", "Arial")
            .style("fill", "white")
            .text("ELO Rating");
    }
}