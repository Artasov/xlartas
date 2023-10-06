const popoverTriggerList = document.querySelectorAll('[data-bs-toggle="popover"]')
const popoverList = [...popoverTriggerList].map(popoverTriggerEl => new bootstrap.Popover(popoverTriggerEl, {trigger: 'focus'}))

const tooltipTriggerList = document.querySelectorAll('[data-bs-toggle="tooltip"]')
const tooltipList = [...tooltipTriggerList].map(tooltipTriggerEl => new bootstrap.Tooltip(tooltipTriggerEl))

function set_choosed_radio(obj, className) {
    let all_btn_radio = document.getElementsByClassName('btn-radio')
    for(let i = 0; i < all_btn_radio.length; i++){
        all_btn_radio[i].classList.remove(className)
    }
    obj.classList.add(className)
}






