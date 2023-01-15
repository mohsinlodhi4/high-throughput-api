process.on('message', data=>{
    let calculation = Math.random()*10000000 + data?.number;
    process.send({data: calculation, message: "Calculation performed successfully"});
    process.exit();
})