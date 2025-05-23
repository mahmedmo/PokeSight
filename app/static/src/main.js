// Filename: main.js
// Created on: Mon Apr 7th, 2025
// Created by: mahmedmo

let validPoke1 = false;
let validPoke2 = false;
let loadingCount = 0;
let abortControllerMap = {};

function scrollToTopDesktop() {
    if (window.innerWidth >= 769) {
        window.scrollTo({ top: 0, behavior: 'smooth' });
    }
}

window.addEventListener('resize', debounce(scrollToTopDesktop, 300));

function showSpinner() {
    loadingCount++;
    document.getElementById("spinner").style.display = "block";
}

function hideSpinner() {
    loadingCount--;
    if (loadingCount <= 0) {
        loadingCount = 0;
        document.getElementById("spinner").style.display = "none";
    }
}

function debounce(fn, delay) {
    let timer;
    return function (...args) {
        clearTimeout(timer);
        timer = setTimeout(() => fn.apply(this, args), delay);
    };
}

document.querySelectorAll('.input-group input').forEach(input => {
    input.addEventListener('blur', function () {
        const suggestionsContainer = input.parentElement.querySelector('.suggestions-container');
        setTimeout(() => {
            suggestionsContainer.classList.remove('visible');
        }, 300);
    });
    input.addEventListener('focus', function () {
        const suggestionsContainer = input.parentElement.querySelector('.suggestions-container');
        if (input.value.trim() !== "") {
            suggestionsContainer.classList.add('visible');
        }
    });
});;

document.addEventListener('DOMContentLoaded', function () {
    scrollToTopDesktop();

    const debouncedAutoSuggest1 = debounce(() => handleAutoSuggest(1), 400);
    const debouncedAutoSuggest2 = debounce(() => handleAutoSuggest(2), 400);

    document.getElementById("pokemon1").addEventListener("input", debouncedAutoSuggest1);
    document.getElementById("pokemon2").addEventListener("input", debouncedAutoSuggest2);

    const predictBtn = document.getElementById("predict-btn");
    predictBtn.addEventListener("click", handlePredictClick);

    const pokemon1Input = document.getElementById('pokemon1');
    const pokemon2Input = document.getElementById('pokemon2');

    const debounceValidatePoke1 = debounce(() => validatePokemonInput(1), 300);
    const debounceValidatePoke2 = debounce(() => validatePokemonInput(2), 300);

    pokemon1Input.addEventListener('blur', debounceValidatePoke1);
    pokemon2Input.addEventListener('blur', debounceValidatePoke2);

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

    setInterval(() => {
        checkAndLoadImage(1);
        checkAndLoadImage(2);
    }, 1000);
});

function checkAndLoadImage(num) {
    const inputField = document.getElementById("pokemon" + num);
    const innerBox = document.getElementById("inner-box" + num);
    const inputVal = inputField.value.trim();

    if (!inputField.dataset.lastValue || inputField.dataset.lastValue !== inputVal) {
        if (inputVal) {
            const img = innerBox.querySelector("img");
            if (!img) {
                validatePokemonInput(num);
            }
        }
        inputField.dataset.lastValue = inputVal;
    }
}

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

async function handleAutoSuggest(num) {
    const inputField = document.getElementById("pokemon" + num);
    const suggestionsContainer = document.getElementById("suggestions" + num);
    const query = inputField.value.trim();

    if (!query) {
        suggestionsContainer.classList.remove("visible");
        return;
    }

    const newSuggestions = await fetchSuggestions(query);

    const currentItems = Array.from(suggestionsContainer.querySelectorAll(".suggestion-item"))
        .map(item => item.textContent);
    if (JSON.stringify(currentItems) === JSON.stringify(newSuggestions)) {
        suggestionsContainer.classList.add("visible");
        return;
    }

    suggestionsContainer.classList.remove("visible");

    setTimeout(() => {
        suggestionsContainer.innerHTML = "";
        if (newSuggestions.length > 0) {
            newSuggestions.forEach(suggestion => {
                const item = document.createElement("div");
                item.textContent = suggestion;
                item.classList.add("suggestion-item");
                item.addEventListener("click", () => {
                    inputField.value = suggestion;
                    suggestionsContainer.innerHTML = "";
                    suggestionsContainer.classList.remove("visible");
                    validatePokemonInput(num);
                });
                suggestionsContainer.appendChild(item);
            });
            suggestionsContainer.classList.add("visible");
        }
    }, 250);
}

