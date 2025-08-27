export interface Student {
  RegiNo: string;
  Name: string;
  Anatomy_CE: number | null;
  Anatomy_TE: number | null;
  Anatomy_Total: number | string;
  Acupuncture_CE: number | null;
  Acupuncture_TE: number | null;
  Acupuncture_Total: number | string;
  Practical_PR: number | null;
  Practical_Project: number | null;
  Practical_Viva: number | null;
  Practical_Total: number | string;
  Total: number;
  Result: string;
}

export const studentsData: Student[] = [
  {
    "RegiNo": "PDA2024065",
    "Name": "FATHIMA RAFEEDAH P",
    "Anatomy_CE": 20,
    "Anatomy_TE": null,
    "Anatomy_Total": 20,
    "Acupuncture_CE": 20,
    "Acupuncture_TE": null,
    "Acupuncture_Total": "AB",
    "Practical_PR": 20,
    "Practical_Project": 29,
    "Practical_Viva": 28,
    "Practical_Total": "AB",
    "Total": 97,
    "Result": "AB"
  },
  {
    "RegiNo": "PDA2024066",
    "Name": "NISHAR V",
    "Anatomy_CE": 19,
    "Anatomy_TE": 68,
    "Anatomy_Total": 87,
    "Acupuncture_CE": 20,
    "Acupuncture_TE": 71,
    "Acupuncture_Total": 91,
    "Practical_PR": 28,
    "Practical_Project": 24,
    "Practical_Viva": 29,
    "Practical_Total": 81,
    "Total": 259,
    "Result": "PASS"
  },
  {
    "RegiNo": "PDA2024067",
    "Name": "SALHA BEEGUM K",
    "Anatomy_CE": 19,
    "Anatomy_TE": 67,
    "Anatomy_Total": 86,
    "Acupuncture_CE": 19,
    "Acupuncture_TE": 65,
    "Acupuncture_Total": 84,
    "Practical_PR": 25,
    "Practical_Project": 28,
    "Practical_Viva": 29,
    "Practical_Total": 82,
    "Total": 252,
    "Result": "PASS"
  },
  {
    "RegiNo": "PDA2024068",
    "Name": "RUBEENA CHEERANGAN",
    "Anatomy_CE": 18,
    "Anatomy_TE": 74,
    "Anatomy_Total": 92,
    "Acupuncture_CE": 18,
    "Acupuncture_TE": 67,
    "Acupuncture_Total": 85,
    "Practical_PR": 29,
    "Practical_Project": 27,
    "Practical_Viva": 34,
    "Practical_Total": 90,
    "Total": 267,
    "Result": "PASS"
  }
];