# config/copy_conf.py

########################
# Это пример конфигурации adjango для частичного копирования проекта в буфер обмена.
# Сделай себе рядом свою конфигурацию copy_configuration.py (уже в .gitignore)
########################

configurations = {
    #######################
    #         BASE        #
    #######################
    'base': {
        '__start_dir__': r'F:\dev',
        '__exclude__': [
            '__init__',
            'pycache',
            '.pyc',
        ],
        '__add_paths__': True,

        #######################
        #       BACKEND       #
        #######################

        'xl.backend': {
            # 'config.settings': '__copy__',
            # 'apps.shop': '__copy__',
            # 'apps.mailing': '__copy__',
            # 'apps.analytics': '__copy__',
            'apps.converter': '__copy__',
            # 'apps.freekassa': '__copy__',
            # 'apps.tbank': '__copy__',
            # 'apps.cloudpayments': '__copy__',
            # 'apps.core': {
            #     'routes.root': '__copy__',
            #     'routes.api': '__copy__',
            #     'models.user': '__copy__',
            # },
            # 'apps.commerce': {
            #     'admin': '__copy__',
            # 'routes.api': '__copy__',
            # 'controllers': {
            #
            # },
            # 'models': '__copy__',
            # 'services': '__copy__',
            # 'serializers': '__copy__',
            # },
            # 'apps.software': {
            #     'admin': '__copy__',
            # 'consumers': '__copy__',
            # 'routes.api': '__copy__',
            # 'routes.ws': '__copy__',
            # 'controllers': {
            #     'software': '__copy__',
            #     'license': '__copy__',
            # },
            # 'models': {
            #     'software': '__copy__',
            # },
            # 'services': {
            # 'license': '__copy__',
            # 'order': '__copy__',
            # 'software': '__copy__',
            # },
            # 'serializers': {
            #     'software': '__copy__',
            # },
            # 'tasks': {
            #
            # },
            # },
        },

        #######################
        #       FRONTEND      #
        #######################

        'xl.frontend.src': {
            # 'App': '__copy__',
            'Modules': {
                # 'Auth': '__copy__',
                # 'Api': '__copy__',
                # 'Core': {
                #     'components': {
                # 'Header': '__copy__',
                # 'ErrorProvider': '__copy__',
                # }
                # },
                # 'Cabinet': '__copy__',
                # 'Order': '__copy__',
                # 'Software': {
                #     'Macros': '__copy__',
                # },
                # 'xLMine': '__copy__',
            },
            'Types': {},
            'Utils': {},
            # 'Redux': '__copy__',
        }
    },
    #######################
    #       XLMACROS      #
    #######################
    'xlmacros': {
        '__start_dir__': r'E:\nonExistence\Code\Qt6',
        '__exclude__': [
            '__init__',
            'pycache',
            '.pyc',
            'xlmacros.ui',
        ],
        '__add_paths__': True,

        'xlmacros.xlmacros': {
            # 'KeyboardRemap': '__copy__',
            # 'UI': '__copy__',
            # 'basewindow': '__copy__',
            # 'BaseWindow': '__copy__',
            # 'bind_hk': '__copy__',
            # 'customhighlighter': '__copy__',
            # 'customplaintextedit': '__copy__',
            # 'custom_bar': '__copy__',
            # 'executer_date_wrapper': '__copy__',
            # 'hearing_global_binds': '__copy__',
            # 'loghighlighter': '__copy__',
            'macros': '__copy__',
            # 'macrosthread': '__copy__',
            # 'macros_executor': '__copy__',
            'main': '__copy__',
            # 'ocv_utils': '__copy__',
            # 'warningservice': '__copy__',
            # 'warningwidget': '__copy__',
            # 'widgets': '__copy__',
            'websockethandler': '__copy__',
            'xlmacros': '__copy__',
        },

        'Utils': {
            # 'bind_hk': '__copy__',
            # 'colorpicker': '__copy__',
            # 'config_files_manager': '__copy__',
            # 'funcs': '__copy__',
            # 'gsheet': '__copy__',
            # 'loggingcategories': '__copy__',
            # 'ocv_utils': '__copy__',
            # 'qpushbtnanim': '__copy__',
            'serverconnector': '__copy__',
            # 'system_info': '__copy__',
        }
    },
    'xlmine-core': {
        '__start_dir__': r'F:\dev\xlmine',
        '__exclude__': [
            '__init__',
            'pycache',
            '.pyc',
            '.jar',
            '.png',
            '.java~',
        ],
        '__add_paths__': True,

        'xlmine-core': {
            # 'gradle': '__copy__',
            'src': '__copy__',
            # 'gradlew': '__copy__',
            # 'settings': '__copy__',
        },
    },
    'xlchat': {
        '__start_dir__': r'F:\dev\xlmine',
        '__exclude__': [
            '__init__',
            'pycache',
            '.pyc',
            '.jar',
            '.png',
            '.java~',
        ],
        '__add_paths__': True,

        'xlchat': {
            # 'gradle': '__copy__',
            'src': '__copy__',
            # 'gradlew': '__copy__',
            # 'settings': '__copy__',
        },
    },
    'xlduels': {
        '__start_dir__': r'F:\dev\xlmine',
        '__exclude__': [
            '__init__',
            'pycache',
            'resources',
            '.pyc',
            '.jar',
            '.png',
            '.java~',
        ],
        '__add_paths__': True,

        'xlduels': {
            # 'gradle': '__copy__',
            'src': '__copy__',
            # 'gradlew': '__copy__',
            # 'settings': '__copy__',
        },
    },
    'xlmine-launcher': {
        '__start_dir__': r'F:\dev',
        '__exclude__': [
            '__init__',
            'pycache',
            '.pyc',
            '.jar',
            '.png',
            '.java~',
        ],
        '__add_paths__': True,

        'xlmine-launcher': {
            # 'gradle': '__copy__',
            'src': '__copy__',
            'package': '__copy__',
            'index': '__copy__',
            # 'gradlew': '__copy__',
            # 'settings': '__copy__',
        },
    },
}
