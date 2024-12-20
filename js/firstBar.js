class FirstBar {

    constructor(parentElement, data) {
        this.parentElement = parentElement;
        this.data = data;

        // Initialize the visualization
        this.initVis();
    }

    initVis() {
        let vis = this;

        // Define margins and dimensions
        vis.margin = { top: 60, right: 50, bottom: 150, left: 50 }; // Increased right margin
        vis.width = (document.getElementById(vis.parentElement).getBoundingClientRect().width) - vis.margin.left - vis.margin.right;
        vis.height = (2* document.getElementById(vis.parentElement).getBoundingClientRect().width/3) - vis.margin.top - vis.margin.bottom;

        // SVG drawing area
        vis.svg = d3.select(`#${vis.parentElement}`)
            .append("svg")
            .attr("width", vis.width + vis.margin.left + vis.margin.right)
            .attr("height", vis.height + vis.margin.top + vis.margin.bottom)
            .append("g")
            .attr("transform", `translate(${vis.margin.left},${vis.margin.top})`);


        // Tooltip (create it once, outside the SVG)
        vis.tooltip = d3.select("body").append("div")
            .attr("class", "tooltip");

        vis.wrangleData();
    }



    wrangleData() {
        let vis = this;

        // Filter data to only include entries where Tournament is "Berk"
        let filteredData = vis.data.filter(d => d.Tournament === "Berk");

        // Define filter conditions for each group and labels for the bar chart
        let groups = [
            { label: 'Private Girls', filter: d => d.Gender === 'girl' && d['Private/Public'] === 'Private' },
            { label: 'Private Boys', filter: d => d.Gender === 'boy' && d['Private/Public'] === 'Private' },
            { label: 'Public Girls', filter: d => d.Gender === 'girl' && d['Private/Public'] === 'Public' },
            { label: 'Public Boys', filter: d => d.Gender === 'boy' && d['Private/Public'] === 'Public' }
        ];

        // Initialize an array to store average ELO data for the bar chart
        vis.averageELOData = groups.map(group => {
            let groupData = filteredData.filter(group.filter);
            let averageELO = vis.calculateAverageELO(groupData);
            return { label: group.label, averageELO: averageELO || 0 }; // Use 0 if no data is available
        });


        vis.updateVis();
    }

    calculateAverageELO(dataGroup) {
        if (dataGroup.length > 0) {
            let totalELO = d3.sum(dataGroup, d => +d.Elo);
            return totalELO / dataGroup.length;
        }
        return null;
    }

    updateVis() {
        let vis = this;

        // Clear only the bars, not the axes
        vis.svg.selectAll(".bar").remove();

        // Set up x and y scales
        vis.xScale = d3.scaleBand()
            .domain(vis.averageELOData.map(d => d.label))
            .range([0, vis.width])
            .padding(0.1);

        vis.yScale = d3.scaleLinear()
            .domain([0, d3.max(vis.averageELOData, d => d.averageELO)])
            .range([vis.height, 0]);

        // Draw bars
        vis.svg.selectAll(".bar")
            .data(vis.averageELOData)
            .enter()
            .append("rect")
            .attr("class", "bar")
            .attr("x", d => vis.xScale(d.label))
            .attr("y", d => vis.yScale(d.averageELO))
            .attr("width", vis.xScale.bandwidth())
            .attr("height", d => vis.height - vis.yScale(d.averageELO))
            .attr("fill", d => d.label.includes("Girls") ? "#FE1D87" : "#233165")
            .attr("stroke", "black")
            .attr("stroke-width", 3)
            .on("mouseover", function(event, d) {
                vis.tooltip.transition().duration(200).style("opacity", 1);
                vis.tooltip.html(`Group: ${d.label}<br>Average ELO: ${d.averageELO.toFixed(2)}`)
                    .style("left", `${event.pageX + 10}px`)
                    .style("top", `${event.pageY - 28}px`);
            })
            .on("mouseout", function() {
                vis.tooltip.transition().duration(200).style("opacity", 0);
            });

        // Update x-axis
        if (vis.svg.selectAll(".x-axis").empty()) {
            vis.svg.append("g")
                .attr("class", "x-axis")
                .attr("transform", `translate(0,${vis.height})`)
                .attr("stroke-width", 3)
                .call(d3.axisBottom(vis.xScale))
                .selectAll("text")
                .style("fill", "black")
                .style("font-family", "Oswald")
                .style("font-size", "20px");

            vis.svg.select(".x-axis")
                .selectAll("path, line")
                .style("stroke", "black")
                .style("font-family", "Oswald");
        } else {
            vis.svg.select(".x-axis").call(d3.axisBottom(vis.xScale));
        }

        // Update y-axis
        if (vis.svg.selectAll(".y-axis").empty()) {
            vis.svg.append("g")
                .attr("class", "y-axis")
                .attr("stroke-width", 3)
                .call(d3.axisLeft(vis.yScale))
                .selectAll("text")
                .style("fill", "black")
                .style("font-family", "Oswald")
                .style("font-size", "20px");

            vis.svg.select(".y-axis")
                .selectAll("path, line")
                .style("stroke", "black")
                .style("font-family", "Oswald");
        } else {
            vis.svg.select(".y-axis").call(d3.axisLeft(vis.yScale));
        }
    }

}
