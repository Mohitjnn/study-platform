"use client";

import { useState, useMemo } from "react";
import { useForm } from "react-hook-form";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { ChevronLeft, ChevronRight, Check } from "lucide-react";
import {
  createDynamicFormSchema,
  DynamicFormData,
} from "@/schema/surveySchema";
import { Survey, Question, SurveyResponse } from "@/types/survey";
import { submitSurvey } from "@/actions/survey";
import { toast } from "sonner";

interface MultiStepSurveyProps {
  survey: Survey;
}

// Type for form data that can handle various question types
type SurveyFormData = Record<string, string | number | string[]>;

export default function MultiStepSurvey({ survey }: MultiStepSurveyProps) {
  const [currentStep, setCurrentStep] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [multiChoiceSelections, setMultiChoiceSelections] = useState<
    Record<string, string[]>
  >({});
  const router = useRouter();

  // Calculate total steps based on actual number of questions (2 questions per step)
  const totalSteps = Math.ceil(survey.questions.length / 2);

  // Create dynamic schema based on actual questions
  const formSchema = useMemo(
    () => createDynamicFormSchema(survey.questions),
    [survey.questions]
  );

  const {
    register,
    handleSubmit,
    formState: { errors },
    trigger,
    getValues,
    setValue,
    setError,
    clearErrors,
    watch,
  } = useForm<SurveyFormData>({
    mode: "onChange",
  });

  // Group questions into steps (2 questions per step)
  const groupedQuestions = survey.questions.reduce((acc, question, index) => {
    const stepIndex = Math.floor(index / 2) + 1;
    if (!acc[stepIndex]) acc[stepIndex] = [];
    acc[stepIndex].push({ question, index });
    return acc;
  }, {} as Record<number, Array<{ question: Question; index: number }>>);

  const getCurrentStepQuestions = () => {
    return groupedQuestions[currentStep] || [];
  };

  const getFieldName = (questionIndex: number) => {
    return `question_${questionIndex}`;
  };

  const handleMultiChoiceChange = (
    fieldName: string,
    option: string,
    checked: boolean
  ) => {
    const currentSelections = multiChoiceSelections[fieldName] || [];
    let newSelections: string[];

    if (checked) {
      newSelections = [...currentSelections, option];
    } else {
      newSelections = currentSelections.filter((item) => item !== option);
    }

    setMultiChoiceSelections((prev) => ({
      ...prev,
      [fieldName]: newSelections,
    }));

    // Update form value
    setValue(fieldName, newSelections.join(","));
  };

  const nextStep = async () => {
    const currentStepQuestions = getCurrentStepQuestions();
    let hasErrors = false;

    // Manual validation for current step
    currentStepQuestions.forEach(({ question, index }) => {
      const fieldName = getFieldName(index);
      const value = getValues(fieldName);

      if (question.is_required) {
        if (question.answer_type === "multi_choice") {
          const selections = multiChoiceSelections[fieldName] || [];
          if (selections.length === 0) {
            setError(fieldName, {
              type: "required",
              message: "Please select at least one option",
            });
            hasErrors = true;
          } else {
            clearErrors(fieldName);
          }
        } else if (question.answer_type === "integer") {
          const numValue = typeof value === "string" ? parseInt(value) : value;
          if (
            !value ||
            (typeof value === "string" && isNaN(parseInt(value))) ||
            (typeof numValue === "number" && numValue <= 0)
          ) {
            setError(fieldName, {
              type: "required",
              message: "Please enter a valid number",
            });
            hasErrors = true;
          } else {
            clearErrors(fieldName);
          }
        } else {
          const stringValue =
            typeof value === "string" ? value : String(value || "");
          if (!value || stringValue.trim() === "") {
            setError(fieldName, {
              type: "required",
              message: "This field is required",
            });
            hasErrors = true;
          } else {
            clearErrors(fieldName);
          }
        }
      }
    });

    if (!hasErrors && currentStep < totalSteps) {
      setCurrentStep(currentStep + 1);
    }
  };

  const prevStep = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const onSubmit = async (data: SurveyFormData) => {
    setIsSubmitting(true);

    try {
      // Convert form data to survey answers object
      const answers: Record<string, string | string[] | number> = {};

      survey.questions.forEach((question, index) => {
        const fieldName = getFieldName(index);
        let answer: string | string[] | number;

        if (question.answer_type === "multi_choice") {
          answer = multiChoiceSelections[fieldName] || [];
        } else if (question.answer_type === "integer") {
          const fieldValue = data[fieldName];
          const numValue =
            typeof fieldValue === "string"
              ? parseInt(fieldValue)
              : typeof fieldValue === "number"
              ? fieldValue
              : 0;
          answer = isNaN(numValue) ? 0 : numValue;
        } else if (question.answer_type === "text_multi") {
          // Split by comma and trim spaces
          const textValue = data[fieldName];
          answer =
            typeof textValue === "string"
              ? textValue
                  .split(",")
                  .map((s) => s.trim())
                  .filter(Boolean)
              : [];
        } else {
          // For text fields, ensure we always have a string value
          const textValue = data[fieldName];
          if (
            textValue === null ||
            textValue === undefined ||
            textValue === ""
          ) {
            answer = "";
          } else {
            answer = String(textValue);
          }
        }

        // Always include the field in answers, even if empty
        answers[question.question_key] = answer;
      });

      const submission = {
        answers,
      };

      const result = await submitSurvey(submission);
      if (result.success) {
        toast.success("Survey submitted successfully!");
        router.push("/dashboard");
      } else {
        toast.error(result.error || "Failed to submit survey");
      }
    } catch (error) {
      console.error("Survey submission error:", error);
      toast.error("An unexpected error occurred");
    } finally {
      setIsSubmitting(false);
    }
  };

  const renderProgressBar = () => (
    <div className="mb-8">
      <div className="flex justify-between items-center mb-2">
        <span className="text-sm font-medium text-white/60">
          Step {currentStep} of {totalSteps}
        </span>
        <span className="text-sm text-white/60">
          {Math.round((currentStep / totalSteps) * 100)}% Complete
        </span>
      </div>
      <div className="w-full bg-white/30 rounded-full h-2">
        <div
          className="bg-white h-2 rounded-full transition-all duration-300"
          style={{ width: `${(currentStep / totalSteps) * 100}%` }}
        />
      </div>
    </div>
  );

  const renderQuestionInput = (question: Question, fieldName: string) => {
    const error = errors[fieldName];

    switch (question.answer_type) {
      case "single_choice":
        return (
          <div className="space-y-3">
            <RadioGroup
              value={String(watch(fieldName) || "")}
              onValueChange={(value) => setValue(fieldName, value)}
              className="lg:flex lg:space-x-4 lg:space-y-0 space-y-2"
            >
              {question.options?.map((option, optionIndex: number) => {
                const value =
                  typeof option === "string" ? option : option.value;
                const label =
                  typeof option === "string" ? option : option.label;
                return (
                  <div
                    key={optionIndex}
                    className="flex items-center space-x-2"
                  >
                    <RadioGroupItem
                      value={value}
                      id={`${fieldName}-${optionIndex}`}
                    />
                    <Label
                      htmlFor={`${fieldName}-${optionIndex}`}
                      className="text-sm font-normal cursor-pointer"
                    >
                      {label}
                    </Label>
                  </div>
                );
              })}
            </RadioGroup>
          </div>
        );

      case "multi_choice":
        return (
          <div className="lg:flex lg:space-x-4 lg:space-y-0 space-y-3">
            {question.options?.map((option, optionIndex) => {
              const optionValue =
                typeof option === "string"
                  ? option
                  : option.value || option.label;
              const optionLabel =
                typeof option === "string"
                  ? option
                  : option.label || option.value;

              return (
                <div key={optionIndex} className="flex items-center space-x-2">
                  <Checkbox
                    id={`${fieldName}-${optionIndex}`}
                    checked={(multiChoiceSelections[fieldName] || []).includes(
                      optionValue
                    )}
                    onCheckedChange={(checked) =>
                      handleMultiChoiceChange(
                        fieldName,
                        optionValue,
                        checked === true
                      )
                    }
                  />
                  <Label
                    htmlFor={`${fieldName}-${optionIndex}`}
                    className="text-sm font-normal cursor-pointer"
                  >
                    {optionLabel}
                  </Label>
                </div>
              );
            })}
          </div>
        );

      case "integer":
        return (
          <Input
            id={fieldName}
            type="number"
            min="0"
            step="1"
            {...register(fieldName, {
              required: question.is_required ? "This field is required" : false,
              valueAsNumber: true,
              min: { value: 0, message: "Please enter a positive number" },
            })}
            className="bg-transparent border-white/20 placeholder:text-white/50"
            placeholder="Enter a number..."
          />
        );

      case "text":
        return (
          <Input
            id={fieldName}
            type="text"
            {...register(fieldName, {
              required: question.is_required ? "This field is required" : false,
            })}
            className="bg-transparent border-white/20 placeholder:text-white/50"
            placeholder="Enter your answer..."
          />
        );

      case "text_multi":
        return (
          <Input
            id={fieldName}
            type="text"
            {...register(fieldName, {
              required: question.is_required ? "This field is required" : false,
            })}
            className="bg-transparent border-white/20 placeholder:text-white/50"
            placeholder="Enter comma-separated values (e.g. English,Hindi)"
          />
        );

      default:
        return (
          <Input
            id={fieldName}
            type="text"
            {...register(fieldName, {
              required: question.is_required ? "This field is required" : false,
            })}
            className="bg-transparent border-white/20"
            placeholder="Enter your answer..."
          />
        );
    }
  };

  const renderStepContent = () => {
    const currentQuestions = getCurrentStepQuestions();

    return (
      <div className="space-y-8">
        {currentQuestions.map(({ question, index }) => {
          const fieldName = getFieldName(index);
          const error = errors[fieldName];

          return (
            <div key={question.id} className="space-y-4">
              <Label htmlFor={fieldName} className="text-base font-medium">
                {question.question_key}
                {question.is_required && (
                  <span className="text-destructive ml-1">*</span>
                )}
              </Label>
              <p className="text-sm text-muted-foreground">{question.prompt}</p>
              {renderQuestionInput(question, fieldName)}

              {error?.message && (
                <p className="text-destructive text-sm">
                  {String(error.message)}
                </p>
              )}
            </div>
          );
        })}
      </div>
    );
  };

  return (
    <div className="py-8 px-10 dark">
      <div className="max-w-7xl mx-auto relative">
        {/* Background divs */}
        <div className="absolute inset-0 -top-2 -left-4 -right-4 -bottom-4">
          <div className="w-full h-[95%] bg-white/10 rounded-2xl transform rotate-[5deg]"></div>
        </div>

        <Card className="bg-white/10 border border-white/20 backdrop-blur-md text-white z-50">
          <CardHeader>
            <CardTitle className="text-2xl">{survey.title}</CardTitle>
            <CardDescription>
              Please answer all questions to complete the survey.
            </CardDescription>
          </CardHeader>

          <CardContent>
            {renderProgressBar()}

            <form onSubmit={handleSubmit(onSubmit)}>
              {renderStepContent()}

              <div className="flex justify-between items-center mt-8">
                {/* Previous Button - Show on all steps except first */}
                {currentStep > 1 ? (
                  <Button
                    type="button"
                    variant="outline"
                    onClick={prevStep}
                    className="flex items-center gap-2 border border-border bg-background text-foreground hover:bg-muted"
                  >
                    <ChevronLeft className="h-4 w-4" />
                    Previous
                  </Button>
                ) : (
                  <div></div> // Empty div to maintain spacing
                )}

                {/* Next Button - Show on all steps except last */}
                {currentStep < totalSteps && (
                  <Button
                    type="button"
                    onClick={nextStep}
                    className="flex items-center gap-2 bg-primary text-primary-foreground hover:bg-primary/90"
                  >
                    Next
                    <ChevronRight className="h-4 w-4" />
                  </Button>
                )}

                {/* Submit Button - Show only on last step */}
                {currentStep === totalSteps && (
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="flex px-4 py-2 text-sm rounded-lg items-center gap-2 bg-green-600 text-white hover:bg-green-700"
                  >
                    {isSubmitting ? "Submitting..." : "Complete Survey"}
                    <Check className="h-4 w-4" />
                  </button>
                )}
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
