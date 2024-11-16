let firstBar;

let promises = [
    d3.csv("data/CS171_TournamentData.csv"),
    d3.csv("data/win_percentages_df.csv")
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

    console.log('Data', tournamentData);

    // Corrected instantiation to match the class name `FirstBar`
    firstBar = new FirstBar('firstBar', tournamentData);
}

function categoryChange() {
    firstBar.wrangleData();
}
