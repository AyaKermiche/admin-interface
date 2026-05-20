import { DrivingSchool } from "./driving-school.model";

export interface Instructor {
  id: number;
  first_name: string;
  last_name: string;
  email: string;
  phone: string;
  specialty: string;
  hire_date: Date;
  driving_school_id: number | DrivingSchool;
  created_at: Date;
}