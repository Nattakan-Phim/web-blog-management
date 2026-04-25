"use client";
import { Comment } from "@/types";
import { postComment } from "@/lib/api";
import { useState } from "react";

// Must match BE validation: Thai script (U+0E00–U+0E7F) + Thai punctuation/digits (U+0E4F–U+0E5B) + ASCII digits + whitespace
const THAI_AND_NUMBERS = /^[฀-๿๏-๛0-9\s]+$/;

export default function CommentSection({ blogId, comments }: { blogId: string; comments: Comment[] }) {
  const [senderName, setSenderName] = useState("");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");

    if (!blogId) {
      setError("เกิดข้อผิดพลาด ไม่พบบทความ");
      return;
    }
    if (!senderName.trim()) {
      setError("กรุณากรอกชื่อผู้ส่ง");
      return;
    }
    if (!THAI_AND_NUMBERS.test(message)) {
      setError("ข้อความต้องเป็นภาษาไทยและตัวเลขเท่านั้น");
      return;
    }

    setLoading(true);
    try {
      await postComment(blogId, { senderName, message });
      setSuccess(true);
      setSenderName("");
      setMessage("");
    } catch {
      setError("เกิดข้อผิดพลาด กรุณาลองใหม่อีกครั้ง");
    } finally {
      setLoading(false);
    }
  }

  return (
    <section>
      <h2 className="text-2xl font-bold tracking-tight mb-8">
        ความคิดเห็น <span className="text-zinc-400 font-normal">({comments.length})</span>
      </h2>

      {comments.length > 0 && (
        <div className="space-y-4 mb-10">
          {comments.map((c) => (
            <div
              key={c.id}
              className="bg-white border border-zinc-200 rounded-2xl p-5 shadow-sm hover:shadow-md transition-shadow"
            >
              <div className="flex items-center gap-3 mb-3">
                <div className="w-9 h-9 rounded-full bg-linear-to-br from-indigo-400 to-purple-500 flex items-center justify-center text-white font-semibold text-sm">
                  {c.senderName.charAt(0).toUpperCase()}
                </div>
                <div>
                  <div className="font-semibold text-sm">{c.senderName}</div>
                  <div className="text-xs text-zinc-400">
                    {new Date(c.createdAt).toLocaleDateString("th-TH")}
                  </div>
                </div>
              </div>
              <p className="text-zinc-700 leading-relaxed pl-12">{c.message}</p>
            </div>
          ))}
        </div>
      )}

      <div className="bg-white border border-zinc-200 rounded-2xl p-8 shadow-sm">
        <h3 className="font-bold text-lg mb-6">แสดงความคิดเห็น</h3>

        {success ? (
          <div className="bg-green-50 border border-green-200 rounded-xl p-4 flex items-center gap-3">
            <div className="w-8 h-8 rounded-full bg-green-500 flex items-center justify-center text-white shrink-0">
              ✓
            </div>
            <p className="text-green-700 text-sm">
              ส่งความคิดเห็นเรียบร้อย รอการอนุมัติจาก admin ก่อนเผยแพร่
            </p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="block text-sm font-medium mb-2 text-zinc-700">
                ชื่อผู้ส่ง <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={senderName}
                onChange={(e) => setSenderName(e.target.value)}
                className="w-full bg-zinc-50 border border-zinc-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/30 focus:border-indigo-500 focus:bg-white transition-all"
                placeholder="ชื่อของคุณ"
                maxLength={100}
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-2 text-zinc-700">
                ความคิดเห็น <span className="text-red-500">*</span>
                <span className="text-xs text-zinc-400 font-normal ml-2">(ภาษาไทยและตัวเลขเท่านั้น)</span>
              </label>
              <textarea
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                rows={4}
                className="w-full bg-zinc-50 border border-zinc-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/30 focus:border-indigo-500 focus:bg-white transition-all resize-none"
                placeholder="เขียนความคิดเห็นของคุณที่นี่..."
                maxLength={1000}
              />
            </div>
            {error && (
              <div className="bg-red-50 border border-red-200 rounded-xl p-3 text-red-600 text-sm">
                {error}
              </div>
            )}
            <button
              type="submit"
              disabled={loading}
              className="bg-linear-to-r from-indigo-500 to-purple-600 text-white px-6 py-3 rounded-xl text-sm font-semibold hover:shadow-lg hover:shadow-indigo-500/30 disabled:opacity-50 transition-all"
            >
              {loading ? "กำลังส่ง..." : "ส่งความคิดเห็น"}
            </button>
          </form>
        )}
      </div>
    </section>
  );
}
