document.getElementById('burger-btn').addEventListener('click', async function () {
    let signInBtn = document.getElementById('signIn-btn');
    signInBtn.style.display = 'inline';
})

$('.dropdown-menu').click(function(e) {e.stopPropagation();});

if (document.getElementsByClassName('_touch').length !== 0 &&
    window.screen.width < window.screen.height){
    document.getElementsByClassName('only-pc')[0].remove();
    let signIn_dropdown = document.getElementById('signin-dropdown');
    let signIn_dropdown_link = document.getElementById('signin-dropdown-link');
    signIn_dropdown.classList.remove('dropdown');
    signIn_dropdown_link.classList.remove('dropdown-toggle');
    signIn_dropdown_link.classList.remove('dropdown-toggle-without_arrow');
    signIn_dropdown_link.removeAttribute('data-bs-toggle');
    document.getElementsByTagName('nav')[0].classList.add('backdrop-blur-20')
    let signup_dropdown_link = document.getElementById('signup-dropdown-link');
    if (signup_dropdown_link){
        signup_dropdown_link.style.display = 'block';
    }
    signIn_dropdown_link.getElementsByTagName('i')[0].remove();
    document.getElementById('menu-divider').style.display = 'block';
}