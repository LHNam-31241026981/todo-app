# Ứng dụng quản lý công việc

Yêu cầu Node.js 24 trở lên. Giải nén tệp ZIP, mở terminal trong thư mục `todo-app` rồi chạy:

```powershell
node server.js
```

Mở http://127.0.0.1:8080/ trong trình duyệt. Dữ liệu được lưu trong tệp `todo.sqlite` cạnh `server.js`. Tệp và bảng `tasks` được tạo tự động khi chạy lần đầu.

- Nhập tên và bấm **Thêm công việc** để tạo một mục.
- Chọn **Sửa**, đổi tên và bấm **Lưu thay đổi**.
- Dùng hộp chọn ở mỗi mục để đổi giữa **Chưa làm**, **Đang làm** và **Hoàn thành**.
- Bấm **Xóa** và xác nhận để xóa một mục.
- Các thẻ ở đầu trang tự cập nhật số lượng sau khi thao tác.

Nếu cổng 8080 đang được sử dụng, chạy `$env:PORT = '8081'` trong PowerShell trước khi chạy lại server. Địa chỉ truy cập được in trong terminal.
