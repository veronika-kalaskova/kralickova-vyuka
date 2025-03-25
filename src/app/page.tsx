import Button from "@/components/Button";
import CalendarComponent from "@/components/Calendar";

export default async function Home() {
  // const users = await prisma.uzivatel.findMany({
  //   include: {
  //     UzivatelRole: {
  //       include: {
  //         role: true,
  //       },
  //     },
  //   },
  // });

  return (
    <div className="flex flex-col items-center justify-center gap-8 p-4 md:flex-row md:items-start">
      {/* PREHLED LEKCI */}
      <div className="w-full md:w-3/4">
        <h1 className="title">Přehled lekcí</h1>
        <CalendarComponent />
      </div>

      {/* RYCHLE AKCE */}
      <div className="w-full md:w-1/4">
        <h2 className="title">Rychlé akce</h2>
        <div className="flex flex-col gap-3">
          <Button title="Přidat lekci" />
          <Button title="Přidat studenta" />
          <Button title="Přidat kurz" />
        </div>
      </div>
    </div>
  );
}
