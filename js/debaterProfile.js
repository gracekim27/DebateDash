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
        vis.margin = { top: 60, right: 20, bottom: 10, left: 50 };
        vis.width =
            document.getElementById(vis.parentElement).getBoundingClientRect().width / 2 -
            vis.margin.left -
            vis.margin.right;
        vis.height =
            2*document.getElementById(vis.parentElement).getBoundingClientRect().width / 5 -
            vis.margin.top -
            vis.margin.bottom;

        // SVG drawing area
        vis.svg = d3
            .select(`#${vis.parentElement}`)
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

        let filteredData = vis.data.filter((d) => d.Tournament === "Berk");

        // Calculate total boys and girls within the filtered data
        let boysData = filteredData.filter((d) => d.Gender === "boy");
        let girlsData = filteredData.filter((d) => d.Gender === "girl");

        vis.totalBoys = boysData.length;
        vis.totalGirls = girlsData.length;

        // Calculate average wins and average ELO for the filtered data
        vis.avgWins = d3.mean(filteredData, (d) => +d.Wins);
        vis.avgELO = d3.mean(filteredData, (d) => +d.Elo);

        vis.updateVis();
    }

    updateVis() {
        let vis = this;

        // Reset the SVG content for restarting
        vis.resetVis = function () {
            vis.svg.selectAll("*").remove(); // Clear existing content

            // Add texts for average wins and ELO
            vis.svg
                .append("text")
                .attr("class", "bangers-h2")
                .attr("x", (3 * vis.width) / 4)
                .attr("y", vis.height * 0.1 + 20)
                .attr("text-anchor", "middle")
                .text(`${vis.avgWins.toFixed(1)}`);
            vis.svg
                .append("text")
                .attr("x", (3 * vis.width) / 4)
                .attr("y", vis.height * 0.2 + 20)
                .attr("text-anchor", "middle")
                .attr("font-size", "15px")
                .style("font-family", "Arial")
                .style("font-weight", "200")
                .style("fill", "black")
                .text(`Average Wins/Tournament`);

            vis.svg
                .append("text")
                .attr("class", "bangers-h2")
                .attr("x", (3 * vis.width) / 4)
                .attr("y", vis.height * 0.4 + 20)
                .attr("text-anchor", "middle")
                .text(`${vis.avgELO.toFixed(1)}`);
            vis.svg
                .append("text")
                .attr("x", (3 * vis.width) / 4)
                .attr("y", vis.height * 0.5 + 20)
                .attr("text-anchor", "middle")
                .attr("font-size", "15px")
                .style("font-family", "Arial")
                .style("font-weight", "200")
                .style("fill", "black")
                .text(`Average ELO`);

            // Add filters and clipping paths
            vis.svg
                .append("defs")
                .append("filter")
                .attr("id", "blur")
                .append("feGaussianBlur")
                .attr("in", "SourceGraphic")
                .attr("stdDeviation", "20 0");

            vis.svg
                .append("defs")
                .append("clipPath")
                .attr("id", "leftHalf")
                .append("rect")
                .attr("x", 5)
                .attr("y", 50)
                .attr("width", vis.width / 4)
                .attr("height", vis.height);

            vis.svg
                .append("defs")
                .append("clipPath")
                .attr("id", "rightHalf")
                .append("rect")
                .attr("x", vis.width / 4 + 5)
                .attr("y", 50)
                .attr("width", vis.width / 4)
                .attr("height", vis.height);

            // Add gender image
            vis.leftHalf = vis.svg
                .append("g")
                .attr("clip-path", "url(#leftHalf)")
                .attr("filter", null); // Start with no blur

            vis.rightHalf = vis.svg
                .append("g")
                .attr("clip-path", "url(#rightHalf)")
                .attr("filter", "url(#blur)"); // Start with blur

            vis.leftHalf
                .append("image")
                .attr("xlink:href", "./img/maleFemale.png")
                .attr("x", 0)
                .attr("y", 50)
                .attr("width", vis.width / 2);

            vis.rightHalf
                .append("image")
                .attr("xlink:href", "./img/maleFemale.png")
                .attr("x", 0)
                .attr("y", 50)
                .attr("width", vis.width / 2);

            // Gender Label
            vis.genderLabel = vis.svg
                .append("text")
                .attr("class", "bangers-h2")
                .attr("x", vis.width / 4)
                .attr("y", 20)
                .attr("text-anchor", "middle")
                .text("Male");

            // Start the toggle animation
            vis.startAnimation();
        };

        // Animation logic
        vis.startAnimation = function () {
            let toggleState = false; // Start on "Male" state
            let toggleCount = 0; // Track the number of toggles
            const maxToggles = 10; // Set maximum toggles (e.g., 3 cycles of "Male" and "Female")

            const interval = setInterval(() => {
                toggleState = !toggleState;

                if (toggleState) {
                    // Show "Female" state
                    vis.leftHalf.attr("filter", "url(#blur)");
                    vis.rightHalf.attr("filter", null);
                    vis.genderLabel.text("Female");
                } else {
                    // Show "Male" state
                    vis.rightHalf.attr("filter", "url(#blur)");
                    vis.leftHalf.attr("filter", null);
                    vis.genderLabel.text("Male");

                    // Hold "Male" state for 3 seconds before resuming
                    if (toggleCount === maxToggles - 1) {
                        clearInterval(interval);
                        setTimeout(() => {
                            vis.startAnimation(); // Restart the animation after settling
                        }, 3000); // Final hold on "Male"
                    }
                }

                toggleCount++;

                // Stop toggling after reaching the maximum count
                if (toggleCount >= maxToggles) {
                    clearInterval(interval);
                }
            }, 100); // Toggle every 300ms
        };

        // Initialize the first animation cycle
        vis.resetVis();
    }





}
