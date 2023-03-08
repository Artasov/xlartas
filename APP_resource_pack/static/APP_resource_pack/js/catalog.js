const popover = new bootstrap.Popover('.popover-dismiss', {trigger: 'focus'})


function searchInputOnchange(e) {
    if(e.target.value.length > 3){
        search(e.target.value);
    }
}
const debounce = (func, ms) => {
    let timeout;
    return function () {
        const funcCall = () => {(func.apply(this, arguments))}
        clearTimeout(timeout);
        timeout = setTimeout(funcCall, ms);
    };
}
searchInputOnchange = debounce(searchInputOnchange, 500);

let searchInput = document.getElementById('search');
let searchResult = document.getElementById('search-result');
searchInput.addEventListener('keyup', searchInputOnchange);

function search(searchText) {
    searchResult.innerHTML = '';
    fetch(`/rp/search?text=${searchText}`)
        .then(response => response.json())
        .then(data => {
            console.log(data)
            for (let i = 0; i < data.length; i++) {
                searchResult.appendChild(createSearchEl(data[i]))
            }
        })
        .catch(error => console.error(error));
}
function createSearchEl(el) {
    const searchEl = document.createElement('div');
    searchEl.classList.add('flex-row-center');
    const name = document.createElement('a');
    name.innerText = el.name.slice(0, 20) + "...";
    name.setAttribute('href', `/rp/${el.slug}`)
    searchEl.appendChild(name);
    return searchEl;
}

if (document.body.classList.contains('_touch')) {
    const btn_show_filters = document.getElementById('btn_show_filters');
    const filter_block = document.getElementById('filter_block');
    filter_block.classList.add('d-none');
    btn_show_filters.addEventListener('click', function () {
        filter_block.classList.toggle('d-none');
    })
}


const selectMenus = document.getElementsByClassName('select_menu');
const selectBtns = document.getElementsByClassName('select_btn');

const resolution_input = document.getElementById('select_input-resolution');
const resolution_items = document.getElementsByClassName('select_menu-resolution-item');
const resolution_visible_value = document.getElementById('select_value-resolution');
const resolution_select_btn = document.getElementById('select_btn-resolution');
const resolution_menu = document.getElementById('select_menu-resolution')
resolution_select_btn.addEventListener('click', function () {
    if (resolution_menu.classList.contains('select_menu-active')) {
        closeAllSelectMenu();
    } else {
        closeAllSelectMenu();
        resolution_menu.classList.toggle('select_menu-active');
        resolution_select_btn.classList.add('invert');
    }
})
for (let i = 0; i < resolution_items.length; i++) {
    resolution_items[i].addEventListener('click', function () {
        resolution_visible_value.innerText = this.getAttribute('value');
        resolution_visible_value.click();
        resolution_input.value = this.getAttribute('value').toLowerCase();
        for (let j = 0; j < resolution_items.length; j++) {
            resolution_items[j].classList.remove('select_menu-item-active');
        }
        this.classList.add('select_menu-item-active');
    })
}

const style_input = document.getElementById('select_input-style');
const style_items = document.getElementsByClassName('select_menu-style-item');
const style_visible_value = document.getElementById('select_value-style');
const style_select_btn = document.getElementById('select_btn-style');
const style_menu = document.getElementById('select_menu-style')
style_select_btn.addEventListener('click', function () {
    if (style_menu.classList.contains('select_menu-active')) {
        closeAllSelectMenu();
    } else {
        closeAllSelectMenu();
        style_menu.classList.toggle('select_menu-active');
        style_select_btn.classList.add('invert');
    }
})
for (let i = 0; i < style_items.length; i++) {
    style_items[i].addEventListener('click', function () {
        style_visible_value.innerText = this.getAttribute('value');
        style_visible_value.click();
        style_input.value = this.getAttribute('value').toLowerCase();
        for (let j = 0; j < style_items.length; j++) {
            style_items[j].classList.remove('select_menu-item-active');
        }
        this.classList.add('select_menu-item-active');
    })
}

