;
(function (win, doc, $) {
  var defaultOpt = {
    rotateNum: 5, //转盘转动圈数
    body: "", //大转盘整体的选择符或zepto对象
    disabledHandler: function () {}, //禁止抽奖时回调
    clickCallback: function () {}, //点击抽奖按钮,再次回调中实现访问后台获取抽奖结果,拿到抽奖结果后显示抽奖画面
    KinerLotteryHandler: function (deg) {} //抽奖结束回调
  };

  function KinerLottery(opts) {
    this.opts = $.extend(true, {}, defaultOpt, opts);
    this.doing = false;
    this.init();
  }
  KinerLottery.prototype.setOpts = function (opts) {
    this.opts = $.extend(true, {}, defaultOpt, opts);
    this.init();
  };
  KinerLottery.prototype.init = function () {
    var self = this;
    this.defNum = this.opts.rotateNum * 360; //转盘需要转动的角度
    // console.log(this.defNum);
    // alert(this.defNum);
    //点击抽奖
    var KinerLotteryBtn = document.getElementById('KinerLotteryBtn');
    KinerLotteryBtn.addEventListener("touchstart", function () {
      if ($(this).hasClass('start') && !self.doing) {
        self.opts.clickCallback.call(self);
      }
      else {
        var key = $(this).hasClass('no-start') ? "noStart" : $(this).hasClass('completed') ? "completed" : "illegal";
        self.opts.disabledHandler(key);
      }
    });
    $(this.opts.body).find('.KinerLotteryContent').get(0).addEventListener('webkitTransitionEnd', function () {
      self.doing = false;
      var deg = $(self.opts.body).attr('data-deg');
      if (self.opts.direction == 0) {
        $(self.opts.body).attr('data-deg', deg);
        //恢复转盘的角度，不恢复第二次转动效果不明显
        $(self.opts.body).find('.KinerLotteryContent').css({
          '-webkit-transition': 'none',
          'transition': 'none',
          '-webkit-transform': 'rotate(' + (deg) + 'deg)',
          'transform': 'rotate(' + (deg) + 'deg)'
        });
        self.opts.KinerLotteryHandler(deg);
      }
      else {
        $(self.opts.body).attr('data-deg', 360 - deg);
        $(self.opts.body).find('.KinerLotteryContent').css({
          '-webkit-transition': 'none',
          'transition': 'none',
          '-webkit-transform': 'rotate(' + (360 - deg) + 'deg)',
          'transform': 'rotate(' + (360 - deg) + 'deg)'
        });
        self.opts.KinerLotteryHandler(360 - deg);
      }
    });
  };
  KinerLottery.prototype.goKinerLottery = function (_deg) {
    if (this.doing) {
      return;
    }
    var deg = _deg + this.defNum;
    var realDeg = this.opts.direction == 0 ? deg : -deg;
    this.doing = true;
    $(this.opts.body).find('.KinerLotteryBtn').addClass('doing');
    $(this.opts.body).find('.KinerLotteryContent').css({
      '-webkit-transition': 'all 5s',
      'transition': 'all 5s',
      '-webkit-transform': 'rotate(' + (realDeg) + 'deg)',
      'transform': 'rotate(' + (realDeg) + 'deg)'
    });
    $(this.opts.body).attr('data-deg', _deg);
  };

  win.KinerLottery = KinerLottery;
})(window, document, $);
