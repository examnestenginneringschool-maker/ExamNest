export type LegacyNoteBlock = {
  heading?: string;
  body?: string;
  exam_tip?: string;
};

export type NoteUnit = {
  id: string;
  unit_number: number;
  title: string;
  syllabus_text: string | null;
  important_topics: string[] | null;
  notes?: LegacyNoteBlock[];
};

export type Topic = {
  id: string;
  note_unit_id: string;
  topic_number: string;
  title: string;
  summary: string | null;
  is_important: boolean;
  sort_order: number;
  pdf_storage_bucket?: string | null;
  pdf_storage_path?: string | null;
  pdf_page_count?: number | null;
  pdf_size_bytes?: number | null;
  video_storage_path?: string | null;
  is_pdf_downloadable?: boolean;
};
