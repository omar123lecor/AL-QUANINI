/*function walkDog(){
    return new Promise((resolve,reject)=>{
        setTimeout(()=>{
        const waldog = true;
        if(waldog){
            resolve("Walking the dog");
        }
        else{
            reject("Dog is not ready to walk");
        }
        })
        
    })
}
function cleankitchen(){
    return new Promise((resolve,reject)=>{
        setTimeout(()=>{
            const kitchenClean = true;
        if(kitchenClean){
            resolve("Kitchen is clean");
        }
        else{
            reject("Kitchen is dirty");
        }
        })
})
}
function takeOutTrash(){
    return new Promise((resolve,reject)=>{
        setTimeout(()=> {
        const trashTakenOut = false;
        if(trashTakenOut){  
            resolve("Trash has been taken out");
        }   
        else{
            reject("Trash is still there");
        }
    },500)
    })
}

async function doChores() {
try {
    const trash = await takeOutTrash();
        console.log(trash);
    const dog = await walkDog();
    console.log(dog);
    const kitchen = await cleankitchen();
    console.log(kitchen);
    } catch (error) {
        console.error(error);
    }
}

doChores()*/


//const jsonSting = JSON.stringify(obj)


const BASE_URL = "https://cors-anywhere.herokuapp.com/https://alqanoonibackendapp-bpcsb7hheqhkg0dg.francecentral-01.azurewebsites.net";
/*
fetch(`${BASE_URL}/login`, {
    method: 'POST',
    headers: {
        'Content-Type': 'application/x-www-form-urlencoded'
    },
    body: new URLSearchParams(payload)
})
.then(response => {
    if (!response.ok) {
        throw new Error(`HTTP error! status
            Could not fetch ressource: ${response.status}`);
    }
    return response.json();
}) 
.then(data => console.log('Success:', data))
.catch(error => console.error('Error:', error));
*/
let connected = false;
let accessToken = null;

async function fetchData(event) {
    event.preventDefault(); // Prevent the default form submission behavior
    try {
        const payload = {
            username: document.getElementById("username").value,
            password: document.getElementById("password").value
        }
        const response = await fetch(`${BASE_URL}/login`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded'
            },
            body: new URLSearchParams(payload)
        });
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        const data = await response.json();
        connected = true;
        accessToken = data.access_token;
        if (connected){
        const loginForm = document.querySelector(".login-container");
        loginForm.style.display = "none";
        }
        console.log('Success:', data);
    }catch(error) {
        const errorElement = document.getElementById("erreur");
        errorElement.textContent = error.message || 'An error occurred during login.';
        errorElement.style.color = "red";
        errorElement.style.fontWeight = "bold";
        errorElement.style.textAlign = "center";
        errorElement.style.marginTop = "10px";
        errorElement.style.marginBottom = "10px";     
        console.error('Error:', error);
    }
}
document.getElementById("login-form").addEventListener("submit",fetchData);
