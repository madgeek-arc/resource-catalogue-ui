import {UiVocabulary} from './dynamic-form-model';

export class Snippet {
  image: URL;
  longImage: URL;
  paymentTitle: string;
  name: string;
  description: string;
  tagline: string;
  logo: URL;
  portfolios: UiVocabulary[];
  id: string;
  pitch: string;
  label: string;
  user: UiVocabulary[];
}
