const express=require('express');

const router=express.Router();

router.use((req,res,next)=>{
	// 기본적으로 제공할 변수들추가 res.locals.변수명
	res.locals.user=1;
	res.locals.choose=null;
	res.locals.login=null;
	
	next();
});

router.get('/',(req,res,next)=>{
	res.render('main');
});

router.get('/join',(req,res,next)=>{
	res.render('join');
});


module.exports=router;