


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

let currentPage = 1;
let itemsPerPage = 4;
let currentData = [];

let fileMap = {};

// Charger tous les fichiers une fois
/*async function loadFileMap() {
 try {
  const res = await fetch(`${BASE_URL}/alkanoonapi/v1/search/filters/files`, {
    method: 'GET',
    headers: {
      "Content-Type": "application/json",
      "X-Requested-With": "XMLHttpRequest",
      ...(accessToken ? { "Authorization": `Bearer ${accessToken}` } : {})
    }
  });

  const data = await res.json();

  // Afficher joliment le JSON dans ton add-in
  document.getElementById("wanna").textContent = JSON.stringify(data, null, 2);

} catch (error) {
  document.getElementById("wanna").textContent = `Erreur: ${error.message}`;
}
}*/



function renderQanoniCards(data, page = 1) {
  currentData = data; 
  let container = document.getElementById('response-container');
  if (!container) {
      container = document.createElement('div');
      container.id = 'response-container';
      document.querySelector('.box-1').appendChild(container);
  }
  let pagination = document.getElementById('pagination-controls');
  if (!pagination) {
      pagination = document.createElement('div');
      pagination.id = 'pagination-controls';
      document.querySelector('.box-1').appendChild(pagination);
  }
  container.innerHTML = '';
  pagination.innerHTML = '';

  // calcul de la plage d’éléments à afficher
  const start = (page - 1) * itemsPerPage;
  const end = start + itemsPerPage;
  const paginatedItems = data.slice(start, end);

  // afficher les cartes
  paginatedItems.forEach( async item => {
    
    const card = document.createElement('div');
    card.className = 'response-card';
    const link = await fetch(`${BASE_URL}/alkanoonapi/v1/browser/files/${item.file_id}`,{
        method: "GET",
        headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${accessToken}`,
            
        }
    });
    const linkData = await link.json();
    //const linkhref = `${BASE_URL}/alkanoonapi/v1/browser/files/${item.file_id}`;

    card.innerHTML = `
      <div class="title">${item.title || ''}</div>
      <div class="text">${item.text || ''}</div>
      <a href="${linkData.file_path}" target="_blank"  class="file-link">view source</a>
    `;
    container.appendChild(card);
  });

  // pagination buttons
  const totalPages = Math.ceil(data.length / itemsPerPage);
  if (totalPages > 1) {
    for (let i = 1; i <= totalPages; i++) {
      const btn = document.createElement('button');
      btn.textContent = i;
      btn.className = (i === page) ? "active-page" : "";
      btn.addEventListener("click", () => {
        currentPage = i;
        renderQanoniCards(currentData, currentPage);
      });
      pagination.appendChild(btn);
    }
  }
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
        
        localStorage.setItem("token",accessToken);
        const loginForm = document.querySelector(".login-container");
        loginForm.style.display = "none";
        const contain2 = document.querySelector(".mainContainer")
        contain2.style.display = "block";
        
        console.log('Success:', data);
    }catch(error) {
        const errorElement = document.getElementById("erreur");
        if(errorElement) {
        // Remove any existing error message
        errorElement.textContent = error.message || 'An error occurred during login.';
        errorElement.style.color = "red";
        errorElement.style.fontWeight = "bold";
        errorElement.style.textAlign = "center";
        errorElement.style.marginTop = "10px";
        errorElement.style.marginBottom = "10px";     
        console.error('Error:', error);
           }
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
    document.getElementById("output-textt").textContent = "";
    try {
      if (document.getElementById("selection").value.trim().length == 0) {
        selectedText = await getSelectedTextFromWord();
        if (!selectedText || selectedText.trim().length === 0) {
        throw new Error("No text is selected yet...");
      }
      document.getElementById("selection").value = `${selectedText}`;
    }
    else{
        selectedText = document.getElementById("selection").value.trim();
    }
      const result = await searchWithSelectedText(selectedText);
      //call the API
       // Si la réponse contient un tableau sous un autre nom, adapte ici
      const hits = result.hits || result; 
     // await loadFileMap();
    // Affiche uniquement titre + texte
      currentPage = 1;
      renderQanoniCards(hits, 1);
      //Show result
     // document.querySelector("#output-text").innerHTML = `<pre>${JSON.stringify(result,null,2)}</pre>`;
    } catch (e) {
      document.getElementById("output-textt").textContent = `${e}`;
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
    localStorage.removeItem("token")
    accessToken = null;
    startApp();
}

Office.onReady((info) => {
    

   
    if (info.host === Office.HostType.Word) {
        accessToken = localStorage.getItem("token");
        startApp();
        // Always run when the task pane is opened from context menu
    }
    document.getElementById("submitButton").addEventListener("click",displayTexteSelected);
    document.getElementById("logout").addEventListener("click",logout);
    
});

