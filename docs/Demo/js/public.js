$(function() {
    $(".img").hover(
        function() {
            var $img = $(this).children("img");
            $img.stop().animate({
                margin: "-10px",
                width: "270px",
                height: "200px"
            }, "1500");
            $(".font").stop().animate({
                bottom: "40%",
                opacity: "1",
                filter: "alpha(opacity=100)"
            },"1500");
        },
        function() {
            $(this).children("img").stop().animate({
                margin: "0",
                width: "300px",
                height: "180px"
            }, "1500");
            $(".font").stop().animate({
                bottom: "0",
            },"1500",function(){
                $(this).css({"opacity":"0","filter":"alpha(opacity=0)"});
            });
        }
    );
});
