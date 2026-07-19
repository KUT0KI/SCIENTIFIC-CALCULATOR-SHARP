"use strict";

/* ==========================================================
   SCIENTIFIC CALCULATOR
   VERSION 2.0
   PART 1
========================================================== */

/* ==========================================================
   DOM REFERENCES
========================================================== */

const display = document.getElementById("display");
const expression = document.getElementById("expression");

const buttonGrid = document.getElementById("button-grid");

const historyPanel = document.getElementById("history-panel");
const historyList = document.getElementById("history-list");

const clearHistoryBtn = document.getElementById("clear-history");
const historyToggleBtn = document.getElementById("history-toggle");

const themeToggleBtn = document.getElementById("theme-toggle");

const speakBtn = document.getElementById("speak-btn");
const copyBtn = document.getElementById("copy-btn");
const downloadBtn = document.getElementById("download-btn");

/* ==========================================================
   APPLICATION STATE
========================================================== */

const state = {

    expression: "",

    result: "0",

    memory: 0,

    history: [],

    darkTheme: true,

    historyVisible: true,

    speaking: false

};

/* ==========================================================
   DISPLAY
========================================================== */

function updateDisplay(){

    display.value = state.expression || "0";

}

function updateExpression(text = state.expression){

    expression.textContent = text;

}

function refresh(){

    updateDisplay();

    updateExpression();

}

/* ==========================================================
   INPUT
========================================================== */

function append(value){

    state.expression += value;

    refresh();

}

function clearDisplay(){

    state.expression = "";

    state.result = "0";

    refresh();

}

function deleteLast(){

    state.expression = state.expression.slice(0,-1);

    refresh();

}

/* ==========================================================
   MEMORY
========================================================== */

function memoryAdd(){

    const value = Number(display.value);

    if(!isNaN(value)){

        state.memory += value;

    }

}

function memorySubtract(){

    const value = Number(display.value);

    if(!isNaN(value)){

        state.memory -= value;

    }

}

function memoryRecall(){

    state.expression = state.memory.toString();

    refresh();

}

function memoryClear(){

    state.memory = 0;

}

/* ==========================================================
   HISTORY
========================================================== */

function addHistory(exp,result){

    state.history.unshift({

        expression:exp,

        result,

        time:new Date()

    });

    renderHistory();

}

function renderHistory(){

    historyList.innerHTML="";

    state.history.forEach(item=>{

        const li=document.createElement("li");

        const time=item.time.toLocaleTimeString([],{

            hour:"2-digit",

            minute:"2-digit"

        });

        li.innerHTML=`

            <strong>${time}</strong>

            <br><br>

            ${item.expression}

            <br>

            = ${item.result}

        `;

        historyList.appendChild(li);

    });

}

clearHistoryBtn.addEventListener("click",()=>{

    state.history=[];

    renderHistory();

});

historyToggleBtn.addEventListener("click",()=>{

    state.historyVisible=!state.historyVisible;

    historyPanel.style.display=

        state.historyVisible

        ? "block"

        : "none";

});

/* ==========================================================
   THEME
========================================================== */

themeToggleBtn.addEventListener("click",()=>{

    document.body.classList.toggle("light");

    state.darkTheme=!state.darkTheme;

    themeToggleBtn.textContent=

        state.darkTheme

        ? "🌙"

        : "☀️";

});

/* ==========================================================
   START
========================================================== */

refresh();
/* ==========================================================
   PART 2
   BUTTON EVENTS & INPUT MANAGER
========================================================== */

/* ==========================================================
   SPECIAL INPUTS
========================================================== */

function insertSquare(){

    state.expression += "²";

    refresh();

}

function insertPower(){

    state.expression += "^";

    refresh();

}

function insertFactorial(){

    state.expression += "!";

    refresh();

}

/* ==========================================================
   MEMORY BUTTON HANDLER
========================================================== */

function handleMemory(action){

    switch(action){

        case "mc":

            memoryClear();

            break;

        case "mr":

            memoryRecall();

            break;

        case "mplus":

            memoryAdd();

            break;

        case "mminus":

            memorySubtract();

            break;

    }

}

/* ==========================================================
   ACTION BUTTON HANDLER
========================================================== */

function handleAction(action){

    switch(action){

        case "clear":

            clearDisplay();

            break;

        case "delete":

            deleteLast();

            break;

        case "square":

            insertSquare();

            break;

        case "power":

            insertPower();

            break;

        case "factorial":

            insertFactorial();

            break;

        case "equals":

            calculate();

            break;

    }

}

/* ==========================================================
   VALUE BUTTON HANDLER
========================================================== */

function handleValue(value){

    switch(value){

        case "PI":

            append("PI");

            break;

        case "E":

            append("E");

            break;

        default:

            append(value);

            break;

    }

}

/* ==========================================================
   EVENT DELEGATION
========================================================== */

buttonGrid.addEventListener("click",(event)=>{

    const button = event.target.closest("button");

    if(!button) return;

    if(button.dataset.value){

        handleValue(button.dataset.value);

        return;

    }

    if(button.dataset.action){

        handleAction(button.dataset.action);

        return;

    }

});

