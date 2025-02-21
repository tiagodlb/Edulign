import localFont from "next/font/local";

export const customFont = localFont({
  src: [
    {
      path: "../../public/fonts/Euclid Circular B Bold Italic.ttf",
      weight: "700",
      style: "italic",
    },
    {
      path: "../../public/fonts/Euclid Circular B Bold.ttf",
      weight: "700",
      style: "normal",
    },
    {
      path: "../../public/fonts/Euclid Circular B SemiBold.ttf",
      weight: "600",
      style: "normal",
    },
    {
      path: "../../public/fonts/Euclid Circular B SemiBold Italic.ttf",
      weight: "600",
      style: "italic",
    },
    {
      path: "../../public/fonts/Euclid Circular B Medium.ttf",
      weight: "500",
      style: "normal",
    },
    {
      path: "../../public/fonts/Euclid Circular B Medium Italic.ttf",
      weight: "500",
      style: "italic",
    },
    {
      path: "../../public/fonts/Euclid Circular B Regular.ttf",
      weight: "400",
      style: "normal",
    },
    {
      path: "../../public/fonts/Euclid Circular B Light.ttf",
      weight: "300",
      style: "normal",
    },
    {
      path: "../../public/fonts/Euclid Circular B Light Italic.ttf",
      weight: "300",
      style: "italic",
    },
  ],
  variable: "--font-custom",
});
