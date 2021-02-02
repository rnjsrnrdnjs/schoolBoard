const express=require('express');
const {isLoggedIn ,isNotLoggedIn }=require('./middlewares');
const {Post,School,User}=require('../models');
const router=express.Router();

router.use((req,res,next)=>{
	// 기본적으로 제공할 변수들추가 res.locals.변수명
	res.locals.user=req.user;
	res.locals.school=req.school;
	next();
});

router.get('/',isNotLoggedIn,(req,res,next)=>{
	res.render('load');
});
router.get('/login',isNotLoggedIn,(req,res,next)=>{
	res.render('login');
});
router.get('/join',isNotLoggedIn,(req,res,next)=>{
	res.render('join');
});

router.get('/main',isLoggedIn,async(req,res,next)=>{
	/*
	try{
		const posts = await Post.findAll({
			include:{
				model:School,
				attributes:['name'],
			},
			order:[['createdAt','DESC']],
		});
		res.render('main/main',{
			board:posts,
		});
	}catch(err){
		console.log(err);
		next(err);
	}
	*/
	res.render('main/main');
});
router.get('/school',isLoggedIn,(req,res,next)=>{
	res.render('school/school');
});

router.get('/setting',isLoggedIn,(req,res,next)=>{
	res.render('setting/setting');
});

router.get('/game',isLoggedIn,(req,res,next)=>{
	res.render('game/game');
});
router.get('/chat',isLoggedIn,(req,res,next)=>{
	res.render('chat/chat');
});


module.exports=router;