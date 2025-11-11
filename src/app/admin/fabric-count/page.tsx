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
          <h1 className="text-3xl font-bold">
            🔍 Đếm vải
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
