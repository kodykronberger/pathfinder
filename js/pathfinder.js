var p = "Player";
var w = "Win";
var updateRate = 0;
var isStopped = true;
var tileToLeaveBehind = 0;
var retries = 0;
var numberOfRetriesToTest = 3;
var numberOfStepsToCalculate = 1000;
var walls = 
    [
        [ 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, ],
        [ 1, p, 0, 0, 0, 0, 0, 0, 0, 1, ],
        [ 1, 0, 1, 0, 1, 1, 0, 1, 0, 1, ],
        [ 1, 0, 1, 0, 0, 0, 0, 1, 0, 1, ],
        [ 1, 0, 1, 1, 1, 1, 0, 1, 0, 1, ],
        [ 1, 0, 1, 1, 1, 1, 0, 1, 0, 1, ],
        [ 1, 0, 1, 0, 0, 0, 0, 1, 0, 1, ],
        [ 1, 0, 1, 0, 1, 1, 0, 1, 0, 1, ],
        [ 1, 0, 0, 0, 0, 0, 0, 0, w, 1, ],
        [ 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, ]
    ];
var currentMoveList = [];
var bestMoveList = [];
var player = {
    x: 1,
    y: 1,
    dir: "down",
    moves: []
}

$(document).ready(function(){
    init();
});

function init(){
    t = null;
    renderGrid();
    updateRate = $("#updaterate").val();
    $("#calculationsteps").val("1000");
    numberOfStepsToCalculate = $("#calculationsteps").val();
    $("#stop-btn").prop("disabled", "true");
    $("#hide-steps-btn").prop("disabled", "true");
    $("#hide-moves-btn").prop("disabled", "true");
    $("#hide-array-btn").prop("disabled", "true");
    $("#mapped-array").hide();
    $("#steps-list").hide();
    $("#best-moves-list").hide();
    $("#start-btn").click(function(){
        isStopped = false;
        t = setInterval(function(){
            update(true);
        }, updateRate)
        document.getElementById("stop-btn").disabled = false;
        document.getElementById("start-btn").disabled = true;
    });
    
    $("#stop-btn").click(function(){
        isStopped = true;
        clearInterval(t);
        document.getElementById("stop-btn").disabled = true;
        document.getElementById("start-btn").disabled = false;
    });
    
    $("#reset-btn").click(function(){
        retries = 0;
        currentMoveList = [];
        bestMoveList = [];
        $("#best-moves-list").html("");
        resetBoard("User manually reset game.");
    });
    
    $("#show-steps-btn").click(function(){
        $("#hide-steps-btn").prop("disabled", false);
        $("#show-steps-btn").prop("disabled", true);
        $("#steps-list").fadeIn();
    });
    
    $("#hide-steps-btn").click(function(){
        $("#show-steps-btn").prop("disabled", false);
        $("#hide-steps-btn").prop("disabled", true);
        $("#steps-list").fadeOut();
    });
    
    $("#clear-steps-btn").click(function(){
        $("#steps-list").empty();
    });
    
    $("#show-moves-btn").click(function(){
        $("#hide-moves-btn").prop("disabled", false);
        $("#show-moves-btn").prop("disabled", true);
        $("#best-moves-list").fadeIn();
    });
    
    $("#hide-moves-btn").click(function(){
        $("#show-moves-btn").prop("disabled", false);
        $("#hide-moves-btn").prop("disabled", true);
        $("#best-moves-list").fadeOut();
    });
    
    $("#show-array-btn").click(function(){
        $("#hide-array-btn").prop("disabled", false);
        $("#show-array-btn").prop("disabled", true);
        $("#mapped-array").fadeIn();
    });
    
    $("#hide-array-btn").click(function(){
        $("#show-array-btn").prop("disabled", false);
        $("#hide-array-btn").prop("disabled", true);
        $("#mapped-array").fadeOut();
    });
    
    $("#step-btn").click(function(){
        update(true);
    });
    
    $("#calculate-button").click(function(){
        tD = null;
        tT = null;
        
        var timesRun = 0;
        resetBoard("Initializing auto-calculate..");
        currentMoveList = [];
        bestMoveList = [];
        $("#best-moves-list").html("");
        $("#calculation-progress").prop("max", numberOfStepsToCalculate);
        var time = 0;
        tT = setInterval(function(){
            time++;
        }, 100);
        
        tD = setInterval(function(){
            update($("#render-checkbox").prop("checked"));
            timesRun++;
            $("#calculation-progress").prop("value", timesRun);
            if(bestMoveList.length != 0 && currentMoveList.length > bestMoveList.length){
                resetBoard("Current list of moves is greater than best.");
                currentMoveList = [];
            }
            if(timesRun >= numberOfStepsToCalculate){
                showBestPath(time / 10);
                clearInterval(tD);
                clearInterval(tT);
            }
        }, 0)
    });
    
    $("#leave-trail-checkbox").change(function(){
        if($("#leave-trail-checkbox").prop("checked")){
            tileToLeaveBehind = 2;
        } else {
            tileToLeaveBehind = 0;
        }
    });
    
    $("#updaterate-number").html($("#updaterate").val());
    $("#updaterate").mousemove(function(){
        $("#updaterate-number").html($("#updaterate").val());
        updateRate = $("#updaterate").val();
        if(document.getElementById("start-btn").disabled == true) {
            clearInterval(t);
            t = setInterval(function(){
                update(true);
            }, updateRate)
        }
    });
    $("#render-checkbox").prop("checked", "true")
    $("#calculationsteps-number").html($("#calculationsteps").val());
    $("#calculationsteps").mousemove(function(){
        $("#calculationsteps-number").html($("#calculationsteps").val());
        numberOfStepsToCalculate = $("#calculationsteps").val();
    });
    
    $("#calculationstepstext").blur(function(){
        var value = parseInt($("#calculationstepstext").val());
        if(value < $("#calculationsteps").prop("min")){
            value = $("#calculationsteps").prop("min");
        }
        if(value > $("#calculationsteps").prop("max")){
            value = $("#calculationsteps").prop("max");
        }
        if(!isNaN(value)){
            $("#calculationsteps-number").html(value);
            $("#calculationsteps").val(value);
            numberOfStepsToCalculate = value;
        }
        $("#calculationstepstext").val("");
    });
    $("#updateratetext").blur(function(){
        var value = parseInt($("#updateratetext").val());
        if(value < $("#updaterate").prop("min")){
            value = $("#updaterate").prop("min");
        }
        if(value > $("#updaterate").prop("max")){
            value = $("#updaterate").prop("max");
        }
        if(!isNaN(value)){
            $("#updaterate-number").html(value);
            $("#updaterate").val(value);
            updateRate = value;
            if(document.getElementById("start-btn").disabled == true) {
                clearInterval(t);
                t = setInterval(function(){
                    update(true);
                }, updateRate)
            }
        }
        $("#updateratetext").val("");
    });
    $("#custom-array").blur(function(){
        alert("Working on it..");
    });
    
    logPosition();
}

