import { z } from "zod";

export const surveyResponseSchema = z.object({
  question_id: z.string().min(1, "Question ID is required"),
  answer: z.union([
    z.string().min(1, "Answer is required"),
    z.array(z.string()).min(1, "At least one answer is required"),
    z.number().min(0, "Please enter a valid number")
  ])
});

export const surveySubmissionSchema = z.object({
  answers: z.record(z.string(), z.union([
    z.string().min(0), // Allow empty strings
    z.array(z.string()),
    z.number()
  ]))
});

// Dynamic schema that will be created based on the actual questions
export const createDynamicFormSchema = (questions: any[]) => {
  const schemaFields: Record<string, any> = {};
  
  questions.forEach((question, index) => {
    const fieldName = `question_${index}`;
    
    switch (question.answer_type) {
      case 'integer':
        schemaFields[fieldName] = question.is_required 
          ? z.number().min(0, "Please enter a valid positive number")
          : z.number().min(0, "Please enter a valid positive number").optional();
        break;
        
      case 'multi_choice':
        schemaFields[fieldName] = question.is_required 
          ? z.string().min(1, "Please select at least one option")
          : z.string().optional();
        break;
        
      case 'single_choice':
      case 'text':
      default:
        schemaFields[fieldName] = question.is_required 
          ? z.string().min(1, "This field is required")
          : z.string().optional();
        break;
    }
  });
  
  return z.object(schemaFields);
};

export type DynamicFormData = Record<string, string | number | string[]>;