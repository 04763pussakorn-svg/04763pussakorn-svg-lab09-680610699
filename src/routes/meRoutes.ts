import { Router, type Request, type Response } from "express";

const router = Router();

// GET /api/me
// TODO: replace the placeholder values below with your own info
router.get("/", (req: Request, res: Response) => {
  return res.status(200).json({
    success: true,
    message: "Student Information",
    data: {
      studentId: "680610699", // TODO: your student ID
      firstName: "Pussakorn", // TODO
      lastName: "Tapjak", // TODO
      program: "CPE", // TODO: "CPE" or "ISNE"
      section: "001", // TODO: your section
    },
  });
});

export default router;
