# 🎵 Thư mục nhạc nền

Trình phát nhạc sẽ **phát ngẫu nhiên** các bài trong thư mục này, hết vòng thì xáo lại và phát tiếp (không lặp lại bài vừa nghe).

## Cách thêm bài hát

1. Chép file nhạc (`.mp3`, `.m4a`, `.ogg`…) vào thư mục `music/` này.
2. Mở `playlist.json` và thêm **đúng tên file** vào mảng `tracks`:

```json
{
	"tracks": [
		"01 - Beautiful in White.mp3",
		"Bai-hat-moi-cua-ban.mp3"
	]
}
```

3. Lưu lại, tải lại trang — xong!

## Vì sao cần playlist.json?

Trình duyệt **không thể tự đọc danh sách file trong một thư mục** trên web tĩnh (HTTP không có khái niệm "liệt kê thư mục"). Vì vậy ta giữ một file JSON nhỏ làm "mục lục". Đây cũng là một bài học hay cho học viên về giới hạn của client-side JavaScript! 

> Mẹo đặt tên: trình phát tự làm đẹp tên bài —
> `01 - Beautiful_in-White.mp3` sẽ hiển thị thành **Beautiful in White**
> (bỏ số thứ tự đầu, bỏ đuôi file, gạch ngang/gạch dưới → khoảng trắng).

## Lưu ý về autoplay

Trình duyệt chặn phát nhạc tự động cho đến khi khách **tương tác lần đầu** (chạm/bấm bất kỳ đâu). Đĩa nhạc sẽ nhấp nháy mời gọi; ngay sau cú chạm đầu tiên, nhạc tự bật. Nếu khách chủ động bấm tạm dừng, lựa chọn đó được ghi nhớ (localStorage) và nhạc sẽ không tự bật ở lần ghé sau.

## ⚠ Sửa playlist xong mà vẫn thấy bài cũ? → Cache!

`http-server` mặc định bảo trình duyệt cache mọi file **1 giờ** (`max-age=3600`). Bạn sửa `playlist.json` nhưng trình duyệt vẫn dùng bản cũ trong cache → F5 bao nhiêu lần cũng vô ích (request còn không tới server, nên log cũng không thấy).

Hai lớp phòng thủ đã được cài sẵn:

1. **Phía server (cho dev):** script `npm start` giờ chạy `http-server -p 8080 -c-1` — tắt cache hoàn toàn khi phát triển.
2. **Phía code:** `music-player.js` fetch playlist với `cache: 'no-store'` + tham số `?t=<timestamp>`, nên kể cả server có cache thì playlist vẫn luôn mới.

Nếu vẫn nghi ngờ cache cũ: **Ctrl + F5** (hard refresh) hoặc DevTools → Network → tick "Disable cache".

> 🧑‍🏫 Bài học hay cho học viên: phân biệt cache phía trình duyệt vs phía server, và vì sao "tôi đã sửa file rồi mà?!" là lỗi kinh điển của web dev.

## Khi tên file trong playlist không khớp file thật

Player sẽ **bỏ qua** bài lỗi và phát bài kế tiếp (có cảnh báo trong Console kèm đúng tên file hỏng). Nếu **cả vòng playlist đều lỗi**, player dừng hẳn, mở panel hiển thị `⚠ <tên file>` để bạn biết phải sửa gì — không spam server bằng vòng lặp retry. Tên phải khớp **100%** (kể cả khoảng trắng, hoa/thường, dấu tiếng Việt, phần mở rộng `.mp3`).
