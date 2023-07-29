function showModal(id) {
    console.log(1   )
    const modal = document.getElementById(id);
    modal.style.display = 'flex';
}
function closeModal(id) {
    let modal = document.getElementById(id);
    modal.style.display = 'none';
}