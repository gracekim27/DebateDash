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
        this.selectedCategory = "Total";

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

        vis.tooltip = d3.select("body").append('div')
            .attr('class', "tooltip")
            .attr('id', 'pieTooltip')


        this.wrangleData();
    }

    wrangleData() {

        let vis = this;

        let selectedTournament = "Berk";

        vis.stateInfo = {};

        let selectedMeasure = "spending";

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

        //let schoolType = (d3.select("#stateToggle").property('checked')) ? "Private" : "Public";
        let schoolType = vis.selectedCategory;

        // Filter tournament data for the selected tournament and public schools
        let filteredTournamentData = vis.tournamentData.filter(d =>
            d.Tournament === selectedTournament && ((d['Private/Public'] === schoolType) || (schoolType === "Total"))
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

        vis.colorScale = d3.scaleSequential()
            .domain([minvalue, maxvalue])
            .interpolator(d3.interpolatePuRd);

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

        let circlesPerRow = 9;

        let margin = 90;
        let xspace = 108;
        let yspace = 90;

        let radius = function(d) { return Math.sqrt(d.studentCount) * 3; }


        const circles = vis.svg.selectAll(".circle").data(vis.displayData, d => d.state);

        const enterCircles = circles.enter()
            .append("circle")
            .attr("class", "circle")
            .attr("cx", (d, i) => (i % circlesPerRow) * xspace + margin)
            .attr("cy", (d, i) => Math.floor(i / circlesPerRow) * yspace + margin)
            .attr("r", 0) // Start with radius 0 for a smooth transition
            .attr("stroke-width", 2)
            .attr("stroke", "black")
            .attr("fill", d => d.color)

            .on('mouseover', function(event, d){

                vis.tooltip
                    .style("opacity", 1)
                    .style("left", event.pageX + 20 + "px")
                    .style("top", event.pageY + "px")
                    .html(`
     <div style="border: thin solid grey; border-radius: 5px; background: lightgrey; padding: 20px">
         <h2>${d.state}<h2>
         <h4> Debaters: ${d.studentCount}</h4>                  
         <h4> Spending Per K-12 Student: $${d.spending}</h4>                          
     </div>`);

            })
            .on('mouseout', function(event, d){

                vis.tooltip
                    .style("opacity", 0)
                    .style("left", 0)
                    .style("top", 0)
                    .html(``);
            })

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

        d3.selectAll(".annotation").remove()

        if (vis.selectedCategory === "Private") {
            console.log("HERE")
            vis.svg.append("text")
                .attr("class", "annotation")
                .attr("x", vis.width/2)
                .attr("y", 250)
                .text("Students from a state like New York, with high public school funding, are more likely to come from public school than private school.")
                .attr("font-size", "14px")
                .attr("text-anchor", "middle")
                .attr("font-family", "Oswald")
        }


        // EXIT
        labels.exit().remove();
    }
}