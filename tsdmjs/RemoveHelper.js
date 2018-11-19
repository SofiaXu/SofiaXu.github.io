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
    $("div#ts_sidebar_base").remove();
}

function RemovvFourmDisplayAD()
{
    $("tbody#separatorline").next().remove();
    $("[colspan='6']").parent().parent().remove();
}

RemoveUseless();
