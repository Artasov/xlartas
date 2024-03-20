const audioPlayer = document.getElementById('audio-player');
const playBtn = document.getElementById('play-audio-btn');
playBtn.addEventListener('click', function () {
    if (this.classList.contains('btn-play-active')) {
        audioPlayer.pause();
        audioPlayer.currentTime = 0;
        this.classList.remove('btn-play-active');
    } else {
        audioPlayer.play();
        this.classList.add('btn-play-active');
    }
})
audioPlayer.addEventListener('pause', function () {
    playBtn.classList.remove('btn-play-active');
})