/* ==========================================================
   MEMORY EVENTS
========================================================== */

document.querySelector(".memory")

.addEventListener("click",(event)=>{

    const button = event.target.closest("button");

    if(!button) return;

    if(button.dataset.memory){

        handleMemory(button.dataset.memory);

    }

});
/* ==========================================================
   PART 3
   CALCULATOR ENGINE
========================================================== */

/* ==========================================================
   MATH HELPERS
========================================================== */

function factorial(number){

    if(number < 0){

        throw new Error("Negative factorial");

    }

    if(!Number.isInteger(number)){

        throw new Error("Factorial requires an integer");

    }

    let answer = 1;

    for(let i = 2; i <= number; i++){

        answer *= i;

    }

    return answer;

}

function degreesToRadians(angle){

    return angle * (Math.PI / 180);

}

/* ==========================================================
   PARSER
========================================================== */

function parseExpression(expressionString){

   let exp = insertImplicitMultiplication(

    expressionString

);

    /* ---------- Constants ---------- */

    exp = exp.replace(/\bPI\b/g,"Math.PI");

    exp = exp.replace(/\bE\b/g,"Math.E");

    /* ---------- Square Root ---------- */

    exp = exp.replace(/sqrt\(/g,"Math.sqrt(");

    /* ---------- Log ---------- */

    exp = exp.replace(/log\(/g,"Math.log10(");

    exp = exp.replace(/ln\(/g,"Math.log(");

    /* ---------- Trigonometry ---------- */

    exp = exp.replace(

        /sin\((.*?)\)/g,

        (_,value)=>`Math.sin(degreesToRadians(${value}))`

    );

    exp = exp.replace(

        /cos\((.*?)\)/g,

        (_,value)=>`Math.cos(degreesToRadians(${value}))`

    );

    exp = exp.replace(

        /tan\((.*?)\)/g,

        (_,value)=>`Math.tan(degreesToRadians(${value}))`

    );

    /* ---------- Square ---------- */

    exp = exp.replace(

        /(\d+(\.\d+)?)²/g,

        (_,value)=>`Math.pow(${value},2)`

    );

    /* ---------- Power ---------- */

    exp = exp.replace(

        /(\d+(\.\d+)?)\^(\d+(\.\d+)?)/g,

        (_,base,__,power)=>`Math.pow(${base},${power})`

    );

    /* ---------- Percentage ---------- */

    exp = exp.replace(

    /(\d+(\.\d+)?)%/g,

    (_,value)=>`(${value}/100)`

);

/*
Future improvement:

50+10%

↓

55

We'll implement calculator-style
percentages later.

*/

    /* ---------- Factorial ---------- */

    exp = exp.replace(

        /(\d+)!/g,

        (_,value)=>`factorial(${value})`

    );

    return exp;

}

/* ==========================================================
   RESULT FORMATTER
========================================================== */

function formatResult(value){

    if(Number.isInteger(value)){

        return value.toString();

    }

const rounded =

Number(

value.toPrecision(12)

);

return rounded.toString();
}

/* ==========================================================
   CALCULATE
========================================================== */

function calculate(){

    if(state.expression.trim()===""){

        return;

    }

    const originalExpression = state.expression;

    try{

        const parsedExpression =

            parseExpression(originalExpression);

        const answer = Function(

            "factorial",

            "degreesToRadians",

            `"use strict"; return (${parsedExpression});`

        )(factorial,degreesToRadians);

        if(!Number.isFinite(answer)){

            throw new Error();

        }

        const finalAnswer =

            formatResult(answer);

        state.result = finalAnswer;

        state.expression = finalAnswer;

        updateDisplay();

        updateExpression(originalExpression);

        addHistory(

            originalExpression,

            finalAnswer

        );

    }

    catch(error){

        display.value = "Error";

        updateExpression(originalExpression);

        state.expression = "";

    }

}
/* ==========================================================
   PART 4
   PARSER IMPROVEMENTS
========================================================== */

function insertImplicitMultiplication(exp){

    let output = exp;

    /* -----------------------------
       Number before (
    ------------------------------ */

    output = output.replace(

        /(\d)\(/g,

        "$1*("

    );

    /* -----------------------------
       ) before number
    ------------------------------ */

    output = output.replace(

        /\)(\d)/g,

        ")*$1"

    );

    /* -----------------------------
       )(
    ------------------------------ */

    output = output.replace(

        /\)\(/g,

        ")*("

    );

    /* -----------------------------
       Number before PI
    ------------------------------ */

    output = output.replace(

        /(\d)(PI)/g,

        "$1*$2"

    );

    /* -----------------------------
       Number before E
    ------------------------------ */

    output = output.replace(

        /(\d)(E)/g,

        "$1*$2"

    );

    /* -----------------------------
       Number before function
    ------------------------------ */

    output = output.replace(

        /(\d)(sin|cos|tan|sqrt|log|ln)/g,

        "$1*$2"

    );

    return output;

}
/* ==========================================================
   PART 5
   VOICE • COPY • EXPORT
========================================================== */

/* ==========================================================
   SPEECH
========================================================== */

const speech = window.speechSynthesis;

let utterance = null;

function speakResult(){

    if(!("speechSynthesis" in window)){

        alert("Speech synthesis is not supported.");

        return;

    }

    speech.cancel();

    utterance = new SpeechSynthesisUtterance(

        display.value

    );

    utterance.rate = 1;

    utterance.pitch = 1;

    utterance.volume = 1;

    utterance.onstart = ()=>{

        state.speaking = true;

        speakBtn.textContent = "⏹ Stop";

    };

    utterance.onend = ()=>{

        state.speaking = false;

        speakBtn.textContent = "🔊 Speak";

    };

    speech.speak(utterance);

}

function stopSpeaking(){

    speech.cancel();

    state.speaking = false;

    speakBtn.textContent = "🔊 Speak";

}

speakBtn.addEventListener("click",()=>{

    if(state.speaking){

        stopSpeaking();

    }

    else{

        speakResult();

    }

});

/* ==========================================================
   COPY RESULT
========================================================== */

copyBtn.addEventListener("click",async()=>{

    try{

        await navigator.clipboard.writeText(

            display.value

        );

        copyBtn.textContent="✅ Copied";

        setTimeout(()=>{

            copyBtn.textContent="📋 Copy";

        },1500);

    }

    catch(error){

        alert("Copy failed.");

    }

});

/* ==========================================================
   EXPORT HISTORY
========================================================== */

downloadBtn.addEventListener("click",()=>{

    if(state.history.length===0){

        alert("History is empty.");

        return;

    }

    let output="";

    state.history.forEach(item=>{

        output+=`${item.expression} = ${item.result}\n`;

    });

    const blob=new Blob(

        [output],

        {

            type:"text/plain"

        }

    );

    const url=

    URL.createObjectURL(blob);

    const link=

    document.createElement("a");

    link.href=url;

    link.download="Calculator History.txt";

    link.click();

    URL.revokeObjectURL(url);

});
/* ==========================================================
   PART 6
   KEYBOARD SUPPORT
========================================================== */

document.addEventListener("keydown",(event)=>{

    /* -------------------------
       Ignore if modifier keys
    -------------------------- */

    if(event.ctrlKey || event.metaKey){

        switch(event.key.toLowerCase()){

            case "c":

                event.preventDefault();

                copyBtn.click();

                return;

            case "s":

                event.preventDefault();

                speakBtn.click();

                return;

        }

    }

    /* -------------------------
       Numbers
    -------------------------- */

    if(/[0-9]/.test(event.key)){

        append(event.key);

        return;

    }

    /* -------------------------
       Decimal
    -------------------------- */

    if(event.key === "."){

        append(".");

        return;

    }

    /* -------------------------
       Operators
    -------------------------- */

    if(["+","-","*","/","%","(",")","^"].includes(event.key)){

        append(event.key);

        return;

    }

    /* -------------------------
       Enter
    -------------------------- */

    if(event.key === "Enter"){

        event.preventDefault();

        calculate();

        return;

    }

    /* -------------------------
       Backspace
    -------------------------- */

    if(event.key === "Backspace"){

        event.preventDefault();

        deleteLast();

        return;

    }

    /* -------------------------
       Delete
    -------------------------- */

    if(event.key === "Delete"){

        event.preventDefault();

        clearDisplay();

        return;

    }

    /* -------------------------
       Escape
    -------------------------- */

    if(event.key === "Escape"){

        clearDisplay();

        return;

    }

});
/* ==========================================================
   PART 7
   INITIALIZATION & FINAL POLISH
========================================================== */

/* ==========================================================
   EMPTY HISTORY
========================================================== */

function updateEmptyHistory(){

    if(state.history.length===0){

        historyList.innerHTML=`

            <li class="empty-history">

                No calculations yet.

            </li>

        `;

    }

}

/* ==========================================================
   HISTORY OVERRIDE
========================================================== */

const oldRenderHistory = renderHistory;

renderHistory=function(){

    oldRenderHistory();

    updateEmptyHistory();

}

/* ==========================================================
   MEMORY INDICATOR
========================================================== */

function updateMemoryIndicator(){

    const title=document.querySelector(".header span");

    if(state.memory!==0){

        title.textContent="Voice Edition • M";

    }

    else{

        title.textContent="Voice Edition";

    }

}

/* ==========================================================
   OVERRIDE MEMORY FUNCTIONS
========================================================== */

const oldMemoryAdd=memoryAdd;

memoryAdd=function(){

    oldMemoryAdd();

    updateMemoryIndicator();

}

const oldMemorySubtract=memorySubtract;

memorySubtract=function(){

    oldMemorySubtract();

    updateMemoryIndicator();

}

const oldMemoryClear=memoryClear;

memoryClear=function(){

    oldMemoryClear();

    updateMemoryIndicator();

}

/* ==========================================================
   STARTUP
========================================================== */

function initializeCalculator(){

    refresh();

    renderHistory();

    updateMemoryIndicator();

    speech.cancel();

    themeToggleBtn.textContent=

        state.darkTheme

        ? "🌙"

        : "☀️";

    display.focus();

}

/* ==========================================================
   START APP
========================================================== */

initializeCalculator();