import { defineCollection, reference, z } from "astro:content";

export const pokemon = defineCollection({
  loader: async () => {
    const response = await fetch(
      "https://pokeapi.co/api/v2/pokemon?limit=100000&offset=0"
    );

    const { results: pokemonRes } = await response.json();

    return pokemonRes.map((p: { name: string; url: string }) => ({
      id: p.name,
      name: p.name,
      url: p.url,
    }));
  },
  schema: z.object({
    id: z.string(),
    name: z.string(),
    url: z.string(),
  }),
});

export const types = defineCollection({
  loader: async () => {
    const response = await fetch("https://pokeapi.co/api/v2/type");
    const { results } = await response.json();

    const typesForFetch = results.slice(0, 2);
    const types = await Promise.all(
      typesForFetch.map(({ url }: { url: string }) => fetch(url))
    );
    const typesResponse = await Promise.all(types.map((t) => t.json()));

    return typesResponse.map((type) => {
      const pokemonList = type.pokemon.map(
        (p: { pokemon: { name: string; url: string }; slot: number }) => ({
          collection: "pokemon",
          id: p.pokemon.name,
        })
      );

      return {
        id: type.name,
        name: type.name,
        pokemon: pokemonList,
      };
    });
  },
  schema: z.object({
    id: z.string(),
    name: z.string(),
    pokemon: z.array(reference("pokemon")),
  }),
});

export const collections = {
  pokemon,
  types,
};
