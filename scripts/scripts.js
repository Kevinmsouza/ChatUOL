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
        keepConectionKey = setInterval(keepConection, 3000);
        document.querySelector(".login").classList.add("hidden")
    });
    promise.catch( function(error){
        alert("Nome Invalido ou já existente")
         
    });
    setInterval(getParticipants, 10000);
    document.addEventListener("keyup", sendWithEnter);
    attFooter();
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
                if (response.data[i].to === username || response.data[i].from === username || response.data[i].to === "Todos") {
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
            to: msgto,
            text: document.querySelector("input").value,
            type: `${isPrivate ? "private_message": "message"}`
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
    console.log(selectedIndex)
    participantBox.innerHTML = `<h5>Escolha um contato <br>
    para enviar mensagem:</h5>
    <div class="aside-item ${selectedIndex < 0 ? "selected":""}" onclick="changeMsgto(this)">
        <ion-icon name="people" ></ion-icon>
        <p>Todos</p>
        <ion-icon class="checkmark" name="checkmark"></ion-icon>
    </div>`
    data.forEach((name, i) => {
        participantBox.innerHTML += `<div class="aside-item ${i === selectedIndex ? "selected":""}" onclick="changeMsgto(this)">
            <ion-icon name="person-circle"></ion-icon>
            <p>${name}</p>
            <ion-icon class="checkmark" name="checkmark"></ion-icon>
        </div>`
    });
}
function changePrivacy(element) {
    isPrivate = element.children[1].innerText === "Público" ? false : true ;
    const privacyBox = document.querySelectorAll(".itens-box")[0]
    privacyBox.innerHTML= `<h5>Escolha a visibilidade:</h5>
    <div class="aside-item ${isPrivate? "" : "selected"}" onclick="changePrivacy(this)" >
        <ion-icon name="lock-open" ></ion-icon>
        <p>Público</p>
        <ion-icon class="checkmark" name="checkmark"></ion-icon>
    </div>
    <div class="aside-item ${isPrivate? "selected" : ""}" onclick="changePrivacy(this)">
        <ion-icon name="lock-closed" ></ion-icon>
        <p>Reservadamente</p>
        <ion-icon class="checkmark" name="checkmark"></ion-icon>
    </div>`
    attFooter()
}
function changeMsgto(element) {
    msgto = element.children[1].innerText;
    getParticipants();
    attFooter()
}
function sendWithEnter(event){
    if(event.key === "Enter"){
        sendMessage()
    }
}
function attFooter(){
    document.querySelector("footer p").innerHTML = `<p>Enviando para ${msgto} ${isPrivate? "(reservadamente)" : ""}</p>`
    

}