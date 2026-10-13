import { useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import { useCrud } from "../../hooks/useCrud";
import { schemaAddproduit } from "../../utils/variable";
import { Categorie } from "../../types/categorie.types";



const FormAddProduct = () => {

    const { useCreateItem } = useCrud("api/products", 'products');
    const { mutate: createProduit } = useCreateItem();
    const { data: categories} = useCrud<Categorie>('api/categories',"categories").useFetchAll();

    const { register, handleSubmit, watch, formState: { errors }, reset } = useForm({
        resolver: yupResolver(schemaAddproduit),
    });

    const imgFile = watch("img") as FileList | undefined;

    const onSubmit = async (data: any) => {
        const formData = new FormData();
        formData.append("designation", data.designation);
        formData.append("prix", data.prix.toString());
        formData.append("qte", data.qte.toString());
        formData.append("unite", data.unite);
        formData.append("categorie_id", data.categorie_id);

        if (imgFile && imgFile.length > 0) {
            const file = imgFile[0];
            const reader = new FileReader();

            reader.onloadend = () => {
                const base64Image = reader.result as string;
                formData.append("img", base64Image);
                createProduit(formData, {
                    onSuccess: () => {
                        reset();
                    },
                    onError: (e) => {
                        console.error("Error creating item:", e);
                    }
                });
            };
            reader.readAsDataURL(file);
        } else {
            console.log("Aucune image sélectionnée !");
        }
    };

    return (
        <div className="max-w-md mx-auto p-6 bg-white shadow-md rounded-lg">
            <h2 className="text-2xl font-bold mb-4">Ajouter un produit</h2>
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4" encType="multipart/form-data">
                <div>
                    <label className="block font-medium">Désignation</label>
                    <input type="text" {...register("designation")} className="w-full p-2 border border-gray-300 rounded" />
                    {errors.designation && <p className="text-red-500">{errors.designation.message}</p>}
                </div>
                <div>
                    <label className="block font-medium">Prix (€)</label>
                    <input type="number" step="0.01" {...register("prix")} className="w-full p-2 border border-gray-300 rounded" />
                    {errors.prix && <p className="text-red-500">{errors.prix.message}</p>}
                </div>
                <div>
                    <label className="block font-medium">Quantité</label>
                    <input type="number" {...register("qte")} className="w-full p-2 border border-gray-300 rounded" />
                    {errors.qte && <p className="text-red-500">{errors.qte.message}</p>}
                </div>
                <div>
                    <label className="block font-medium">Unité</label>
                    <select {...register("unite")} className="w-full p-2 border border-gray-300 rounded">
                        <option value="">Sélectionnez une unité</option>
                        <option value="kg">Kilogrammes (kg)</option>
                        <option value="pcs">Pièces (pcs)</option>
                        <option value="litre">Litres (L)</option>
                    </select>
                    {errors.unite && <p className="text-red-500">{errors.unite.message}</p>}
                </div>
                <div>
                    <label className="block font-medium">Catégorie</label>
                    <select {...register("categorie_id")} className="w-full p-2 border border-gray-300 rounded">
                        <option value="">Sélectionnez une catégorie</option>
                        {categories && categories.map((category: Categorie) => (
                            <option key={category.id} value={category.id}>{category.designation}</option>
                        ))}
                    </select>
                    {errors.categorie_id && <p className="text-red-500">{errors.categorie_id.message}</p>}
                </div>
                <div>
                    <label className="block font-medium">Image</label>
                    <input type="file" {...register("img")} className="w-full p-2 border border-gray-300 rounded" />
                    {errors.img && <p className="text-red-500">{errors.img.message}</p>}
                </div>
                <button type="submit" className="w-full bg-blue-500 text-white py-2 rounded hover:bg-blue-600 transition">
                    Ajouter le produit
                </button>
            </form>
        </div>
    );
};

export default FormAddProduct;


