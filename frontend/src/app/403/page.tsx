import Link from 'next/link';

export default function ForbiddenPage() {
  return (
    <div className="bg-background min-h-screen flex flex-col items-center justify-center p-gutter text-on-background antialiased relative overflow-hidden">
      {/* Brand */}
      <header className="absolute top-0 left-0 w-full p-lg flex justify-center">
        <span className="text-h3 text-primary font-semibold tracking-tight">Cinlove</span>
      </header>

      <main className="w-full max-w-2xl flex flex-col items-center text-center z-10">
        {/* Illustration */}
        <div className="mb-lg relative w-64 h-64 sm:w-80 sm:h-80 flex items-center justify-center">
          <div className="absolute inset-0 bg-primary-fixed opacity-30 rounded-full blur-3xl" />
          <img
            alt="Locked envelope"
            className="w-full h-full object-contain relative z-10 drop-shadow-xl"
            src="https://lh3.googleusercontent.com/aida-public/AB6AXuBnTiW4GdzdRVsNubQaRsHiUWBFASWrzIx2RTdYw3G8squTUzZUk_oTjdX3D1nuK3hwVZKGAnYQ3bb_WxUkNMGGTJPeuJF-oQk6Expr4nJKqKQ4lVwqZL55xrjyqSGq3N9KCctaKK8q-1ZAC2xOK-_JFaUJkvbXuiMwm7E6DqN3rpddgI0XqXIXccVo1D5FZNy2tibqNa65KRRB9SQ3CFToHTlvzl2Z_1PPJNu7lVk-8oiqkwOUpsNymrT4VyIEm8wsIZnVL1TR9uX0"
          />
        </div>

        {/* Messaging */}
        <div className="flex flex-col items-center max-w-lg mx-auto">
          <span className="inline-flex items-center gap-xs px-sm py-xs bg-surface-variant text-on-surface-variant text-label-caps rounded-full mb-md uppercase tracking-wider">
            <span className="material-symbols-outlined text-[16px]">lock</span>
            Lỗi 403
          </span>
          <h1 className="text-h1 text-primary mb-sm">
            Không có quyền truy cập
          </h1>
          <p className="text-body-lg text-on-surface-variant mb-xl">
            Tài khoản của bạn hiện không có quyền xem hoặc thao tác trên tài nguyên này. Vui lòng kiểm tra lại đường dẫn hoặc quay về trang chủ.
          </p>
        </div>

        {/* Actions */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-sm w-full max-w-md">
          <Link
            href="/dashboard"
            className="w-full sm:w-auto flex items-center justify-center gap-xs px-lg py-sm bg-primary text-on-primary text-button rounded-lg hover:bg-primary-container hover:text-on-primary-container transition-colors shadow-sm"
          >
            <span className="material-symbols-outlined text-[18px]">dashboard</span>
            Quay lại Dashboard
          </Link>
          <button className="w-full sm:w-auto flex items-center justify-center gap-xs px-lg py-sm bg-surface-container-low text-primary text-button rounded-lg border border-surface-container-highest hover:bg-surface-container transition-colors">
            <span className="material-symbols-outlined text-[18px]">support_agent</span>
            Liên hệ quản trị viên
          </button>
        </div>
      </main>
    </div>
  );
}
