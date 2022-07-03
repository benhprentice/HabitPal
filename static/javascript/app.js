//Need to fix saved tasks formating. List elemetes are not deleting after deleting tasks. Js and local storage fixed already
// On app load, get all tasks from localStorage
window.onload = loadTasks;
var i = 0;

// On form submit add task
document.querySelector("form").addEventListener("submit", e => {
  e.preventDefault();
  addTask();
});

function loadTasks() {
  // check if localStorage has any tasks
  if (localStorage.getItem("tasks") == null) return;

  // Get the tasks from localStorage and convert it to an array
  let tasks = Array.from(JSON.parse(localStorage.getItem("tasks")));

  // Loop through the tasks and add them to the list
  tasks.forEach(task => {
    const list = document.getElementById("task-ul");
    const li = document.createElement("li");
    li.innerHTML = `<div><input type="checkbox" onclick="taskComplete(this)"
     class="check" ${task.completed ? 'checked' : ''}>
    <input type="text" value="${task.task}"
     class="task ${task.completed ? 'completed' : ''}" onfocus="getCurrentTask(this)" onblur="editTask(this)">
    <i class="fa fa-trash" onclick="removeTask(this)"></i></div>`;
    list.insertBefore(li, list.children[0]);
  });
}

function addTask() {
  const task = document.querySelector("form input");
  const list = document.getElementById("task-ul");
  // return if task is empty
  if (task.value === "") {
    alert("Please enter a task!");
    return false;
  }
  // check repeat task
  if (document.querySelector(`input[value="${task.value}"]`)) {
    alert("We don't need to do that twice");
    return false;
  }

  // send task value to Flask
  var value = task.value;

  fetch('/task_added', {
    headers: {
      'Content-Type': 'application/json'
    },
    method: 'POST',
    body: JSON.stringify({
      'task': value,
    })
  })
    .then(function (response) {

      if (response.ok) {
        response.json()
          .then(function (response) {
            console.log(response);
          });
      }
      else {
        throw Error('Something went wrong');
      }
    })
    .catch(function (error) {
      console.log(error);
    });

  // add task to local storage
  localStorage.setItem("tasks", JSON.stringify([...JSON.parse(localStorage.getItem("tasks") || "[]"), { task: task.value, completed: false }]));

  // create list item, add innerHTML and append to ul
  const li = document.createElement("li");
  li.innerHTML = `<div><input type="checkbox" onclick="taskComplete(this)" class="check">
  <input type="text" value="${task.value}" class="task" onfocus="getCurrentTask(this)" onblur="editTask(this)">
  <i class="fa fa-trash" onclick="removeTask(this)"></i></div>`;
  list.insertBefore(li, list.children[0]);
  // clear input
  task.value = "";
}


function taskComplete(event) {
  let tasks = Array.from(JSON.parse(localStorage.getItem("tasks")));
  tasks.forEach(task => {
    if (task.task === event.nextElementSibling.value) {
      task.completed = !task.completed;

      var value = event.nextElementSibling.value;
      fetch('/task_completed', {
        headers: {
          'Content-Type': 'application/json'
        },
        method: 'POST',
        body: JSON.stringify({
          'task': value,
        })
      })
        .then(function (response) {

          if (response.ok) {
            response.json()
              .then(function (response) {
                console.log(response);
                location.reload();
              });
          }
          else {
            throw Error('Something went wrong');
          }
        })
        .catch(function (error) {
          console.log(error);
        });
    }
  });
  localStorage.setItem("tasks", JSON.stringify(tasks));
  event.nextElementSibling.classList.toggle("completed");

 
}


function removeTask(event) {
  let tasks = Array.from(JSON.parse(localStorage.getItem("tasks")));
  //const li = document.getElementById("li");
  window.location.reload();
  tasks.forEach(task => {
    if (task.task === event.parentNode.children[1].value) {
      // delete task
      tasks.splice(tasks.indexOf(task), 1);
      var num = tasks.indexOf(task);
    }
  });

  //list.removeChild(list.children[0]);
  localStorage.setItem("tasks", JSON.stringify(tasks));

  event.parentElement.remove();
  //event.parentElement.parentNode.removeChild(event.parentNode);
}

// store current task to track changes
var currentTask = null;

// get current task
function getCurrentTask(event) {
  currentTask = event.value;
}

// edit the task and update local storage
function editTask(event) {
  let tasks = Array.from(JSON.parse(localStorage.getItem("tasks")));
  // check if task is empty
  if (event.value === "") {
    alert("You don't need a list to do nothing!");
    event.value = currentTask;
    return;
  }
  // task already exist
  tasks.forEach(task => {
    if (task.task === event.value) {
      alert("Don't worry, you already got this one written down");
      event.value = currentTask;
      return;
    }
  });
  // update task
  tasks.forEach(task => {
    if (task.task === currentTask) {
      task.task = event.value;
    }
  });
  // update local storage
  localStorage.setItem("tasks", JSON.stringify(tasks));
}


