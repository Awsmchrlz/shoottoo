//original algorithym to create maze draw: https://www.dstromberg.com/2013/07/tutorial-random-maze-generation-algorithm-in-javascript/
//heck, canvas should be less resource hungry and would make for better animation
//code could be improved a lot :D

let mazeSize = 25;
let playerpos = {x:0,y:0};
let winpos = {x:mazeSize,y:mazeSize};
let step = {x: 26, y: 26};

//responsive TODO: listener on resize
if(window.innerWidth < 750) {
 step.x = 14;
 step.y = 14;
 mazeSize = 20;
}
window.addEventListener('resize', function(e){
  if(window.innerWidth < 750) {
   step.x = 14;
   step.y = 14;
   mazeSize = 20;
 }
 else {
  step.x = 26;
  step.y = 26;
 }
});

function newMaze(x,y) {

// Establish variables and starting grid
var totalCells = x*y;
var cells = new Array();
var unvis = new Array();
for (var i = 0; i < y; i++) {
    cells[i] = new Array();
    unvis[i] = new Array();
    for (var j = 0; j < x; j++) {
        cells[i][j] = [0,0,0,0];
        unvis[i][j] = true;
    }
}

// Set a random position to start from
var currentCell = [Math.floor(Math.random()*y), Math.floor(Math.random()*x)];
var path = [currentCell];
unvis[currentCell[0]][currentCell[1]] = false;
var visited = 1;

// Loop through all available cell positions
while (visited < totalCells) {
    // Determine neighboring cells
    var pot = [[currentCell[0]-1, currentCell[1], 0, 2],
            [currentCell[0], currentCell[1]+1, 1, 3],
            [currentCell[0]+1, currentCell[1], 2, 0],
            [currentCell[0], currentCell[1]-1, 3, 1]];
    var neighbors = new Array();
    
    // Determine if each neighboring cell is in game grid, and whether it has already been checked
    for (var l = 0; l < 4; l++) {
        if (pot[l][0] > -1 && pot[l][0] < y && pot[l][1] > -1 && pot[l][1] < x && unvis[pot[l][0]][pot[l][1]]) { neighbors.push(pot[l]); }
    }
    
    // If at least one active neighboring cell has been found
    if (neighbors.length) {
        // Choose one of the neighbors at random
        next = neighbors[Math.floor(Math.random()*neighbors.length)];
        
        // Remove the wall between the current cell and the chosen neighboring cell
        cells[currentCell[0]][currentCell[1]][next[2]] = 1;
        cells[next[0]][next[1]][next[3]] = 1;
        
        // Mark the neighbor as visited, and set it as the current cell
        unvis[next[0]][next[1]] = false;
        visited++;
        currentCell = [next[0], next[1]];
        path.push(currentCell);
    }
    // Otherwise go back up a step and keep going
    else {
        currentCell = path.pop();
    }
}
return cells;
}

var disp = newMaze(mazeSize,mazeSize);
//console.log(disp);
let myHTML =  "";
for (var i = 0; i < disp.length; i++) {
  myHTML +=  '<div class="row">';
//document.querySelector('#maze > tbody').appendChild();
  for (var j = 0; j < disp[i].length; j++) {
    var selector = i+"-"+j;
    myHTML += "<div id='"+selector+"' class='square ";
    if (disp[i][j][0] == 0) { myHTML += 'border-top '; }
    if (disp[i][j][1] == 0) { myHTML += 'border-right '; }
    if (disp[i][j][2] == 0) { myHTML += 'border-bottom '; }
    if (disp[i][j][3] == 0) { myHTML += 'border-left '; }
    if(i == disp[i].length - 1 && j == disp[i].length - 1) {  myHTML += 'goal';}
    myHTML += "'>&nbsp;</div>";
  }
  myHTML += "</div>";
//$document.querySelector('#maze > tbody').appendChild("</tr>");
}
document.querySelector('#maze').innerHTML = myHTML;

sky = document.getElementById('skyzinha');
let lock = false;
//mobile keys
document.getElementById('up').addEventListener('click', function(e){ mobileMove(e,'t'); });
document.getElementById('down').addEventListener('click', function(e){ mobileMove(e,'b'); });
document.getElementById('left').addEventListener('click', function(e){ mobileMove(e,'l'); });
document.getElementById('right').addEventListener('click', function(e){ mobileMove(e,'r'); });

const mobileMove = (e,type) => {
 e.preventDefault();
 if(lock) { return; }
 lock = true;
 rotateSky(type);
 move(type) ;
}


document.addEventListener('keydown', function(e){
 e = e || window.event;
 e.preventDefault();
 if(lock) { return; }
 lock = true;
 sky.querySelector('.pawn').classList.toggle('active');
 setTimeout(()=>   {sky.querySelector('.pawn').classList.toggle('active');},500)
  if (e.keyCode == '38') {
    // up arrow
    
    rotateSky('t');
    move('t') ;
    
    }
    else if (e.keyCode == '40') {
     // down arrow
     rotateSky('b');
     move('b');
    }
    else if (e.keyCode == '37') {
       // left arrow
     rotateSky('l');
     move('l');
    }
    else if (e.keyCode == '39') {
     // right arrow
     rotateSky('r');
     move('r');
    }
 
});


const move = (direction)=>{
 //catch current position
 let x = playerpos.x;
 let y = playerpos.y;
 //verify if wall is open
 switch(direction){
  case 't' : {
   if(y-1>=0 && disp[y][x][0] != 0) { 
    y -= 1;
    sky.style.top =  step.y * y + 'px';
    playerpos.y = y;
    console.log(y, sky.style.top);
   }
   break;
  }
  
  case 'r' : {
    if(x+1<mazeSize && disp[y][x][1] != 0) { 
     x += 1;
    sky.style.left =  step.x * x + 'px';
    playerpos.x = x;
    console.log(x, sky.style.left);
   }
  break;
  }
  case 'b' : {
   if(y+1<mazeSize && disp[y][x][2] != 0) { 
    y += 1;
    sky.style.top =  step.y * y + 'px';
    playerpos.y = y;
    console.log(y, sky.style.top);
   }
  break;
  }
  case 'l' : {
    if(x-1>= 0 && disp[y][x][3] != 0) { 
     x -= 1;
    sky.style.left =  step.x * x + 'px';
    playerpos.x = x;
    console.log(x, sky.style.left);
   }
  break;
  }
 }
 //sky.querySelector('.pawn').classList.toggle('active');
 lock = false;
 if(playerpos.x == mazeSize-1 && playerpos.y == mazeSize -1) {
  win();
 }
}



const rotateSky = (direction) => {
 switch(direction){
  case 't' : {
   sky.style.transform = 'rotate(-90deg)';
  break;
  }
  case 'r' : {
    sky.style.transform = 'rotate(0deg)';
  break;
  }
  case 'b' : {
    sky.style.transform = 'rotate(90deg)';
  break;
  }
  case 'l' : {
    sky.style.transform = 'rotate(-180deg)';
  break;
  }
 }
 
}

const win = ()=>{
 //modal win
 let modal = document.querySelector('.end');
 modal.style.visibility = 'visible';
 modal.querySelector('a').addEventListener('click', function(e){
 })

}