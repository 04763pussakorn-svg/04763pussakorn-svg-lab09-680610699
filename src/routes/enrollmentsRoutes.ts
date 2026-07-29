import { Router, type Response } from "express";
import { zCourseId } from "../libs/zodValidators.ts";
import { type CustomRequest, type Enrollment } from "../libs/types.ts";
import { authenticateToken } from "../middlewares/authenMiddleware.ts";
import { checkRoles } from "../middlewares/checkRolesMiddleware.ts";

// import database
import { enrollments, courses } from "../db/db.ts";

const router = Router();

const STUDENT_ONLY_MESSAGE = "Only Student can access this API route";

// helper to present an Enrollment using the "courseNo" field name
// expected by the API spec (internally we still store it as courseId)
function toApiShape(e: Enrollment) {
  return { studentId: e.studentId, courseNo: e.courseId };
}

// GET /api/v2/enrollments
// - ADMIN  -> sees every enrollment in the DB
// - STUDENT -> sees only their own enrollments
router.get(
  "/",
  authenticateToken,
  checkRoles,
  (req: CustomRequest, res: Response) => {
    try {
      const user = req.user!;

      const scoped =
        user.role === "ADMIN"
          ? enrollments
          : enrollments.filter((e) => e.studentId === user.studentId);

      return res.status(200).json({
        ok: true,
        enrollments: scoped.map(toApiShape),
      });
    } catch (err) {
      return res.status(500).json({
        ok: false,
        message: "Something is wrong, please try again",
        error: err,
      });
    }
  }
);

// POST /api/v2/enrollments, body = { courseNo }
// Only STUDENT can enroll themselves. ADMIN gets 403.
router.post(
  "/",
  authenticateToken,
  checkRoles,
  (req: CustomRequest, res: Response) => {
    try {
      const user = req.user!;

      if (user.role === "ADMIN") {
        return res.status(403).json({
          ok: true,
          message: STUDENT_ONLY_MESSAGE,
        });
      }

      const { courseNo } = req.body ?? {};
      const parseResult = zCourseId.safeParse(courseNo);

      if (!parseResult.success) {
        return res.status(400).json({
          ok: false,
          message: parseResult.error.issues[0]?.message,
        });
      }

      const courseExists = courses.find((c) => c.courseId === courseNo);
      if (!courseExists) {
        return res.status(404).json({
          ok: false,
          message: `Course ${courseNo} does not exist`,
        });
      }

      const alreadyEnrolled = enrollments.find(
        (e) => e.studentId === user.studentId && e.courseId === courseNo
      );
      if (alreadyEnrolled) {
        return res.status(409).json({
          ok: false,
          message: "You are already enrolled in this course",
        });
      }

      const newEnrollment: Enrollment = {
        studentId: user.studentId as string,
        courseId: courseNo,
      };
      enrollments.push(newEnrollment);

      return res.status(201).json({
        ok: true,
        message: "Enrolled successfully",
        data: toApiShape(newEnrollment),
      });
    } catch (err) {
      return res.status(500).json({
        ok: false,
        message: "Something is wrong, please try again",
        error: err,
      });
    }
  }
);

// DELETE /api/v2/enrollments, body = { courseNo }
// Reads studentId from the token payload and drops that course
// for the token owner. Only STUDENT can call this. ADMIN gets 403.
router.delete(
  "/",
  authenticateToken,
  checkRoles,
  (req: CustomRequest, res: Response) => {
    try {
      const user = req.user!;

      if (user.role === "ADMIN") {
        return res.status(403).json({
          ok: true,
          message: STUDENT_ONLY_MESSAGE,
        });
      }

      const { courseNo } = req.body ?? {};

      const foundIndex = enrollments.findIndex(
        (e) => e.studentId === user.studentId && e.courseId === courseNo
      );

      if (foundIndex === -1) {
        return res.status(404).json({
          ok: false,
          message: "Enrollment not found",
        });
      }

      enrollments.splice(foundIndex, 1);

      return res.status(200).json({
        ok: true,
        message: "You has dropped from this course. See you next semester.",
      });
    } catch (err) {
      return res.status(500).json({
        ok: false,
        message: "Something is wrong, please try again",
        error: err,
      });
    }
  }
);

export default router;
