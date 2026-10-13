import { lazy, Suspense } from "react";
import { createBrowserRouter } from "react-router-dom";
import ErrorPage from "./components/const/errorPages";
import Spiner from "./components/const/Spiner";
import Root from "./pages/Root";
import { Spinner } from "react-bootstrap";

import HomePage from "./pages/HomePage";
const Accreditation = lazy(() => import("./pages/Accreditation"));
const Fabricants = lazy(() => import("./pages/Fabricants"));
const Vehicules = lazy(() => import("./pages/Vehicules"));
const Chauffeurs = lazy(() => import("./pages/Chauffeurs"));

const Login = lazy(() => import("./pages/Login"));
const Commande = lazy(() => import("./pages/CommandesSpeciales/Commande"));
const ListCommande = lazy(() => import("./pages/ListCommande"));
const CommandeDetail = lazy(() => import("./pages/CommandeDetail"));
const Campagne = lazy(() => import("./pages/Campagne"));
const Tender = lazy(() => import("./pages/Tender"));
const TransportOffer = lazy(() => import("./pages/TransportOffer"));
const SoumissionTransport = lazy(() => import("./pages/SoumissionTransport"));
const TenderDraft = lazy(() => import("./pages/TenderDraft"));
const TenderAchatDirect = lazy(() => import("./pages/TenderAchatDirect"));
const Soumission = lazy(() => import("./pages/Soumission"));
const FormulaireSoumission = lazy(() => import("./pages/formulaireSoumission"));
const TenderAchatDirectInter = lazy(
  () => import("./pages/TenderAchatDirectInter"),
);
const TenderConsultation = lazy(() => import("./pages/TenderConsultation"));
const FormulaireSoumissionInter = lazy(
  () => import("./pages/formulaireSoumissionInter"),
);
const FormulaireSoumissionNational = lazy(
  () => import("./pages/FormulaireSoumissionNational"),
);
const OrdersClient = lazy(() => import("./pages/Orders"));
const DetailOrdersClient = lazy(() => import("./pages/DetailOrders"));

