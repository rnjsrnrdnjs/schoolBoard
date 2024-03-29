const express = require('express');
const { isLoggedIn, isNotLoggedIn, search } = require('./middlewares');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const { sequelize } = require('../models');
const Sequelize = require('sequelize');
const Op = Sequelize.Op; 

const neis = require('../neis/neis');
const SchoolType = require('../neis/types/SchoolType');

const {
    Post,
    School,
    User,
    Comment,
    Room,
    Chat,
    Plike,
    Pdlike,
    Clike,
    Cdlike,
    RoomList,
	RoomAll,RoomAllList,ChatAll,MyRoom,MyChat,Notice,Alarm,MyChatRead
} = require('../models');
const router = express.Router();

try {
    fs.readdirSync('uploads');
} catch (error) {
    console.error('uploads 폴더가 없어 uploads 폴더를 생성합니다.');
    fs.mkdirSync('uploads');
}

const upload = multer({
    storage: multer.diskStorage({
        destination(req, file, cb) {
            cb(null, 'uploads/');
        },
        filename(req, file, cb) {
            const ext = path.extname(file.originalname);
            cb(null, path.basename(file.originalname, ext) + Date.now() + ext);
        },
    }),
    limits: { fileSize: 5 * 1024 * 1024 },
});

router.post('/img', isLoggedIn, upload.single('img'), (req, res) => {
    res.json({ url: `/img/${req.file.filename}` });
});
router.post('/randomTalk/img', isLoggedIn, upload.single('img'), (req, res) => {
     try {
		 return res.json({ url: `/img/${req.file.filename}` });
  	} catch (error) {
  	  console.error(error);
  	  next(error);
  	}
});


const upload2 = multer();
router.post('/profile/img', isLoggedIn, upload.single('img'), async (req, res, next) => {
    try {
        const filename = 'img/' + req.file.filename;
        await User.update(
            {
                profile: filename,
            },
            {
                where: { id: req.user.id },
            }
        );
        res.render('setting/setting');
    } catch (error) {
        console.error(error);
        next(error);
    }
});
router.post('/room/:id/img', isLoggedIn, upload.single('img'), async (req, res, next) => {
    try {
        const chat = await Chat.create({
            UserId: req.user.id,
            RoomId: req.params.id,
            user: req.user.nick,
            img: req.file.filename,
        });
        const chat2 = await Chat.findOne({
            where: {
                id: chat.id,
            },
            include: [
                {
                    model: User,
                },
            ],
        });
        req.app.get('io').of('/chat').to(req.params.id).emit('chat', chat2);
        res.send('ok');
    } catch (error) {
        console.error(error);
        next(error);
    }
});
router.post('/roomAll/:id/img', isLoggedIn, upload.single('img'), async (req, res, next) => {
    try {
        const chat = await ChatAll.create({
            UserId: req.user.id,
            RoomAllId: req.params.id,
            user: req.user.nick,
            img: req.file.filename,
        });
        const chat2 = await ChatAll.findOne({
            where: {
                id: chat.id,
            },
            include: [
                {
                    model: User,
                },
            ],
        });

        req.app.get('io').of('/chatAll').to(req.params.id).emit('chat', chat2);
        res.send('ok');
    } catch (error) {
        console.error(error);
        next(error);
    }
});
router.post('/MyRoom/:id/img', isLoggedIn, upload.single('img'), async (req, res, next) => {
    try {
        const chat = await MyChat.create({
            UserId: req.user.id,
            MyRoomId: req.params.id,
            user: req.user.nick,
            img: req.file.filename,
        });
		await MyChatRead.create({
			MyChatId:chat.id,
			readId:req.user.id,
		});
        const chat2 = await MyChat.findOne({
            where: {
                id: chat.id,
            },
            include: [
                {
                    model: User,
                },
            ],
        });
        req.app.get('io').of('/myChat').to(req.params.id).emit('chat', chat2);
		req.app.get('io').of('/myChat').emit('newChat',chat);
        res.send('ok');
    } catch (error) {
        console.error(error);
        next(error);
    }
});

