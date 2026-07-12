import { useEffect, useMemo, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Flag, MessageSquare, Plus, Star, X } from "lucide-react";
import { Avatar } from "../../components/common/Avatar";
import { Badge, statusTone } from "../../components/common/Badge";
import { Button } from "../../components/common/Button";
import { Card } from "../../components/common/Card";
import { EmptyState } from "../../components/common/EmptyState";
import { ErrorState } from "../../components/common/ErrorState";
import { FormField } from "../../components/common/FormField";
import { LoadingSpinner } from "../../components/common/LoadingSpinner";
import { Modal } from "../../components/common/Modal";
import { Select } from "../../components/common/Select";
import { useToast } from "../../components/common/Toast";
import { fetchCourses } from "../../features/courses/courseSlice";
import { closeSurvey, createSurvey, fetchTeacherReviews, replyToReview, toggleFlagReview } from "../../features/teacher/teacherSlice";
import { getId } from "../../utils/courseUtils";
import { formatDateTime } from "../../utils/formatters";

const RATING_OPTIONS = [
  { value: "", label: "All ratings" },
  { value: "5", label: "5 stars" },
  { value: "4", label: "4 stars" },
  { value: "3", label: "3 stars" },
  { value: "2", label: "2 stars" },
  { value: "1", label: "1 star" },
];

const QUESTION_TYPES = [
  { value: "text", label: "Text answer" },
  { value: "multiple_choice", label: "Multiple choice" },
  { value: "rating", label: "Rating" },
];

let questionSeq = 0;
function newQuestionId() {
  questionSeq += 1;
  return `question-draft-${questionSeq}`;
}

function ReviewCard({ review, courseName, reply, flagged, onReply, onFlag }) {
  const [draft, setDraft] = useState(reply || "");

  return (
    <div className="rounded-lg border border-quran-line bg-white p-4">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="flex items-start gap-3">
          <Avatar name={review.student?.fullName} size="md" />
          <div>
            <p className="font-black text-quran-text">{review.student?.fullName || "Student"}</p>
            <p className="text-xs text-quran-muted">{courseName || "Course"} · {formatDateTime(review.createdAt)}</p>
            <div className="mt-1 flex items-center gap-0.5">
              {[1, 2, 3, 4, 5].map((value) => (
                <Star key={value} size={14} className={value <= review.rating ? "fill-quran-gold text-quran-gold" : "text-quran-line"} aria-hidden="true" />
              ))}
            </div>
          </div>
        </div>
        <Button
          variant={flagged ? "danger" : "secondary"}
          size="sm"
          icon={Flag}
          aria-pressed={flagged}
          onClick={() => onFlag(review._id)}
        >
          {flagged ? "Flagged" : "Flag"}
        </Button>
      </div>
      {review.comment && <p className="mt-3 text-sm text-quran-muted">{review.comment}</p>}

      <div className="mt-3 border-t border-quran-line pt-3">
        {reply ? (
          <div className="mb-2 rounded-lg bg-quran-soft p-3">
            <p className="text-xs font-black uppercase tracking-wide text-quran-muted">Your reply</p>
            <p className="mt-1 text-sm text-quran-text">{reply}</p>
          </div>
        ) : null}
        <FormField
          as="textarea"
          label={reply ? "Update your reply" : "Reply to this feedback"}
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          placeholder="Thank the student or address their feedback..."
        />
        <div className="mt-2 flex justify-end">
          <Button variant="primary" size="sm" icon={MessageSquare} disabled={!draft.trim()} onClick={() => onReply(review._id, draft.trim())}>
            {reply ? "Update reply" : "Send reply"}
          </Button>
        </div>
      </div>
    </div>
  );
}

