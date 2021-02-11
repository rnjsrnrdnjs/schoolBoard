const neis = require("./neis/neis");

neis.searchSchool('동래').then(d => {
	d.forEach(school => {
		console.log("학교 명: " +
			school.name + "\n학교 코드 : " + school.code +
			"\n학교 위치 : " + school.addr + "\n학교 교육청 코드 : " + school.edu +
			"\n학교 유형 : " + neis.TYPE[school.kind] + "\n\n"
		);
	});
});