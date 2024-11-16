class FirstBar {

    constructor(parentElement, data) {
        this.parentElement = parentElement;
        this.data = data;

        // Initialize the visualization
        this.initVis();
    }

    initVis() {
        let vis = this;

        // Define margins and dimensions based on the parent element's size
        vis.margin = {top: 60, right: 20, bottom: 100, left: 50}; // Increased top margin for title
        vis.width = 600 - vis.margin.left - vis.margin.right;
        vis.height = 600 - vis.margin.top - vis.margin.bottom;

        // SVG drawing area
        vis.svg = d3.select(`#${vis.parentElement}`)
            .append("svg")
            .attr("width", vis.width + vis.margin.left + vis.margin.right)
            .attr("height", vis.height + vis.margin.top + vis.margin.bottom)
            .append("g")
            .attr("transform", `translate(${vis.margin.left},${vis.margin.top})`);

        // Plot Title
        vis.svg.append("text")
            .attr("class", "plot-title")
            .attr("x", vis.width / 2)
            .attr("y", -vis.margin.top / 2 + 20)
            .attr("text-anchor", "middle")
            .style("font-size", "18px")
            .style("fill", "white")
            .style("font-family", "Arial")
            .text("Average ELO by Group and Gender");

        // Create a group element with margins applied
        vis.chartGroup = vis.svg.append("g")
            .attr("transform", `translate(0, ${20})`);

        vis.wrangleData();
    }

    wrangleData() {
        let vis = this;

        // Define filter conditions for each group and labels for the bar chart
        let groups = [
            { label: 'Private Girls', filter: d => d.Gender === 'girl' && d['Private/Public'] === 'Private' },
            { label: 'Private Boys', filter: d => d.Gender === 'boy' && d['Private/Public'] === 'Private' },
            { label: 'Public Girls', filter: d => d.Gender === 'girl' && d['Private/Public'] === 'Public' },
            { label: 'Public Boys', filter: d => d.Gender === 'boy' && d['Private/Public'] === 'Public' }
        ];

        // Initialize an array to store average ELO data for the bar chart
        vis.averageELOData = groups.map(group => {
            let filteredData = vis.data.filter(group.filter);
            let averageELO = vis.calculateAverageELO(filteredData);
            return { label: group.label, averageELO: averageELO || 0 }; // Use 0 if no data is available
        });

        console.log("Average ELO data for each group:", vis.averageELOData);


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

        // Clear previous elements
        vis.chartGroup.selectAll("*").remove();

        // Set up x and y scales based on average ELO data
        vis.xScale = d3.scaleBand()
            .domain(vis.averageELOData.map(d => d.label))
            .range([0, vis.width])
            .padding(0.1);

        // yScale starts from 1700 to zoom in since values are pretty close (around 1700-1900)
        vis.yScale = d3.scaleLinear()
            .domain([1700, d3.max(vis.averageELOData, d => d.averageELO)])
            .range([vis.height, 0]);

        // Draw bars for each group with color based on gender
        vis.chartGroup.selectAll(".bar")
            .data(vis.averageELOData)
            .enter()
            .append("rect")
            .attr("class", "bar")
            .attr("x", d => vis.xScale(d.label))
            .attr("y", d => vis.yScale(d.averageELO))
            .attr("width", vis.xScale.bandwidth())
            .attr("height", d => vis.height - vis.yScale(d.averageELO))
            .attr("fill", d => d.label.includes("Girls") ? "lightpink" : "lightskyblue");

        // Add x-axis and style text and lines to white
        vis.chartGroup.append("g")
            .attr("class", "x-axis")
            .attr("transform", `translate(0,${vis.height})`)
            .call(d3.axisBottom(vis.xScale))
            .selectAll("text")
            .style("fill", "white");

        vis.chartGroup.select(".x-axis")
            .selectAll("path, line")
            .style("stroke", "white");

        // Add y-axis and style text and lines to white
        vis.chartGroup.append("g")
            .attr("class", "y-axis")
            .call(d3.axisLeft(vis.yScale))
            .selectAll("text")
            .style("fill", "white");

        vis.chartGroup.select(".y-axis")
            .selectAll("path, line")
            .style("stroke", "white");
    }

}
