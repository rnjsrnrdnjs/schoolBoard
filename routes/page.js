const express = require('express');
const { isLoggedIn, isNotLoggedIn } = require('./middlewares');
const { Post, School, User } = require('../models');
const router = express.Router();

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
// 이미 로그인 되어있을때 / 처리
router.get('/', (req, res, next) => {
    res.render('load');
});
router.get('/login', isNotLoggedIn, (req, res, next) => {
    res.render('login');
});
router.get('/join', isNotLoggedIn, (req, res, next) => {
    res.render('join');
});
router.get('/board/:category', isLoggedIn, async(req, res, next) => {
	// :category-> req.params.category
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
	});
});

router.get('/write', isLoggedIn, (req, res, next) => {
    res.render('main/write');
});

router.get('/main', isLoggedIn, async (req, res, next) => {
    try {
		const free= await Post.findOne({
			where:{
				SchoolId:req.user.SchoolId,
				category:'free',
			},
			order:[['createdAt','DESC']],
		});
		const worry= await Post.findOne({
			where:{
				SchoolId:req.user.SchoolId,
				category:'worry',
			},
			order:[['createdAt','DESC']],
		});
		const study= await Post.findOne({
			where:{
				SchoolId:req.user.SchoolId,
				category:'study',
			},
			order:[['createdAt','DESC']],
		});
		const love= await Post.findOne({
			where:{
				SchoolId:req.user.SchoolId,
				category:'love',
			},
			order:[['createdAt','DESC']],
		});
		const food= await Post.findOne({
			where:{
				SchoolId:req.user.SchoolId,
				category:'food',
			},
			order:[['createdAt','DESC']],
		});
		const beauty= await Post.findOne({
			where:{
				SchoolId:req.user.SchoolId,
				category:'beauty',
			},
			order:[['createdAt','DESC']],
		});
		const fashion= await Post.findOne({
			where:{
				SchoolId:req.user.SchoolId,
				category:'fashion',
			},
			order:[['createdAt','DESC']],
		});
		const music= await Post.findOne({
			where:{
				SchoolId:req.user.SchoolId,
				category:'music',
			},
			order:[['createdAt','DESC']],
		});
		const blame= await Post.findOne({
			where:{
				SchoolId:req.user.SchoolId,
				category:'blame',
			},
			order:[['createdAt','DESC']],
		});
		const hot= await Post.findAll({
			include: [
                {
                    model: User,
                },
            ],
			where:{
				SchoolId:req.user.SchoolId,
			},
			order:[['createdAt','DESC']],
			limit:3,
		});
        const myschool = await School.findOne({
            include: [
                {
                    model: User,
                },
            ],
            where: { name: req.user.schoolName },
        });

        res.render('main/main', {
            myschool: myschool,
			free:free,
			worry:worry,
			study:study,
			love:love,
			food:food,
			beauty:beauty,
			fashion:fashion,
			music:music,
			blame:blame,
			hot:hot,
        });
    } catch (err) {
        console.log(err);
        next(err);
    }
});
router.get('/school', isLoggedIn, (req, res, next) => {
    res.render('school/school');
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