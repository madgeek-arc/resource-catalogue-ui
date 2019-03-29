/**
 * Created by stefania on 7/12/17.
 */
import {Topic} from "./faq-topic";

export class Question {
    id: string;
    question: string;
    answer: string;
    date: Date;
    weight: number;
    hitCount: number;
    isActive: boolean;
    topics: Topic[];
}