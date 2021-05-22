익명 게시판을 만드는중입니다.

학교정보, 학교검색, 급식 조회, 학사 일정은 아래의 nnnlog님의 오픈소스를
이용하였습니다. 감사합니다!!!
https://github.com/nnnlog/neis

//웹 폰트 아이콘 주소
https://fontawesome.com/
https://www.flaticon.com/

무료 이미지 사이트
https://kor.pngtree.com/?source_id=1137&chnl=ggas&srid=1598531476&gpid=85147337420&asid=399611250442&ntwk=g&tgkw=aud-454159264999:kwd-298232662296&mchk=%EC%A0%80%EC%9E%91%EA%B6%8C%20%EC%97%86%EB%8A%94%20%EC%9D%B4%EB%AF%B8%EC%A7%80&mcht=b&pylc=1030760&dvic=c&gclid=EAIaIQobChMItJSRgYzd8AIV9sIWBR3kAAk9EAAYAyAAEgI94vD_BwE
https://pixabay.com/ko/illustrations/search/%EB%8F%99%ED%99%94/
https://undraw.co/illustrations
https://www.freepik.com/search?dates=any&format=search&from_query=%EB%8F%99%ED%99%94&page=1&query=fairy%20tale&sort=popular&type=vector


무료 아이콘 사이트 
https://fontawesome.com/icons/play-circle?style=solid
https://www.flaticon.com/search?word=start

//pm2 종료시 npx pm2 kill, 재시작시 npx pm2 reload all

데이터베이스 생성
1.데이터 베이스 root 비번 바꾸기
2.데이터 베이스 변동시 npx sequelize db:create

테이블 변경시 컬럼값 변경을 위해
table 을 지우고 다시만들기.

컬럼
show columns from 테이블명


해결해야할점
1.로그인 상태에서 로그인 페이지 로그인할때 오류
2.auth.js 에서 닉네임 이메일 중복 alert 만들기
3.프론트엔드


socket emit을 이용하자
1.socket 입장시 emit으로 포스트를 보내는거야
*randomState=0
*입장리스트에 자신이 있다면 삭제 

2. 상대찾기
*randomState=1
*입장리스트에 추가

3. 매칭성공시 
*randomState=0
*입장리스트에 자신이 있다면 삭제 

4.socket 퇴장시 emit으로 포스트를 보내는거야
*randomState=0
*입장리스트에 자신이 있다면 삭제 


axios로 포스트를 보내고 res.send('ok')시 부드러운 페이지 요청 가능?





todo
#4.redis socketio 멀티프로세스 해결하기
3.aws 람다? 데이터베이스? lightsail 배포하기, redis 이용
5.expo push notification
https://aspdotnet.tistory.com/2115
6.expo 리액트네이티브 출시 및 애드몹



-채팅 이미지 전송 버그 해결
-게시글 스크롤마다 렌더링하기
-알림,메시지 실시간 기능 구현 못함
-리액트를 사용하지않은 페이지 렌더링(SPA 사용 x)
1.이메일인증,비밀번호찾기
https://velog.io/@neity16/NodeJs-%EC%9D%B4%EB%A9%94%EC%9D%BC-%EC%9D%B8%EC%A6%9D-%EA%B5%AC%ED%98%84nodemailer
2.리액트 교과서 15장 하기
3.오목 구현
https://github.com/pawe9N/Gomoku
4.리액트 네이티브 출시 및 애드몹 애드센스
