export const parseList = (list: string): string[] => {
    return list.split(',').map(s => s.trim());
}
