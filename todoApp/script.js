const taskInput = document.getElementById('task-input')
const addBtn = document.getElementById('add-btn')
const taskList = document.getElementById('task-list')

document.addEventListener('DOMContentLoaded', renderTask)
const tasks = JSON.parse(localStorage.getItem('tasks')) || []

taskInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') {
      addBtn.click()
  }
})

addBtn.addEventListener('click', () => {
    const taskText = taskInput.value.trim()
    if (!taskText) return
    const taskObj = {
        id: Date.now(),
        text: taskText,
        completed : false
    }
    tasks.push(taskObj)
    saveToLs()
    renderTask()
    taskInput.value = ""
})

function renderTask() {
    taskList.innerHTML = ""
    tasks.forEach((task) => {
        const li = document.createElement('li')
        li.innerHTML = `
         ${task.text}
         <button id='delet-btn' onclick="deleteHanlder(${task.id})">Delete</button>
         <button id='edit-btn' onclick="editHanlder(${task.id})">Edit</button>
        `
        taskList.appendChild(li)
    });
}

function deleteHanlder(id) {
        const index = tasks.findIndex(task => task.id === id)
        if (index > -1) {
            tasks.splice(index, 1)  
        }
        saveToLs()
        renderTask()
    
}


function saveToLs() {
    localStorage.setItem('tasks',JSON.stringify(tasks))
}