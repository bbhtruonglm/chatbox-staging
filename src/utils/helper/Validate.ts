import { addMethod, string } from 'yup'

import isEmail from 'validator/lib/isEmail'

/** khai báo thêm phương thức */
declare module 'yup' {
  interface StringSchema {
    /**kiểm tra không chứa khoảng trắng */
    noWhitespace(message?: string): this
  }
}

/** thêm phương thức kiểm tra không chứa khoảng trắng */
addMethod(string, 'noWhitespace', function (message) {
  /** trả về thông báo lỗi nếu giá trị chứa khoảng trắng */
  return this.test('no-whitespace', message, function (value) {
    /** lấy đường dẫn và thông báo lỗi */
    const { path: PATH, createError } = this

    /**kiểm tra giá trị không được toàn là khoảng trắng */
    const CHECK_NO_WHITESPACE = !/^\s*$/.test(value || '')

    /**kiểm tra giá trị không chứa khoảng trắng ở hai đầu */
    const CHECK_NO_WHITESPACE_AT_EDGES = value === value?.trim()

    /**kiểm tra tổng */
    const CHECK_TOTAL = CHECK_NO_WHITESPACE && CHECK_NO_WHITESPACE_AT_EDGES

    /**lỗi được tạo */
    const ERROR = createError({
      path: PATH,
      message: message || 'This field cannot contain only whitespace',
    })

    /** trả về kết quả */
    return CHECK_TOTAL || ERROR
  })
})

/** sửa phương thức kiểm tra email của yup không chuẩn */
addMethod(string, 'email', function (message) {
  /** trả về thông báo lỗi nếu giá trị chứa khoảng trắng */
  return this.test('email', message, function (value) {
    /** lấy đường dẫn và thông báo lỗi */
    const { path: PATH, createError } = this

    /**lỗi được tạo */
    const ERROR = createError({
      path: PATH,
      message: message || 'Email is not valid',
    })

    /** trả về kết quả */
    return isEmail(value || '') || ERROR
  })
})

/**
 * Chuẩn hóa tên file: bỏ dấu, chuyển thường, thay khoảng trắng bằng '-'
 */
export function normalizeFileName(name: string): string {
  return name
    .normalize('NFD') // tách dấu tiếng Việt
    .replace(/[\u0300-\u036f]/g, '') // xóa dấu
    .replace(/đ/g, 'd') // thay ký tự đặc biệt
    .replace(/Đ/g, 'd')
    .replace(/\s+/g, '-') // khoảng trắng -> gạch ngang
    .replace(/[^a-zA-Z0-9.\-_]/g, '') // loại ký tự lạ, giữ lại a-z 0-9 . - _
    .toLowerCase()
}

/**
 * ✅ Chuẩn hóa dữ liệu page_id từ localStorage.
 *
 * @param {any} value - Dữ liệu đọc được (chuỗi hoặc mảng)
 * @returns {string[]} - Mảng page_id hợp lệ
 *
 * Trường hợp xử lý:
 * - Mảng ký tự riêng lẻ → ["6","3","8","3",...] → ["6383..."]
 * - Mảng hợp lệ → ["123","456"]
 * - Chuỗi đơn → "123"
 */
export const normalizePageIds = (value: any): string[] => {
  if (!value) return []

  if (Array.isArray(value)) {
    /**
     * ✅ Nếu là mảng ký tự đơn lẻ (ví dụ ["6","3","8"]) → gộp lại thành 1 chuỗi.
     */
    if (
      value.every(
        ch =>
          typeof ch === 'string' && ch.length === 1 && /^[0-9a-zA-Z]$/.test(ch)
      )
    ) {
      return [value.join('')]
    }

    /**
     * ✅ Nếu là mảng chuỗi hợp lệ → giữ nguyên.
     */
    return value.filter(v => typeof v === 'string' && v.trim() !== '')
  }

  /**
   * ✅ Nếu là chuỗi đơn → wrap vào mảng.
   */
  if (typeof value === 'string') return [value]

  /** ❌ Trường hợp khác → trả về mảng rỗng. */
  return []
}
