# flower-ecommerce

Dự án sàn thương mại điện tử hoa

# Thành viên nhóm

- Phan Hải Đăng
- Vũ Linh Trang
- Nguyễn Đình Anh Đức
- Lê Nguyễn Việt Hùng
- Phạm Nam Dương

# Tech stack

- Client: React + Vite
- Server: Express + Mongoose

# Cấu trúc project

```
├── client
│   ├── package.json
│   ...

├── server
│   ├── ...
│   └── package.json
├── compose.yml
├── package.json
└── README.md
```

# Chạy project

Khởi tạo husky cho linting và pre-commit ở thư mục gốc
`npm i`

Chạy client

```
cd client
npm i
npm run dev
```

Chạy server

```
cd server
npm i
npm run dev
```

# Compose project

- Setup biến môi trường sang file .env.production và làm theo hướng dẫn trong .env.example

```
cp .env.example .env.production
```

- Đứng ở thư mục có file compose.yml chạy lệnh
  `docker compose up -d --build`

# Link env

[Env](https://drive.google.com/drive/folders/1kvYshuowWxs3BzQyW-C2Iw1IZ1cYhG4I?usp=sharing)
