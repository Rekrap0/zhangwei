import { useEffect } from "react";
import { useRouter } from "next/router";

export default function Teapot() {
  const router = useRouter();

  useEffect(() => {
    router.replace("/end0_LaBIT3Ezit");
  }, [router]);

  return null;
}
