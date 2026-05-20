import { Instructor } from "./instructor.model";

export interface InstructorSchedule {
  id: number;
  schedule_date: Date;
  schedule_day: Date;
  start_time: Date;
  end_time: Date;
  is_available: boolean;
  instructor_id: number | Instructor;
  created_at: Date;
}