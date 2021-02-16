const express = require('express');
const { isLoggedIn, isNotLoggedIn } = require('./middlewares');
const { Post, School, User, Comment, Chat, Room } = require('../models');
const router = express.Router();
const { sequelize } = require('../models');
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

router.get('/mypost', isLoggedIn, async (req, res, next) => {
	try{
		const category=await Post.findAll({
			where:{
				UserId:req.user.id,
			},
			include: [
                {
                    model: User,
                },
            ],
			order: [['createdAt', 'DESC']],
		});
		res.render(`main/board/category`,{
			category:category,			
		});
	}catch(err){
		console.error(err);
		next(err);
	}
});
router.get('/mycomment', isLoggedIn, async (req, res, next) => {
	try{
		const comments=await Comment.findAll({
			where:{
				UserId:req.user.id,
			},
			include: [
                {
                    model: User,
                },
            ],
			order: [['createdAt', 'DESC']],
		});
		res.render('setting/mycomment',{
			comments:comments,
		});
	}catch(err){
		console.error(err);
		next(err);
	}
});


router.get('/schoolTalk', isLoggedIn, async (req, res, next) => {
    try {
        const rooms = await Room.findAll({
            where: {
                SchoolId: res.locals.school.id,
            },
        });
        res.render('chat/schoolTalk', {
            rooms: rooms,
        });
    } catch (err) {
        console.error(error);
        next(error);
    }
});
router.get('/room/:id', isLoggedIn,async (req, res, next) => {
    try {
        const room = await Room.findOne({
            id: req.params.id,
        });
        const io = req.app.get('io');
        if (!room) {
            return res.redirect('/?error=존재하지 않는 방입니다.');
        }
        const chats = await Chat.findAll({
            where: {
                RoomId: req.params.id,
            },
            order: [['createdAt', 'ASC']],
        });
        return res.render('chat/Talk', {
            room,
            title: room.title,
            chats: chats,
            user: req.user.nick,
        });
    } catch (err) {
        console.error(error);
        next(error);
    }
});
router.get('/schoolMake', isLoggedIn, (req, res, next) => {
    res.render('chat/schoolMake');
});