export function TeacherRatingsPage() {
  const dispatch = useDispatch();
  const toast = useToast();
  const user = useSelector((state) => state.auth.user);
  const reviews = useSelector((state) => state.teacher.reviews);
  const reviewsStatus = useSelector((state) => state.teacher.reviewsStatus);
  const reviewsError = useSelector((state) => state.teacher.reviewsError);
  const replies = useSelector((state) => state.teacher.replies);
  const flagged = useSelector((state) => state.teacher.flagged);
  const surveys = useSelector((state) => state.teacher.surveys);
  const courses = useSelector((state) => state.courses.items);

  const [filters, setFilters] = useState({ courseId: "", rating: "", from: "", to: "" });
  const [surveyModalOpen, setSurveyModalOpen] = useState(false);
  const [surveyForm, setSurveyForm] = useState({ title: "", description: "", questions: [] });

  useEffect(() => {
    if (user?._id) dispatch(fetchTeacherReviews(user._id));
    dispatch(fetchCourses());
  }, [dispatch, user?._id]);

  const courseNameById = useMemo(() => {
    const map = {};
    courses.forEach((course) => {
      map[getId(course)] = course.courseName;
    });
    return map;
  }, [courses]);

  const ownCourseOptions = useMemo(
    () => courses.filter((course) => getId(course.teacher) === user?._id).map((course) => ({ value: course._id, label: course.courseName })),
    [courses, user?._id]
  );

  const filteredReviews = useMemo(() => {
    return reviews.filter((review) => {
      if (filters.courseId && getId(review.course) !== filters.courseId) return false;
      if (filters.rating && String(review.rating) !== filters.rating) return false;
      if (filters.from && new Date(review.createdAt) < new Date(filters.from)) return false;
      if (filters.to && new Date(review.createdAt) > new Date(`${filters.to}T23:59:59`)) return false;
      return true;
    });
  }, [reviews, filters]);

  const distribution = useMemo(() => {
    const counts = { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 };
    reviews.forEach((review) => {
      if (counts[review.rating] !== undefined) counts[review.rating] += 1;
    });
    const max = Math.max(1, ...Object.values(counts));
    return { counts, max };
  }, [reviews]);

  function handleReply(reviewId, text) {
    dispatch(replyToReview({ reviewId, reply: text }));
    toast.success("Reply saved locally (demo only — not connected to the backend yet)");
  }

  function handleFlag(reviewId) {
    dispatch(toggleFlagReview(reviewId));
  }

  function addQuestion() {
    setSurveyForm((prev) => ({
      ...prev,
      questions: [...prev.questions, { id: newQuestionId(), type: "text", label: "", options: "" }],
    }));
  }

  function updateQuestion(id, updates) {
    setSurveyForm((prev) => ({
      ...prev,
      questions: prev.questions.map((q) => (q.id === id ? { ...q, ...updates } : q)),
    }));
  }

  function removeQuestion(id) {
    setSurveyForm((prev) => ({ ...prev, questions: prev.questions.filter((q) => q.id !== id) }));
  }

  function handleCreateSurvey() {
    if (!surveyForm.title.trim()) {
      toast.error("Survey title is required");
      return;
    }
    const questions = surveyForm.questions
      .filter((q) => q.label.trim())
      .map((q) => ({
        id: q.id,
        type: q.type,
        label: q.label.trim(),
        options: q.type === "multiple_choice" ? q.options.split(",").map((o) => o.trim()).filter(Boolean) : undefined,
      }));
    dispatch(
      createSurvey({
        title: surveyForm.title.trim(),
        description: surveyForm.description.trim(),
        responses: 0,
        questions,
      })
    );
    toast.success("Survey created (demo only — not connected to the backend yet)");
    setSurveyForm({ title: "", description: "", questions: [] });
    setSurveyModalOpen(false);
  }

  return (
    <section className="space-y-6">
      <div>
        <h1 className="page-title">Ratings & feedback</h1>
        <p className="page-subtitle">See what students are saying and respond.</p>
      </div>

      <Card title="Rating distribution">
        <div className="space-y-2">
          {[5, 4, 3, 2, 1].map((star) => (
            <div key={star} className="flex items-center gap-3">
              <span className="flex w-14 shrink-0 items-center gap-1 text-xs font-bold text-quran-muted">
                {star} <Star size={12} className="fill-quran-gold text-quran-gold" aria-hidden="true" />
              </span>
              <div className="h-2 flex-1 overflow-hidden rounded-full bg-quran-soft">
                <div
                  className="h-full rounded-full bg-quran-green"
                  style={{ width: `${(distribution.counts[star] / distribution.max) * 100}%` }}
                />
              </div>
              <span className="w-6 shrink-0 text-right text-xs font-bold text-quran-muted">{distribution.counts[star]}</span>
            </div>
          ))}
        </div>
      </Card>

      <Card>
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
          <Select
            label="Course"
            value={filters.courseId}
            onChange={(e) => setFilters((prev) => ({ ...prev, courseId: e.target.value }))}
            options={[{ value: "", label: "All courses" }, ...ownCourseOptions]}
          />
          <Select
            label="Rating"
            value={filters.rating}
            onChange={(e) => setFilters((prev) => ({ ...prev, rating: e.target.value }))}
            options={RATING_OPTIONS}
          />
          <FormField label="From date" type="date" value={filters.from} onChange={(e) => setFilters((prev) => ({ ...prev, from: e.target.value }))} />
          <FormField label="To date" type="date" value={filters.to} onChange={(e) => setFilters((prev) => ({ ...prev, to: e.target.value }))} />
        </div>
      </Card>

      {reviewsStatus === "loading" && !reviews.length ? (
        <LoadingSpinner label="Loading reviews..." />
      ) : reviewsStatus === "failed" ? (
        <ErrorState message={reviewsError} onRetry={() => user?._id && dispatch(fetchTeacherReviews(user._id))} />
      ) : filteredReviews.length ? (
        <div className="space-y-3">
          {filteredReviews.map((review) => (
            <ReviewCard
              key={review._id}
              review={review}
              courseName={courseNameById[getId(review.course)]}
              reply={replies[review._id]}
              flagged={!!flagged[review._id]}
              onReply={handleReply}
              onFlag={handleFlag}
            />
          ))}
        </div>
      ) : (
        <EmptyState icon={Star} title="No reviews match these filters" description="Try adjusting the filters above." />
      )}

      <Card
        title="Feedback surveys"
        subtitle="Session-only until the backend supports surveys"
        action={
          <Button variant="primary" size="sm" icon={Plus} onClick={() => setSurveyModalOpen(true)}>
            Create survey
          </Button>
        }
      >
        {surveys.length ? (
          <ul className="space-y-3">
            {surveys.map((survey) => (
              <li key={survey.id} className="flex flex-wrap items-center justify-between gap-3 rounded-lg border border-quran-line p-3">
                <div>
                  <p className="font-bold text-quran-text">{survey.title}</p>
                  <p className="text-xs text-quran-muted">{survey.responses || 0} responses</p>
                </div>
                <div className="flex items-center gap-2">
                  <Badge tone={statusTone(survey.status)}>{survey.status}</Badge>
                  {survey.status === "published" && (
                    <Button variant="secondary" size="sm" onClick={() => dispatch(closeSurvey(survey.id))}>
                      Close
                    </Button>
                  )}
                </div>
              </li>
            ))}
          </ul>
        ) : (
          <EmptyState icon={MessageSquare} title="No surveys yet" description="Create a survey to collect structured feedback from students." />
        )}
      </Card>

      <Modal
        open={surveyModalOpen}
        onClose={() => setSurveyModalOpen(false)}
        title="Create survey"
        size="lg"
        footer={
          <>
            <Button variant="secondary" onClick={() => setSurveyModalOpen(false)}>
              Cancel
            </Button>
            <Button variant="primary" onClick={handleCreateSurvey}>
              Create survey
            </Button>
          </>
        }
      >
        <div className="space-y-4">
          <FormField label="Survey title" required value={surveyForm.title} onChange={(e) => setSurveyForm((prev) => ({ ...prev, title: e.target.value }))} />
          <FormField
            as="textarea"
            label="Description"
            value={surveyForm.description}
            onChange={(e) => setSurveyForm((prev) => ({ ...prev, description: e.target.value }))}
          />

          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <p className="label">Questions</p>
              <Button variant="secondary" size="sm" icon={Plus} type="button" onClick={addQuestion}>
                Add question
              </Button>
            </div>
            {surveyForm.questions.map((question) => (
              <div key={question.id} className="space-y-2 rounded-lg border border-quran-line p-3">
                <div className="flex items-start gap-2">
                  <FormField
                    label="Question"
                    value={question.label}
                    onChange={(e) => updateQuestion(question.id, { label: e.target.value })}
                    className="flex-1"
                  />
                  <Button
                    variant="danger"
                    size="sm"
                    iconOnly
                    icon={X}
                    ariaLabel="Remove question"
                    onClick={() => removeQuestion(question.id)}
                    className="mt-6"
                  />
                </div>
                <Select label="Type" value={question.type} onChange={(e) => updateQuestion(question.id, { type: e.target.value })} options={QUESTION_TYPES} />
                {question.type === "multiple_choice" && (
                  <FormField
                    label="Options"
                    hint="Comma-separated"
                    value={question.options}
                    onChange={(e) => updateQuestion(question.id, { options: e.target.value })}
                  />
                )}
              </div>
            ))}
            {!surveyForm.questions.length && <p className="text-sm text-quran-muted">Add at least one question.</p>}
          </div>
        </div>
      </Modal>
    </section>
  );
}
