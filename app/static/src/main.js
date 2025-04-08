// Filename: main.js
// Created on: Mon Apr 7th, 2025
// Created by: mahmedmo

let validPoke1 = false;
let validPoke2 = false;

document.addEventListener('DOMContentLoaded', function () {
    const triggers = document.querySelectorAll('.predict-info-trigger');

    triggers.forEach(trigger => {
        const card = trigger.nextElementSibling;
        if (!card) return;

        trigger.addEventListener('click', function (event) {
            event.stopPropagation();
            if (card.style.opacity === '1') {
                card.style.opacity = '0';
                card.style.visibility = 'hidden';
            } else {
                card.style.opacity = '1';
                card.style.visibility = 'visible';
            }
        });
    });

    document.addEventListener('click', function () {
        const cards = document.querySelectorAll('.predict-info-card');
        cards.forEach(card => {
            card.style.opacity = '0';
            card.style.visibility = 'hidden';
        });
    });
});

function revertPokemonBox(num) {
    const innerBox = document.getElementById("inner-box" + num);
    const img = innerBox.querySelector("img");
    if (img) {
        img.classList.add("popout-animation");
        setTimeout(() => {
            innerBox.innerHTML = `<span class="question-mark" id="qm${num}">?</span>`;

            const qm = innerBox.querySelector(".question-mark");
            if (qm) {
                qm.classList.add("popin-animation");
                setTimeout(() => {
                    qm.classList.remove("popin-animation");
                }, 300);
            }
        }, 300);
    } else {
        if (!innerBox.querySelector(".question-mark")) {
            innerBox.innerHTML = `<span class="question-mark" id="qm${num}">?</span>`;
        }
    }
}

function fadeOutPokemonBox(num) {
    const innerBox = document.getElementById("inner-box" + num);
    innerBox.innerHTML = `<span class="question-mark" id="qm${num}">?</span>`;
}

async function validatePokemonInput(num) {
    const inputVal = document.getElementById("pokemon" + num).value.trim();
    if (!inputVal) {
        revertPokemonBox(num);
        num === 1 ? (validPoke1 = false) : (validPoke2 = false);
        updatePredictButton();
        return;
    }
    try {
        const response = await fetch(
            `/get_pokemon_image?name=${encodeURIComponent(inputVal)}`
        );
        if (!response.ok) throw new Error("Not OK");
        const data = await response.json();
        if (data.error) {
            revertPokemonBox(num);
            num === 1 ? (validPoke1 = false) : (validPoke2 = false);
        } else {
            displayPokemonImage(num, data.image_url);
            num === 1 ? (validPoke1 = true) : (validPoke2 = true);
        }
    } catch (err) {
        revertPokemonBox(num);
        num === 1 ? (validPoke1 = false) : (validPoke2 = false);
    }
    updatePredictButton();
}

function displayPokemonImage(num, imageUrl) {
    const innerBox = document.getElementById("inner-box" + num);
    innerBox.innerHTML = "";
    const img = document.createElement("img");
    img.src = imageUrl;
    img.classList.add("popin-animation");
    img.style.opacity = 0;
    innerBox.appendChild(img);
    setTimeout(() => {
        img.style.opacity = 1;
    }, 50);
}

function updatePredictButton() {
    const predictBtn = document.getElementById("predict-btn");

    if (validPoke1 && validPoke2) {
        predictBtn.disabled = false;
        predictBtn.classList.remove("btn-disabled");
    } else {
        predictBtn.disabled = true;
        predictBtn.classList.add("btn-disabled");
    }
}

async function handlePredictClick() {
    const predictBtn = document.getElementById("predict-btn");
    if (predictBtn.disabled) return;
    const input1 = document.getElementById("pokemon1");
    const input2 = document.getElementById("pokemon2");
    input1.disabled = true;
    input2.disabled = true;
    input1.classList.add("disabled-input");
    input2.classList.add("disabled-input");
    input1.setAttribute("title", "Cancel");
    input2.setAttribute("title", "Cancel");
    predictBtn.disabled = true;
    predictBtn.classList.add("btn-disabled");

    const existingPrediction = document.querySelector(
        ".pokemon-boxes .prediction-container"
    );
    if (existingPrediction) {
        existingPrediction.remove();
    }

    const fightOverlay = document.getElementById("fight-overlay");
    fightOverlay.style.display = "flex";
    fightOverlay.classList.add("popup");

    const fightText = document.querySelector("#fight-overlay .fight-text");
    if (fightText) {
        fightText.classList.add("pulse-animation");
    }

    const fightSound = document.getElementById("fight-sound");
    if (fightSound) {
        fightSound.pause();
        fightSound.currentTime = 0;
        fightSound.play().catch((e) => console.log(e));
    }

    await new Promise((resolve) => setTimeout(resolve, 500));

    const startTime = Date.now();
    const resultHTML = await submitPrediction();
    const elapsed = Date.now() - startTime;
    const remainingTime = 2500 - elapsed;
    if (remainingTime > 0) {
        await new Promise((resolve) => setTimeout(resolve, remainingTime));
    }

    document.getElementById("result-section").innerHTML = resultHTML;
    fightOverlay.classList.remove("popup");
    fightOverlay.classList.add("fade-out");

    setTimeout(() => {
        fightOverlay.style.display = "none";
        fightOverlay.classList.remove("fade-out");
        const fightText = document.querySelector("#fight-overlay .fight-text");
        if (fightText) {
            fightText.classList.remove("pulse-animation");
        }
    }, 300);

    document.getElementById("clear-container").style.display = "block";
    predictBtn.blur();
}

