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
            'apps.core': {
                'routes.root': '__copy__',
            },
            'apps.commerce': {
                'routes.api': '__copy__',
                'controllers': {

                },
                'models': '__copy__',
                'services': '__copy__',
                'serializers': '__copy__',
            },
            'apps.software': {
                'routes.api': '__copy__',
                'controllers': {
                    'software': '__copy__',
                    'license': '__copy__',
                },
                'models': {
                    'software': '__copy__',
                },
                'services': {
                    'license': '__copy__',
                    'order': '__copy__',
                    'software': '__copy__',
                },
                'serializers': {
                    'software': '__copy__',
                },
                'tasks': {

                },
            },
        },

        #######################
        #       FRONTEND      #
        #######################

        'xl.frontend.src': {
            'App': '__copy__',
            'Modules': {
                # 'Auth': '__copy__',
                # 'Core': {
                #     'ErrorProvider.ErrorProvider': '__copy__',
                # },
                'Cabinet': '__copy__',
                'Order': '__copy__',
                'Software': '__copy__',
            },
            'Types': {},
            'Utils': {},
        }
    },
    'config_v_2': {
        ...
    }
}
