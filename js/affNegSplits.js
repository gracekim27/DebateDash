class AffNegSplits {
    constructor(parentElement, data) {
        this.parentElement = parentElement;
        this.data = data;

        // Initialize the visualization
        this.initVis();
    }

    initVis() {
        let vis = this;

        // Define margins and dimensions
        vis.margin = { top: 60, right: 150, bottom: 120, left: 50 }; // Increased right margin for the text area
        vis.width = (document.getElementById(vis.parentElement).getBoundingClientRect().width / 2 + 10) - vis.margin.left - vis.margin.right;
        vis.height = 500;

        // SVG drawing area
        vis.svg = d3.select(`#${vis.parentElement}`)
            .append("svg")
            .attr("width", vis.width + vis.margin.left + vis.margin.right + 200) // Add space for the motion details
            .attr("height", vis.height + vis.margin.top + vis.margin.bottom);

        // Create a group for static elements
        vis.staticGroup = vis.svg.append("g")
            .attr("transform", `translate(${vis.margin.left},${vis.margin.top})`);

        // Create a group for pie charts
        vis.chartGroup = vis.svg.append("g")
            .attr("transform", `translate(${vis.margin.left},${vis.margin.top})`);

        // Add a group for motion details with a rectangle background
        vis.motionDetails = vis.svg.append("g")
            .attr("transform", `translate(${vis.width + vis.margin.left + 50},${vis.margin.top})`); // Position on the right

        // Add a rectangle for motion details background
        vis.motionDetails
            .append("rect")
            .attr("x", 90)
            .attr("y", -20)
            .attr("width", 208)
            .attr("height", 200)
            .attr("rx", 10) // Rounded corners
            .style("fill", "#333") // Dark background
            .style("stroke", "black")
            .style("stroke-width", 1);

        vis.motionDetails
            .append("text")
            .attr("class", "motion-title")
            .attr("x", 100)
            .attr("y", 10)
            .attr("font-size", "20px")
            .style("fill", "white")
            .style("font-family", "Oswald")
            .text("Motion Details:");

        vis.motionDetails
            .append("text")
            .attr("class", "motion-content")
            .attr("x", 100)
            .attr("y", 40)
            .attr("font-size", "15px")
            .style("fill", "white")
            .style("font-weight", "200")
            .style("line-height", 2)
            .style("font-family", "Oswald");

        vis.wrangleData();
    }

    wrangleData() {
        let vis = this;

        // Process data to extract relevant fields for pie charts
        vis.processedData = vis.data.map(d => ({
            Tournament: d.Tournament,
            affWinPercentage: +d["Aff Win %"],
            negWinPercentage: +d["Neg Win %"]
        }));

        vis.updateVis();
    }

    updateVis() {
        let vis = this;

        // Clear previous content
        vis.chartGroup.selectAll("*").remove();

        vis.radius = 30;

        // Pie layout and arc generator
        const pie = d3.pie().value(d => d.value).sort(null);
        const arc = d3.arc().innerRadius(0).outerRadius(vis.radius);
        vis.color = d3.scaleOrdinal(["#439745", "#DB3A3A"]);

        // Store positions for the pie charts
        vis.pieChartPositions = [];

        const layout = [
            ["Greenhill", "MidAmerica", "Bronx"],
            ["Heart", "Apple Valley", "Glenbrooks"],
            ["HarvWest", "Emory", "Harvard", "Berk"]
        ];

        layout.forEach((column, colIndex) => {
            column.forEach((tournamentName, rowIndex) => {
                let d = vis.processedData.find(item => item.Tournament === tournamentName);
                if (!d) return;

                let pieData = pie([
                    { label: "Aff Win %", value: d.affWinPercentage },
                    { label: "Neg Win %", value: d.negWinPercentage }
                ]);

                let x = colIndex * vis.radius * 5;
                let y = rowIndex * vis.radius * 3.5;

                vis.pieChartPositions.push({ x: x + vis.radius * 2, y: y - 40 }); // Save positions for labels

                let tournamentGroup = vis.chartGroup.append("g")
                    .attr("transform", `translate(${x + vis.radius * 2}, ${y + vis.radius * 2})`);

                tournamentGroup.append("text")
                    .attr("x", 0)
                    .attr("y", -vis.radius - 10)
                    .attr("text-anchor", "middle")
                    .attr("font-size", "12px")
                    .style("fill", "black")
                    .style("font-family", "Oswald")
                    .text(d.Tournament);

                tournamentGroup.selectAll("path")
                    .data(pieData)
                    .enter()
                    .append("path")
                    .attr("d", arc)
                    .attr("fill", (sliceData, idx) => vis.color(idx))
                    .attr("stroke", "black")
                    .attr("stroke-width", 2);
            });
        });

        // Add topic labels dynamically after pie chart positions are calculated
        vis.addTopics();
    }

    addTopics() {
        let vis = this;

        // Hardcoded topic details
        const topics = [
            { title: "Sept/Oct", details: "Resolved: The United States ought to guarantee the right to housing." },
            { title: "Nov/Dec", details: "Resolved: The United States ought to prohibit the extraction of fossil fuels from federal public lands and waters." },
            { title: "Jan/Feb", details: "Resolved: The United States ought to substantially reduce its military presence in the West Asia-North Africa region." }
        ];

        // Calculate horizontal positions based on layout
        const columnSpacing = vis.radius * 5; // Horizontal spacing between pie chart columns
        const xOffset = vis.radius * 2; // Offset to center text above each column
        const yOffset = -25; // Position above the first row of pie charts

        // Append motion names with buttons above the pie chart columns
        topics.forEach((topic, index) => {
            const xPosition = index * columnSpacing + xOffset; // Dynamically position based on column index

            // Create a group for text and button
            const buttonGroup = vis.svg.append("g")
                .attr("transform", `translate(${vis.margin.left + xPosition}, ${vis.margin.top + yOffset})`)
                .style("cursor", "pointer") // Pointer cursor for the group
                .on("click", function () {
                    vis.updateMotionDetails(topic.details);
                });

            // Append the text
            const textElement = buttonGroup.append("text")
                .attr("x", 0)
                .attr("y", 0)
                .attr("text-anchor", "middle")
                .attr("font-size", "15px")
                .style("fill", "white")
                .style("font-family", "Oswald")
                .text(topic.title);

            // Measure text dimensions
            const textBBox = textElement.node().getBBox();

            // Append the rectangle (button) behind the text
            buttonGroup.insert("rect", "text")
                .attr("x", -textBBox.width / 2 - 10)
                .attr("y", -22)
                .attr("width", textBBox.width + 20)
                .attr("height", textBBox.height + 10)
                .attr("rx", 15) // Rounded-pill corners
                .style("fill", "#465691") // Same background color as Bootstrap btn-primary
                .style("stroke", "black") // Border similar to btn-primary hover
                .style("stroke-width", 1.5)
                .style("transition", "all 0.3s ease")
                .on("mouseover", function () {
                    d3.select(this)
                        .attr("y", -24)
                        .style("fill", "#263A84") // Hover background color
                        .style("stroke", "black");
                })
                .on("mouseout", function () {
                    d3.select(this)
                        .attr("y", -22)
                        .style("fill", "#465691")
                        .style("stroke", "black");
                })
                .on("mousedown", function () {
                    d3.select(this)
                        .attr("y", -textBBox.width / 2)
                        .style("fill", "#263A84")
                        .style("stroke", "black");
                })
                .on("mouseup", function () {
                    d3.select(this)
                        .attr("y", -textBBox.width / 2)
                        .style("fill", "#263A84")
                        .style("stroke", "black");
                });

// Set `pointer-events` on text
            textElement.style("pointer-events", "none");
        });
    }




    updateMotionDetails(details) {
        let vis = this;

        // Clear existing content
        vis.motionDetails.selectAll(".motion-content tspan").remove();

        // Split the details into lines of a specific width
        const words = details.split(" ");
        const lineHeight = 20; // Line height in pixels
        const maxWidth = 180; // Max width for each line
        let line = [];
        let y = 30; // Starting y-position
        let tspan = vis.motionDetails.select(".motion-content")
            .append("tspan")
            .attr("x", 100)
            .attr("y", y);

        words.forEach((word) => {
            line.push(word);
            tspan.text(line.join(" "));
            if (tspan.node().getComputedTextLength() > maxWidth) {
                line.pop(); // Remove the last word
                tspan.text(line.join(" "));
                line = [word]; // Start a new line
                y += lineHeight; // Move to the next line
                tspan = vis.motionDetails.select(".motion-content")
                    .append("tspan")
                    .attr("x", 100)
                    .attr("y", y)
                    .text(word);
            }
        });
    }
}
