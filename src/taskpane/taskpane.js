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


const originalLoginDisplay = getComputedStyle(document.querySelector(".login-container")).display;
const originalMainDisplay = getComputedStyle(document.querySelector(".mainContainer")).display;
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

function renderQanoniCards(data) {
  const container = document.getElementById('response-container');
  container.innerHTML = ''; // Vide le container

  data.forEach(item => {
    const card = document.createElement('div');
    card.className = 'response-card';
    card.innerHTML = `
      <div class="title">${item.title || ''}</div>
      <div class="text">${item.text || ''}</div>
    `;
    container.appendChild(card);
  });
}

let accessToken = null;

async function fetchData(event) {
    event.preventDefault(); // Prevent the default form submission behavior
    
    try {
        const payload = { 
            username: document.getElementById("username").value,
            password: document.getElementById("password").value
        };
        
        const response = await fetch(`${BASE_URL}/login`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded'
            },
            body: new URLSearchParams(payload),
        });
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        const data = await response.json();
        accessToken = data.access_token;
        
        localStorage.setItem("accessToken",accessToken);
        const loginForm = document.querySelector(".login-container");
        loginForm.style.display = "none";
        const contain2 = document.querySelector(".mainContainer")
        contain2.style.display = "block";
        
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




/*const firstContainer = document.querySelector(".login-container");
firstContainer.style.display = "none"
*/
function getSelectedTextFromWord() {
    return new Promise((resolve, reject) => {
      Office.context.document.getSelectedDataAsync(Office.CoercionType.Text, function (asyncResult) {
        if (asyncResult.status === Office.AsyncResultStatus.Succeeded) {
          resolve(asyncResult.value);
        } else {
          reject(asyncResult.error.message);
        }
      });
    });
  }


  async function searchWithSelectedText(selectedText) {
    if(!accessToken){
        throw new Error("Not authenticated. Please log in first.");
    }

    const payload = {
        query: selectedText,
        filters: {},           
        sort: "score"          
    };
    
    const response = await fetch(`${BASE_URL}/alkanoonapi/v1/search/search`,{
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${accessToken}`
        },
        body: JSON.stringify(payload)
    });

    if(!response.ok){
        throw new Error(`Search API error: ${response.status}`);
    }

    return response.json();

  }



  async function displayTexteSelected() {
    let selectedText = "";
    try {
      selectedText = await getSelectedTextFromWord();
      if (!selectedText || selectedText.trim().length === 0) {
      throw new Error("No text is selected yet...");
    }
      document.getElementById("selection").innerHTML = `🔍<strong>${selectedText}</strong>`;
      //call the API
      const result = await searchWithSelectedText(selectedText);
       // Si la réponse contient un tableau sous un autre nom, adapte ici
      const hits = result.hits || result; 

    // Affiche uniquement titre + texte
      renderQanoniCards(hits);
      //Show result
     // document.querySelector("#output-text").innerHTML = `<pre>${JSON.stringify(result,null,2)}</pre>`;
    } catch (e) {
      document.getElementById("output-text").textContent = `${e}`;
      return;
    }
  }



function startApp() {
    
    const loginForm = document.querySelector(".login-container");
    const contain2 = document.querySelector(".mainContainer");

    if (accessToken) {
        loginForm.style.display = "none";
        contain2.style.display = "block";
        displayTexteSelected();
    } else {
        contain2.style.display = "none";
        loginForm.style.display = "flex";

        document.getElementById("login-form").addEventListener("submit", fetchData);
    }
}



function logout() {
    localStorage.removeItem("accessToken")
    accessToken = null;
    startApp();
}
    


Office.onReady((info) => {
    

   
    if (info.host === Office.HostType.Word) {
        accessToken = localStorage.getItem("accessToken");
        startApp();
        // Always run when the task pane is opened from context menu
       
    }
    document.getElementById("submitButton").addEventListener("click",displayTexteSelected);
    document.getElementById("logout").addEventListener("click",logout);

});
