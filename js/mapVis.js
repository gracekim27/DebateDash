/* * * * * * * * * * * * * *
*          MapVis          *
* * * * * * * * * * * * * */


class MapVis {

    // constructor method to initialize Timeline object
    constructor(parentElement, tournamentData, spendingData, censusData, geoData) {
        this.parentElement = parentElement;
        this.tournamentData = tournamentData;
        this.spendingData = spendingData;
        this.censusData = censusData;
        this.geoData = geoData;
        this.displayData = [];
        this.selectedCategory = "studentCount";

        // parse date method
        this.parseDate = d3.timeParse("%m/%d/%Y");

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

        // add title
        vis.svg.append('g')
            .attr('class', 'title')
            .attr('id', 'map-title')
            .append('text')
            //.text('Title for Map')
            .attr('transform', `translate(${vis.width / 2}, 0)`)
            .attr('text-anchor', 'middle');

        // vis.textTitle = vis.svg.append('text')
        //     .attr("x", vis.width - 100)
        //     .attr("y", 30)
        //     .style("font-size", "20px")
        //     .style("font-family", "Oswald")
        //     .attr("text-anchor", "middle")
        //     .text("Public School Debaters")
        //
        // vis.textDescription = vis.svg.append('text')
        //     .attr("x", vis.width - 100)
        //     .attr("y", 60)
        //     .style("font-size", "14px")
        //     .style("font-family", "Oswald")
        //     .attr("text-anchor", "middle")
        //     .text("Public School Debaters")

        vis.categoryToTitle = {
            studentCount: "Public School Debaters",
            studentCountPerCapita: "Public Debaters Per Capita",
            spending: "Spending Per Student",
            elo: "Average Elo"
        }

        vis.categoryToDescription = {
            studentCount: "Debaters come from across the country. California, the most populous state, is also the most represented state. However, since many of the more populous states have more debaters, it is difficult to see which states send the greatest proportion of debaters.",
            studentCountPerCapita: "When we take the populations of each state into account, Iowa is the state that sends the most debaters per capita.",
            spending: "The state that spends the most per student is New York. Contrasting with the previous map, we can actually see that the states that send the most public school debaters are not necessarily the ones with the highest public school funding.",
            elo: "Higher Elo scores seem to correlate with higher spending. California, Washington, and the Northeast have higher ELOs than the rest of the country."
        }

        // vis.projection = d3.geoAlbersUsa() // d3.geoStereographic()
        //     .translate([vis.width / 2, vis.height / 2])
        //     .scale(230)

        vis.projection = d3.pr

        vis.viewpoint = {'width': 1100, 'height': 610};
        vis.zoom = vis.width / vis.viewpoint.width;


        // adjust map position
        vis.map = vis.svg.append("g") // group will contain all state paths
            .attr("id", "statesmap")
            .attr('transform', `translate(0,0), scale(${vis.zoom} ${vis.zoom})`);

        vis.path = d3.geoPath()
            .projection(vis.projection)

        vis.world = topojson.feature(vis.geoData, vis.geoData.objects.states).features

        vis.states = vis.svg.select("#statesmap").selectAll(".states")
            .data(vis.world)
            .enter().append("path")
            .attr('class', 'state')
            .attr("d", vis.path)
            .attr("stroke-width", 2)
            .attr("stroke", "black")
            .attr("fill", "white")

        vis.tooltip = d3.select("body").append('div')
            .attr('class', "tooltip")
            .attr('id', 'pieTooltip')


        this.wrangleData();
    }

    wrangleData() {


        let vis = this;

        // Specify the tournament and school type filters
        let selectedTournament = "Berk"; // Replace with your tournament name or variable

        // Init final data structure in which both data sets will be merged into
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


        // Filter tournament data for the selected tournament and public schools
        let filteredTournamentData = vis.tournamentData.filter(d =>
            d.Tournament === selectedTournament && d['Private/Public'] === "Public"
        );

        filteredTournamentData.forEach(d => {
            let stateName = nameConverter.getFullName(d.State);
            if (stateName !== '') {
                vis.stateInfo[stateName].studentCount += 1;
                vis.stateInfo[stateName].elo += ++(d['Elo']);
            }
        });


        vis.censusData.forEach(d => {
            let stateName = d.state;
            let population = parseInt(d["2020"]);

            if (stateName in vis.stateInfo) {

                var newElo = vis.stateInfo[stateName].elo / vis.stateInfo[stateName].studentCount;
                if (Number.isNaN(newElo)) {newElo = 0}
                vis.stateInfo[stateName] = {
                    ...vis.stateInfo[stateName],
                    studentCountPerCapita: vis.stateInfo[stateName].studentCount / population,
                    population: population,
                    elo: newElo,
                }
            }
        });

        var maxvalue = d3.max(d3.map(Object.values(vis.stateInfo), d => d[selectedMeasure]));
        var minvalue = d3.min(d3.map(Object.values(vis.stateInfo), d => d[selectedMeasure]));

        var colorSchemes = {
            studentCount: d3.interpolatePuRd,
            studentCountPerCapita: d3.interpolatePuRd,
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

        vis.updateVis()
    }


    updateVis() {
        let vis = this;

        // reset tbody

        d3.select("#mapTitle").text(vis.categoryToTitle[vis.selectedCategory]);
        d3.select("#mapDescription").text(vis.categoryToDescription[vis.selectedCategory]);

        vis.states
            .attr("fill", d => vis.stateInfo[d.properties.name].color)
            .on('mouseover', function(event, d){

                let stateInfo = vis.stateInfo[d.properties.name]

                d3.select(this)
                    .attr('stroke-width', '3px')
                    .attr('stroke', 'black')
                    .attr('fill', 'rgba(200,0,80)')

                vis.tooltip
                    .style("opacity", 1)
                    .style("left", event.pageX + 20 + "px")
                    .style("top", event.pageY + "px")
                    .html(`
     <div style="border: thin solid grey; border-radius: 5px; background: lightgrey; padding: 20px">
         <h2>${d.properties.name}<h2>
         <h4> Debaters: ${stateInfo.studentCount}</h4>
         <h4> Debaters Per Million People: ${(stateInfo.studentCountPerCapita * 1000000).toFixed()}</h4>                     
         <h4> Spending Per K-12 Student: $${stateInfo.spending}</h4>    
         <h4> Elo: ${(stateInfo.elo.toFixed() === "0") ? "N/A" : stateInfo.elo.toFixed()}</h4>                         
     </div>`);

            })
            .on('mouseout', function(event, d){
                var color = vis.stateInfo[d.properties.name].color
                d3.select(this)
                    .attr('stroke-width', 2)
                    .attr("fill", color)

                vis.tooltip
                    .style("opacity", 0)
                    .style("left", 0)
                    .style("top", 0)
                    .html(``);
            })
    }
}