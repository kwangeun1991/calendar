$(function() {
  $(".scheduler .day .no").click(function() {
    const stamp = $(this).closest(".day").data("stamp");
    const url = "/schedule?stamp=" + stamp;
    ke.layer.popup(url, 500, 400);
  });

  /** 스케줄 조회, 삭제 */
  $(".scheduler, .schedule").click(function() {
    if ($(this).hasClass('none')) {
      return;
    }

    const stamp = $(this).closest(".day").data("stamp");
    const color = $(this).data("color");
    url = `/schedule/view/${stamp}/${color}`;
    ke.layer.popup(url, 500, 400);
  });

  /** 스케줄 삭제 */
  $("body").on("click", ".schedule_view .delete", function() {
    if (!confirm('정말 삭제하시겠습니까?')) {
      return;
    }

    $obj = $(this).closest(".schedule_view");
    const period = $obj.data("period");
    const color = $obj.data("color");
    const url = "/schedule";

    const formData = new FormData();
    formData.period = period;
    formData.color = color;

    axios.delete(url, { params : formData })
          .then(function(res) {
            //console.log(res);
            if (res.data.success) {
              location.reload();
            } else {
              alert("삭제 실패");
            }
          })
          .catch(function(err) {
            console.error(err);
          });
  });

  /** 스케줄 수정 */
  $("body").on("click", ".schedule_view .modify", function() {
    $obj = $(this).closest(".schedule_view");
    const period = $obj.data("period");
    const color = $obj.data("color");
    const url = `/schedule/${period}/${color}`;
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
              if (res.data.message) {
                alert(res.data.message);
              } else {
                alert("스케줄 등록 실패하였습니다.");
              }              
            }
          })
          .catch(function() {
            console.error(err);
          });
  });

  /** 스케줄 색상 변경 */
  $("body").on("click", ".schedule_view input[type='radio']", function() {
    $obj =  $(this).closest(".schedule_view");
    const color = $(this).val();
    const period =$obj.data("period");
    const prevColor = $obj.data("color");
    if (color == prevColor) // 색상이 다른경우만 처리
      return;

    const params = {
      color : color,
      period : period,
      prevColor : prevColor,
    };

    axios.patch("/schedule", params)
        .then(function(res) {
          //console.log(res);
          if (res.data.success) {
            location.reload();
          } else {
            alert("스케줄 색상 변경 실패 or 이미 등록된 색상");
          }
        })
        .catch(function(err) {
          console.error(err);
        });
  });

  $.datepicker.setDefaults({
        dateFormat: 'yymmdd',
        prevText: '이전 달',
        nextText: '다음 달',
        monthNames: ['1월', '2월', '3월', '4월', '5월', '6월', '7월', '8월', '9월', '10월', '11월', '12월'],
        monthNamesShort: ['1월', '2월', '3월', '4월', '5월', '6월', '7월', '8월', '9월', '10월', '11월', '12월'],
        dayNames: ['일', '월', '화', '수', '목', '금', '토'],
        dayNamesShort: ['일', '월', '화', '수', '목', '금', '토'],
        dayNamesMin: ['일', '월', '화', '수', '목', '금', '토'],
        showMonthAfterYear: true,
        yearSuffix: '년'
    });

  /** datepicker */
  $("body").on("click focus", ".datepicker", function() {
    $(this).datepicker({
      dateFormat : "yy.mm.dd",
    });
  });


});