const color_input = document.getElementById('select_input-color');
const color_items = document.getElementsByClassName('select_menu-color-item');
const color_visible_value = document.getElementById('select_value-color');
const color_select_btn = document.getElementById('select_btn-color');
const color_menu = document.getElementById('select_menu-color')
color_select_btn.addEventListener('click', function () {
    if (color_menu.classList.contains('select_menu-active')) {
        closeAllSelectMenu();
    } else {
        closeAllSelectMenu();
        color_menu.classList.toggle('select_menu-active');
        color_select_btn.classList.add('invert');
    }
})
for (let i = 0; i < color_items.length; i++) {
    color_items[i].addEventListener('click', function () {
        color_visible_value.innerText = this.getAttribute('value');
        color_visible_value.click();
        color_input.value = this.getAttribute('value').toLowerCase();
        for (let j = 0; j < color_items.length; j++) {
            color_items[j].classList.remove('select_menu-item-active');
        }
        this.classList.add('select_menu-item-active');
    })
}


const sort_input = document.getElementById('select_input-sort');
const sort_items = document.getElementsByClassName('select_menu-sort-item');
const sort_visible_value = document.getElementById('select_value-sort');
const sort_select_btn = document.getElementById('select_btn-sort');
const sort_menu = document.getElementById('select_menu-sort')
sort_select_btn.addEventListener('click', function () {
    if (sort_menu.classList.contains('select_menu-active')) {
        closeAllSelectMenu();
    } else {
        closeAllSelectMenu();
        sort_menu.classList.toggle('select_menu-active');
        sort_select_btn.classList.add('invert');
    }
})
for (let i = 0; i < sort_items.length; i++) {
    sort_items[i].addEventListener('click', function () {
        sort_visible_value.innerText = this.getAttribute('value');
        sort_visible_value.click();
        sort_input.value = this.getAttribute('value').toLowerCase();
        for (let j = 0; j < sort_items.length; j++) {
            sort_items[j].classList.remove('select_menu-item-active');
        }
        this.classList.add('select_menu-item-active');
    })
}

const author_input = document.getElementById('select_input-author');
const author_items = document.getElementsByClassName('select_menu-author-item');
const author_visible_value = document.getElementById('select_value-author');
const author_select_btn = document.getElementById('select_btn-author');
const author_menu = document.getElementById('select_menu-author')
author_select_btn.addEventListener('click', function () {
    if (author_menu.classList.contains('select_menu-active')) {
        closeAllSelectMenu();
    } else {
        closeAllSelectMenu();
        author_menu.classList.toggle('select_menu-active');
        author_select_btn.classList.add('invert');
    }
})
for (let i = 0; i < author_items.length; i++) {
    author_items[i].addEventListener('click', function () {
        author_visible_value.innerText = this.getAttribute('value');
        author_visible_value.click();
        author_input.value = this.getAttribute('value').toLowerCase();
        for (let j = 0; j < author_items.length; j++) {
            author_items[j].classList.remove('select_menu-item-active');
        }
        this.classList.add('select_menu-item-active');
    })
}

function closeAllSelectMenu() {
    for (let i = 0; i < selectMenus.length; i++) {
        selectMenus[i].classList.remove('select_menu-active');
        selectBtns[i].classList.remove('invert');
    }
}

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
        method: 'PUT',
        headers,
        body: JSON.stringify({
            rp_id: resourcePackId,
        })
    };
    return fetch('/rp/vote/', requestOptions)
        .then(response => {
            if (!response.ok) {
                throw new Error(`${response.status} ${response.statusText}`);
            }
            return response.json();
        })
        .then(data => {
            if (data) {
                if (data['like']) {
                    element.style.color = '#f03756';
                    element.parentElement.lastElementChild.innerHTML
                        = (Number(element.parentElement.lastElementChild.innerHTML) + 1).toString();
                } else {
                    element.style.color = 'inherit';
                    element.parentElement.lastElementChild.innerHTML
                        = (Number(element.parentElement.lastElementChild.innerHTML) - 1).toString();
                }
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
            target.parentElement.parentElement.lastElementChild.innerHTML
                = (Number(target.parentElement.parentElement.lastElementChild.innerHTML) + 1).toString();
        }
        setTimeout(function () {
            action_btn_enable = true;
        }, 300);
    }
});

