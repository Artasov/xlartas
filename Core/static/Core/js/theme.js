function setThemeById(item) {
    localStorage.removeItem('themeId')
    localStorage.setItem("themeId", JSON.stringify([item]));
    bgImage.setAttribute('themeID', item.toString());
    bgImage.setAttribute('src', `/media/themes/${item.toString()}.jpg/`);
}

const bgImage = document.getElementById('bg-image');
const theme = document.getElementById("theme");
let current_theme_id = 1;
let theme_count = 3


function next_theme() {
    if (current_theme_id >= theme_count) {
        current_theme_id = 0;
    }
    current_theme_id += 1;
    console.log(current_theme_id)
    setThemeById(current_theme_id);
}

if (!isNaN(parseInt(theme.getAttribute("content")))) {
    bgImage.setAttribute('src', `/media/themes/${theme.getAttribute("content")}.jpg`);
} else {
    let themeId = JSON.parse(localStorage.getItem("themeId")) || [];
    if (themeId.length !== 0) {
        current_theme_id = themeId[0];
        if (current_theme_id === 0) {
            current_theme_id = 1
        }
        setThemeById(current_theme_id);
    } else {
        setThemeById(2);
    }
}


