const express=require('express');

const router=express.Router();

router.use((req,res,next)=>{
	// 기본적으로 제공할 변수들추가 res.locals.변수명
	next();
});

router.get('/',(req,res,next)=>{
	res.render('layout');
});

module.exports=router;