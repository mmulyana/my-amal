import { layout } from "./layout.js";

export function authPage(mode: "login" | "register", error = "") {
  const register = mode === "register";
  return layout(
    register ? "Daftar" : "Masuk",
    `<div class="mx-auto max-w-xl"><h1 class="text-2xl font-semibold text-neutral-50">${register ? "Buat akun" : "Selamat datang kembali"}</h1><p class="mt-2 text-sm text-neutral-500">${register ? "Mulai catat amal harianmu." : "Masuk untuk melihat catatanmu."}</p>${error ? `<div class="mt-5 rounded-lg border border-red-900 bg-red-950 p-3 text-sm text-red-400">${error}</div>` : ""}<form method="post" action="/${mode}" class="mt-6 space-y-4"><label class="block text-sm font-medium text-neutral-300">Email<input name="email" type="email" required autocomplete="email" class="mt-1 w-full rounded-lg border border-neutral-700 bg-neutral-900 px-3 py-2 text-neutral-100"></label><label class="block text-sm font-medium text-neutral-300">Password<input name="password" type="password" required minlength="8" autocomplete="${register ? "new-password" : "current-password"}" class="mt-1 w-full rounded-lg border border-neutral-700 bg-neutral-900 px-3 py-2 text-neutral-100"></label><button class="w-full rounded-lg bg-amber-500 px-4 py-2.5 font-medium text-neutral-950 hover:bg-amber-400">${register ? "Daftar" : "Masuk"}</button></form><p class="mt-6 text-center text-sm text-neutral-500">${register ? "Sudah punya akun?" : "Belum punya akun?"} <a class="font-medium text-amber-400 underline" href="/${register ? "login" : "register"}">${register ? "Masuk" : "Daftar"}</a></p></div>`,
  );
}
