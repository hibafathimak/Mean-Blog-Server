const mangoose = require('mongoose') 

const connectionString=process.env.DBCONNECTIONSTRING 

mangoose.connect(connectionString).then(res=>{
    console.log("MongoDB Atlas Connected successfully");
}).catch(err=>{
    console.log("MongoDB Atlas Connection Failed");
    console.log(err);
})
