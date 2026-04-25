import { auth } from "@/lib/auth";
import { adminGetComments } from "@/lib/api";
import { redirect } from "next/navigation";
import CommentActions from "@/components/admin/CommentActions";
import AdminPagination from "@/components/admin/AdminPagination";
import Link from "next/link";

interface Props {
  searchParams: Promise<{ page?: string; status?: string }>;
}

export default async function AdminCommentsPage({ searchParams }: Props) {
  const session = await auth();
  if (!session?.accessToken) redirect("/admin/login");

  const params = await searchParams;
  const page = Number(params.page) || 1;
  const status = params.status;

  const { data: comments, meta } = await adminGetComments(page, status, session.accessToken);

  const statuses = [
    { label: "ทั้งหมด", value: "" },
    { label: "รอ approve", value: "pending" },
    { label: "อนุมัติแล้ว", value: "approved" },
    { label: "ปฏิเสธแล้ว", value: "rejected" },
  ];

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">ความคิดเห็นทั้งหมด</h1>

      <div className="flex gap-2 mb-6">
        {statuses.map((s) => (
          <Link
            key={s.value}
            href={`/admin/comments?status=${s.value}`}
            className={`px-3 py-1 rounded-full text-sm border ${status === s.value || (!status && !s.value) ? "bg-blue-600 text-white border-blue-600" : "hover:bg-gray-50"}`}
          >
            {s.label}
          </Link>
        ))}
      </div>

      <div className="bg-white rounded-xl shadow overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-gray-50 border-b">
            <tr>
              <th className="text-left px-4 py-3 font-medium">ผู้ส่ง</th>
              <th className="text-left px-4 py-3 font-medium">ข้อความ</th>
              <th className="text-left px-4 py-3 font-medium">บทความ</th>
              <th className="text-left px-4 py-3 font-medium">สถานะ</th>
              <th className="text-left px-4 py-3 font-medium">วันที่</th>
              <th className="px-4 py-3"></th>
            </tr>
          </thead>
          <tbody className="divide-y">
            {comments.map((comment) => (
              <tr key={comment.id} className="hover:bg-gray-50">
                <td className="px-4 py-3 font-medium">{comment.senderName}</td>
                <td className="px-4 py-3 max-w-xs truncate">{comment.message}</td>
                <td className="px-4 py-3 text-gray-500 max-w-xs truncate">
                  {comment.blog?.title ?? comment.blogId}
                </td>
                <td className="px-4 py-3">
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                    comment.status === "approved" ? "bg-green-100 text-green-700" :
                    comment.status === "rejected" ? "bg-red-100 text-red-700" :
                    "bg-yellow-100 text-yellow-700"
                  }`}>
                    {comment.status === "approved" ? "อนุมัติ" : comment.status === "rejected" ? "ปฏิเสธ" : "รอ"}
                  </span>
                </td>
                <td className="px-4 py-3 text-gray-500">{new Date(comment.createdAt).toLocaleDateString("th-TH")}</td>
                <td className="px-4 py-3">
                  <CommentActions commentId={comment.id} status={comment.status} />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {comments.length === 0 && (
          <p className="text-center text-gray-500 py-10">ไม่มีความคิดเห็น</p>
        )}
      </div>

      <div className="mt-4 text-sm text-gray-500 text-center">
        แสดง {comments.length} จาก {meta.total} รายการ · หน้า {meta.page}/{meta.totalPages}
      </div>

      <AdminPagination
        currentPage={meta.page}
        totalPages={meta.totalPages}
        basePath="/admin/comments"
        extraParams={status ? { status } : undefined}
      />
    </div>
  );
}
