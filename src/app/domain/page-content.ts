/**
 * Created by stefania on 7/17/17.
 */
export class PageContent {
    content: PositionContents;
    route: string;
    _id: string;
    name: string;
}

export interface PositionContents {
    top: Content[];
    right: Content[];
    bottom: Content[];
    left: Content[];
}

export interface Content {
    _id: string;
    page: Page | string;
    placement: string;
    order: number;
    content: string;
    isActive: boolean;
}

export interface Page {
    _id: string;
    route: string;
    name: string;
}