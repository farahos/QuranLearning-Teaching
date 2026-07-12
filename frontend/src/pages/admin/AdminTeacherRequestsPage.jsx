import { useEffect, useMemo, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { ShieldCheck, ExternalLink, CheckCircle2, XCircle, MessageSquareWarning } from "lucide-react";
import { Avatar } from "../../components/common/Avatar";
import { Badge, statusTone } from "../../components/common/Badge";
import { Button } from "../../components/common/Button";
import { ConfirmDialog } from "../../components/common/ConfirmDialog";
import { EmptyState } from "../../components/common/EmptyState";
import { ErrorState } from "../../components/common/ErrorState";
import { LoadingSpinner } from "../../components/common/LoadingSpinner";
import { Modal } from "../../components/common/Modal";
import { Tabs } from "../../components/common/Tabs";
import { Textarea } from "../../components/common/Textarea";
import { useToast } from "../../components/common/Toast";
import { fetchAdminUsers, approveTeacherRequest, rejectTeacherRequest } from "../../features/admin/adminSlice";
import { KYC_STATUS_LABELS } from "../../utils/constants";

function LinkRow({ label, href }) {
  if (!href) return null;
  return (
    <a href={href} target="_blank" rel="noreferrer" className="inline-flex items-center gap-1.5 text-sm font-bold text-quran-green hover:underline">
      <ExternalLink size={14} /> {label}
    </a>
  );
}

export function AdminTeacherRequestsPage() {
  const dispatch = useDispatch();
  const toast = useToast();
  const { users, usersStatus, error, teacherActionStatus, teacherFeedback } = useSelector((state) => state.admin);

  const [tab, setTab] = useState("pending");
  const [approveTarget, setApproveTarget] = useState(null);
  const [rejectTarget, setRejectTarget] = useState(null);
  const [feedback, setFeedback] = useState("");
  const [feedbackError, setFeedbackError] = useState("");
  const [busyId, setBusyId] = useState("");

  useEffect(() => {
    dispatch(fetchAdminUsers({ role: "teacher" }));
  }, [dispatch]);

  const teachers = useMemo(() => users.filter((u) => u.role === "teacher"), [users]);
  const pending = useMemo(() => teachers.filter((t) => t.kycStatus === "pending" || t.kycStatus === "not_submitted"), [teachers]);
  const approved = useMemo(() => teachers.filter((t) => t.kycStatus === "verified"), [teachers]);
  const rejected = useMemo(() => teachers.filter((t) => t.kycStatus === "rejected"), [teachers]);

  const tabs = [
    { value: "pending", label: "Pending", count: pending.length },
    { value: "approved", label: "Approved", count: approved.length },
    { value: "rejected", label: "Rejected", count: rejected.length },
  ];

  async function confirmApprove() {
    setBusyId(approveTarget._id);
    try {
      await dispatch(approveTeacherRequest(approveTarget._id)).unwrap();
      toast.success(`${approveTarget.fullName} approved as a teacher`);
      setApproveTarget(null);
    } catch (err) {
      toast.error(err || "Could not approve this teacher");
    } finally {
      setBusyId("");
    }
  }

  function openReject(teacher) {
    setRejectTarget(teacher);
    setFeedback("");
    setFeedbackError("");
  }

  async function confirmReject() {
    if (!feedback.trim()) {
      setFeedbackError("Feedback is required so the teacher knows why they were rejected.");
      return;
    }
    setBusyId(rejectTarget._id);
    try {
      await dispatch(rejectTeacherRequest({ teacherId: rejectTarget._id, feedback: feedback.trim() })).unwrap();
      toast.success(`${rejectTarget.fullName}'s application rejected`);
      setRejectTarget(null);
    } catch (err) {
      toast.error(err || "Could not reject this teacher");
    } finally {
      setBusyId("");
    }
  }

  const listForTab = tab === "pending" ? pending : tab === "approved" ? approved : rejected;

  return (
    <section className="space-y-6">
      <div>
        <h1 className="page-title">Teacher requests</h1>
        <p className="page-subtitle">Review and approve pending teacher applications.</p>
      </div>

      <Tabs tabs={tabs} value={tab} onChange={setTab} />

      {usersStatus === "loading" && <LoadingSpinner label="Loading teacher applications..." />}
      {usersStatus === "failed" && <ErrorState message={error} onRetry={() => dispatch(fetchAdminUsers({ role: "teacher" }))} />}

      {usersStatus === "succeeded" && listForTab.length === 0 && (
        <EmptyState icon={ShieldCheck} title={`No ${tab} teacher applications`} description="Check back later or switch tabs." />
      )}

      {usersStatus === "succeeded" && listForTab.length > 0 && (
        <div className="space-y-4">
          {listForTab.map((teacher) => (
            <div key={teacher._id} className="card-pad space-y-3">
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div className="flex items-start gap-3">
                  <Avatar name={teacher.fullName} size="lg" />
                  <div>
                    <p className="font-black text-quran-text">{teacher.fullName}</p>
                    <p className="text-sm text-quran-muted">{teacher.email}</p>
                    <div className="mt-1">
                      <Badge tone={statusTone(teacher.kycStatus)}>{KYC_STATUS_LABELS[teacher.kycStatus] || teacher.kycStatus}</Badge>
                    </div>
                  </div>
                </div>
                {tab === "pending" && (
                  <div className="flex gap-2">
                    <Button variant="secondary" size="sm" icon={XCircle} onClick={() => openReject(teacher)} loading={busyId === teacher._id && teacherActionStatus === "loading"}>
                      Reject
                    </Button>
                    <Button variant="primary" size="sm" icon={CheckCircle2} onClick={() => setApproveTarget(teacher)} loading={busyId === teacher._id && teacherActionStatus === "loading"}>
                      Accept
                    </Button>
                  </div>
                )}
              </div>

              {teacher.experience && (
                <p className="text-sm text-quran-muted">
                  <span className="font-bold text-quran-text">Experience: </span>
                  {teacher.experience}
                </p>
              )}
              {teacher.bio && <p className="text-sm text-quran-muted">{teacher.bio}</p>}

              <div className="flex flex-wrap gap-4">
                <LinkRow label="Telegram channel" href={teacher.telegramChannelLink} />
                <LinkRow label="Intro video" href={teacher.introVideoUrl} />
                <LinkRow label="KYC document" href={teacher.kycDocumentUrl} />
              </div>

              {tab === "rejected" && teacherFeedback[teacher._id] && (
                <div className="flex items-start gap-2 rounded-lg bg-red-50 p-3 text-sm text-quran-text">
                  <MessageSquareWarning size={16} className="mt-0.5 shrink-0 text-quran-red" />
                  <p>
                    <span className="font-bold">Rejection feedback: </span>
                    {teacherFeedback[teacher._id]}
                  </p>
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      <ConfirmDialog
        open={!!approveTarget}
        title="Approve this teacher?"
        description={approveTarget ? `${approveTarget.fullName} will be verified and their account activated.` : ""}
        confirmLabel="Approve"
        tone="primary"
        loading={teacherActionStatus === "loading"}
        onConfirm={confirmApprove}
        onClose={() => setApproveTarget(null)}
      />

      <Modal
        open={!!rejectTarget}
        onClose={() => setRejectTarget(null)}
        title="Reject teacher application"
        description={rejectTarget ? `Provide feedback for ${rejectTarget.fullName}.` : ""}
        size="sm"
        footer={
          <>
            <Button variant="secondary" onClick={() => setRejectTarget(null)} disabled={teacherActionStatus === "loading"}>
              Cancel
            </Button>
            <Button variant="danger" onClick={confirmReject} loading={teacherActionStatus === "loading"}>
              Reject application
            </Button>
          </>
        }
      >
        <Textarea
          label="Feedback for the teacher"
          required
          rows={4}
          value={feedback}
          onChange={(e) => {
            setFeedback(e.target.value);
            if (feedbackError) setFeedbackError("");
          }}
          error={feedbackError}
          hint="Stored locally only — the backend has no field for rejection feedback yet."
        />
      </Modal>
    </section>
  );
}
