let jQuery=$=require("../bower_components/jquery/dist/jquery.min.js");
let config=require("config");
let data=require("../data/data.json");
let widgetTypes=config.get("widgetTypes");
let moment=require("moment");
let load=require("../js/resourceLoader.js");

const TIMEFMT="h:mm A";
const DOWFMT="dddd";
const DATEFMT="MMMM D";

load(`../bower_components/font-awesome/css/font-awesome.min.css`);
load(`../css/dashboard.css`);
load(`../css/dashboard-${data.theme}.css`);

$(document).ready(()=>{
    var html="", widgetType={};
    for( var widget of data.widgets )
    {
        widgetType=widgetTypes[widget.type];
        if( widgetType )
        {
            if( widget.type=="datetime" )
            {
                html=`<div data-type="${widget.type}" class="widget ${widgetType.classes || ''}">` +
                     `<h1 class="date"></h1>` +
                     `<div class="timedow"></div>`+
                     `<div class="time"></div>`+
                     `</div>`;
            }
            else
            {
                html=`<div data-type="${widget.type}" class="widget ${widgetType.classes || ''}">` +
                     `<h1>${widget.title || ''}</h1>` +
                     `<i class="${widgetType.iconoff}"></i>`;
                if( widget.battery ) html+=`<span class="fa fa-battery-${widget.battery}"></span>`;
                html+=`</div>`;
            }
            $(".dashboard").append(html);
        }
    }
    updateTime();
});

function updateTime()
{
    var now=moment();
    $(".date").html(now.format(DATEFMT));
    $(".time").html(now.format(TIMEFMT));
    $(".timedow").html(now.format(DOWFMT));
    var sec=now.seconds();
    setTimeout(updateTime,(60-sec)*1000);
}
