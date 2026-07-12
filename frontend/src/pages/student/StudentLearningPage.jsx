import { useEffect, useMemo, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Link, useNavigate, useParams } from "react-router-dom";
import {
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  FileText,
  HelpCircle,
  Lock,
  Mic,
  MessageSquare,
  PlayCircle,
  Radio,
} from "lucide-react";
import { EmptyState } from "../../components/common/EmptyState";
import { ErrorState } from "../../components/common/ErrorState";
import { LoadingSpinner } from "../../components/common/LoadingSpinner";
import { Button } from "../../components/common/Button";
import { Card } from "../../components/common/Card";
import { Badge } from "../../components/common/Badge";
import { Textarea } from "../../components/common/Textarea";
import { FormField } from "../../components/common/FormField";
import { useToast } from "../../components/common/Toast";
import { fetchCourseById } from "../../features/courses/courseSlice";
import { markSectionComplete, saveLessonNote, setLastAccessed, submitRecitation } from "../../features/student/studentSlice";
import { getId, countLessons } from "../../utils/courseUtils";
import { formatDateTime } from "../../utils/formatters";
import { api } from "../../api/client";

function flattenSections(course) {
  const rows = [];
  (course?.playlists || []).forEach((playlist) => {
    (playlist.sections || []).forEach((section) => {
      rows.push({ ...section, playlistId: playlist.id, playlistTitle: playlist.title });
    });
  });
  return rows;
}

function isAccessible(section) {
  return !section.locked || section.preview;
}

