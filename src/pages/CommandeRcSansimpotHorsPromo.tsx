import React, { useState } from 'react';

const CommandeRcSansimpotHorsPromo = () => {
    const [articles, setArticles] = useState([{ designation: '', quantite: 0 }]);

    const handleArticleChange = (
        index: number,
        field: 'designation' | 'quantite',
        value: string | number
    ) => {
        const newArticles = [...articles];
        newArticles[index][field] = value as never; // on force ici car TypeScript se plaint que 'string | number' ne convient pas
        setArticles(newArticles);
    };


    const addArticle = () => {
        setArticles([...articles, { designation: '', quantite: 0 }]);
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        console.log('Formulaire soumis (Hors Promo)', articles);
        // TODO : appel API ou envoi au back-office
    };

    return (
        <form onSubmit={handleSubmit}>
            <h2>Commande RC Sans IMP – Hors Promo</h2>

            {articles.map((article, index) => (
                <div key={index}>
                    <input
                        type="text"
                        placeholder="Désignation de l'article"
                        value={article.designation}
                        onChange={(e) => handleArticleChange(index, 'designation', e.target.value)}
                    />
                    <input
                        type="number"
                        placeholder="Quantité"
                        value={article.quantite}
                        onChange={(e) => handleArticleChange(index, 'quantite', Number(e.target.value))}
                    />
                </div>
            ))}

            <button type="button" onClick={addArticle}>Ajouter un article</button>
            <button type="submit">Soumettre</button>
        </form>
    );
};

export default CommandeRcSansimpotHorsPromo;
