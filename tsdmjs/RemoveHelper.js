function RemoveUseless()
{
    var thisHref = window.location.href;
    if (thisHref.endsWith("forum.php"))
    {
        RemoveSideBar();
    }
    else if (thisHref.match("mod=forumdisplay"))
    {
        RemoveSideBar();
        RemovvFourmDisplayAD();
    }
}

function RemoveSideBar()
{
    var a = $("ts_sidebar_base");
    a.parentNode.removeChild(a);
}

function RemovvFourmDisplayAD()
{
    $("tbody#separatorline").next().remove();
    $("[colspan='6']").parent().parent().remove();
}

RemoveUseless();
