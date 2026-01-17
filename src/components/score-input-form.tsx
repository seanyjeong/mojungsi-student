"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { ScoreForm, KOREAN_SUBJECTS, MATH_SUBJECTS, GRADES } from "@/types";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

const scoreSchema = z.object({
  korean: z.object({
    subject: z.string().min(1, "선택과목을 선택해주세요"),
    std: z.coerce.number().min(0).max(200),
    pct: z.coerce.number().min(0).max(100),
    grade: z.coerce.number().int().min(1).max(9),
  }),
  math: z.object({
    subject: z.string().min(1, "선택과목을 선택해주세요"),
    std: z.coerce.number().min(0).max(200),
    pct: z.coerce.number().min(0).max(100),
    grade: z.coerce.number().int().min(1).max(9),
  }),
  english: z.object({
    grade: z.coerce.number().int().min(1).max(9),
  }),
  history: z.object({
    grade: z.coerce.number().int().min(1).max(9),
  }),
  inquiry1: z.object({
    subject: z.string().min(1, "과목명을 입력해주세요"),
    std: z.coerce.number().min(0).max(100),
    pct: z.coerce.number().min(0).max(100),
    grade: z.coerce.number().int().min(1).max(9),
  }),
  inquiry2: z.object({
    subject: z.string().min(1, "과목명을 입력해주세요"),
    std: z.coerce.number().min(0).max(100),
    pct: z.coerce.number().min(0).max(100),
    grade: z.coerce.number().int().min(1).max(9),
  }),
});

interface ScoreInputFormProps {
  onSubmit: (scores: ScoreForm) => void;
  isLoading?: boolean;
  initialValues?: ScoreForm;
}

const defaultValues: ScoreForm = {
  korean: { subject: "", std: 0, pct: 0, grade: 1 },
  math: { subject: "", std: 0, pct: 0, grade: 1 },
  english: { grade: 1 },
  history: { grade: 1 },
  inquiry1: { subject: "", std: 0, pct: 0, grade: 1 },
  inquiry2: { subject: "", std: 0, pct: 0, grade: 1 },
};

