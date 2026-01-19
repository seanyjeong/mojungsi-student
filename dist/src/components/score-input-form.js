"use client";
"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.ScoreInputForm = ScoreInputForm;
const react_hook_form_1 = require("react-hook-form");
const zod_1 = require("@hookform/resolvers/zod");
const z = __importStar(require("zod"));
const types_1 = require("@/types");
const button_1 = require("@/components/ui/button");
const input_1 = require("@/components/ui/input");
const label_1 = require("@/components/ui/label");
const select_1 = require("@/components/ui/select");
const card_1 = require("@/components/ui/card");
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
const defaultValues = {
    korean: { subject: "", std: 0, pct: 0, grade: 1 },
    math: { subject: "", std: 0, pct: 0, grade: 1 },
    english: { grade: 1 },
    history: { grade: 1 },
    inquiry1: { subject: "", std: 0, pct: 0, grade: 1 },
    inquiry2: { subject: "", std: 0, pct: 0, grade: 1 },
};
function ScoreInputForm({ onSubmit, isLoading = false, initialValues = defaultValues, }) {
    const { register, handleSubmit, setValue, watch, formState: { errors }, } = (0, react_hook_form_1.useForm)({
        resolver: (0, zod_1.zodResolver)(scoreSchema),
        defaultValues: initialValues,
    });
    const koreanSubject = watch("korean.subject");
    const mathSubject = watch("math.subject");
    return (<form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      
      <card_1.Card>
        <card_1.CardHeader>
          <card_1.CardTitle>국어</card_1.CardTitle>
        </card_1.CardHeader>
        <card_1.CardContent className="space-y-4">
          <div>
            <label_1.Label htmlFor="korean-subject">선택과목</label_1.Label>
            <select_1.Select value={koreanSubject} onValueChange={(value) => setValue("korean.subject", value)}>
              <select_1.SelectTrigger id="korean-subject">
                <select_1.SelectValue placeholder="선택과목"/>
              </select_1.SelectTrigger>
              <select_1.SelectContent>
                {types_1.KOREAN_SUBJECTS.map((subject) => (<select_1.SelectItem key={subject.value} value={subject.value}>
                    {subject.label}
                  </select_1.SelectItem>))}
              </select_1.SelectContent>
            </select_1.Select>
            {errors.korean?.subject && (<p className="text-sm text-red-500 mt-1">
                {errors.korean.subject.message}
              </p>)}
          </div>
          <div className="grid grid-cols-3 gap-4">
            <div>
              <label_1.Label htmlFor="korean-std">표준점수</label_1.Label>
              <input_1.Input id="korean-std" type="number" {...register("korean.std")} placeholder="0"/>
            </div>
            <div>
              <label_1.Label htmlFor="korean-pct">백분위</label_1.Label>
              <input_1.Input id="korean-pct" type="number" {...register("korean.pct")} placeholder="0"/>
            </div>
            <div>
              <label_1.Label htmlFor="korean-grade">등급</label_1.Label>
              <input_1.Input id="korean-grade" type="number" {...register("korean.grade")} placeholder="1" min="1" max="9"/>
            </div>
          </div>
        </card_1.CardContent>
      </card_1.Card>

      
      <card_1.Card>
        <card_1.CardHeader>
          <card_1.CardTitle>수학</card_1.CardTitle>
        </card_1.CardHeader>
        <card_1.CardContent className="space-y-4">
          <div>
            <label_1.Label htmlFor="math-subject">선택과목</label_1.Label>
            <select_1.Select value={mathSubject} onValueChange={(value) => setValue("math.subject", value)}>
              <select_1.SelectTrigger id="math-subject">
                <select_1.SelectValue placeholder="선택과목"/>
              </select_1.SelectTrigger>
              <select_1.SelectContent>
                {types_1.MATH_SUBJECTS.map((subject) => (<select_1.SelectItem key={subject.value} value={subject.value}>
                    {subject.label}
                  </select_1.SelectItem>))}
              </select_1.SelectContent>
            </select_1.Select>
            {errors.math?.subject && (<p className="text-sm text-red-500 mt-1">
                {errors.math.subject.message}
              </p>)}
          </div>
          <div className="grid grid-cols-3 gap-4">
            <div>
              <label_1.Label htmlFor="math-std">표준점수</label_1.Label>
              <input_1.Input id="math-std" type="number" {...register("math.std")} placeholder="0"/>
            </div>
            <div>
              <label_1.Label htmlFor="math-pct">백분위</label_1.Label>
              <input_1.Input id="math-pct" type="number" {...register("math.pct")} placeholder="0"/>
            </div>
            <div>
              <label_1.Label htmlFor="math-grade">등급</label_1.Label>
              <input_1.Input id="math-grade" type="number" {...register("math.grade")} placeholder="1" min="1" max="9"/>
            </div>
          </div>
        </card_1.CardContent>
      </card_1.Card>

      
      <card_1.Card>
        <card_1.CardHeader>
          <card_1.CardTitle>영어</card_1.CardTitle>
        </card_1.CardHeader>
        <card_1.CardContent>
          <div>
            <label_1.Label htmlFor="english-grade">등급</label_1.Label>
            <input_1.Input id="english-grade" type="number" {...register("english.grade")} placeholder="1" min="1" max="9"/>
          </div>
        </card_1.CardContent>
      </card_1.Card>

      
      <card_1.Card>
        <card_1.CardHeader>
          <card_1.CardTitle>한국사</card_1.CardTitle>
        </card_1.CardHeader>
        <card_1.CardContent>
          <div>
            <label_1.Label htmlFor="history-grade">등급</label_1.Label>
            <input_1.Input id="history-grade" type="number" {...register("history.grade")} placeholder="1" min="1" max="9"/>
          </div>
        </card_1.CardContent>
      </card_1.Card>

      
      <card_1.Card>
        <card_1.CardHeader>
          <card_1.CardTitle>탐구 1</card_1.CardTitle>
        </card_1.CardHeader>
        <card_1.CardContent className="space-y-4">
          <div>
            <label_1.Label htmlFor="inquiry1-subject">과목명</label_1.Label>
            <input_1.Input id="inquiry1-subject" {...register("inquiry1.subject")} placeholder="예: 생명과학1"/>
            {errors.inquiry1?.subject && (<p className="text-sm text-red-500 mt-1">
                {errors.inquiry1.subject.message}
              </p>)}
          </div>
          <div className="grid grid-cols-3 gap-4">
            <div>
              <label_1.Label htmlFor="inquiry1-std">표준점수</label_1.Label>
              <input_1.Input id="inquiry1-std" type="number" {...register("inquiry1.std")} placeholder="0"/>
            </div>
            <div>
              <label_1.Label htmlFor="inquiry1-pct">백분위</label_1.Label>
              <input_1.Input id="inquiry1-pct" type="number" {...register("inquiry1.pct")} placeholder="0"/>
            </div>
            <div>
              <label_1.Label htmlFor="inquiry1-grade">등급</label_1.Label>
              <input_1.Input id="inquiry1-grade" type="number" {...register("inquiry1.grade")} placeholder="1" min="1" max="9"/>
            </div>
          </div>
        </card_1.CardContent>
      </card_1.Card>

      
      <card_1.Card>
        <card_1.CardHeader>
          <card_1.CardTitle>탐구 2</card_1.CardTitle>
        </card_1.CardHeader>
        <card_1.CardContent className="space-y-4">
          <div>
            <label_1.Label htmlFor="inquiry2-subject">과목명</label_1.Label>
            <input_1.Input id="inquiry2-subject" {...register("inquiry2.subject")} placeholder="예: 화학1"/>
            {errors.inquiry2?.subject && (<p className="text-sm text-red-500 mt-1">
                {errors.inquiry2.subject.message}
              </p>)}
          </div>
          <div className="grid grid-cols-3 gap-4">
            <div>
              <label_1.Label htmlFor="inquiry2-std">표준점수</label_1.Label>
              <input_1.Input id="inquiry2-std" type="number" {...register("inquiry2.std")} placeholder="0"/>
            </div>
            <div>
              <label_1.Label htmlFor="inquiry2-pct">백분위</label_1.Label>
              <input_1.Input id="inquiry2-pct" type="number" {...register("inquiry2.pct")} placeholder="0"/>
            </div>
            <div>
              <label_1.Label htmlFor="inquiry2-grade">등급</label_1.Label>
              <input_1.Input id="inquiry2-grade" type="number" {...register("inquiry2.grade")} placeholder="1" min="1" max="9"/>
            </div>
          </div>
        </card_1.CardContent>
      </card_1.Card>

      <button_1.Button type="submit" className="w-full" size="lg" disabled={isLoading}>
        {isLoading ? "계산 중..." : "환산점수 계산하기"}
      </button_1.Button>
    </form>);
}
//# sourceMappingURL=score-input-form.js.map