class Client {
    constructor() {
    }

    static getCookie(name) {
        const value = "; " + document.cookie;
        const parts = value.split("; " + name + "=");
        if (parts.length === 2) return parts.pop().split(";").shift();
    }

    static getProtocolAndDomain() {
        return `${window.location.protocol}//${window.location.host}`;
    }

    static getParamsFromCurrentURL() {
        const params = new URLSearchParams(window.location.search);
        const result = {};
        for (const [key, value] of params.entries()) {
            result[key] = value;
        }
        return result;
    }

    static async sendPost(url, params) {
        const formData = new FormData();
        for (const key in params) {
            if (Array.isArray(params[key])) {
                formData.append(key, JSON.stringify(params[key]));
            } else {
                formData.append(key, params[key]);
            }
        }

        const csrftoken = this.getCookie('csrftoken');
        console.log('CSRF Token:', csrftoken); // Логируем токен

        const response = await fetch(url, {
            method: 'POST',
            headers: {
                'X-CSRFToken': csrftoken
            },
            body: formData
        });

        if (!response.ok) {
            console.error('Error:', response.statusText);  // Логирование ошибки
            throw new Error('Failed to fetch log content');
        }

        // Парсим только один раз, если ответ содержит JSON
        const contentType = response.headers.get('content-type');
        let responseData = null;
        if (contentType && contentType.includes('application/json')) {
            responseData = await response.json();  // Читаем тело ответа как JSON
        } else {
            console.warn('Ответ не содержит JSON данных');
        }

        return responseData;
    }


    static async sendGet(url, params) {
        const queryString = Object.keys(params).map(key => encodeURIComponent(key) + '=' + encodeURIComponent(params[key])).join('&');
        const response = await fetch(`${url}?${queryString}`, {
            method: 'GET'
        });

        if (!response.ok) {
            console.error('Error:', response.statusText);  // Логирование ошибки
            throw new Error('Failed to fetch log content');
        }

        const contentType = response.headers.get('content-type');
        if (!contentType || !contentType.includes('application/json')) {
            throw new TypeError("Expected JSON, but received something else");
        }

        response.data = await response.json();
        return response;
    }


}


// Пример использования класса Client
// const client = new Client();
// const postParams = { name: 'John', age: 30 };
// const getParams = { query: 'info' };
//
// client.sendPost('https://example.com/api/post', postParams)
//     .then(response => console.log('POST Response:', response))
//     .catch(error => console.error('POST Error:', error));
//
// client.sendGet('https://example.com/api/get', getParams)
//     .then(response => console.log('GET Response:', response))
//     .catch(error => console.error('GET Error:', error));
