
// Cloud Float...
    var $main = $cloud = mainwidth = null;
    var offset1 = 450;
	var offset2 = 50;
	var offset3 = 700;
	
	var offsetbg = 0;

    $(document).ready(function() {
        $main = $("#mainBody");
        $body = $("body");
        $cloud1 = $("#cloud1");
        $cloud2 = $("#cloud2");
        $cloud3 = $("#cloud3");
        mainwidth = $main.outerWidth();
        
        var flutter = setInterval(function flutter() {
            if (offset1 >= mainwidth) {
                offset1 =  -580;
            }
            if (offset2 >= mainwidth) {
                 offset2 =  -480;
            }
            if (offset3 >= mainwidth) {
                 offset3 =  -380;
            }
            
            offset1 += 2;
            offset2 += 1.5;
            offset3 += 1;
            $cloud1.css("background-position", offset1 + "px 100px")
            
            $cloud2.css("background-position", offset2 + "px 250px")
            
            $cloud3.css("background-position", offset3 + "px 560px")
        }, 70);
        
        
        var bg = setInterval(function bg() {
            if (offsetbg >= mainwidth) {
                offsetbg =  -180;
            }
    
            offsetbg += 0.9;
            $body.css("background-position", -offsetbg + "px 0")
        }, 90 );

        var main = document.getElementsByTagName("main");

        if (main.length > 0) {
            clearInterval(flutter);
            clearInterval(bg);
        }
    });
    
	