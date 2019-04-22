import {Question} from "./faq-question";
/**
 * Created by stefania on 7/12/17.
 */
import {Topic} from "./faq-topic";

export class ActiveTopicQuestions extends Topic {
    questions: Question[];
}