# 📘 Guide de Création de Hooks Personnalisés

Ce guide explique comment créer de nouveaux hooks en suivant les patterns établis dans le projet.

## 📁 Fichiers Templates Disponibles

- **`src/hooks/TEMPLATE_HOOK.ts`** : Template pour créer un nouveau hook
- **`src/types/TEMPLATE_TYPE.types.ts`** : Template pour créer les types associés

## 🚀 Guide Étape par Étape

### Étape 1 : Créer le Type

1. Copier `src/types/TEMPLATE_TYPE.types.ts`
2. Renommer en `[NomDuType].types.ts` (ex: `TarifSage.types.ts` ou `client.types.ts`)
3. Définir les structure des réponse de votre API
4. Exporter les type

**Exemple :**
```typescript
// src/types/TarifSage.types.ts
export type TarifResponse = {
  prix: number | null;
  devise: string | null;
  mesure: string | null;
  errors: any;
};
```

### Étape 2 : Choisir une Approche

#### Approche A : Mutation avec React Query (useCrud)

**Utilisez cette approche quand :**
- ✅ Vous envoyez des données (POST/PUT/DELETE)
- ✅ Vous voulez bénéficier du cache de React Query
- ✅ Vous voulez gérer des états de chargement/erreur automatiquement
- ✅ L'action est déclenchée par l'utilisateur (click, submit)

**Exemple : `useTarifSage`**

#### Approche B : Fetch Direct avec useEffect

**Utilisez cette approche quand :**
- ✅ Vous récupérez des données (GET)
- ✅ Vous voulez charger les données automatiquement
- ✅ Les données doivent se recharger quand un paramètre change
- ✅ Vous utilisez GraphQL

**Exemple : `useClients`**

### Étape 3 : Créer le Hook

1. Copier `src/hooks/TEMPLATE_HOOK.ts`
2. Renommer en `use[NomDuHook].ts` (ex: `useTarifSage.ts`)
3. Choisir et conserver uniquement l'approche A ou B
4. Remplacer tous les `TODO` par votre code
5. Importer votre type depuis `src/types/`

### Étape 4 : Tester le Hook

Créer un composant de test pour vérifier que tout fonctionne.

## 📋 Checklist de Création

- [ ] Type créé dans `src/types/` et exporté
- [ ] Hook créé dans `src/hooks/`
- [ ] Approche correcte choisie (A ou B)
- [ ] Tous les `TODO` remplacés
- [ ] Type importé dans le hook
- [ ] Endpoint API correct
- [ ] Paramètres adaptés à vos besoins
- [ ] Noms de variables significatifs
- [ ] Aucune erreur TypeScript
- [ ] Hook testé dans un composant

## 🎯 Exemples Concrets

### Exemple 1 : Hook de Mutation (POST)

```typescript
// src/types/TarifSage.types.ts
export type TarifResponse = {
  prix: number | null;
  devise: string | null;
  mesure: string | null;
  errors: any;
};

// src/hooks/useTarifSage.ts
import { useState, useCallback } from "react";
import { useCrud } from "./useCrud";
import { TarifResponse } from "../types/TarifSage.types";

const useTarifSage = () => {
  const { useCreateItem } = useCrud<TarifResponse>("api/tarifsage", "tarifsage");
  const mutation = useCreateItem();
  
  const [tarif, setTarif] = useState<TarifResponse | null>(null);
  const [error, setError] = useState<any>(null);
  
  const fetchTarif = useCallback(
    async (codeArticle: string, codeCategorie: string = "") => {
      setError(null);
      try {
        const response = await mutation.mutateAsync({
          codeArticle,
          codeCategorie,
        });
        setTarif(response.data ?? null);
        return response.data;
      } catch (err: any) {
        setError(err);
        setTarif(null);
        throw err;
      }
    },
    [mutation.mutateAsync]
  );
  
  return {
    tarif,
    loading: mutation.isPending,
    error,
    fetchTarif,
  };
};

export default useTarifSage;
```

### Exemple 2 : Hook de Fetch Automatique (GET)

```typescript
// src/types/Client.types.ts
export type Client = {
  id: number;
  nom: string;
  email: string;
  telephone: string | null;
};

// src/hooks/useClients.ts
import { useEffect, useState } from "react";
import { fetchGraphQL } from "../api/graphql/graphqlService";
import { getClientsQuery } from "../api/graphql/queries";
import { Client } from "../types/Client.types";

const useClients = (user_id: number | null = null) => {
  const [clients, setClients] = useState<Client[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchClients = async () => {
      try {
        setLoading(true);
        setError(null);

        const response = await fetchGraphQL<{ data: { clients: Client[] } }>(
          getClientsQuery(user_id)
        );

        if (response.data?.data?.clients) {
          setClients(response.data.data.clients);
        } else {
          setClients([]);
        }
      } catch (err: any) {
        console.error("[useClients] Erreur:", err);
        setError(err.message || "Erreur lors de la récupération des clients.");
        setClients([]);
      } finally {
        setLoading(false);
      }
    };

    fetchClients();
  }, [user_id]);

  return { clients, loading, error };
};

export default useClients;
```

## 🛠️ Bonnes Pratiques

1. **Nommage** : Toujours préfixer vos hooks par `use` (ex: `useTarifSage`)
2. **Types** : Un fichier de type par domaine (ex: `TarifSage.types.ts`)
3. **Gestion d'erreur** : Toujours inclure un try/catch et un état `error`
4. **Console.error** : Logger les erreurs pour faciliter le debug
5. **Valeurs par défaut** : Fournir des valeurs par défaut cohérentes
6. **Documentation** : Ajouter un commentaire JSDoc expliquant le hook

## ❓ FAQ

**Q : Quelle approche choisir ?**  
A : Si vous envoyez des données → Approche A. Si vous récupérez → Approche B.

**Q : Puis-je combiner les deux approches ?**  
A : Oui, mais créez deux hooks séparés pour maintenir la clarté.

**Q : Comment gérer les erreurs de l'API ?**  
A : L'état `error` capture automatiquement les erreurs. Affichez-le dans votre composant.

**Q : React Query est-il obligatoire ?**  
A : Non, mais il apporte cache et optimisations. Pour un simple GET, l'approche B suffit.

## 📚 Ressources

- [Documentation React Query](https://tanstack.com/query/latest)
- [Hooks React](https://react.dev/reference/react/hooks)
- Fichiers de référence : `useTarifSage.ts`, `useClients.ts`, `useCrud.ts`