function update(doRender){
    makePlayersNextMove();
    if(doRender){
        renderGrid();
    }
}

function makePlayersNextMove(){
    // Create available directions to move.
    var directionsAvailable = [];
    if(walls[player.y][player.x + 1] == 0 || walls[player.y][player.x + 1] == w){
        if(player.dir != "left"){
            directionsAvailable.push("right")
        } 
    }
    if(walls[player.y][player.x - 1] == 0 || walls[player.y][player.x - 1] == w){
        if(player.dir != "right"){
            directionsAvailable.push("left")
        }
    }
    if(walls[player.y - 1][player.x] == 0 || walls[player.y - 1][player.x] == w){
        if(player.dir != "down"){
            directionsAvailable.push("up")
        }
    }
    if(walls[player.y + 1][player.x] == 0 || walls[player.y + 1][player.x] == w){
        if(player.dir != "up"){
            directionsAvailable.push("down")
        }
    }
    
    if(directionsAvailable.length == 0){
        retries++;
        switch(player.dir) {
            case "up":
                player.dir = "down";
                break;
            case "down":
                player.dir = "up";
                break;
            case "left":
                player.dir = "right";
                break;
            case "right":
                player.dir = "left";
                break;
        }
        logHitWall();
    } else {
        var directionIndex = Math.floor(Math.random() * directionsAvailable.length)
        player.dir = directionsAvailable[directionIndex];
        moveInDirIfPossible();
        retries = 0;
    }
    
    if(retries == numberOfRetriesToTest){
        retries = 0;
        currentMoveList = [];
        resetBoard("Player was stuck.");
    }
}

