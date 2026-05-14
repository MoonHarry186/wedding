import Link from 'next/link';

export default function NotFoundPage() {
  return (
    <main className="bg-background text-on-background min-h-screen flex items-center justify-center py-xl px-margin relative overflow-hidden">
      {/* Subtle decorative blurs */}
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden -z-10 pointer-events-none opacity-50">
        <div className="absolute -top-[10%] -left-[10%] w-[40%] h-[60%] rounded-full bg-primary-fixed-dim blur-3xl opacity-20" />
        <div className="absolute bottom-[20%] -right-[10%] w-[30%] h-[50%] rounded-full bg-secondary-container blur-3xl opacity-30" />
      </div>

      <div className="max-w-[1000px] w-full grid grid-cols-1 md:grid-cols-2 gap-xl items-center">
        {/* Illustration */}
        <div className="relative w-full aspect-square md:aspect-[4/5] rounded-xl overflow-hidden shadow-sm border border-surface-variant bg-surface-container-lowest">
          <img
            alt="Empty elegant envelope"
            className="w-full h-full object-cover"
            src="https://lh3.googleusercontent.com/aida-public/AB6AXuAVRm62yrYi_uNwclDDGhP9IEJNKNJcMkpcNMFrYjliNLV3HoXLCGVMSDMzXXSii2bPuF8PQJgDGOAdd_2DvOu8VepNJ9BHgZv_vzJKLmm1Dny8Zf1ev8_7sYcm5H1nkIg0zeTGcF7pqQ-KA3hhAu0DeszmZ2RjdtyTnMliPa1O2-mDXCMC2oJRsNIK22g2zHwS_y4AnVwSDEAbzlm71ukHLiMWUkkVZnxsYL8yjHC51XALLqm8-a01fVp51gKGXQ-6kU9WOWATBWty"
          />
          <div className="absolute bottom-lg right-lg bg-surface-container-lowest/90 backdrop-blur-sm p-sm rounded-lg shadow-md border border-surface-variant flex items-center gap-xs">
            <span className="material-symbols-outlined text-outline">search_off</span>
            <span className="text-label-caps text-on-surface-variant">Không tìm thấy</span>
          </div>
        </div>

        {/* Content */}
        <div className="flex flex-col justify-center space-y-lg">
          <div className="space-y-sm">
            <span className="text-label-caps text-primary tracking-widest uppercase">Lỗi 404</span>
            <h1 className="text-display text-primary">
              Chúng tôi không tìm thấy phong bì này.
            </h1>
            <p className="text-body-lg text-on-surface-variant max-w-md">
              Có vẻ như liên kết bạn đang tìm kiếm đã bị mất hoặc sự kiện không còn tồn tại. Hãy để chúng tôi đưa bạn trở lại.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row gap-sm pt-sm">
            <Link
              className="inline-flex items-center justify-center gap-xs px-lg py-md bg-primary text-on-primary rounded text-button hover:bg-primary-container transition-colors shadow-sm"
              href="/"
            >
              <span className="material-symbols-outlined text-on-primary text-[20px]">home</span>
              Quay về Trang chủ
            </Link>
            <Link
              className="inline-flex items-center justify-center gap-xs px-lg py-md bg-surface-container-low border border-outline-variant text-primary rounded text-button hover:bg-surface-variant transition-colors"
              href="/dashboard"
            >
              Đến Dashboard
            </Link>
          </div>
        </div>
      </div>
    </main>
  );
}
