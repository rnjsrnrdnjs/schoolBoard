const express = require('express');
const { isLoggedIn, isNotLoggedIn } = require('./middlewares');
const { Post, School, User,Comment } = require('../models');
const router = express.Router();
const {sequelize}=require('../models');
const neis = require('../neis/neis');
const SchoolType = require('../neis/types/SchoolType');


router.use(async (req, res, next) => {
    // 기본적으로 제공할 변수들추가 res.locals.변수명
    res.locals.user = req.user;
    if (req.user) {
        const school = await School.findOne({
            include: [
                {
                    model: User,
                },
            ],
            where: { id: req.user.SchoolId },
        });
        res.locals.school = req.user ? school : null;
    }
    next();
});

router.get('/',isNotLoggedIn, (req, res, next) => {
    res.render('load');
});
router.get('/login', isNotLoggedIn, (req, res, next) => {
    res.render('login');
});
router.get('/join', isNotLoggedIn, (req, res, next) => {
    res.render('join');
});
router.get('/findSchool', isNotLoggedIn, (req, res, next) => {
    res.render('findSchool');
});
router.get('/comment/:id', isLoggedIn, async(req, res, next) => {
	try{
		const posts=await Post.findOne({
			where:{
				id:req.params.id,
			},
			include:[{
				model:User,
			}],
			order:[['createdAt','DESC']],
		});
		const comments=await Comment.findAll({
			include:[{
				model:Post,
			}],
			include:[{
				model:User,
			}],
			where:{
				PostId:req.params.id,
			},
			order:[['createdAt','DESC']],
		});
		res.render(`main/board/comment`,{
			posts:posts,
			comments:comments,
		});
	}catch(err){
		console.log(err);
        next(err);
	}
});
router.get('/write', isLoggedIn, (req, res, next) => {
    res.render('main/write');
});
router.get('/update/:Pid', isLoggedIn, async(req, res, next) => {
	try{
		
		const post=await Post.findOne({
			where:{id:req.params.Pid,},
		})
	    res.render('main/write',{
			post:post,
		});
	}catch(err){
		console.log(err);
		next(err);
	}
});
router.get('/main', isLoggedIn, async (req, res, next) => {
   try{
	   const myschool = await School.findOne({
            include: [
                {
                    model: User,
                },
            ],
            where: { name: req.user.schoolName },
        });
	const category=await Post.findAll({
		where:{
			category:'free',
			SchoolId:req.user.SchoolId,
		},
		include:[
			{
				model:User,
			}
		],
		order:[['createdAt','DESC']],
	});
	const title=String('free');
    res.render(`main/board/category`,{
		category:category,
		title:title,
		myschool:myschool,
	});
	}catch(err){
		console.log(err);
        next(err);
	}
});
router.get('/main/:category', isLoggedIn, async (req, res, next) => {
   try{
	   const myschool = await School.findOne({
            include: [
                {
                    model: User,
                },
            ],
            where: { name: req.user.schoolName },
        });
	const category=await Post.findAll({
		where:{
			category:req.params.category,
			SchoolId:req.user.SchoolId,
		},
		include:[
			{
				model:User,
			}
		],
		order:[['createdAt','DESC']],
	});
	const title=String(req.params.category);
    res.render(`main/board/category`,{
		category:category,
		title:title,
		myschool:myschool,
	});
	}catch(err){
		console.log(err);
        next(err);
	}
});
router.get('/main/:category/hot', isLoggedIn, async (req, res, next) => {
   try{
	   const myschool = await School.findOne({
            include: [
                {
                    model: User,
                },
            ],
            where: { name: req.user.schoolName },
    });
	const category=await Post.findAll({
		where:{
			SchoolId:req.user.SchoolId,
			category:req.params.category,
		},
		include:[
			{
				model:User,
			}
		],
		order:[['like','DESC']],
	})
	const title=String(req.params.category);
    res.render(`main/board/category`,{
		category:category,
		title:title,
		myschool:myschool,
	});
	}catch(err){
		console.log(err);
        next(err);
	}
});
router.get('/school', isLoggedIn, async(req, res, next) => {
	try{
		const today=new Date();
		const year=today.getFullYear();
		const month=today.getMonth()+1;
		
		const school=await School.findOne({
			where:{
				id:res.locals.school.id,
			},
		});
		const schoolDiary=[];
         await neis.createSchool(neis.REGION[school.edu], school.code,school.kind).getDiary(month, year-1).then((list) => {
            for (let day of Object.keys(list)) {
				schoolDiary.push({month:month,day:day,diary:list[day].join(", ")});
            }
        });
		const schoolMeal =[];
		await neis.createSchool(neis.REGION[school.edu], school.code,school.kind).getMeal(year-1, month).then((d) => {
        d.forEach((meal) => {
			schoolMeal.push({breakfast:neis.removeAllergy(meal.breakfast).replace("&amp;"," "),lunch:neis.removeAllergy(meal.lunch).replace("&amp;"," "),dinner:neis.removeAllergy(meal.dinner).replace("&amp;"," ")});
    	    });
	    });
	    res.render('school/school',{
			schoolDiary:schoolDiary,
			schoolMeal:schoolMeal,
		});
	}catch(err){
		console.log(err);
		next(err);
	}
});

router.get('/setting', isLoggedIn, (req, res, next) => {
    res.render('setting/setting');
});

router.get('/game', isLoggedIn, (req, res, next) => {
    res.render('game/game');
});
router.get('/chat', isLoggedIn, (req, res, next) => {
    res.render('chat/chat');
});
module.exports = router;