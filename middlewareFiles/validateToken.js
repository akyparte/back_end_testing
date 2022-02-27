const jwt = require('jsonwebtoken');
const config = require('../config');

class Verification{
    varifyToken(req,res,next) {
        let token = req.cookies.jwt;
        if(!token){
            next()
        }else {
            if(jwt.verify(token,config.JWTKEY)){
                res.redirect('/chat');
            }else {
                next();
            }
        }
        
    }
    isTokenExisted(req,res,next){
        let token = req.cookies.jwt;
        if(req.cookies.jwt && jwt.verify(token,config.JWTKEY)){
            next();
        }else {
            res.redirect('/');
        }
    }
}


module.exports = Verification;
