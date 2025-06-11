export function getFileNameTimeStamp(): string {
    const date = new Date();
    return `${date.getFullYear()}-${
        date.getMonth() + 1
    }-${date.getDate()}_${date.getHours()}-${date.getMinutes()}-${date.getSeconds()}`;
}
