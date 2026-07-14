import { useEffect, useMemo, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate, useParams } from "react-router-dom";
import { Heart, Info, PlayCircle, Star } from "lucide-react";
import { EmptyState } from "../../components/common/EmptyState";
import { ErrorState } from "../../components/common/ErrorState";
import { LoadingSpinner } from "../../components/common/LoadingSpinner";
import { Button } from "../../components/common/Button";
import { Card } from "../../components/common/Card";
import { Modal } from "../../components/common/Modal";
import { FormField } from "../../components/common/FormField";
import { Select } from "../../components/common/Select";
import { useToast } from "../../components/common/Toast";
import { CourseDetails } from "../../components/courses/CourseDetails";
import { RatingForm } from "../../components/courses/RatingForm";
import { fetchCourseById } from "../../features/courses/courseSlice";
import { enrollFree, payForCourse, resetPaymentState, submitCourseReview, toggleFavorite, editMyReview, deleteMyReview } from "../../features/student/studentSlice";
import { getId, isFreeCourse } from "../../utils/courseUtils";
import { formatCurrency } from "../../utils/formatters";
import { PAYMENT_METHODS } from "../../utils/constants";
import { isValidPhone } from "../../utils/validators";

export function StudentCourseDetailsPage() {
  const { courseId } = useParams();
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const toast = useToast();

  const user = useSelector((state) => state.auth.user);
  const { items, selected, status, error } = useSelector((state) => state.courses);
  const { favorites, freeEnrollments, payment, myReviews, reviewStatus, reviewError } = useSelector((state) => state.student);

  const [payModalOpen, setPayModalOpen] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState(PAYMENT_METHODS[0].value);
  const [phoneNumber, setPhoneNumber] = useState("");
  const [phoneError, setPhoneError] = useState("");

  const course = useMemo(() => items.find((item) => item._id === courseId) || (selected?._id === courseId ? selected : null), [items, selected, courseId]);

  useEffect(() => {
    if (!course) dispatch(fetchCourseById(courseId));
  }, [dispatch, courseId, course]);

  useEffect(() => {
    return () => {
      dispatch(resetPaymentState());
    };
  }, [dispatch]);

  useEffect(() => {
    if (payment.status === "succeeded") {
      toast.success(payment.result?.message || "Payment completed");
      setPayModalOpen(false);
      navigate(`/student/learning/${courseId}`);
    }
    if (payment.status === "failed" && payment.error) {
      toast.error(payment.error);
    }
  }, [payment.status]); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    if (reviewStatus === "succeeded") {
      toast.success("Rating submitted");
      dispatch(fetchCourseById(courseId));
    }
  }, [reviewStatus]); // eslint-disable-line react-hooks/exhaustive-deps

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
          <EmptyState icon={Info} title="Course not found" description="This course may have been removed." />
        )}
      </section>
    );
  }

  const userId = getId(user);
  const isEnrolled = (course.enrolledStudents || []).some((entry) => getId(entry.student ?? entry) === userId) || freeEnrollments.includes(course._id);
  const isFavorite = favorites.includes(course._id);
  const free = isFreeCourse(course);

  function handleEnrollFree() {
    if (!user) {
      navigate("/login", { state: { from: `/student/courses/${course._id}` } });
      return;
    }
    dispatch(enrollFree(course._id));
    toast.info("Enrolled (demo only — free enrollment is not connected to the backend yet)");
    navigate(`/student/learning/${course._id}`);
  }

  function openPayModal() {
    if (!user) {
      navigate("/login", { state: { from: `/student/courses/${course._id}` } });
      return;
    }
    setPhoneNumber(user?.whatsappNumber || "");
    setPhoneError("");
    dispatch(resetPaymentState());
    setPayModalOpen(true);
  }

  function handlePay() {
    if (!isValidPhone(phoneNumber)) {
      setPhoneError("Enter a valid phone number");
      return;
    }
    setPhoneError("");
    dispatch(payForCourse({ courseId: course._id, paymentMethod, phoneNumber }));
  }

  const myReviewForCourse = myReviews.find((review) => getId(review.course) === course._id);

  function handleReviewSubmit({ rating, comment }) {
    if (myReviewForCourse) {
      dispatch(editMyReview({ id: myReviewForCourse._id, updates: { rating, comment } }));
      toast.info("Rating updated locally (demo only — edits are not connected to the backend yet)");
      return;
    }
    dispatch(submitCourseReview({ course: course._id, teacher: getId(course.teacher), rating, comment }));
  }

  const headerActions = (
    <>
      {user && (
        <Button
          variant={isFavorite ? "primary" : "secondary"}
          icon={Heart}
          onClick={() => {
            dispatch(toggleFavorite(course._id));
            toast.info(isFavorite ? "Removed from favorites (demo only — not connected to the backend yet)" : "Added to favorites (demo only — not connected to the backend yet)");
          }}
        >
          {isFavorite ? "Favorited" : "Favorite"}
        </Button>
      )}
      {isEnrolled ? (
        <Button variant="primary" icon={PlayCircle} onClick={() => navigate(`/student/learning/${course._id}`)}>
          Continue learning
        </Button>
      ) : free ? (
        <Button variant="primary" onClick={handleEnrollFree}>
          Enroll for free
        </Button>
      ) : (
        <Button variant="primary" onClick={openPayModal}>
          Enroll — {formatCurrency(course.price)}
        </Button>
      )}
    </>
  );

  const ratingsSection = (
    <Card title="Ratings & reviews">
      {!user ? (
        <p className="text-sm text-quran-muted">Login after enrolling to leave a rating.</p>
      ) : !isEnrolled ? (
        <p className="text-sm text-quran-muted">You can rate a course once you've enrolled.</p>
      ) : (
        <div className="space-y-4">
          {myReviewForCourse && (
            <div className="rounded-lg border border-quran-line p-3">
              <div className="flex items-center justify-between gap-2">
                <p className="text-sm font-black text-quran-text">Your rating</p>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => {
                    dispatch(deleteMyReview(myReviewForCourse._id));
                    toast.info("Rating removed locally (demo only — not connected to the backend yet)");
                  }}
                >
                  Remove
                </Button>
              </div>
              <div className="mt-1 flex items-center gap-1 text-quran-gold">
                {Array.from({ length: 5 }, (_, index) => (
                  <Star key={index} size={14} className={index < myReviewForCourse.rating ? "fill-quran-gold text-quran-gold" : "text-quran-line"} />
                ))}
              </div>
              {myReviewForCourse.comment && <p className="mt-1 text-sm text-quran-muted">{myReviewForCourse.comment}</p>}
            </div>
          )}
          <RatingForm
            initialRating={myReviewForCourse?.rating || 0}
            initialComment={myReviewForCourse?.comment || ""}
            onSubmit={handleReviewSubmit}
            loading={reviewStatus === "loading"}
            submitLabel={myReviewForCourse ? "Update rating" : "Submit rating"}
          />
          {reviewStatus === "failed" && reviewError && <p className="field-error">{reviewError}</p>}
        </div>
      )}
    </Card>
  );

  return (
    <section className="space-y-6">
      <PageHeader />
      <CourseDetails course={course} headerActions={headerActions} ratingsSection={ratingsSection} />

      <Modal
        open={payModalOpen}
        onClose={() => {
          setPayModalOpen(false);
          dispatch(resetPaymentState());
        }}
        title="Enroll in this course"
        description={`Pay ${formatCurrency(course.price)} via mobile money to unlock ${course.courseName}.`}
        footer={
          <>
            <Button variant="secondary" onClick={() => setPayModalOpen(false)} disabled={payment.status === "loading"}>
              Cancel
            </Button>
            <Button variant="primary" onClick={handlePay} loading={payment.status === "loading"}>
              Pay {formatCurrency(course.price)}
            </Button>
          </>
        }
      >
        <div className="space-y-4">
          <Select
            label="Payment method"
            required
            value={paymentMethod}
            onChange={(event) => setPaymentMethod(event.target.value)}
            options={PAYMENT_METHODS}
          />
          <FormField
            label="Phone number"
            required
            placeholder="e.g. 61XXXXXXX"
            value={phoneNumber}
            error={phoneError}
            onChange={(event) => setPhoneNumber(event.target.value)}
            hint="The mobile money number to charge for this payment."
          />
          {payment.status === "failed" && payment.error && <p className="field-error">{payment.error}</p>}
          {payment.status === "loading" && <p className="text-sm text-quran-muted">Processing payment, please wait...</p>}
        </div>
      </Modal>
    </section>
  );
}

function PageHeader() {
  return (
    <div>
      <h1 className="page-title">Course details</h1>
      <p className="page-subtitle">Learning outcomes, playlist and enrollment.</p>
    </div>
  );
}
