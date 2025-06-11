import React from 'react'
import {Divider, Typography} from '@mui/material'
import {FC} from 'wide-containers'
import {useTheme} from 'Theme/ThemeContext'

interface MacrosInfoProps {
    lang: 'en' | 'ru'
}

const MacrosInfo: React.FC<MacrosInfoProps> = ({lang}) => {
    const {plt} = useTheme()

    if (lang === 'ru') {
        return (
            <FC>
                <Typography
                    variant="h5"
                    sx={{color: plt.text.primary, mb: 2, fontWeight: 600}}
                >
                    Как это работает
                </Typography>
                <Divider sx={{bgcolor: plt.text.primary + '99', mb: 1, mt: .5}}/>

                <Typography sx={{color: plt.text.primary, mb: 1.5}}>
                    Нажмите <strong>ON</strong> рядом с «Wireless Control» в приложении <strong>xlmacros</strong>.
                </Typography>
                <Divider sx={{bgcolor: plt.text.primary + '99', my: 1}}/>

                <Typography sx={{color: plt.text.primary, mb: 1.5}}>
                    Программа установит <strong>WebSocket&nbsp;</strong>- соединение с нашим сервером.
                </Typography>
                <Typography sx={{color: plt.text.primary, my: 1}}>
                    После этого вы сможете использовать функции на этой странице.
                </Typography>
                <Divider sx={{bgcolor: plt.text.primary + '99', my: 1}}/>

                <Typography sx={{color: plt.text.primary, my: 1, fontStyle: 'italic'}}>
                    Если что-то не работает, попробуйте обновить страницу или свяжитесь с нами.
                </Typography>
                <Divider sx={{bgcolor: plt.text.primary + '99', my: 1}}/>

                <Typography sx={{color: plt.text.primary, my: 1}}>
                    <strong>Важно:&nbsp;</strong>
                    мы не несем ответственности за сохранность пароля, cookie и других данных вашего браузера.
                </Typography>

                <Divider sx={{bgcolor: plt.text.primary + '99', my: 1}}/>
                <Typography sx={{color: plt.text.primary, mt: 1, fontSize: '0.9rem'}}>
                    Тестировалось на последних версиях <strong>Chrome</strong> (Desktop/Mobile).
                </Typography>
            </FC>
        )
    } else {
        return (
            <FC>
                <Typography
                    variant="h5"
                    sx={{color: plt.text.primary, my: 1, fontWeight: 600}}
                >
                    How It Works
                </Typography>
                <Divider sx={{bgcolor: plt.text.primary + '99', mb: 1, mt: .5}}/>

                <Typography sx={{color: plt.text.primary, my: 1}}>
                    Click <strong>ON</strong> next to “Wireless Control” in the <strong>xlmacros</strong> app.
                </Typography>
                <Divider sx={{bgcolor: plt.text.primary + '99', my: 1}}/>

                <Typography sx={{color: plt.text.primary, my: 1}}>
                    The app opens a <strong>WebSocket</strong> connection to our server.
                </Typography>
                <Typography sx={{color: plt.text.primary, my: 1}}>
                    After that, you can use the functions on this page.
                </Typography>
                <Divider sx={{bgcolor: plt.text.primary + '99', my: 1}}/>

                <Typography sx={{color: plt.text.primary, my: 1, fontStyle: 'italic'}}>
                    If something doesn’t work, try refreshing the page or contact us.
                </Typography>
                <Divider sx={{bgcolor: plt.text.primary + '99', my: 1}}/>

                <Typography sx={{color: plt.text.primary, mb: 1}}>
                    <strong>Note:&nbsp;</strong>
                    we are not responsible for safeguarding your password, cookies, or browser data.
                </Typography>
                <Divider sx={{bgcolor: plt.text.primary + '99', my: 1}}/>

                <Typography sx={{color: plt.text.primary, my: 1, fontSize: '0.9rem'}}>
                    Tested on the latest <strong>Chrome</strong> (Desktop/Mobile).
                </Typography>
            </FC>
        )
    }
}

export default MacrosInfo
