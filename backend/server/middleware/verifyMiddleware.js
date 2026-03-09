const verfiyRequest=(req,res,next)=>{
    const clientkey = req.headers['x-api-key'];
    if(!clientkey||clientkey!==process.env.REQUESTAPISECRET){
        return res.status(401).json({error:'Unauthorized: Invalid API Key'});
    }
    next();
}
export default verfiyRequest