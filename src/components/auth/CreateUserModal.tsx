// import React from "react";
// import { useForm } from "react-hook-form";
// import { zodResolver } from "@hookform/resolvers/zod";
// import * as z from "zod";

// // TODO: vsechny potrebne veci pri vyvoreni uzivatele
// // TODO: vytvorit i uzivatel roli
// // TODO: vygenerovat random heslo a hlaska o poslani hesla uzivateli
// // TODO: error state
// // TODO: overit, zda uzivatel jiz neexistuje
// // TODO: overit, zda uzivatel nema prazdne pole
// // TODO: vygenerovat username z jmena a prijmeni

// const FormSchema = z.object({
//   username: z.string().min(3, "Uživatelské jméno musí mít alespoň 3 znaky"),
//   name: z.string().min(3, "Uživatelské jméno musí mít alespoň 3 znaky"),
//   surname: z.string().min(3, "Uživatelské jméno musí mít alespoň 3 znaky"),
//   password: z.string().min(1, "Heslo není vyplněno"),
//   phone: z.string().min(1, "phone není vyplněno"),
//   email: z.string().email("Neplatná e-mailová adresa"),
//   class: z.string().min(1, "trida"),
//   requiresPickup: z.boolean(),
//   skupinaId: z.string().nonempty("Musíte vybrat kurz"),
//   // kurzId:
// });

// interface Props {
//   roleId: string;
//   isOpen: boolean;
//   onClose: () => void;
// }

// export default function CreateUserModal({ roleId, isOpen, onClose }: Props) {
//   const {
//     register,
//     handleSubmit,
//     formState: { errors },
//   } = useForm({
//     resolver: zodResolver(FormSchema),
//   });

//   const onSubmit = async (values: z.infer<typeof FormSchema>) => {
//     const response = await fetch("/api/user", {
//       method: "POST",
//       body: JSON.stringify({
//         username: values.username,
//         name: values.name,
//         surname: values.surname,
//         password: values.password,
//         roleId: roleId,
//       }),
//       headers: { "Content-Type": "application/json" },
//     });

//     if (response.ok) {
//       console.log("ok");
//       onClose();
//     } else {
//       console.log("error");
//     }
//   };

//   if (!isOpen) return null;

//   return (
//     <div className="fixed inset-0 z-10 flex items-center justify-center bg-[#0000007e]">
//       <div className="w-[400px] rounded-lg bg-white p-6 shadow-lg">
//         <h2 className="text-lg font-bold">Vytvořit uživatele</h2>
//         <p className="text-sm text-gray-600">Role ID: {roleId}</p>

//         <form onSubmit={handleSubmit(onSubmit)} className="mt-4 space-y-4">
//           <div>
//             <label className="block text-sm font-medium">
//               Uživatelské jméno
//             </label>
//             <input
//               {...register("username")}
//               className="w-full rounded-md border px-3 py-2"
//             />
//             {errors.username && (
//               <p className="text-sm text-red-500">{errors.username.message}</p>
//             )}
//           </div>

//           <div>
//             <label className="block text-sm font-medium">Jméno</label>
//             <input
//               {...register("name")}
//               className="w-full rounded-md border px-3 py-2"
//             />
//             {errors.name && (
//               <p className="text-sm text-red-500">{errors.name.message}</p>
//             )}
//           </div>

//           <div>
//             <label className="block text-sm font-medium">Prijmeni</label>
//             <input
//               {...register("surname")}
//               className="w-full rounded-md border px-3 py-2"
//             />
//             {errors.surname && (
//               <p className="text-sm text-red-500">{errors.surname.message}</p>
//             )}
//           </div>

//           <div>
//             <label className="block text-sm font-medium">Heslo</label>
//             <input
//               type="password"
//               {...register("password")}
//               className="w-full rounded-md border px-3 py-2"
//             />
//             {errors.password && (
//               <p className="text-sm text-red-500">{errors.password.message}</p>
//             )}
//           </div>

//           {/* <div>
//             <label className="block text-sm font-medium">Vyberte kurz</label>
//             <select {...register("kurzId")} className="w-full rounded-md border px-3 py-2">
//               <option value="">Vyberte kurz</option>
//               {kurzy.map((kurz) => (
//                 <option key={kurz.id} value={kurz.id}>
//                   {kurz.nazev}
//                 </option>
//               ))}
//             </select>
//             {errors.kurzId && <p className="text-sm text-red-500">{errors.kurzId.message}</p>}
//           </div> */}

//           <div className="flex justify-end gap-2">
//             <button
//               type="button"
//               onClick={onClose}
//               className="rounded-md bg-gray-200 px-4 py-2 text-sm hover:bg-gray-300"
//             >
//               Zavřít
//             </button>
//             <button
//               type="submit"
//               className="rounded-md bg-blue-500 px-4 py-2 text-sm text-white hover:bg-blue-600"
//             >
//               Vytvořit
//             </button>
//           </div>
//         </form>
//       </div>
//     </div>
//   );
// }
