let username;
let keepConectionKey;
let previousMessages = [];

const requestMessagesKey = setInterval(requestMessages, 3000);
let lastMessage;

let msgto = "Todos";
let isPrivate = false;

// Inicio da entrada e manuntenção da conexao com o chat
function enterChat(){
    username = document.querySelector(".username").value;
    const promise = axios.post('https://mock-api.bootcamp.respondeai.com.br/api/v3/uol/participants', {name: username});
    promise.then( function (response){
        keepConectionKey = setInterval(keepConection, 1000);
        document.querySelector(".login").classList.add("hidden")
    });
    promise.catch( function(error){
        alert("Nome Invalido ou já existente")
         
    });
}

function keepConection(){
    const promise = axios.post('https://mock-api.bootcamp.respondeai.com.br/api/v3/uol/status', {name: username})
    promise.catch(function(){
        alert("Conexão perdida");
        window.location.reload();
    })
}
// Fim da entrada e manuntenção da conexao com o chat
// Inicio do Requerimento e renderização de mensagens
function requestMessages() {
    const promise = axios.get("https://mock-api.bootcamp.respondeai.com.br/api/v3/uol/messages")
    promise.then(formatMessages);
}

function formatMessages(response) {
    let messages = [];
    for (let i = 0; i < response.data.length; i++) {
        switch (response.data[i].type) {
            case "status":
                messages.push(`<div class="message greyBg">
                    <p><time>${response.data[i].time}</time>  <strong>${response.data[i].from}</strong> ${response.data[i].text} </p>
                </div>`);
                break;
            case "message":
                messages.push(`<div class="message whiteBg">
                    <p><time>${response.data[i].time}</time>  <strong>${response.data[i].from}</strong> para <strong>${response.data[i].to}</strong>:  ${response.data[i].text} </p>
                </div>`);
                break;        
            case "private_message":
                if (response.data[i].to === username || response.data[i].from === username) {
                    messages.push(`<div class="message pinkBg">
                    <p><time>${response.data[i].time}</time>  <strong>${response.data[i].from}</strong> reservadamente para <strong>${response.data[i].to}</strong>:  ${response.data[i].text} </p>
                </div>`);
                }
                break;        
            default:
                console.warn("resposta inesperada do servidor! Type= " + response.data[i].type);
                break;
        }
    }
    if (messages[messages.length-1] != previousMessages[previousMessages.length-1]) {
        renderMessages(messages);
        previousMessages = messages.slice();
    }
}

function renderMessages(messages) {
        const messageBox = document.querySelector("main");
        messageBox.innerHTML = "";
        for (let i = 0; i < messages.length; i++) {
            messageBox.innerHTML += messages[i];    
        }
        setTimeout(function () { // Scroll para o ultimo elemento
            lastMessage = messageBox.lastElementChild;
            lastMessage.scrollIntoView();
        }, 200);
}
// Fim do Requerimento e renderização de mensagens
// Inicio do envio de mensagens
function sendMessage(){
    if (document.querySelector("input").value !== "") {
        const message = {
            from: username,
            to: "Todos",
            text: document.querySelector("input").value,
            type: "message"
        } 
        document.querySelector("input").value = "";
        const promise = axios.post("https://mock-api.bootcamp.respondeai.com.br/api/v3/uol/messages", message)
        promise.then(requestMessages);
    }
}
// Barra lateral
function toggleAside() {
    document.querySelector('aside').classList.toggle('hidden')
    getParticipants()
}
function getParticipants () {
    axios.get("https://mock-api.bootcamp.respondeai.com.br/api/v3/uol/participants")
    .then((response) => renderParticipants(response))
    .catch((error) => console.log(error)) 
}
function renderParticipants(response) {
    const participantBox = document.querySelectorAll(".itens-box")[1]
    const data = response.data.map((participant) => participant.name)
    const selectedIndex = data.indexOf(msgto);
    participantBox.innerHTML = `<h5>Escolha um contato <br>
    para enviar mensagem:</h5>
    <div class="aside-item ${selectedIndex < 0 ? "selected":""}">
        <ion-icon name="people" ></ion-icon>
        <p>Todos</p>
        <ion-icon class="checkmark" name="checkmark"></ion-icon>
    </div>`
    data.forEach((name, i) => {
        participantBox.innerHTML += `<div class="aside-item ${i + 1 === selectedIndex ? "selected":""}">
            <ion-icon name="person-circle"></ion-icon>
            <p>${name}</p>
            <ion-icon class="checkmark" name="checkmark"></ion-icon>
        </div>`
    });

}