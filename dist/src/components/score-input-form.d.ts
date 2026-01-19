import { ScoreForm } from "@/types";
interface ScoreInputFormProps {
    onSubmit: (scores: ScoreForm) => void;
    isLoading?: boolean;
    initialValues?: ScoreForm;
}
export declare function ScoreInputForm({ onSubmit, isLoading, initialValues, }: ScoreInputFormProps): any;
export {};
