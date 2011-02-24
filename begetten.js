(function() {
boardName = document.location.href.match(/\/([a-z]+)\//)[1]
checkerUrl = "http://sys.4chan.org/"+boardName+"/imgboard.php?res="

theForm = $("form[name=postNew]");
tbody = theForm.find("tbody:first");

theRow = $("<tr></tr>").html(
    '<td></td><td class="postblock" align="left">'+
    '<b>ModGet</b></td><td>'+
    '<input class=inputtext type=text size="28">'+
    '<span id="tdgetten"></span></td>'
)
postId = theRow.find('input')

statusR = $("<tr></tr>").html(
    '<td></td><td class="postblock" align="left">'+
    '<b>Status</b></td><td>'+
    '<textarea class=inputtext cols=48 rows=4 wrap=soft></textarea>'+
    '<span id="tdgetten"></span></td>'
).css({"display": 'none'})
textArea = statusR.find('textarea')

theRow.insertBefore($(tbody.children('tr:eq(5)')));
statusR.insertAfter(theRow)

var submitLock = false;
var workingLock = false;
var submitting = false;
function log(txt) {
    textArea.append(txt + '\n')
    textArea.scrollTop(99999);
}

theForm.submit(function(e) {
    postIdVal = parseInt(postId.val());
    if (workingLock) {
        return false;
    }
    if(submitting || isNaN(postIdVal)) {
        return true;
    } else {
        workingLock = true;
        statusR.fadeIn("medium", function() {
            log("Going to try to post as: "+ postIdVal);
            log("Waiting for "+(postIdVal - 2)+" to be posted...")
            findAndPost(postIdVal, this);
        })
        return false;    
    }
});

function findAndPost(postIdVal, form) {
    var probing = false;
    var first = true;
    var probe = function(id) {
        if(probing == false) {
            log("Probe "+id+" stopped.")
            return;
        }
        log("probe "+id+" working..")
        if(boardName != 'b') {
            page = checkerUrl + (postIdVal - 1)
        } else {
            page = checkerUrl + (postIdVal - (id % 2 + 1))
        }
        chrome.extension.sendRequest({'action': 'xhr', 'page': page}, function(statusCode) {
            if(statusCode == 200) {
                probing = false;
                if(submitting == false) {
                    submitting = true;
                    workingLock = false;
                    log("/!\ Target reached, posting!");
                    theForm.submit();
                }
            } else {
                probe(id)
            }
        })
    }
    page = checkerUrl + (postIdVal)
    chrome.extension.sendRequest({'action': 'xhr', 'page': page}, function(statusCode) {
            if(statusCode == 200) {
                log("Failure, we missed our target.");
                workingLock = false;
            } else {
                probing = true;
                setTimeout(function() { log("probe 1 starting"); probe(1, probe); }, 50)
                setTimeout(function() { log("probe 2 starting"); probe(2, probe); }, 75)
                setTimeout(function() { log("probe 3 starting"); probe(3, probe); }, 100)
                setTimeout(function() { log("probe 4 starting"); probe(4, probe); }, 125)
                //setTimeout(function() { log("probe 3 starting"); probe(3, probe); }, 200)
            }
        })

}
})()