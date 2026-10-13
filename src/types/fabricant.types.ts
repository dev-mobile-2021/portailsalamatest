export type Fabricant = {
  id: number;
  designation: string;
  code: string | null;
  email: string | null;
  adresse: string | null;
  telephone: string | null;
  pay_id: number | null;
  etat: 0 | 1;
  etat_text: string | null;
  etat_badge: string | null;
  created_at?: string;
  updated_at?: string;
  user_id?: number|string;
};

export type FabricantesPaginatedResponse = {
  data: {
    fabricantspaginated: {
      metadata: {
        total: number;
        per_page: number;
        current_page: number;
        last_page: number;
      };
      data: Fabricant[];
    };
  };
};

export type FabricantInput = {
  id?: number;
  designation: string;
  code?: string;
  email?: string;
  adresse?: string;
  telephone?: string;
  pay_id?: number;
  user_id?: number|string;
};