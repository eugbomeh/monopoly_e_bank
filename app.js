class MonopolyBank {
    constructor(playerName, amount) {
        this.playerName = playerName.charAt(0).toUpperCase() + playerName.slice(1);
        this.amount = amount;
    }

    accountBalance() {
        return `Balance: <strong>${this.amount.toLocaleString()}</strong> `;
    }

    moneyTransfer(amount, fromPlayer, toPlayer) {
        if (fromPlayer.amount >= amount) {
            fromPlayer.amount -= amount;
            toPlayer.amount += amount;
        } else {
            showModal(`${fromPlayer.playerName} doesn't have enough balance to make this transfer.`);
        }

        this.checkPlayerLoss(fromPlayer);
    }

    passGo(player) {
        if (player.amount + 200 >= 0) {
            this.moneyTransfer(200, this, player);
            logTransaction(`<strong>${player.playerName}</strong>  received <strong>200</strong> for passing Go!`);
        }
    }

    playerToPlayer(amount, fromPlayer, toPlayer) {
        if (fromPlayer.amount >= amount) {
            this.moneyTransfer(amount, fromPlayer, toPlayer);
            logTransaction(`<strong>${amount.toLocaleString()}</strong> has been transferred from <strong>${fromPlayer.playerName}</strong> to <strong>${toPlayer.playerName}</strong> `);
        } else {
            showModal(`${fromPlayer.playerName} doesn't have enough balance to transfer ${amount.toLocaleString()}`);
        }
    }

    checkPlayerLoss(player) {
        if (player.amount <= 0) {
            showModal(`${player.playerName} has gone bankrupt!`);
            this.removePlayer(player);
        }
    }

    removePlayer(player) {
        const playerIndex = players.indexOf(player);
        if (playerIndex > -1) {
            players.splice(playerIndex, 1);
        }
        logTransaction(`<strong>${player.playerName}</strong> has gone bankrupt, and has left the game!`);
        updatePlayerList();

    }
}


let bank;
const players = [];
const transactionLog = document.getElementById("transaction-log");

const setupForm = document.getElementById("setup-form");
const setupDiv = document.getElementById("setup");
const gameDiv = document.getElementById("game");
const playerList = document.getElementById("player-list");
const playerNamesDiv = document.getElementById("player-names");
const playerCountInput = document.getElementById("player-count");
const playersField = document.querySelector(".players-fields");
const startingAmountFields = document.querySelector(".starting-amount-fields");
const addPlayersButton = document.getElementById("add-players");
const resetButton = document.getElementById("reset-form");
const enterPlayers = document.getElementById("enter-players");

addPlayersButton.addEventListener("click", () => {
    const playerCount = parseInt(playerCountInput.value);

    playerNamesDiv.innerHTML = "";
    if (playerCount > 1 && playerCount < 9) {
        for (let i = 1; i <= playerCount; i++) {
            playerNamesDiv.innerHTML += `<label for="player${i}">Player ${i}:</label><input type="text" id="player${i}" required><br>`;
        }
        addPlayersButton.classList.add("hidden");
        playersField.classList.add("hidden")
        startingAmountFields.classList.add("hidden")
        enterPlayers.classList.remove("hidden")
        const startGameButton = document.createElement("button");
        startGameButton.type = "submit";
        startGameButton.id = "start-game";
        startGameButton.textContent = "Start Game";
        setupForm.insertBefore(startGameButton, setupForm.children[4]);
    } else {
        showModal("Please enter a number between 2 and 6")
    }

});

resetButton.addEventListener("click", () => {
    setupForm.reset();
    playerNamesDiv.innerHTML = "";

    const startGameBtn = document.getElementById("start-game");
    if (startGameBtn) startGameBtn.remove();


    if (addPlayersButton.classList.contains("hidden")) {

        addPlayersButton.classList.remove("hidden")
        playersField.classList.remove("hidden")
        startingAmountFields.classList.remove("hidden")
        enterPlayers.classList.add("hidden")
        addPlayersBtn.addEventListener("click", () => {
            const playerCount = parseInt(playerCountInput.value);
            playerNamesDiv.innerHTML = "";
            if (playerCount > 1 && playerCount < 9) {
                for (let i = 1; i <= playerCount; i++) {
                    playerNamesDiv.innerHTML += `<label for="player${i}">Player ${i}:</label><input type="text" id="player${i}" required><br>`;
                }
                addPlayersBtn.classList.add("hidden");
                playersField.classList.add("hidden")
                startingAmountFields.classList.add("hidden")
                const startGameButton = document.createElement("button");
                startGameButton.type = "submit";
                startGameButton.id = "start-game";
                startGameButton.textContent = "Start Game";
                setupForm.insertBefore(startGameButton, setupForm.children[4]);
            } else {
                showModal("Please enter a number between 2 and 6");
            }
        });
    }
});


