class StateAttendanceFunding {

    constructor(parentElement, studentsPerStateData, tournamentData) {
        this.parentElement = parentElement;
        this.studentsPerStateData = studentsPerStateData; // Contains funding data with full state names
        this.tournamentData = tournamentData; // Contains tournament data
        this.displayData = [];

        // Initialize the visualization
        this.initVis();
    }

    initVis() {
        let vis = this;

        // Define margins and dimensions
        vis.margin = { top: 60, right: 60, bottom: 100, left: 60 };
        vis.width = document.getElementById(vis.parentElement).getBoundingClientRect().width - vis.margin.left - vis.margin.right;
        vis.height = (2 * document.getElementById(vis.parentElement).getBoundingClientRect().width / 3) - vis.margin.top - vis.margin.bottom;

        // Create SVG area
        vis.svg = d3.select(`#${vis.parentElement}`).append("svg")
            .attr("width", vis.width + vis.margin.left + vis.margin.right)
            .attr("height", vis.height + vis.margin.top + vis.margin.bottom)
            .append("g")
            .attr("transform", `translate(${vis.margin.left}, ${vis.margin.top})`);

        // Initialize scales and axes
        vis.xScale = d3.scaleLinear().range([0, vis.width]);
        vis.yScale = d3.scaleLinear().range([vis.height, 0]);

        vis.xAxis = d3.axisBottom(vis.xScale);
        vis.yAxis = d3.axisLeft(vis.yScale);

        vis.svg.append("g")
            .attr("class", "x-axis")
            .attr("transform", `translate(0, ${vis.height})`);

        vis.svg.append("g")
            .attr("class", "y-axis");

        // Axis labels
        vis.svg.append("text")
            .attr("class", "x-axis-label")
            .attr("x", vis.width / 2)
            .attr("y", vis.height + 40)
            .attr("text-anchor", "middle")
            .style("font-size", "14px")
            .style("font-family", "Oswald")
            .text("Funding per K-12 Student ($)");

        vis.svg.append("text")
            .attr("class", "y-axis-label")
            .attr("x", -vis.height / 2)
            .attr("y", -40)
            .attr("transform", "rotate(-90)")
            .attr("text-anchor", "middle")
            .style("font-size", "14px")
            .style("font-family", "Oswald")
            .text("Tournaments Attended");

        // Tooltip
        vis.tooltip = d3.select("body").append("div")
            .attr("class", "tooltip")
            .style("opacity", 0);

        // Add legend
        const legendData = [
            { label: "Competitor (Public)", shape: "circle", color: "darkblue" },
            { label: "Competitor (Private)", shape: "circle", color: "darkred" },
            { label: "State (Average)", shape: "rect", color: "green" }
        ];

// Create a legend group
        const legend = vis.svg.append("g")
            .attr("class", "legend")
            .attr("transform", `translate(${vis.width - 750}, ${vis.height - 400})`);

// Add legend items
        legend.selectAll(".legend-item")
            .data(legendData)
            .enter()
            .append("g")
            .attr("class", "legend-item")
            .attr("transform", (d, i) => `translate(0, ${i * 20})`) // Adjust vertical spacing
            .each(function(d) {
                const legendItem = d3.select(this);

                // Draw the shape
                if (d.shape === "circle") {
                    legendItem.append("circle")
                        .attr("cx", 0)
                        .attr("cy", 5)
                        .attr("r", 5)
                        .attr("fill", d.color);
                } else if (d.shape === "rect") {
                    legendItem.append("rect")
                        .attr("x", -5)
                        .attr("y", 0)
                        .attr("width", 10)
                        .attr("height", 10)
                        .attr("fill", d.color)
                        .attr("stroke", "black")
                        .attr("stroke-width", 2);
                }

                // Add the label
                legendItem.append("text")
                    .attr("x", 15)
                    .attr("y", 10)
                    .style("font-size", "12px")
                    .style("font-family", "Oswald")
                    .text(d.label);
            });

        vis.wrangleData();
    }

