export enum Role {
  ADMIN_TWIN = "ADMIN_TWIN",
  STANDARD = "STANDARD",
}

export interface User {
  id: string;
  nom: string;
  prenom: string;
  roleUser: Role;
  username: string;
  img: string | null;
  
}