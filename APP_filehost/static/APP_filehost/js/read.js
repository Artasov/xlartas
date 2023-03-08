const downloadAllButton = document.getElementById('download-all-button');
downloadAllButton.addEventListener('click', function () {
    const downloadLinks = document.getElementsByClassName('btn_download');
    for (let i = 0; i < downloadLinks.length; i++) {
        const url = downloadLinks[i].href;
        const link = document.createElement('a');
        link.setAttribute('href', url);
        link.setAttribute('download', '');
        link.style.display = 'none';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    }
});
const images = document.getElementsByClassName('image');
for (let i = 0; i < images.length; i++) {
    images[i].addEventListener('click', function () {
        const imgWrap = document.createElement('div');
        imgWrap.classList.add('flex-col-center', 'position-absolute', 'left-0', 'top-0', 'bg-black-45');
        imgWrap.style.width = '100vw';
        imgWrap.style.height = '100vh';
        const imgBlock = document.createElement('div');
        imgBlock.style.maxWidth = '100vw';
        imgBlock.style.maxHeight = '100vh'; // добавлено
        const img = this.cloneNode(true);
        img.style.width = '100%'; // добавлено
        img.style.height = '100%'; // добавлено
        img.style.objectFit = 'contain';
        imgBlock.appendChild(img);
        imgWrap.appendChild(imgBlock);
        img.addEventListener('click', function () {
            img.parentElement.parentElement.remove();
        });
        document.getElementById('wrapper').appendChild(imgWrap);
    });
}
