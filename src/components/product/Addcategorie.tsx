import { useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import { useCrud } from "../../hooks/useCrud";
import { schemaAddCategorie } from "../../utils/variable";

const FormAddCategorie = () => {
    const { useCreateItem } = useCrud("api/categorie",'categories');
    const { mutate: createCategorie } = useCreateItem();

    const { register, handleSubmit, watch, formState: { errors }, reset } = useForm({
        resolver: yupResolver(schemaAddCategorie),
    });

    const imgFile = watch("img") as FileList | undefined;

    const onSubmit = async (data: any) => {
        const formData = new FormData();
        formData.append("designation", data.designation);

        if (imgFile && imgFile.length > 0) {
            const file = imgFile[0];
            const reader = new FileReader();

            reader.onloadend = () => {
                const base64Image = reader.result as string;
                formData.append("img", base64Image);
                createCategorie(formData, {
                    onSuccess: (data) => {
                        console.log("Item created successfully:", data.data);
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
            <h2 className="text-2xl font-bold mb-4">Ajouter une catégorie</h2>
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4" encType="multipart/form-data">
                {/* <div>
                    <label className="block font-medium">ID</label>
                    <input type="number" {...register("id")} className="w-full p-2 border border-gray-300 rounded" />
                    {errors.id && <p className="text-red-500">{errors.id.message}</p>}
                </div> */}
                <div>
                    <label className="block font-medium">Désignation</label>
                    <input type="text" {...register("designation")} className="w-full p-2 border border-gray-300 rounded" />
                    {errors.designation && <p className="text-red-500">{errors.designation.message}</p>}
                </div>
                <div>
                    <label className="block font-medium">Image</label>
                    <input type="file" {...register("img")} className="w-full p-2 border border-gray-300 rounded" />
                    {errors.img && <p className="text-red-500">{errors.img.message}</p>}
                </div>
                <button type="submit" className="w-full bg-blue-500 text-white py-2 rounded hover:bg-blue-600 transition">
                    Ajouter la catégorie
                </button>
            </form>
        </div>
    );
};

export default FormAddCategorie;
