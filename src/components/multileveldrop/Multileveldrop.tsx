import { useEffect } from "react";
import { Categorie } from "../../types/categorie.types";

// Fonction récursive pour afficher le menu avec sous-menus
const Menu = ({ menuItems }: { menuItems: Categorie[] }) => {
    return (
        <>
            {menuItems.map((item, index) => (
                <NavItemWithSubmenu item={item} key={index} />
            ))}
        </>
    );
};


// Composant pour gérer chaque item avec sous-menu
const NavItemWithSubmenu = ({ item }: { item: Categorie }) => {

    // Assurez-vous que `souscategories` est toujours défini
    useEffect(() => {
        console.log(item);
    })
    return (
      <></>
    );
};

export default Menu;