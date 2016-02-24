//
/*
      

            初始化参数
            初始化UI
            初始化iScroll
            滚动iScroll修改UI
*/
/*
  scroll : iScroll
  index  : selectIndex
  type   : yyyy
  start  : 1970
  end    : 2020
  refresh();
*/


(function ($) {
  $.fn.KyjPicker = function (options,Ycallback,Ncallback) {
    var that = $(this);
    var itemsArray = new Array();   //存放有几列数据的数组

    $.fn.KyjPicker.defaultOptions = {
      title:"",
      format:"",
      initData:null,
      beginyear:1970,
      endyear  :2050,
      startyear:2015,
      currdate :false,
	    subHeight:0,
      formatUnit:false
    }
    var opts = $.extend( true, {}, $.fn.KyjPicker.defaultOptions, options);

    initParam();
    initUI();
    initCss();
    initScroll();
    initAction();

    $("#mDatePicker").css({"bottom":"0"});

    function initParam () {
      var formatItems = opts.format=="" ? opts.initData : opts.format.split(',');
      var dataItems=null;
      var dataItem=[];

      var idIndex=0;
      for (var i in formatItems) {
        /*返回一个对象*/
         idIndex++;
         if(opts.initData!=null && opts.format!=''){ 
               dataItems=opts.initData;
               for(var j in dataItems){
                   dataItem=dataItems[j];
               }
          }
        var item =  itemObject(formatItems[i],idIndex,dataItem);
        if (item != null ) itemsArray.push(item);
      }

    }

    function initUI(){
      $("#mDateMask").show();
      $("#mDateMask").html(pickerContent());
      var pickerHtml = $("#mDatePicker").html();
      for (var i in itemsArray) {
        var item =  itemsArray[i];
        item.bulidUI();
        pickerHtml += item.ui;
      }
      $("#mDatePicker").html(pickerHtml);
      /*动态改变元素的高度*/
	    opts.subHeight=$("#"+item.pickerName).find("ul li").height();
      if (opts.formatUnit) {
         var _flgTop=$(".picker-flg").position().top;
          $(".picker-flg").css({top:(_flgTop+opts.subHeight)});
          $("#mDatePicker").height($("#mDatePicker").height()+opts.subHeight);
      };
    }
   function initCss () {
      $("#mDatePicker div").css({"width":100/(itemsArray.length)+"%"});
    }

    function initScroll () {
      for (var i in itemsArray) {
        var item = itemsArray[i];
	     
        item.refresh();
      }
      if (opts.currdate) {
        setScrollDate(new Date());
      }
    }
   /*设置滚动的日期*/
    function setScrollDate (datetime) {
      var year=parseInt((datetime.getFullYear()));
      var month=parseInt(datetime.getMonth())+1;
      var day=parseInt(datetime.getDate());
      var hour=parseInt(datetime.getHours());
      var minutes=parseInt(datetime.getMinutes());
      var second =parseInt(datetime.getSeconds());

      for (var i in itemsArray) {
        var item = itemsArray[i];
        if (item.type == "yyyy") {
          item.index = year - item.min + 1;
        }else if (item.type == "MM") {
          item.index = month - item.min + 1;
        }else if (item.type == "dd") {
          item.index = day - item.min + 1;
        }else if (item.type == "HH") {
          item.index = hour - item.min + 1;
        }else if (item.type == "mm") {
          item.index = minutes - item.min + 1;
        }else if (item.type == "ss") {
          item.index = second - item.min + 1;
        }
        item.refresh();
      }
    }
  /*初始化事件*/
    function initAction(){
      $("#mDatePicker .finish-btn").click(function(){
        $("#mDatePicker").css({"bottom":"-275px"});
        setTimeout('$("#mDateMask").hide()',500);
        var resultStr = "";
        for (var i in itemsArray) {
          var item = itemsArray[i];
          resultStr += item.toText();
        }
        if (Ycallback == undefined) {
          if (that.is('input')) {
            that.val(resultStr);
          }else {
            that.html(resultStr);
          }
        }else {
          Ycallback(resultStr);
        }
      });
    }
    /*调用iscroll 并获取被选值的下标*/
    function newPicker(idStr) {
      return new iScroll(idStr,{snap:"li",vScrollbar:false,hScroll:false,
          onScrollEnd:function () {
            var selectIndex = Math.round(this.y/(-opts.subHeight)) + 1;

            for (var i in itemsArray) {
              var item = itemsArray[i];
              if (item.pickerName == idStr ) {
                item.index = selectIndex;
                if (item.type == "yyyy" || item.type == "MM") {
                  adjustDays();
                }
              }
            }
          }});
    }
    /*调准时间*/
    function adjustDays () {
      var year = parseInt((new Date().getFullYear()));
      var month = parseInt((new Date().getMonth()));
      var yearItem,monthItem,dayItem;
      for (var i in itemsArray) {
        var item = itemsArray[i];
        if (item.type == "yyyy") {
          yearItem = item;
          year     = item.min + item.index -1 ;
        }else if (item.type == "MM") {
          monthItem = item;
          month     = item.min + item.index -1 ;
        }else if (item.type == "dd") {
          dayItem = item;
        }
      }
      if (dayItem == null)return;
      var days = new Date(year,month,0).getDate();
      if (days != dayItem.max) {
        dayItem.reSetMax(days);
      }
    }

    function itemObject (type,idIndex,dataItem) {
      var obj = new Object();
      /*判断是否传了初始值*/
      obj.type = typeof type=="object" ? "initData" : type;
      obj.index = 1;
      /*判断格式*/
      switch (obj.type) {
        case "yyyy":
          obj.pickerName = "yearPicker";
          obj.min = opts.beginyear;
          obj.max = opts.endyear;
          obj.unit = '年';
          break;
        case "MM":
          obj.pickerName = "monthPicker";
          obj.min = 1;
          obj.max = 12;
          obj.unit = '月';
          break;
        case "dd":
          obj.min = 1;
          obj.max = 31;
          obj.pickerName = "dayPicker";
          obj.unit = '日';
          break;
        case "am":
          obj.ui = initAmUI();
          obj.min = 1;
          obj.max = 2;
          obj.pickerName = "amPicker";
          break;
        case "HH":
          obj.min = 0;
          obj.max = 24;
          obj.pickerName = "hhPicker";
          obj.unit = '时';
          break;
        case "mm":
          obj.min = 0;
          obj.max = 59;
          obj.pickerName = "mmPicker";
          obj.unit = '分';
          break;
        case "ss":
          obj.min = 0;
          obj.max = 59;
          obj.pickerName = "ssPicker";
          obj.unit = '秒';
          break;
        case "initData":
            obj.min=0;
            obj.max=type.length-1;
            obj.pickerName="initData"+idIndex;
            obj.dataList=type;
            obj.unit="";
           break;
         case "shi":
            obj.min=0;
            obj.max=dataItem.length-1;
            obj.pickerName="shi";
            obj.dataList=dataItem;
            obj.unit="室";
           break;
           case "ting":
            obj.min=0;
            obj.max=dataItem.length-1;
            obj.pickerName="ting";
            obj.dataList=dataItem;
            obj.unit="厅";
           break;
           case "wei":
            obj.min=0;
            obj.max=dataItem.length-1;
            obj.pickerName="wei";
            obj.dataList=dataItem;
            obj.unit="卫";
           break;
            case "chu":
            obj.min=0;
            obj.max=dataItem.length-1;
            obj.pickerName="chu";
            obj.dataList=dataItem;
            obj.unit="厨";
           break;  
            case "yangtai":
            obj.min=0;
            obj.max=dataItem.length-1;
            obj.pickerName="yangtai";
            obj.dataList=dataItem;
            obj.unit="阳台";
           break;      
         default :
           return null;
          break;
      }
      /*构建视图*/
      obj.bulidUI = function() {
        if (obj.ui == null) {
          obj.ui = initItemsUI(obj.pickerName,obj.unit,obj.min,obj.max,obj.dataList);
        }
      }
     /*重新定位选中的值*/  
     obj.refresh = function() {
        if (obj.picker == null) {
          obj.picker = newPicker(obj.pickerName);
        }
        obj.picker.refresh();
        obj.picker.scrollTo(0,opts.subHeight*(obj.index-1),400,true);
      }
      /*获取选中的值*/
    obj.toText = function () {
        if (obj.type == "am") {
          if (obj.index == 1) {return "上午";
          }else if(obj.index == 2){return "下午";}
        }else if(obj.type=="initData"){
            return obj.dataList[obj.min + obj.index-1]+obj.unit;
        }else{
          return (obj.min + obj.index-1) + obj.unit;
        }
      }
    /*重新设置最大值*/  
   obj.reSetMax = function (num) {
        obj.max = num;
        $("#"+obj.pickerName).find("ul li").each(function(i){
          if (i < num+1) {$(this).show();}else {$(this).hide();}
        });
        $("#"+obj.pickerName).find("ul li:last").show();
        obj.picker.refresh();
      }
      return obj;
    }
    /*拼音转换成汉字*/
    function formatPinyin(str){
          var formatPinyin='';
         switch(str){
           case "shi":
               formatPinyin="室";
                break;
           case "ting":
               formatPinyin="厅";
                break;
           case "wei":
               formatPinyin="卫";
                break;
           case "chu":
               formatPinyin="厨";
                break;
		   case "yangtai":
               formatPinyin="阳台";
                break;		
            default:
                 return null;
                 break

             }
           return formatPinyin;  
         }
    /*初始化头部*/
    function pickerContent() {
      var _unitHtml='',title = opts.title;
       if(opts.format!=""&&opts.initData!=null){
            opts.formatUnit=true;
            var optsItems=opts.format.split(',');
               for (var i = 0; i < optsItems.length; i++) {
                 _unitHtml+= "<span class='unitSpan' style=width:"+(1/optsItems.length)*100+"%>"+formatPinyin(optsItems[i])+"</span>";
               };
               return '<div id = "mDatePicker"><section class="picker-tool"><h2>'+title+'</h2><span class = "picker-flg"></span><p class= "finish-btn">完成</p></section><section class="picker-unit">'+_unitHtml+'</section></div>'
    
         }
      return '<div id = "mDatePicker"><section class="picker-tool"><h2>'+title+'</h2><span class = "picker-flg"></span><p class= "finish-btn">完成</p></section></div>'
    }
    /*初始化主体内容*/
    function initItemsUI (idStr,unit,begin,end,dataList) {
		var str='';
	    str+="<div id= " + idStr + "><ul><li>&nbsp;</li>";
      for(var i=begin; i<=end;i++){
         if(opts.format==""){
             str+='<li>'+dataList[i]+unit+'</li>';
         }else if(opts.format!=""&&opts.initData!=null){
              str+='<li>'+i+'</li>';
         }else{
          str+='<li>'+i+unit+'</li>';
         }
      }
      return str+"<li>&nbsp;</li></ul></div>";
    }

    function initAmUI() {
      return "<div id='amPicker'><ul><li>&nbsp;</li><li>上午</li><li>下午</li><li >&nbsp;</li></ul></div>"
    }
  }
})(jQuery);
