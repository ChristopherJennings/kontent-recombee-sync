import { DeliveryClient, TypeResolver } from '@kentico/kontent-delivery';

import Post from "./post";
import Author from "./author";

export default function (projectId: string) {
  return new DeliveryClient({
    projectId: projectId, typeResolvers: [
      new TypeResolver('post', () => new Post()),
      new TypeResolver('author', () => new Author())
    ]
  });
}