import { useState } from "react";
import { BookOpen, CheckCircle2, ClipboardList, CreditCard, Edit3, FileText, Filter, LayoutDashboard, Lock, MessageSquare, Plus, RefreshCcw, Star, Unlock, UserCheck, Users, Wallet } from "lucide-react";
import { CourseCard, CourseEditor, ProfilePanel } from "../../components/CourseWidgets";
import { Reports } from "../../components/Reports";
import { Button, Card, Input, MetricGrid, RowItem, Section, Toggle } from "../../components/ui";
import { getId } from "../../utils/courseUtils";

export const teacherNav = [
  ["overview", LayoutDashboard, "Overview"],
  ["categories", ClipboardList, "Category Parts"],
  ["courses", BookOpen, "Courses"],
  ["materials", FileText, "Materials"],
  ["reports", Filter, "Reports"],
  ["wallet", Wallet, "Wallet"],
  ["profile", UserCheck, "Profile"],
];

export function TeacherPage({ user, courses, active, saveCourse, deleteCourse, updateCourse }) {
  const [editingCourse, setEditingCourse] = useState(null);
  const [categoryDraft, setCategoryDraft] = useState({ name: "Programming", price: 100 });
  const myCourses = courses.filter((course) => getId(course.teacher) === user._id || course.teacher?._id === "teacher-demo");
  const students = myCourses.reduce((sum, course) => sum + (course.enrolledStudents?.length || 0), 0);
  const revenue = myCourses.reduce((sum, course) => sum + (course.price || 0) * (course.enrolledStudents?.length || 0), 0);

  if (active === "categories") {
    return (
      <Section title="Add Category Part" action={<Button icon={Plus}>Save category</Button>}>
        <div className="two-column">
          <Card title="Prepare category">
            <Input label="Category Name" value={categoryDraft.name} onChange={(name) => setCategoryDraft({ ...categoryDraft, name })} />
            <Input label="Price" type="number" value={categoryDraft.price} onChange={(price) => setCategoryDraft({ ...categoryDraft, price })} />
            <div className="summary-line">
              <span>{categoryDraft.name || "Category"}</span>
              <strong>${Number(categoryDraft.price || 0).toFixed(0)}</strong>
            </div>
          </Card>
          <Card title="Edit category part">
            {["Quran", "Hifz", "Tajweed", categoryDraft.name].map((name, index) => (
              <RowItem key={`${name}-${index}`} icon={Edit3} title={name} meta={`$${index === 3 ? categoryDraft.price : [80, 120, 100][index]}`} action="Edit" />
            ))}
          </Card>
        </div>
      </Section>
    );
  }

  if (active === "courses") {
    return (
      <Section title="Create course" action={<Button icon={Plus} onClick={() => setEditingCourse({})}>New course</Button>}>
        <div className="course-grid">
          {myCourses.map((course) => (
            <CourseCard key={course._id} course={course} onEdit={() => setEditingCourse(course)} onDelete={() => deleteCourse(course._id)} />
          ))}
        </div>
        {editingCourse && <CourseEditor course={editingCourse} onClose={() => setEditingCourse(null)} onSave={(course) => (saveCourse(course), setEditingCourse(null))} />}
      </Section>
    );
  }

  if (active === "materials") {
    return (
      <Section title="Course materials">
        <div className="list-card">
          {myCourses.flatMap((course) =>
            (course.materials || []).map((material) => (
              <div className="material-row" key={`${course._id}-${material.id}`}>
                <FileText size={18} />
                <div>
                  <strong>{material.name}</strong>
                  <span>{course.courseName} - {material.type}</span>
                </div>
                <Toggle label="Download" value={material.downloadAllowed} />
                <Toggle label="Disabled" value={material.disabled} />
              </div>
            ))
          )}
        </div>
      </Section>
    );
  }

  if (active === "reports") return <Reports courses={myCourses} title="Teacher reports" />;
  if (active === "profile") return <ProfilePanel user={user} />;

  if (active === "wallet") {
    return (
      <Section title="Wallet virtual payments">
        <MetricGrid
          metrics={[
            ["Wallet", `$${Number(user.walletBalance || 0).toFixed(2)}`, Wallet],
            ["Revenue", `$${revenue.toFixed(2)}`, CreditCard],
            ["Students", students, Users],
            ["Waafi payments", myCourses.filter((course) => course.paymentMethod === "waafi").length, CheckCircle2],
          ]}
        />
      </Section>
    );
  }

  return (
    <Section title="Teacher overview" action={<Button icon={RefreshCcw}>Refresh</Button>}>
      <MetricGrid metrics={[["Courses", myCourses.length, BookOpen], ["Students", students, Users], ["Revenue", `$${revenue.toFixed(2)}`, CreditCard], ["Rating", user.averageRating ? user.averageRating.toFixed(1) : "New", Star]]} />
      <div className="two-column">
        <Card title="Advancement and feedback">
          {myCourses.map((course) => (
            <RowItem key={course._id} icon={MessageSquare} title={course.courseName} meta={`${course.feedbackCount || 0} feedback - ${course.rating || 0} rating`} action="View" />
          ))}
        </Card>
        <Card title="Lock playlist or section">
          {myCourses.flatMap((course) =>
            (course.playlists || []).map((playlist) => (
              <RowItem
                key={playlist.id}
                icon={playlist.locked ? Lock : Unlock}
                title={playlist.title}
                meta={course.courseName}
                action={playlist.locked ? "Unlock" : "Lock"}
                onClick={() => updateCourse(course._id, { playlists: course.playlists.map((item) => (item.id === playlist.id ? { ...item, locked: !item.locked } : item)) })}
              />
            ))
          )}
        </Card>
      </div>
    </Section>
  );
}
