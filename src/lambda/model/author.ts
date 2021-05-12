import { ContentItem, Elements } from '@kentico/kontent-delivery';

export default class Author extends ContentItem {
  public name: Elements.TextElement;
  public byline: Elements.TextElement;
}
