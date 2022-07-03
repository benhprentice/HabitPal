// On app load, get all tasks from localStorage
window.onload = loadTasks;
var i = 0;

// On form submit add task
document.querySelector("form").addEventListener("submit", e => {
  e.preventDefault();
  addTask();
});

function loadTasks() {

  fetch('/task_load_to_js', {
    headers: {
      'Content-Type': 'application/json'
    },
    method: 'GET'
  })
    .then(function (response) {
      if (response.ok) {
        var tasks = []
        response.json()
          .then(function (response) {
            for (let i = 0; i < response.tasks.length; i++) {
              tasks.push(response.tasks[i][0]);
              const list = document.getElementById("task-ul");
              const li = document.createElement("li");
              li.innerHTML = `<div><input type="checkbox" onclick="taskComplete(this)"
                class="check" ${tasks.completed ? 'checked' : ''}>
              <input type="text" value="${tasks[i]}"
               class="task ${tasks.completed ? 'completed' : ''}" onfocus="getCurrentTask(this)" onblur="editTask(this)">
              <i class="fa fa-trash" onclick="removeTask(this)"></i></div>`;
              list.insertBefore(li, list.children[0]);
            }
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
  // localStorage.setItem("tasks", JSON.stringify([...JSON.parse(localStorage.getItem("tasks") || "[]"), { task: task.value, completed: false }]));

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
  event.nextElementSibling.classList.toggle("completed");
}

function removeTask(event) {
      var value = event.previousElementSibling.value;
      fetch('/task_deleted', {
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
                // location.reload();
              });
          }
          else {
            throw Error('Something went wrong');
          }
        })
        .catch(function (error) {
          console.log(error);
        });
  event.parentElement.parentElement.remove();
  // window.location.reload();
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


