// Core/components/Head.tsx
import React from 'react';
import {Helmet} from 'react-helmet-async';

interface HeadProps {
    title?: string;
    description?: string;
    keywords?: string;
    author?: string;
    robots?: string;
    charset?: string;
    language?: string;
    viewport?: string;

    // Open Graph
    ogTitle?: string;
    ogDescription?: string;
    ogImage?: string;
    ogUrl?: string;
    ogType?: string;
    ogVideo?: string;
    ogAudio?: string;
    ogSiteName?: string;
    ogLocale?: string;

    // Twitter
    twitterTitle?: string;
    twitterDescription?: string;
    twitterImage?: string;
    twitterUrl?: string;
    twitterCreator?: string;

    // Apple-specific
    appleTouchIcon?: string;
    mobileWebAppCapable?: string;

    twitterCard?: string;
    twitterSite?: string;
    twitterDomain?: string;
    icon?: string;

    // Canonical
    canonicalUrl?: string;
}

const Head: React.FC<HeadProps> = (
    {
        title,
        description,
        keywords,
        author,
        robots,
        charset = 'UTF-8',
        language = 'ru',
        viewport = 'width=device-width,initial-scale=1.0, maximum-scale=1.0, user-scalable=0',

        // Open Graph
        ogTitle,
        ogDescription,
        ogImage,
        ogUrl,
        ogType = 'website',
        ogVideo,
        ogAudio,
        ogSiteName,
        ogLocale,

        // Twitter
        twitterTitle,
        twitterDescription,
        twitterImage,
        twitterUrl,
        twitterCreator,

        // Apple-specific
        appleTouchIcon,
        mobileWebAppCapable = 'yes',

        twitterCard = 'summary_large_image',
        twitterSite,
        twitterDomain,
        icon,
        // Canonical
        canonicalUrl
    }) => {

    return (
        <Helmet>
            {/* Общие Meta Теги */}
            {title && <title>{title}</title>}
            {description && <meta name="description" content={description}/>}
            {keywords && <meta name="keywords" content={keywords}/>}
            {author && <meta name="author" content={author}/>}
            {robots && <meta name="robots" content={robots}/>}
            <meta charSet={charset}/>
            <meta httpEquiv="Content-Language" content={language}/>
            <meta name="viewport" content={viewport}/>

            {/* Open Graph Meta Теги */}
            {ogTitle && <meta property="og:title" content={ogTitle || title || ''}/>}
            {ogDescription && <meta property="og:description" content={ogDescription || description || ''}/>}
            {ogImage && <meta property="og:image" content={ogImage}/>}
            {ogUrl && <meta property="og:url" content={ogUrl}/>}
            {ogType && <meta property="og:type" content={ogType}/>}
            {ogVideo && <meta property="og:video" content={ogVideo}/>}
            {ogAudio && <meta property="og:audio" content={ogAudio}/>}
            {ogSiteName && <meta property="og:site_name" content={ogSiteName}/>}
            {ogLocale && <meta property="og:locale" content={ogLocale}/>}

            {/* Twitter Meta Теги */}
            {twitterTitle && <meta name="twitter:title" content={twitterTitle || title || ''}/>}
            {twitterDescription && <meta name="twitter:description" content={twitterDescription || description || ''}/>}
            {twitterImage && <meta name="twitter:image" content={twitterImage}/>}
            {twitterUrl && <meta name="twitter:url" content={twitterUrl}/>}
            {twitterCreator && <meta name="twitter:creator" content={twitterCreator}/>}
            {twitterCard && <meta name="twitter:card" content={twitterCard}/>}
            {twitterSite && <meta name="twitter:site" content={twitterSite}/>}
            {twitterDomain && <meta property="twitter:domain" content={twitterDomain}/>}

            {/* Apple-specific Meta Теги */}
            {appleTouchIcon && <link rel="apple-touch-icon" href={appleTouchIcon}/>}
            {mobileWebAppCapable && <meta name="mobile-web-app-capable" content={mobileWebAppCapable}/>}

            {/* Канонический URL */}
            {canonicalUrl && <link rel="canonical" href={canonicalUrl}/>}

            {/* Favicon */}
            {icon && <link rel="icon" type="image/png" href={icon} sizes="16x16"/>}
        </Helmet>
    );
};

export default Head;
