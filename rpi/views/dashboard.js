let widgetTypes=config.get("widgetTypes");
let moment=require("moment");

const TIMEFMT="h:mm A";
const DOWFMT="dddd";
const DATEFMT="MMMM D";

load(`dashboard.css`);

ipcRenderer.on('device-update', (event, data) => {
    updateDevice(data.device);
})
ipcRenderer.on('shm-update', (event, data) => {
    updateSHM(data);
})

function initDashboard(cb){
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
    updateTimeWidget();
    refreshDashboard(cb);
    setInterval(refreshDashboard,config.get("refreshInterval"));
    $(".dashboard .widget").click(clickDevice);
}

function revealDashboard(cb) {
    $(".dashboard")
        .find(".widget").each((index,elem)=>{
            $(elem).addClass("hidden");
            setTimeout(`$("#${elem.id}").removeClass("hidden").animateCss("bounceInRight")`,index*80);
        }).end()
        .removeClass("hidden");
}

function refreshDashboard(cb) {
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
                if( widget.device=="alarmSystemStatus" ) updateSHM(widget);
                else updateDevice(widget);
            }
            if(cb)cb();
        },
        error: function (jqXHR, textStatus, errorThrown) {
            alert("Received error loading initial data.")
        }
    }).fail(function () {
        alert("Failed to load initial data.")
    });
}

function updateTimeWidget()
{
    var now=moment();
    $(".widget[data-type=datetime]")
        .find("h1").html(now.format(DATEFMT)).end()
        .find(".time").html(now.format(TIMEFMT)).end()
        .find(".comment").html(now.format(DOWFMT)).end();
    var sec=now.seconds();
    setTimeout(updateTimeWidget,(60-sec)*1000);
}

function updateSHM(data) {
    data.comment=data.value=="off"?"Disarmed":`Armed (${data.value})`;
    delete data.name;
    updateDevice(data);
}

function updateDevice(device) {
    if(device.device && device.value) {
        $(`#${device.id}`)
            .attr("data-value",device.value)
            .find("h1").html(device.name).end()
            .find(".comment").html(device.comment || "").end()
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
        $(this).animateCss("pulse");
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