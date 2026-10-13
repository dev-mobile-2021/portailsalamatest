import { FC, useState, KeyboardEvent } from "react";
import { FaChevronLeft, FaChevronRight, FaAngleDoubleLeft, FaAngleDoubleRight } from "react-icons/fa";

interface PaginationProps {
    currentPage: number;
    totalPages: number;
    onPageChange: (page: number) => void;
    perPage: number;
    onPerPageChange: (perPage: number) => void;
    totalItems?: number;
}

const PaginationComponent: FC<PaginationProps> = ({
    currentPage,
    totalPages,
    onPageChange,
    perPage,
    onPerPageChange,
    totalItems
}) => {
    const [jumpToPage, setJumpToPage] = useState<string>("");

    // Générer les numéros de pages à afficher avec ellipsis
    const getPageNumbers = (): (number | string)[] => {
        const pages: (number | string)[] = [];
        const delta = 2; // Nombre de pages à afficher autour de la page courante

        if (totalPages <= 7) {
            // Si moins de 7 pages, afficher toutes
            for (let i = 1; i <= totalPages; i++) {
                pages.push(i);
            }
        } else {
            // Toujours afficher la première page
            pages.push(1);

            // Calculer les pages à afficher
            const start = Math.max(2, currentPage - delta);
            const end = Math.min(totalPages - 1, currentPage + delta);

            // Ajouter ellipsis au début si nécessaire
            if (start > 2) {
                pages.push("...");
            }

            // Pages du milieu
            for (let i = start; i <= end; i++) {
                pages.push(i);
            }

            // Ajouter ellipsis à la fin si nécessaire
            if (end < totalPages - 1) {
                pages.push("...");
            }

            // Toujours afficher la dernière page
            pages.push(totalPages);
        }

        return pages;
    };

    const handleJumpToPage = () => {
        const pageNum = Number.parseInt(jumpToPage, 10);
        if (pageNum >= 1 && pageNum <= totalPages) {
            onPageChange(pageNum);
            setJumpToPage("");
        }
    };

    const handleKeyPress = (e: KeyboardEvent<HTMLInputElement>) => {
        if (e.key === "Enter") {
            handleJumpToPage();
        }
    };

    const startItem = totalItems ? (currentPage - 1) * perPage + 1 : 0;
    const endItem = totalItems ? Math.min(currentPage * perPage, totalItems) : 0;

    return (
        <div className="pagination-wrapper bg-white rounded-3 shadow-sm px-4 py-3 my-3">
            <div className="d-flex justify-content-between align-items-center flex-wrap gap-3">
                {/* Section gauche : Sélecteur et infos */}
                <div className="d-flex align-items-center gap-4">
                    {/* Sélecteur d'éléments par page */}
                    <div className="d-flex align-items-center gap-2">
                        <span className="text-muted" style={{ fontSize: "0.9rem" }}>Afficher</span>
                        <select
                            className="form-select form-select-sm"
                            style={{ 
                                width: "75px", 
                                border: "1px solid #dee2e6",
                                borderRadius: "6px",
                                fontSize: "0.9rem"
                            }}
                            value={perPage}
                            onChange={(e) => onPerPageChange(Number(e.target.value))}
                            aria-label="Éléments par page"
                        >
                            <option value={100}>100</option>
                            <option value={50}>50</option>
                            <option value={20}>20</option>
                            <option value={10}>10</option>
                            <option value={5}>5</option>
                        </select>
                        <span className="text-muted" style={{ fontSize: "0.9rem" }}>par page</span>
                    </div>

                    {/* Informations de pagination */}
                    {totalItems !== undefined && totalItems > 0 && (
                        <div className="text-muted" style={{ fontSize: "0.9rem" }}>
                            Affichage de <strong className="text-dark">{startItem}</strong> à{" "}
                            <strong className="text-dark">{endItem}</strong> sur{" "}
                            <strong className="text-dark">{totalItems}</strong> résultat{totalItems > 1 ? "s" : ""}
                        </div>
                    )}
                </div>

                {/* Section centrale : Contrôles de pagination */}
                <div className="d-flex align-items-center gap-2">
                    {/* Première page */}
                    <button
                        className="pagination-btn"
                        onClick={() => onPageChange(1)}
                        disabled={currentPage === 1}
                        title="Première page"
                        aria-label="Première page"
                    >
                        <FaAngleDoubleLeft size={14} />
                    </button>

                    {/* Page précédente */}
                    <button
                        className="pagination-btn"
                        onClick={() => onPageChange(currentPage - 1)}
                        disabled={currentPage === 1}
                        title="Page précédente"
                        aria-label="Page précédente"
                    >
                        <FaChevronLeft size={12} />
                    </button>

                    {/* Numéros de pages */}
                    <div className="d-flex align-items-center gap-1">
                        {getPageNumbers().map((page) =>
                            typeof page === "number" ? (
                                <button
                                    key={`page-${page}`}
                                    className={`pagination-number ${
                                        currentPage === page ? "active" : ""
                                    }`}
                                    onClick={() => onPageChange(page)}
                                    aria-label={`Page ${page}`}
                                    aria-current={currentPage === page ? "page" : undefined}
                                >
                                    {page}
                                </button>
                            ) : (
                                <span
                                    key={`ellipsis-${currentPage}-${page}`}
                                    className="pagination-ellipsis"
                                >
                                    {page}
                                </span>
                            )
                        )}
                    </div>

                    {/* Page suivante */}
                    <button
                        className="pagination-btn"
                        onClick={() => onPageChange(currentPage + 1)}
                        disabled={currentPage === totalPages}
                        title="Page suivante"
                        aria-label="Page suivante"
                    >
                        <FaChevronRight size={12} />
                    </button>

                    {/* Dernière page */}
                    <button
                        className="pagination-btn"
                        onClick={() => onPageChange(totalPages)}
                        disabled={currentPage === totalPages}
                        title="Dernière page"
                        aria-label="Dernière page"
                    >
                        <FaAngleDoubleRight size={14} />
                    </button>
                </div>

                {/* Section droite : Navigation rapide (optionnelle) */}
                {totalPages > 7 && (
                    <div className="d-flex align-items-center gap-2">
                        <span className="text-muted" style={{ fontSize: "0.9rem" }}>Aller à</span>
                        <input
                            type="number"
                            className="form-control form-control-sm"
                            style={{ 
                                width: "65px",
                                border: "1px solid #dee2e6",
                                borderRadius: "6px",
                                fontSize: "0.9rem"
                            }}
                            min={1}
                            max={totalPages}
                            value={jumpToPage}
                            onChange={(e) => setJumpToPage(e.target.value)}
                            onKeyDown={handleKeyPress}
                            placeholder="#"
                            aria-label="Numéro de page"
                        />
                        <button
                            className="btn btn-sm btn-primary"
                            onClick={handleJumpToPage}
                            disabled={!jumpToPage}
                            style={{ 
                                minWidth: "45px",
                                borderRadius: "6px",
                                fontSize: "0.85rem",
                                padding: "0.35rem 0.75rem"
                            }}
                        >
                            OK
                        </button>
                    </div>
                )}
            </div>

            <style>{`
                .pagination-wrapper {
                    border: 1px solid #f0f0f0;
                }

                .pagination-btn {
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    width: 36px;
                    height: 36px;
                    border: 1px solid #dee2e6;
                    background-color: white;
                    color: #6c757d;
                    border-radius: 6px;
                    cursor: pointer;
                    transition: all 0.2s ease;
                }
                
                .pagination-btn:hover:not(:disabled) {
                    background-color: #f8f9fa;
                    border-color: #adb5bd;
                    color: #495057;
                }
                
                .pagination-btn:disabled {
                    opacity: 0.4;
                    cursor: not-allowed;
                    background-color: #f8f9fa;
                }

                .pagination-number {
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    min-width: 36px;
                    height: 36px;
                    padding: 0 8px;
                    border: 1px solid #dee2e6;
                    background-color: white;
                    color: #495057;
                    border-radius: 6px;
                    cursor: pointer;
                    font-size: 0.9rem;
                    font-weight: 500;
                    transition: all 0.2s ease;
                }
                
                .pagination-number:hover:not(.active) {
                    background-color: #f8f9fa;
                    border-color: #adb5bd;
                }
                
                .pagination-number.active {
                    background-color: #1FB05B;
                    border-color: #1FB05B;
                    color: white;
                    font-weight: 600;
                    box-shadow: 0 2px 6px rgba(31, 176, 91, 0.25);
                }

                .pagination-ellipsis {
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    min-width: 36px;
                    height: 36px;
                    color: #adb5bd;
                    font-size: 0.9rem;
                    font-weight: 500;
                }

                @media (max-width: 992px) {
                    .pagination-wrapper > div {
                        justify-content: center;
                    }
                }

                @media (max-width: 768px) {
                    .pagination-wrapper {
                        padding: 1rem;
                    }
                    
                    .pagination-wrapper > div {
                        flex-direction: column;
                        gap: 1rem;
                    }
                }
            `}</style>
        </div>
    );
};

export default PaginationComponent;