async function submitPrediction() {
    const p1 = document.getElementById("pokemon1").value.trim();
    const p2 = document.getElementById("pokemon2").value.trim();
    const formData = new FormData();
    formData.append("pokemon1", p1);
    formData.append("pokemon2", p2);
    const response = await fetch("/predict", {
        method: "POST",
        body: formData,
    });
    const resultHTML = await response.text();
    const container = document.createElement("div");
    container.innerHTML = resultHTML;
    const scripts = container.getElementsByTagName("script");

    for (let i = 0; i < scripts.length; i++) {
        eval(scripts[i].textContent);
    }

    return resultHTML;
}

async function handleClear() {
    const innerBox1 = document.getElementById("inner-box1");
    const innerBox2 = document.getElementById("inner-box2");
    const resultSection = document.getElementById("result-section");
    const input1 = document.getElementById("pokemon1");
    const input2 = document.getElementById("pokemon2");
    const predictionContainer = document.querySelector(".pokemon-boxes .prediction-container");
    const clearContainer = document.getElementById("clear-container");
    const clearBtn = document.getElementById("clear-btn");

    innerBox1.classList.add("popout-animation");
    innerBox2.classList.add("popout-animation");
    resultSection.classList.add("popout-animation");

    if (predictionContainer) {
        predictionContainer.classList.add("prediction-fade-out");
    }
    input1.classList.add("input-fade-out");
    input2.classList.add("input-fade-out");

    await new Promise((resolve) => setTimeout(resolve, 300));

    innerBox1.classList.remove("popout-animation");
    innerBox2.classList.remove("popout-animation");
    resultSection.classList.remove("popout-animation");

    if (predictionContainer) {
        predictionContainer.classList.remove("prediction-fade-out");
        predictionContainer.remove();
    }

    fadeOutPokemonBox(1);
    fadeOutPokemonBox(2);

    resultSection.innerHTML = "";
    input1.value = "";
    input2.value = "";
    input1.disabled = false;
    input2.disabled = false;
    input1.classList.remove("disabled-input");
    input2.classList.remove("disabled-input");
    input1.removeAttribute("title");
    input2.removeAttribute("title");
    input1.classList.remove("input-fade-out");
    input2.classList.remove("input-fade-out");
    input1.classList.add("input-fade-in");
    input2.classList.add("input-fade-in");
    innerBox1.classList.add("popin-animation");
    innerBox2.classList.add("popin-animation");

    await new Promise((resolve) => setTimeout(resolve, 300));

    innerBox1.classList.remove("popin-animation");
    innerBox2.classList.remove("popin-animation");
    input1.classList.remove("input-fade-in");
    input2.classList.remove("input-fade-in");

    if (clearBtn) {
        clearBtn.classList.add("clear-fade-out");
        setTimeout(() => {
            clearContainer.style.display = "none";
            clearBtn.classList.remove("clear-fade-out");
        }, 300);
    } else {
        clearContainer.style.display = "none";
    }

    validPoke1 = false;
    validPoke2 = false;
    updatePredictButton();
}

function renderResult(data) {
    const innerBox1 = document.getElementById("inner-box1");
    innerBox1.innerHTML =
        '<img src="' +
        data.p1_img +
        '" alt="' +
        data.p1_name +
        '" width="200">' +
        '<div class="result-overlay ' +
        (data.winner === "p1" ? "winner" : "loser") +
        '">' +
        '<div class="emoji">' +
        (data.winner === "p1" ? "👑" : "🪦") +
        "</div>" +
        "</div>";

    const innerBox2 = document.getElementById("inner-box2");
    innerBox2.innerHTML =
        '<img src="' +
        data.p2_img +
        '" alt="' +
        data.p2_name +
        '" width="200">' +
        '<div class="result-overlay ' +
        (data.winner === "p2" ? "winner" : "loser") +
        '">' +
        '<div class="emoji">' +
        (data.winner === "p2" ? "👑" : "🪦") +
        "</div>" +
        "</div>";

    const boxesContainer = document.querySelector(".pokemon-boxes");
    boxesContainer.insertAdjacentHTML(
        "beforeend",
        '<div class="prediction-container">' +
        '<div class="prediction-btn"></div>' +
        '<div class="mini-card">' +
        "<p>" +
        capitalizeFirstLetter(data.p1_name) +
        " wins <b>" +
        data.p1_prob +
        "%</b> of the time</p>" +
        "<p>" +
        capitalizeFirstLetter(data.p2_name) +
        " wins <b>" +
        data.p2_prob +
        "%</b> of the time</p>" +
        "</div>" +
        "</div>"
    );
}

function capitalizeFirstLetter(string) {
    return string.charAt(0).toUpperCase() + string.slice(1);
}
