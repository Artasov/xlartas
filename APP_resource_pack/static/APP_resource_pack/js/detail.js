let action_btn_enable = true;

function sendLikeRequest(element, resourcePackId) {
    if (!document.getElementById('username').value) {
        return;
    }
    const csrf_token = getCookie('csrftoken');
    const headers = {
        'Content-Type': 'application/json',
        'X-CSRFToken': csrf_token,
        'Cookie': `csrftoken=${csrf_token};`
    };
    const requestOptions = {
        method: 'PUT', headers,
        body: JSON.stringify({
            rp_id: resourcePackId,
        })
    };
    fetch('/rp/vote/', requestOptions)
        .then(response => response.json())
        .then(data => {
            if (data['like']) {
                element.style.color = '#f03756';
                element.parentElement.lastElementChild.innerHTML
                    = (Number(element.parentElement.lastElementChild.innerHTML) + 1).toString();
            } else {
                element.style.color = 'inherit';
                element.parentElement.lastElementChild.innerHTML
                    = (Number(element.parentElement.lastElementChild.innerHTML) - 1).toString();

            }
        })
        .catch(error => {
            console.log(error);
        });
}


document.addEventListener('click', function (event) {
    if (action_btn_enable) {
        action_btn_enable = false
        const target = event.target;
        if (target.matches('.like-button')) {
            const resourcePackId = target.getAttribute('resourcePackId');
            sendLikeRequest(target, resourcePackId);
        } else if (target.matches('.download-button')) {
            target.style.color = '#f03756';
            target.parentElement.lastElementChild.innerHTML
                = (Number(target.parentElement.lastElementChild.innerHTML) + 1).toString();
        }
        setTimeout(function () {
            action_btn_enable = true;
        }, 300);
    }
});
let rightArrow = document.getElementById("rightArrow");
let img = document.getElementById("rpImg");
rightArrow.addEventListener("click", function () {
    const curImgId = parseInt(img.getAttribute("curImgId"));
    if (curImgId + 1 === images.length) {
        img.setAttribute("src", images[0]);
        img.setAttribute("curImgId", "0");
    } else {
        img.setAttribute("src", images[curImgId + 1]);
        img.setAttribute("curImgId", (curImgId + 1).toString());
    }
});