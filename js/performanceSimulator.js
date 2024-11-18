class PerformanceSimulator {

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
        vis.width = (document.getElementById(vis.parentElement).getBoundingClientRect().width / 3) - vis.margin.left - vis.margin.right;
        vis.height = (document.getElementById(vis.parentElement).getBoundingClientRect().width / 3) - vis.margin.top - vis.margin.bottom;

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
            .attr("y", vis.height * 0.1)
            .attr("text-anchor", "middle")
            .attr("font-size", "25px")
            .style("font-family", "Arial")
            .style("fill", "white")
            .style("font-weight", "1000")
            .text(`${vis.avgWins.toFixed(1)}`);
        vis.svg.append("text")
            .attr("x", 3 * vis.width / 4)
            .attr("y", vis.height * 0.2)
            .attr("text-anchor", "middle")
            .attr("font-size", "15px")
            .style("font-family", "Arial")
            .style("font-weight", "200")
            .style("fill", "white")
            .text(`Average Wins/Tournament`);

        // Display Average ELO
        vis.svg.append("text")
            .attr("x", 3 * vis.width / 4)
            .attr("y", vis.height * 0.4)
            .attr("text-anchor", "middle")
            .attr("font-size", "25px")
            .style("font-family", "Arial")
            .style("fill", "white")
            .style("font-weight", "1000")
            .text(`${vis.avgELO.toFixed(1)}`);
        vis.svg.append("text")
            .attr("x", 3 * vis.width / 4)
            .attr("y", vis.height * 0.5)
            .attr("text-anchor", "middle")
            .attr("font-size", "15px")
            .style("font-family", "Arial")
            .style("font-weight", "200")
            .style("fill", "white")
            .text(`Average ELO`);

        // Gender Display
        // Head
        vis.svg.append("circle")
            .attr("cx", vis.width / 4)
            .attr("cy", vis.height * 0.27)
            .attr("r", 40)
            .attr("fill", "lightskyblue");

// Body (Rounded Rectangle)
        vis.svg.append("rect")
            .attr("x", vis.width / 4 - 20)
            .attr("y", vis.height * 0.35)
            .attr("width", 40)
            .attr("height", 60)
            .attr("rx", 10) // Rounded corners
            .attr("ry", 10)
            .attr("fill", "lightskyblue");

// Left Arm (Rounded Rectangle angled upwards)
        vis.svg.append("rect")
            .attr("x", vis.width / 4 - 35)
            .attr("y", vis.height * 0.38)
            .attr("width", 50)
            .attr("height", 15)
            .attr("rx", 10) // Rounded corners
            .attr("ry", 10)
            .attr("transform", `rotate(-45 ${vis.width / 4 - 35 + 15}, ${vis.height * 0.42 + 5})`)
            .attr("fill", "lightskyblue");

// Right Arm (Rounded Rectangle angled upwards)
        vis.svg.append("rect")
            .attr("x", vis.width / 4 - 13)
            .attr("y", vis.height * 0.38)
            .attr("width", 50)
            .attr("height", 15)
            .attr("rx", 10) // Rounded corners
            .attr("ry", 10)
            .attr("transform", `rotate(45 ${vis.width / 4 + 5 + 15}, ${vis.height * 0.42 + 5})`)
            .attr("fill", "lightskyblue");

// Left Leg (Rounded Rectangle angled downwards)
        vis.svg.append("rect")
            .attr("x", vis.width / 4 - 20)
            .attr("y", vis.height * 0.45)
            .attr("width", 15)
            .attr("height", 60)
            .attr("rx", 5) // Rounded corners
            .attr("ry", 5)
            .attr("fill", "lightskyblue");

// Right Leg (Rounded Rectangle angled downwards)
        vis.svg.append("rect")
            .attr("x", vis.width / 4 + 5)
            .attr("y", vis.height * 0.45)
            .attr("width", 15)
            .attr("height", 60)
            .attr("rx", 5) // Rounded corners
            .attr("ry", 5)
            .attr("fill", "lightskyblue");

// Gender Label
        vis.svg.append("text")
            .attr("x", vis.width / 4)
            .attr("y", vis.height * 0.1)
            .attr("text-anchor", "middle")
            .attr("font-size", "20px")
            .style("font-family", "Arial")
            .style("fill", "white")
            .style("font-weight", "bold")
            .text("Male");
    }


}
