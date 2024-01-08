export function getTodaysDate() {
    const now = new Date();
    return `${now.getDate}-${now.getMonth}-`
}