async function fetchSuggestions(query) {
    try {
        const response = await fetch(`/suggest?q=${encodeURIComponent(query)}`);
        if (!response.ok) throw new Error("Suggestion fetch failed");
        const data = await response.json();
        return data.suggestions;
    } catch (err) {
        console.error(err);
        return [];
    }
}

async function validatePokemonInput(num) {
    const inputField = document.getElementById("pokemon" + num);
    const inputVal = inputField.value.trim();

    if (!inputVal) {
        revertPokemonBox(num);
        num === 1 ? (validPoke1 = false) : (validPoke2 = false);
        updatePredictButton();
        return;
    }

    if (abortControllerMap[num]) {
        abortControllerMap[num].abort();
    }
    const controller = new AbortController();
    abortControllerMap[num] = controller;

    showSpinner();

    try {
        const response = await fetch(`/get_pokemon_image?name=${encodeURIComponent(inputVal)}`, {
            signal: controller.signal
        });
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
        if (err.name !== 'AbortError') {
            revertPokemonBox(num);
            num === 1 ? (validPoke1 = false) : (validPoke2 = false);
        }
    } finally {
        hideSpinner();
    }
    updatePredictButton();
}

function displayPokemonImage(num, imageUrl) {
    const innerBox = document.getElementById("inner-box" + num);

    const existingImg = innerBox.querySelector("img");
    if (existingImg && existingImg.src === imageUrl) {
        return;
    }

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

    predictBtn.removeEventListener("click", handlePredictClick);

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

    const existingPrediction = document.querySelector(".pokemon-boxes .prediction-container");
    if (existingPrediction) {
        existingPrediction.remove();
    }

    const fightOverlay = document.getElementById("fight-overlay");
    fightOverlay.style.display = "flex";
    fightOverlay.classList.add("popup");

    if (window.innerWidth < 769) {
        const submitContainer = document.querySelector('.submit-container');
        if (submitContainer) {
            submitContainer.style.display = 'none';
        }
    }

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
        if (window.innerWidth < 769) {
            const submitContainer = document.querySelector('.submit-container');
            if (submitContainer) {
                submitContainer.style.display = 'flex';
            }
        }
    }, 300);

    document.getElementById("clear-container").style.display = "block";
    predictBtn.blur();

    validPoke1 = false;
    validPoke2 = false;
    updatePredictButton();

    if (window.innerWidth < 769) {
        const firstInput = document.getElementById("pokemon-box");
        if (firstInput) {
            const offset = 2;
            const topPosition = firstInput.getBoundingClientRect().top + window.scrollY + offset;
            window.scrollTo({ top: topPosition, behavior: "smooth" });
        }
    }
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
    const predictBtn = document.getElementById("predict-btn");
    predictBtn.disabled = true;
    predictBtn.classList.add("btn-disabled");
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

    const predictBtn = document.getElementById("predict-btn");
    predictBtn.disabled = true;
    predictBtn.classList.add("btn-disabled");

    predictBtn.addEventListener("click", handlePredictClick);

    validPoke1 = false;
    validPoke2 = false;
    updatePredictButton();

    if (window.innerWidth < 769) {
        const firstInput = document.getElementById("pokemon1");
        if (firstInput) {
            const offset = 20;
            const topPosition = firstInput.getBoundingClientRect().top + window.scrollY - offset;
            window.scrollTo({ top: topPosition, behavior: "smooth" });
        }
    }
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
