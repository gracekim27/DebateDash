class PerformanceSimulator {

    constructor(parentElement, data) {
        this.parentElement = parentElement;
        this.data = data;

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

        vis.chartGroup = vis.svg.append("g")
            .attr("transform", `translate(${vis.margin.left},${vis.margin.top})`);

        vis.color = d3.scaleOrdinal(["#40e36b", "#e34040"]);

        // Wrangle data to calculate required statistics
        vis.wrangleData();
    }

    wrangleData() {
        let vis = this;

        vis.pieData = [{value: .5}, {value: .5}]

        vis.updateVis();
    }

    updateVis() {

        let vis = this;

        vis.radius = 100;

        const pie = d3.pie()
            .value(d => d.value)
            .sort(null);

        const arc = d3.arc()
            .outerRadius(vis.radius)
            .innerRadius(0);

        const arcs = vis.svg.selectAll(".arc")
            .data(pie(vis.pieData))
            .enter().append("g")
            .attr("class", "arc");

        // Append path (slices) to each arc group
        arcs.append("path")
            .attr("d", arc)
            .attr("fill", (d, i) => vis.color(i));

    }


}
