# Design System: Playlist Manager (Danh Sách Nhạc)

## 1. Gam màu chủ đạo (Primary Palette)
- **Primary Color:** Emerald (`#059669` / `emerald-600` trong Tailwind CSS)
- **Primary 50:** `#ecfdf5`
- **Primary 100:** `#d1fae5`
- **Primary 200:** `#a7f3d0`
- **Primary 300:** `#6ee7b7`
- **Primary 400:** `#34d399`
- **Primary 500:** `#10b981`
- **Primary 600:** `#059669` (Tone chủ đạo)
- **Primary 700:** `#047857`
- **Primary 800:** `#065f46`
- **Primary 900:** `#064e3b`
- **Primary 950:** `#022c22`

## 2. Nền & Chữ (Background & Typography)
- Nền tối: `bg-slate-900` (`#0f172a`) và card `bg-slate-800` (`#1e293b`)
- Text chính: `text-slate-100` (`#f1f5f9`), đảm bảo độ tương phản WCAG AA > 4.5:1
- Text phụ: `text-slate-400` (`#94a3b8`)
- Điểm nhấn active / hover: `text-emerald-400` (`#34d399`) và `bg-emerald-600` (`#059669`)

## 3. Hệ thống lưới Responsive (Responsive Grid System)
- **Mobile (< 640px):** 1 cột (`grid-cols-1`)
- **Tablet (640px – 1024px):** 2 cột (`sm:grid-cols-2`)
- **Desktop (> 1024px):** 3-4 cột (`lg:grid-cols-3 xl:grid-cols-4`)

## 4. Accessibility (A11y)
- Tất cả các thẻ `<img>` đều có mô tả `alt` ngữ nghĩa rõ ràng.
- Các nút bấm biểu tượng đều có `aria-label` tương ứng.
- Modal xem nhanh hỗ trợ phím `ESC`, bẫy focus (focus trap) và click ngoài backdrop.
