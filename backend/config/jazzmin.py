JAZZMIN_SETTINGS = {
    # Заголовки и логотипы
    'site_title': 'xlartas',
    'site_header': 'xlartas',
    'site_brand': 'xlartas',
    'site_logo': '/core/img/icon/logo.svg',  # Ссылка на логотип
    'site_logo_classes': '',
    'site_icon': '/core/img/icon/logo.svg',  # Ссылка на favicon (32x32 px)

    # Логотип на странице входа
    "login_logo": '/core/img/icon/logo.svg',
    "login_logo_dark": '/core/img/icon/logo.svg',

    # Текст на экране входа
    "welcome_sign": "",

    # Copyright на футере
    "copyright": "xlartas © 2025",

    ############
    # Боковое меню
    ############
    "show_sidebar": True,
    "navigation_expanded": True,  # Меню по умолчанию развернуто
    "hide_apps": [],  # Можно скрыть ненужные приложения
    "hide_models": [],  # Скрытие ненужных моделей
    "order_with_respect_to": [
        "core",
    ],

    # Пользовательские ссылки в боковом меню
    # "custom_links": {

    # },
    "user_avatar": 'avatar',

    #################
    # Модальные окна для связанных объектов
    #################
    "related_modal_active": True,

    ###############
    # Пользовательские CSS и JS файлы
    ###############
    "custom_css": "/admin/css/jazzmin.css",  # Путь к пользовательскому CSS
    "custom_js": "/admin/js/jazzmin.js",  # Путь к пользовательскому JS

    ###############
    # Темная тема и настройки интерфейса
    ###############
    "theme": "darkly",  # Основная тема (темная по умолчанию)
    "dark_mode_theme": "darkly",  # Тема для темного режима

    # Включение переключателя цвета темы и UI-конфигуратора
    # "show_ui_builder": True,

    ####################
    # Дополнительные настройки интерфейса
    ####################
    "navbar_small_text": False,
    "footer_small_text": False,
    "body_small_text": True,
    "brand_small_text": False,
    "brand_colour": "navbar-dark",
    "accent": "accent-lightblue",
    "navbar": "navbar-dark",
    "no_navbar_border": False,
    "navbar_fixed": True,
    "layout_boxed": False,
    "footer_fixed": False,
    "sidebar_fixed": True,
    "sidebar": "sidebar-dark-indigo",
    "sidebar_nav_small_text": False,
    "sidebar_disable_expand": True,
    "sidebar_nav_child_indent": False,
    "sidebar_nav_compact_style": False,
    "sidebar_nav_legacy_style": False,
    "sidebar_nav_flat_style": False,

    "button_classes": {
        "primary": "btn-primary",
        "secondary": "btn-secondary",
        "info": "btn-info",
        "warning": "btn-warning",
        "danger": "btn-danger",
        "success": "btn-success"
    },

    "actions_sticky_top": True,
}

# Дополнительные настройки для пользовательских тем, цветов и кастомизации
JAZZMIN_UI_TWEAKS = {
    "theme": "darkly",  # Темная тема по умолчанию
    "dark_mode_theme": "darkly",  # Тема для темного режима
    "navbar": "navbar-dark",  # Цвет навигационной панели
    "accent": "accent-lightblue",  # Основной акцентный цвет
    "navbar_small_text": False,  # Обычный текст на панели навигации
    "sidebar": "sidebar-dark-indigo",  # Тёмная боковая панель
    "sidebar_nav_small_text": False,  # Обычный текст в боковом меню
    "sidebar_disable_expand": True,  # Отключение разворачивания меню
    "sidebar_nav_child_indent": False,  # Без отступов для вложенных элементов
    "sidebar_nav_compact_style": True,  # Компактный стиль навигации
    "footer_fixed": False,  # Отключение фиксированного футера
    "navbar_fixed": True,  # Фиксированная навигационная панель
    "actions_sticky_top": True,  # Фиксация действий в верхней части страницы
}
