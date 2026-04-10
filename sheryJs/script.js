const board = document.querySelector('.board')

const blockHeight = 50;
const blockWidth = 50;

let intervalId = null
const cols = Math.floor(board.clientWidth / blockWidth)
const rows = Math.floor(board.clientHeight / blockHeight)
let food = {x:Math.floor(Math.random()*rows),y:Math.floor(Math.random()*cols)}

const blocks = []
let direction = 'down'
const snake = [
    {
        x: 1,
        y:2
    }
]

for (let row = 0; row < rows; row++){
    for (let col = 0; col < cols; col++){
        const block = document.createElement('div')
        board.appendChild(block)
        block.classList.add('block')
        block.innerText = `${row}-${col}`
        blocks[`${row}-${col}`] = block
    }
}

function render() {
    let head = null
    if (direction === 'left') {
        head = { x: snake[0].x, y: snake[0].y - 1 }
    } else if (direction === 'right') {
        head = { x: snake[0].x, y: snake[0].y + 1 }
    } else if (direction === 'up') {
        head = { x: snake[0].x - 1, y: snake[0].y }
    } else if (direction === 'down') {
        head = { x: snake[0].x + 1, y: snake[0].y }
    }
    snake.forEach(part => {
        blocks[`${part.x}-${part.y}`].classList.remove('fill')
    })
    if (head.x < 0 || head.x >= rows || head.y < 0 || head.y >= cols) {
        alert('Game over!')
        clearInterval(intervalId)
    }
    snake.unshift(head)
    snake.pop()
    snake.forEach(part => {
        blocks[`${part.x}-${part.y}`].classList.add('fill')
    })
}

intervalId = setInterval(() => {
    
    // render()
}, 400);


addEventListener('keydown', (e) => {
    if (e.key === 'ArrowUp') {
        direction = 'up'
    } else if (e.key === 'ArrowDown') {
        direction = 'down'
    } else if (e.key === 'ArrowRight') {
        direction = 'right'
    } else if (e.key === 'ArrowLeft') {
        direction = 'left'
    }
})

