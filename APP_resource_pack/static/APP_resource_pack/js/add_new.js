const popover = new bootstrap.Popover('.popover-dismiss', {trigger: 'focus'})

const resolution_input = document.getElementById('select_input-resolution');
const resolution_items = document.getElementsByClassName('select_menu-resolution-item');
const resolution_visible_value = document.getElementById('select_value-resolution');
const resolution_select_btn = document.getElementById('select_btn-resolution');
const resolution_menu = document.getElementById('select_menu-resolution')
resolution_select_btn.addEventListener('click', function () {
    resolution_menu.classList.toggle('select_menu-active');
    this.classList.toggle('rounded-bottom-3');
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
    style_menu.classList.toggle('select_menu-active');
    this.classList.toggle('rounded-bottom-3');
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
    color_menu.classList.toggle('select_menu-active');
    this.classList.toggle('rounded-bottom-3');
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


function showInvalid(msg) {
    document.getElementById('invalid').innerText = msg;
    document.getElementById('invalid').parentElement.classList.remove('d-none');
    document.getElementById('invalid').classList.remove('d-none');
    document.getElementById('invalid').classList.add('d-inline');
    document.getElementById('invalid').parentElement.scrollIntoView();
    setTimeout(function () {
        document.getElementById('invalid').classList.add('d-none');
        document.getElementById('invalid').classList.remove('d-inline');
    }, 4000);
}

const fileInput = document.getElementById('file_input');
const previewInput = document.getElementById('preview_input');
const imagesInput = document.getElementById('images');
const imagePreview = document.getElementById('preview-image-preview');
const imagesPreview = document.getElementById('images-preview');
const dragDropRpFile = document.getElementById('drag_drop_rp_file');
const dragDropPreview = document.getElementById('drag_drop_preview');
const dragDropImages = document.getElementById('drag_drop_images');


dragDropRpFile.addEventListener('click', function () {
    fileInput.click();
})
dragDropPreview.addEventListener('click', function () {
    previewInput.click();
})
dragDropImages.addEventListener('click', function () {
    imagesInput.click();
})
// При перетаскивании файла в drag_drop_rp_file добавляем файл в fileInput и меняем текст в drag_drop_rp_file-name
dragDropRpFile.addEventListener('dragover', (e) => {
    e.preventDefault();
    dragDropRpFile.classList.add('drag_drop-active');
});

dragDropRpFile.addEventListener('dragleave', (e) => {
    e.preventDefault();
    dragDropRpFile.classList.remove('drag_drop-active');
});

dragDropRpFile.addEventListener('drop', (e) => {
    e.preventDefault();
    dragDropRpFile.classList.remove('drag_drop-active');
    setFileValue(e.dataTransfer.files);
});

// При перетаскивании изображения в drag_drop_preview добавляем изображение в imagePreview и отображаем в preview-image-preview
dragDropPreview.addEventListener('dragover', (e) => {
    e.preventDefault();
    dragDropPreview.classList.add('drag_drop-active');
});
dragDropPreview.addEventListener('dragleave', (e) => {
    e.preventDefault();
    dragDropPreview.classList.remove('drag_drop-active');
});
dragDropPreview.addEventListener('drop', (e) => {
    e.preventDefault();
    dragDropPreview.classList.remove('drag_drop-active');
    setPreviewValue(e.dataTransfer.files);
});

// При перетаскивании изображений в drag_drop_images добавляем изображения в imagesPreview и отображаем в images-preview
dragDropImages.addEventListener('dragover', (e) => {
    e.preventDefault();
    dragDropImages.classList.add('drag_drop-active');
});
dragDropImages.addEventListener('dragleave', (e) => {
    e.preventDefault();
    dragDropImages.classList.remove('drag_drop-active');
});
dragDropImages.addEventListener('drop', (e) => {
    e.preventDefault();
    dragDropImages.classList.remove('drag_drop-active');
    setImagesValue(e.dataTransfer.files);

});

function setFileValue(files) {
    fileInput.files = files;
    document.getElementById('drag_drop_rp_file-name').textContent = files[0].name;
}

function setPreviewValue(files) {
    const file = files[0];
    if (file.size > 5 * 1024 * 1024) {
        showInvalid('Изображение должно весить меньше 5 MB.')
        return;
    }
    const reader = new FileReader();
    reader.onload = (e) => {
        const image = document.createElement('img');
        image.src = e.target.result;
        image.classList.add('mx-auto');
        image.style.maxWidth = '200px';
        imagePreview.innerHTML = '';
        imagePreview.appendChild(image);
    };
    previewInput.files = files;
    reader.readAsDataURL(file);
}

function setImagesValue(files) {
    if (files.length > 4) {
        showInvalid('Вы пытаетесь загрузить более 4 изображений.')
        return;
    }
    for (let i = 0; i < files.length; i++) {
        if (files[i].size > 5 * 1024 * 1024) {
            showInvalid('Изображение должно весить меньше 5 MB.')
            return;
        }
    }
    imagesPreview.innerHTML = '';
    for (let i = 0; i < files.length; i++) {
        const file = files[i];
        const reader = new FileReader();
        reader.onload = (e) => {
            const image = document.createElement('img');
            image.src = e.target.result;
            image.classList.add('mx-auto');
            image.style.height = "100%";
            image.style.width = "100%";
            image.style.objectFit = "cover";
            let colNewImg = document.createElement('div');
            colNewImg.style.maxWidth = '200px';
            colNewImg.classList.add('col-4', 'd-flex', 'flex-column', 'justify-content-center');
            colNewImg.appendChild(image);
            imagesPreview.appendChild(colNewImg);
        };
        reader.readAsDataURL(file);
    }
    imagesInput.files = files;
}

fileInput.addEventListener('change', function () {
    setFileValue(fileInput.files);
})
imagesInput.addEventListener('change', function () {
    setImagesValue(imagesInput.files);
})
previewInput.addEventListener('change', function () {
    setPreviewValue(previewInput.files);
})


const form = document.querySelector('form');
const btn_submit = document.getElementById('btn_submit');
const progressBar = document.getElementById('progress-bar');
const progressBarValue = document.getElementById('progress-bar-value');
const errorBlock = document.getElementById('invalid').parentElement;
btn_submit.addEventListener('click', (event) => {
    btn_submit.classList.add('d-none');
    progressBar.value = "0";
    progressBar.parentElement.classList.remove('d-none');
    errorBlock.classList.add('d-none');
    const formData = new FormData(form);
    const xhr = new XMLHttpRequest();
    xhr.open('POST', form.action, true);
    xhr.setRequestHeader('X-CSRFToken', getCookie('csrftoken'));
    xhr.upload.onprogress = (event) => {
        progressBar.value = Math.round(event.loaded / event.total * 100).toString();
        progressBarValue.innerText = progressBar.value;
    };
    xhr.onload = () => {
        if (xhr.status === 200) {
            const response = JSON.parse(xhr.responseText);
            window.location.href = '/rp/' + response.data;
        } else {
            const response = JSON.parse(xhr.responseText);
            progressBar.parentElement.classList.add('d-none');
            errorBlock.classList.remove('d-none');
            errorBlock.firstElementChild.innerText = response.data;
            errorBlock.firstElementChild.classList.remove('d-none');
            errorBlock.scrollIntoView();
            btn_submit.classList.remove('d-none');
        }
    };
    xhr.send(formData);
});