/**
 * Created by stefania on 6/7/17.
 */

import {Component, OnInit} from '@angular/core';
import {ActivatedRoute, Router} from '@angular/router';
import {ActiveTopicQuestions} from '../../../domain/faq-active-topic-questions';
import {FAQService} from '../../../services/faq.service';

@Component({
    selector: 'app-faqs',
    templateUrl: './faqs.component.html',
    styleUrls: ['./faqs.component.css']
})
export class FAQsComponent implements OnInit {

    public activeTopicQuestions: ActiveTopicQuestions[] = [];
    public errorMessage: string;

    constructor(public route: ActivatedRoute,
                public router: Router,
                public faqService: FAQService) {
    }

    ngOnInit() {
        this.faqService.getActiveTopicQuestions().subscribe(
            activeTopicQuestions => this.activeTopicQuestions = activeTopicQuestions,
            err => this.handleError(err)
        );
    }

    // shiftThroughTopics(activeTopicQuestions: ActiveTopicQuestions[]) {
    //     this.activeTopicQuestions = activeTopicQuestions.filter(_ => _.name === "Legal");
    // }

    handleError(error) {
        this.errorMessage = 'System error retrieving FAQs (Server responded: ' + error + ')';
    }
}
