let firstBar;
let debaterProfile;
let affNegSplits;
let winsELOs;
let eloChange;
let performanceSimulator;
let mapVis;
let stateFundingELO;
let stateAttendanceFunding;

let promises = [
    d3.csv("data/CS171_TournamentData.csv"),
    d3.csv("data/win_percentages_df.csv"),
    d3.csv("data/probs.csv"),
    d3.json("https://cdn.jsdelivr.net/npm/us-atlas@3/states-albers-10m.json"), // already projected -> you can just scale it to fit your browser window
    d3.csv("data/per-pupil-spending-by-state-2024.csv")
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
    let geoData = dataArray[3];
    let studentsPerStateData = dataArray[4];


    console.log('Data', tournamentData);

    // Initialize visualizations
    firstBar = new FirstBar('firstBar', tournamentData);
    debaterProfile = new DebaterProfile('debaterProfile', tournamentData);
    affNegSplits = new AffNegSplits("affNegSplits", winData);
    winsELOs = new WinsELO("winsELOs", tournamentData);
    eloChange = new EloChange("eloChange", tournamentData);
    performanceSimulator = new PerformanceSimulator("performanceSimulator", probsData);
    mapVis = new MapVis('mapDiv', studentsPerStateData, geoData);
    stateFundingELO = new StateFundingELO('stateFundingELO', studentsPerStateData, tournamentData);
    stateAttendanceFunding = new StateAttendanceFunding('stateAttendanceFunding', studentsPerStateData, tournamentData);

    // Setup slider for filtering visualizations
    setupSlider();
}

function setupSlider() {
    const slider = document.getElementById("mySlider");
    const sliderValue = document.getElementById("sliderValue");

    slider.addEventListener("input", function () {
        const minTournaments = +slider.value;
        sliderValue.textContent = minTournaments;

        eloChange.minTournaments = minTournaments;
        eloChange.wrangleData();

        winsELOs.minTournaments = minTournaments; // Update WinsELO filter
        winsELOs.wrangleData(); // Refresh WinsELO chart
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
