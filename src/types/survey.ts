export interface QuestionOption {
  id?: string;
  label: string;
  value: string;
}

export interface Question {
  id: string;
  order_index: number;
  question_key: string;
  prompt: string;
  answer_type: 'integer' | 'multi_choice' | 'single_choice' | 'text';
  is_required: boolean;
  options?: (string | QuestionOption)[];
}

export interface Survey {
  slug: string;
  title: string;
  version: number;
  questions: Question[];
}

export interface SurveyResponse {
  question_id: string;
  answer: string | string[];
}

export interface SurveySubmission {
  answers: Record<string, string | string[] | number>;
}

export interface SurveyApiResponse {
  success: boolean;
  message?: string;
  data?: Survey;
  error?: string;
}

export interface SurveySubmissionResponse {
  success: boolean;
  message?: string;
  submission_id?: string;
  error?: string;
}