router.post('/', isLoggedIn, upload2.none(), async (req, res, next) => {
    try {
        if (req.body.Pid) {
            if (req.body.url) {
                const post = await Post.update(
                    {
                        title: req.body.title,
                        category: req.body.category,
                        content: req.body.content,
                        img: req.body.url,
                    },
                    {
                        where: {
                            id: req.body.Pid,
                        },
                    }
                );
            } else {
                const post = await Post.update(
                    {
                        title: req.body.title,
                        category: req.body.category,
                        content: req.body.content,
                    },
                    {
                        where: {
                            id: req.body.Pid,
                        },
                    }
                );
            }
        } else {
            const post = await Post.create({
                title: req.body.title,
                category: req.body.category,
                content: req.body.content,
                img: req.body.url,
                like: 0,
                dislike: 0,
                UserId: req.user.id,
                SchoolId: req.user.SchoolId,
            });
        }
        res.redirect(`/main/${req.body.category}`);
    } catch (error) {
        console.error(error);
        next(error);
    }
});
router.post('/notice/add', isLoggedIn, upload2.none(), async (req, res, next) => {
    try {
		const {title,content,url}=req.body;
		const makeNotice=await Notice.create({
			title:title,
			content:content,
			img:url,
		});
		res.redirect('/notice');
    } catch (error) {
        console.error(error);
        next(error);
    }
});

