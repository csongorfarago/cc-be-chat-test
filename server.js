//Getting PROFANITY regex ready for use
const fs = require('fs');
var BADWORDS = [];
var PROFANITY;
var CENZOR;
fs.readFile("assets/badwords.txt", "utf8", function(err, contents) {
    BADWORDS = contents.split('\r\n');
    PROFANITY  = new RegExp( BADWORDS.join("|") ,"gi");
    CENZOR = ("**********************").split("").join("******");
    console.log('Profanity words list loaded and filter set up');
});

//Setting up Websocket
const WebSocket = require('ws');
const PORT = 8080; 
const server = new WebSocket.Server({ port: PORT });
 
var messages = []; 
var clients = {};
 
server.on('connection', function connection(socket) {
  //Handle new connections
  console.log("Client connected");
  
    var client = {};
    client['name'] = "Unknown";
    client['join'] = Date.now();
    clients[socket.id] = client;    
    
 
  //sending chat history
  socket.send("03"+JSON.stringify(messages));
   
   
  //Handle messages from clients  
  socket.on('message', function incoming(message) {
    //decoding message
    var code =  message.substring(0, 2);
    var data =  JSON.parse(message.substring(2));
    //console.log('received:{ code: '+code+' , message: '+ JSON.stringify(data) +' }');
 
    //Code 01 - client settings
    if(code == "01"){
        if(data['name']){
            clients[socket.id]['name'] = data['name']; 
        }
        socket.send("01"+JSON.stringify(clients[socket.id]));       
    } 
    
    //Code 02 - chat message
    if(code == "02"){
        var text = profanity(data['message']);
        var message = { "name": clients[socket.id]['name'], 
                        "message": text, 
                        "time": Date.now()
                        };          
        
        //keeping last 50 messages
        if(messages.length >= 50){
            messages.shift();   
        }
        messages.push(message); 
        
        //sending message object to everyone
        server.clients.forEach(function(client) {
            client.send("02"+JSON.stringify(message));
        });      
    }
    
    //Code 03 - /popular command 
    if(code == "03"){
        var s = "";
        var time = Date.now() - 5000;
        for(var i = messages.length-1; i >= 0 && messages[i]['time'] >= time; i--){
            s+= messages[i]['message'] + " ";
        }          
        
        var wordCounts = { };
        var words = s.split(/\b/);
        
        var popular = {};
        popular['word'] = ""
        popular['count'] = 0;
        
        for(var i = 0; i < words.length; i++){
            var w = words[i].toLowerCase();
            wordCounts["_" + w] = (wordCounts["_" + w] || 0) + 1;
            if(wordCounts["_" + w] > popular['count'] && w != " "){
                popular['word'] = w;
                popular['count'] = wordCounts["_" + w];                
            }
        }

        socket.send("04"+JSON.stringify(popular));        
    } 

    //Code 04 - /stats command 
    if(code == "04"){
        //look for client
        var clientFound;
        for(var id in clients){
            if(clients[id]['name'] == data['name']){
                clientFound = clients[id];    
            }
        }
        
        if(clientFound){
            //client found    
            var answer = {};
            answer['name'] = clientFound['name'];
            answer['time'] = Date.now() - clientFound['join'];
            socket.send("05"+JSON.stringify(answer));               
        }else{
            //client not found
            var answer = {};
            answer['error'] = "client not found";
            socket.send("05"+JSON.stringify(answer));               
        }           
    } 
        
  });

  //Handle disconncetions from clients  
  socket.on('close', function incoming(message) {
    console.log('Client disconnected with code: %s', message);
  });

});

//Server is fully set up
console.log("Chat server is running at localhost:"+PORT);


//Helper functions
const profanity = function (message){
    return message.replace(PROFANITY, function(m) { 
        return CENZOR.substr(0, m.length);
    });
}