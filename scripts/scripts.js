// Inicio da entrada e manuntenção da conexao com o chat
const username = "Kevin ( ͡❛ ᴗ ͡❛)"; //prompt("Insira seu nome de usuario:");
let keepConectionKey;
enterChat();

function enterChat(){
    const promise = axios.post('https://mock-api.bootcamp.respondeai.com.br/api/v3/uol/participants', {name: username});
    promise.then( function (response){
        keepConectionKey = setInterval(keepConection, 1000);
        console.log(response.statusText)
    })
    promise.catch( function(){
        alert("Nome Invalido ou já existente")
        username = prompt("Insira seu nome de usuario:");
    })
}

function keepConection(){
    axios.post('https://mock-api.bootcamp.respondeai.com.br/api/v3/uol/status', {name: username})
}

// Inicio do Requerimento e renderização de mensagens
requestMessages();
const requestMessagesKey = setInterval(requestMessages, 3000);

function requestMessages() {
    const promise = axios.get("https://mock-api.bootcamp.respondeai.com.br/api/v3/uol/messages")
    promise.then(formatMessages);
}

function formatMessages(response) {
    let messages = [];
    for (let i = response.data.length - 30; i < response.data.length; i++) {
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
                messages.push(`<div class="message pinkBg">
                <p><time>${response.data[i].time}</time>  <strong>${response.data[i].from}</strong> reservadamente para <strong>${response.data[i].to}</strong>:  ${response.data[i].text} </p>
            </div>`);
                break;        
            default:
                console.warn("O servidor deu ruim! Type= " + response.data[i].type);
                break;
        }
        renderMessages(messages); 
    }
}

function renderMessages(messages) {
    const messageBox = document.querySelector("main");
    messageBox.innerHTML = "";
    for (let i = 0; i < messages.length; i++) {
        messageBox.innerHTML += messages[i];    
    }
    const lastMessage = messageBox.lastElementChild;
    lastMessage.scrollIntoView();
}

function sendMessage(){
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