router.post('/comment', isLoggedIn, async (req, res, next) => {
    try {
        const Pid = await req.body.Pid;
		const post=await Post.findOne({
			include:[{
				model:User,
			}],
			where:{
				id:Pid,
			},
		});
		const comment = await Comment.create({
            content: req.body.content,
            like: 0,
            dislike: 0,
            UserId: req.user.id,
            PostId: Pid,
        });
		const findComment=await Comment.findAll({
			where:{
				PostId:Pid,
			},
		});
		const hashUser=[];
		await Promise.all( findComment.map(async(comment)=>{
			const user=await User.findOne({
				where:{
					id:comment.UserId,
				},
			});
			hashUser[user.id]=await user;
		}));
		await Promise.all( hashUser.map(async(user)=>{
			console.log(user.id+" @");
				const alarm=await Alarm.create({
					content:`${req.user.nick} 님이 ${post.User.nick} 님의 게시물에 댓글을 달았어요!`,
					src:`/comment/${Pid}`,
					read:"false",
					UserId:user.id,
				});
		}));
		if(!hashUser[post.User.id]){
			const alarm=await Alarm.create({
				content:`${req.user.nick} 님이 ${post.User.nick} 님의 게시물에 댓글을 달았어요!`,
				src:`/comment/${Pid}`,
				read:"false",
				UserId:post.User.id,
			});
		}
		res.redirect(`/comment/${Pid}`);
    } catch (error) {
        console.error(error);
        next(error);
    }
});
router.post('/comment/like/:id', isLoggedIn, async (req, res, next) => {
    try {
        const chk = await Clike.findOne({
            where: {
                CommentId: req.body.Cid,
                UserId: req.user.id,
            },
        });
        if (chk) {
            await Comment.decrement({ like: 1 }, { where: { id: req.body.Cid } });
            await Clike.destroy({
                where: {
                    CommentId: req.body.Cid,
                },
            });
        } else {
            await Comment.increment({ like: 1 }, { where: { id: req.body.Cid } });
            await Clike.create({
                UserId: req.user.id,
                CommentId: req.body.Cid,
            });
        }
        res.redirect(`/comment/${req.params.id}`);
    } catch (error) {
        console.error(error);
        next(error);
    }
});
router.post('/comment/dislike/:id', isLoggedIn, async (req, res, next) => {
    try {
        const chk = await Cdlike.findOne({
            where: {
                CommentId: req.body.Cid,
                UserId: req.user.id,
            },
        });
        if (chk) {
            await Comment.decrement({ dislike: 1 }, { where: { id: req.body.Cid } });
            await Cdlike.destroy({
                where: {
                    CommentId: req.body.Cid,
                },
            });
        } else {
            await Comment.increment({ dislike: 1 }, { where: { id: req.body.Cid } });
            await Cdlike.create({
                UserId: req.user.id,
                CommentId: req.body.Cid,
            });
        }
        res.redirect(`/comment/${req.params.id}`);
    } catch (error) {
        console.error(error);
        next(error);
    }
});
router.post('/post/like/:id', isLoggedIn, async (req, res, next) => {
    try {
        const chk = await Plike.findOne({
            where: {
                PostId: req.params.id,
                UserId: req.user.id,
            },
        });
        if (chk) {
            await Post.decrement({ like: 1 }, { where: { id: req.params.id } });
            await Plike.destroy({
                where: {
                    PostId: req.params.id,
                },
            });
        } else {
            await Post.increment({ like: 1 }, { where: { id: req.params.id } });
            await Plike.create({
                UserId: req.user.id,
                PostId: req.params.id,
            });
        }
        res.redirect(`/comment/${req.params.id}`);
    } catch (error) {
        console.error(error);
        next(error);
    }
});
router.post('/post/dislike/:id', isLoggedIn, async (req, res, next) => {
    try {
        const chk = await Pdlike.findOne({
            where: {
                PostId: req.params.id,
                UserId: req.user.id,
            },
        });
        if (chk) {
            await Post.decrement({ dislike: 1 }, { where: { id: req.params.id } });
            await Pdlike.destroy({
                where: {
                    PostId: req.params.id,
                },
            });
        } else {
            await Post.increment({ dislike: 1 }, { where: { id: req.params.id } });
            await Pdlike.create({
                UserId: req.user.id,
                PostId: req.params.id,
            });
        }
        res.redirect(`/comment/${req.params.id}`);
    } catch (error) {
        console.error(error);
        next(error);
    }
});
router.post('/join/:find', isNotLoggedIn, async (req, res, next) => {
    try {
		res.locals.schoolName=req.params.find;
        res.render('join', {
            find: req.params.find,
            code: req.body.code,
        });
    } catch (err) {
        console.error(err);
        next(err);
    }
});
router.post('/manito/:find', isLoggedIn, async (req, res, next) => {
    try {
		const manito=await User.findAll({
			where:{
				code:req.params.find,
				sexual:req.body.sexual,
				id:{
			      [Op.ne]: req.user.id,
				},
			},
		});
		if(!manito[0]){
			return res.redirect('/manitoTalk?Error=가입된 회원이없습니다.');
		}
		const idx=Math.floor(Math.random()*manito.length);
		const roomFind=await MyRoom.findOne({
			where:{
				kind:"manito",
				[Op.or]:[ {[Op.and]:[{member1:manito[idx].id}, {member2: req.user.id}]},{[Op.and]:[{member1: req.user.id}, {member2: manito[idx].id}]}],
				//[Op.or]: [{member1: manito[idx].id}, {member2: manito[idx].id}],	
			}
		});
		if(!roomFind){
			const room=await MyRoom.create({
				kind:"manito",
				member1:req.user.id,
				member2:manito[idx].id,
				UserId:req.user.id,
			});
			return res.redirect(`/myRoom/${room.id}`);
		}
		return res.redirect(`/myRoom/${roomFind.id}`);
		
    } catch (err) {
        console.error(err);
        next(err);
    }
});
router.post('/individualChat/:id', isLoggedIn, async (req, res, next) => {
    try {
		const roomFind=await MyRoom.findOne({
			where:{
				kind:"individual",
				[Op.or]:[ {[Op.and]:[{member1: req.user.id}, {member2: req.params.id}]},{[Op.and]:[{member1: req.params.id}, {member2: req.user.id}]}],
				//[Op.or]: [{member1: req.params.id}, {member2: req.params.id}],	
			}
		});
		if(!roomFind){
			const room=await MyRoom.create({
				kind:"individual",
				member1:req.user.id,
				member2:req.params.id,
				UserId:req.user.id,
			});
			return res.redirect(`/myRoom/${room.id}`);
		}
		return res.redirect(`/myRoom/${roomFind.id}`);
    } catch (err) {
        console.error(err);
        next(err);
    }
});


