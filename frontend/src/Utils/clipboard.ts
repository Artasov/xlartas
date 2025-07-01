// Utils/clipboard.ts

import {Message} from "Core/components/Message";
import i18n from 'i18next';

function copyToClipboard(text: string): void {
    navigator.clipboard.writeText(text)
        .then(() => Message.success(i18n.t('copy_success')))
        .catch((err) => {
            Message.success(i18n.t('copy_error'))
            console.error(err)
        });
}

export default copyToClipboard;