setupForm.addEventListener("submit", (event) => {
    event.preventDefault();
    const startingAmount = parseInt(document.getElementById("starting-amount").value) || 2500;
    const playerCount = parseInt(playerCountInput.value);

    bank = new MonopolyBank("Bank", 100000);
    players.push(bank);

    for (let i = 1; i <= playerCount; i++) {
        const playerName = document.getElementById(`player${i}`).value;
        players.push(new MonopolyBank(playerName, startingAmount));
    }

    setupDiv.classList.add("hidden");
    gameDiv.classList.remove("hidden");
    updatePlayerList();
});

function updatePlayerList() {
    playerList.innerHTML = "";
    players.forEach(player => {
        const div = document.createElement("div");
        div.classList.add("player-card");
        div.innerHTML = `<strong>${player.playerName}</strong><br>`;

        if (player.playerName === "Bank") {
            div.innerHTML += `<span>${player.accountBalance()}</span><br><button onclick="payPlayer(${players.indexOf(player)})">Pay Player</button>`;
        } else {
            div.innerHTML += `
                <br><button onclick="showBalance(${players.indexOf(player)})">Account Balance</button>
                <button onclick="payPlayer(${players.indexOf(player)})">Pay Player</button>
                <button onclick="payBank(${players.indexOf(player)})">Pay Bank</button>
                <button onclick="passGo(${players.indexOf(player)})">Pass Go</button>`;
        }

        playerList.appendChild(div);
    });
}

function showBalance(index) {
    const player = players[index];
    showModal(player.accountBalance());
}

function payPlayer(index) {
    showPrompt("Enter the <strong>name</strong> of the player to be paid..", (toPlayerName) => {
        if (!toPlayerName) {
            showModal("Invalid player name.");
            return;
        }

        toPlayerName = toPlayerName.toLowerCase();

        showPrompt("Enter the <strong>amount</strong> to be paid..", (amountInput) => {
            const amount = parseInt(amountInput);

            if (isNaN(amount) || amount <= 0) {
                showModal("Invalid amount.");
                return;
            }

            const toPlayer = players.find(player => player.playerName.toLowerCase() === toPlayerName);

            if (toPlayer) {
                bank.playerToPlayer(amount, players[index], toPlayer);
                updatePlayerList();

                showModal(`Success! <strong>${amount.toLocaleString()}</strong> has been transferred from ${players[index].playerName} to ${toPlayer.playerName} .`);

            } else {
                showModal("Player not found!");
            }
        });
    });
}


function payBank(index) {
    showPrompt("Enter the <strong>amount</strong> to be paid to the bank..", (amountInput) => {
        const amount = parseInt(amountInput);

        if (isNaN(amount) || amount <= 0) {
            showModal("Invalid <strong>amount</strong>. Please enter a positive number..");
            return;
        }
        showModal(`Success! <strong>${amount.toLocaleString()}</strong> has been transferred from ${players[index].playerName} to ${bank.playerName} .`);
        bank.playerToPlayer(amount, players[index], bank);
        updatePlayerList();
    });
}


function passGo(index) {
    bank.passGo(players[index]);
    updatePlayerList();
    showModal(`Success! ${players[index].playerName} has recived 200 for passing Go!.`)
}

function logTransaction(message) {
    const li = document.createElement("li");
    li.innerHTML = message;
    transactionLog.appendChild(li);
}

function showModal(message) {
    // Create modal overlay
    const modalOverlay = document.createElement("div");
    modalOverlay.style.position = "fixed";
    modalOverlay.style.top = "0";
    modalOverlay.style.left = "0";
    modalOverlay.style.width = "100%";
    modalOverlay.style.height = "100%";
    modalOverlay.style.backgroundColor = "rgba(0, 0, 0, 0.5)";
    modalOverlay.style.display = "flex";
    modalOverlay.style.justifyContent = "center";
    modalOverlay.style.alignItems = "center";
    modalOverlay.style.zIndex = "1000";

    // Create modal container
    const modal = document.createElement("div");
    modal.style.backgroundColor = "#fff";
    modal.style.borderRadius = "8px";
    modal.style.boxShadow = "0 4px 10px rgba(0, 0, 0, 0.2)";
    modal.style.width = "300px";
    modal.style.padding = "20px";
    modal.style.textAlign = "center";
    modal.style.position = "relative";

    // Modal message
    const modalMessage = document.createElement("p");
    modalMessage.innerHTML = message;
    modalMessage.style.marginBottom = "20px";

    // OK Button
    const okButton = document.createElement("button");
    okButton.textContent = "OK";
    okButton.style.padding = "10px 15px";
    okButton.style.backgroundColor = "#007bff";
    okButton.style.color = "white";
    okButton.style.border = "none";
    okButton.style.borderRadius = "4px";
    okButton.style.cursor = "pointer";

    // Function to close the modal
    const closeModal = () => {
        document.body.removeChild(modalOverlay);
    };

    // Add event listeners for the button and keyboard events
    okButton.addEventListener("click", closeModal);
    modalOverlay.addEventListener("click", (event) => {
        if (event.target === modalOverlay) closeModal();
    });
    document.addEventListener("keydown", function handleKeyPress(event) {
        if (event.key === "Enter" || event.key === "Escape") {
            closeModal();
            document.removeEventListener("keydown", handleKeyPress); // Remove event listener after modal is closed
        }
    });

    // Assemble modal
    modal.appendChild(modalMessage);
    modal.appendChild(okButton);
    modalOverlay.appendChild(modal);

    // Append modal to the body
    document.body.appendChild(modalOverlay);

    // Focus on the OK button for accessibility
    okButton.focus();
}