export function ScoreInputForm({
  onSubmit,
  isLoading = false,
  initialValues = defaultValues,
}: ScoreInputFormProps) {
  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = useForm<ScoreForm>({
    resolver: zodResolver(scoreSchema),
    defaultValues: initialValues,
  });

  const koreanSubject = watch("korean.subject");
  const mathSubject = watch("math.subject");

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      {/* 국어 */}
      <Card>
        <CardHeader>
          <CardTitle>국어</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label htmlFor="korean-subject">선택과목</Label>
            <Select
              value={koreanSubject}
              onValueChange={(value) => setValue("korean.subject", value)}
            >
              <SelectTrigger id="korean-subject">
                <SelectValue placeholder="선택과목" />
              </SelectTrigger>
              <SelectContent>
                {KOREAN_SUBJECTS.map((subject) => (
                  <SelectItem key={subject.value} value={subject.value}>
                    {subject.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {errors.korean?.subject && (
              <p className="text-sm text-red-500 mt-1">
                {errors.korean.subject.message}
              </p>
            )}
          </div>
          <div className="grid grid-cols-3 gap-4">
            <div>
              <Label htmlFor="korean-std">표준점수</Label>
              <Input
                id="korean-std"
                type="number"
                {...register("korean.std")}
                placeholder="0"
              />
            </div>
            <div>
              <Label htmlFor="korean-pct">백분위</Label>
              <Input
                id="korean-pct"
                type="number"
                {...register("korean.pct")}
                placeholder="0"
              />
            </div>
            <div>
              <Label htmlFor="korean-grade">등급</Label>
              <Input
                id="korean-grade"
                type="number"
                {...register("korean.grade")}
                placeholder="1"
                min="1"
                max="9"
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* 수학 */}
      <Card>
        <CardHeader>
          <CardTitle>수학</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label htmlFor="math-subject">선택과목</Label>
            <Select
              value={mathSubject}
              onValueChange={(value) => setValue("math.subject", value)}
            >
              <SelectTrigger id="math-subject">
                <SelectValue placeholder="선택과목" />
              </SelectTrigger>
              <SelectContent>
                {MATH_SUBJECTS.map((subject) => (
                  <SelectItem key={subject.value} value={subject.value}>
                    {subject.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {errors.math?.subject && (
              <p className="text-sm text-red-500 mt-1">
                {errors.math.subject.message}
              </p>
            )}
          </div>
          <div className="grid grid-cols-3 gap-4">
            <div>
              <Label htmlFor="math-std">표준점수</Label>
              <Input
                id="math-std"
                type="number"
                {...register("math.std")}
                placeholder="0"
              />
            </div>
            <div>
              <Label htmlFor="math-pct">백분위</Label>
              <Input
                id="math-pct"
                type="number"
                {...register("math.pct")}
                placeholder="0"
              />
            </div>
            <div>
              <Label htmlFor="math-grade">등급</Label>
              <Input
                id="math-grade"
                type="number"
                {...register("math.grade")}
                placeholder="1"
                min="1"
                max="9"
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* 영어 */}
      <Card>
        <CardHeader>
          <CardTitle>영어</CardTitle>
        </CardHeader>
        <CardContent>
          <div>
            <Label htmlFor="english-grade">등급</Label>
            <Input
              id="english-grade"
              type="number"
              {...register("english.grade")}
              placeholder="1"
              min="1"
              max="9"
            />
          </div>
        </CardContent>
      </Card>

      {/* 한국사 */}
      <Card>
        <CardHeader>
          <CardTitle>한국사</CardTitle>
        </CardHeader>
        <CardContent>
          <div>
            <Label htmlFor="history-grade">등급</Label>
            <Input
              id="history-grade"
              type="number"
              {...register("history.grade")}
              placeholder="1"
              min="1"
              max="9"
            />
          </div>
        </CardContent>
      </Card>

      {/* 탐구1 */}
      <Card>
        <CardHeader>
          <CardTitle>탐구 1</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label htmlFor="inquiry1-subject">과목명</Label>
            <Input
              id="inquiry1-subject"
              {...register("inquiry1.subject")}
              placeholder="예: 생명과학1"
            />
            {errors.inquiry1?.subject && (
              <p className="text-sm text-red-500 mt-1">
                {errors.inquiry1.subject.message}
              </p>
            )}
          </div>
          <div className="grid grid-cols-3 gap-4">
            <div>
              <Label htmlFor="inquiry1-std">표준점수</Label>
              <Input
                id="inquiry1-std"
                type="number"
                {...register("inquiry1.std")}
                placeholder="0"
              />
            </div>
            <div>
              <Label htmlFor="inquiry1-pct">백분위</Label>
              <Input
                id="inquiry1-pct"
                type="number"
                {...register("inquiry1.pct")}
                placeholder="0"
              />
            </div>
            <div>
              <Label htmlFor="inquiry1-grade">등급</Label>
              <Input
                id="inquiry1-grade"
                type="number"
                {...register("inquiry1.grade")}
                placeholder="1"
                min="1"
                max="9"
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* 탐구2 */}
      <Card>
        <CardHeader>
          <CardTitle>탐구 2</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label htmlFor="inquiry2-subject">과목명</Label>
            <Input
              id="inquiry2-subject"
              {...register("inquiry2.subject")}
              placeholder="예: 화학1"
            />
            {errors.inquiry2?.subject && (
              <p className="text-sm text-red-500 mt-1">
                {errors.inquiry2.subject.message}
              </p>
            )}
          </div>
          <div className="grid grid-cols-3 gap-4">
            <div>
              <Label htmlFor="inquiry2-std">표준점수</Label>
              <Input
                id="inquiry2-std"
                type="number"
                {...register("inquiry2.std")}
                placeholder="0"
              />
            </div>
            <div>
              <Label htmlFor="inquiry2-pct">백분위</Label>
              <Input
                id="inquiry2-pct"
                type="number"
                {...register("inquiry2.pct")}
                placeholder="0"
              />
            </div>
            <div>
              <Label htmlFor="inquiry2-grade">등급</Label>
              <Input
                id="inquiry2-grade"
                type="number"
                {...register("inquiry2.grade")}
                placeholder="1"
                min="1"
                max="9"
              />
            </div>
          </div>
        </CardContent>
      </Card>

      <Button type="submit" className="w-full" size="lg" disabled={isLoading}>
        {isLoading ? "계산 중..." : "환산점수 계산하기"}
      </Button>
    </form>
  );
}
