export interface Preference {
    id: string;
    logo: string;
    logo2?: string;
    email: string;
    lieu: string;
    promotion?: string;
    promotion2?: string;
    siteweb: string;
    telephone: string;
    telephone2?: string;
}



export interface Privilege{
    id: number;
    designation: string;
    couleur: string;
    point : number;
    image : string;
    privilegerecompenses: PrivilegeRecompense[];

}

export interface PrivilegeRecompense{
    id: number;
    designation: string;
    typerecompense: TypeRecompense;

}

export interface TypeRecompense{
    id: number;
    designation: string;
}