// 1. Importa las utilidades de `astro:content`
import { z, defineCollection, type Render } from 'astro:content';


const prensaSchema = z.object({
  title: z.string(),
  description: z.string().optional(),
  author: z.string(),
})

// 2. Define tu colección(es)
const prensaCollection = defineCollection({
  type: 'content',
  schema: prensaSchema
});

// 3. Exporta un único objeto `collections` para registrar tu(s) colección(es)
//    Esta clave debe coincidir con el nombre de tu directorio de colección en "src/content"
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