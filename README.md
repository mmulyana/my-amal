# My Amal

Habit tracker ibadah harian berbasis Hono, TypeScript, SQLite, HTMX, dan Tailwind.

## Menjalankan lokal

```bash
npm install
npm run dev
```

Production dijalankan dari hasil compile TypeScript:

```bash
npm run build
npm start
```

## Docker

Build & push image (compose deploy-nya ada di `infra/my-amal`, lihat `../infra/README.md`):

```bash
docker build -t mmulyana/my-amal:latest .
docker push mmulyana/my-amal:latest
```

Database disimpan di folder `data/`. Session ID acak disimpan di cookie dan session table membatasi akses data berdasarkan `user_id`.
