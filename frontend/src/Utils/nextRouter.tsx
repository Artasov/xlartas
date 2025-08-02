"use client";
import NextLink, {LinkProps as NextLinkProps} from "next/link";
import {
    useParams as useNextParams,
    usePathname,
    useRouter,
    useSearchParams as useNextSearchParams,
} from "next/navigation";
import React from "react";

export interface LinkProps extends Omit<NextLinkProps, 'href'> {
    to?: NextLinkProps['href'];
    href?: NextLinkProps['href'];
}

export const Link: React.FC<LinkProps> = ({to, href, ...props}) => (
    <NextLink href={to ?? href ?? '#'} {...props} />
);

export function useNavigate() {
    const router = useRouter();
    return (href: string | number) => {
        if (typeof href === 'number') router.back();
        else router.push(href);
    };
}

export function useLocation() {
    const pathname = usePathname();
    const searchParams = useNextSearchParams();
    return {
        pathname,
        search: searchParams.toString(),
    };
}

export function useSearchParams() {
    return useNextSearchParams();
}

const ParamsContext = React.createContext<Record<string, string>>({});
const BasePathContext = React.createContext<string>("/");

/**
 * Хук объединяет параметры из собственного роутера и
 * динамических сегментов Next App Router (`next/navigation`).
 * Если компонент находится внутри нашего `<Route>`, приоритет за ними.
 */
export function useParams<
    T extends Record<string, string | undefined> = Record<string, string | undefined>
>(): T {
    const ctxParams = React.useContext(ParamsContext) as T;
    const nextParams = useNextParams() as T;

    // объединяем: контекст перекрывает данные Next.js, что позволяет
    // вложенным `<Route>` работать как раньше.
    return {...nextParams, ...ctxParams};
}

function pathToRegex(path: string): RegExp {
    let regex = path
        .replace(/\//g, "\\/")
        .replace(/\./g, "\\.")
        .replace(/:(\w+)/g, "[^/]+")
        .replace(/\*/g, ".*");
    return new RegExp(`^${regex}$`);
}

export const Routes: React.FC<{ children: React.ReactNode }> = ({children}) => <>{children}</>;

function joinPaths(base: string, path: string) {
    if (path.startsWith('/')) return path;
    if (base.endsWith('/')) return base + path;
    return base + '/' + path;
}

function extractParams(pattern: string, pathname: string) {
    const params: Record<string, string> = {};
    const patternSegments = pattern.replace(/\*.*$/, '').split('/').filter(Boolean);
    const pathnameSegments = pathname.split('/').filter(Boolean);
    patternSegments.forEach((seg, i) => {
        if (seg.startsWith(':')) params[seg.slice(1)] = pathnameSegments[i] ?? '';
    });
    return params;
}

export const Route: React.FC<{ path: string; element: React.ReactNode }> = ({path, element}) => {
    const pathname = usePathname();
    const base = React.useContext(BasePathContext);
    const parentParams = React.useContext(ParamsContext);
    const fullPath = joinPaths(base, path);
    const regex = pathToRegex(fullPath);
    if (!regex.test(pathname)) return null;
    const params = extractParams(fullPath, pathname);
    const childBase = fullPath.replace(/\*.*$/, '');
    return (
        <ParamsContext.Provider value={{...parentParams, ...params}}>
            <BasePathContext.Provider value={childBase}>
                {element}
            </BasePathContext.Provider>
        </ParamsContext.Provider>
    );
};

export const Outlet: React.FC<{ children?: React.ReactNode }> = ({children}) => <>{children}</>;

export const Navigate: React.FC<{ to: string }> = ({to}) => {
    const router = useRouter();
    React.useEffect(() => {
        router.push(to);
    }, [to]);
    return null;
};
