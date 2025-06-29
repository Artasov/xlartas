// UI/LanguageSwitcher.tsx
import React from 'react'
import {useTheme} from 'Theme/ThemeContext'

interface LanguageSwitcherProps {
    lang: 'en' | 'ru'
    onChange: (lang: 'en' | 'ru') => void
}

const LanguageSwitcher: React.FC<LanguageSwitcherProps> = ({lang, onChange}) => {
    const {plt} = useTheme()

    const btnStyle: React.CSSProperties = {
        width: 32,
        height: 32,
        padding: 0,
        fontSize: 24,
        lineHeight: 1,
        background: 'transparent',
        border: 'none',
        cursor: 'pointer',
    }

    return (
        <div style={{display: 'flex', gap: 8}}>
            <button
                style={{
                    ...btnStyle,
                    opacity: lang === 'en' ? 1 : 0.4,
                    fontWeight: 800,
                }}
                onClick={() => onChange('en')}
            >
                EU
            </button>
            <button
                style={{
                    ...btnStyle,
                    opacity: lang === 'ru' ? 1 : 0.4,
                    fontWeight: 800,
                }}
                onClick={() => onChange('ru')}
            >
                RU
            </button>
        </div>
    )
}

export default LanguageSwitcher
