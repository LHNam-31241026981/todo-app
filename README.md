# Ứng dụng quản lý công việc

Ứng dụng TODO sử dụng Node.js và SQLite. Người dùng có thể thêm, sửa, xóa, đổi trạng thái và xem thống kê công việc.

## Chạy ứng dụng TODO

Yêu cầu Node.js 24 trở lên. Chạy lệnh sau trong thư mục repo:

```sh
node server.js
```

Mở [http://127.0.0.1:8080/](http://127.0.0.1:8080/). SQLite tự tạo tệp `todo.sqlite` khi ứng dụng khởi động.

## Bài 2

`Bai2.js` là bài thực hành tạo máy chủ HTTP bằng Node.js. Dừng ứng dụng TODO trước khi chạy Bài 2 vì cả hai dùng cổng 8080.

```sh
node Bai2.js
```

Terminal sẽ hiển thị `Server running at port=8080`. Mở [http://127.0.0.1:8080/](http://127.0.0.1:8080/) để xem phản hồi của máy chủ.
