'use client';

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <html lang="vi">
      <body className="bg-surface text-on-surface min-h-screen flex flex-col items-center justify-center antialiased p-8 font-sans">
        <div className="text-center max-w-md">
          <h1 className="text-4xl font-bold text-primary mb-4">Lỗi nghiêm trọng</h1>
          <p className="text-on-surface-variant mb-8">
            Đã có lỗi nghiêm trọng xảy ra. Vui lòng tải lại trang.
          </p>
          <button
            onClick={reset}
            className="bg-primary text-white px-6 py-3 rounded hover:bg-primary-container transition-colors"
          >
            Tải lại trang
          </button>
        </div>
      </body>
    </html>
  );
}
