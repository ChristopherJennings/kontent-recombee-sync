import { ContentItem, Elements } from '@kentico/kontent-delivery';
import Author from './author';

type RecombeeItem = {
  url: string,
  images: string[],
  activities: string[],
  authors: string[],
  body: string,
  codename: string,
  excerpt: string,
  language: string,
  last_updated: Date,
  title: string
}

export default class Post extends ContentItem {
  public front_matter__title: Elements.TextElement;
  public excerpt: Elements.TextElement;
  public body: Elements.RichTextElement;
  public authors: Elements.LinkedItemsElement<Author>;
  public activities: Elements.MultipleChoiceElement;
  public slug: Elements.UrlSlugElement;
  public front_matter__feature_image: Elements.AssetsElement;
  public published: Elements.DateTimeElement;


  toRecombeeItem(): RecombeeItem {
    return {
      codename: this.system.codename,
      language: this.system.language,
      last_updated: this.system.lastModified,
      title: this.front_matter__title?.value,
      excerpt: this.excerpt?.value,
      body: cleanHtml(this.body.value),
      activities: this.activities?.value.map(a => a.name),
      authors: this.authors?.value.map(a => a.name.value),
      images: this.front_matter__feature_image?.value.map(i => i.url),
      url: getPostUrl(this.published.value, this.slug.value)
    };
  }
}

function cleanHtml(str: string) {
  return str.replace(/&#([0-9]{1,3});/gi, function (match, numStr) {
    var num = parseInt(numStr, 10); // read num as normal number
    return String.fromCharCode(num);
  });
}

function getPostUrl(published: Date, slug: string) {
  return `/blog/${published.getFullYear()}/${published.getMonth() + 1}/${published.getDate()}/${slug.trim()}`
}