let style = document.getElementById('select_input-style').value.trim();
let color = document.getElementById('select_input-color').value.trim();
let resolution = document.getElementById('select_input-resolution').value.trim();
let sort = document.getElementById('select_input-sort').value.trim();
let author = document.getElementById('select_input-author').value.trim();

let last_rp_num = 0;
const rpsBlockScroll = document.querySelector('.rps_block_scroll');
const rpsContainer = document.querySelector('.rps_container');
rpsBlockScroll.addEventListener('scroll', rps_container_onscroll);
const errorMargin = 10;
let access_upload = true;
rps_container_onscroll();

function rps_container_onscroll() {
    if (!access_upload) {
        return;
    }
    if (rpsBlockScroll.offsetHeight + rpsBlockScroll.scrollTop + errorMargin >= rpsBlockScroll.scrollHeight) {
        access_upload = false;
        fetch(`/rp/get_new_for_pagination/${last_rp_num}/?style=${style}&color=${color}&resolution=${resolution}&sort=${sort}&author=${author}`)
            .then(response => {
                if (!response.ok) {
                    throw new Error(`${response.status} ${response.statusText}`);
                }
                return response.json();
            })
            .then(data_json => {
                if (!data_json.end) {
                    data_json.forEach(rp => {
                        const rp_elem = createRpObj(rp);
                        rpsContainer.appendChild(rp_elem);
                        last_rp_num += 1;
                    });
                }
                access_upload = true;
            })
            .catch(error => {
                console.error('An error occurred while fetching the data: ', error);
            });
    }
}

let rps_images = {}

