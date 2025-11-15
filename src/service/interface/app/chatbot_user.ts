export interface ChatbotUserInfo {
    /**vài trò của người dùng trong hệ thống */
    role?: 'ADMIN' | 'MEMBER' | 'AFFILIATE'
    /**email đăng nhập */
    email?: string
    /**id của user bản mới */
    user_id?: string
    /**id của bản ghi */
    _id: string
    /**id của fb */
    fb_staff_id: string
    /**tên */
    full_name: string
    /**id gói */
    pricing_id?: string
    /**ngày gói hết hạn */
    end_date?: string
    /**dữ liệu tải về */
    download?: {
        /**thời gian tải cuối cùng */
        active_time?: number
        /**trạng thái tạo tệp */
        status?: 'DONE' | 'ON_PROGESS'
        /**tổng số dữ liệu đã tạo */
        current?: number
        /**tổng số toàn bộ dữ liệu */
        total?: number
    }
}

/**các cài đặt cá nhân */
export interface PersonalSettings {
    /**có bật thiết lập cá nhân không */
    is_enable_personal_setting: boolean
    /**ẩn avatar của page */
    is_hide_page_avatar: boolean
    /**kiểu hiển thị của label */
    display_label_type: 'ICON_TOOLTIP' | 'FULL' | 'ICON'
}