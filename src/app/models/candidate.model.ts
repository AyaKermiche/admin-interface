export interface Candidate {
  id: number;
  nom: string; 
  email :string;
  prenom: string;
  dateNaissance: string;
  dateInscription: string;
  
  tel: string;
  typePermis: string;
  adresse: string;
  phase: string;
 moniteurId :number;
  prix: number; 
  bloodType :string;
  drivingSchoolId :number;
}

export const candidats: Candidate[] = [
 
];


