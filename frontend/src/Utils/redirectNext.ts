// Utils/redirectNext.ts
import pprint from 'Utils/pprint';

/* Минимальный тип, совместимый с вашим useLocation (нам нужны только поля ниже) */
export type LocationLike = {
    pathname: string;
    search: string;
};

export function redirectNext(navigate: (url: string) => void, location: LocationLike) {
    const queryParams = new URLSearchParams(location.search);

    const nextUrl = queryParams.get('next') || '/';
    queryParams.delete('next');

    const remainingParams = queryParams.toString();

    let finalUrl = nextUrl;
    if (remainingParams) {
        finalUrl += finalUrl.includes('?') ? `&${remainingParams}` : `?${remainingParams}`;
    }

    pprint(finalUrl);
    navigate(finalUrl);
}

export function redirectWithNextBack(
    navigate: (url: string) => void,
    location: LocationLike,
    targetUrl: string
) {
    const queryParams = new URLSearchParams(location.search);

    const currentUrl = `${location.pathname}${location.search}`;
    queryParams.set('next', currentUrl);

    const remainingParams = queryParams.toString();

    let finalUrl = targetUrl;
    if (remainingParams) {
        finalUrl += targetUrl.includes('?') ? `&${remainingParams}` : `?${remainingParams}`;
    }

    pprint(finalUrl);
    navigate(finalUrl);
}
