const express = require('express');
const {fork}  = require('child_process');

const app = express();


let temporaryRequestPool = [];
const redundantRequestMiddleware = (req,res, next) =>{
    // checking if same request was hit 5 minutes earlier
    let id = req?.body?.id;
    if(id){
        let checkIfAlreadyRequested5MinutesAgo = temporaryRequestPool.find(r => 
            r.id==id 
            && r.ip== req.socket.remoteAddress 
            && r.time > (new Date()).getTime() - (5 * 60 * 1000) 
        );
        if(checkIfAlreadyRequested5MinutesAgo){
            return req.socket.destroy(); //ignoring the request as the client misfires
        }
        temporaryRequestPool.push({id, ip: req.socket.remoteAddress, time: (new Date()).getTime() });
    }
    next();
}

// middlewares
app.use(express.json());
app.use(express.urlencoded({extended: false}));
app.use(redundantRequestMiddleware);

app.post('/api', (req, res)=>{

    // creating multiple processes to not return response asap
    const childProcess = fork('./process.js');
    childProcess.send({number: 10});

    childProcess.on('message', (data)=> res.json(data)  )
});


app.listen(3000,()=>console.log("app running on 3000"));