router.post('/school/search', isNotLoggedIn, async (req, res, next) => {
    try {
        const result = await neis.searchSchool(req.body.schoolname, req.body.region);
        result.forEach(async (school) => {
            const find = await School.findOne({
                where: {
                    code: school.code,
                },
            });
            if (find === null) {
                const detail = await neis
                    .createSchool(neis.REGION[school.edu], school.code, school.kind)
                    .getSchoolDetail();
                await School.create({
                    edu: neis.REGION[detail.edu],
                    code: detail.code,
                    kind: detail.kind,
                    name: detail.name,
                    addr: detail.addr,
                    tellNum: detail.tellNum,
                    homepage: detail.homepage,
                    coeduScNm: detail.coeduScNm,
                    fondScNm: detail.fondScNm,
                    teacherCnt: detail.teacherCnt,
                    level: 0,
                });
            }
        });
        await res.render('findSchool', {
            result: result,
        });
    } catch (err) {
        console.error(err);
        next(err);
    }
});

router.post('/manito/school/search', isLoggedIn, async (req, res, next) => {
    try {
        const result = await neis.searchSchool(req.body.schoolname, req.body.region);
        result.forEach(async (school) => {
            const find = await School.findOne({
                where: {
                    code: school.code,
                },
            });
            if (find === null) {
                const detail = await neis
                    .createSchool(neis.REGION[school.edu], school.code, school.kind)
                    .getSchoolDetail();
                await School.create({
                    edu: neis.REGION[detail.edu],
                    code: detail.code,
                    kind: detail.kind,
                    name: detail.name,
                    addr: detail.addr,
                    tellNum: detail.tellNum,
                    homepage: detail.homepage,
                    coeduScNm: detail.coeduScNm,
                    fondScNm: detail.fondScNm,
                    teacherCnt: detail.teacherCnt,
                    level: 0,
                });
            }
        });
        await res.render('chat/manitoTalk', {
            result: result,
        });
    } catch (err) {
        console.error(err);
        next(err);
    }
});


router.post('/schoolMake', isLoggedIn, async (req, res, next) => {
    try {
        const newRoom = await Room.create({
            title: req.body.title,
            owner: res.locals.user.nick,
            SchoolId: res.locals.school.id,
            password: req.body.password,
            UserId: req.user.id,
            cnt: 1,
        });
        const dataRoom = await Room.findOne({
            where: {
                id: newRoom.id,
            },
            include: {
                model: User,
            },
        });
        await RoomList.create({
            UserId: req.user.id,
            RoomId: newRoom.id,
        });
        const io = req.app.get('io');
        //io.of('/room').emit('newRoom', dataRoom);
        res.redirect(`/room/${newRoom.id}?password=${req.body.password}`);
    } catch (err) {
        console.error(error);
        next(error);
    }
});
router.post('/allMake', isLoggedIn, async (req, res, next) => {
    try {
        const newRoom = await RoomAll.create({
            title: req.body.title,
            owner: res.locals.user.nick,
            password: req.body.password,
            UserId: req.user.id,
            cnt: 1,
        });
        const dataRoom = await RoomAll.findOne({
            where: {
                id: newRoom.id,
            },
            include: {
                model: User,
            },
        });
        await RoomAllList.create({
            UserId: req.user.id,
            RoomAllId: newRoom.id,
        });
        const io = req.app.get('io');
        io.of('/roomAll').emit('newRoom', dataRoom);
        res.redirect(`/roomAll/${newRoom.id}?password=${req.body.password}`);
    } catch (err) {
        console.error(error);
        next(error);
    }
});



