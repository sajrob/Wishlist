import { useTheme } from "next-themes"
import { Toaster as Sonner } from "sonner"

type ToasterProps = React.ComponentProps<typeof Sonner>

const Toaster = ({ ...props }: ToasterProps) => {
  const { theme = "system" } = useTheme()

  return (
    <Sonner
      theme={theme as ToasterProps["theme"]}
      className="toaster group"
      toastOptions={{
        classNames: {
          toast:
            "group toast group-[.toaster]:bg-white group-[.toaster]:text-gray-900 group-[.toaster]:border group-[.toaster]:border-gray-200 group-[.toaster]:shadow-lg",
          title:
            "group-[.toast]:text-gray-900 group-[.toast]:font-semibold",
          description:
            "group-[.toast]:text-gray-600",
          actionButton:
            "group-[.toast]:bg-gray-900 group-[.toast]:text-white group-[.toast]:font-medium",
          cancelButton:
            "group-[.toast]:bg-gray-100 group-[.toast]:text-gray-700",
          closeButton:
            "group-[.toast]:text-gray-500 group-[.toast]:hover:text-gray-900",
        },
      }}
      {...props}
    />
  )
}

export { Toaster }
