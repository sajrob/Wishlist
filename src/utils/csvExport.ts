export function exportToCSV(data: any[], filename: string) {
    if (!data || data.length === 0) return;

    // Get keys from first object
    const headers = Object.keys(data[0]);

    // Create CSV rows
    const csvRows = [
        headers.join(','), // header row
        ...data.map(row =>
            headers.map(fieldName => {
                const value = row[fieldName];
                const stringValue = value !== null && value !== undefined ? String(value) : '';
                // Escape quotes and wrap in quotes if contains comma
                const escaped = stringValue.replace(/"/g, '""');
                return `"${escaped}"`;
            }).join(',')
        )
    ];

    const csvString = csvRows.join('\n');
    const blob = new Blob([csvString], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);

    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `${filename}_${new Date().toISOString().split('T')[0]}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
}
