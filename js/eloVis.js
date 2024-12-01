let baseElo = 200; // Starting Elo
let winElo, loseElo; // Variables to hold current Elo values
const winNumberElement = document.getElementById('win-number');
const loseNumberElement = document.getElementById('lose-number');

// Function to reset Elo values and restart animation
function resetAndAnimateElo() {
    // Reset Elo values
    winElo = baseElo;
    loseElo = baseElo;

    // Display reset values
    winNumberElement.textContent = winElo;
    loseNumberElement.textContent = loseElo;

    // Animate Elo changes
    updateEloSimultaneously(30, 20); // Increase Win by 15 and decrease Lose by 10
}

// Function to animate ELO numbers simultaneously
function updateEloSimultaneously(winChange, loseChange) {
    const winTarget = winElo + winChange;
    const loseTarget = loseElo - loseChange;

    const interval = setInterval(() => {
        let updated = false;

        if (winElo < winTarget) {
            winElo++;
            updated = true;
        }
        if (loseElo > loseTarget) {
            loseElo--;
            updated = true;
        }

        winNumberElement.textContent = winElo;
        loseNumberElement.textContent = loseElo;

        if (!updated) {
            clearInterval(interval); // Stop when both values reach their targets
        }
    }, 50); // Adjust speed of ticking (in ms)
}

// Start animation on load and restart every 5 seconds
resetAndAnimateElo();
setInterval(resetAndAnimateElo, 3000);