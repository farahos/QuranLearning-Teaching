import { useState } from "react";
import { BookOpen, Download, Edit3, Eye, Heart, Plus, Star, Trash2, Upload, Users, XCircle } from "lucide-react";
import { api } from "../api/client";
import { initials } from "../utils/courseUtils";
import { Button, Card, Input, RowItem, Toggle } from "./ui";

export function CourseEditor({ course, onClose, onSave }) {
  const [draft, setDraft] = useState({
    _id: course._id,
    courseName: course.courseName || "",
    description: course.description || "",
    category: course.category || "Quran",
    price: course.price ?? 0,
    paymentType: course.paymentType || (course.price > 0 ? "paid" : "free"),
    paymentMethod: course.paymentMethod || "waafi",
    certificateEnabled: course.certificateEnabled ?? true,
    playlists: course.playlists || [{ id: crypto.randomUUID(), title: "Introduction", locked: false, sections: [] }],
    materials: course.materials || [],
  });

  function addSection() {
    setDraft({
      ...draft,
      playlists: draft.playlists.map((playlist, index) =>
        index === 0
          ? { ...playlist, sections: [...playlist.sections, { id: crypto.randomUUID(), title: "Introduction", locked: false, completed: false }] }
          : playlist
      ),
    });
  }

  function addMaterial() {
    setDraft({
      ...draft,
      materials: [...draft.materials, { id: crypto.randomUUID(), name: "Course material.pdf", type: "PDF", downloadAllowed: true, disabled: false }],
    });
  }

  return (
    <div className="modal-backdrop">
      <div className="modal wide">
        <div className="modal-header">
          <h2>{course._id ? "Edit course" : "Create course"}</h2>
          <button className="icon-button" onClick={onClose} title="Close">
            <XCircle size={20} />
          </button>
        </div>
        <div className="two-column">
          <div>
            <Input label="Course name" value={draft.courseName} onChange={(courseName) => setDraft({ ...draft, courseName })} />
            <Input label="Category" value={draft.category} onChange={(category) => setDraft({ ...draft, category })} />
            <Input label="Price" type="number" value={draft.price} onChange={(price) => setDraft({ ...draft, price: Number(price) })} />
            <label className="field">
              <span>Description</span>
              <textarea value={draft.description} onChange={(event) => setDraft({ ...draft, description: event.target.value })} />
            </label>
          </div>
          <div>
            <label className="field">
              <span>Payment method</span>
              <select value={draft.paymentType} onChange={(event) => setDraft({ ...draft, paymentType: event.target.value, price: event.target.value === "free" ? 0 : draft.price })}>
                <option value="free">Free</option>
                <option value="paid">Pay using Waafi</option>
              </select>
            </label>
            <div className="control-stack">
              <Toggle label="Upload certification after content is done" value={draft.certificateEnabled} onClick={() => setDraft({ ...draft, certificateEnabled: !draft.certificateEnabled })} />
              <Button icon={Plus} onClick={() => setDraft({ ...draft, playlists: [...draft.playlists, { id: crypto.randomUUID(), title: "New playlist", locked: false, sections: [] }] })}>
                Create playlist
              </Button>
              <Button icon={Plus} onClick={addSection}>Add section part</Button>
              <Button icon={Upload} onClick={addMaterial}>Add PDF / PowerPoint</Button>
            </div>
          </div>
        </div>
        <div className="modal-footer">
          <button onClick={onClose}>Cancel</button>
          <button className="primary-button" onClick={() => onSave(draft)}>Save course</button>
        </div>
      </div>
    </div>
  );
}

export function CourseCard({ course, onEdit, onDelete, student, onFavorite }) {
  return (
    <article className="course-card">
      <div className="course-media">
        {course.coverImageUrl ? <img src={api.mediaUrl(course.coverImageUrl)} alt="" /> : <BookOpen size={44} />}
        <span>{course.paymentType === "free" || course.price === 0 ? "Free" : "Waafi"}</span>
      </div>
      <div className="course-body">
        <div>
          <p className="eyebrow">{course.category}</p>
          <h3>{course.courseName}</h3>
          <p>{course.description}</p>
        </div>
        <div className="course-meta">
          <strong>${Number(course.price || 0).toFixed(2)}</strong>
          <span><Star size={14} /> {course.rating || 0}</span>
          <span><Users size={14} /> {course.enrolledStudents?.length || 0}</span>
        </div>
        <div className="card-actions">
          {student ? (
            <>
              <button onClick={onFavorite}>{course.favorite ? <Heart fill="currentColor" size={17} /> : <Heart size={17} />} Favorite</button>
              <button><Eye size={17} /> View</button>
            </>
          ) : (
            <>
              <button onClick={onEdit}><Edit3 size={17} /> Edit</button>
              <button onClick={onDelete}><Trash2 size={17} /> Delete</button>
            </>
          )}
        </div>
      </div>
    </article>
  );
}

export function ProgressCard({ course }) {
  const complete = course.progress >= 100 && course.certificateEnabled;
  return (
    <Card title={course.courseName}>
      <div className="progress-line">
        <span style={{ width: `${course.progress || 0}%` }} />
      </div>
      <div className="summary-line">
        <span>{course.progress || 0}% completed</span>
        <button disabled={!complete}>{complete ? "Download certificate" : "Certificate locked"}</button>
      </div>
      {(course.materials || []).map((material) => (
        <RowItem key={material.id} icon={Download} title={material.name} meta={material.downloadAllowed && !material.disabled ? "Download allowed" : "Download disabled"} action="Open" />
      ))}
    </Card>
  );
}

export function UserRow({ user, onChange }) {
  return (
    <div className="user-row">
      <div className="avatar">{initials(user.fullName)}</div>
      <div>
        <strong>{user.fullName}</strong>
        <span>{user.email}</span>
      </div>
      <select value={user.role} onChange={(event) => onChange({ role: event.target.value })}>
        <option value="student">Student</option>
        <option value="teacher">Teacher</option>
        <option value="admin">Admin</option>
      </select>
      <button onClick={() => onChange({ active: !user.active })}>{user.active === false ? "Activate" : "Deactivate"}</button>
      <button onClick={() => onChange({ fullName: `${user.fullName} *` })}>Edit</button>
    </div>
  );
}

export function ProfilePanel({ user }) {
  return (
    <section className="section">
      <div className="section-header">
        <h2>Profile Management</h2>
      </div>
      <Card title={user.fullName || "Profile"}>
        <div className="profile-grid">
          <div className="avatar large">{initials(user.fullName)}</div>
          <Input label="Full name" value={user.fullName || ""} onChange={() => undefined} />
          <Input label="Email" value={user.email || ""} onChange={() => undefined} />
          <Input label="Role" value={user.role || ""} onChange={() => undefined} />
        </div>
      </Card>
    </section>
  );
}
