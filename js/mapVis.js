/* * * * * * * * * * * * * *
*          MapVis          *
* * * * * * * * * * * * * */


class MapVis {

    // constructor method to initialize Timeline object
    constructor(parentElement, usaData, geoData) {
        this.parentElement = parentElement;
        this.usaData = usaData;
        this.geoData = geoData;
        this.displayData = [];

        // parse date method
        this.parseDate = d3.timeParse("%m/%d/%Y");

        this.initVis()
    }

    initVis() {

        let vis = this;

        vis.margin = {top: 20, right: 20, bottom: 20, left: 20};
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
            .attr('transform', `translate(${vis.width / 2}, 20)`)
            .attr('text-anchor', 'middle');

        // vis.projection = d3.geoAlbersUsa() // d3.geoStereographic()
        //     .translate([vis.width / 2, vis.height / 2])
        //     .scale(230)

        vis.projection = d3.pr

        vis.viewpoint = {'width': 975, 'height': 610};
        vis.zoom = vis.width / vis.viewpoint.width;


        // adjust map position
        vis.map = vis.svg.append("g") // group will contain all state paths
            .attr("id", "statesmap")
            .attr('transform', `scale(${vis.zoom} ${vis.zoom})`);

        vis.path = d3.geoPath()
            .projection(vis.projection)

        vis.world = topojson.feature(vis.geoData, vis.geoData.objects.states).features

        vis.states = vis.svg.select("#statesmap").selectAll(".states")
            .data(vis.world)
            .enter().append("path")
            .attr('class', 'state')
            .attr("d", vis.path)
            .attr("stroke-width", 1)
            .attr("stroke", "black")
            .attr("fill", "white")

        this.colors = ['#fddbc7', '#f4a582', '#d6604d', '#b2182b']

        vis.tooltip = d3.select("body").append('div')
            .attr('class', "tooltip")
            .attr('id', 'pieTooltip')

        vis.colorScale = d3.scaleSequential(d3.interpolateBlues)
            .domain([0, 3]);

        this.wrangleData();
    }

    wrangleData() {

        let vis = this

        // init final data structure in which both data sets will be merged into
        vis.stateInfo = {}

        // merge
        this.usaData.forEach(d => {

            let stateName = d.state;

            let population = Math.random() * 4;

            vis.stateInfo[stateName] = {
                population: population,
                color: vis.colorScale(population),
            }

        })

        vis.updateVis()

    }

    updateVis() {
        let vis = this;

        // reset tbody

        vis.states
            .attr("fill", d => vis.stateInfo[d.properties.name].color)
            .on('mouseover', function(event, d){

                let stateInfo = vis.stateInfo[d.properties.name]

                d3.select(this)
                    .attr('stroke-width', '2px')
                    .attr('stroke', 'black')
                    .attr('fill', 'rgba(200,0,0,0.62)')

                vis.tooltip
                    .style("opacity", 1)
                    .style("left", event.pageX + 20 + "px")
                    .style("top", event.pageY + "px")
                    .html(`
     <div style="border: thin solid grey; border-radius: 5px; background: lightgrey; padding: 20px">
         <h3>${d.properties.name}<h3>
         <h4> Population: ${stateInfo.population}</h4>                         
     </div>`);

            })
            .on('mouseout', function(event, d){
                var color = vis.stateInfo[d.properties.name].color
                d3.select(this)
                    .attr('stroke-width', '1px')
                    .attr("fill", color)

                vis.tooltip
                    .style("opacity", 0)
                    .style("left", 0)
                    .style("top", 0)
                    .html(``);
            })
    }
}