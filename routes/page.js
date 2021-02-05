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
		},
	});
	const title=String(req.params.category);
    res.render(`main/board/category`,{
		category:category,
		title:title,
	});
			console.log(category.category+" !");
	console.log(title+" @");

});

router.get('/write', isLoggedIn, (req, res, next) => {
    res.render('main/write');
});

router.get('/main', isLoggedIn, async (req, res, next) => {
    try {
		const board= await Post.findAll({});
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
			board:board,
        });
		console.log(board+" !");
		
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