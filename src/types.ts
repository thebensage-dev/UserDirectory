export type User = {
  id: number;
  fullName: string;
  email: string;
  phone: string | null;
  age: number;
  country: string;
  city: string | null;
  jobTitle: string | null;
  bio: string | null;
  interests: string[];
  createdAt: string;
  updatedAt: string;
};

export type UserPage = {
  items: User[];
  total: number;
  page: number;
  pageCount: number;
  from: number;
  to: number;
  terms: string[];
};

export type DirectorySummary = {
  people: number;
  averageAge: number;
  countries: [string, number][];
  interests: [string, number][];
};

export type ActionResult<T> =
  | { ok: true; data: T }
  | {
      ok: false;
      error: string;
      fieldErrors?: Record<string, string[] | undefined>;
      /** Set when the change was refused only because nobody is signed in. */
      signInRequired?: true;
    };
