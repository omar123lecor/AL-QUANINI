
/**
 * Config
 * (Tu utilises cors-anywhere comme dans ton code original.
 *  En prod, remplace PROXY par "" et configure CORS côté backend.)
 */
const PROXY = "https://cors-anywhere.herokuapp.com/";
const API_BASE = "https://alqanoonibackendapp-bpcsb7hheqhkg0dg.francecentral-01.azurewebsites.net";

/* --------------------------- Helpers UI --------------------------- */

function showLogin() {
    const chatSection = document.getElementById("chat-section");
    const loginSection = document.getElementById("login-section");

    if (chatSection) chatSection.style.display = "none";
    if (loginSection) loginSection.style.display = "block";
}

function showChat() {
    const loginSection = document.getElementById("login-section");
    const chatSection = document.getElementById("chat-section");

    if (loginSection) loginSection.style.display = "none";
    if (chatSection) chatSection.style.display = "flex";
}

function appendMessage(text, type = "assistant") {
    const messagesContainer = document.getElementById("messages");
    const div = document.createElement("div");
    div.className = `message ${type === "user" ? "user-message" : "assistant-message"}`;
    div.textContent = text;
    messagesContainer.appendChild(div);
    messagesContainer.scrollTop = messagesContainer.scrollHeight;
}

function appendFiles(files = []) {
    if (!files.length) return;
    const messagesContainer = document.getElementById("messages");
    const filesDiv = document.createElement("div");
    filesDiv.className = "message assistant-message";
    filesDiv.innerHTML = files.map(f => `📄 ${f.title}`).join("<br>");
    messagesContainer.appendChild(filesDiv);
    messagesContainer.scrollTop = messagesContainer.scrollHeight;
}

/* --------------------------- API calls --------------------------- */

async function createChat(token) {
    try {
        const response = await fetch(`${PROXY}${API_BASE}/alkanoonapi/v1/assistant/chats`, {
            method: "POST",
            headers: {
                "Authorization": `Bearer ${token}`,
                "Content-Type": "application/json"
            }
        });

        if (response.status === 401) {
            localStorage.removeItem("token");
            showLogin();
            throw new Error("Unauthorized, redirecting to login");
        }

        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data = await response.json();
        return data.chat_id;
    } catch (error) {
        console.error("Error creating chat:", error);
        throw error;
    }
}

async function sendMessage(chatId, message, token) {
    try {
        const response = await fetch(`${PROXY}${API_BASE}/alkanoonapi/v1/assistant/${chatId}/messages`, {
            method: "POST",
            headers: {
                "Authorization": `Bearer ${token}`,
                "Content-Type": "application/json"
            },
            body: JSON.stringify({ message })
        });

        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data = await response.json();
        return { text: data.response, files: data.files };
    } catch (error) {
        console.error("Error sending message:", error);
        throw error;
    }
}

/* --------------------------- Chat bootstrapping --------------------------- */

async function initChat() {
    const token = localStorage.getItem("token");
    if (!token) {
        showLogin();
        return;
    }

    let chatId;
    try {
        chatId = await createChat(token);

        const sendButton = document.getElementById("send-message");
        const messageInput = document.getElementById("message-input");
        const loading = document.getElementById("loading");

        const handleSendMessage = async () => {
            const message = messageInput.value.trim();
            if (!message) return;

            appendMessage(message, "user");
            messageInput.value = "";
            loading.style.display = "block";

            try {
                const result = await sendMessage(chatId, message, token);
                appendMessage(result.text || "");        // Assistant text
                if (result.files && result.files.length > 0) {
                    appendFiles(result.files);           // Any files returned
                }
            } catch (e) {
                console.error("Error sending message:", e);
                appendMessage("Désolé, une erreur s'est produite.");
            } finally {
                loading.style.display = "none";
            }
        };

        // Évite le double binding si initChat est rappelé
        sendButton.replaceWith(sendButton.cloneNode(true));
        const newSendButton = document.getElementById("send-message");
        newSendButton.addEventListener("click", handleSendMessage);

        messageInput.addEventListener("keypress", (e) => {
            if (e.key === "Enter") handleSendMessage();
        });

    } catch (error) {
        console.error("Error initializing chat:", error);
        const resultEl = document.getElementById("result");
        if (resultEl) {
            resultEl.textContent = "Erreur d'initialisation du chat.";
        }    }
}

/* --------------------------- Login form --------------------------- */

document.getElementById("login-form").addEventListener("submit", async function (e) {
    e.preventDefault();
    const emailInput = document.getElementById("email");
    const passwordInput = document.getElementById("password");

    const username = emailInput ? emailInput.value : "";
    const password = passwordInput ? passwordInput.value : "";

    const formData = new URLSearchParams();
    formData.append("grant_type", "password");
    formData.append("username", username);
    formData.append("password", password);

    try {
        const response = await fetch(`${PROXY}${API_BASE}/login`, {
            method: "POST",
            headers: { "Content-Type": "application/x-www-form-urlencoded" },
            body: formData.toString()
        });

        const text = await response.text();
        let data = {};
        try {
            data = JSON.parse(text);
        } catch {
            console.warn("Réponse vide ou non JSON");
        }

        if (response.ok) {
            localStorage.setItem("token", data.access_token);
            showChat();
            initChat();
        } else {
            const resultEl = document.getElementById("result");
            if (resultEl) resultEl.textContent =
                `Erreur ${response.status} : ` + (data.detail || "Erreur inconnue");
                    }
    } catch (err) {
        console.error("Erreur de requête :", err);
        const resultEl = document.getElementById("result"); 
        if (resultEl) resultEl.textContent = "Erreur de connexion à l'API.";

    }
});

/* --------------------------- Office.js ready --------------------------- */

if (window.Office && typeof Office.onReady === "function") {
    Office.onReady(() => {
        const token = localStorage.getItem("token");
        if (token) {
            showChat();
            initChat();
        }
    });
} else {
    // Fallback si on ouvre la page hors Office (utile en dev/local)
    document.addEventListener("DOMContentLoaded", () => {
        const token = localStorage.getItem("token");
        if (token) {
            showChat();
            initChat();
        }
    });
}
