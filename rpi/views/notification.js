const NOTIFICATIONDELAY=9999;

load(`notification-contact.css`);

ipcRenderer.on('notification', (event, data) => {
    activateNotification(data.type,data.msg);
})

function activateNotification(type,msg) {
    $(`.notification.${type}`)
        .find(".msg").html(msg).end()
        .removeClass("hidden").animateCss("fadeInUpBig");
    setTimeout(function(){
        $(`.notification.${type}`).animateCss("fadeOutDownBig",function(){
            $(`.notification.${type}`).addClass("hidden");
        })
    },NOTIFICATIONDELAY);
}
