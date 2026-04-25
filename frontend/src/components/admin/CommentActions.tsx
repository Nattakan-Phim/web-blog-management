"use client";
import { adminApproveComment, adminRejectComment, adminDeleteComment } from "@/lib/api";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";

interface Props {
  commentId: string;
  status: string;
}

export default function CommentActions({ commentId, status }: Props) {
  const { data: session } = useSession();
  const router = useRouter();

  const token = session?.accessToken ?? undefined;

  async function handleApprove() {
    await adminApproveComment(commentId, token);
    router.refresh();
  }

  async function handleReject() {
    await adminRejectComment(commentId, token);
    router.refresh();
  }

  async function handleDelete() {
    if (!confirm("ต้องการลบความคิดเห็นนี้?")) return;
    await adminDeleteComment(commentId, token);
    router.refresh();
  }

  return (
    <div className="flex items-center gap-2">
      {status !== "approved" && (
        <button onClick={handleApprove} className="text-xs text-green-600 hover:underline">อนุมัติ</button>
      )}
      {status !== "rejected" && (
        <button onClick={handleReject} className="text-xs text-orange-500 hover:underline">ปฏิเสธ</button>
      )}
      <button onClick={handleDelete} className="text-xs text-red-500 hover:underline">ลบ</button>
    </div>
  );
}
