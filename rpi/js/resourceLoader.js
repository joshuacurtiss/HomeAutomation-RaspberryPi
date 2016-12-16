function load(path) {
    let html="";
    let ext=path.split(".").pop().toLowerCase();
    if( ext=="css" ) html=`<link rel='stylesheet' href='${path}' />`;
    else if( ext=="js" ) html=`<script language="javascript" src="${path}"></script>`;
    $("head").append(html);
}
module.exports=load;