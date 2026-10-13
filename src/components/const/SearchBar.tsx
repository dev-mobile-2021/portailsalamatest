import { useState, useEffect } from "react";
import { FormControl, Card, ListGroup, Spinner } from "react-bootstrap";
import { useCrudGraph } from "../../hooks/useCrudGraph";
import { getProductsPaginatedQuery, getSousCategoriesQuery } from "../../api/graphql/queries";
import { Product } from "../../types/product.types";
import { NavLink } from "react-router-dom";
import { BASE_URL } from "../../utils/variable";
import { Categorie } from "../../types/categorie.types";

const   SearchBar = ({ classcss }: { classcss: string }) => {
    const [searchValue, setSearchValue] = useState("");
    const [isFocused, setIsFocused] = useState(false);
    const [selectedIndex, setSelectedIndex] = useState(-1);

    const { data: products, isLoading, refetch } = useCrudGraph<{ data: Product[] }>('produitspaginated')
        .useFetchAll(getProductsPaginatedQuery(1, 5, null, null, searchValue), {}, { enabled: !!searchValue });

    const { useFetchAll } = useCrudGraph<Categorie>('souscategories');
    const { data: categories, isLoading: isLoadingCategories } = useFetchAll(getSousCategoriesQuery);

    useEffect(() => {
        if (searchValue) refetch();
    }, [searchValue]);

    const handleKeyDown = (e: React.KeyboardEvent) => {
        const items = searchValue ? products?.[0]?.data : categories;
        if (!items) return;

        if (e.key === "ArrowDown") {
            setSelectedIndex((prev) => (prev < items.length - 1 ? prev + 1 : prev));
        } else if (e.key === "ArrowUp") {
            setSelectedIndex((prev) => (prev > 0 ? prev - 1 : 0));
        } else if (e.key === "Enter" && selectedIndex >= 0) {
            if (searchValue) {
                window.location.href = `/product/${products?.[0]?.data[selectedIndex].id}`;
            } else {
                window.location.href = `/category/${categories?.[selectedIndex].id}`;
            }
        }
    };

    return (
        <div className={`position-relative ${classcss}`} style={{ maxWidth: "500px", width: "100%" }}>
            <FormControl
                type="search"
                placeholder="Rechercher un produit..."
                value={searchValue}
                onChange={(e) => setSearchValue(e.target.value)}
                onFocus={() => setIsFocused(true)}
                onBlur={() => setTimeout(() => setIsFocused(false), 200)}
                onKeyDown={handleKeyDown}
                className="rounded border search-input w-100"
            />

            {isFocused && (
                <Card className="position-absolute mt-5 shadow-sm mt-1 w-100"
                    style={{
                        zIndex: 1000,
                        maxWidth: "520px",
                        left: 0,
                        right: 0
                    }}>
                    {isLoading || isLoadingCategories ? (
                        <div className="text-center py-2">
                            <Spinner animation="border" size="sm" />
                        </div>
                    ) : searchValue ? (
                        <ListGroup variant="flush">
                            {products && products?.[0]?.data?.length > 0 ? (
                                products?.[0]?.data.map((product, index) => (
                                    <NavLink to={`/product/${product.id}`} key={product.id} className="text-decoration-none">
                                        <ListGroup.Item
                                            action
                                            active={selectedIndex === index}
                                            className="d-flex align-items-center gap-3"
                                        >
                                            <img src={BASE_URL + product.image} alt={product.designation} width="40" height="40" className="rounded" />
                                            <div>
                                                <p className="mb-0 fw-bold">{product.designation}</p>
                                                <small className="text-muted">{product.prix} Ar</small>
                                            </div>
                                        </ListGroup.Item>
                                    </NavLink>
                                ))
                            ) : (
                                <ListGroup.Item className="text-center text-muted">Aucun résultat trouvé</ListGroup.Item>
                            )}
                        </ListGroup>
                    ) : (
                        <div className="p-2 d-flex flex-wrap gap-2">
                            {categories?.map((category, index) => (
                                <div
                                    key={category.id}
                                    className={`d-flex align-items-center p-1 rounded-pill border ${selectedIndex === index ? "border-primary bg-theme" : "border-light bg-theme-blur"}`}
                                    style={{
                                        minWidth: 'fit-content',
                                        cursor: 'pointer',
                                        transition: 'all 0.2s ease'
                                    }}
                                    onClick={() => {
                                        window.location.href = `/category/${category.id}`;
                                    }}
                                    onMouseEnter={() => setSelectedIndex(index)}
                                >
                                    <div className="me-2" style={{ width: '30px', height: '30px' }}>
                                        <img
                                            src={BASE_URL + category.id}
                                            alt={category.designation}
                                            className="rounded-circle"
                                            style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                                        />
                                    </div>
                                    <span className="me-2 fw-bold p-0 m-0" style={{ fontSize: '0.9rem' }}>
                                        {category.designation}
                                    </span>
                                </div>
                            ))}
                        </div>
                    )}
                </Card>
            )}
        </div>
    );
};

export default SearchBar;