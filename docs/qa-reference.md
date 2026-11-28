# Cách đọc mã QA của GradStudio

| Mã | Nguồn và cách đọc |
|---|---|
| B2.x, B3.x, B4.x | Bài 2, 3 hoặc 4, câu x trong `GradStudio_PO_QA.md`. Ví dụ, B2.2 quy định mỗi hội thoại có tối đa một booking, B3.3/B4.5 quy định thay đề xuất cũ, B4.1 quy định khôi phục booking đã nhận cọc. |
| BS.1 | Câu 1 của đợt xác nhận bổ sung về thời hạn thanh toán. PO chấp nhận 15 phút cho cả cọc và khoản 70%. |
| R01, R02, … | Mục đánh số trong `bao-cao-doi-chieu-ke-hoach-ma-nguon.md`. Ví dụ, R04 là cập nhật nhắc lịch khi đổi giờ. Mã báo cáo này độc lập với R1,… của rubric PA#4. |
| QA8, QA9, QA10, QA11 | Đầu việc trong kế hoạch ngày 27/11. QA8 rà Staff và Superadmin, QA9 rà Customer, thanh toán và nhắc lịch, QA10 rà hội thoại và booking Admin, QA11 nghiệm thu bản tích hợp. |

Các nguồn PO, báo cáo đối chiếu, rubric và kế hoạch nằm ngoài repository GradStudio trong thư mục tài liệu của nhóm. Trong repo, xem [contract TV3](api/03-conversations.md), [bảng Routes](../FRONTEND.md) và [nhật ký QA](../AI-LOG.md).
