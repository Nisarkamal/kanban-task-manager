// ---------- AUTH ----------
let isLogin = true;
const authBox = document.getElementById("authBox");
const formTitle = document.getElementById("formTitle");
const toggleText = document.getElementById("toggleText");
const toggleLink = document.getElementById("toggleLink");
const authBtn = document.getElementById("authBtn");
const dashboard = document.getElementById("dashboard");
const welcomeUser = document.getElementById("welcomeUser");

toggleLink.onclick = ()=>{
  isLogin = !isLogin;
  if(isLogin){
    formTitle.textContent="Login";
    authBtn.textContent="Login";
    toggleText.innerHTML=`Don't have an account? <a id="toggleLink">Sign Up</a>`;
  }else{
    formTitle.textContent="Sign Up";
    authBtn.textContent="Sign Up";
    toggleText.innerHTML=`Already have an account? <a id="toggleLink">Login</a>`;
  }
};

authBtn.onclick = ()=>{
  const username=document.getElementById("username").value.trim();
  const password=document.getElementById("password").value.trim();
  if(!username||!password){alert("Please fill all fields");return;}
  let users=JSON.parse(localStorage.getItem("users"))||{};
  if(!isLogin){
    if(users[username]){alert("User already exists!");return;}
    users[username]={password,tasks:[]};
    localStorage.setItem("users",JSON.stringify(users));
    alert("Signup successful!");
    isLogin=true;
    formTitle.textContent="Login";
    authBtn.textContent="Login";
  }else{
    if(!users[username]||users[username].password!==password){
      alert("Invalid credentials");return;
    }
    localStorage.setItem("currentUser",username);
    showDashboard(username);
  }
};

document.getElementById("logoutBtn").onclick=()=>{
  localStorage.removeItem("currentUser");
  dashboard.style.display="none";
  authBox.style.display="block";
};

// ---------- DASHBOARD / KANBAN ----------
const taskInput=document.getElementById("taskInput");
const addTaskBtn=document.getElementById("addTaskBtn");
const todoCol=document.getElementById("todo");
const progCol=document.getElementById("progress");
const doneCol=document.getElementById("done");

addTaskBtn.onclick=()=>addTask();
taskInput.addEventListener("keypress",e=>{if(e.key==="Enter")addTask();});

function addTask(){
  const text=taskInput.value.trim();
  if(!text){alert("Enter a task");return;}
  const task=createTaskElement(text,"todo");
  todoCol.appendChild(task);
  taskInput.value="";
  saveTasks();
  updateStats();
}

function createTaskElement(text,status){
  const div=document.createElement("div");
  div.className="task";
  div.textContent=text;
  div.draggable=true;
  div.dataset.status=status;
  div.ondragstart=(e)=>drag(e);
  div.ondblclick=()=>{div.remove();saveTasks();updateStats();};
  return div;
}

function allowDrop(ev){ev.preventDefault();}
function drag(ev){ev.dataTransfer.setData("text",ev.target.textContent);}
function drop(ev){
  ev.preventDefault();
  const text=ev.dataTransfer.getData("text");
  const targetCol=ev.currentTarget.id;
  const users=JSON.parse(localStorage.getItem("users"));
  const username=localStorage.getItem("currentUser");
  const user=users[username];
  const existing=user.tasks.find(t=>t.text===text);
  if(existing) existing.status=targetCol;
  else user.tasks.push({text, status:targetCol});
  saveTasks();
  showTasks(username);
}

function showDashboard(username){
  authBox.style.display="none";
  dashboard.style.display="block";
  welcomeUser.textContent=`Welcome, ${username}!`;
  showTasks(username);
}

function saveTasks(){
  const username=localStorage.getItem("currentUser");
  const users=JSON.parse(localStorage.getItem("users"));
  const allTasks=[];
  document.querySelectorAll(".task").forEach(t=>{
    allTasks.push({text:t.textContent,status:t.parentElement.id});
  });
  users[username].tasks=allTasks;
  localStorage.setItem("users",JSON.stringify(users));
  updateStats();
}

function showTasks(username){
  [todoCol,progCol,doneCol].forEach(col=>col.querySelectorAll(".task").forEach(t=>t.remove()));
  const users=JSON.parse(localStorage.getItem("users"));
  const tasks=users[username]?.tasks||[];
  tasks.forEach(t=>{
    const task=createTaskElement(t.text,t.status);
    document.getElementById(t.status).appendChild(task);
  });
  updateStats();
}

function updateStats(){
  const total=document.querySelectorAll(".task").length;
  const done=document.querySelectorAll("#done .task").length;
  document.getElementById("todoCount").textContent=document.querySelectorAll("#todo .task").length;
  document.getElementById("progressCount").textContent=document.querySelectorAll("#progress .task").length;
  document.getElementById("doneCount").textContent=done;
  document.getElementById("totalTasks").textContent=total;
  const percent=total?Math.round((done/total)*100):0;
  document.getElementById("percent").textContent=percent+"%";
  document.getElementById("progressFill").style.width=percent+"%";
}

window.onload=()=>{
  const currentUser=localStorage.getItem("currentUser");
  if(currentUser)showDashboard(currentUser);
};
