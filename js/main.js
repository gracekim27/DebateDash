let firstBar;
let debaterProfile;
let affNegSplits;
let winsELOs;
let eloChange;
let performanceSimulator;

let promises = [
    d3.csv("data/CS171_TournamentData.csv"),
    d3.csv("data/win_percentages_df.csv"),
    d3.csv("data/probs.csv")
];

Promise.all(promises)
    .then(function (data) {
        initMainPage(data);
    })
    .catch(function (err) {
        console.log(err);
    });

function initMainPage(dataArray) {
    let tournamentData = dataArray[0];
    let winData = dataArray[1];
    let probsData = dataArray[2];

    console.log('Data', tournamentData);

    // Initialize visualizations
    firstBar = new FirstBar('firstBar', tournamentData);
    debaterProfile = new DebaterProfile('debaterProfile', tournamentData);
    affNegSplits = new AffNegSplits("affNegSplits", winData);
    winsELOs = new WinsELO("winsELOs", tournamentData);
    eloChange = new EloChange("eloChange", tournamentData);
    performanceSimulator = new PerformanceSimulator("performanceSimulator", probsData);

    // Setup slider for filtering visualizations
    setupSlider();
}

function setupSlider() {
    const slider = document.getElementById("mySlider");
    const sliderValue = document.getElementById("sliderValue");

    slider.addEventListener("input", function () {
        const minTournaments = +slider.value; // Get the slider value
        sliderValue.textContent = minTournaments; // Update slider display

        // Debugging: log slider value
        console.log("Slider value (minTournaments):", minTournaments);

        // Update `minTournaments` and re-filter data
        eloChange.minTournaments = minTournaments;

        // Debugging: log before calling wrangleData
        console.log("Updating EloChange with minTournaments:", eloChange.minTournaments);

        eloChange.wrangleData();
    });


}

function categoryChange() {
    firstBar.wrangleData();
    debaterProfile.wrangleData();
    affNegSplits.wrangleData();
    winsELOs.wrangleData();
}

function simulateOdds() {
    console.log('GOT HERE');
    performanceSimulator.wrangleData();
}

// Attach simulateOdds to button click
d3.select("#performanceSimulatorButton").on('click', simulateOdds);
