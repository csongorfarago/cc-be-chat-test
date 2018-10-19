# Chat-Test

## Documentation

### System design decisions

    I left incode commets on every point where I think the design is not that 
    obvious and did leave some comments that can be used for a fast crtl+f 
    search. As this is not a complicated system and I tried to keepo the dev 
    time low I was going always going with the cleaner design decision I had in 
    mind or seen by a very fast research online.

### Optimization/Efficiency

    I was trying to implement functions I know efficient but I have not spent 
    too much time on researching each and every function I used. For this reason 
    I think the efficency of this code is enough for a test but would need a 
    stress test and some research on the specific calls that slow it down. 

###  Scaling Concerns

    First of all storing the clients in a js object is not the way as the data
    is lost when the server crashes and at scale its not a matter of if. 
    
    There are a lot of user misbehaviour and/or server/client error that are not
    handeled which would be needed if this code would be scaled but I wanted to 
    keep this project's development time to a fast late night hack.
    
    The server sometimes sends some extra information that the client do not
    need but it was usefull for debuging and would not matter until the network
    traffic starts to become a consideration.
    
    Currently the script has one big clients object that has all the data of 
    everyone but that means with every action a client dose we have a search in 
    that object like "clients[socket.id]". Having a local variable to keep the 
    users data in the socket and the big list would be on a DB would mean that 
    actions when we only need the client's own data bacomes faster and the rare
    occasin when we need an other client's data we can ask the DB. This depends
    on what kind of action the average user do.
     
    I am sure there are more issues that would be found and discussed by a code
    review.      

###  List of all NPM packages 

```
Inquirer - 
    This packgae was already used by the index.js so I went with it
ws - 
    The goal was to use WebSocket for the connection 
    
Ava - 
    While I have never personally used Ava before the exercise recomended it and 
    I heard good thigs about it before so I tought this is the perfect time to 
    look into it
    
babel-register - 
    To make the Ava implementation faster I seen others use this pack
```
