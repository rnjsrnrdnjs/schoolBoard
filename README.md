익명 게시판을 만드는중입니다.

학교정보, 학교검색, 급식 조회, 학사 일정은 아래의 nnnlog님의 오픈소스를
이용하였습니다. 감사합니다!!!
https://github.com/nnnlog/neis

//웹 폰트 아이콘 주소
https://fontawesome.com/
https://www.flaticon.com/

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
-채팅 이미지 전송 버그 해결
-게시글 스크롤마다 렌더링하기
-알림,메시지 실시간 기능 구현 못함
-리액트를 사용하지않은 페이지 렌더링(SPA 사용 x)
1.이메일인증,비밀번호찾기
2.리액트 교과서 15장 하기
3.오목 구현
4.리액트 네이티브 출시 및 애드몹 애드센스
