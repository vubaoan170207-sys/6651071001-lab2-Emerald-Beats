# Danh Sách Nhạc - Playlist Manager (HTML5, CSS3, JavaScript)

Hệ thống quản lý và phát nhạc trực tuyến được xây dựng bằng **HTML5**, **CSS3** và **JavaScript thuần (Vanilla JS)**, tuân thủ chặt chẽ Design System hiện đại với phong cách Dark Mode và tone màu chủ đạo Emerald.

---

## 🌟 Tính năng nổi bật & Giữ nguyên trọn vẹn

1. **Giao diện & Thiết kế chuẩn Design System:**
   - **Tone màu chủ đạo:** Emerald (`#059669` / `#10b981`), nền tối `slate-900` (`#0f172a`), thẻ bài hát `slate-800` (`#1e293b`).
   - **Responsive toàn diện:** Tối ưu hiển thị 1 cột trên Mobile, 2 cột trên Tablet, 3-4 cột trên Desktop.
   - **Hiệu ứng mượt mà:** Skeleton loading mô phỏng khi tải trang, hover zoom ảnh bìa, đổ bóng emerald nổi bật.

2. **Tìm kiếm, Lọc & Sắp xếp đa năng:**
   - **Tìm kiếm tức thì:** Tìm theo tên bài hát, nghệ sĩ hoặc album (có áp dụng kỹ thuật Debounce 300ms và nút xóa nhanh `x`).
   - **Bộ lọc Thể loại (Genre):** Tự động gom thể loại từ cơ sở dữ liệu (Pop, Ballad, Hip-Hop, Indie Pop, R&B,...).
   - **Sắp xếp linh hoạt:** Thứ tự mặc định, A → Z, Z → A, Thời lượng dài nhất / ngắn nhất, Lượt nghe nhiều nhất.
   - **Tab hiển thị:** Chuyển đổi giữa **Tất cả bài hát** và danh sách **Yêu thích** (kèm số lượng bài hát thời gian thực).

3. **Quản lý danh sách Yêu thích (Favorites):**
   - Lưu trữ trực tiếp trên `localStorage` trình duyệt, không bị mất khi tải lại trang hay chuyển trang.

4. **Trình phát nhạc cố định dưới đáy màn hình (Sticky Audio Player):**
   - Hiển thị bài hát đang phát: Ảnh bìa, tên ca khúc, nghệ sĩ, nút thả tim, chấm hiệu ứng đang phát (animated ping).
   - Bộ điều khiển: Phát / Tạm dừng (Play / Pause), Bài trước (Prev), Bài kế tiếp (Next).
   - Thanh tua thời lượng (Progress Scrubber): Hiển thị phút:giây thời gian thực, tự động chạy từng giây và tự động chuyển bài khi hết nhạc.
   - Điều khiển âm lượng: Thanh trượt âm lượng và nút Bật / Tắt tiếng (Mute).

5. **Cửa sổ xem nhanh (Quick View Modal):**
   - Bấm vào biểu tượng con mắt trên thẻ bài hát để mở modal xem nhanh.
   - Tab "Mô tả & Thông tin" (giới thiệu tác phẩm, trích dẫn lời bài hát).
   - Tab "Lời bài hát (Lyrics)" chính thức với nút **Sao chép lời bài hát** một chạm.
   - Hỗ trợ đóng modal bằng phím `ESC`, bấm nút `X` hoặc click ra ngoài vùng mờ.

6. **Trang chi tiết chuyên sâu (`detail.html`):**
   - Mở chi tiết qua liên kết `detail.html?id=...`
   - Hiển thị đầy đủ thông tin: Ảnh bìa cỡ lớn, thể loại, ngày phát hành, album, lượt nghe, giá bản quyền số.
   - Lời bài hát đầy đủ kèm nút sao chép.
   - Đề xuất danh sách các bài hát tương tự (cùng ca sĩ hoặc cùng thể loại).

7. **Xác thực biểu mẫu Đăng ký bản tin (Newsletter):**
   - Kiểm tra định dạng email chuẩn regex, phản hồi thông báo thành công hoặc cảnh báo lỗi.

---

## 📁 Cấu trúc thư mục

```text
6651071001_LAB2/
│
├── index.html           # Trang chính (Danh sách bài hát, thống kê, modal, player)
├── detail.html          # Trang chi tiết bài hát theo id (?id=track-01)
│
├── css/
│   └── style.css        # Toàn bộ mã định kiểu CSS3 hiện đại, Dark theme Emerald
│
├── js/
│   ├── data.js          # Dữ liệu 22 bài hát (JSON sang JavaScript Object)
│   ├── player.js        # Module quản lý Trình phát nhạc & Yêu thích (LocalStorage)
│   ├── app.js           # Logic chính cho trang index.html (Lọc, tìm kiếm, modal,...)
│   └── detail.js        # Logic cho trang detail.html (Hiển thị chi tiết, bài hát tương tự)
│
└── design/
    └── README.md        # Tài liệu hướng dẫn Design System & bảng màu chuẩn
```

---

## 🚀 Cách chạy website

1. **Cách 1: Mở trực tiếp (Không cần cài đặt)**
   - Nhấp đúp chuột trực tiếp vào file `index.html` để mở ngay trên trình duyệt (Chrome, Edge, Firefox,...).

2. **Cách 2: Sử dụng Live Server trên VS Code**
   - Mở thư mục dự án trên Visual Studio Code.
   - Nhấp chuột phải vào file `index.html` và chọn **Open with Live Server**.

3. **Cách 3: Chạy máy chủ cục bộ bằng Python hoặc Node**
   ```bash
   # Dùng Python:
   python -m http.server 3000
   
   # Sau đó truy cập: http://localhost:3000
   ```
