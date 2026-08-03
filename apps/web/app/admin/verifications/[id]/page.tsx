import { AuthGuard } from "@/components/auth/AuthGuard";
import { getDoctorById } from "@/lib/data/doctors";
import { ReviewDetailClient } from "./ReviewDetailClient";

interface Props {
  params: Promise<{ id: string }>;
}

export default async function ReviewDetailPage({ params }: Props) {
  const { id } = await params;
  const doctor = await getDoctorById(id);

  return (
    <AuthGuard required="admin" redirectTo="/admin/login">
      <ReviewDetailClient doctor={doctor} />
    </AuthGuard>
  );
}
