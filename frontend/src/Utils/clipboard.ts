// core/services/base/clipboard.ts

import {Message} from "Core/components/Message";

function copyToClipboard(text: string): void {
    navigator.clipboard.writeText(text)
        .then(() => Message.success('Скопировано'))
        .catch((err) => {
            Message.success('Ошибка копирования текста.')
            console.error(err)
        });
}

export default copyToClipboard;