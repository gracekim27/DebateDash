class DebaterProfile {

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
        vis.width = (document.getElementById(vis.parentElement).getBoundingClientRect().width / 2) - vis.margin.left - vis.margin.right;
        vis.height = (document.getElementById(vis.parentElement).getBoundingClientRect().width / 2) - vis.margin.top - vis.margin.bottom;

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


        // Display Average Wins
        vis.svg.append("text")
            .attr("x", 3 * vis.width / 4)
            .attr("y", vis.height * 0.1 + 20)
            .attr("text-anchor", "middle")
            .attr("font-size", "25px")
            .style("font-family", "Arial")
            .style("fill", "black")
            .style("font-weight", "1000")
            .text(`${vis.avgWins.toFixed(1)}`);
        vis.svg.append("text")
            .attr("x", 3 * vis.width / 4)
            .attr("y", vis.height * 0.2 + 20)
            .attr("text-anchor", "middle")
            .attr("font-size", "15px")
            .style("font-family", "Arial")
            .style("font-weight", "200")
            .style("fill", "black")
            .text(`Average Wins/Tournament`);

        // Display Average ELO
        vis.svg.append("text")
            .attr("x", 3 * vis.width / 4)
            .attr("y", vis.height * 0.4 + 20)
            .attr("text-anchor", "middle")
            .attr("font-size", "25px")
            .style("font-family", "Arial")
            .style("fill", "black")
            .style("font-weight", "1000")
            .text(`${vis.avgELO.toFixed(1)}`);
        vis.svg.append("text")
            .attr("x", 3 * vis.width / 4 )
            .attr("y", vis.height * 0.5 + 20)
            .attr("text-anchor", "middle")
            .attr("font-size", "15px")
            .style("font-family", "Arial")
            .style("font-weight", "200")
            .style("fill", "black")
            .text(`Average ELO`);

        vis.svg.append("image")
            .attr("xlink:href", "/img/male.png")
            .attr("x", vis.width / 4 - 100)
            .attr("y", vis.height * 0.1)
            .attr("width", 200)
            .attr("height", 300);



// Gender Label
        vis.svg.append("text")
            .attr("x", vis.width / 4)
            .attr("y", vis.height * 0.1)
            .attr("text-anchor", "middle")
            .attr("font-size", "20px")
            .style("font-family", "Arial")
            .style("fill", "black")
            .style("font-weight", "bold")
            .text("Male");
    }


}
