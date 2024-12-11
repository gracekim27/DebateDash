/* * * * * * * * * * * * * *
*    StatePopulation       *
* * * * * * * * * * * * * */


class StatePopulation {

    // constructor method to initialize Timeline object
    constructor(parentElement, tournamentData, spendingData) {
        this.parentElement = parentElement;
        this.tournamentData = tournamentData;
        this.spendingData = spendingData;
        this.displayData = [];
        this.selectedCategory = "spending";

        this.initVis()
    }

    initVis() {

        let vis = this;

        vis.margin = {top: 20, right: 0, bottom: 20, left: 0};
        vis.width = document.getElementById(vis.parentElement).getBoundingClientRect().width - vis.margin.left - vis.margin.right;
        vis.height = document.getElementById(vis.parentElement).getBoundingClientRect().height - vis.margin.top - vis.margin.bottom;

        // init drawing area
        vis.svg = d3.select("#" + vis.parentElement).append("svg")
            .attr("width", vis.width)
            .attr("height", vis.height)
            .attr('transform', `translate (${vis.margin.left}, ${vis.margin.top})`);


        vis.circles = vis.svg.selectAll("circle")
        vis.labels = vis.svg.selectAll("text")


        this.wrangleData();
    }

    wrangleData() {

        let vis = this;

        let selectedTournament = "Berk";

        vis.stateInfo = {};

        let selectedMeasure = vis.selectedCategory;

        // Merge spending data
        vis.spendingData.forEach(d => {

            let stateName = d.state;

            let spending = d["Spending"];
            let funding =  d["PerPupilSpendingPublicFundingPerK-12Student"];

            vis.stateInfo[stateName] = {
                spending: ++spending,
                funding: ++funding,
                studentCount: 0,
                elo: 0
            }
        })

        let nameConverter = new NameConverter();

        let schoolType = (d3.select("#stateToggle").property('checked')) ? "Private" : "Public";

        // Filter tournament data for the selected tournament and public schools
        let filteredTournamentData = vis.tournamentData.filter(d =>
            d.Tournament === selectedTournament && d['Private/Public'] === schoolType
        );

        filteredTournamentData.forEach(d => {
            let stateName = nameConverter.getFullName(d.State);
            if (stateName !== '') {
                vis.stateInfo[stateName].studentCount += 1;
                vis.stateInfo[stateName].elo += ++(d['Elo']);
            }
        });


        vis.spendingData.forEach(d => {
            let stateName = d.state;

            if (stateName in vis.stateInfo) {

                var newElo = vis.stateInfo[stateName].elo / vis.stateInfo[stateName].studentCount;
                if (Number.isNaN(newElo)) {newElo = 0}
                vis.stateInfo[stateName] = {
                    ...vis.stateInfo[stateName],
                    elo: newElo,
                }
            }
        });

        var maxvalue = d3.max(d3.map(Object.values(vis.stateInfo), d => d[selectedMeasure]));
        var minvalue = d3.min(d3.map(Object.values(vis.stateInfo), d => d[selectedMeasure]));

        var colorSchemes = {
            studentCount: d3.interpolatePuRd,
            spending: d3.interpolateBuGn,
            elo: d3.interpolatePuBuGn
        }

        vis.colorScale = d3.scaleSequential()
            .domain([minvalue, maxvalue])
            .interpolator(colorSchemes[selectedMeasure]);

        this.spendingData.forEach(d => {
            let stateName = d.state;
            let amount = vis.stateInfo[stateName][selectedMeasure];
            if (vis.stateInfo[stateName].studentCount === 0 && selectedMeasure === "elo") {
                vis.stateInfo[stateName].color = "#888888";
            }
            else {
                vis.stateInfo[stateName].color = vis.colorScale(amount);
            }
        })

        vis.displayData = Object.entries(vis.stateInfo);
        vis.displayData = vis.displayData.filter(d => {return d[1].studentCount > 0})
        vis.displayData.sort((a, b) => {return b[1].studentCount - a[1].studentCount})
        vis.displayData = vis.displayData.map(d => {return {...(d[1]), state: d[0]}})

        vis.updateVis()
    }


    updateVis() {
        let vis = this;

        let circlesPerRow = 6;

        let margin = 90;
        let xspace = 120;
        let yspace = 120;

        let radius = function(d) { return Math.sqrt(d.studentCount) * 6; }


        const circles = vis.svg.selectAll(".circle").data(vis.displayData, d => d.state);

        const enterCircles = circles.enter()
            .append("circle")
            .attr("class", "circle")
            .attr("cx", (d, i) => (i % circlesPerRow) * xspace + margin)
            .attr("cy", (d, i) => Math.floor(i / circlesPerRow) * yspace + margin)
            .attr("r", 0) // Start with radius 0 for a smooth transition
            .attr("stroke-width", 2)
            .attr("stroke", "black")
            .attr("fill", d => d.color);

        circles.merge(enterCircles)
            .transition()
            .duration(1000)
            .attr("cx", (d, i) => (i % circlesPerRow) * xspace + margin)
            .attr("cy", (d, i) => Math.floor(i / circlesPerRow) * yspace + margin)
            .attr("r", radius)
            .attr("fill", d => d.color);

        // EXIT
        circles.exit()
            .transition()
            .duration(500)
            .attr("r", 0) // Smoothly shrink to 0 radius before removing
            .remove();

        const labels = vis.svg.selectAll(".label").data(vis.displayData, d => d.state);

        const enterLabels = labels.enter()
            .append("text")
            .attr("class", "label")
            .attr("x", (d, i) => (i % circlesPerRow) * xspace + margin)
            .attr("y", (d, i) => Math.floor(i / circlesPerRow) * yspace + margin - radius(d) - 10)
            .text(d => d.state)
            .attr("text-anchor", "middle")
            .attr("font-family", "Oswald")
            .attr("font-size", "14px")
            .attr("fill", "white");

        labels.merge(enterLabels)
            .transition()
            .duration(1000)
            .attr("x", (d, i) => (i % circlesPerRow) * xspace + margin)
            .attr("y", (d, i) => Math.floor(i / circlesPerRow) * yspace + margin - radius(d) - 10)
            .text(d => d.state);

        // EXIT
        labels.exit().remove();
    }
}