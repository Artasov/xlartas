// Utils/clipboard.ts

import {Message} from "Core/components/Message";

function copyToClipboard(text: string): void {
    navigator.clipboard.writeText(text)
        .then(() => Message.success('Copied'))
        .catch((err) => {
            Message.success('Text copying error')
            console.error(err)
        });
}

export default copyToClipboard;