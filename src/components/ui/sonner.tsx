"use client"

import {
  IconAlert,
  IconCheckCircle,
  IconInfo,
  IconLoader,
  IconXCircle,
} from "@/components/icons"
import * as React from "react"
import { useTheme } from "next-themes"
import { Toaster as Sonner, type ToasterProps } from "sonner"

const TOAST_STYLE_ID = "nqui-toast-styles-v2"

function injectToastStylesOnce() {
  if (typeof document === "undefined") return
  if (document.getElementById(TOAST_STYLE_ID)) return

  const style = document.createElement("style")
  style.id = TOAST_STYLE_ID
  style.textContent = `
      /* Inverted-surface toast: dark-on-light app, light-on-dark app.
       * Uses the modal/card corner radius (not a full pill) so tall toasts with
       * a title + description + icon + action button keep clean, square-ish
       * corners instead of the pill bowing out around multi-line content. */
      [data-sonner-toast] .cn-toast {
        border: 1px solid color-mix(in oklch, var(--normal-text) 18%, transparent) !important;
        border-radius: var(--radius-xl) !important;
        box-shadow:
          0 1px 0 0 color-mix(in oklch, var(--normal-text) 12%, transparent),
          0 1px 2px 0 oklch(0.15 0 0 / 0.08);
        transition: all 200ms ease-in-out !important;
      }

      .dark [data-sonner-toast] .cn-toast {
        box-shadow:
          0 1px 0 0 color-mix(in oklch, var(--normal-text) 14%, transparent),
          0 1px 2px 0 oklch(0.15 0 0 / 0.12);
      }

      [data-sonner-toast] .cn-toast.toast-success {
        border-left-width: 3px !important;
        border-left-color: var(--success-500) !important;
      }

      [data-sonner-toast] .cn-toast.toast-error {
        border-left-width: 3px !important;
        border-left-color: var(--danger-500) !important;
      }

      [data-sonner-toast] .cn-toast.toast-warning {
        border-left-width: 3px !important;
        border-left-color: var(--warning-500) !important;
      }

      [data-sonner-toast] .cn-toast.toast-info {
        border-left-width: 3px !important;
        border-left-color: var(--info-500) !important;
      }

      [data-sonner-toast] .cn-toast.toast-loading {
        border-left-width: 3px !important;
        border-left-color: var(--primary-500) !important;
      }

      .cn-toast .toast-icon-success { color: var(--success); }
      .cn-toast .toast-icon-error { color: var(--destructive); }
      .cn-toast .toast-icon-warning { color: var(--warning); }
      .cn-toast .toast-icon-info { color: var(--info); }
      .cn-toast .toast-icon-loading { color: var(--primary); }
    `
  document.head.appendChild(style)
}

/**
 * Nqui Toaster — card-style shadows, semantic left accent, modal/card corner radius
 * (holds multi-line title + description + icon + action cleanly).
 */
const Toaster = ({ ...props }: ToasterProps) => {
  const { theme = "light" } = useTheme()
  const sonnerTheme: ToasterProps["theme"] = theme === "dark" ? "dark" : "light"

  React.useEffect(() => {
    injectToastStylesOnce()
  }, [])

  return (
    <Sonner
      theme={sonnerTheme}
      className="toaster group"
      icons={{
        success: (
          <IconCheckCircle
            strokeWidth={2}
            className="size-4 text-success toast-icon-success"
          />
        ),
        info: (
          <IconInfo
            strokeWidth={2}
            className="size-4 text-info toast-icon-info"
          />
        ),
        warning: (
          <IconAlert
            strokeWidth={2}
            className="size-4 text-warning toast-icon-warning"
          />
        ),
        error: (
          <IconXCircle
            strokeWidth={2}
            className="size-4 text-destructive toast-icon-error"
          />
        ),
        loading: (
          <IconLoader
            strokeWidth={2}
            className="size-4 text-primary toast-icon-loading animate-spin"
          />
        ),
      }}
      style={
        {
          /* Invert page chrome: light UI → dark toast; dark UI → light toast */
          "--normal-bg": "var(--foreground)",
          "--normal-text": "var(--background)",
          "--normal-border": "color-mix(in oklch, var(--background) 25%, transparent)",
          "--border-radius": "var(--radius-xl)",
          "--success-bg": "var(--success)",
          "--success-text": "var(--success-foreground)",
          "--success-border": "var(--success-400)",
          "--error-bg": "var(--destructive)",
          "--error-text": "var(--destructive-foreground)",
          "--error-border": "var(--danger-400)",
          "--warning-bg": "var(--warning)",
          "--warning-text": "var(--warning-foreground)",
          "--warning-border": "var(--warning-400)",
          "--info-bg": "var(--info)",
          "--info-text": "var(--info-foreground)",
          "--info-border": "var(--info-400)",
        } as React.CSSProperties
      }
      toastOptions={{
        classNames: {
          toast: "cn-toast",
          success: "toast-success",
          error: "toast-error",
          warning: "toast-warning",
          info: "toast-info",
          loading: "toast-loading",
        },
      }}
      {...props}
    />
  )
}

Toaster.displayName = "Toaster"

/** @deprecated Use `Toaster` — merged implementation */
const EnhancedToaster = Toaster
const EnhancedSonner = Toaster

export { Toaster, EnhancedToaster, EnhancedSonner }
export { Toaster as CoreToaster }
