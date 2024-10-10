export function getListQuery(startIndex: number, list: any[]) {
    let query = `(`
    let listLength = list.length;
    for(let i = startIndex; i < startIndex + listLength - 1; i++) {
        query += `$${i}, `;
    }
    query += `$${startIndex + listLength - 1})`;
    return query;
}