const BASE_URL = "https://cors-anywhere.herokuapp.com/https://alqanoonibackendapp-bpcsb7hheqhkg0dg.francecentral-01.azurewebsites.net";
const accessToken = localStorage.getItem('accessToken');
let fileMap = {};
async function loadFileMap() {
  try {
    const res = await fetch(`${BASE_URL}/alkanoonapi/v1/search/filters/files`, {
            method: 'GET',
            headers: {
                "Content-Type": "application/json",
                "X-Requested-With": "XMLHttpRequest",
                "Authorization": `Bearer ${accessToken}`
            }
        });
    if (!res.ok) throw new Error(`Erreur: ${res.status}`);
    const data = await res.json();
    console.log("Files from API:", data);

    // Si data est un tableau de chaînes
    fileMap = {};
    data.forEach((fileName, index) => {
      fileMap[String(index)] = fileName; // On crée un id fictif basé sur l'index
    });
    
  } catch (error) {
    console.error(error);
  }
}
loadFileMap();