import { FabricCountForm } from '@/components/admin/fabric-count/FabricCountForm';

export const metadata = {
  title: 'Đếm vải - GFWMS',
  description: 'Phát hiện và đếm vải từ hình ảnh sử dụng YOLO',
};

export default function FabricCountPage() {
  return (
    <div className="min-h-screen py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold flex items-center gap-3">
            <svg className="w-9 h-9" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
            Đếm vải
          </h1>
          <p className="text-muted-foreground mt-2">
            Tải ảnh và sử dụng AI để phát hiện và đếm số lượng vải tự động
          </p>
        </div>

        {/* Form */}
        <FabricCountForm />
      </div>
    </div>
  );
}
