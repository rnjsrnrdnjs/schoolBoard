const passport =require('passport');
const local=require('./localStrategy');
const User=require('../models/user');
const School=require('../models/school');


module.exports=()=>{
	passport.serializeUser((user,done)=>{
		done(null,user);
	});
	passport.deserializeUser((user,done)=>{		
		User.findOne({where:{ id:user.id } })
		.then(user=>done(null,user))
		.catch(err=>done(err));
	});
	local();
}