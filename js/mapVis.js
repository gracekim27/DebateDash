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

        // vis.projection = d3.pr

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
            .attr("stroke-width", 3)
            .attr("stroke", "black")
            .attr("fill", "white")

        this.colors = ['#fddbc7', '#f4a582', '#d6604d', '#b2182b']

        vis.tooltip = d3.select("body").append('div')
            .attr('class', "tooltip")
            .attr('id', 'pieTooltip')

        vis.colorScale = d3.scaleSequential(d3.interpolateRgb("#E5DEC6", "#439745"))
            .domain([0, 24881]);



        // Add legend
        vis.legendWidth = 200;
        vis.legendHeight = 20;

        let legend = vis.svg.append("g")
            .attr("class", "legend")
            .attr("transform", `translate(${vis.width - 60}, ${vis.height / 2})`);

        let legendScale = d3.scaleLinear()
            .domain(vis.colorScale.domain())
            .range([0, vis.legendWidth]);

        let legendAxis = d3.axisRight(legendScale) // Vertical axis on the right
            .ticks(6)
            .tickFormat(d3.format(".0f"));

        let gradient = vis.svg.append("defs")
            .append("linearGradient")
            .attr("id", "legend-gradient")
            .attr("x1", "0%").attr("y1", "0%")
            .attr("x2", "0%").attr("y2", "100%"); // Vertical gradient


        // Create gradient stops
        gradient.append("stop")
            .attr("offset", "0%")
            .attr("stop-color", vis.colorScale(vis.colorScale.domain()[0])); // Dynamically use the domain's start value

        gradient.append("stop")
            .attr("offset", "100%")
            .attr("stop-color", vis.colorScale(vis.colorScale.domain()[1])); // Dynamically use the domain's end value


        // Add gradient rectangle
        legend.append("rect")
            .attr("x", 0)
            .attr("y", 0)
            .attr("width", vis.legendHeight) // Small width for vertical orientation
            .attr("height", vis.legendWidth) // Height corresponds to the legend scale range
            .style("fill", "url(#legend-gradient)");


        // Add legend axis
        legend.append("g")
            .attr("class", "legend-axis")
            .attr("transform", `translate(${vis.legendHeight}, 0)`) // Align axis with the right side of the rectangle
            .call(legendAxis);

        this.wrangleData();vis.svg.style("background", "none");
    }

    wrangleData() {

        let vis = this

        // init final data structure in which both data sets will be merged into
        vis.stateInfo = {}

        // merge
        this.usaData.forEach(d => {

            let stateName = d.state;

            let Spending = d.Spending;

            vis.stateInfo[stateName] = {
                Spending: Spending,
                color: vis.colorScale(Spending),
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
                    .attr('stroke-width', '4px')
                    .attr('stroke', 'black')
                    .attr('fill', '#FE1D87')

                vis.tooltip
                    .style("opacity", 1)
                    .style("left", event.pageX + 20 + "px")
                    .style("top", event.pageY + "px")
                    .html(`
     <div style="border: thin solid grey; border-radius: 5px; background: lightgrey; padding: 20px">
         <h3>${d.properties.name}<h3>
         <h4> Spending: ${stateInfo.Spending}</h4>                         
     </div>`);

            })
            .on('mouseout', function(event, d){
                var color = vis.stateInfo[d.properties.name].color
                d3.select(this)
                    .attr('stroke-width', '3px')
                    .attr("fill", color)

                vis.tooltip
                    .style("opacity", 0)
                    .style("left", 0)
                    .style("top", 0)
                    .html(``);
            })
    }
}