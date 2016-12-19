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
    updateDevice(data.device);
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
                html=`<div id="${widgetid}" data-type="${widget.type}" data-value="" class="widget ${widgetType.classes || ''}">` +
                     `<h1></h1>` +
                     `<div class="comment"></div>`+
                     `<div class="time"></div>`+
                     `</div>`;
             }
            // Everything else:
            else
            {
                html=`<div id="${widgetid}" data-type="${widget.type}" data-value="" class="widget ${widgetType.classes || ''}">` +
                     `<h1>${widget.title || ""}</h1>` +
                     `<div class="comment">${widget.comment || ""}</div>` +
                     `<i></i>` +
                     `<span class="hidden"></span>` +
                     `</div>`;
            }
            $(".dashboard").append(html);
        }
    }
    updateTime();
    $(".dashboard .widget").click(clickDevice);
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
                updateDevice(widget);
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
    $(".widget[data-type=datetime]")
        .find("h1").html(now.format(DATEFMT)).end()
        .find(".time").html(now.format(TIMEFMT)).end()
        .find(".comment").html(now.format(DOWFMT)).end();
    var sec=now.seconds();
    setTimeout(updateTime,(60-sec)*1000);
}

function updateDevice(device) {
    if(device.device && device.value) {
        $(`#${device.id}`)
            .attr("data-value",device.value)
            .find("h1").html(device.name).end()
            .find("i").removeClass().addClass(widgetTypes[device.device][`icon-${device.value.replace(/\W/,"")}`]).end();
        var style=null;
        if( device.battery && device.battery>80 ) style="4";
        else if( device.battery && device.battery>60 ) style="3";
        else if( device.battery && device.battery>40 ) style="2";
        else if( device.battery && device.battery>20 ) style="1";
        else if( device.battery && device.battery>=0 ) style="0";
        if(style) style="fa fa-battery-"+style;
        else style="hidden";
        $(`#${device.id} span`).removeClass().addClass(style);
    } else {
        console.log("Could not act on: "+JSON.stringify(device));
    }
}

function clickDevice() {
    var id=this.id;
    var curval=$(this).attr("data-value");
    var type=$(this).attr("data-type");
    var action=widgetTypes[type].actions?widgetTypes[type].actions[curval]:null;
    var postData=JSON.stringify({action:action});
    console.log(`${type} "${id}" is "${curval}". ${action?`Performing "${action}"`:"Nothing to do"}.`);
    if(action) {
        $.ajax({
            url: data.smartthings.url+"devices/"+id,
            type: "POST",
            data: postData,
            dataType: 'json',
            contentType: "application/json; charset=utf-8",
            crossDomain: true,
            cache: false,
            beforeSend: function (xhr) {
                xhr.setRequestHeader("Authorization", "Bearer " + data.smartthings.token);
            }
        });
    }
}