// SCC scale chords combinations
let form_SCC = document.querySelector('#scale_chords_combinations')
let btn_SCC_submit = form_SCC.querySelector('.submit')
const inputs_SCC = form_SCC.querySelectorAll('input')
const error_field_SCC = form_SCC.querySelector('.error_field')
const result_container_SCC = form_SCC.querySelector('.result_container')
const btn_close_result_container_close_SCC = result_container_SCC.querySelector('button').cloneNode()

btn_SCC_submit.addEventListener('click', (e) => {
    e.preventDefault();
    for (let i = 0; i < inputs_SCC.length; i++) {
        console.log(inputs_SCC[i].value)
        if (inputs_SCC[i].value === '') {
            error_field_SCC.innerHTML = 'Не все поля заполнены.'
            return;
        }
    }
    error_field_SCC.innerHTML = '';
    const apiUrl = `/harmony/get_scale_chords_combinations/${encodeURIComponent(inputs_SCC[0].value)}/${inputs_SCC[1].value}/${inputs_SCC[2].value}/${inputs_SCC[3].checked ? 1 : 0}/${inputs_SCC[4].value}/${inputs_SCC[5].value}/${encodeURIComponent(inputs_SCC[6].value)}/`
    sendGetRequest(apiUrl, function (error, response) {
        if (error) {
            console.error('Ошибка:', error);
            error_field_SCC.innerHTML = error;
        } else {
            console.log('Ответ:', response);
            const chordProgressions = JSON.parse(response);
            result_container_SCC.innerHTML = '';
            result_container_SCC.appendChild(btn_close_result_container_close_SCC);
            chordProgressions.forEach(progression => {
                result_container_SCC.appendChild(createProgressionEl(progression.join(' - ')));
                result_container_SCC.classList.remove('d-none')
            });
        }
    });
})
btn_close_result_container_close_SCC.addEventListener('click', (e) => {
    e.preventDefault();
    result_container_SCC.innerHTML = '';
    result_container_SCC.classList.add('d-none')
})