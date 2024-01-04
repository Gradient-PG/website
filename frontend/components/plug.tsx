import Link from "next/link";

const Plug = () => {
  return (
    <div className="w-full bg-neutral-50 py-3 pl-4 text-center text-neutral-900">
      Made with ❤️ by{" "}
      <Link href="https://kamilkoziol.com" className="font-bold underline">
        Kamil Kozioł
      </Link>
    </div>
  );
};

export default Plug;