    wrangleData() {
        let vis = this;

        // Create a map of state abbreviations to full names
        const stateMap = {
            "AL": "Alabama", "AK": "Alaska", "AZ": "Arizona", "AR": "Arkansas",
            "CA": "California", "CO": "Colorado", "CT": "Connecticut", "DC": "District of Columbia", "DE": "Delaware",
            "FL": "Florida", "GA": "Georgia", "HI": "Hawaii", "ID": "Idaho",
            "IL": "Illinois", "IN": "Indiana", "IA": "Iowa", "KS": "Kansas",
            "KY": "Kentucky", "LA": "Louisiana", "ME": "Maine", "MD": "Maryland",
            "MA": "Massachusetts", "MI": "Michigan", "MN": "Minnesota",
            "MS": "Mississippi", "MO": "Missouri", "MT": "Montana", "NE": "Nebraska",
            "NV": "Nevada", "NH": "New Hampshire", "NJ": "New Jersey",
            "NM": "New Mexico", "NY": "New York", "NC": "North Carolina",
            "ND": "North Dakota", "OH": "Ohio", "OK": "Oklahoma", "OR": "Oregon",
            "PA": "Pennsylvania", "RI": "Rhode Island", "SC": "South Carolina",
            "SD": "South Dakota", "TN": "Tennessee", "TX": "Texas", "UT": "Utah",
            "VT": "Vermont", "VA": "Virginia", "WA": "Washington",
            "WV": "West Virginia", "WI": "Wisconsin", "WY": "Wyoming"
        };

        // Calculate attendance for each competitor
        const attendanceData = d3.rollups(
            vis.tournamentData,
            values => ({
                tournamentsAttended: values.filter(d => d.Wins !== "NA").length, // Count tournaments attended
                schoolType: values[0]['Private/Public'] || "Public", // Extract school type
                state: values[0].State // Use state abbreviation from the data
            }),
            d => d.Name // Group by competitor
        );

        // Compute average attendance per state
        const stateAttendance = d3.rollups(
            attendanceData,
            competitors => d3.mean(competitors, d => d[1].tournamentsAttended), // Average tournaments attended
            d => stateMap[d[1].state] // Map state abbreviation to full name
        );

        // Prepare data for visualization (state level)
        vis.stateData = stateAttendance.map(([state, avgTournaments]) => ({
            state: state,
            avgTournamentsAttended: avgTournaments,
            funding: vis.studentsPerStateData.find(s => s.state === state)?.Spending || 0 // Get funding for the state
        }));

        // Prepare competitor-level data
        vis.competitorData = attendanceData.map(([name, { tournamentsAttended, state, schoolType }]) => ({
            competitor: name,
            tournamentsAttended: tournamentsAttended,
            funding: vis.studentsPerStateData.find(s => s.state === stateMap[state])?.Spending || 0,
            schoolType: schoolType
        }));

        vis.updateVis();
    }



    updateVis() {
        let vis = this;

        // Update scales
        vis.xScale.domain([0, d3.max([...vis.competitorData.map(d => d.funding), ...vis.stateData.map(d => d.funding)]) * 2.5]);
        vis.yScale.domain([0, d3.max([...vis.competitorData.map(d => d.tournamentsAttended), ...vis.stateData.map(d => d.avgTournamentsAttended)]) * 1.1]);

        // Update axes
        vis.svg.select(".x-axis")
            .transition().duration(1000)
            .call(vis.xAxis);

        vis.svg.select(".y-axis")
            .transition().duration(1000)
            .call(vis.yAxis);

        // Circles: Competitor-level data
        const circles = vis.svg.selectAll(".competitor-circle")
            .data(vis.competitorData);

        // ENTER circles
        circles.enter().append("circle")
            .attr("class", "competitor-circle")
            .attr("cx", d => vis.xScale(d.funding))
            .attr("cy", vis.height) // Start at bottom
            .attr("r", 7)
            .attr("fill", d => d.schoolType === "Public" ? "darkblue" : "darkred")
            .attr("opacity", 0.4)
            .on("mouseover", function (event, d) {
                d3.select(this).attr("stroke", "black").attr("stroke-width", 2);

                vis.tooltip
                    .style("opacity", 1)
                    .style("left", `${event.pageX + 10}px`)
                    .style("top", `${event.pageY - 20}px`)
                    .html(`
                    <strong>${d.competitor}</strong><br>
                    Funding: $${d.funding.toLocaleString()}<br>
                    Tournaments Attended: ${d.tournamentsAttended}<br>
                    School Type: ${d.schoolType}
                `);
            })
            .on("mouseout", function () {
                d3.select(this).attr("stroke", "none");

                vis.tooltip.style("opacity", 0);
            })
            .transition().duration(1000)
            .attr("cy", d => vis.yScale(d.tournamentsAttended)); // Transition to final position

        // UPDATE circles
        circles.transition().duration(1000)
            .attr("cx", d => vis.xScale(d.funding))
            .attr("cy", d => vis.yScale(d.tournamentsAttended))
            .attr("fill", d => d.schoolType === "Public" ? "darkblue" : "darkred");

        // EXIT circles
        circles.exit().remove();

        // Squares: State-level data
        const squares = vis.svg.selectAll(".state-square")
            .data(vis.stateData);

        // ENTER squares
        squares.enter().append("rect")
            .attr("class", "state-square")
            .attr("x", d => vis.xScale(d.funding) - 5) // Center square
            .attr("y", vis.height) // Start at bottom
            .attr("width", 10) // Fixed size for square
            .attr("height", 10)
            .attr("fill", "green")
            .attr("stroke", "black")
            .attr("stroke-width", 2)
            .on("mouseover", function (event, d) {
                d3.select(this).attr("stroke", "black").attr("stroke-width", 5);

                vis.tooltip
                    .style("opacity", 1)
                    .style("left", `${event.pageX + 10}px`)
                    .style("top", `${event.pageY - 20}px`)
                    .html(`
                    <strong>${d.state}</strong><br>
                    Funding: $${d.funding.toLocaleString()}<br>
                    Avg Tournaments Attended: ${d.avgTournamentsAttended.toFixed(2)}
                `);
            })
            .on("mouseout", function () {
                d3.select(this).attr("stroke", "black").attr("stroke-width", 2);

                vis.tooltip.style("opacity", 0);
            })
            .transition().duration(1000)
            .attr("y", d => vis.yScale(d.avgTournamentsAttended)); // Transition to final position

        // UPDATE squares
        squares.transition().duration(1000)
            .attr("x", d => vis.xScale(d.funding) - 5)
            .attr("y", d => vis.yScale(d.avgTournamentsAttended))
            .attr("width", 10)
            .attr("height", 10)
            .attr("fill", "green");

        // EXIT squares
        squares.exit().remove();
    }



}
