"use client";
import NextLink, {LinkProps as NextLinkProps} from "next/link";
import {useRouter, usePathname, useSearchParams} from "next/navigation";
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
    const searchParams = useSearchParams();
    return {
        pathname,
        search: searchParams.toString(),
    };
}

function pathToRegex(path: string): RegExp {
    let regex = path
        .replace(/\//g, "\\/")
        .replace(/\./g, "\\.")
        .replace(/:(\w+)/g, "[^/]+")
        .replace(/\*/g, ".*");
    return new RegExp(`^${regex}$`);
}

export const Routes: React.FC<{children: React.ReactNode}> = ({children}) => <>{children}</>;

export const Route: React.FC<{path: string; element: React.ReactNode}> = ({path, element}) => {
    const pathname = usePathname();
    const regex = pathToRegex(path);
    if (regex.test(pathname)) return <>{element}</>;
    return null;
};

export const Outlet: React.FC<{children?: React.ReactNode}> = ({children}) => <>{children}</>;

export const Navigate: React.FC<{to: string}> = ({to}) => {
    const router = useRouter();
    React.useEffect(() => {
        router.push(to);
    }, [to]);
    return null;
};