router.post('/room/:id/chat', isLoggedIn, async (req, res, next) => {
    try {
        const chat = await Chat.create({
            user: req.user.nick,
            UserId: req.user.id,
            RoomId: req.params.id,
            chat: req.body.chat,
        });
        const chat2 = await Chat.findOne({
            where: {
                id: chat.id,
            },
            include: [
                {
                    model: User,
                },
            ],
        });
        req.app.get('io').of('/chat').to(req.params.id).emit('chat', chat2);
        res.send('ok');
    } catch (err) {
        console.error(error);
        next(error);
    }
});
router.post('/roomAll/:id/chat', isLoggedIn, async (req, res, next) => {
    try {
        const chat = await ChatAll.create({
            user: req.user.nick,
            UserId: req.user.id,
            RoomAllId: req.params.id,
            chat: req.body.chat,
        });
        const chat2 = await ChatAll.findOne({
            where: {
                id: chat.id,
            },
            include: [
                {
                    model: User,
                },
            ],
        });

        req.app.get('io').of('/chatAll').to(req.params.id).emit('chat',chat2);
        res.send('ok');
    } catch (err) {
        console.error(error);
        next(error);
    }
});
router.post('/myRoom/:id/chat', isLoggedIn, async (req, res, next) => {
    try {
        const chat = await MyChat.create({
            user: req.user.nick,
            UserId: req.user.id,
            MyRoomId: req.params.id,
            chat: req.body.chat,
        });
        const chat2 = await MyChat.findOne({
            where: {
                id: chat.id,
            },
            include: [
                {
                    model: User,
                },
            ],
        });
        req.app.get('io').of('/myChat').to(req.params.id).emit('chat', chat2);
		req.app.get('io').of('/myChat').emit('newChat',chat);
        res.send('ok');
    } catch (err) {
        console.error(error);
        next(error);
    }
});
router.post('/myRoom/:id/read', isLoggedIn, async (req, res, next) => {
    try {
		await MyChatRead.create({
			MyChatId:req.body.id,
			readId:req.user.id,
		});
		res.send('ok');
    } catch (err) {
        console.error(error);
        next(error);
    }
});

router.post('/room/:id/getout', isLoggedIn, async (req, res, next) => {
    try {
        const io = req.app.get('io');
        await Chat.create({
            user: 'system',
            chat: `${req.user.nick} 님이 나가셨습니다.`,
            UserId: req.user.id,
            RoomId: req.params.id,
        });
        io.of('/chat')
            .to(req.params.id)
            .emit('exit', {
                user: 'system',
                chat: `${req.user.nick} 님이 나가셨습니다.`,
            });
        await Room.decrement({ cnt: 1 }, { where: { id: req.params.id } });
        await RoomList.destroy({
			where:{
            UserId: req.user.id,
            RoomId: req.params.id,
			},
        });
        await res.redirect('/schoolTalk');
    } catch (err) {
        console.error(error);
        next(error);
    }
});
router.post('/roomAll/:id/getout', isLoggedIn, async (req, res, next) => {
    try {
        const io = req.app.get('io');
        await ChatAll.create({
            user: 'system',
            chat: `${req.user.nick} 님이 나가셨습니다.`,
            UserId: req.user.id,
            RoomAllId: req.params.id,
        });
        io.of('/chatAll')
            .to(req.params.id)
            .emit('exit', {
                user: 'system',
                chat: `${req.user.nick} 님이 나가셨습니다.`,
            });
        await RoomAll.decrement({ cnt: 1 }, { where: { id: req.params.id } });
        await RoomAllList.destroy({
			where:{
            UserId: req.user.id,
            RoomAllId: req.params.id,
			},
        });
        await res.redirect('/allTalk');
    } catch (err) {
        console.error(error);
        next(error);
    }
});
router.post('/random/readyon', isLoggedIn, async (req, res, next) => {
    try {
		console.log('on');
		await User.update({
			ramdomState:1,
		},{
			where:{
				id:req.user.id,
			},
		});
		await RoomRandomList.create({
			UserId:req.user.id,
		});
		return res.send('ok');
    } catch (err) {
        console.error(err);
        next(err);
    }
});
router.post('/random/readyoff', isLoggedIn, async (req, res, next) => {
    try {
		console.log('off');
		await User.update({
			ramdomState:0,
		},{
			where:{
				id:req.user.id,
			},
		});
		await RoomRandomList.destroy({
			where:{
				UserId:req.user.id,
			},
		});
		return res.send('ok');
    } catch (err) {
        console.error(err);
        next(err);
    }
});

module.exports = router;