export function StudentLearningPage() {
  const { courseId } = useParams();
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const toast = useToast();

  const user = useSelector((state) => state.auth.user);
  const { items, selected, status, error } = useSelector((state) => state.courses);
  const { freeEnrollments, progress, recitations } = useSelector((state) => state.student);

  const course = useMemo(() => items.find((item) => item._id === courseId) || (selected?._id === courseId ? selected : null), [items, selected, courseId]);

  useEffect(() => {
    if (!course) dispatch(fetchCourseById(courseId));
  }, [dispatch, courseId, course]);

  const allSections = useMemo(() => flattenSections(course), [course]);
  const progressEntry = progress[courseId] || { completedSectionIds: [], notes: {} };

  const [currentSectionId, setCurrentSectionId] = useState(null);
  const [noteDraft, setNoteDraft] = useState("");
  const [recitationInput, setRecitationInput] = useState("");
  const [recitationNote, setRecitationNote] = useState("");

  useEffect(() => {
    if (!allSections.length || currentSectionId) return;
    const lastAccessible = allSections.find((section) => section.id === progressEntry.lastAccessedSectionId && isAccessible(section));
    const firstAccessible = allSections.find(isAccessible);
    setCurrentSectionId((lastAccessible || firstAccessible || allSections[0])?.id || null);
  }, [allSections, progressEntry.lastAccessedSectionId, currentSectionId]);

  const currentSection = allSections.find((section) => section.id === currentSectionId) || null;

  useEffect(() => {
    setNoteDraft(currentSection ? progressEntry.notes?.[currentSection.id] || "" : "");
    setRecitationInput("");
    setRecitationNote("");
  }, [currentSection?.id]); // eslint-disable-line react-hooks/exhaustive-deps

  if (status === "loading" && !course) {
    return (
      <section className="space-y-6">
        <PageHeader />
        <LoadingSpinner label="Loading course..." />
      </section>
    );
  }

  if (!course) {
    return (
      <section className="space-y-6">
        <PageHeader />
        {status === "failed" ? (
          <ErrorState message={error} onRetry={() => dispatch(fetchCourseById(courseId))} />
        ) : (
          <EmptyState icon={PlayCircle} title="Course not found" description="This course may have been removed." />
        )}
      </section>
    );
  }

  const userId = getId(user);
  const isEnrolled = (course.enrolledStudents || []).some((entry) => getId(entry.student ?? entry) === userId) || freeEnrollments.includes(course._id);

  if (!isEnrolled) {
    return (
      <section className="space-y-6">
        <PageHeader />
        <EmptyState
          icon={Lock}
          title="You're not enrolled in this course"
          description="Enroll from the course details page to access the learning player."
          action={
            <Link to={`/student/courses/${courseId}`} className="btn-primary btn-sm">
              Go to course details
            </Link>
          }
        />
      </section>
    );
  }

  const totalLessons = countLessons(course);
  const completedCount = progressEntry.completedSectionIds?.length || 0;
  const progressPercent = totalLessons ? Math.min(100, (completedCount / totalLessons) * 100) : 0;

  const accessibleSections = allSections.filter(isAccessible);
  const currentIndex = accessibleSections.findIndex((section) => section.id === currentSectionId);

  function goToSection(section) {
    if (!section || !isAccessible(section)) return;
    setCurrentSectionId(section.id);
    dispatch(setLastAccessed({ courseId, sectionId: section.id }));
  }

  function handleMarkComplete() {
    if (!currentSection) return;
    dispatch(markSectionComplete({ courseId, sectionId: currentSection.id }));
    toast.success("Marked complete (demo only — not connected to the backend yet)");
  }

  function handleNoteBlur() {
    if (!currentSection) return;
    dispatch(saveLessonNote({ courseId, sectionId: currentSection.id, note: noteDraft }));
  }

  function handleRecitationSubmit(event) {
    event.preventDefault();
    if (!recitationInput.trim()) {
      toast.error("Add an audio link before submitting");
      return;
    }
    dispatch(submitRecitation({ courseId, sectionId: currentSection.id, audioUrl: recitationInput.trim(), note: recitationNote.trim() }));
    toast.info("Recitation submitted (demo only — not connected to the backend yet)");
    setRecitationInput("");
    setRecitationNote("");
  }

  const sectionRecitations = currentSection ? recitations.filter((item) => item.sectionId === currentSection.id && item.courseId === courseId) : [];
  const isCompleted = currentSection ? progressEntry.completedSectionIds?.includes(currentSection.id) : false;
  const material = currentSection
    ? (course.materials || []).find((item) => item.fileType?.toLowerCase() === (currentSection.type === "pdf" ? "pdf" : currentSection.type === "powerpoint" ? "powerpoint" : ""))
    : null;

  return (
    <section className="space-y-6">
      <PageHeader />

      <div className="card-pad">
        <div className="flex items-center justify-between gap-3">
          <p className="text-sm font-black text-quran-text">Course progress</p>
          <span className="text-sm font-black text-quran-green">{Math.round(progressPercent)}%</span>
        </div>
        <div className="progress-line mt-2">
          <span style={{ width: `${progressPercent}%` }} />
        </div>
        <p className="mt-1 text-xs text-quran-muted">
          {completedCount}/{totalLessons} lessons complete
        </p>
      </div>

      <div className="grid grid-cols-1 gap-5 lg:grid-cols-[300px_1fr]">
        <aside className="card-pad h-fit space-y-4">
          <h2 className="text-sm font-black text-quran-text">Course content</h2>
          {(course.playlists || []).map((playlist) => (
            <div key={playlist.id}>
              <p className="mb-1 text-xs font-black uppercase tracking-wide text-quran-muted">{playlist.title}</p>
              <ul className="space-y-1">
                {(playlist.sections || []).map((section) => {
                  const accessible = isAccessible(section);
                  const completed = progressEntry.completedSectionIds?.includes(section.id);
                  const active = section.id === currentSectionId;
                  return (
                    <li key={section.id}>
                      <button
                        type="button"
                        disabled={!accessible}
                        onClick={() => goToSection(section)}
                        className={`flex w-full items-center justify-between gap-2 rounded-md px-2.5 py-2 text-left text-sm font-semibold transition-colors ${
                          active ? "bg-quran-soft text-quran-text" : accessible ? "text-quran-muted hover:bg-quran-soft/60 hover:text-quran-text" : "text-quran-muted/50"
                        }`}
                      >
                        <span className="truncate">{section.title}</span>
                        {completed ? (
                          <CheckCircle2 size={15} className="shrink-0 text-quran-green" />
                        ) : !accessible ? (
                          <Lock size={14} className="shrink-0" />
                        ) : null}
                      </button>
                    </li>
                  );
                })}
              </ul>
            </div>
          ))}
        </aside>

        <div className="space-y-5">
          {!currentSection ? (
            <EmptyState icon={Lock} title="No content available yet" description="Your teacher hasn't unlocked any lessons yet." />
          ) : (
            <>
              <Card>
                <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
                  <div>
                    <p className="text-xs font-black uppercase tracking-wide text-quran-muted">{currentSection.playlistTitle}</p>
                    <h2 className="text-lg font-black text-quran-text">{currentSection.title}</h2>
                  </div>
                  {isCompleted && <Badge tone="green" icon={CheckCircle2}>Completed</Badge>}
                </div>

                <SectionContent section={currentSection} course={course} material={material} />

                <div className="mt-4 flex flex-wrap items-center gap-2">
                  <Button variant="secondary" icon={ChevronLeft} disabled={currentIndex <= 0} onClick={() => goToSection(accessibleSections[currentIndex - 1])}>
                    Previous
                  </Button>
                  <Button
                    variant="secondary"
                    icon={ChevronRight}
                    disabled={currentIndex === -1 || currentIndex >= accessibleSections.length - 1}
                    onClick={() => goToSection(accessibleSections[currentIndex + 1])}
                  >
                    Next
                  </Button>
                  <Button variant={isCompleted ? "ghost" : "primary"} icon={CheckCircle2} onClick={handleMarkComplete} disabled={isCompleted} className="ml-auto">
                    {isCompleted ? "Already complete" : "Mark complete"}
                  </Button>
                </div>
              </Card>

              {currentSection.type === "recitation" && (
                <Card title="Submit your recitation" subtitle="Audio upload isn't available yet — paste a link to your recording instead">
                  <form onSubmit={handleRecitationSubmit} className="space-y-3">
                    <FormField
                      label="Recording link"
                      required
                      placeholder="https://... (voice note or recording link)"
                      value={recitationInput}
                      onChange={(event) => setRecitationInput(event.target.value)}
                    />
                    <Textarea label="Note for your teacher" value={recitationNote} onChange={(event) => setRecitationNote(event.target.value)} placeholder="Anything you'd like feedback on..." />
                    <Button type="submit" variant="primary" icon={Mic}>
                      Submit recitation
                    </Button>
                  </form>

                  {sectionRecitations.length > 0 && (
                    <div className="mt-4 space-y-2 border-t border-quran-line pt-4">
                      <p className="text-sm font-black text-quran-text">Your submissions</p>
                      {sectionRecitations.map((item) => (
                        <div key={item.id} className="rounded-lg border border-quran-line p-3 text-sm">
                          <div className="flex items-center justify-between gap-2">
                            <a href={item.audioUrl} target="_blank" rel="noreferrer" className="truncate font-bold text-quran-green">
                              {item.audioUrl}
                            </a>
                            <Badge tone={item.status === "reviewed" ? "green" : "amber"}>{item.status}</Badge>
                          </div>
                          <p className="mt-1 text-xs text-quran-muted">Submitted {formatDateTime(item.submittedAt)}</p>
                          {item.note && <p className="mt-1 text-quran-muted">{item.note}</p>}
                        </div>
                      ))}
                    </div>
                  )}
                </Card>
              )}

              <Card title="Teacher feedback">
                {sectionRecitations.some((item) => item.teacherFeedback) ? (
                  <ul className="space-y-2">
                    {sectionRecitations
                      .filter((item) => item.teacherFeedback)
                      .map((item) => (
                        <li key={item.id} className="flex items-start gap-2 text-sm text-quran-muted">
                          <MessageSquare size={15} className="mt-0.5 shrink-0 text-quran-teal" /> {item.teacherFeedback}
                        </li>
                      ))}
                  </ul>
                ) : (
                  <EmptyState icon={MessageSquare} title="No feedback yet" description="Your teacher's feedback on your recitations will appear here." />
                )}
              </Card>

              <Card title="My notes" subtitle="Saved automatically when you click away">
                <Textarea value={noteDraft} onChange={(event) => setNoteDraft(event.target.value)} onBlur={handleNoteBlur} placeholder="Jot down notes for this lesson..." />
              </Card>
            </>
          )}
        </div>
      </div>
    </section>
  );
}

