# 🌸 Nâng cấp v2 — "Sợi Chỉ Vàng"

> ## 🩺 Mới trong v2.2 — Chống cache triệt để + trang tự chẩn đoán
> Sau sự cố "sửa playlist mà trình duyệt vẫn thấy bài cũ" (cache 1 giờ của http-server còn hạn thì `-c-1` cũng không cứu được những gì ĐÃ cache):
> - **`check.html`** — mở `http://127.0.0.1:8080/check.html` để biết chính xác thư mục đang serve: đúng phiên bản chưa, playlist trỏ file có thật không (kiểm từng bài!), ảnh nào thiếu. Mọi request của trang này đều `no-store` nên không bao giờ bị cache đánh lừa. Test E2E 11/11.
> - **Đổi version query** `?ver=2.2` cho toàn bộ CSS/JS trong index.html → URL mới = cache cũ vô hiệu, chỉ cần F5 thường.
> - `$.ajaxSetup({cache:false})` cho components, `fetch(..., {cache:'no-cache'})` cho file ngôn ngữ.
> - **Beacon phiên bản**: mở Console (F12) thấy `💍 Wedding site v2.2` = đang chạy bản mới; không thấy = còn dính cache.
> - Ảnh thiếu file hiển thị khung ngà có viền vàng thay vì icon vỡ (class `.img-missing`).
> - Thay 96 placeholder `/api/placeholder/400/300` trong gallery bằng SVG inline → hết 404 rác trong log.
> - Player dừng sau đúng 1 vòng nếu cả playlist lỗi, panel tự mở hiện `⚠ <tên file>` (sửa vòng lặp 404 vô hạn của v2.0).

Tài liệu này tóm tắt mọi thay đổi so với bản gốc, kèm ghi chú giảng dạy cho từng kỹ thuật mới. **Toàn bộ kiến trúc component-loader + module IIFE được giữ nguyên** — chỉ nâng cấp, không đập đi xây lại.

---

## 1. Tính năng mới

### 🎵 Nhạc nền phát ngẫu nhiên
| Thành phần | File |
|---|---|
| Giao diện đĩa nhạc | `components/music-player.html`, `css/music-player.css` |
| Logic | `scripts/music-player.js` |
| Danh sách bài | `music/playlist.json` (xem `music/README.md` để thêm bài) |

- Xáo bài bằng **Fisher–Yates shuffle**, phát hết vòng thì xáo lại, **không lặp bài liền kề**.
- Trình duyệt chặn autoplay → đĩa nhấp nháy mời gọi, **cú chạm đầu tiên** ở bất kỳ đâu sẽ bật nhạc. Khách chủ động tắt thì lựa chọn được nhớ qua `localStorage`.
- Đĩa vinyl xoay khi phát, nốt nhạc bay lên, panel trượt ra khi hover.

### 🌸 Cánh hoa rơi 3D (Three.js) — `scripts/petals3d.js`
- ~60 cánh hoa (32 trên mobile) rơi, lắc lư và **xoay cả 3 trục** trong hero.
- Geometry tạo bằng code (uốn cong mặt phẳng) — **không cần file ảnh nào**.
- Tự tạm dừng khi tab ẩn hoặc hero cuộn khỏi màn hình (tiết kiệm pin).
- Không có WebGL / bật reduced-motion → bỏ qua êm ái, web vẫn chạy bình thường.

### 🃏 Tilt 3D — `scripts/tilt3d.js`
Card chú rể/cô dâu nghiêng theo chuột (perspective + rotateX/Y) kèm vệt sáng glare. JS chỉ ghi CSS variables, mọi hiệu ứng nằm trong `css/effects.css` — ví dụ đẹp về **tách biệt logic và trình bày**.

### ✨ Scroll reveal — `scripts/reveal.js`
Các phần tử có `data-reveal` (hỗ trợ `left` / `right` / `zoom` + `--reveal-delay`) hiện dần khi cuộn tới, dùng **IntersectionObserver**. Không có JS → mọi thứ vẫn hiển thị (progressive enhancement qua class cổng `.js-reveal`).

### 💍 Chế độ "Đã về chung một nhà" — `scripts/countdown.js`
- **Phép tính calendar-based giữ nguyên 100%** (phần bạn đã sửa kỹ).
- Sau ngày cưới: thay vì số âm, tiêu đề đổi thành *"Đã Về Chung Một Nhà Được"* và số đếm **tăng dần** — cùng phép toán, câu chuyện ấm áp hơn. Trái tim đập phía trên.
- Số được pad 2 chữ số (`07`) và **lật 3D** mỗi khi đổi giá trị.
- Thêm nhãn NĂM/THÁNG vào i18n (trước đây hardcode tiếng Anh).

### 🧭 UX nhỏ mà chất
- **Scrollspy**: link điều hướng của section đang xem được gạch chân vàng.
- **Thanh tiến trình cuộn** (sợi chỉ vàng trên cùng) + **nút lên đầu trang**.
- Nút **Chỉ Đường** mở Google Maps tới Promes Center (có i18n).

