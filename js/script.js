let gameController = document.querySelector(".game-cont"),
    layoutController = document.querySelector(".layout"),
    alertDiv = document.querySelector(".alert-msg"),
    alertMsg = document.querySelector(".alert-msg > p"),
    curLevel = document.querySelector("#currentLevel"),
    curPoint = document.querySelector("#points"),
    countryImg = document.querySelector(".cou-flag > img"),
    countryTitle = document.querySelector(".cou-title > p"),
    answersList = document.querySelectorAll(".ans"),
    timerTime = document.querySelector(".timer-time"),
    timerInner = document.querySelector(".timer-inner"),
    rePlay = document.querySelector(".layout > button"),
    layoutTitle = document.querySelector(".lay-title"),
    layoutDesc = document.querySelector(".lay-desc");

let allCountries = []

document.addEventListener("mousemove", parallax);
function parallax(e){
  document.querySelectorAll(".object").forEach(function(move){

    let moving_value = move.getAttribute("data-value");
    let x = (e.clientX * moving_value) / 250;
    let y = (e.clientY * moving_value) / 250;

    move.style.transform = "translateX(" + x + "px) translateY(" + y + "px)";
  });
}

const maxTimer = 15;

let currentQuestions = [];
let currentLevel = 1;
let currentPoints = 0;
let intervalID = 0;
let currentTimer = 15;


let isInit = false;
let start = true;

rePlay.addEventListener("click", ()=>{
    if (!isInit) {
        checkbar()
        main()
    }
})

function checkbar(){
    layoutController.classList.add("hidden");
    gameController.classList.remove("hidden");
}


function checkAnswer(event){
    clickId = event.target.id
    item = document.querySelector(`#${clickId}`)
    userChoice = item.innerHTML
    correctAnswer = currentQuestions[currentLevel - 1].capital
    switch (userChoice) {
        case correctAnswer:
            currentPoints++
            makeAlert("You got it correctly...👍")
            highlightAnswer(item, "24ff03")
            break;
        default:
            makeAlert("Try next time...🤔")
            highlightAnswer(item, "ff0000")
            markcorrect();
            break;
    }
    changeLevel()
}


async function main(){
    await getAllCountries()
    game()
}


function game(){
    if (!isInit){
        initGame()
    }

    console.log(currentQuestions)

    timerInner.classList.add("no-tran");
    timerInner.style.width = "0%";
    timerTime.innerHTML = `00:${String(currentTimer).padStart(2, "0")}`;
    setTimeout(()=>{
        timerInner.classList.remove("no-tran");
    }, 10)
    curPoint.innerHTML = currentPoints;

    // GAME CONTINUE
    if (currentLevel <= 10) {
        answersList.forEach(btn => {
            btn.addEventListener("click", checkAnswer)
            btn.classList.remove("disabled")
            highlightAnswer(btn, "a8dadc")
        })
        curLevel.innerHTML = currentLevel
        countryImg.src = currentQuestions[currentLevel - 1].flagSVG
        countryTitle.innerHTML = currentQuestions[currentLevel - 1].name
        questions = [currentQuestions[currentLevel - 1].capital, ...currentQuestions[currentLevel -1].randomCapitals]
        shuffleArray(questions)
        for (let i = 0; i < answersList.length; i++){
            answersList[i].innerHTML = questions[i]
        }
        answersList = document.querySelectorAll(".ans")
        intervalID = setInterval(()=>{
            currentTimer--
            timerTime.innerHTML = `00:${String(currentTimer).padStart(2, "0")}`
            timerInner.style.width = `${(100 / maxTimer) *(maxTimer - currentTimer)}%`
            if (currentTimer == 0){
                markcorrect();
                makeAlert("Timeout...🤔");
                changeLevel();
            }
        }, 1000)
    } else {
        // GAME FINISH
        finishGame()
    }
}

function markcorrect(){
    correctAnswer = currentQuestions[currentLevel-1].capital
    allItems = Array.from(document.querySelectorAll(".ans"))
    allItems.map((item) => {
        if (item.innerHTML == correctAnswer) highlightAnswer(item, "24FF03")
    })
}


function finishGame(){
    gameController.classList.add("hidden")
    isInit = false
    msg = "Try harder next time!🤔"
    if (currentPoints >= 8) {
        msg = "You are a genius!😎"
    } else if (currentPoints >= 5) {
        msg = "You can do better!👍"
    }
    layoutTitle.innerHTML = msg
    layoutDesc.innerHTML = `You got ${currentPoints} points during the game`
    layoutController.classList.remove("hidden")
}


function changeLevel(){
    disableAll()

    currentLevel++
    currentTimer = maxTimer
    clearInterval(intervalID)

    setTimeout(()=>{
        game()
    }, 2000)
}

function disableAll(){
    answersList.forEach (btn => {
        btn.classList.add("disabled")
    })
}

function initGame(){
    let crinit = []
    for (let i = 0; i < 10; i++){
        let iT = false
        let r = allCountries[getRandomInt(0, allCountries.length)]
        crinit.forEach(c => {
            if (c != undefined){
                if (c.name == r.name) iT = true
            }
        });

        if (!iT) {crinit.push(r)}
        else i--
    }

    currentQuestions = []
    currentQuestions.push(...crinit)
    currentLevel = 1
    currentPoints = 0
    isInit = true

    gameController.classList.remove("hidden")
}

function getAllCountries(){
    return new Promise(resolve=>{
        axios
        .get("https://restcountries.com/v3.1/all")
        .then((response)=>{
            const data = response.data
            data.map((country) => {
                if (country.capital != undefined){
                    allCountries.push({
                        name: country.name.common,
                        capital: country.capital[0],
                        flagSVG: country.flags.svg,
                        randomCapitals: []
                    })
                }
            })
    
            allCountries.map((country) => {
                while (country.randomCapitals.length != 3) {
                    let f = getRandomInt(0, allCountries.length)
                    let r = allCountries[f]
                
                    if (country.capital != r.capital) {
                        country.randomCapitals.push(r.capital)
                    }
                }
            })
            resolve("Done")
        })
        .catch((error)=>{
            makeAlert("Could not load contries list")
            console.log(error);
        })
    })
}

function getRandomInt(min, max) {
    return Math.floor(Math.random() * (max - min)) + min;
}

function makeAlert(msg){
    alertMsg.innerHTML = msg
    alertDiv.style.display = "block";

    setTimeout(() => {
        alertDiv.style.display = "none";
    }, 5000);
}

function shuffleArray(array){
    for (let i = array.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [array[i], array[j]] = [array[j], array[i]]; // Swap elements
    }
}

function highlightAnswer(obj, color){
    obj.style.backgroundColor =`#${color}`
}