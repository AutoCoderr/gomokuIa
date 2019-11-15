
function displayGomoku() {
    let html = "";
    if (!finish) {
        if (currentPlayer === 2 && document.getElementById("partySelect").value === "ia") {
            html = "L'ia est en train de jouer...";
        } else {
            html = "C'est au joueur <font color='" + (currentPlayer === 1 ? "red" : "green") + "'>" + currentPlayer + "</font>";
        }
    }
    html += "<table><tr><th></th>";
    for (let c=0;c<gomoku[0].length;c++) {
        html += "<th>"+c+"</th>";
    }
    html += "</tr>";

    for (let l=0;l<gomoku.length;l++) {
        html += "<tr>";
        html += "<th>"+l+"</th>";
        for (let c=0;c<gomoku[l].length;c++) {
            html += "<td id='"+l+"-"+c+"' "+(gomoku[l][c] !== 0 ? "class='player"+gomoku[l][c]+"'" : "")+"></td>";
        }
        html += "</tr>";
    }
    html += "</table>";
    document.getElementById("gomoku").innerHTML = html;
    for (let l = 0; l < gomoku.length; l++) {
        for (let c = 0; c < gomoku[l].length; c++) {
            document.getElementById(l + "-" + c).onclick = function () {
                if (currentPlayer === 1 || document.getElementById("partySelect").value !== "ia" || !finish) {
                    clickGomoku(l, c);
                }
            }
        }
    }
}

function clickGomoku(l,c) {
    if (gomoku[l][c] !== 0) {
        return;
    }
    gomoku[l][c] = currentPlayer;
    let eval = evalScoreOrGetWinner(gomoku);
    if (typeof(eval.winner) != "undefined") {
        finish = true;
        displayGomoku();
        document.getElementById("gomoku").innerHTML = document.getElementById("gomoku").innerHTML +
                "<br/>Le gagnant est le joueur <font color='"+(eval.winner === 1 ? "red" : "green")+"'>"+eval.winner+"</font>";
    } else {
        currentPlayer = currentPlayer === 1 ? 2 : 1;
        displayGomoku();
        if (document.getElementById("partySelect").value === "ia" && currentPlayer === 2) {
            setTimeout(() => {
                useIA();
            }, 20);
        }
    }
}

function useIA() {
    if (finish) {
        return;
    }
    let ia = new IA();
    ia.startIa(parseInt(document.getElementById("selectLengthTree").value),parseInt(document.getElementById("selectSpaceFromUsedCase").value),(l,c) => {
        clickGomoku(l,c);
    });
}

function evalScoreOrGetWinner(gomoku) {
    let playerScore = {1: 0, 2: 0};
    for (let l=0;l<gomoku.length;l++) {
        for (let c=0;c<gomoku[l].length;c++) {
            if (gomoku[l][c] !== 0) {
                let player = gomoku[l][c];
                for (let i=0;i<arroundsCase.length;i++) {
                    let nb = 1;
                    while (nb <= 4 && existCell(l+(nb*arroundsCase[i].l),c+(nb*arroundsCase[i].c),gomoku)) {
                        if (gomoku[l+(nb*arroundsCase[i].l)][c+(nb*arroundsCase[i].c)] !== player) {
                            break;
                        }
                        nb += 1;
                    }
                    if (nb === 5) {
                        return {winner: player};
                    } else if(existCell(l+(nb*arroundsCase[i].l),c+(nb*arroundsCase[i].c),gomoku)) {
                        if (gomoku[l+(nb*arroundsCase[i].l)][c+(nb*arroundsCase[i].c)] === 0) {
                            playerScore[player] += nb;
                        }
                    }
                }
            }
        }
    }
    return playerScore;
}

function existCell(l,c,gomoku) {
    if (typeof(gomoku[l]) === "undefined") {
        return false;
    }
    if (typeof(gomoku[l][c]) === "undefined") {
        return false;
    }
    return true;
}

function genMatrice(h,w) {
    let tab = [];
    for (let l=0;l<h;l++) {
        tab.push([]);
        for (let c=0;c<w;c++) {
            tab[l].push(0);
        }
    }
    return tab;
}

let arroundsCase = [{l: -1, c: -1},{l: -1, c: 0},{l: -1, c: 1},
                    {l: 0, c: -1},{l: 0, c: 1},
                    {l: 1, c: -1},{l: 1, c: 0},{l: 1, c: 1}];
let finish;
let currentPlayer;
let gomoku;
function start() {
    let html = "";
    for(let i=1;i<=5;i++) {
        html += "<option value='"+i+"'>"+i+"</option>";
    }
    document.getElementById("selectLengthTree").innerHTML = html;
    document.getElementById("selectLengthTree").value = "2";

    document.getElementById("selectSpaceFromUsedCase").innerHTML = html;
    document.getElementById("selectSpaceFromUsedCase").value = "2";

    document.getElementById("choiceParty").style.display = "none";
    document.getElementById("party").style.display = "block";

    if (document.getElementById("partySelect").value === "ia") {
        document.getElementById("selectLengthTreeDiv").style.display = "block";
        document.getElementById("selectSpaceFromUsedCaseDiv").style.display = "block";
    } else {
        document.getElementById("selectLengthTreeDiv").style.display = "none";
        document.getElementById("selectSpaceFromUsedCaseDiv").style.display = "none";
    }
    finish = false;
    currentPlayer = Math.round(Math.random())+1;
    gomoku = genMatrice(15,15);
    if (document.getElementById("partySelect").value === "ia" && currentPlayer === 2) {
        useIA();
    } else {
        displayGomoku();
    }
}

function restart() {
    finish = false;
    currentPlayer = Math.round(Math.random())+1;
    gomoku = genMatrice(15,15);
    displayGomoku();
    if (document.getElementById("partySelect").value === "ia" && currentPlayer === 2) {
        useIA();
    }
}
