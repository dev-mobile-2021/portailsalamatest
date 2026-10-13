import React, { useState } from 'react';

type ArticlePromo = {
    designation: string;
    quantite: number;
    codePromo: string;
};

const CommandeRcSansimpotEnPromo = () => {
    const [articles, setArticles] = useState<ArticlePromo[]>([
        { designation: '', quantite: 0, codePromo: '' },
    ]);

    const handleArticleChange = (
        index: number,
        field: keyof ArticlePromo,
        value: string | number
    ) => {
        const newArticles = [...articles];
        newArticles[index] = { ...newArticles[index], [field]: value };
        setArticles(newArticles);
    };

    const addArticle = () => {
        setArticles([
            ...articles,
            { designation: '', quantite: 0, codePromo: '' },
        ]);
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        console.log('Formulaire soumis (En Promo)', articles);
        // TODO : appel API ou envoi au back-office
    };

    return (
        <form onSubmit={handleSubmit}>
            <h2>Commande RC Sans IMP – En Promo</h2>

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
                    <input
                        type="text"
                        placeholder="Code Promo"
                        value={article.codePromo}
                        onChange={(e) => handleArticleChange(index, 'codePromo', e.target.value)}
                    />
                </div>
            ))}

            <button type="button" onClick={addArticle}>
                Ajouter un article
            </button>
            <button type="submit">Soumettre</button>
        </form>
    );
};

export default CommandeRcSansimpotEnPromo;
