const express = require('express');
const { isLoggedIn, isNotLoggedIn } = require('./middlewares');
const { Post, School, User, Comment, Chat, Room,RoomList,RoomAll,RoomAllList,ChatAll,MyRoom,MyChat,Notice,Alarm,MyChatRead,} = require('../models');
const router = express.Router();
const { sequelize } = require('../models');
const neis = require('../neis/neis');
const SchoolType = require('../neis/types/SchoolType');
const Sequelize = require('sequelize');
const Op = Sequelize.Op; 
router.use(async (req, res, next) => {
    // 기본적으로 제공할 변수들추가 res.locals.변수명
    res.locals.user = req.user;
	res.locals.talk=false;
	res.locals.alarm=false;
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
		
		/* 여기서 알림 있는지 구현 */
		//메시지 알림
		const checkRead=await MyRoom.findAll({
			where:{
				[Op.or]: [{member1: req.user.id}, {member2: req.user.id}],	
			},
		});
		await Promise.all( checkRead.map(async(room)=>{
			const chat=await MyChat.findOne({
				where:{
					MyRoomId:room.id,
				},
				order: [['createdAt', 'DESC']],
			});
			if(chat){
			const read=await MyChatRead.findAll({
				where:{
					MyChatId:chat.id,
				},
			});
			if(read.length==1 && read[0].readId!=req.user.id)
				res.locals.talk=true;
			}
		}));
		// 게시글 등의 alarm
		const checkAlarm=await Alarm.findAll({
			where:{
				UserId:req.user.id,
			}
		})
		await Promise.all( checkAlarm.map(async(alarm)=>{
			if(alarm.read==="false"){
				res.locals.alarm=true;
			}
		}));
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
router.get('/manitoTalk', isLoggedIn, async (req, res, next) => {
	res.render('chat/manitoTalk');
});

router.get('/schoolTalk', isLoggedIn, async (req, res, next) => {
    try {
        const rooms = await Room.findAll({
            where: {
                SchoolId: res.locals.school.id,
            },
			include:[{
				model:User,
			}],
        });
        res.render('chat/schoolTalk', {
            rooms: rooms,
        });
    } catch (err) {
        console.error(error);
        next(error);
    }
});
router.get('/allTalk', isLoggedIn, async (req, res, next) => {
    try {
        const rooms = await RoomAll.findAll({
			include:[{
				model:User,
			}],
        });
        res.render('chat/allTalk', {
            rooms: rooms,
        });
    } catch (err) {
        console.error(error);
        next(error);
    }
});
router.get('/randomTalk', isLoggedIn, async (req, res, next) => {
    try {		
        res.render('chat/randomTalk');
    } catch (err) {
        console.error(error);
        next(error);
    }
});

router.get('/concave',isLoggedIn,async(req,res,next)=>{
	try{
		res.render('game/concave');
	}catch(err){
		console.error(error);
		next(error);
	}
});

router.get('/room/:id', isLoggedIn,async (req, res, next) => {
    try {
        const room = await Room.findOne({
			where:{
	            id: req.params.id,
			},
        });
        const io = req.app.get('io');
        if (!room) {
            return res.redirect('/schoolTalk?error=존재하지 않는 방입니다.');
        }
		if(room.SchoolId!=res.locals.school.id){
            return res.redirect('/schoolTalk?error=잘못된 접근입니다.');
		}
		if(room.password && room.password!==req.query.password){
			return res.redirect('/schoolTalk?error=비밀번호가 틀렸습니다.');
		}
		const user= await User.findOne({
			where:{
				id:req.user.id,
			},
		})
		const chk=await RoomList.findOne({
			where:{
				RoomId:req.params.id,
				UserId:req.user.id,
			},
		});
        if (!chk) {
			await Chat.create({
				user:'system',
				chat:`${req.user.nick} 님이 입장하셨습니다.`,
				UserId:req.user.id,
				RoomId:req.params.id,
			})
			io.of('/chat').to(req.params.id).emit('join', {
           		user: 'system',
            	chat:`${req.user.nick} 님이 입장하셨습니다.`,
       		 });
            await Room.increment({ cnt: 1 }, { where: { id: req.params.id } });
            await RoomList.create({
                UserId: req.user.id,
                RoomId: req.params.id,
            });
		}
		 const chats = await Chat.findAll({
			include:[{
				model:User,
			}],
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
router.get('/roomAll/:id', isLoggedIn,async (req, res, next) => {
    try {
        const room = await RoomAll.findOne({
			where:{
	            id: req.params.id,
			},
        });
        const io = req.app.get('io');
        if (!room) {
            return res.redirect('/?error=존재하지 않는 방입니다.');
        }
		if(room.password && room.password!==req.query.password){
			return res.redirect('/?error=비밀번호가 틀렸습니다.');
		}
		const user= await User.findOne({
			where:{
				id:req.user.id,
			},
		})
		const chk=await RoomAllList.findOne({
			where:{
				RoomAllId:req.params.id,
				UserId:req.user.id,
			},
		});
        if (!chk) {
			await ChatAll.create({
				user:'system',
				chat:`${req.user.nick} 님이 입장하셨습니다.`,
				UserId:req.user.id,
				RoomAllId:req.params.id,
			})
			io.of('/chatAll').to(req.params.id).emit('join', {
           		user: 'system',
            	chat:`${req.user.nick} 님이 입장하셨습니다.`,
       		 });
            await RoomAll.increment({ cnt: 1 }, { where: { id: req.params.id } });
            await RoomAllList.create({
                UserId: req.user.id,
                RoomAllId: req.params.id,
            });
		}
		 const chats = await ChatAll.findAll({
			include:[{
				model:User,
			}],
            where: {
                RoomAllId: req.params.id,
            },
            order: [['createdAt', 'ASC']],
        });
        return res.render('chat/allchat', {
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
router.get('/myRoom/:id', isLoggedIn,async (req, res, next) => {
    try {
        const room = await MyRoom.findOne({
			where:{
	            id: req.params.id,
			},
        });
        const io = req.app.get('io');
        if (!room) {
            return res.redirect('/?Error=존재하지 않는 방입니다.');
        }
		if(room.member1!=req.user.id && room.member2!=req.user.id){
            return res.redirect('/?Error=잘못된 접근입니다.');
		}
		 const chats = await MyChat.findAll({
			include:[{
				model:User,
			}],
            where: {
                MyRoomId: req.params.id,
            },
            order: [['createdAt', 'ASC']],
        });
		await Promise.all( chats.map(async(chat)=>{
			const findRead=await MyChatRead.findOne({
				where:{
					MyChatId:chat.id,
					readId:req.user.id,
				},
			});
			if(!findRead){
				await MyChatRead.create({
					MyChatId:chat.id,
					readId:req.user.id,
				});
			}
		}));
		
		if(room.kind=="individual"){
	        return res.render('chat/myChat', {
	            room,
	            chats: chats,
	            user: req.user.nick,
				kind:"individual",
	        });
		}
		else if(room.kind=="manito"){
			const person1=await User.findOne({
				where:{
					id:room.member1,
				}
			});
			const person2=await User.findOne({
				where:{
					id:room.member2,
				}
			});
	        return res.render('chat/myChat', {
	            room,
				person1,
				person2,
	            chats: chats,
	            user: req.user.nick,
				kind:"manito",
	        });
		}
    } catch (err) {
        console.error(error);
        next(error);
    }
});



router.get('/schoolMake', isLoggedIn, (req, res, next) => {
    res.render('chat/schoolMake');
});
router.get('/allMake', isLoggedIn, (req, res, next) => {
    res.render('chat/allMake');
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
            order: [['createdAt', 'ASC']],
        });
        res.render(`main/board/comment`, {
            posts: posts,
            comments: comments,
        });
    } catch (err) {
        console.error(err);
        next(err);
    }
});
router.get('/write/:title', isLoggedIn, (req, res, next) => {
    res.render('main/write',{
		title:req.params.title,
	});
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
        console.error(err);
        next(err);
    }
});
router.get('/main', isLoggedIn, async (req, res, next) => {
    try {
		const notice=await Notice.findOne({
			order: [['createdAt', 'DESC']],
		});
        res.render(`main/main`, {notice});
    } catch (err) {
        console.error(err);
        next(err);
    }
});
router.get('/notice', isLoggedIn, async (req, res, next) => {
    try {
        const notice=await Notice.findAll({
			order: [['createdAt', 'DESC']],
		});
		res.render('main/notice',{
			notice:notice,
		});
    } catch (err) {
        console.error(err);
        next(err);
    }
});
router.get('/admin', isLoggedIn, async (req, res, next) => {
    try {
		if(req.user.nick!=="운영자" || req.user.email!=="090tree@gmail.com"){
		   res.redirect('/?Error=운영자 전용페이지입니다.')
		}
		res.render('main/admin',{
		});
    } catch (err) {
        console.error(err);
        next(err);
    }
});

router.get('/alarm', isLoggedIn, async (req, res, next) => {
    try {
		const alarms=await Alarm.findAll({
			where:{
				UserId:req.user.id,
			},
			order: [['createdAt', 'DESC']],
		});
		const alarm2=await Alarm.findAll({
			where:{
				UserId:req.user.id,
				read:"false",
			},
		});
		await Promise.all( alarm2.map(async(alarm)=>{
			await Alarm.update({read:"true"},
				{where:{
					id:alarm.id,
				}}
			);
		}));
        res.render(`main/alarm`, {alarms});
    } catch (err) {
        console.error(err);
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
        console.error(err);
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
        console.error(err);
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
        console.error(err);
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
		console.error(err);
		next(err);
	}
});

router.get('/game', isLoggedIn, (req, res, next) => {
    res.render('game/game');
});
router.get('/chat', isLoggedIn, (req, res, next) => {
    res.render('chat/chat');
});
router.get('/myRoom', isLoggedIn, async(req, res, next) => {
	try{
	const individualRoom=await MyRoom.findAll({
		where:{
			kind:"individual",
			[Op.or]: [{member1: req.user.id}, {member2: req.user.id}],	
		},
	});
	await Promise.all( individualRoom.map(async(room,idx)=>{
		if(room.member1==req.user.id){
			const you=await User.findOne({
				where:{
					id:room.member2,
				}
			});
			individualRoom[idx].User=await you;
		}
		else if(room.member2==req.user.id){
			const you=await User.findOne({
				where:{
					id:room.member1,
				}
			});
			individualRoom[idx].User=await you;
		}		
	}));
	await Promise.all( individualRoom.map(async(room,idx)=>{
		const chat=await MyChat.findOne({
			where:{
				MyRoomId:room.id,
			},
			order: [['createdAt', 'DESC']],
		});
		const chatRead=await MyChatRead.findOne({
			where:{
				MyChatId:chat.id,
				readId:req.user.id,
			},
		});
		if(chatRead)
			individualRoom[idx].read=await true;
		else
			individualRoom[idx].read=await false;
		individualRoom[idx].MyChat=await chat;
	}));
	
    await res.render('chat/myRoom',{
		individualRoom:individualRoom,
	});
	}catch(err){
		console.error(err);
		next(err);
	}
});
router.get('/myRoom2', isLoggedIn, async(req, res, next) => {
	try{
	const individualRoom=await MyRoom.findAll({
		where:{
			kind:"manito",
			[Op.or]: [{member1: req.user.id}, {member2: req.user.id}],	
		},
	});
	await Promise.all( individualRoom.map(async(room,idx)=>{
		if(room.member1==req.user.id){
			const you=await User.findOne({
				where:{
					id:room.member2,
				}
			});
			individualRoom[idx].User=await you;
		}
		else if(room.member2==req.user.id){
			const you=await User.findOne({
				where:{
					id:room.member1,
				}
			});
			individualRoom[idx].User=await you;
		}		
	}));
	await Promise.all( individualRoom.map(async(room,idx)=>{
		const chat=await MyChat.findOne({
			where:{
				MyRoomId:room.id,
			},
			order: [['createdAt', 'DESC']],
		});
		individualRoom[idx].MyChat=await chat;
	}));
	await Promise.all( individualRoom.map(async(room,idx)=>{
		const chat=await MyChat.findOne({
			where:{
				MyRoomId:room.id,
			},
			order: [['createdAt', 'DESC']],
		});
		const chatRead=await MyChatRead.findOne({
			where:{
				MyChatId:chat.id,
				readId:req.user.id,
			},
		});
		if(chatRead)
			individualRoom[idx].read=await true;
		else
			individualRoom[idx].read=await false;
		individualRoom[idx].MyChat=await chat;
	}));	
    await res.render('chat/myRoom2',{
		individualRoom:individualRoom,
	});
	}catch(err){
		console.error(err);
		next(err);
	}
});

router.get('/imageView/img/:src', isLoggedIn, (req, res, next) => {
    res.render('imageView',{
		src:req.params.src,	
	});
});
router.get('/imageView/:src', isLoggedIn, (req, res, next) => {
    res.render('imageView',{
		src:req.params.src,	
	});
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
        console.error(err);
        next(err);
    }
});
router.delete('/myRoom/:id', async (req, res, next) => {
    try {
        await MyRoom.destroy({ where: { id:req.params.id}} );
        const my=await MyChat.destroy({ where: { MyRoomId: req.params.id } });
        await MyChat.Read.destroy({where:{MyChatId:my.id},});
		res.send('ok');
        setTimeout(() => {
            req.app.get('io').of('/myRoom').emit('removeRoom', req.params.id);
        }, 2000);
    } catch (err) {
        console.error(err);
        next(err);
    }
});

router.delete('/roomAll/:id', async (req, res, next) => {
    try {
        await RoomAll.destroy({ where: { id: req.params.id } });
        await ChatAll.destroy({ where: { RoomAllId: req.params.id } });
        res.send('ok');
        setTimeout(() => {
            req.app.get('io').of('/roomAll').emit('removeRoom', req.params.id);
        }, 2000);
    } catch (err) {
        console.error(err);
        next(err);
    }
});
router.delete('/alarm/:id', async (req, res, next) => {
    try {
		await Alarm.destroy({where:{id:req.params.id}});
        res.send('ok');
    } catch (err) {
        console.error(err);
        next(err);
    }
});

module.exports = router;