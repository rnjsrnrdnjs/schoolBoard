const express=require('express');

const router=express.Router();

router.use((req,res,next)=>{
	// 기본적으로 제공할 변수들추가 res.locals.변수명
	res.locals.user=1;
	res.locals.choose=1;
	
	next();
});

router.get('/',(req,res,next)=>{
	res.render('mainBoard');
});

router.get('/login',(req,res,next)=>{
	res.render('login');
});

router.get('/join',(req,res,next)=>{
	res.render('join');
});

router.get('/game',(req,res,next)=>{
	res.render('game');
});

router.get('/board',(req,res,next)=>{
	res.render('board');
});

router.get('/manito',(req,res,next)=>{
	res.render('manito');
});

router.post('/main',(req,res,next)=>{
	res.render('mainBoard');
});

module.exports=router;