function moveInDirIfPossible(){
    var nextTile;
    var newX = player.x, newY = player.y;
    switch(player.dir){
        case "down":
            nextTile = walls[player.y + 1][player.x];
            newY++;
            break;
        case "up":
            nextTile = walls[player.y - 1][player.x];
            newY--;
            break;
        case "left":
            nextTile = walls[player.y][player.x - 1];
            newX--;
            break;
        case "right":
            nextTile = walls[player.y][player.x + 1];
            newX++;
            break;
    }
    
    if(nextTile != 1){
        walls[player.y][player.x] = tileToLeaveBehind;
        if(nextTile == 0){
            walls[newY][newX] = p;
            player.x = newX;
            player.y = newY;
            logNewStep();
            logPosition();
            return true;
        } else if(nextTile == 2) {
            resetBoard();
            return false;
        } else if(nextTile == w) {
            resetBoard("Player reached destination!");
            updateBestMoveList();
            currentMoveList = [];
            return false;
        } else {
            return false;
        }
    } else {
        logHitWall();
        return false;
    }
}

function changeTile(x, y){
    switch(walls[y][x]) {
        case 0:
            walls[y][x] = w;
            break;
        case 1:
            walls[y][x] = 0;
            break;
        case w:
            walls[y][x] = 1;
            break;
        case p:
            alert("player");
            break;
    }
}
// %%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%
// WIN FUNCTIONS -----------------------------------------------------
// %%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%
function resetBoard(message){
    for(var y = 0; y < walls.length; y++){
        for(var x = 0; x < walls[y].length; x++) {
            if(walls[y][x] == 2 || walls[y][x] == p){
                walls[y][x] = 0;
            }
        }
    }
    
    player.x = 1;
    player.y = 1;
    player.dir = "down";
    
    walls[1][1] = p;
    
    logReset(message);
    renderGrid();
}

function showBestPath(time){
    resetBoard("Calculation complete! (" + numberOfStepsToCalculate + " steps calculated, took " + time + " seconds)");
    var currentx = 1;
    var currenty = 1;
    
    if(bestMoveList.length == 0){
        return;
    }
    
    for(var i = 0;i < bestMoveList.length;i++){
        switch(bestMoveList[i].toString()){
            case "down":
                currenty++;
                break;
            case "up":
                currenty--;
                break;
            case "left":
                currentx--;
                break;
            case "right":
                currentx++;
                break;
        }
        walls[currenty][currentx] = 2;
    }
    
    renderGrid();
    clearInterval(t);
}

// %%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%
// RENDER FUNCTIONS ------------------------------------------------------
// %%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%

function renderGrid(){
    $("#container").empty();
    for(var y = 0; y < walls.length; y++){
        for(var x = 0; x < walls[y].length; x++) {
            if(x == 0 || y == 0 || x == (walls[y].length - 1) || y == (walls.length - 1)){
                var wall = $("<div class='tile outerwall x" + x + " y" + y + "'>");
                $("#container").append(wall);
            } else if(walls[y][x] == 1){
                var wall = $("<div class='tile wall x" + x + " y" + y + "'>");
                $("#container").append(wall);
            } else if(walls[y][x] == 0) {
                var ground = $("<div class='tile ground x" + x + " y" + y + "'>");
                $("#container").append(ground);
            } else if(walls[y][x] == 2) {
                var ground = $("<div class='tile ground x" + x + " y" + y + " stepped-over'>");
                $("#container").append(ground);
            } else if(walls[y][x] == w) {
                var win = $("<div class='tile win x" + x + " y" + y + "'>");
                $("#container").append(win);
            } else if(walls[y][x] == "Player") {
                var ground = $("<div class='tile ground x" + x + " y" + y + "'>");
                $("#container").append(ground);
                var playerElement = $("<div class='tile player x" + x + " y" + y + " player-" + player.dir + "'>");
                playerElement.css("margin-top", y * 64);
                playerElement.css("margin-left", x * 64);
                $("#container").append(playerElement);
            }
        }
    }
    addBorders();
    setupTiles();
    logMappedArray();
}

function setupTiles(){
    $(".tile").mousedown(function(){
        var classes = this.classList.toString().split(" ");
        if(classes[1] != "outerwall" && classes[1] != "player"){
            var x = classes[2].substr(1,1);
            var y = classes[3].substr(1,1);
            changeTile(x, y);
            renderGrid();
        }
    });
}

