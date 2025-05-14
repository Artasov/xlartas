# seordj/utils.py
from typing import Optional

from django.templatetags.static import static
from django.utils.safestring import mark_safe


def generate_seo_tags(
        request,
        description: str = "Better dev. production",
        keywords: str = "софт, автоматизация, xlmine, minecraft, vimeworld, cristalix, кристаликс, вайм, software, кликер, pvp, clicker, пвп",
        author: str = "xlartas",
        title: str = "xlartas",
        og_title: Optional[str] = None,  # Если None, возьмём из title
        og_description: Optional[str] = None,  # Если None, возьмём из description
        og_image_path: str = "favicon.ico",  # относительный путь в static
        og_url: Optional[str] = None,  # Если None, возьмём из запроса
        og_type: str = "website",
        twitter_card: str = "summary_large_image",
        twitter_title: Optional[str] = None,
        twitter_description: Optional[str] = None,
        twitter_image_path: str = "favicon.ico",
        canonical: Optional[str] = None,
        robots: str = 'noindex, nofollow',
) -> str:
    """
    Генерирует блок HTML-метатегов для SEO.
    """

    # Подставляем по-умолчанию
    og_title = og_title or title
    og_description = og_description or description
    twitter_title = twitter_title or title
    twitter_description = twitter_description or description

    # canonical и og_url
    if not canonical:
        canonical = request.build_absolute_uri()
    if not og_url:
        og_url = canonical

    # Получаем URL к статике
    favicon_url = request.build_absolute_uri(static("favicon.ico"))
    og_image_url = request.build_absolute_uri(static(og_image_path))
    twitter_image_url = request.build_absolute_uri(static(twitter_image_path))

    html = f"""
    <title>{title}</title>
    <meta name="description" content="{description}" />
    <meta name="keywords" content="{keywords}" />
    <meta name="author" content="{author}" />

    <meta property="og:title" content="{og_title}" />
    <meta property="og:description" content="{og_description}" />
    <meta property="og:image" content="{og_image_url}" />
    <meta property="og:url" content="{og_url}" />
    <meta property="og:type" content="{og_type}" />

    <meta name="twitter:card" content="{twitter_card}" />
    <meta name="twitter:title" content="{twitter_title}" />
    <meta name="twitter:description" content="{twitter_description}" />
    <meta name="twitter:image" content="{twitter_image_url}" />

    <link rel="canonical" href="{canonical}" />
    <link rel="shortcut icon" href="{favicon_url}" type="image/x-icon" />
    <meta name="robots" content="{robots}" />
    """
    # Помечаем как безопасный, чтобы Django не экранировал теги
    return mark_safe(html)
