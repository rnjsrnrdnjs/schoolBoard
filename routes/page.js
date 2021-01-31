const express=require('express');
const {isLoggedIn ,isNotLoggedIn }=require('./middlewares');

const router=express.Router();

router.use((req,res,next)=>{
	// 기본적으로 제공할 변수들추가 res.locals.변수명
	res.locals.user=req.user;
	res.locals.choose=1;
	
	next();
});

router.get('/',isLoggedIn,(req,res,next)=>{
	res.render('mainBoard');
});

router.get('/login',isNotLoggedIn,(req,res,next)=>{
	res.render('login');
});

router.get('/join',isNotLoggedIn,(req,res,next)=>{
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

module.exports=router;