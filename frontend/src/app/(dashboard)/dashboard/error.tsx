'use client';

export default function DashboardError({
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <div className="flex-1 flex items-center justify-center p-margin">
      <div className="w-full max-w-2xl bg-surface-container-lowest rounded-xl border border-surface-variant shadow-ambient-crisp overflow-hidden flex flex-col md:flex-row relative z-10">
        <div className="md:w-1/2 relative bg-surface-container-low min-h-[300px]">
          <img
            alt="System error"
            className="absolute inset-0 w-full h-full object-cover object-center opacity-80 mix-blend-multiply"
            src="https://lh3.googleusercontent.com/aida-public/AB6AXuAgZ_nzn9LxPbVXRSZWXGwIp0_cQThBm6AlExS24i1qE_b2Eld765vUbiVKnvKI_dUqt6TQY695sjdDEuNlSGBQM2gnEzgdXDJEdmYev-QJtYLNmRmPuvXjW_vOyBJ-nAvXC36O1k7p4LyPnz2XsGSbsyisc2R2t7ftUqzQVbRYKrt95qchiOi-HljutaO7admviEDtclY3pziLG2ZENiCxgRAo46jqeATJQALvVQq92yaczR1p8iALMyBPqeFSL0YRKx2xG-HEPZsl"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-surface-container-low/80 to-transparent" />
        </div>
        <div className="md:w-1/2 p-lg flex flex-col justify-center items-start relative z-10">
          <span
            className="material-symbols-outlined text-4xl text-outline mb-sm"
            style={{ fontVariationSettings: "'FILL' 1" }}
          >
            error
          </span>
          <h1 className="text-h1 text-primary mb-xs">Lỗi hệ thống</h1>
          <p className="text-body-md text-on-surface-variant mb-xl">
            Đã có lỗi xảy ra trong dashboard. Vui lòng thử lại.
          </p>
          <div className="flex flex-col sm:flex-row gap-sm w-full">
            <button
              onClick={reset}
              className="bg-primary hover:bg-primary-container text-on-primary text-button py-sm px-md rounded transition-colors duration-200 text-center shadow-[0_4px_12px_rgba(7,2,53,0.15)]"
            >
              Thử lại trang
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
