// Utils/formatFileSize.ts
export default function formatFileSize(size: number | null | undefined): string {
    if (!size) return '0 B';
    const units = ['B', 'KB', 'MB', 'GB'];
    let u = 0;
    let s = size;
    while (s >= 1024 && u < units.length - 1) {
        s /= 1024;
        u++;
    }
    return `${s.toFixed(u === 0 ? 0 : 1)} ${units[u]}`;
}