function createRpObj(rp) {
    const rpDiv = document.createElement('div');
    rpDiv.id = `rp-${rp.id}`;
    rpDiv.classList.add('rp', 'mt-3', 'col-sm-6', 'col-md-4', 'px-4', 'px-sm-2', 'disable-tap-and-selection');
    const innerDiv = document.createElement('div');
    innerDiv.classList.add('w-100', 'rounded-4');
    rpDiv.appendChild(innerDiv);
    const titleBlockDiv = document.createElement('div');
    titleBlockDiv.classList.add('rp-title-block');
    innerDiv.appendChild(titleBlockDiv);

    const wrapImg = document.createElement('div');
    wrapImg.style.height = '160px';
    wrapImg.classList.add('wrap-rp-img', 'w-100', 'position-relative', 'overflow-x-hidden', 'rounded-top-4')

    const loadingBlock = document.createElement('div');
    loadingBlock.classList.add('h-100', 'w-100', 'flex-col-center', 'pb-3', 'position-absolute', 'top-0', 'left-0');
    loadingBlock.style.zIndex = '-1';
    const loading = document.createElement('div');
    loading.classList.add('spinner-border', 'mx-auto', 'text-white-70');
    loadingBlock.appendChild(loading);
    wrapImg.appendChild(loadingBlock);


    const trigger_full_screen_block = document.createElement('div');
    trigger_full_screen_block.classList.add('position-absolute', 'd-flex', 'flex-column', 'justify-content-center');
    trigger_full_screen_block.style.top = '0';
    trigger_full_screen_block.style.right = '0';
    trigger_full_screen_block.style.width = '100%';
    trigger_full_screen_block.style.height = '100%';
    wrapImg.appendChild(trigger_full_screen_block);
    const trigger_full_screen = document.createElement('div');
    trigger_full_screen.classList.add('mx-auto', 'h-50')
    trigger_full_screen.style.width = '50%';
    trigger_full_screen_block.appendChild(trigger_full_screen)
    const img = document.createElement('img');
    rps_images['rp-' + rp.id] = rp.images;
    rps_images['rp-' + rp.id].unshift(rp.image_preview)
    img.src = `${rp.images[0].image}`;
    img.alt = '';
    img.style.pointerEvents = 'none';
    img.classList.add('rounded-top-4', 'disable-tap-and-selection');
    img.setAttribute('id', 'rp-img-' + rp.id);
    img.setAttribute('curId', '0');
    img.style.height = '100%';
    img.style.width = '100%';
    img.style.objectFit = 'cover';


    const rightArrowBlock = document.createElement('div');
    rightArrowBlock.classList.add('rightArrowBlock', 'position-absolute', 'h-100', 'd-flex', 'flex-column', 'justify-content-center');
    rightArrowBlock.style.top = '0';
    rightArrowBlock.style.right = '15px';
    const rightArrow = document.createElement('i');
    rightArrow.classList.add('rp-img-right-arrow', 'fa-solid', 'fa-chevron-right', 'fs-3', 'text-white-50')
    rightArrow.style.opacity = '0';
    rightArrow.setAttribute('imgId', rp.id);
    rightArrowBlock.appendChild(rightArrow);
    rightArrow.addEventListener('click', function () {
        const rp_id = this.getAttribute('imgId');
        const rp_img_el = document.getElementById('rp-img-' + rp_id);
        rp_img_el.setAttribute('src', '');
        const rp_images = rps_images['rp-' + rp_id];
        const cur_img_id = parseInt(rp_img_el.getAttribute('curId'));
        if (cur_img_id + 1 === rp_images.length) {
            rp_img_el.setAttribute('src', rp_images[0].image);
            rp_img_el.setAttribute('curId', '0');
        } else {
            rp_img_el.setAttribute('src', rp_images[cur_img_id + 1].image);
            rp_img_el.setAttribute('curId', (cur_img_id + 1).toString());
        }
    })
    trigger_full_screen.addEventListener('click', function () {
        if (document.getElementsByClassName('_touch').length > 0) {
            return;
        }
        const fullScreen = document.createElement('div');
        fullScreen.classList.add('full-screen', 'd-flex', 'flex-column', 'justify-content-center', 'disable-tap-and-selection');
        fullScreen.style.zIndex = '888';
        fullScreen.style.background = 'rgba(0,0,0,0.2)';
        fullScreen.style.pointerEvents = 'all';
        const content = this.parentElement.parentElement.cloneNode(true);
        content.lastChild.firstChild.style.transform = 'scale(0)';
        content.childNodes[1].classList.add('rounded-4');
        content.childNodes[1].style.height = '';
        content.style.height = '';

        const fullScreenInner = document.createElement('div');
        fullScreenInner.classList.add('mx-auto');
        fullScreenInner.style.width = '90%'
        fullScreenInner.style.maxWidth = '1000px';
        fullScreen.style.width = '100vw';
        fullScreen.style.height = '100vh';
        fullScreen.style.position = 'absolute';
        fullScreen.style.top = '0';
        fullScreen.style.left = '0';
        fullScreen.style.left = '0';
        fullScreenInner.appendChild(content)
        fullScreen.appendChild(fullScreenInner);
        document.body.appendChild(fullScreen);
        fullScreen.addEventListener('click', function () {
            fullScreen.remove();
        });
    });

    wrapImg.appendChild(img);
    wrapImg.appendChild(rightArrowBlock);
    titleBlockDiv.appendChild(wrapImg);


    const nameDiv = document.createElement('div');
    nameDiv.classList.add('rp-name', 'px-3', 'pb-2', 'd-flex', 'flex-column', 'justify-content-center');
    titleBlockDiv.appendChild(nameDiv);
    const nameSpan = document.createElement('span');
    nameSpan.textContent = rp.name;
    nameSpan.classList.add('text-white-90', 'fs-5', 'fw-bold', 'text-nowrap');
    nameDiv.appendChild(nameSpan);

    // const dateDiv = document.createElement('div');
    // dateDiv.classList.add('rp-date', 'px-3', 'pb-2', 'd-flex', 'flex-column', 'justify-content-center');
    // titleBlockDiv.appendChild(dateDiv);
    // const dateSpan = document.createElement('span');
    // dateSpan.textContent = rp.date_created;
    // dateSpan.classList.add('text-white', 'opacity-25');
    // dateDiv.appendChild(dateSpan);
    const detailLinkDiv = document.createElement('div');
    detailLinkDiv.classList.add('rp-detail-link', 'px-3', 'pb-2', 'd-flex', 'flex-column', 'justify-content-center');
    titleBlockDiv.appendChild(detailLinkDiv);
    const detailLink = document.createElement('a');
    detailLink.classList.add('text-decoration-none', 'text-white-50', 'pt-3')
    detailLink.setAttribute('href', `/rp/${rp.slug}`);
    detailLink.setAttribute('target', '_blank');
    const detailLinkIcon = document.createElement('i');
    detailLinkIcon.classList.add('fa-solid', 'fa-link');
    detailLink.appendChild(detailLinkIcon);
    detailLinkDiv.appendChild(detailLink);

    const infoDiv = document.createElement('div');
    infoDiv.classList.add('rp-info', 'px-3', 'py-2', 'd-flex', 'justify-content-between', 'rounded-bottom-4', 'bg-black', 'bg-opacity-25', 'gap-0');
    innerDiv.appendChild(infoDiv);

    const styleDiv = document.createElement('div');
    styleDiv.classList.add('d-flex', 'flex-column', 'justify-content-center', 'text-white-50', 'fs-6');
    infoDiv.appendChild(styleDiv);

    const styleSpan = document.createElement('span');
    styleSpan.textContent = `Style: ${rp.style}`;
    styleDiv.appendChild(styleSpan);

    const colorSpan = document.createElement('span');
    colorSpan.textContent = `Color: ${rp.color}`;
    styleDiv.appendChild(colorSpan);

    const resolutionSpan = document.createElement('span');
    resolutionSpan.textContent = `Resolution: ${rp.resolution}`;
    styleDiv.appendChild(resolutionSpan);

    const uploadedBySpan = document.createElement('span');
    uploadedBySpan.textContent = `Uploaded by ${rp.uploaded_by.username}`;
    styleDiv.appendChild(uploadedBySpan);

    const actionsCol = document.createElement('div');
    actionsCol.classList.add('d-flex', 'flex-column', 'justify-content-center', 'gap-2');
    actionsCol.style.minWidth = '50px';
    infoDiv.appendChild(actionsCol);

    const likeContainer = document.createElement('div');
    likeContainer.classList.add('d-flex', 'justify-content-around', 'text-white-50', 'gap-3', 'fs-5');
    actionsCol.appendChild(likeContainer);


    const likeButton = document.createElement('i');
    likeButton.classList.add('like-button', 'fa-solid', 'fa-thumbs-up');
    likeButton.setAttribute('resourcePackId', rp.id);
    likeButton.style.transform = 'scale(1.11)';
    if (rp.likes_by.some(function (like) {
        return like.username === document.getElementById('username').value;
    })) {
        likeButton.style.color = '#f03756';
    } else {
        likeButton.style.color = 'inherit';
    }
    likeContainer.appendChild(likeButton);
    const likeValue = document.createElement('span');
    likeValue.classList.add('like-value');
    likeValue.textContent = rp.likes;
    likeContainer.appendChild(likeValue);

    const downloadContainer = document.createElement('div');
    downloadContainer.classList.add('d-flex', 'justify-content-around', 'tent-center', 'text-white-50', 'gap-3', 'fs-5');
    actionsCol.appendChild(downloadContainer);
    const downloadLink = document.createElement('a');
    downloadLink.classList.add('text-decoration-none', 'd-flex', 'flex-column', 'justify-content-center');
    downloadLink.setAttribute('href', '/rp/download/' + rp.id + '/');
    downloadLink.style.color = 'inherit';
    downloadContainer.appendChild(downloadLink);

    const downloadButton = document.createElement('i');
    downloadButton.classList.add('fa-solid', 'fa-cloud-arrow-down', 'download-button');
    if (rp.downloads_by.some(function (download) {
        return download.username === document.getElementById('username').value;
    })) {
        downloadButton.style.color = '#f03756';
    } else {
        downloadButton.style.color = 'inherit';
    }
    downloadLink.appendChild(downloadButton);
    const downloadValue = document.createElement('span');
    downloadValue.textContent = rp.downloads;
    downloadContainer.appendChild(downloadValue);
    return rpDiv;
}

document.getElementById('btnApplyFilters').addEventListener('click', function () {
    access_upload = false;
    style = document.getElementById('select_input-style').value.trim();
    color = document.getElementById('select_input-color').value.trim();
    resolution = document.getElementById('select_input-resolution').value.trim();
    sort = document.getElementById('select_input-sort').value.trim();
    author = document.getElementById('select_input-author').value.trim();
    rpsContainer.innerHTML = '';
    last_rp_num = 0;
    access_upload = true;
    rps_container_onscroll();
})