---

## 2. Design system mới (`css/base.css`)

| Token | Giá trị | Vai trò |
|---|---|---|
| `--ink` | `#2b2230` | Chữ chính — tím than ấm |
| `--gold` / `--gold-deep` | `#c9a06c` / `#a87e4b` | Vàng champagne — accent chủ đạo |
| `--wine` | `#8c3041` | Đỏ vang — trái tim, điểm nhấn hiếm |
| `--blush` | `#e8c4c4` | Hồng phấn |
| `--ivory` | `#fbf7f1` | Nền ngà ấm |

**Font:** `Cormorant Garamond` (serif hiển thị) · `Dancing Script` (giữ — tên cặp đôi) · **`Be Vietnam Pro`** (body — font được thiết kế riêng cho dấu tiếng Việt, rất hợp đám cưới Hà Nội 🇻🇳).

**Motif chữ ký — "sợi chỉ vàng"**: đường kẻ vàng mảnh với nút thắt kim cương, lấy cảm hứng từ *sợi chỉ duyên phận* trong chính câu chuyện của cặp đôi ("số phận sắp đặt…"). Xuất hiện ở divider, viền card countdown, lề timeline câu chuyện, đầu footer, thanh tiến trình cuộn.

Các biến cũ (`--primary-color`…) vẫn được alias nên **CSS cũ nào chưa sửa vẫn chạy**.

---

## 3. File thay đổi / thêm mới

```
MỚI      css/effects.css            scripts/reveal.js
MỚI      css/music-player.css       scripts/tilt3d.js
MỚI      components/music-player.html   scripts/petals3d.js
MỚI      music/playlist.json + README   scripts/music-player.js
MỚI      NANG-CAP.md (file này)

SỬA      index.html        (font mới, Three.js CDN, include CSS/JS mới,
                            scroll-progress, back-to-top, container music)
SỬA      css/base|hero|navigation|couple|events|rsvp|footer.css  (viết lại)
SỬA      components/home|couple-intro|couple|events|footer.html
SỬA      components/rsvp.html, gallery.html   (chỉ thêm data-reveal)
SỬA      scripts/countdown.js   (giữ phép tính, đổi cách hiển thị)
SỬA      scripts/navigation.js  (thêm scrollspy/progress/back-to-top)
SỬA      scripts/core.js        (init 4 module mới, có guard typeof)
SỬA      scripts/component-loader.js  (thêm music-player)
SỬA      scripts/i18n.js   (2 vá nhỏ có guard: tiêu đề married + nhãn
                            năm/tháng + chữ nút Chỉ Đường)
SỬA      language/en.json, vi.json   (key mới: titleMarried, years,
                                      months, event.directions)

GIỮ NGUYÊN  gallery.html/css/js, lightbox.*, rsvp.js, couple.js,
            events.js, main.css/js, init.js, header.html, responsive.css
```

> 📝 Ghi chú dọn dẹp (tùy bạn): `main.css`, `main.js`, `init.js`, `header.html`, `responsive.css` **không được index.html nạp** từ trước tới nay — là file legacy. Tôi giữ nguyên vì có thể bạn dùng cho giáo trình, nhưng có thể xóa nếu muốn gọn.

## 4. Hợp đồng (contract) được bảo toàn — quan trọng!

`i18n.js` và `rsvp.js` dò DOM bằng selector vị trí, nên HTML mới tuân thủ nghiêm:

- `.hero-content` → thẻ `<p>` **đầu tiên** vẫn là message (ornament dùng `<div>`).
- `#days/.../#seconds` → `.countdown-text` vẫn đứng **ngay sau** (nextElementSibling).
- `.event-details` → thứ tự con: `h3` → 3 × `.event-info` → `.event-description`; nút Chỉ Đường thêm **sau** nên `nth-child(2..4)` không lệch.
- Form RSVP: giữ nguyên 100% id/class/thứ tự phần tử.
- `.person-card` vẫn là con thứ 1 & 2 của container (cho `nth-child`).

Đã có **49 kiểm tra contract tự động + 24 test runtime (jsdom)** đều pass: countdown married-mode, shuffle nhạc đủ vòng không lặp liền kề, toggle + localStorage, reveal, tilt.

## 5. Chạy thử

```bash
npm install      # như cũ
npm start        # http://localhost:8080
```

Chép ảnh vào `images/` và nhạc vào `music/` (cập nhật `playlist.json`) là đủ.

## 6. Gợi ý bài giảng theo phase

| Phase | Chủ đề | File minh họa |
|---|---|---|
| 3.5 | IntersectionObserver & progressive enhancement | `reveal.js`, scrollspy trong `navigation.js` |
| 4 | CSS variables như "API" giữa JS và CSS | `tilt3d.js` + `effects.css` |
| 4.5 | Autoplay policy, Fisher–Yates, localStorage | `music-player.js` |
| 5 | Nhập môn Three.js: scene/camera/geometry/render loop | `petals3d.js` |
| 5 | Vì sao client không đọc được thư mục → playlist.json | `music/README.md` |
