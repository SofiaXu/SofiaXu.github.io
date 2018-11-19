function RateThem()
{
    var checked = 0;
    var tidList = "";
    for (var i = 0; i < $('moderate').elements.length; i++)
    {
        if ($('moderate').elements[i].name.match('moderate') && $('moderate').elements[i].checked)
        {
            checked = 1;
            break;
        }
    }
    if (!checked)
    {
        alert('请选择需要操作的帖子');
    }
    else
    {
        for (i = 0; i < $('moderate').elements.length; i++)
        {
            if ($('moderate').elements[i].name.match('moderate') && $('moderate').elements[i].checked)
            {
                tidList += $('moderate').elements[i].value + ",";
            }
        }

        window.location.href = window.location.protocol + "//www.tsdm.me/plugin.php?id=minerva:batch_rate&action=new_task&tid=" + tidList;
    }
}
