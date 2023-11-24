var suit = ['♥','♦','♠','♣'],
    card = ['A',2,3,4,5,6,7,8,9,10,'J','Q','K'],
    shuffle = [],
    selected = '',
    size = 0,
    index = 100,
    x = 10,
    y = 10;
function buildDeck(){
  for (i=0;i<suit.length;i++){
    for (j=0;j<card.length;j++){
      shuffle.push([suit[i],card[j]])
      size = shuffle.length
    }
  }
  for (k=0;k<size;k++){
    var pick = Math.floor(Math.random()*shuffle.length),
        paper = document.createElement('article');
    paper.innerHTML = '\
      <input type=button onclick=flip(this.parentNode) ontouchstart=flip(this.parentNode)>\
      <small>'+shuffle[pick][1]+shuffle[pick][0]+'</small>\
      <h2>'+shuffle[pick][1]+shuffle[pick][0]+'</h2>';
    paper.setAttribute('data-suit',shuffle[pick][0])
    paper.setAttribute('data-card',shuffle[pick][1])
    shuffle.splice(pick,1)
    paper.style.bottom = '300px'
    paper.style.left = x+'px'
    document.body.appendChild(paper)
    paper.addEventListener('mousedown',click)
    paper.addEventListener('touchstart',click)
    paper.addEventListener('mousemove',drag)
    paper.addEventListener('touchmove',drag)
    paper.addEventListener('mouseup',release)
    paper.addEventListener('touchend',release)
    y = y+2
    x = x+1
  }
}
function click(e){
  e.preventDefault();
  if (e.target.nodeName = 'article'){
    selected = Date.now()
    e.target.setAttribute('data-drag',selected)
    e.target.style.zIndex = index++
  } else if (e.target.nodeName = 'body'){
    selected = ''
  }
}
function drag(e){
  e.preventDefault();
  if (selected !== ''){
    var cursorX = (e.clientX || e.touches[0].clientX)-62.5,
        cursorY = (e.clientY || e.touches[0].clientY)-87.5,
        element = document.querySelectorAll('[data-drag="'+selected+'"]')[0];
    element.style.top = cursorY+'px'
    element.style.left = cursorX+'px'
  }
}
function release(e){
  element = document.querySelectorAll('[data-drag="'+selected+'"]')[0];
  selected = ''
}
function flip(paper){
  if(paper.getAttribute('data-flip') == 'flipped'){
    paper.setAttribute('data-flip','')
  } else {
    paper.setAttribute('data-flip','flipped')
  }
}
buildDeck()