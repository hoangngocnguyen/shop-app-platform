import { useEffect, useState } from "react";

/**
 * Custom hook để debounce giá trị nhập vào, thường dùng cho ô tìm kiếm
 * @param value Giá trị cần debounce
 * @param delay Thời gian chờ tính theo milliseconds (mặc định 500ms)
 * @returns Giá trị đã được debounce
 */
export function useDebounce<T>(value: T, delay: number = 500): T {
    const [debouncedValue, setDebouncedValue] = useState<T>(value);

    useEffect(() => {
        const timer = setTimeout(() => {
            setDebouncedValue(value);
        }, delay);

        return () => {
            clearTimeout(timer);
        };
    }, [value, delay]);

    return debouncedValue;
}

export default useDebounce;
