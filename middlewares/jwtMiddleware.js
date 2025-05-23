const jwt =  require('jsonwebtoken')
const jwtMiddleware=(req,res,next)=>{
const token = req.headers["authorization"].split(" ")[1] 
if(token){

    try {
        const jwtResponse= jwt.verify(token,process.env.JWT_SECRET)
        req.userId = jwtResponse.userId
        req.role=jwtResponse.role
        next() 
        
    } catch (error) {
        res.status(401).json("Authorization failed ... Token is Missiing")
    }

}else{
    res.status(404).json("Authorization failed ... Token is Missiing")
}
}

module.exports =jwtMiddleware