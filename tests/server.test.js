import test from 'ava';
const server = require('../server.js');

const WebSocket = require('ws');  

test.cb('connection', t => {      
    var ws1 = new WebSocket('ws://localhost:8080');    
    ws1.on('open', function open() {
        setTimeout(function () {
          ws1.close();
        }, 5)
    }); 
    ws1.on('close', function handleClose(reason) {
        t.pass();
        t.end();        
    });                                                      
})


test.cb('Setting Name', t => {      
    var ws2 = new WebSocket('ws://localhost:8080');
    ws2.on('open', function open() {
        ws2.send('01{"join":""}');
        ws2.send('01{"name":"testName123"}');
    }); 
    var i = 0; 
    ws2.on('message', function incoming(message) {
        if(message.substring(0,2) == "01"){
            var data =  JSON.parse(message.substring(2));
            if(i == 0){
                //testing to change variable that should not be changed
                if(data['join'] == ""){
                    t.fail();
                }else{
                    t.pass();
                }
                i++;
            }else{
              t.is(message.substring(0,24), '01{"name":"testName123",');  
              t.end();            
            }
        }
    });                      
})


test.cb('Sending message', t => {      
    var ws3 = new WebSocket('ws://localhost:8080');
    ws3.on('open', function open() {
        ws3.send('01{"name":"testName123"}');
        ws3.send('02{"message":"test Message 123"}');
    });  
    ws3.on('message', function incoming(message) {
        if(message.substring(0,2) == "02"){
            var data =  JSON.parse(message.substring(2));  
            if(data['name'] == 'testName123'){         
                t.is(data['name'], 'testName123');
                t.is(data['message'], 'test Message 123');
                t.end();
            }
        }
    });                      
})


test.cb('Sending bad language', t => {      
    var ws4 = new WebSocket('ws://localhost:8080');
    ws4.on('open', function open() {
        ws4.send('01{"name":"badPerson123"}');
        ws4.send('02{"message":"test ass 12ass3"}');
    });  
    ws4.on('message', function incoming(message) {
        if(message.substring(0,2) == "02"){
            var data =  JSON.parse(message.substring(2));
            if(data['name'] == 'badPerson123'){            
                t.is(data['name'], 'badPerson123');
                t.is(data['message'], 'test *** 12***3');
                t.end();
            }
        }
    });                   
})


test.cb('Sending /popular', t => {      
    var ws5 = new WebSocket('ws://localhost:8080');
    ws5.on('open', function open() {
        ws5.send("03{}");
    });  
    ws5.on('message', function incoming(message) {
        if(message.substring(0,2) == "04"){
            var data =  JSON.parse(message.substring(2));         
            t.is(data['word'], 'test');
            t.is(data['count'], 2);
            t.end();
        }        
    });                     
})

test.cb('Sending /stats with no user', t => {      
    var ws6 = new WebSocket('ws://localhost:8080');
    ws6.on('open', function open() {
        ws6.send("04{}");
    });  
    ws6.on('message', function incoming(message) {
        if(message.substring(0,2) == "05"){
            var data =  JSON.parse(message.substring(2));         
            t.is(data['error'], 'client not found');
            t.end();
        }     
    });                     
})

test.cb('Sending /stats with user', t => {      
    var ws7 = new WebSocket('ws://localhost:8080');
    ws7.on('open', function open() {
        ws7.send('01{"name":"timedPerson123"}');
        ws7.send('04{"name":"timedPerson123"}');
    });  
    ws7.on('message', function incoming(message) {
        if(message.substring(0,2) == "05"){
            var data =  JSON.parse(message.substring(2));         
            if(data['time']){
                t.pass();
            }
            t.end();
        }     
    });                     
})

test.cb('testing message history', t => {  
    var messages = [];    
    var ws8 = new WebSocket('ws://localhost:8080');
    ws8.on('open', function open() {
        ws8.send('01{"name":"Spammer123"}');
        for(var i = 0; i<100; i++){
            ws8.send('02{"message":"spam'+i+'"}');
            
            var message = {};
            message['name'] = "Spammer123"; 
            message['message'] = "spam"+i;            
            messages.push(message);
        }
    });  

    setTimeout(function () {
        var ws9 = new WebSocket('ws://localhost:8080'); 
        ws9.on('message', function incoming(message) {
            if(message.substring(0,2) == "03"){
                var data =  JSON.parse(message.substring(2)); 
                var i = 50;
                data.forEach(function (element){
                    t.is(element['name'], messages[i]['name']);
                    t.is(element['message'], messages[i++]['message']);
                });        
                t.end();
            }   
        });    
    }, 50)                         
})