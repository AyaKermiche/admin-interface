import { Candidate } from "./candidate.model";
import { Instructor } from "./instructor.model";

export interface Session {
  id: number;
  start_time: Date;
  end_time: Date;
  attended: boolean;
  status: string;
  candidate_id: number | Candidate;
  instructor_id: number | Instructor;
  created_at: Date;
  type_session: string;
}