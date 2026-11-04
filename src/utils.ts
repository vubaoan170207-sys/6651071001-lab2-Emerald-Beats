/**
 * Định dạng số tiền kèm theo ký hiệu tiền tệ (mặc định VND/₫)
 * @param amount Số tiền cần định dạng
 * @param currency Ký hiệu đơn vị tiền tệ (mặc định '₫')
 */
export function formatCurrency(amount: number, currency = '₫'): string {
  const formatted = new Intl.NumberFormat('vi-VN').format(amount);
  return `${formatted} ${currency}`;
}

/**
 * Cắt ngắn văn bản nếu vượt quá độ dài tối đa và thêm dấu ba chấm
 * @param text Chuỗi đầu vào
 * @param maxLength Độ dài tối đa cho phép
 */
export function truncateText(text: string, maxLength: number): string {
  if (text.length <= maxLength) {
    return text;
  }
  return `${text.slice(0, maxLength)}...`;
}

/**
 * Kiểm tra địa chỉ email có đúng định dạng chuẩn hay không
 * @param email Địa chỉ email cần kiểm tra
 */
export function validateEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[a-zA-Z]{2,}$/;
  return emailRegex.test(email);
}

/**
 * Trì hoãn thực thi hàm cho đến khi hết khoảng thời gian delay tính từ lần gọi cuối cùng
 * @param fn Hàm cần debounce
 * @param delay Thời gian chờ (mili-giây)
 */
export function debounce<Args extends unknown[]>(
  fn: (...args: Args) => void,
  delay: number
): (...args: Args) => void {
  let timerId: ReturnType<typeof setTimeout> | null = null;

  return (...args: Args): void => {
    if (timerId !== null) {
      clearTimeout(timerId);
    }
    timerId = setTimeout(() => {
      fn(...args);
    }, delay);
  };
}
