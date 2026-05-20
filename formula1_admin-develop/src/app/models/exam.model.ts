import { Candidate } from './candidate.model'; 

export interface Exam {
  id: number;
  exam_date: string;
  exam_type: string;
  status: string;
  candidate_id?: number | Candidate;
  created_at: string;
}