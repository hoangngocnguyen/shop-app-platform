/**
 * Utility functions for normalizing and preprocessing Markdown content
 * before passing to ReactMarkdown.
 *
 * Resolves common Markdown formatting issues:
 * 1. Accidental whitespace inside bold markers: `** text**` or `**text **` -> `**text**`
 * 2. Accidental whitespace inside underscore bold markers: `__ text__` -> `__text__`
 * 3. Headings missing a space after #: `###Tiêu đề` -> `### Tiêu đề`
 * 4. Markdown tables missing a blank line separator when following paragraph text
 * 5. Legacy CSV table blocks (`Tính năng,Chi tiết`) converted into GFM Markdown tables
 */

export function normalizeMarkdown(content?: string | null): string {
    if (!content) return "";

    // 1. Đồng bộ ngắt dòng
    let normalized = content.replace(/\r\n/g, "\n");

    // 2. Tự động chuyển đổi khối bảng CSV (Tính năng,Chi tiết) thành bảng Markdown GFM
    const lines = normalized.split("\n");
    const result: string[] = [];
    let inCsv = false;
    let csvLines: string[] = [];

    const flushCsv = () => {
        if (csvLines.length >= 2) {
            const headerCols = csvLines[0]
                .split(",")
                .map((c) => c.trim().replace(/^"|"$/g, ""));
            result.push("");
            result.push(`| ${headerCols.join(" | ")} |`);
            result.push(`| ${headerCols.map(() => ":---").join(" | ")} |`);
            for (let i = 1; i < csvLines.length; i++) {
                const row = csvLines[i];
                // Tách cột CSV hỗ trợ trường hợp có dấu ngoặc kép bọc chuỗi chứa dấu phẩy
                const matches = row.match(/("(?:""|[^"])*"|[^,]+)/g) || [row];
                const cols = matches.map((c) =>
                    c.trim().replace(/^"|"$/g, "").replace(/""/g, '"')
                );
                const key = cols[0] || "";
                const val = cols.slice(1).join(" - ") || "";
                result.push(`| **${key}** | ${val} |`);
            }
            result.push("");
        } else {
            result.push(...csvLines);
        }
        csvLines = [];
        inCsv = false;
    };

    for (const line of lines) {
        const trimmed = line.trim();
        if (
            trimmed === "Tính năng,Chi tiết" ||
            trimmed === "Thông số,Chi tiết" ||
            trimmed === "Đặc tính,Chi tiết"
        ) {
            if (inCsv) flushCsv();
            inCsv = true;
            csvLines.push(trimmed);
        } else if (inCsv) {
            if (trimmed && (trimmed.includes(",") || trimmed.startsWith('"'))) {
                csvLines.push(trimmed);
            } else {
                flushCsv();
                result.push(line);
            }
        } else {
            result.push(line);
        }
    }
    if (inCsv) flushCsv();
    normalized = result.join("\n");

    // 3. Khắc phục dấu cách bên trong cặp in đậm `**`: `** text**` hoặc `**text **` -> `**text**`
    normalized = normalized.replace(/\*\*\s*([^*\n]+?)\s*\*\*/g, (match, p1) => {
        const trimmed = p1.trim();
        return trimmed ? `**${trimmed}**` : match;
    });

    // 4. Khắc phục dấu cách bên trong cặp in đậm `__`
    normalized = normalized.replace(/__\s*([^_\n]+?)\s*__/g, (match, p1) => {
        const trimmed = p1.trim();
        return trimmed ? `__${trimmed}__` : match;
    });

    // 5. Khắc phục tiêu đề thiếu khoảng trắng: `###Tiêu đề` -> `### Tiêu đề`
    normalized = normalized.replace(/^(#{1,6})([^\s#\n])/gm, "$1 $2");

    // 6. Đảm bảo bảng GFM có ít nhất 1 dòng trống phía trước nếu đứng sau văn bản thường
    normalized = normalized.replace(/([^\n])\n(\|.+?\|\n\|[-:\s|]+\|)/g, "$1\n\n$2");

    return normalized;
}
