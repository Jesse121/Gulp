define('index', ['cookie', 'rsa','user', 'common', 'component', 'validate','lazyload'], function(require, exports, module) {

    var user = require('user');
    var common = require('common');
    var index = require('index');

    /***************************web2.0***************************/

    if ($(window).width() < 1280) {
        $('.footer.wrap').css('width','1000px');
        $('.ie7 .side_tool, .ie8 .side_tool').css({
            'margin-right': '0px',
            'right': '10px'
        })
    }
    

    var rsa = new (require('rsa').RSA);

    //5s后自动提示登录
    autoLoginCountDown(5);
    function autoLoginCountDown(time){
        var _time = time;
        if(_time == 0){
            if($('.home_logined').is(':hidden')){
                if( $(window.parent.document).find('iframe').attr('src') == '/user/showRegister' || $(window.parent.document).find('iframe').attr('src') == '/user/showLogin' || $('#login-form input').eq(0).is(':focus') || $('#login-form input').eq(1).is(':focus') ){
                }else{
                    user.showLoginPanel();
                }
                autoLoginCountDown(5);
            }
            return;
        }else{
            _time--;
            setTimeout(function(){autoLoginCountDown(_time)}, 1000);
        }
    }

    require('component')($); //共享给jquery
     //login placeholder
    $('.topLogin input[name=username]').gjPlaceHolder({
            fontSize: '13px',
            placeHolderColor: 'rgba(255,255,255,0.6)',
            top: 3,
            left: 36,
            inputTextColor: '#fff',
            content: '用户名/手机号/邮箱',
            relParent: $('.topLogin .input_wrap.first')
      })

    $('.topLogin input[name=password]').gjPlaceHolder({
            fontSize: '13px',
            placeHolderColor: 'rgba(255,255,255,0.6)',
            top: 3,
            left: 36,
            inputTextColor: '#fff',
            content: '密码',
            relParent: $('.topLogin .input_wrap').eq(1)
      })

    //forget password_icon
   var forget_hover_flag;
    $('.forget_password_icon').hover(function(){
        $('.forget_password_link').show();
        forget_hover_flag = 0;
    },function(){
        setTimeout(function(){
            $('.forget_password_link').mouseover(function(){
                forget_hover_flag = 1;
            })
            if(forget_hover_flag == 0){
                $('.forget_password_link').hide();
            }else{
                $('.forget_password_link').mouseout(function(){
                    $(this).hide();
                })
            }
        },500)
        
    })

    //login
    var isLogining = false;
    $('#login-form').validate({
        errorClass : 'login_error_hint',
        rules : {
            username : 'required',
            password : 'required'
        },
        messages : {
            username : '用户名不能为空',
            password : '密码不能为空'
        },
        showErrors : function() {},
        submitHandler : function() {
            if (isLogining) {
                return;
            };

            common.buttonTextLoading(this.submitButton, '登录中');
            isLogining = true;
            var me = this;

            common.getPublicKey(function(keyData) {
                var key = keyData['key'];
                var session_id = keyData['session_id'];
                rsa.setPublicKey(key);
                var data = {username : $('#login-form input[name=username]').val(), 'password' : rsa.encrypt($('#login-form input[name=password]').val()), remember : $('#autoLogin')[0].checked};
                $.ajax({
                    url : '/user/login/session_id/' + session_id,
                    type : 'post',
                    data : data,
                    dataType : 'json',
                    success : function(ret) {   
                        common.stopButtonTextLoading(me.submitButton, '登录');
                        isLogining = false;

                        if (ret.errno == 0) {
                            //layer.msg('登录成功', {icon: 6});
                            setTimeout(function(){top.location.reload()}, 300);
                        }
                        else if (ret.errno == 400){
                            for (var name in ret.data) {
                                layer.alert(ret.data[name]);break;
                            }
                        }
                        else if (ret.errno == 404){
                            //show bind panel
                            user.showBindPanel()
                        }
                        else{
                            $('.login_error_hint').show().text(ret.msg)
                        }
                    }
                })
            })
        }
       
    })

    
    //user center show or hide
    $('.center_btn_wrap,.user_info_wrap').mouseover(function(){
        $('.home_avatar_wrap').hide().siblings('.user_info_wrap').show();
    })
    .mouseout(function(){
        $('.home_avatar_wrap').show().siblings('.user_info_wrap').hide();
    })

    //register
    $(".index_register").click(user.showRegisterPanel);

    //edit nickname
    $('.center_btn_wrap').hover(function(){
         //hide edit nickname alert window
        $('.edit_nickname').hide();
    })

    $('.edit_nickname_btn').click(function(){
        if($('.edit_nickname').is(':hidden')){
            $('.edit_nickname').show();
        }else{
            $('.edit_nickname').hide();
        }
        
    })
    $('#doEditNickname').click(function() {
        var nickname = $.trim($('#newNickname').val());
        if (!nickname) {
            layer.alert('昵称不能为空');
            return;
        };
        $.ajax({
            url : '/user/updateUserInfo/scene/nickname',
            type : 'post',
            dataType : 'json',
            data : {nickname : nickname},
            success : function(resp) {
                if (resp.errno) {
                    layer.alert(resp.msg);
                    return;
                };
                layer.msg('昵称更新成功', {icon: 1});
                setTimeout(function() {location.reload();}, 3000);
            }
        })
      
    })

    $('#cancelEditNickname').click(function() {
        $(".edit_nickname").hide();         
    })

    //side rank
$('.sideBox').each(function(){
    var side_box = $(this),
        control_li = side_box.find('.side_title ul li');

    control_li.on('click',function(){
        var _this = $(this),
            type = _this.data('type');

        side_box.find('.side_rank').hide();
        if(type == 'day'){
            side_box.find('.last_day').show();
        }
        if(type == 'week'){
             side_box.find('.week').show();
        }
        if(type == 'month'){
             side_box.find('.month').show();
        }
        if(type == 'all'){
             side_box.find('.all').show();
        }

       control_li.removeClass('active');
        _this.addClass('active');
   })

})
   
   
    /**************************web2.0 end******************************/
    ;(function(){
        var slideImgList = $('.slide_img_contain .room-item dt img');
        for(var i=0; i<5; i++){
            slideImgList.eq(i).addClass('lazy');
        }
    })()
    
    $(".sidebar-room").hover(function(){
        $(this).addClass("on");
    }, function(){
        $(this).removeClass("on");
    });

    $("img.lazy").show().lazyload({ 
        effect : "fadeIn"
    });

    $("img.lazy_container").show().lazyload({ 
        effect : "fadeIn",
        event:"sporty"
    });

    $(".slide_img_wrap .next_img_btn ").on('click',function(){
        $("img.lazy_container").trigger("sporty");
    });

    $('.slide_img_wrap').exchangeImg({
        visibleNum : 4,
        singleDomWidth: 300,
        slideDomNum: 4
    });

    //热门推荐
    var page = 1;
        scrollLock = false; //滚动锁
    $('.click_load_more').on('click',function(){
        beginLoad();
    });
    $(window).on('scroll',function(){
        beginLoad();
    });

    function beginLoad(){
        var scroll_T = $(window).scrollTop(),
            screen_H =$(window).height(),
            doc_H = $(document).height(),
            offset_B = doc_H - scroll_T - screen_H;

        if(scrollLock || doc_H == screen_H){ return false;}

        if(offset_B < 200){

            scrollLock = true;
            //加载下一页
            page++;
            loadIndexPage(page);
        }
    }

    function loadIndexPage(page){
         $.ajax({
            url : '/indexV3/getRoomInfo',
            data : {page : page},
            type : 'post',
            dataType : 'json',
            beforeSend : function(){
                $('.index_load_hint').show();
            },
            success : function(resp) {
                scrollLock =  false;

                if(resp.errno == 0){
                    var data = resp.data;
                    //update(data);
                    updateNew(data);

                }else if (resp.errno == 100){

                    $('.index_load_hint').hide();
                    $('.click_load_more p').text('已加载所有数据').parent('.click_load_more').off();
                    $(window).off('scroll');
                }
            },
            complete : function(data){
                var responseText = eval('(' +data.responseText+ ')');

                if(responseText.errno ==  0){
                  $('.index_load_hint').hide();
                }
               
            },
            error : function(data){
                scrollLock =  false;
                $('.index_load_hint').text('数据加载出错'+data).show();
            }

        });
    }
    //加载房间页 old
    function update(data){
        var room = data.rooms,
            online_num = data.online_num ,
            index_dom = '';

        for(var i = 0 ; i < room.length ; i++){
            var room_info =  room[i],
                is_playing = '',
                viewer = '<span class="viewer" >' + room_info["onlineNum"] + '</span>';

            if(room_info["isPlaying"] == 1){
                is_playing = '<i class="on">直播</i>';
                viewer = '<span class="viewer" >' + (room_info["onlineNum"])+ '</span>';
            }
            index_dom += '<dl class="room-item" rid="' + room_info["rid"] + '">\
                <dt class="new">'+ is_playing +
                '<img src="http://static.guojiang.tv/pc/img/common/lazyload.jpg?v=0513" data-original = "' + room_info["headPic"] + '" class="lazy" width="210" >\
                    <noscript><img src="' + room_info["logo"] + '" width="210" ></noscript>\
                    <a class="top_mask" target="_blank" href="/' + room_info["mid"] + '">\
                        <div class="list_hover_mask"></div>\
                        <div class="start"></div>\
                    </a>\
                    <div class="mask_num">' + viewer +
                        '<span class="like" rid="' + room_info["rid"] + '">' + room_info["fansNum"] + '</span>\
                        <span class="list_mask"></span>\
                    </div>\
                </dt>\
                <dd>\
                    <a class="bigTitle room-link" target="_blank" href="/' + room_info["mid"] + '">\
                        <span class="list_nickname">' + room_info["nickname"] + ' </span>\
                        <span class="fr level_icon m_level_icon_' + room_info["moderatorLevel"] + ' "></span>\
                    </a>\
                    <p class="desc" title="' + room_info["announcement"] + '">' + room_info["announcement"] + '</p>\
                </dd>\
              </dl>\
            ';
           
        }
        $('.index_recommend').append(index_dom); 
        $("img.lazy").show().lazyload();
    }

    //加载房间页 星光
    var colors = ['#c3b19d','#a3a7b9','#8fb3bf','#bdaba9','#b7adad','#dbbfb3'];
    function updateNew(data){
        var room = data.rooms,
            online_num = data.online_num ,
            index_dom = '';

        for(var i = 0 , len = room.length ; i < len  ; i++){
            var room_info =  room[i],
                is_playing = '',
                viewer = '',
                randomIndex = parseInt(Math.random()*6);

            if(room_info["isPlaying"] == 1){
                viewer = '<span class="online-num"><i></i>' + room_info["onlineNum"] + '</span>';
            }

            index_dom += '<dl class="room-item" rid="' + room_info["rid"] + '">\
                              <dt style="background:'+ colors[randomIndex] +'">\
                                  <a target="_blank" href="/'+ room_info["mid"] +'">'
                                    + viewer +
                                    '<img data-original = "'+ room_info["headPic"] +'" src=""  class="lazy" alt="">\
                                    <div class="start">\
                                      <i></i>\
                                    </div>\
                                  </a>\
                              </dt>\
                              <dd>\
                                <div class="m-pic" style="background:'+ colors[randomIndex] +'">\
                                    <img class="lazy" data-original = "'+ room_info["headPic"] +'" src="" alt="">\
                                </div>\
                                <div class="m-desc">\
                                  <h3 class="nickname">'+ room_info["nickname"] +'</h3>\
                                  <p>'+ room_info["announcement"] +'</p>\
                                </div>\
                              </dd>\
                            </dl>';
           
        }
        $('.room-box').append(index_dom); 
        $("img.lazy").show().lazyload();
    }

    var visible_start = 0;
    var visible_end = 2;
    var sliding = false;
    var marginLeft = 0;
    curr_index = 0;

    ;(function(){
        //计算ul宽度
        var sliderLi = $('.sliderSmall li'),
            aLi = sliderLi.eq(0).width(),
            ul_w = (aLi + 24) * sliderLi.length;
        if(sliderLi.length >1 ){
            $('.sliderSmall ul').width(ul_w).show();
        }  
    }());
    
    exports.slide = function() {
        var num = $('#sliderItem .sliderItem').length;
        $('#sliderPanel li').click(function() {
            curr_index = $(this).index();
            doSlide($(this).index());
        })
        setInterval(function() {
            curr_index ++;
            if (curr_index >= num) {curr_index = 0};
            doSlide(curr_index);
        }, 10000);

        $('.sliderRight').click(function() {
            if(curr_index + 1 == num) {
                curr_index = -1;
            }
            doSlide(++curr_index);
        })

        $('.sliderLeft').click(function() {
            if(curr_index == 0) {
                curr_index = num;
            }
            doSlide(--curr_index);
        })

    }

    function doSlide(index) {
        if (sliding) {
            return;
        }
        var toIcon = $('#sliderPanel li:eq(' + index + ')');
        if (toIcon.hasClass('on')) {
            return false;
        };
        var current = $('#sliderPanel li.on');
        current.removeClass('on');
        toIcon.addClass('on');
        $('#sliderItem .sliderItem:eq(' + current.index() + ')').fadeOut(200, function() {
            $('#sliderItem .sliderItem:eq(' + index + ')').fadeIn(200);
        })

        if (index < visible_start) {
            marginLeft += (visible_start - index) * 95;
           // $('.sliderSmall ul').css('marginLeft', marginLeft + 'px');
            visible_start = index;
            visible_end = visible_start + 2;
        }
        else if (index > visible_end) {
            marginLeft += (visible_end - index) * 95;
            //$('.sliderSmall ul').css('marginLeft', marginLeft + 'px');
            visible_start = index - 2;
            visible_end = index;
        }

        sliding = false;

    }

  
})