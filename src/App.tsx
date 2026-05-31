import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom"
import { AppLayout } from "@/components/AppLayout"
import RecipesHub from "@/pages/RecipesHub"
import RecipeSettings from "@/pages/RecipeSettings"
import RecipeTracker from "@/pages/RecipeTracker"
import RecipeElevation from "@/pages/RecipeElevation"
import ComponentShowcase from "@/pages/ComponentShowcase"
import Showcase2 from "@/pages/Showcase2"
import DesignSystem from "@/pages/DesignSystem"

function AppLayoutWrapper() {
  return (
    <Routes>
      <Route path="/" element={<AppLayout />}>
        <Route index element={<RecipesHub />} />
        <Route path="catalog" element={<ComponentShowcase />} />
        <Route path="patterns" element={<Showcase2 />} />
        <Route path="showcase2" element={<Navigate to="/patterns" replace />} />
        <Route path="recipes/settings" element={<RecipeSettings />} />
        <Route path="recipes/tracker" element={<RecipeTracker />} />
        <Route path="recipes/elevation" element={<RecipeElevation />} />
        <Route path="design-system" element={<DesignSystem />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Route>
    </Routes>
  )
}

export function App() {
  return (
    <BrowserRouter>
      <AppLayoutWrapper />
    </BrowserRouter>
  )
}

export default App
