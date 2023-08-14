// SCC scale chords combinations
let form_SCC = document.querySelector('#scale_chords_combinations')
let btn_SCC_submit = form_SCC.querySelector('.submit')
const inputs_SCC = form_SCC.querySelectorAll('input')
const error_field_SCC = form_SCC.querySelector('.error_field')
const result_container_SCC = form_SCC.querySelector('.result_container')
const btn_close_result_container_close_SCC = result_container_SCC.querySelector('button').cloneNode()
let access_upload_SCC = true;
btn_SCC_submit.addEventListener('click', (e) => {
    if (!access_upload_SCC) return;
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
    access_upload_SCC = false;
    fetch(apiUrl)
        .then(response => {
            if (!response.ok) {
                error_field_SCC.innerHTML = response.statusText;
                throw new Error(`${response.status} ${response.statusText}`);

            }
            return response.json();
        })
        .then(chordProgressions => {
            if (!chordProgressions.end) {
                result_container_SCC.innerHTML = '';
                result_container_SCC.appendChild(btn_close_result_container_close_SCC);
                chordProgressions.forEach(progression => {
                    result_container_SCC.appendChild(createProgressionEl(progression.join(' - ')));
                    result_container_SCC.classList.remove('d-none')
                });
            }
            access_upload_SCC = true;
        })
        .catch(error => {
            console.error('An error occurred while fetching the data: ', error);
        });
})
btn_close_result_container_close_SCC.addEventListener('click', (e) => {
    e.preventDefault();
    result_container_SCC.innerHTML = '';
    result_container_SCC.classList.add('d-none')
})