function SectionContent({ section, course, material }) {
  if (section.type === "video" || section.type === "audio") {
    return (
      <div className="flex h-56 flex-col items-center justify-center gap-2 rounded-lg bg-quran-soft text-quran-muted">
        <PlayCircle size={40} className="text-quran-green" aria-hidden="true" />
        <p className="text-sm font-semibold">{section.type === "video" ? "Video player" : "Audio player"} placeholder — media hosting isn't connected yet.</p>
      </div>
    );
  }
  if (section.type === "text") {
    return (
      <div className="rounded-lg bg-quran-soft p-4 text-sm text-quran-muted">
        <p>{section.description || `This is a text-based lesson: "${section.title}". Full lesson content will appear here once the content editor is connected.`}</p>
      </div>
    );
  }
  if (section.type === "pdf" || section.type === "powerpoint") {
    return (
      <div className="rounded-lg bg-quran-soft p-4">
        {material ? (
          <a href={api.mediaUrl(material.fileUrl) || "#"} target="_blank" rel="noreferrer" className="btn-secondary btn-sm inline-flex items-center gap-2">
            <FileText size={15} /> View material — {material.title}
          </a>
        ) : (
          <p className="flex items-center gap-2 text-sm text-quran-muted">
            <FileText size={15} /> No matching material has been uploaded for this lesson yet.
          </p>
        )}
      </div>
    );
  }
  if (section.type === "live") {
    return (
      <div className="flex items-center gap-2 rounded-lg bg-quran-soft p-4 text-sm text-quran-muted">
        <Radio size={18} className="text-quran-red" /> This is a live class session. Your teacher will announce the join link in notifications when it starts.
      </div>
    );
  }
  if (section.type === "quiz") {
    return <EmptyState icon={HelpCircle} title="Quiz coming soon" description="Interactive quizzes for this lesson aren't available yet." />;
  }
  if (section.type === "recitation") {
    return (
      <div className="flex items-center gap-2 rounded-lg bg-quran-soft p-4 text-sm text-quran-muted">
        <Mic size={18} className="text-quran-green" /> Submit your recitation below for teacher review.
      </div>
    );
  }
  return <p className="text-sm text-quran-muted">Content for "{section.title}" in {course.courseName}.</p>;
}

function PageHeader() {
  return (
    <div>
      <h1 className="page-title">Learning player</h1>
      <p className="page-subtitle">Watch lessons, submit recitations and track progress.</p>
    </div>
  );
}
