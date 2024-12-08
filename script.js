const taskInput = document.getElementById("task-input");
const dateInput = document.getElementById("task-date");
const timeInput = document.getElementById("task-time");
const addTaskBtn = document.getElementById("add-task-btn");
const taskList = document.getElementById("task-list");
const filterSelect = document.querySelector("select");



filterSelect.addEventListener("change", renderTasks);

const tasks = JSON.parse(localStorage.getItem("tasks")) || [];
renderTasks();
setInterval(checkTaskDeadlines, 1000); 


addTaskBtn.addEventListener("click", () => {
    const title = taskInput.value.trim();
    const date = dateInput.value;
    const time = timeInput.value;

    if (!title || !date || !time) {
        return alert("Введите все данные для задачи (текст, дату и время).");
    }

    const deadline = new Date(`${date}T${time}`);
    if (isNaN(deadline)) {
        return alert("Введите корректную дату и время.");
    }

    const task = {
        title,
        completed: false,
        deadline: deadline.getTime(),
        overdueAlertShown: false,
    };

    tasks.push(task);
    saveTasks();
    renderTask(task);

    taskInput.value = "";
    dateInput.value = "";
    timeInput.value = "";
});


function renderTasks() {
    taskList.innerHTML = "";
    const filter = filterSelect.value;

    tasks
        .filter(task => {
            if (filter === "completed") return task.completed;
            if (filter === "incomplete") return !task.completed;
            return true; 
        })
        .forEach(renderTask);
}


function renderTask(task) {
    const taskItem = document.createElement("li");
    taskItem.className = `task-item ${task.completed ? "completed" : ""}`;
    const deadlineText = task.deadline
        ? new Date(task.deadline).toLocaleString()
        : "Без дедлайна";

    taskItem.innerHTML = `
        <span class="task-title">${task.title}</span>
        <span class="deadline">${deadlineText}</span>
        <span class="remaining-time">${getRemainingTime(task.deadline)}</span>
        <div>
            <button class="complete-btn">${task.completed ? "Отменить" : "Выполнить"}</button>
            <button class="edit-btn">Редактировать</button>
            <button class="delete-btn">Удалить</button>
        </div>
    `;

   
    updateTaskStyle(task, taskItem);

  
    taskItem.querySelector(".complete-btn").addEventListener("click", () => {
        task.completed = !task.completed;
        saveTasks();
        renderTasks();
    });

  
    taskItem.querySelector(".edit-btn").addEventListener("click", () => {
        const newTitle = prompt("Редактировать задачу:", task.title);
        if (newTitle) {
            task.title = newTitle.trim();
            saveTasks();
            renderTasks();
        }
    });

 
    taskItem.querySelector(".delete-btn").addEventListener("click", () => {
        const index = tasks.indexOf(task);
        tasks.splice(index, 1);
        saveTasks();
        renderTasks();
    });

    taskList.appendChild(taskItem);
}


function saveTasks() {
    localStorage.setItem("tasks", JSON.stringify(tasks));
}


function checkTaskDeadlines() {
    const now = Date.now();

    tasks.forEach(task => {
        if (!task.completed && task.deadline && now >= task.deadline && !task.overdueAlertShown) {
            alert(`Задача "${task.title}" просрочена!`);
            task.overdueAlertShown = true; 
        }
    });

    renderTasks(); 
}


function updateTaskStyle(task, taskItem) {
    const titleElement = taskItem.querySelector(".task-title");

    if (task.completed) {
        titleElement.style.color = "green"; 
    } else if (task.deadline && Date.now() >= task.deadline) {
        titleElement.style.color = "red";
    } else {
        titleElement.style.color = ""; 
    }
}


function getRemainingTime(deadline) {
    if (!deadline) return "Без дедлайна";
    const now = Date.now();
    const timeLeft = deadline - now;

    if (timeLeft <= 0) return "Просрочено";
    const hours = Math.floor(timeLeft / 3600000);
    const minutes = Math.floor((timeLeft % 3600000) / 60000);
    const seconds = Math.floor((timeLeft % 60000) / 1000);

    return `${hours}ч ${minutes}м ${seconds}с`;
}