function getTileBorders(tilex,tiley,isOuterTile) {
    var borders = [];

    if(isOuterTile){
        if(tilex == 0){
            borders.push("tile-border-left");
            if(walls[tiley][tilex + 1] != 1){
                borders.push("tile-border-right");
            }
        }
        
        if(tiley == 0){
            borders.push("tile-border-top");
            if(walls[tiley + 1][tilex] != 1){
                borders.push("tile-border-bottom");
            }
        }
        
        if(tilex == walls[0].length - 1){
            borders.push("tile-border-right");
            if(walls[tiley][tilex - 1] != 1){
                borders.push("tile-border-left");
            }
        }
        
        if(tiley == walls.length - 1){
            borders.push("tile-border-bottom");
            if(walls[tiley - 1][tilex] != 1){
                borders.push("tile-border-top");
            }
        }
    } else {
        if(walls[tiley][tilex - 1] != 1){
            borders.push("tile-border-left");
        }
        if(walls[tiley][tilex + 1] != 1){
            borders.push("tile-border-right");
        }
        if(walls[tiley - 1][tilex] != 1){
            borders.push("tile-border-top");
        }
        if(walls[tiley + 1][tilex] != 1){
            borders.push("tile-border-bottom");
        }
    }
    
    return borders;
}

function addBorders() {
    var wallTiles = $(".wall, .outerwall");
    for(var i = 0; i < wallTiles.length; i++){
        var classes = wallTiles[i].classList.toString().split(" ");
        var column = Number(classes[2].substr(1,1));
        var row = Number(classes[3].substr(1,1));
        var isOuterTile = false;
        if(classes[1] == "outerwall"){
            isOuterTile = true;
        }
        var borders = getTileBorders(column,row, isOuterTile);
        
        for(var b = 0; b < borders.length; b++){
            $(wallTiles[i]).addClass(borders[b]);
        }
    }
}

// %%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%
// LOGGING FUNCTIONS -----------------------------------------------------
// %%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%
function logNewStep(){
    var text = "Player, moved " + player.dir + " -- X: " + player.x  + " Y: " + player.y;
    $("#steps-list").append($("<li class='step-li-item'>" + text + "</li>"));
    $("#steps-number").html(Number($("#steps-number").html()) + 1);
    currentMoveList.push(player.dir);
    scrollToBottomOfSteps();
}

function logHitWall(){
    var text = "Player, unable to move in current direction, tries: " + retries;
    $("#steps-list").append($("<li class='step-li-item'>" + text + "</li>"));
    $("#steps-number").html(Number($("#steps-number").html()) + 1);
    currentMoveList.push("turn around");
    scrollToBottomOfSteps();
}

function logMappedArray(){
    var output = "";
    for(var y = 0; y < walls.length; y++){
        output += "<span class='array-orange'>[</span> ";
        
        for(var x = 0; x < walls[y].length; x++) {
            if(walls[y][x] == "Player"){
                output += "<span class='array-orange'>p</span><span class='array-black'>,</span> ";
            }else if(walls[y][x] == "Win"){
                output += "<span class='array-orange'>w</span><span class='array-black'>,</span> ";
            } else {
                output += "<span class='array-blue'>" + walls[y][x] + "</span><span class='array-black'>,</span> ";
            }
        }
        
        output += " <span class='array-orange'>]</span>,<br />";
    }
    $("#mapped-array").html(output.slice(0, -7));
}

function logPosition(){
    $("#player-x-position").html(player.x);
    $("#player-y-position").html(player.y);
}

function logReset(message){
    var text = "<span class='error-red'>Resetting board: " + message + "</span>";
    $("#steps-list").append($("<li class='step-li-item'>" + text + "</li>"));
    $("#steps-number").html("0");
    
    scrollToBottomOfSteps();
}

function updateBestMoveList(){
    if(currentMoveList.length == 0){
        return;
    }
    if(bestMoveList.length == 0 || currentMoveList.length < bestMoveList.length){
        bestMoveList = currentMoveList;
        var text = "<span class='array-orange'>[ </span>";
        
        for(var i = 0;i < bestMoveList.length;i++){
            if(i == bestMoveList.length - 1){
                text += "<span class='array-blue'>" + bestMoveList[i] + "</span>"; 
            } else {
                text += "<span class='array-blue'>" + bestMoveList[i] + "</span><span class='array-black'>, </span>";
            }
        }
            
        text += "<span class='array-orange'> ] </span><span class='array-blue'>" + bestMoveList.length + " moves.</span>";
            
        $("#best-moves-list").html(text);
    }
    currentMoveList = [];
}

function scrollToBottomOfSteps() {
    var list = document.getElementById("steps-list");
    list.scrollTop = list.scrollHeight;
}