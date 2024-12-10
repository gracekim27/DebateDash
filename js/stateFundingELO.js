class StateFundingELO {

    constructor(parentElement, studentsPerStateData, tournamentData) {
        this.parentElement = parentElement;
        this.studentsPerStateData = studentsPerStateData; // Contains funding data with full state names
        this.tournamentData = tournamentData; // Contains ELO scores with state abbreviations
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
            .text("Average ELO");

        // Tooltip
        vis.tooltip = d3.select("body").append("div")
            .attr("class", "tooltip")
            .style("opacity", 0);

        vis.wrangleData();
    }

    wrangleData() {
        let vis = this;

        // Create a map of state abbreviations to full names
        const stateMap = {
            "AL": "Alabama",
            "AK": "Alaska",
            "AZ": "Arizona",
            "AR": "Arkansas",
            "CA": "California",
            "CO": "Colorado",
            "CT": "Connecticut",
            "DC": "District of Columbia",
            "DE": "Delaware",
            "FL": "Florida",
            "GA": "Georgia",
            "HI": "Hawaii",
            "ID": "Idaho",
            "IL": "Illinois",
            "IN": "Indiana",
            "IA": "Iowa",
            "KS": "Kansas",
            "KY": "Kentucky",
            "LA": "Louisiana",
            "ME": "Maine",
            "MD": "Maryland",
            "MA": "Massachusetts",
            "MI": "Michigan",
            "MN": "Minnesota",
            "MS": "Mississippi",
            "MO": "Missouri",
            "MT": "Montana",
            "NE": "Nebraska",
            "NV": "Nevada",
            "NH": "New Hampshire",
            "NJ": "New Jersey",
            "NM": "New Mexico",
            "NY": "New York",
            "NC": "North Carolina",
            "ND": "North Dakota",
            "OH": "Ohio",
            "OK": "Oklahoma",
            "OR": "Oregon",
            "PA": "Pennsylvania",
            "RI": "Rhode Island",
            "SC": "South Carolina",
            "SD": "South Dakota",
            "TN": "Tennessee",
            "TX": "Texas",
            "UT": "Utah",
            "VT": "Vermont",
            "VA": "Virginia",
            "WA": "Washington",
            "WV": "West Virginia",
            "WI": "Wisconsin",
            "WY": "Wyoming"
        };


        // Filter tournamentData for "Berk" tournament and map state abbreviations to full names
        const berkData = vis.tournamentData
            .filter(d => d.Tournament === "Berk" && d['Private/Public'] === "Public")
            .map(d => ({
                state: stateMap[d.State], // Convert abbreviation to full name
                elo: +d.Elo // Ensure ELO is numeric
            }));

        // Group by state and calculate average ELO
        const avgELOByState = d3.rollup(
            berkData,
            values => d3.mean(values, d => d.elo),
            d => d.state
        );

        // Merge with funding data
        vis.displayData = vis.studentsPerStateData.map(d => {
            const avgELO = avgELOByState.get(d.state) || null; // Get average ELO or null if no data
            return {
                state: d.state,
                funding: +d.Spending, // Ensure funding is numeric
                avgELO: avgELO
            };
        }).filter(d => d.avgELO !== null); // Exclude states without ELO data

        const unmatchedStates = vis.tournamentData
            .filter(d => !stateMap[d.State])
            .map(d => d.State);
        console.log("Unmatched states in tournamentData:", unmatchedStates);


        vis.updateVis();
    }

    updateVis() {
        let vis = this;

        // Update scales
        vis.xScale.domain([0, d3.max(vis.displayData, d => d.funding) * 1.1]);
        vis.yScale.domain([0, d3.max(vis.displayData, d => d.avgELO) * 1.1]);

        // Update axes
        vis.svg.select(".x-axis")
            .transition().duration(1000)
            .call(vis.xAxis);

        vis.svg.select(".y-axis")
            .transition().duration(1000)
            .call(vis.yAxis);

        // Bind data to circles
        const dots = vis.svg.selectAll(".dot")
            .data(vis.displayData);

        // ENTER
        dots.enter().append("circle")
            .attr("class", "dot")
            .attr("cx", d => vis.xScale(d.funding))
            .attr("cy", vis.height) // Start at bottom
            .attr("r", 5)
            .attr("fill", "#74C7BD")
            .attr("stroke", "black")
            .attr("stroke-width", 2)
            .on("mouseover", function (event, d) {
                d3.select(this).attr("fill", "#FE1D87");

                vis.tooltip
                    .style("opacity", 1)
                    .style("left", `${event.pageX + 10}px`)
                    .style("top", `${event.pageY - 20}px`)
                    .html(`
                        <strong>${d.state}</strong><br>
                        Funding: $${d.funding.toLocaleString()}<br>
                        Avg ELO: ${d.avgELO.toFixed(2)}
                    `);
            })
            .on("mouseout", function () {
                d3.select(this).attr("fill", "#74C7BD");

                vis.tooltip.style("opacity", 0);
            })
            .transition().duration(1000)
            .attr("cy", d => vis.yScale(d.avgELO)); // Transition to final position

        // UPDATE
        dots.transition().duration(1000)
            .attr("cx", d => vis.xScale(d.funding))
            .attr("cy", d => vis.yScale(d.avgELO));

        // EXIT
        dots.exit().remove();
    }
}
