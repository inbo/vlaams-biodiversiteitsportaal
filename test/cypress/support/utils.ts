export function getFileNameTimeStamp(): string {
    const date = new Date();
    return `${date.getFullYear()}-${
        date.getMonth() + 1
    }-${date.getDate()}_${date.getHours()}-${date.getMinutes()}-${date.getSeconds()}`;
}

export function getTestOccurrenceCsv(scientificName: string): string {
    const occurrenceId =
        `TEST:${scientificName.replace(/\s+/g, "_")}:${Date.now()}`;

    return `"scientificName","eventDate","decimalLatitude","decimalLongitude","occurrenceID"
"${scientificName}","2025-03-10T11:54:00+01:00",50.8791,4.7025,"${occurrenceId}"`;
}

export const TEST_LIST_PREFIX = "E2E automated test list";
