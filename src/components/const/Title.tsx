interface TitleProps {
    spanText: string;
    titleText: string;
    textColorH2?: string;
    underlineColor?: string;
    align?: 'left' | 'center' | 'right';
    children?: React.ReactNode;
    maxWidth?: string;
}

export default function Title({
    spanText,
    titleText,
    textColorH2 = "text-dark",
    align = 'left',
    children,
    maxWidth
}: TitleProps) {
    const alignmentClass = () => {
        switch (align) {
            case 'center': return 'justify-content-center text-center';
            case 'right': return 'justify-content-end text-end';
            default: return 'justify-content-start text-start';
        }
    };

    return (
        <div className="title-container mb-4 w-100">
            <div className={`d-flex flex-wrap align-items-center ${alignmentClass()}`}>
                <div className="flex-grow-1">
                    <span className="d-block text-theme text-uppercase fw-bold">{spanText}</span>
                    <h6 className={`${textColorH2} mb-3 text-start`} style={{ maxWidth: maxWidth || '100%', fontSize: "1.8rem" }}>
                        {titleText}
                    </h6>
                </div>

                {children && (
                    <div className="d-flex gap-2 align-items-center ms-auto mt-2 mt-lg-0">
                        {children}
                    </div>
                )}
            </div>
        </div>
    );
}
