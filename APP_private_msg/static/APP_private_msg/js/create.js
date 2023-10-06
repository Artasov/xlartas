const popover = new bootstrap.Popover('.popover-dismiss', {trigger: 'focus'})

const textarea = document.querySelector('textarea');
textarea.addEventListener('input', autoResize);

function autoResize() {
  this.style.height = 'auto';
  this.style.height = this.scrollHeight + 'px';
  this.scrollTop = this.scrollHeight;
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
const dragDropRpFile = document.getElementById('drag_drop_rp_file');
dragDropRpFile.addEventListener('click', function () {
    fileInput.click();
})
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
fileInput.addEventListener('change', function () {
    setFileValue(fileInput.files);
})

function setFileValue(files) {
    fileInput.files = files;
    document.getElementById('drag_drop_rp_file-name').textContent = files[0].name;
}


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
            if (response.data.key){
                const success = document.getElementById('success');
                success.classList.remove('d-none');
                success.innerHTML = `Успешно, вот
                <a class="text-primary" href="/private-msg/${response.data.key}">ссылка на ваше сообщение</a>.`
            }
        } else {
            const response = JSON.parse(xhr.responseText);
            showInvalid(response.data);
            btn_submit.classList.remove('d-none');
        }
    };
    xhr.send(formData);
});

// REC
const recordBtn = document.getElementById('record-btn');
const audioPlayer = document.getElementById('audio-player');
const audioInput = document.getElementById('audio-file');
const playBtn = document.getElementById('play-audio-btn');

let recorder, chunks = [];

async function startRecording() {
    const stream = await navigator.mediaDevices.getUserMedia({audio: true});
    recorder = new MediaRecorder(stream);
    recorder.addEventListener('dataavailable', e => {
        chunks.push(e.data);
    });

    recorder.addEventListener('stop', () => {
        const blob = new Blob(chunks, {type: 'audio/ogg'});
        audioPlayer.src = URL.createObjectURL(blob);
        let file = new File([blob], "voice_msg.ogg", {
            type: "audio/mp3",
            lastModified: new Date().getTime()
        });
        let container = new DataTransfer();
        container.items.add(file);
        audioInput.files = container.files;
    });

    recorder.start();
}

function stopRecording() {
    recorder.stop();
    chunks = [];
}

recordBtn.addEventListener('click', () => {
    if (recorder && recorder.state === 'recording') {
        stopRecording();
        recordBtn.classList.remove('btn-rec-active')
        playBtn.classList.remove('d-none');
    } else {
        startRecording();
        recordBtn.classList.add('btn-rec-active')
    }
});
playBtn.addEventListener('click', function () {
    if (playBtn.classList.contains('btn-play-active')) {
        audioPlayer.pause();
        audioPlayer.currentTime = 0;
        playBtn.classList.remove('btn-play-active');
    } else {
        audioPlayer.play();
        playBtn.classList.add('btn-play-active');
    }
})
audioPlayer.addEventListener('pause', function () {
    playBtn.classList.remove('btn-play-active');
})
