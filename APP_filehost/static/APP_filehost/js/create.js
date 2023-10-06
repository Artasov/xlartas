const popover = new bootstrap.Popover('.popover-dismiss', {trigger: 'focus'})
const MAX_UPLOAD_SIZE = parseInt(document.getElementById('MAX_UPLOAD_SIZE').value) * 1024 * 1024;
const FILES = [];

function highlightDropZone(event) {
    event.preventDefault();
    this.classList.add('drag_drop-active');
}

function unHighlightDropZone(event) {
    event.preventDefault();
    this.classList.remove('drag_drop-active');
}

const drop_zone = document.getElementById('drag_drop_file');
['dragover', 'dragenter'].forEach(event => drop_zone.addEventListener(event, highlightDropZone));
['dragleave'].forEach(event => drop_zone.addEventListener(event, unHighlightDropZone));
drop_zone.addEventListener('drop', (event) => {
    event.preventDefault();
    const dt = event.dataTransfer;
    unHighlightDropZone.call(drop_zone, event);
    if (dt.files?.length) {
        FILES.push(...dt.files);
        UpdateViewZone();
    }
});
drop_zone.addEventListener('click', () => uploadField.click());

const uploadField = document.getElementById("files");
const img_zone = document.getElementById('img-zone');
const file_zone = document.getElementById('file-zone');
const imgExtensions = ['.png', '.jpg', '.jpeg', '.webp', '.svg', '.bmp'];

function UpdateViewZone() {
    let total_files_size = 0;
    let list = new DataTransfer();
    img_zone.innerHTML = "";
    file_zone.innerHTML = "";
    for (let i = 0; i < FILES.length; i++) {
        const file = FILES[i];
        list.items.add(file);
        total_files_size += file.size;
        const fileExtension = file.name.substring(file.name.lastIndexOf('.')).toLowerCase();

        if (imgExtensions.includes(fileExtension)) {
            const img = document.createElement('img');
            const reader = new FileReader();
            reader.onload = function (e) {
                img.src = e.target.result;
            };
            reader.readAsDataURL(file);
            img.style.cssText = "height: 100%; width: 100%; object-fit: cover;";

            const closeBtn = document.createElement('i');
            closeBtn.classList.add('text-white-80', 'fa-solid', 'fa-xmark', 'position-absolute');
            closeBtn.style.cssText = "left: 1rem; top: 0.6rem;";
            closeBtn.addEventListener('click', function (e) {
                FILES.splice(i, 1);
                UpdateViewZone();
            });

            const colNewImg = document.createElement('div');
            colNewImg.style.cssText = "max-width: 200px;";
            colNewImg.classList.add('col-4', 'px-1', 'mb-2', 'd-flex', 'flex-column', 'justify-content-center', 'position-relative');
            colNewImg.appendChild(img);
            colNewImg.appendChild(closeBtn);
            img_zone.appendChild(colNewImg);
        } else {
            let file_el = document.createElement("tr");
            file_el.classList.add("text-center");

            let fileHeader = document.createElement("td");
            fileHeader.classList.add("text-white-80");
            let fileName = file.name;
            if (fileName.length > 20) {
                fileName = fileName.substring(0, 17) + '...';
            }
            fileHeader.textContent = fileName;
            file_el.appendChild(fileHeader);

            let sizeHeader = document.createElement("td");
            sizeHeader.classList.add("text-white-80");
            sizeHeader.textContent = (file.size / 1024 / 1024).toFixed(3) + " MB";
            file_el.appendChild(sizeHeader);

            let xHeader = document.createElement("td");
            xHeader.classList.add("text-white-80");
            let closeBtn = document.createElement("i");
            closeBtn.classList.add("fa-solid", "fa-xmark", 'me-3');
            closeBtn.addEventListener('click', function (e) {
                FILES.splice(i, 1);
                UpdateViewZone();
            });
            xHeader.appendChild(closeBtn);
            file_el.appendChild(xHeader);

            file_zone.prepend(file_el);
        }
    }
    uploadField.files = list.files;
    if (total_files_size > MAX_UPLOAD_SIZE) {
        document.getElementById('invalid-size').classList.remove('d-none');
    } else {
        document.getElementById('invalid-size').classList.add('d-none');
    }
    document.getElementById('size').innerHTML = total_files_size ? `Total size: ${(total_files_size / 1024 / 1024).toFixed(3)} MB` : "";
    document.getElementById('size').style.display = total_files_size ? 'block' : 'none';
}

// limiting upload
uploadField.onchange = function () {
    for (let i = 0; i < this.files.length; i++) {
        FILES.push(this.files[i]);
    }
    UpdateViewZone();
};