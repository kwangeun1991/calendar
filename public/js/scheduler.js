$(function() {
  $(".scheduler .day").click(function() {
    const stamp = $(this).data("stamp");
    const url = "/schedule?stamp=" + stamp;
    ke.layer.popup(url, 500, 400);
  });

  /** 스케줄 저장 */
  $("body").on("click", "#frmSchedule .save", function() {
    /**
    * 1. 유효성 검사
    *    - 제목, 시작일, 종료일
    * 2. axios - 저장처리요청
    * 3. DB 처리
    */
    // 유효성검사 3가지 ok~
    try {
      if (!frmSchedule.title.value) {
        throw new Error("일정 제목을 입력하세요.");
      }

      if (!frmSchedule.startDate.value) {
        throw new Error("시작일을 입력하세요.");
      }

      if (!frmSchedule.endDate.value) {
        throw new Error("종료일을 입력하세요.");
      }
    } catch (err) {
      alert(err.message);
      return;
    }

    /** 스케줄 저장 양식 -> querystring 형태로 변경 */
    const qs = $("#frmSchedule").serialize();
    //console.log(qs);

    /** axios로 ajax 처리 */
    axios.post('/schedule', qs)
          .then(function(res) {
            //console.log(res);
            if (res.data.success) {
              location.reload();
            } else {
              alert("스케줄 등록 실패하였습니다.");
            }
          })
          .catch(function() {
            console.error(err);
          });
  });
});