function showPrompt(message, callback) {
    // Create modal elements
    const modalOverlay = document.createElement("div");
    modalOverlay.style.position = "fixed";
    modalOverlay.style.top = "0";
    modalOverlay.style.left = "0";
    modalOverlay.style.width = "100%";
    modalOverlay.style.height = "100%";
    modalOverlay.style.backgroundColor = "rgba(0, 0, 0, 0.5)";
    modalOverlay.style.display = "flex";
    modalOverlay.style.justifyContent = "center";
    modalOverlay.style.alignItems = "center";
    modalOverlay.style.zIndex = "1000";

    const modal = document.createElement("div");
    modal.style.backgroundColor = "#fff";
    modal.style.borderRadius = "8px";
    modal.style.boxShadow = "0 4px 10px rgba(0, 0, 0, 0.2)";
    modal.style.width = "300px";
    modal.style.padding = "20px";
    modal.style.textAlign = "center";
    modal.style.position = "relative";

    const modalMessage = document.createElement("p");
    modalMessage.innerHTML = message;
    modalMessage.style.marginBottom = "20px";

    const inputField = document.createElement("input");
    inputField.type = "text";
    inputField.style.width = "100%";
    inputField.style.padding = "10px";
    inputField.style.marginBottom = "20px";
    inputField.style.border = "1px solid #ccc";
    inputField.style.borderRadius = "4px";
    inputField.style.boxSizing = "border-box";

    const buttonContainer = document.createElement("div");
    buttonContainer.style.display = "flex";
    buttonContainer.style.justifyContent = "space-between";

    const okButton = document.createElement("button");
    okButton.textContent = "OK";
    okButton.style.padding = "10px 15px";
    okButton.style.backgroundColor = "#007bff";
    okButton.style.color = "white";
    okButton.style.border = "none";
    okButton.style.borderRadius = "4px";
    okButton.style.cursor = "pointer";
    okButton.style.flex = "1";
    okButton.style.marginRight = "5px";

    const cancelButton = document.createElement("button");
    cancelButton.textContent = "Cancel";
    cancelButton.style.padding = "10px 15px";
    cancelButton.style.backgroundColor = "#ccc";
    cancelButton.style.color = "black";
    cancelButton.style.border = "none";
    cancelButton.style.borderRadius = "4px";
    cancelButton.style.cursor = "pointer";
    cancelButton.style.flex = "1";
    cancelButton.style.marginLeft = "5px";

    // Focus the input field when the prompt opens
    setTimeout(() => inputField.focus(), 0);

    // Handle input submission
    const submitInput = () => {
        const inputValue = inputField.value.trim();
        if (inputValue) {
            document.body.removeChild(modalOverlay);
            callback(inputValue);
        }
    };

    // Handle cancel action
    const closeModal = () => {
        document.body.removeChild(modalOverlay);
    };

    // Add event listeners
    okButton.addEventListener("click", submitInput);
    cancelButton.addEventListener("click", closeModal);
    modalOverlay.addEventListener("click", (event) => {
        if (event.target === modalOverlay) closeModal();
    });

    // Keyboard event listeners
    inputField.addEventListener("keyup", (event) => {
        if (event.key === "Enter") {
            submitInput(); // Trigger "OK" action
        }
        if (event.key === "Escape") {
            closeModal(); // Close the modal
        }
    });

    // Assemble modal
    modal.appendChild(modalMessage);
    modal.appendChild(inputField);
    buttonContainer.appendChild(okButton);
    buttonContainer.appendChild(cancelButton);
    modal.appendChild(buttonContainer);
    modalOverlay.appendChild(modal);

    // Append modal to the body
    document.body.appendChild(modalOverlay);
}

