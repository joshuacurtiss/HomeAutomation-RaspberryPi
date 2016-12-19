let jQuery=$=require("../bower_components/jquery/dist/jquery.min.js");
let config=require("config");
let data=require("../data/data.json");
let widgetTypes=config.get("widgetTypes");
let moment=require("moment");
let load=require("../js/resourceLoader.js");
let electron=require("electron");
let ipcRenderer=electron.ipcRenderer;

const TIMEFMT="h:mm A";
const DOWFMT="dddd";
const DATEFMT="MMMM D";

load(`../bower_components/font-awesome/css/font-awesome.min.css`);
load(`dashboard.css`);
load(`dashboard-${data.theme}.css`);

ipcRenderer.on('device-update', (event, data) => {
    $(`#${data.device.id} i`).removeClass().addClass(widgetTypes[data.device.device][`icon-${data.value.replace(/\W/,"")}`]);
})

$(document).ready(()=>{
    var html="", widgetType={}, widget={};
    for( var widgetid in data.widgets )
    {
        widget=data.widgets[widgetid];
        widgetType=widgetTypes[widget.type];
        if( widgetType )
        {
            // Special handling for datetime:
            if( widget.type=="datetime" )
            {
                html=`<div data-type="${widget.type}" class="widget ${widgetType.classes || ''}">` +
                     `<h1></h1>` +
                     `<div class="comment"></div>`+
                     `<div class="time"></div>`+
                     `</div>`;
             }
            // Everything else:
            else
            {
                html=`<div id="${widgetid}" class="widget ${widgetType.classes || ''}">` +
                     `<h1>${widget.title || ''}</h1>` +
                     `<div class="comment">${widget.comment || ""}</div>` +
                     `<i></i>` +
                     `<span class="hidden"></span>` +
                     `</div>`;
            }
            $(".dashboard").append(html);
        }
    }
    updateTime();
    $.ajax({
        url: data.smartthings.url+"devices",
        type: "GET",
        dataType: "json",
        crossDomain: true,
        cache: false,
        beforeSend: function (xhr) {
            xhr.setRequestHeader("Authorization", "Bearer " + data.smartthings.token);
        },
        success: function (data) {
            for( var widget of data ) {
                if(widget.device && widget.value) {
                    $(`#${widget.id} i`).removeClass().addClass(widgetTypes[widget.device][`icon-${widget.value.replace(/\W/,"")}`]);
                    var style=null;
                    if( widget.battery && widget.battery>80 ) style="4";
                    else if( widget.battery && widget.battery>60 ) style="3";
                    else if( widget.battery && widget.battery>40 ) style="2";
                    else if( widget.battery && widget.battery>20 ) style="1";
                    else if( widget.battery && widget.battery>=0 ) style="0";
                    if(style) style="fa fa-battery-"+style;
                    else style="hidden";
                    $(`#${widget.id} span`).removeClass().addClass(style);
                } else {
                    console.log("Could not act on: "+JSON.stringify(widget));
                }
            }
        },
        error: function (jqXHR, textStatus, errorThrown) {
            alert("Received error loading initial data.")
        }
    }).fail(function () {
        alert("Failed to load initial data.")
    });
});

function updateTime()
{
    var now=moment();
    $(".widget[data-type=datetime] h1").html(now.format(DATEFMT));
    $(".time").html(now.format(TIMEFMT));
    $(".widget[data-type=datetime] .comment").html(now.format(DOWFMT));
    var sec=now.seconds();
    setTimeout(updateTime,(60-sec)*1000);
}
