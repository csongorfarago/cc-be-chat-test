const inquirer = require('inquirer');
const WebSocket = require('ws');  
const ws = new WebSocket('ws://localhost:8080'); 

ws.on('open', function open() {
    console.log('server is connected');
});

ws.on('message', function incoming(message) {
    var code =  message.substring(0, 2);
    var data =  JSON.parse(message.substring(2));
    
    //Code 02 - chat message
    if(code == "02"){
        console.log('[%s]: %s', data["name"], data["message"]);    
    }  
    
    //Code 03 - receiving chat history
    if(code == "03"){
        data.forEach(function (message){
            console.log('[%s]: %s', message["name"], message["message"]); 
        });  
        
        //History recieved asking for client's name
        run();  
    }  
    
    //Code 04 - receiving answer for /popular
    if(code == "04"){
        console.log(data['word']);
    }
 
    //Code 05 - receiving answer for /stats
    if(code == "05"){
        console.log(formatSeconds(data['time']));
    } 
    
});

ws.on('close', function incoming(data) {
  console.log('server is disconnected');
});



const run = async () => {
  const { name } = await askName();
  
    var data = {};
    data['name'] = name; 
    send("01", data);

  while (true) {
    const answers = await askChat();
    const { message } = answers;
  
    if(message[0] == "/") {
        switch(message.split(" ")[0]){
            case "/popular":
                send("03", "");
                break;
            case "/stats":
                var data = {};
                data['name'] = message.replace("/stats ","");   
                send("04", data);
                break;
            default:
                console.log("Not supported commad");
        }
    }else{
        var data = {};
        data['message'] = message; 
        send("02", data);    
    }    
  }
};

const askChat = () => {
  const questions = [
    {
      name: "message",
      type: "input",
      message: "Enter chat message:"
    }
  ];
  return inquirer.prompt(questions);
};

const askName = () => {
  const questions = [
    {
      name: "name",
      type: "input",
      message: "Enter your name:"
    }
  ];
  return inquirer.prompt(questions);
};

//helper functions
function send(code, data){
    var s = code;
    s+= JSON.stringify(data);
    ws.send(s);
}

function formatSeconds(seconds){
    var sec_num = parseInt(seconds/1000);
      
    var day = Math.floor(sec_num / 86400);  
    if(day < 10){ day = "0"+day; }
    day += "d";
    
    var hours   = Math.floor(sec_num / 3600) % 24;
    if(hours < 10){ hours = "0"+hours; }
    hours += "h";
    
    var minutes = Math.floor(sec_num / 60) % 60;
    if(minutes < 10){ minutes = "0"+minutes; }
    minutes += "m";
    
    var seconds = sec_num % 60;
    if(seconds < 10){ seconds = "0"+seconds; }    
    seconds += "s";
    
    return day +" "+ hours +" "+ minutes +" "+ seconds;  
}
