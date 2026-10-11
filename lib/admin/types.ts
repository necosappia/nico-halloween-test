export type Lead = {
  id: string; name: string; email: string; phone: string; instagram: string | null;
  skate_type: string | null; answers: unknown[]; level: string; score: number;
  gift: string; marketing: boolean; consent: boolean; test_version: string;
  created_at: string; career_interest: string | null; zone: string | null;
  mentorship_opt_in: boolean | null;
};
export type LeadPage = { leads: Lead[]; total: number; nextOffset: number | null };
