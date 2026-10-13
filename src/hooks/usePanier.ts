import { useEffect } from "react";
import { useCrud } from "../hooks/useCrud";
import { Panier, PanierProduit } from "../types/panier.types";
import { toast } from "react-toastify";
import { useCrudGraph } from "../hooks/useCrudGraph";
import { getPanierQuery } from "../api/graphql/queries";
import { User } from "../types/user.types";
import { usePanierContext } from "../context/PanierContext";

export const usePanier = (user?: User) => {
  const { useCreateItem } = useCrud<Panier>('/api/panier', 'paniers');
  const { mutate: addPanier } = useCreateItem();
  const { useFetchAll } = useCrudGraph<Panier>('paniers');
  const { cartItems, setCartItems, cartItemCount, setCartItemCount } = usePanierContext();

  // Récupérer le panier de l'utilisateur connecté
  const { data: panier } = useFetchAll(getPanierQuery(user?.id ?? 0), { enabled: !!user?.id });

  // Mettre à jour cartItemCount chaque fois que cartItems change
  useEffect(() => {
    const totalQuantity = cartItems.reduce((total, item) => total + item.quantite, 0);
    setCartItemCount(totalQuantity);
  }, [cartItems]);

  // Charger le panier initial
  useEffect(() => {
    if (user?.id) {
      // Charger le panier en ligne
      if (panier?.[0]?.panierproduits) {
        setCartItems(panier[0].panierproduits);
      }

      // Synchroniser le panier local avec le panier en ligne
      const panierLocal = JSON.parse(localStorage.getItem('panier') || '[]');

      if (panierLocal.length > 0) {

        panierLocal.forEach((itemLocal: PanierProduit) => {
          const existingItem = panier?.[0]?.panierproduits?.find(
            (itemOnline: PanierProduit) => itemOnline.produit.id === itemLocal.produit.id
          );

          if (existingItem) {
            // Si l'article existe déjà, mettre à jour la quantité
            const updatedQuantity = itemLocal.quantite; // Utiliser la quantité du panier local
            addPanier({
              produit: itemLocal.produit.id,
              user: user.id,
              quantite: updatedQuantity,
              action: 1, // Action pour mettre à jour la quantité
            }, {
              onSuccess: () => {
                //  const updatedItems
                const updatedItems = cartItems.map(item =>
                  item.produit_id === itemLocal.produit.id ? { ...item, quantite: updatedQuantity } : item
                );
                setCartItems(updatedItems);
              },
              onError: () => {
                toast.error("Erreur lors de la mise à jour de la quantité");
              },
            });

          } else {
            // Si l'article n'existe pas, l'ajouter au panier en ligne
            addPanier({
              produit: itemLocal.produit.id,
              user: user.id,
              quantite: itemLocal.quantite,
              action: 0, // Action pour ajouter un produit
            }, {
              onSuccess: () => {
                // Mettre à jour l'état local du panier
                const updatedItems = [...cartItems, { ...itemLocal }];
                setCartItems(updatedItems);
              },
              onError: () => {
                toast.error("Erreur lors de l'ajout de l'article au panier");
              },
            });
          }
        });

        // Vider le panier local après synchronisation
        localStorage.removeItem('panier');
      }
    } else {
      // Utilisateur non connecté : charger le panier local
      const panierLocal = JSON.parse(localStorage.getItem('panier') || '[]');
      setCartItems(panierLocal);
    }
  }, [user?.id, panier]);

  // Mettre à jour la quantité d'un produit
  const handleQuantityChange = (itemId: number, newQuantity: number) => {
    if (newQuantity > 0) {
      const updatedItems = cartItems.map(item =>
        item.produit_id === itemId ? { ...item, quantite: newQuantity } : item
      );
      setCartItems(updatedItems);

      const updatedItem = updatedItems.find(item => item.produit_id === itemId);
      if (updatedItem) {
        if (user?.id) {
          addPanier({
            produit: updatedItem.produit_id,
            user: user.id,
            quantite: updatedItem.quantite,
            action: 1,
          }, {
            onSuccess: () => {
              toast.success("Updated quantity");
            },
            onError: () => {
              toast.error("Erreur lors de la mise à jour de la quantité");
            },
          });
        } else {
          localStorage.setItem('panier', JSON.stringify(updatedItems));
        }
      }
    }
  };

  // Supprimer un produit du panier
  const handleRemoveProduct = (item: PanierProduit) => {
    const updatedItems = cartItems.filter(cartItem => cartItem.produit_id !== item.produit_id);
    setCartItems(updatedItems);
    if (user?.id) {
      addPanier({
        produit: item.produit_id,
        user: user.id,
        quantite: item.quantite,
        action: 2, // Action pour supprimer le produit
      }, {
        onSuccess: () => {
          toast.success("Produit supprimé du panier");
        },
        onError: () => {
          toast.error("Erreur lors de la suppression du produit du panier");
        },
      });
    } else {
      localStorage.setItem('panier', JSON.stringify(updatedItems));
      toast.success("Produit supprimé du panier");
    }
  };



  // Ajouter un produit au panier
  const handleAddProduct = (produit: PanierProduit) => {
    const existingItem = cartItems.find(item => item.produit_id === produit.produit_id);

    if (existingItem) {
      // Si le produit existe déjà, mettre à jour la quantité
      handleQuantityChange(produit.produit_id, existingItem.quantite + produit.quantite);
    } else {
      // Sinon, ajouter un nouveau produit
      const newItem: PanierProduit = {
        produit_id: produit.produit_id,
        quantite: produit.quantite,
        prix: produit.prix,
        produit: produit.produit, // Données minimales du produit
      };

      if (user?.id) {
        addPanier({
          produit: produit.produit.id,
          user: user.id,
          quantite: produit.quantite,
          action: 0,
        }, {
          onSuccess: () => {
            toast.success("Produit ajouté au panier");
          },
          onError: () => {
            toast.error("Erreur lors de l'ajout du produit au panier");
          },
        });
      } else {
        // Utilisateur non connecté : mettre à jour le panier local et l'état cartItems
        const updatedItems = [...cartItems, newItem];
        setCartItems(updatedItems); // Mettre à jour l'état immédiatement
        localStorage.setItem('panier', JSON.stringify(updatedItems)); // Mettre à jour le localStorage
        toast.success("Produit ajouté au panier local");
      }
    }
  };

  // Calculer le prix total du panier
  const totalPrice = cartItems.reduce((acc, item) => acc + item.prix * item.quantite, 0).toFixed(2) || 0;

  return {
    cartItems,
    setCartItems,
    totalPrice,
    cartItemCount, // Retourner cartItemCount
    handleQuantityChange,
    handleRemoveProduct,
    handleAddProduct,
    setCartItemCount
  };
};