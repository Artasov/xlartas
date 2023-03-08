const bgImage = document.getElementById('bg-image');

function setThemeById(item) {
    localStorage.removeItem('themeId')
    localStorage.setItem("themeId", JSON.stringify([item]));
    bgImage.setAttribute('themeID', item.toString());
    bgImage.setAttribute('src', `/media/themes/${item.toString()}.jpg/`);
}
function checkTheme(){
    let themeId = JSON.parse(localStorage.getItem("themeId")) || [];
    if (themeId.length !== 0){
        setThemeById(themeId[0]);
    } else {
        setThemeById(1);
    }
}
checkTheme();