router.get('/', isNotLoggedIn, (req, res, next) => {
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
router.get('/comment/:id', isLoggedIn, async (req, res, next) => {
    try {
        const posts = await Post.findOne({
            where: {
                id: req.params.id,
            },
            include: [
                {
                    model: User,
                },
            ],
            order: [['createdAt', 'DESC']],
        });
        const comments = await Comment.findAll({
            include: [
                {
                    model: Post,
                },
            ],
            include: [
                {
                    model: User,
                },
            ],
            where: {
                PostId: req.params.id,
            },
            order: [['createdAt', 'DESC']],
        });
        res.render(`main/board/comment`, {
            posts: posts,
            comments: comments,
        });
    } catch (err) {
        console.log(err);
        next(err);
    }
});
router.get('/write', isLoggedIn, (req, res, next) => {
    res.render('main/write');
});
router.get('/update/:Pid', isLoggedIn, async (req, res, next) => {
    try {
        const post = await Post.findOne({
            where: { id: req.params.Pid },
        });
        res.render('main/write', {
            post: post,
        });
    } catch (err) {
        console.log(err);
        next(err);
    }
});
router.get('/main', isLoggedIn, async (req, res, next) => {
    try {
        res.render(`main/main`, {});
    } catch (err) {
        console.log(err);
        next(err);
    }
});
router.get('/main/:category', isLoggedIn, async (req, res, next) => {
    try {
        const myschool = await School.findOne({
            include: [
                {
                    model: User,
                },
            ],
            where: { name: req.user.schoolName },
        });
        const category = await Post.findAll({
            where: {
                category: req.params.category,
                SchoolId: req.user.SchoolId,
            },
            include: [
                {
                    model: User,
                },
            ],
            order: [['createdAt', 'DESC']],
        });
        const title = String(req.params.category);
        res.render(`main/board/category`, {
            category: category,
            title: title,
            myschool: myschool,
        });
    } catch (err) {
        console.log(err);
        next(err);
    }
});
router.get('/main/:category/hot', isLoggedIn, async (req, res, next) => {
    try {
        const myschool = await School.findOne({
            include: [
                {
                    model: User,
                },
            ],
            where: { name: req.user.schoolName },
        });
        const category = await Post.findAll({
            where: {
                SchoolId: req.user.SchoolId,
                category: req.params.category,
            },
            include: [
                {
                    model: User,
                },
            ],
            order: [['like', 'DESC']],
        });
        const title = String(req.params.category);
        res.render(`main/board/category`, {
            category: category,
            title: title,
            myschool: myschool,
        });
    } catch (err) {
        console.log(err);
        next(err);
    }
});
router.get('/school/:today', isLoggedIn, async (req, res, next) => {
    try {
		const day=await new Date(parseInt(req.params.today));
		const year=await day.getFullYear();
		const month=await day.getMonth() + 1;
		
		 const school = await School.findOne({
            where: {
                id: res.locals.school.id,
            },
        });
        const schoolDiary = [];
        await neis
            .createSchool(neis.REGION[school.edu], school.code, school.kind)
            .getDiary(month, year - 1)
            .then((list) => {
                for (let day of Object.keys(list)) {
					console.log(day);
                    schoolDiary.push({ month: month, day:"d"+day, diary: list[day].join(', ') });
                }
            });
        const schoolMeal = [];
		let i=0;
        await neis
            .createSchool(neis.REGION[school.edu], school.code, school.kind)
            .getMeal(year - 1, month,refresh=true)
            .then((d) => {
                d.forEach((meal) => {
                    schoolMeal.push({
						day:"m"+i,
                        breakfast: neis.removeAllergy(meal.breakfast).replace('&amp;',' '),
                        lunch: neis.removeAllergy(meal.lunch).replace('&amp;',' '),
                        dinner: neis.removeAllergy(meal.dinner).replace('&amp;',' '),
                    });
					i++;
                });
            });
        await res.render('school/school', {
            schoolDiary: schoolDiary,
            schoolMeal: schoolMeal,
        });
	}
	catch(err){
		console.error(err);
		next(err);
	}
});

router.get('/school', isLoggedIn, async (req, res, next) => {
    try {
		
        const today = new Date();
        const year = today.getFullYear();
        const month = today.getMonth() + 1;

        const school = await School.findOne({
            where: {
                id: res.locals.school.id,
            },
        });
        const schoolDiary = [];
        await neis
            .createSchool(neis.REGION[school.edu], school.code, school.kind)
            .getDiary(month, year - 1)
            .then((list) => {
                for (let day of Object.keys(list)) {
                    schoolDiary.push({ month: month, day:"d"+day, diary: list[day].join(', ') });
                }
            });
        const schoolMeal = [];
		let i=0;
        await neis
            .createSchool(neis.REGION[school.edu], school.code, school.kind)
            .getMeal(year - 1, month)
            .then((d) => {
                d.forEach((meal) => {
                    schoolMeal.push({
						day:"m"+i,
                        breakfast: neis.removeAllergy(meal.breakfast).replace('&amp;', ' '),
                        lunch: neis.removeAllergy(meal.lunch).replace('&amp;', ' '),
                        dinner: neis.removeAllergy(meal.dinner).replace('&amp;', ' '),
                    });
					i++;
                });
            });
        await res.render('school/school', {
            schoolDiary: schoolDiary,
            schoolMeal: schoolMeal,
        });
    } catch (err) {
        console.log(err);
        next(err);
    }
});

router.get('/setting', isLoggedIn, async(req, res, next) => {
	try{
		const user=await User.findOne({
			where:{
				id:res.locals.user.id,
			},
		});
	    res.render('setting/setting',{
			user:user,
		});
	}catch(err){
		console.log(err);
		next(err);
	}
});

router.get('/game', isLoggedIn, (req, res, next) => {
    res.render('game/game');
});
router.get('/chat', isLoggedIn, (req, res, next) => {
    res.render('chat/chat');
});
router.delete('/room/:id', async (req, res, next) => {
    try {
        await Room.destroy({ where: { id: req.params.id } });
        await Chat.destroy({ where: { RoomId: req.params.id } });
        res.send('ok');
        setTimeout(() => {
            req.app.get('io').of('/room').emit('removeRoom', req.params.id);
        }, 2000);
    } catch (err) {
        console.log(err);
        next(err);
    }
});
module.exports = router;