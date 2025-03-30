"use client";

import { signIn } from "next-auth/react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useState } from "react";

const FormSchema = z.object({
  username: z.string().min(1, "Uživatelské jméno není vyplněno"),
  password: z.string().min(1, "Heslo není vyplněno"),
});

const SignInForm = () => {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<z.infer<typeof FormSchema>>({
    resolver: zodResolver(FormSchema),
    defaultValues: {
      username: "",
      password: "",
    },
  });

  const [failedLogin, setFailedLogin] = useState(false);

  const router = useRouter();

  const onSubmit = async (values: z.infer<typeof FormSchema>) => {
    const signInData = await signIn("credentials", {
      username: values.username,
      password: values.password,
      redirect: false,
    });

    if (signInData?.error) {
      setFailedLogin(true);
    } else {
      router.refresh();
      router.push("/");
    }
  };

  return (
    <div className="flex h-screen items-center justify-center bg-[#FAF8F7]">
      <form
        className="mx-4 rounded-md bg-white p-8 shadow-md"
        onSubmit={handleSubmit(onSubmit)}
      >
        {/* LOGO */}
        <div className="flex items-center justify-center gap-2">
          <Image src="logo.svg" alt="logo" height={110} width={75} />
          <h1 className="text-2xl font-bold">Králíčkova výuka jazyků</h1>
        </div>

        {/* INPUTS */}
        <div className="mt-8">
          <div className="mb-4 flex flex-col gap-2">
            <label className="text-xs text-gray-500">Uživatelské jméno</label>
            <input
              type="text"
              {...register("username")}
              className="rounded-md border-[1.5px] border-gray-300 p-2 focus:border-orange-300"
            />
            {errors.username && (
              <p className="text-xs text-red-500">{errors.username.message}</p>
            )}
          </div>
          <div className="flex flex-col gap-2">
            <label className="text-xs text-gray-500">Heslo</label>
            <input
              type="password"
              {...register("password")}
              className="rounded-md border-[1.5px] border-gray-300 p-2 focus:border-orange-300"
            />
            {errors.password && (
              <p className="text-xs text-red-500">{errors.password.message}</p>
            )}
          </div>
        </div>
        {failedLogin && (
          <p className="mt-2 text-xs text-red-500">Špatné přihlašovací údaje</p>
        )}
        <button
          className="mt-8 w-full cursor-pointer rounded-lg bg-gray-100 py-3 font-medium text-gray-800 transition-all hover:bg-orange-400 hover:text-white"
          type="submit"
        >
          Přihlásit se
        </button>
      </form>
    </div>
  );
};

export default SignInForm;
