import { Accordion, Container } from "react-bootstrap";

const Faq = () => {
    const faqData = [
        {
            question: "Quels types de fruits tropicaux vendez-vous ?",
            answer: "Nous proposons une large gamme de fruits tropicaux frais et séchés, notamment : Ananas Victoria, Mangue Alphonso, Noix de coco, Bananes plantains et mini-bananes, ainsi que divers produits dérivés.",
        },
        {
            question: "Où livrez-vous vos fruits ?",
            answer: "Nous livrons en Europe et dans plusieurs autres pays à travers le monde. Vérifiez la disponibilité de la livraison en entrant votre adresse lors du passage en caisse.",
        },
        {
            question: "Comment garantissez-vous la fraîcheur des fruits ?",
            answer: "Nos fruits sont récoltés à maturité, emballés de manière isotherme et expédiés rapidement pour assurer leur fraîcheur.",
        },
        {
            question: "Quels sont les délais de livraison ?",
            answer: "Europe : 2 à 5 jours ouvrés. Autres pays : 5 à 10 jours ouvrés. Un numéro de suivi est fourni pour chaque commande.",
        },
        {
            question: "Puis-je retourner un produit ?",
            answer: "Nous acceptons les retours en cas de produit endommagé ou non conforme. Pour les produits périssables, nous offrons un remboursement ou un avoir.",
        },
        {
            question: "Quels sont les moyens de paiement acceptés ?",
            answer: "Nous acceptons Visa, Mastercard, AMEX, PayPal, virement bancaire et paiement mobile (Apple Pay, Google Pay).",
        },
        {
            question: "Comment puis-je contacter le service client ?",
            answer: "Email : support@fruitstropicaux.com | Téléphone : +33 6 12 34 56 78 | Chat en ligne disponible 7j/7.",
        },
    ];

    return (
        <>


            <Container className="faq-container">
                <Accordion defaultActiveKey="0" className="faq-accordion">
                    {faqData.map((faq, index) => (
                        <Accordion.Item eventKey={index.toString()} key={index}>
                            <Accordion.Header>{faq.question}</Accordion.Header>
                            <Accordion.Body>{faq.answer}</Accordion.Body>
                        </Accordion.Item>
                    ))}
                </Accordion>
            </Container>
        </>
    );
};

export default Faq;
