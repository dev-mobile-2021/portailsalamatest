import { RouterProvider } from "react-router-dom";
import router from "./route";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";

import { ReactQueryDevtools } from "@tanstack/react-query-devtools";
import { DeliveryProvider } from "./hooks/useUserDelivery";
import { AuthProvider } from "./hooks/useUserhook";
import { ToastContainer, Flip } from "react-toastify";
import "react-toastify/ReactToastify.css";
import { PanierProvider } from "./context/PanierContext";
import { AOProvider } from "./context/AOContext";
import { FiltreSubmissionProvider } from "./context/FiltreSubmissionContext";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      refetchOnMount: false,
      retry: false,
    },
    mutations: {},
  },
});



function App() {
  return (
    <>
      <QueryClientProvider client={queryClient}>
        <AuthProvider>
          < FiltreSubmissionProvider>
          <AOProvider>
          <PanierProvider>
            <DeliveryProvider>              
                <RouterProvider router={router} />
            </DeliveryProvider>
          </PanierProvider>
          </AOProvider>
          </FiltreSubmissionProvider>
        </AuthProvider>
        <ReactQueryDevtools />
      </QueryClientProvider>

      <ToastContainer
        position="top-right"
        autoClose={5000}
        hideProgressBar={false}
        newestOnTop={false}
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
        theme="dark"
        transition={Flip}
      />
    </>
  );
}

export default App;
