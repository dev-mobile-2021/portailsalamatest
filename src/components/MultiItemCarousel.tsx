import { Categorie } from "../types/categorie.types";
import { BASE_URL } from "../utils/variable";
import { useState } from "react";
import { useCrudGraph } from "../hooks/useCrudGraph";
import { getSousCategoriesQuery } from "../api/graphql/queries";
import Spiner from "./const/Spiner";
import { Alert } from "react-bootstrap";

// Icône pour "Tous"
const ToutIcon = () => (
    <svg width="21" height="21" viewBox="0 0 51 51" fill="none" xmlns="http://www.w3.org/2000/svg">
        <circle cx="25.0647" cy="25.0647" r="25.0647" fill="white" />
        <g clipPath="url(#clip0_25_745)">
            <path d="M20.4176 24.5781C20.4283 22.613 21.8606 21.4189 23.2663 21.8526C26.7441 22.9262 30.2006 24.0721 33.6436 25.2528C34.8618 25.6705 35.4 26.9181 35.0359 28.0641C34.6423 29.3037 33.5017 29.9837 32.1952 29.5768C28.7602 28.5058 25.3225 27.4268 21.949 26.1846C21.2181 25.9141 20.7469 24.9423 20.4176 24.5781Z" fill="#36BAD8" />
            <path d="M31.3599 36.6476C31.3331 38.3531 29.8659 39.4696 28.388 39.001C25.0038 37.9274 21.6304 36.8136 18.2676 35.6758C16.9986 35.2474 16.3774 33.9917 16.7416 32.811C17.1271 31.5634 18.3667 30.9074 19.7214 31.3385C23.0654 32.4014 26.3987 33.5071 29.7294 34.6129C30.7789 34.9609 31.2769 35.7534 31.3599 36.6476Z" fill="#36BAD8" />
            <path d="M27.0333 12.2088C27.7374 12.3962 28.6825 12.6399 29.6223 12.8969C32.1925 13.601 34.7681 14.2864 37.3277 15.028C38.8457 15.4698 39.507 16.5809 39.159 17.9303C38.8323 19.1994 37.5686 19.8366 36.08 19.435C32.7815 18.5407 29.4804 17.6465 26.1979 16.6987C24.969 16.3426 24.364 15.2931 24.5594 14.1552C24.7575 13.0174 25.6437 12.2409 27.0333 12.2088Z" fill="#36BAD8" />
            <path d="M22.3024 12.4819C22.2569 13.7242 21.1833 14.7336 19.9329 14.7148C18.4176 14.6907 17.2958 13.6198 17.3493 12.2436C17.3975 10.996 18.4818 9.96522 19.7081 10.0027C21.2127 10.0482 22.3506 11.1352 22.3024 12.4819Z" fill="#36BAD8" />
            <path d="M12.6024 33.2742C11.1486 33.2662 10.0321 32.2809 10 30.9744C9.97055 29.6946 11.0335 28.6585 12.3855 28.6531C13.8473 28.6477 14.9397 29.6223 14.9638 30.9529C14.9906 32.2755 13.9652 33.2822 12.6024 33.2742Z" fill="#36BAD8" />
            <path d="M18.6264 22.1257C18.605 23.3894 17.5582 24.4015 16.3078 24.372C14.7978 24.3372 13.676 23.2716 13.7135 21.9089C13.7483 20.6853 14.846 19.6278 16.0588 19.6492C17.5689 19.6786 18.6532 20.7201 18.6264 22.1257Z" fill="#36BAD8" />
        </g>
        <defs>
            <clipPath id="clip0_25_745">
                <rect width="29.25" height="29.1081" fill="white" transform="translate(10 10)" />
            </clipPath>
        </defs>
    </svg>
);

// Définir un type pour les éléments du carrousel
type CarouselItem = {
    id: number;
    designation: string;
    isSvg: boolean;
    image?: string; // image optionnelle
};

const MultiItemCarousel = ({ setSelectedCategory }: { setSelectedCategory: (index: number | undefined) => void }) => {
    const { useFetchAll } = useCrudGraph<Categorie>('souscategories');
    const { data: categories, isLoading, isError } = useFetchAll(getSousCategoriesQuery);
    const [selectedIndex, setSelectedIndex] = useState<number>(0);

    if (isLoading) return <Spiner />;
    if (isError) return <Alert variant="danger">Une erreur s'est produite lors du chargement des catégories</Alert>;

    // Préparer les éléments à afficher
    const displayedItems: CarouselItem[] = [
        { id: 0, designation: "Tous", isSvg: true },
        ...(categories?.slice(0, 5).map(item => ({
            id: item.id,
            designation: item.designation,
            image: "",
            isSvg: false,
        })) || [])
    ];

    return (
        <div className="d-flex gap-2 overflow-auto py-2 justify-content-between" style={{ scrollbarWidth: 'none' }}>
            {displayedItems.map((item, index) => (
                <div
                    key={item.id}
                    className={`d-flex align-items-center p-1 rounded-pill border ${selectedIndex === index ? "border-primary bg-theme" : "border-light bg-theme-blur"}`}
                    style={{
                        minWidth: 'fit-content',
                        cursor: 'pointer',
                        transition: 'all 0.2s ease'
                    }}
                    onClick={() => {
                        setSelectedIndex(index);
                        setSelectedCategory(index === 0 ? undefined : item.id);
                    }}
                >
                    <div className="me-2 d-flex align-items-center justify-content-center" style={{ width: '30px', height: '30px' }}>
                        {item.isSvg ? (
                            <ToutIcon />
                        ) : (
                            item.image && (
                                <img
                                    src={BASE_URL + item.image}
                                    alt={item.designation}
                                    className="rounded-circle"
                                    style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                                />
                            )
                        )}
                    </div>
                    <span className="me-2 fw-bold p-0 m-0" style={{ fontSize: '0.9rem' }}>
                        {item.designation}
                    </span>
                </div>
            ))}
        </div>
    );
};

export default MultiItemCarousel;
