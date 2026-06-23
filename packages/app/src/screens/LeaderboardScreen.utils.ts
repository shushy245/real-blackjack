const MONTH_LABELS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

export const formatDate = (iso: string): string => {
    const d = new Date(iso);
    const month = MONTH_LABELS[d.getMonth()] ?? '';

    return `${month} ${d.getDate()}, ${d.getFullYear()}`;
};

export const rankLabel = (rank: number): string => (rank <= 9 ? `0${rank}` : `${rank}`);
