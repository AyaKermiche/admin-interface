import { Admin } from "./admin.model";
import { Candidate } from "./candidate.model";

export interface Payment {
  id: number;
  payment_time: Date;
  amount: number;
  payment_method: string;
  candidate_id: number | Candidate;
  created_by: number | Admin;
  created_at: Date | string;
}