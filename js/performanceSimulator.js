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

        console.log("Simulating odds");

        console.log(d3.select("#youGender").node().value === "Male");
        let youGender = d3.select("#youGender").node().value === "Male" ? "Boys" : "Girls";
        let oppGender = d3.select("#oppGender").node().value === "Male" ? "Boys" : "Girls";
        let youSchool = d3.select("#youSchool").node().value === "Public School" ? "Public" : "Private";
        let oppSchool = d3.select("#oppSchool").node().value === "Public School" ? "Public" : "Private";
        let youElo = parseInt(d3.select("#youELO").node().value);
        let oppElo = parseInt(d3.select("#oppELO").node().value);

        let difference = oppElo - youElo;
        let eloParam = 400;
        let unweighted_odds = 1  / (1 + Math.pow(10, difference / eloParam));

        let label = youSchool + youGender + "vs" + oppSchool + oppGender;
        let multiplier = vis.data[0][label] * 2;

        console.log(label, multiplier)

        let odds = (unweighted_odds * multiplier) / ((unweighted_odds * multiplier) + (1 - unweighted_odds));

        console.log(odds);

        vis.pieData = [{result: "win", value: odds}, {result: "lose", value: 1-odds}]

        vis.updateVis();
    }

    updateVis() {

        let vis = this;

        vis.svg.selectAll("*").remove();

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
            .attr("class", "arc")
            .attr("transform", `translate(${vis.width/2}, 100)`);


        // Append path (slices) to each arc group
        arcs.append("path")
            .attr("d", arc)
            .attr("fill", (d, i) => vis.color(i));

        let percentageWin = Math.round(vis.pieData[0].value * 100);
        let percentageLose = Math.round(vis.pieData[1].value * 100);

        vis.svg.append("text")
            .text("WIN: \n" + percentageWin + "%")
            .attr("x",  vis.width / 2 + 120)
            .attr("y", 50)
            .attr("font-size", "24px")
            .attr("fill", "#ffffff")

        vis.svg.append("text")
            .text("LOSE: \n" + percentageLose + "%")
            .attr("text-anchor", "end")
            .attr("x",  vis.width / 2 - 120)
            .attr("y", 50)
            .attr("font-size", "24px")
            .attr("fill", "#ffffff")
    }


}
