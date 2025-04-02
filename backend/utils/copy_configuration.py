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
            'apps.xlmine': '__copy__',
            'apps.core': {
                'routes.root': '__copy__',
                'models.user': '__copy__',
            },
            'apps.commerce': {
                # 'admin': '__copy__',
                'routes.api': '__copy__',
                'controllers': {

                },
                'models': '__copy__',
                'services': '__copy__',
                'serializers': '__copy__',
            },
            'apps.software': {
                # 'admin': '__copy__',
                'routes.api': '__copy__',
                # 'controllers': {
                #     'software': '__copy__',
                #     'license': '__copy__',
                # },
                'models': {
                    'software': '__copy__',
                },
                # 'services': {
                #     'license': '__copy__',
                #     'order': '__copy__',
                #     'software': '__copy__',
                # },
                # 'serializers': {
                #     'software': '__copy__',
                # },
                # 'tasks': {
                #
                # },
            },
        },

        #######################
        #       FRONTEND      #
        #######################

        'xl.frontend.src': {
            'App': '__copy__',
            'Modules': {
                'Auth': '__copy__',
                'Api': '__copy__',
                'Core': {
                    'components': {
                        'Header': '__copy__',
                        'ErrorProvider': '__copy__',
                    }
                },
                'Cabinet': '__copy__',
                # 'Order': '__copy__',
                'Software': '__copy__',
            },
            'Types': {},
            'Utils': {},
            'Redux': '__copy__',
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
            'KeyboardRemap': '__copy__',
            'UI': '__copy__',
            'basewindow': '__copy__',
            'BaseWindow': '__copy__',
            'bind_hk': '__copy__',
            'customhighlighter': '__copy__',
            'customplaintextedit': '__copy__',
            'custom_bar': '__copy__',
            'executer_date_wrapper': '__copy__',
            'hearing_global_binds': '__copy__',
            'loghighlighter': '__copy__',
            'macros': '__copy__',
            'macrosthread': '__copy__',
            'macros_executor': '__copy__',
            'main': '__copy__',
            # 'ocv_utils': '__copy__',
            'warningservice': '__copy__',
            'warningwidget': '__copy__',
            'widgets': '__copy__',
            'xlmacros': '__copy__',
        },

        'Utils': {
            'bind_hk': '__copy__',
            'colorpicker': '__copy__',
            'config_files_manager': '__copy__',
            'funcs': '__copy__',
            # 'gsheet': '__copy__',
            'loggingcategories': '__copy__',
            # 'ocv_utils': '__copy__',
            'qpushbtnanim': '__copy__',
            'serverconnector': '__copy__',
            # 'system_info': '__copy__',
        }
    },
    'xlmine-core': {
        '__start_dir__': r'F:\dev',
        '__exclude__': [
            '__init__',
            'pycache',
            '.pyc',
            '.jar',
            '.png',
        ],
        '__add_paths__': True,

        'xlmine-core': {
            # 'gradle': '__copy__',
            'src': '__copy__',
            # 'gradlew': '__copy__',
            # 'settings': '__copy__',
        },
    },
    'minecraft': {
        '__start_dir__': r'F:\dev\1.20.1net',
        '__exclude__': [
            '__init__',
            'pycache',
            '.pyc',
            '.jar',
            '.png',
        ],
        '__add_paths__': True,

        'minecraftA': {
            'client': {
                'gui': '__copy__',
                'network': {
                    'message': {
                        'MessageHandler': '__copy__',
                        'MessageTrustStatus': '__copy__',
                    },
                    # 'AbstractClientPlayerEntity': '__copy__',
                    'ClientLoginNetworkHandler': '__copy__',
                    'ClientDynamicRegistryType': '__copy__',
                    'ClientPlayerEntity': '__copy__',
                    'ClientPlayerInteractionManager': '__copy__',
                    'ClientPlayNetworkHandler': '__copy__',
                    # 'DataQueryHandler': '__copy__',
                    'LanServerInfo': '__copy__',
                    # 'LanServerQueryManager': '__copy__',
                    # 'OtherClientPlayerEntity': '__copy__',
                    # 'PlayerListEntry': '__copy__',
                    # 'RedirectResolver': '__copy__',
                    # 'SequencedPacketCreator': '__copy__',
                    # 'ServerAddress': '__copy__',
                    'ServerInfo': '__copy__',
                    # 'SocialInteractionsManager': '__copy__',
                },
                'main': {
                    'main': '__copy__',
                },
                'model': {
                    # 'Dilation': '__copy__',
                    # 'Model': '__copy__',
                    # 'ModelData': '__copy__',
                    # 'ModelPart': '__copy__',
                    # 'ModelCuboidData': '__copy__',
                },
                'util': {
                    'math': {
                        'MatrixStack': '__copy__',
                        'Rect2i': '__copy__',
                        'Vector2f': '__copy__',
                    },
                    'ChatMessages': '__copy__',
                    'ClientPlayerTickable': '__copy__',
                    'ClientSamplerSource': '__copy__',
                    # 'Clipboard': '__copy__',
                    # 'InputUtil': '__copy__',
                    'Icons': '__copy__',
                    'Monitor': '__copy__',
                    'MonitorFactory': '__copy__',
                    'MonitorTracker': '__copy__',
                    'NarratorManager': '__copy__',
                    'ProfileKeys': '__copy__',
                    'RawTextureDataLoader': '__copy__',
                    # 'SelectionManager': '__copy__',
                    # 'Session': '__copy__',
                    'Window': '__copy__',
                    'WindowProvider': '__copy__',
                },
                # 'world': {
                #     'ClientWorld': '__copy__',
                # },
                # 'ClientBrandRetriever': '__copy__',
                # 'Keyboard': '__copy__',
                # 'MinecraftClient': '__copy__',
                # 'Mouse': '__copy__',
                'WindowEventHandler': '__copy__',
                'WindowSettings': '__copy__',
            },
            'server': {
                'integrated': {
                    # 'IntegratedPlayerManager': '__copy__',
                    # 'IntegratedServer': '__copy__',
                    # 'IntegratedServerLoader': '__copy__',
                },
            },
        },
    }
}
