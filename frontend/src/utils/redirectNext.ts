// core/services/base/redirectNext.ts
import {Location} from 'react-router-dom';
import pprint from 'Utils/pprint';

export function redirectNext(navigate: (url: string) => void, location: Location) {
    const queryParams = new URLSearchParams(location.search);

    // Извлекаем значение параметра `next` и удаляем его из параметров
    const nextUrl = queryParams.get('next') || '/'; // Если `next` не указан, редирект на корневую страницу
    queryParams.delete('next');

    // Собираем оставшиеся параметры
    const remainingParams = queryParams.toString();

    // Строим новый URL для редиректа
    let finalUrl = nextUrl;

    // Добавляем оставшиеся параметры GET, если они есть
    if (remainingParams) {
        finalUrl += finalUrl.includes('?') ? `&${remainingParams}` : `?${remainingParams}`;
    }
    pprint(finalUrl)
    // Выполняем редирект с помощью navigate
    navigate(finalUrl);
}

export function redirectWithNextBack(navigate: (url: string) => void, location: Location, targetUrl: string) {
    const queryParams = new URLSearchParams(location.search);
    // Сохраняем текущий URL как `next` для будущего редиректа
    const currentUrl = `${location.pathname}${location.search}`;
    // Добавляем параметр `next` в новый URL
    queryParams.set('next', currentUrl);
    // Собираем параметры запроса для редиректа
    const remainingParams = queryParams.toString();
    // Формируем итоговый URL для редиректа
    let finalUrl = targetUrl;
    // Добавляем параметры GET
    if (remainingParams) {
        finalUrl += targetUrl.includes('?') ? `&${remainingParams}` : `?${remainingParams}`;
    }
    // Выполняем редирект с помощью navigate
    pprint(finalUrl)
    navigate(finalUrl);
}
