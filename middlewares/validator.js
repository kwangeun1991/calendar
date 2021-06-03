/**
* 스케줄 등록 유효성 검사
*    -
*/
module.exports.validator = (req, res, next) => {
  const required = {
    color : '색상을 골라주세요.',
    title : '일정 제목을 입력해주세요.',
    startDate : '시작일을 입력해주세요.',
    endDate : '종료일을 입력해주세요.',
  };

  try {
    for (column in required) {
      if (!req.body[column]) {
        throw new Error(required[column]);
      }
    }

    /** 시작일, 종료일 기간 유효성 검증 */
    const startDate = req.body.startDate.split(".");
    const endDate = req.body.endDate.split(".");

    const startStamp = new Date(startDate[0], startDate[1], startDate[2]).getTime();
    const endStamp = new Date(endDate[0], endDate[1], endDate[2]).getTime();

    if (startStamp > endStamp) {
      throw new Error('시작일이 종료일보다 큽니다.');
    }

  } catch (err) {
    const data = {
      success : false,
      message : err.message,
    };
    return res.json(data);
    //return res.send(`<script>alert("${err.message}");</script>`);
    //console.log(err);
  }

  next(); // 유효성 검사 성공시 다음 미들웨어로 이동
};
