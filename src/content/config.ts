import { z, defineCollection, type Render } from 'astro:content';

const prensaSchema = z.object({
  title: z.string(),
  description: z.string().optional(),
  author: z.string().optional(),
  date: z.date(),
  image: z.string(),
})

const prensaCollection = defineCollection({
  type: 'content',
  schema: prensaSchema
});

export const collections = {
  prensa: prensaCollection,
};

export type Prensa = {
  id: string;
  slug: string;
  body: string;
  collection: "prensa";
  data: z.infer<typeof prensaSchema>;
} & { render(): Render[".md"] };