const TenderAOR = lazy(() => import("./pages/TenderAOR"));
const TenderDetails = lazy(() => import("./pages/TenderDetails"));
const TenderAORDetails = lazy(() => import("./pages/TenderAORDetails"));
const SoumissionAO = lazy(() => import("./pages/soumissionAO"));
const SoumissionAOR = lazy(() => import("./pages/SoumissionAOR"));
const FormulaireSoumissionConsultation = lazy(
  () => import("./pages/FormulaireSoumissionConsultation"),
);
const DetailSoumission = lazy(() => import("./pages/DetailSoumission"));
const TenderConsultationTraitement = lazy(
  () => import("./pages/TenderConsultationTraitement"),
);
const ListeCommandesClient = lazy(() => import("./pages/ListeCommandesClient"));
const ListeTypeCommande = lazy(() => import("./pages/ListeTypeCommande"));
const CommandeRcSansimpotEnPromo = lazy(
  () => import("./pages/CommandeRcSansimpotEnPromo"),
);
const CommandeRcSansimpotHorsPromo = lazy(
  () => import("./pages/CommandeRcSansimpotHorsPromo"),
);
const CommandeRcSansimpotForm = lazy(() => import("./pages/CommandesSpeciales/CommandeRC"));
const CommandeTEF = lazy(() => import("./pages/CommandesSpeciales/CommandeTEF"));
const CommandeCF = lazy(() => import("./pages/CommandesSpeciales/CommandeCF"));
const CommandeBE = lazy(() => import("./pages/CommandesSpeciales/CommandeBE"));
const CommandeUrgence = lazy(() => import("./pages/CommandesSpeciales/CommandeUrgence"));
const CommandeEnlevement = lazy(() => import("./pages/CommandesSpeciales/CommandeEnlevement"));
const CommandeRCPublic = lazy(() => import("./pages/CommandesSpeciales/CommandeRCPublic"));
const DetailCommandeSimulee = lazy(
  () => import("./pages/DetailCommandeSimulee"),
);
const TableauSuivi = lazy(() => import("./pages/TableauSuivi"));
const TableauSuiviTransport = lazy(
  () => import("./pages/TableauSuiviTransport"),
);
const PortailTransporteur = lazy(() => import("./pages/PortailTransporteur"));
const DetailExpeditionTransporteur = lazy(
  () => import("./pages/DetailExpeditionTransporteur"),
);
const SuiviMarche = lazy(() => import("./pages/SuiviMarche"));
const BailleurOrders = lazy(() => import("./pages/BailleurOrders"));
const TenderDetailsAchatDirect = lazy(
  () => import("./pages/TenderDetailsAchatDirect"),
);
const VueGlobaleTest = lazy(() => import("./components/tabs/VueGlobaleTest"));
const router = createBrowserRouter([
  {
    path: "/",
    element: <Root />,
    errorElement: <HomePage />,
    children: [
      {
        path: "/",
        element: (
          <Suspense fallback={<Spinner />}>
            <HomePage />
          </Suspense>
        ),
      },
      {
        path: "/tableauSuivi/:id",
        element: (
          <Suspense fallback={<Spinner />}>
            <TableauSuivi />
          </Suspense>
        ),
      },
      {
        path: "/tableauSuiviTransport/:id",
        element: (
          <Suspense fallback={<Spinner />}>
            <TableauSuiviTransport />
          </Suspense>
        ),
      },
      {
        path: "/portailTransporteur",
        element: (
          <Suspense fallback={<Spinner />}>
            <PortailTransporteur />
          </Suspense>
        ),
      },
      {
        path: "/portailTransporteur/:id",
        element: (
          <Suspense fallback={<Spinner />}>
            <DetailExpeditionTransporteur />
          </Suspense>
        ),
      },
      {
        path: "/suiviMarche",
        element: (
          <Suspense fallback={<Spinner />}>
            <SuiviMarche />
          </Suspense>
        ),
      },
      {
        path: "/commande/formulaire/:id",
        element: (
          <Suspense fallback={<Spiner />}>
            <Commande />
          </Suspense>
        ),
      },
      {
        path: "/orders",
        element: (
          <Suspense fallback={<Spiner />}>
            <ListCommande />
          </Suspense>
        ),
      },
      {
        path: "/commande/:id",
        element: (
          <Suspense fallback={<Spiner />}>
            <CommandeDetail />
          </Suspense>
        ),
      },
      {
        path: "/orders_client",
        element: (
          <Suspense fallback={<Spiner />}>
            <OrdersClient />
          </Suspense>
        ),
      },
      {
        path: "/offres/affectees",
        element: (
          <Suspense fallback={<Spiner />}>
            <BailleurOrders />
          </Suspense>
        ),
      },
      {
        path: "/orders_client/:id",
        element: (
          <Suspense fallback={<Spiner />}>
            <DetailOrdersClient />
          </Suspense>
        ),
      },
      {
        path: "/orders_client/liste",
        element: (
          <Suspense fallback={<Spiner />}>
            <ListeCommandesClient />
          </Suspense>
        ),
      },
      {
        path: "/ListeType",
        element: (
          <Suspense fallback={<Spiner />}>
            <ListeTypeCommande />
          </Suspense>
        ),
      },
      {
        path: "/detail_commande/:id",
        element: (
          <Suspense fallback={<Spiner />}>
            <DetailCommandeSimulee />
          </Suspense>
        ),
      },
      {
        path: "/commandeRcSansimpotEnPromo",
        element: (
          <Suspense fallback={<Spiner />}>
            <CommandeRcSansimpotEnPromo />
          </Suspense>
        ),
      },
      {
        path: "/commandeRcSansimpotHorsPromo",
        element: (
          <Suspense fallback={<Spiner />}>
            <CommandeRcSansimpotHorsPromo />
          </Suspense>
        ),
      },
      {
        path: "/commandeRcSansimpotForm",
        element: (
          <Suspense fallback={<Spiner />}>
            <CommandeRcSansimpotForm />
          </Suspense>
        ),
      },
      {
        path: "/detail_orders_client/:id",
        element: (
          <Suspense fallback={<Spiner />}>
            <DetailOrdersClient />
          </Suspense>
        ),
      },
      {
        path: "/detailAchatDirect/:id",
        element: (
          <Suspense fallback={<Spiner />}>
            <TenderDetailsAchatDirect />
          </Suspense>
        ),
      },
      {
        path: "/commande/campagne/:id",
        element: (
          <Suspense fallback={<Spiner />}>
            <Campagne />
          </Suspense>
        ),
      },
      {
        path: "/client/tender/:id",
        element: (
          <Suspense fallback={<Spiner />}>
            <Tender />
          </Suspense>
        ),
      },
      {
        path: "/client/transport-offer/:id",
        element: (
          <Suspense fallback={<Spiner />}>
            <TransportOffer />
          </Suspense>
        ),
      },
      {
        path: "/formulaireTransport/:id",
        element: (
          <Suspense fallback={<Spiner />}>
            <SoumissionTransport />
          </Suspense>
        ),
      },
      {
        path: "/client/tenderDraft/:id",
        element: (
          <Suspense fallback={<Spiner />}>
            <TenderDraft />
          </Suspense>
        ),
      },
      {
        path: "/client/tenderAOR/:id",
        element: (
          <Suspense fallback={<Spiner />}>
            <TenderAOR />
          </Suspense>
        ),
      },
      {
        path: "/client/soumission/:id",
        element: (
          <Suspense fallback={<Spiner />}>
            <Soumission />
          </Suspense>
        ),
      },
      {
        path: "*",
        element: <ErrorPage />,
      },
      {
        path: "/formulaireSoumission/:id",
        element: (
          <Suspense fallback={<Spiner />}>
            <FormulaireSoumission />
          </Suspense>
        ),
      },
      {
        path: "/formulaireSoumissioninternational/:id",
        element: (
          <Suspense fallback={<Spiner />}>
            <FormulaireSoumissionInter />
          </Suspense>
        ),
      },
      {
        path: "/formulaireAO/:id",
        element: (
          <Suspense fallback={<Spiner />}>
            <SoumissionAO />
          </Suspense>
        ),
      },
      {
        path: "/formulaireSoumissionNational/:id",
        element: (
          <Suspense fallback={<Spiner />}>
            <FormulaireSoumissionNational />
          </Suspense>
        ),
      },
      {
        path: "/TenderConsultationTraitement/:id",
        element: (
          <Suspense fallback={<Spiner />}>
            <TenderConsultationTraitement />
          </Suspense>
        ),
      },
      {
        path: "/formulaireSoumissionConsultation/:id",
        element: (
          <Suspense fallback={<Spiner />}>
            <FormulaireSoumissionConsultation />
          </Suspense>
        ),
      },
      {
        path: "/detailSoumission/:id",
        element: (
          <Suspense fallback={<Spiner />}>
            <DetailSoumission />
          </Suspense>
        ),
      },

      {
        path: "/tender/achat-direct-national/:id",
        element: (
          <Suspense fallback={<Spiner />}>
            <TenderAchatDirect />
          </Suspense>
        ),
      },
      {
        path: "/tenderDetails/:id",
        element: (
          <Suspense fallback={<Spiner />}>
            <TenderDetails />
          </Suspense>
        ),
      },
      {
        path: "/commandeTEF",
        element: (
          <Suspense fallback={<Spiner />}>
            <CommandeTEF />
          </Suspense>
        ),
      },
      {
        path: "/commandeCF",
        element: (
          <Suspense fallback={<Spiner />}>
            <CommandeCF />
          </Suspense>
        ),
      },
      {
        path: "/commandeBE",
        element: (
          <Suspense fallback={<Spiner />}>
            <CommandeBE />
          </Suspense>
        ),
      },
      {
        path: "/commandeUrgence",
        element: (
          <Suspense fallback={<Spiner />}>
            <CommandeUrgence />
          </Suspense>
        ),
      },
      {
        path: "/commandeEnlevement",
        element: (
          <Suspense fallback={<Spiner />}>
            <CommandeEnlevement />
          </Suspense>
        ),
      },
      {
        path: "/commandeRCPublic",
        element: (
          <Suspense fallback={<Spiner />}>
            <CommandeRCPublic />
          </Suspense>
        ),
      },
      {
        path: "/tenderAORDetails/:id",
        element: (
          <Suspense fallback={<Spiner />}>
            <TenderAORDetails />
          </Suspense>
        ),
      },
      {
        path: "/tender/achat-direct-internationale/:id",
        element: (
          <Suspense fallback={<Spiner />}>
            <TenderAchatDirectInter />
          </Suspense>
        ),
      },
      {
        path: "/tender/consultation-cotation/:id",
        element: (
          <Suspense fallback={<Spiner />}>
            <TenderConsultation />
          </Suspense>
        ),
      },
      {
        path: "/formulaireAOR/:id",
        element: (
          <Suspense fallback={<Spiner />}>
            <SoumissionAOR />
          </Suspense>
        ),
      },
      {
        path: "/fabricants",
        element: (
          <Suspense fallback={<Spiner />}>
            <Fabricants />
          </Suspense>
        ),
      },
      {
        path: "/vehicules",
        element: (
          <Suspense fallback={<Spiner />}>
            <Vehicules />
          </Suspense>
        ),
      },
      {
        path: "/chauffeurs",
        element: (
          <Suspense fallback={<Spiner />}>
            <Chauffeurs />
          </Suspense>
        ),
      },
      {
        // 🧪 Route de test pour VueGlobale avec données mock
        path: "/test-vue-globale",
        element: (
          <Suspense fallback={<Spiner />}>
            <VueGlobaleTest />
          </Suspense>
        ),
      },
    ],
  },
  {
    path: "/login",
    element: (
      <Suspense fallback={<Spiner />}>
        <Login />
      </Suspense>
    ),
  },
  {
    path: "/accreditation",
    element: (
      <Suspense fallback={<Spiner />}>
        <Accreditation />
      </Suspense>
    ),
  },
  {
    path: "/*",
    element: <ErrorPage />, // 404
  },
]);

export default router;
