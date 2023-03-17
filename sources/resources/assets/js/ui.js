
//Global jQuery Selector
const $window = $(window);
const $document = $(document);
const $scrollBody = $("html,body");
const $appHeader = $(".app-header");
var $body = $("body");

//Global Variables
let winW = $window.outerWidth();
let winH = $window.outerHeight();
let docH = $document.outerHeight();
let st = $window.scrollTop();

// Scroll Top
var $btnTop = $('.js-btn-top');
var btnTopAction = {
    init: function() {
        btnTopAction.click();
    },
    click: function() {
        $btnTop.on('click', function(){
            gsap.to($('html, body'), { duration: 1, scrollTop: 0 });
        });
    }
}
if ($btnTop.length) btnTopAction.init();



// Scroll event
var $motionItem = $('.js-motion-item');
if($motionItem.length){
    $(window).on('scroll', function(){
        var st = $(window).scrollTop();
        var winHt = $(window).height();
        $motionItem.each( function(){
            var secTop = $(this).offset().top;
            var $this = $(this);
            if(st > secTop - (winHt/2)){
                $this.addClass('is-motion-active');
            }
            // 반응형 
            if (winW > 640) {
                if(st > secTop - (winHt/1.5)){
                    $this.addClass('is-motion-active');
                }
            }
           
        });
    });
}

// header / btn-top 
$(window).on('scroll', function(){
    var st = $(window).scrollTop();
    if ( st > 0 ){
        $appHeader.addClass('is-active')
        $btnTop.addClass('is-active')
    }
    else{
        $appHeader.removeClass('is-active')
        $btnTop.removeClass('is-active')
    }
});

//Layer [s]
var $body = $('body');
var $layerWrap = $('.layer-wrap');
var $layer = $layerWrap.find('.layer:visible');
var layerH;
var layerAction = {
    open : function(layerName,){
        var count = $layerWrap.find('.layer[data-layer-name=' + layerName + ']').length;
        if(count){  //layer exist       
            $layerWrap.find('.layer[data-layer-name=' + layerName + ']').parent().addClass('is-active');
            $body.addClass('is-hidden');    
            $layerWrap.find('.layer').each(function(){                
                if(layerName == $(this).attr('data-layer-name')){
                    $(this).addClass('is-active').find('.btn-layer-close').addClass('is-active');
                    $layerWrap.scrollTop(0);
                }else{
                    $(this).removeClass('is-active');
                }      
            });
        }else{  //layer does not exist
            $layerWrap.removeClass('is-active');
            $body.removeClass('is-hidden');
        }        
    },
    close : function(obj){
        $layer = $layerWrap.find('.layer:visible');
        $layerWrap.removeClass('is-active').removeAttr('style');
        $layer.removeClass('is-active').removeAttr('style').find('.btn-layer-close').removeClass('is-active');
        $body.removeClass('is-hidden');        
    },
    bind: function($obj){
        $obj.on('click', function(e){
            e.stopPropagation();
            var layerName = $(this).attr('data-layer-name');
            layerAction.open(layerName);
        });        
    },
    // unbind: function($obj){
    //     $obj.off('click');
    // }
};

//Close Layer
$('.layer').on('click','.btn-layer-close, .js-layer-close', function(e){
    e.stopPropagation();        
    layerAction.close();
}); 



$(document).ready(function(){
    layerAction.bind($('.js-layer-open'));
});